using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;
using static ProteiniSi.Services.Helpers.OrderFormatting;

namespace ProteiniSi.Services
{
    public class OrderService(
        IOrderProvider orderProvider,
        IGiftVoucherProvider giftVoucherProvider,
        ICommerceSettingsService commerceSettings,
        ILoyaltyService loyaltyService,
        IOrderEmailService orderEmailService,
        IGiftVoucherEmailService giftVoucherEmails,
        ICPayService cpayService,
        IGuestCheckoutVerificationService guestVerification,
        IMarketingAutomationService marketing,
        IConfiguration config,
        ILogger<OrderService> logger,
        IAddressLookupService? addressLookup = null) : IOrderService
    {
        private const string CreateFailedMessage = "Order creation failed. Please try again or contact support.";

        // Admin order flow: Confirmed → Shipped (tracking number + link) → Claimed ("delivered"). Orders can be
        // rejected or cancelled before they ship. "paid" is set by the card payment itself, never by the admin.
        private static readonly string[] AllowedAdminStatuses =
        {
            "confirmed", "shipped", "delivered", "rejected", "cancelled"
        };

        public async Task<OrderCheckoutResult> CreateAsync(CreateOrderDto orderDto, int userId)
        {
            try
            {
                return await CreateOrderAsync(orderDto, userId);
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Order creation failed");
                throw new ServerErrorException(CreateFailedMessage, new { message = CreateFailedMessage });
            }
        }

        private async Task<OrderCheckoutResult> CreateOrderAsync(CreateOrderDto orderDto, int userId)
        {
            // Cheap checks first, so fake orders are turned away before touching the database.
            await ValidateContactDetailsAsync(orderDto);

            var paymentMethod = NormalizePaymentMethod(orderDto.Payment_Method);
            if (userId <= 0 && paymentMethod == "home_delivery"
                && !guestVerification.IsVerified(orderDto.Billing_Email, orderDto.Guest_Verification_Token))
            {
                throw new BadRequestException("Guest email not verified", new
                {
                    status = false,
                    requiresEmailVerification = true,
                    message = "Please confirm your email with the code we send you before placing a cash on delivery order."
                });
            }

            string? userEmail;
            string userFullName;
            List<CheckoutCartItem> cartItems;
            int? cartId = null;

            if (userId > 0)
            {
                var user = await orderProvider.GetCheckoutUserAsync(userId)
                    ?? throw BadRequest("User not found");

                userEmail = user.User_Email;
                userFullName = user.User_FullName ?? "Customer";

                cartId = await orderProvider.GetCartIdAsync(userId);
                if (!cartId.HasValue)
                    throw BadRequest("No active shopping cart found");

                cartItems = await orderProvider.GetCartItemsAsync(cartId.Value);

                var invalidVariantItem = cartItems.FirstOrDefault(item =>
                    (item.Variant_Id != null && item.CatalogVariantId == null)
                    || (item.Variant_Id == null && item.HasVariants));
                if (invalidVariantItem != null)
                    throw BadRequest($"The selected variant for product ID {invalidVariantItem.Product_Id} is invalid or unavailable. Please remove it from the cart and select it again.");
            }
            else
            {
                userEmail = orderDto.Billing_Email;
                userFullName = orderDto.Billing_FullName ?? "Guest Customer";

                if (orderDto.CartItems == null || orderDto.CartItems.Count == 0)
                    throw BadRequest("Cart items are required for guest checkout");

                cartItems = new List<CheckoutCartItem>();
                foreach (var item in orderDto.CartItems)
                    cartItems.Add(await ResolveGuestItemAsync(item));
            }

            if (cartItems.Count == 0)
                throw BadRequest("Cart is empty");

            if (!IsSupportedPaymentMethod(paymentMethod))
                throw BadRequest($"Unsupported payment method: {orderDto.Payment_Method}");
            var shippingSettings = await commerceSettings.GetShippingAsync();
            if ((paymentMethod == "home_delivery" && !shippingSettings.HomeDeliveryEnabled)
                || (paymentMethod == "credit_card" && !shippingSettings.CardPaymentEnabled))
                throw BadRequest("The selected payment method is currently unavailable.");

            var initialOrderStatus = paymentMethod == "home_delivery" ? "pending_confirmation" : "pending";
            decimal subtotal = 0;
            // Gift vouchers are sent by email, so only the other items are delivered and count towards free delivery.
            decimal shippableSubtotal = 0;
            decimal pointsRedeemed = orderDto.PointsToRedeem ?? 0;
            var orderItems = new List<OrderItemDto>();
            decimal totalPointsEarned = 0;

            foreach (var item in cartItems)
            {
                if (item.Quantity <= 0)
                    throw BadRequest("Order item quantities must be greater than zero.");

                var stock = item.Product_Stock ?? 0;
                if (stock < item.Quantity)
                    throw BadRequest($"Insufficient stock for product: {item.Product_Name}. Available: {stock}, Requested: {item.Quantity}");

                // Whole denars, rounded up, exactly as the shop shows the price.
                decimal itemPrice = PriceFormat.Round(item.CartPrice ?? item.Product_Price);
                decimal itemSubtotal = item.Quantity * itemPrice;
                subtotal += itemSubtotal;
                if (!item.IsGiftVoucher)
                    shippableSubtotal += itemSubtotal;

                decimal loyaltyPercentage = 2.0m;
                if (item.VariantLoyaltyPercentage > 0)
                    loyaltyPercentage = item.VariantLoyaltyPercentage.Value;
                else if (item.ProductLoyaltyPercentage > 0)
                    loyaltyPercentage = item.ProductLoyaltyPercentage.Value;
                else if (item.LoyaltyPercentage > 0)
                    loyaltyPercentage = item.LoyaltyPercentage.Value;

                decimal itemPoints = Math.Floor(itemSubtotal * (loyaltyPercentage / 100m));
                totalPointsEarned += itemPoints;

                orderItems.Add(new OrderItemDto
                {
                    Product_Id = item.Product_Id,
                    Product_Name = item.Product_Name,
                    Product_Price = itemPrice,
                    Quantity = item.Quantity,
                    Subtotal = itemSubtotal,
                    Variant_Id = item.Variant_Id,
                    Variant_Name = item.Variant_Name,
                    Variant_Packaging = item.Variant_Packaging,
                    LoyaltyPointsEarned = (int)itemPoints,
                    LoyaltyPercentage = loyaltyPercentage
                });
            }

            var promotion = await ResolvePromotionAsync(orderDto.Promo_Code, subtotal,
                orderItems.Select(item => (item.Product_Id, item.Subtotal)).ToList(), userId, userEmail);
            if (!string.IsNullOrWhiteSpace(orderDto.Promo_Code) && promotion == null)
                throw BadRequest("The promotion code is invalid, expired, unavailable, or does not meet the order requirements.");

            var buysGiftVoucher = cartItems.Any(item => item.IsGiftVoucher);
            if (buysGiftVoucher && !string.IsNullOrWhiteSpace(orderDto.Gift_Voucher_Code))
                throw BadRequest("A gift voucher cannot be used to purchase another gift voucher.");

            // Gift vouchers can only be paid by card.
            if (buysGiftVoucher && paymentMethod != "credit_card")
                throw new BadRequestException("Gift vouchers can only be paid by card", new
                {
                    status = false,
                    giftVoucherCardOnly = true,
                    message = "Gift vouchers can only be paid by card."
                });

            var selectedGift = await ResolveFreeGiftAsync(orderDto.Selected_Free_Gift_Id, subtotal);
            if (orderDto.Selected_Free_Gift_Id.HasValue && selectedGift == null)
                throw BadRequest("The selected free gift is unavailable or the order does not meet its requirements.");

            decimal promotionDiscount = promotion?.DiscountAmount ?? 0m;
            decimal deliveryFee = CalculateDeliveryFee(shippableSubtotal, paymentMethod, shippingSettings);

            if (userId <= 0)
            {
                pointsRedeemed = 0;
            }
            else
            {
                // Redemption rules from the admin settings: a minimum balance before any points can be used, then the
                // order value (after promo code) sets the most points usable; never more than half the order.
                var availablePoints = await loyaltyService.GetAvailablePointsAsync(userId);
                var orderValue = Math.Max(subtotal - promotionDiscount, 0m);
                var maximumPointsDiscount = availablePoints < shippingSettings.LoyaltyMinBalance
                    ? 0m
                    : Math.Min(shippingSettings.MaxRedeemablePoints(orderValue), Math.Floor(orderValue * 0.5m));
                pointsRedeemed = Math.Floor(Math.Min(Math.Max(pointsRedeemed, 0m), Math.Min(availablePoints, maximumPointsDiscount)));
            }

            decimal pointsDiscount = pointsRedeemed;
            decimal totalAfterDiscount = subtotal - promotionDiscount - pointsDiscount;

            if (totalAfterDiscount < 0)
            {
                pointsDiscount = subtotal;
                totalAfterDiscount = 0;
            }

            decimal amountBeforeVoucher = totalAfterDiscount + deliveryFee;
            var giftVoucher = await ResolveGiftVoucherAsync(orderDto.Gift_Voucher_Code, amountBeforeVoucher);
            if (!string.IsNullOrWhiteSpace(orderDto.Gift_Voucher_Code) && giftVoucher == null)
                throw BadRequest("The gift voucher is invalid, expired, disabled or has no remaining balance.");
            decimal giftVoucherAmount = giftVoucher?.Amount ?? 0m;
            // cPay only takes whole denars, so the stored total is the amount actually charged.
            decimal totalAmount = PriceFormat.Round(Math.Max(amountBeforeVoucher - giftVoucherAmount, 0m));

            var created = await orderProvider.CreateAsync(new OrderCreateRequest
            {
                UserId = userId > 0 ? userId : null,
                OrderNumberPrefix = $"ORD-{DateTime.Now:yyyyMMdd}-",
                OrderStatus = initialOrderStatus,
                PaymentMethod = paymentMethod,
                Order = NormalizeBilling(orderDto, userFullName, userEmail),
                Subtotal = subtotal,
                DeliveryFee = deliveryFee,
                TotalAmount = totalAmount,
                Now = DateTime.Now,
                PromoCodeId = promotion?.PromoCodeId,
                PromoCode = promotion?.Code,
                PromoDiscount = promotionDiscount,
                GiftVoucherId = giftVoucher?.GiftVoucherId,
                GiftVoucherCode = giftVoucher?.Code,
                GiftVoucherAmount = giftVoucherAmount,
                AmountBeforeVoucher = amountBeforeVoucher,
                FreeGiftId = selectedGift?.FreeGiftId,
                FreeGiftProductId = selectedGift?.ProductId,
                FreeGiftVariantId = selectedGift?.VariantId,
                FreeGiftDisplayName = selectedGift?.DisplayName,
                PointsRedeemed = pointsRedeemed,
                PointsDiscount = pointsDiscount,
                PointsEarned = totalPointsEarned,
                // Card orders keep the cart until cPay confirms the payment, so a failed or cancelled payment can be retried.
                CartId = paymentMethod == "credit_card" ? null : cartId,
                Items = orderItems,
                Language = EmailLanguage.OrNull(orderDto.Language),
                GiftRecipientName = buysGiftVoucher ? orderDto.Gift_Recipient_Name : null,
                GiftRecipientEmail = buysGiftVoucher ? orderDto.Gift_Recipient_Email : null,
                GiftMessage = buysGiftVoucher ? orderDto.Gift_Message : null
            });
            var orderId = created.OrderId;
            var orderNumber = created.OrderNumber;

            // A guest paying by card never gets the email code, so their marketing "yes" is stored here.
            // Without it an unpaid card order could never get the abandoned checkout reminder.
            if (userId <= 0 && orderDto.MarketingConsent == true && !string.IsNullOrWhiteSpace(userEmail))
            {
                try
                {
                    // The order still goes through, but a domain without a mail server (hotmal.com)
                    // must not join the marketing list.
                    var domainError = await CheckoutFieldValidator.ValidateEmailDomainAsync(userEmail, requireMailServer: true);
                    if (domainError == null)
                        await marketing.SetGuestOrderConsentAsync(userEmail, orderDto.MarketingConsentGivenAt);
                    else
                        logger.LogInformation("Skipped marketing consent of guest order {OrderId}: {Reason}", orderId, domainError);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not store the marketing consent of guest order {OrderId}", orderId);
                }
            }

            var result = new OrderCheckoutResult
            {
                Status = true,
                Message = "Order created successfully",
                OrderId = orderId,
                OrderNumber = orderNumber,
                TotalAmount = totalAmount,
                PaymentMethod = paymentMethod,
                PointsRedeemed = pointsRedeemed,
                PointsDiscount = pointsDiscount,
                PromoDiscount = promotionDiscount,
                GiftVoucherAmount = giftVoucherAmount,
                FreeGift = selectedGift?.DisplayName,
                PointsToEarn = totalPointsEarned,
                GuestAccessToken = userId > 0 ? null : CreateGuestAccessToken(orderId)
            };

            await TryRegisterOperationalDocumentAsync(orderId);

            if (paymentMethod == "home_delivery")
            {
                result.OrderConfirmationEmailSent = await orderEmailService.SendOrderConfirmationAsync(orderId, false);
                if (result.OrderConfirmationEmailSent)
                    logger.LogInformation("COD order confirmation email sent. OrderId={OrderId}, OrderNumber={OrderNumber}", orderId, orderNumber);
                else
                    logger.LogWarning("COD order confirmation email failed. OrderId={OrderId}, OrderNumber={OrderNumber}", orderId, orderNumber);
            }

            if (paymentMethod != "credit_card")
                return result;

            if (totalAmount <= 0m)
            {
                var completion = await CompletePaidOrderAsync(orderId, $"VOUCHER-{orderNumber}");
                result.Status = completion.Success;
                result.Message = completion.Message;
                result.OrderConfirmationEmailSent = completion.EmailSent;
                return result;
            }

            if (config.GetSection("CPayConfiguration").GetValue<bool>("TestMode", true))
            {
                result.Message = "Order created successfully. Redirecting to payment...";
                result.PaymentUrl = $"{config["AppSettings:FrontendUrl"]}/mock-payment?orderId={orderId}&amount={totalAmount}&orderNumber={orderNumber}";
                if (result.GuestAccessToken != null)
                    result.PaymentUrl += $"&token={Uri.EscapeDataString(result.GuestAccessToken)}";
                return result;
            }

            result.PaymentFormHtml = cpayService.GeneratePaymentForm(orderId, totalAmount, orderNumber, userFullName, userEmail!);
            return result;
        }

        private async Task<CheckoutCartItem> ResolveGuestItemAsync(GuestCartItemDto item)
        {
            var product = await orderProvider.GetGuestProductAsync(item.Product_Id, item.Variant_Id)
                ?? throw BadRequest($"Product with ID {item.Product_Id} not found");

            if (!item.Variant_Id.HasValue && product.HasVariants)
                throw BadRequest($"A valid package or variant must be selected for product ID {item.Product_Id}.");

            if (item.Variant_Id.HasValue && product.CatalogVariantId == null)
                throw BadRequest($"Variant ID {item.Variant_Id} is invalid, unavailable, or does not belong to product ID {item.Product_Id}.");

            decimal loyaltyPercentage = 2.0m;
            if (item.Variant_Id.HasValue && product.VariantLoyaltyPercentage > 0)
                loyaltyPercentage = product.VariantLoyaltyPercentage.Value;
            else if (product.ProductLoyaltyPercentage > 0)
                loyaltyPercentage = product.ProductLoyaltyPercentage.Value;

            int availableQuantity = (item.Variant_Id.HasValue ? product.VariantQuantity : product.ProductQuantity) ?? 0;
            if (availableQuantity < item.Quantity)
                throw BadRequest($"Insufficient stock for product: {product.Name}. Available: {availableQuantity}, Requested: {item.Quantity}");

            decimal effectivePrice = product.EffectivePrice
                ?? throw new InvalidOperationException($"Product {item.Product_Id} has no effective price.");
            if (product.IsGiftVoucher)
            {
                decimal minimum = product.VoucherMinAmount ?? 500m;
                decimal? maximum = product.VoucherMaxAmount;

                if (item.Price < minimum || (maximum.HasValue && item.Price > maximum.Value))
                {
                    throw BadRequest(maximum.HasValue
                        ? $"Voucher amount must be between {minimum:F0} and {maximum.Value:F0} MKD"
                        : $"Voucher amount must be at least {minimum:F0} MKD");
                }

                effectivePrice = decimal.Round(item.Price, 2);
            }

            return new CheckoutCartItem
            {
                Product_Id = item.Product_Id,
                Quantity = item.Quantity,
                Product_Name = product.Name,
                Product_Price = effectivePrice,
                CartPrice = effectivePrice,
                Product_Stock = availableQuantity,
                Variant_Id = item.Variant_Id,
                Variant_Name = item.Variant_Id.HasValue ? product.CatalogVariantName : null,
                Variant_Packaging = item.Variant_Id.HasValue ? product.CatalogVariantPackaging : null,
                LoyaltyPercentage = loyaltyPercentage,
                ProductLoyaltyPercentage = product.ProductLoyaltyPercentage,
                VariantLoyaltyPercentage = product.VariantLoyaltyPercentage,
                IsGiftVoucher = product.IsGiftVoucher
            };
        }

        private static CreateOrderDto NormalizeBilling(CreateOrderDto orderDto, string userFullName, string? userEmail) => new()
        {
            Billing_Type = orderDto.Billing_Type ?? "natural",
            Billing_FullName = orderDto.Billing_FullName ?? userFullName,
            Billing_Address = orderDto.Billing_Address ?? "",
            Billing_PostCode = orderDto.Billing_PostCode ?? "",
            Billing_City = orderDto.Billing_City ?? "",
            Billing_Country = orderDto.Billing_Country ?? "",
            Billing_Phone = orderDto.Billing_Phone ?? "",
            Billing_Email = userEmail!,
            Billing_TaxNumber = orderDto.Billing_TaxNumber,
            Billing_CompanyName = orderDto.Billing_CompanyName,
            Delivery_IsDifferent = orderDto.Delivery_IsDifferent,
            Delivery_FullName = orderDto.Delivery_FullName,
            Delivery_Address = orderDto.Delivery_Address,
            Delivery_PostCode = orderDto.Delivery_PostCode,
            Delivery_City = orderDto.Delivery_City,
            Delivery_Country = orderDto.Delivery_Country,
            Delivery_Phone = orderDto.Delivery_Phone,
            Order_Note = orderDto.Order_Note
        };

        private async Task<PromotionApplication?> ResolvePromotionAsync(
            string? rawCode, decimal subtotal, IReadOnlyList<(int ProductId, decimal LineTotal)> lines, int userId, string? customerEmail)
        {
            if (string.IsNullOrWhiteSpace(rawCode)) return null;
            var code = rawCode.Trim().ToUpperInvariant();
            var promo = await orderProvider.GetPromotionAsync(code, userId, customerEmail!);

            if (promo == null || !promo.IsActive) return null;
            var now = DateTime.Now;
            if (promo.ValidFrom != null && now < promo.ValidFrom) return null;
            if (promo.ValidUntil != null && now > promo.ValidUntil) return null;
            if (subtotal < promo.MinimumOrderAmount) return null;
            if (promo.UsageLimit != null && promo.TimesUsed >= promo.UsageLimit) return null;
            if (promo.PerCustomerLimit != null && promo.CustomerTimesUsed >= promo.PerCustomerLimit) return null;

            // A code limited to some products or categories only discounts those items;
            // the minimum order amount above still counts the whole cart.
            var eligibleSubtotal = subtotal;
            if (!PromoScope.IsAll(promo.AppliesTo))
            {
                var eligible = await orderProvider.GetPromotionEligibleProductIdsAsync(promo.PromoCodeId, lines.Select(line => line.ProductId));
                eligibleSubtotal = Math.Min(PromotionMath.EligibleSubtotal(lines, eligible), subtotal);
                if (eligibleSubtotal <= 0) return null;
            }

            return new PromotionApplication(
                promo.PromoCodeId,
                promo.Code ?? code,
                PromotionMath.Discount(promo.DiscountType, promo.DiscountValue, promo.MaximumDiscountAmount, eligibleSubtotal));
        }

        private sealed record PromotionApplication(int PromoCodeId, string Code, decimal DiscountAmount);

        private async Task<(int GiftVoucherId, string Code, decimal Amount)?> ResolveGiftVoucherAsync(string? rawCode, decimal orderAmount)
        {
            if (string.IsNullOrWhiteSpace(rawCode) || orderAmount <= 0) return null;
            var code = rawCode.Trim().ToUpperInvariant();
            var voucher = await giftVoucherProvider.GetByCodeAsync(code);

            if (voucher == null
                || !string.Equals(voucher.Status, "active", StringComparison.OrdinalIgnoreCase)
                || voucher.ValidFrom > DateTime.UtcNow
                || (voucher.ExpiresAt != null && voucher.ExpiresAt < DateTime.UtcNow))
                return null;

            if (voucher.RemainingValue <= 0) return null;
            return (voucher.GiftVoucherId, voucher.Code ?? code,
                Math.Round(Math.Min(voucher.RemainingValue, orderAmount), 2, MidpointRounding.AwayFromZero));
        }

        private async Task<CheckoutFreeGift?> ResolveFreeGiftAsync(int? freeGiftId, decimal subtotal)
        {
            if (!freeGiftId.HasValue) return null;
            var gift = await orderProvider.GetFreeGiftAsync(freeGiftId.Value, subtotal);

            if (gift == null || (gift.AvailableQuantity ?? 0) <= 0) return null;
            if (gift.VariantId == null && gift.HasVariants) return null;
            gift.DisplayName ??= "Free gift";
            return gift;
        }

        private static decimal CalculateDeliveryFee(decimal shippableSubtotal, string paymentMethod, ShippingSettings settings)
        {
            // Nothing to deliver (a voucher-only order) or over the free-delivery threshold.
            if (shippableSubtotal <= 0 || shippableSubtotal >= settings.FreeDeliveryThreshold)
                return 0m;

            decimal cashOnDeliveryFee = paymentMethod == "home_delivery"
                ? settings.CashOnDeliveryFee
                : 0m;

            return settings.FlatDeliveryFee + cashOnDeliveryFee;
        }

        private static bool IsSupportedPaymentMethod(string paymentMethod) =>
            paymentMethod == "credit_card" || paymentMethod == "home_delivery";

        private static string NormalizePaymentMethod(string? paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(paymentMethod))
                return "credit_card";

            var normalized = paymentMethod.Trim().ToLowerInvariant();
            normalized = normalized.Replace("-", "_").Replace(" ", "_");

            if (normalized is "credit_card" or "card" or "cpay" or "online_card")
                return "credit_card";

            if (normalized is "home_delivery" or "cash_on_delivery" or "cod" or "cash" or "payment_on_delivery" or "pay_on_delivery" or "otkup")
                return "home_delivery";

            if ((normalized.Contains("cash") && normalized.Contains("delivery")) ||
                normalized.Contains("dostava") ||
                normalized.Contains("откуп") ||
                normalized.Contains("достава"))
            {
                return "home_delivery";
            }

            return normalized;
        }

        public async Task<PaymentCompletionResult> CompletePaidOrderAsync(int orderId, string? transactionId, bool sendEmail = true, string completedOrderStatus = "paid")
        {
            var outcome = await orderProvider.CompletePaymentAsync(orderId, transactionId, completedOrderStatus);

            if (outcome == 0)
                return new PaymentCompletionResult(false, false, "Order not found");

            if (outcome == 1)
                return new PaymentCompletionResult(true, false, "Payment was already completed");

            if (!sendEmail)
                return new PaymentCompletionResult(true, false, "Payment completed without email notification");

            var emailSent = await orderEmailService.SendOrderConfirmationAsync(orderId, true);
            // Codes are only created now, so the buyer and the gift recipient get their own emails here.
            await giftVoucherEmails.SendForOrderAsync(orderId);
            return new PaymentCompletionResult(true, emailSent, emailSent ? "Payment completed and email sent" : "Payment completed but email failed");
        }

        public async Task<PaymentCompletionResult> CompleteCPayPaymentAsync(int orderId, string? amountToPay, string? transactionId)
        {
            var order = await orderProvider.GetForAdminStatusAsync(orderId);
            if (order == null)
                return new PaymentCompletionResult(false, false, "Order not found");

            var expectedAmount = cpayService.ToAmountToPay(order.Total_Amount ?? 0m);
            if (!string.Equals(amountToPay, expectedAmount, StringComparison.Ordinal))
            {
                logger.LogWarning("cPay amount mismatch for order {OrderId}: expected {Expected}, received {Received}", orderId, expectedAmount, amountToPay);
                return new PaymentCompletionResult(false, false, "Payment amount does not match the order total");
            }

            return await CompletePaidOrderAsync(orderId, transactionId);
        }

        public async Task<PaymentCompletionResult?> ApplyPaymentStatusAsync(int orderId, string? paymentStatus, string? transactionId)
        {
            if (IsSuccessfulPaymentStatus(paymentStatus))
                return await CompletePaidOrderAsync(orderId, transactionId);

            await orderProvider.MarkPaymentFailedAsync(orderId, transactionId);
            return null;
        }

        public Task MarkPaymentFailedAsync(int orderId, string? transactionId) =>
            orderProvider.MarkPaymentFailedAsync(orderId, transactionId);

        private static bool IsSuccessfulPaymentStatus(string? paymentStatus) =>
            string.Equals(paymentStatus, "success", StringComparison.OrdinalIgnoreCase)
            || string.Equals(paymentStatus, "completed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase);

        public async Task<(dynamic Order, List<dynamic> Items)> GetConfirmationAsync(int orderId, int userId)
        {
            var (order, items) = await orderProvider.GetConfirmationAsync(orderId, userId);
            if (order == null)
                throw OrderNotFound();

            return (order, items);
        }

        public async Task<(dynamic Order, List<dynamic> Items)> GetGuestConfirmationAsync(int orderId, string? guestAccessToken)
        {
            if (!IsValidGuestAccessToken(orderId, guestAccessToken))
                throw OrderNotFound();

            var (order, items) = await orderProvider.GetConfirmationAsync(orderId, null);
            if (order == null)
                throw OrderNotFound();

            return (order, items);
        }

        // Guests have no account, so access to their order is proven by an HMAC of the order id
        // that only the server can produce. It is handed out on checkout and on the payment return.
        public string CreateGuestAccessToken(int orderId)
        {
            var key = Encoding.UTF8.GetBytes(config["AppSettings:TokenKey"]
                ?? throw new InvalidOperationException("AppSettings:TokenKey is not configured."));
            var hash = HMACSHA256.HashData(key, Encoding.UTF8.GetBytes($"guest-order:{orderId}"));
            return Convert.ToHexString(hash, 0, 16).ToLowerInvariant();
        }

        private bool IsValidGuestAccessToken(int orderId, string? token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            var expected = Encoding.ASCII.GetBytes(CreateGuestAccessToken(orderId));
            var received = Encoding.ASCII.GetBytes(token.Trim().ToLowerInvariant());
            return CryptographicOperations.FixedTimeEquals(expected, received);
        }

        public async Task CancelAsync(int orderId, int userId)
        {
            var outcome = await orderProvider.CancelAsync(orderId, userId, DateTime.Now);

            switch (outcome?.Result ?? 0)
            {
                case 0:
                    throw OrderNotFound();
                case 1:
                    throw BadRequest($"Order cannot be cancelled. Current status: {outcome!.Order_Status}");
                case 2:
                    throw BadRequest("Order cannot be cancelled. 24-hour cancellation window has passed.");
            }

            await orderEmailService.SendCancellationAsync(outcome!);
        }

        public async Task<OrderCancellationStatus> GetCancellationStatusAsync(int orderId, int userId)
        {
            var order = await orderProvider.GetCancelInfoAsync(orderId, userId)
                ?? throw OrderNotFound();

            var now = DateTime.Now;
            bool canCancel = order.Order_Status != "shipped"
                && order.Order_Status != "delivered"
                && order.Order_Status != "cancelled"
                && now <= order.Order_Date.AddHours(24);

            return new OrderCancellationStatus(
                canCancel,
                order.Order_Status,
                canCancel ? Math.Max(0, 24 - (now - order.Order_Date).TotalHours) : 0);
        }

        public Task<List<dynamic>> GetHistoryAsync(int userId) => orderProvider.GetHistoryAsync(userId);

        public Task<(int TotalCount, List<dynamic> Orders)> GetAdminPageAsync(string? orderStatus, string? paymentStatus, string? search, int page, int pageSize, string? sortBy, string? sortOrder)
        {
            var sortColumn = (sortBy ?? "date").Trim().ToLowerInvariant();
            return orderProvider.GetAdminPageAsync(new OrderAdminFilter
            {
                OrderStatus = string.IsNullOrWhiteSpace(orderStatus) ? null : orderStatus,
                PaymentStatus = string.IsNullOrWhiteSpace(paymentStatus) ? null : paymentStatus,
                Search = NormalizeSearch(search),
                SortBy = sortColumn is "number" or "customer" or "status" or "total" ? sortColumn : "date",
                SortDescending = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase),
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            });
        }

        public async Task<FileDownload> ExportAdminCsvAsync(string? orderStatus, string? paymentStatus, string? search, DateTime? from, DateTime? to)
        {
            var rows = await orderProvider.GetAdminExportAsync(
                string.IsNullOrWhiteSpace(orderStatus) ? null : orderStatus,
                string.IsNullOrWhiteSpace(paymentStatus) ? null : paymentStatus,
                NormalizeSearch(search),
                from?.Date,
                to?.Date.AddDays(1));

            var csv = new StringBuilder();
            csv.AppendLine("Order number,Date,Order status,Payment method,Payment status,Customer,Email,Phone,Address,Post code,City,Items,Subtotal,Delivery fee,Promo code,Promo discount,Points discount,Gift voucher,Gift voucher amount,Free gift,Total,Transaction ID,Tracking number,Tracking URL");
            foreach (var row in rows)
            {
                csv.AppendLine(string.Join(",", new[]
                {
                    CsvValue(row.Order_Number),
                    CsvValue(((DateTime)row.Order_Date).ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture)),
                    CsvValue(row.Order_Status), CsvValue(row.Payment_Method), CsvValue(row.Payment_Status),
                    CsvValue(row.Billing_FullName), CsvValue(row.Billing_Email), CsvValue(row.Billing_Phone),
                    CsvValue(row.Billing_Address), CsvValue(row.Billing_PostCode), CsvValue(row.Billing_City),
                    CsvValue(row.Item_Count), CsvValue(row.Subtotal), CsvValue(row.Delivery_Fee),
                    CsvValue(row.Promo_Code), CsvValue(row.Promo_Discount), CsvValue(row.Points_Discount),
                    CsvValue(row.Gift_Voucher_Code), CsvValue(row.Gift_Voucher_Amount),
                    CsvValue(row.Free_Gift), CsvValue(row.Total_Amount), CsvValue(row.Transaction_Id),
                    CsvValue(row.Tracking_Number), CsvValue(row.Tracking_Url)
                }));
            }

            var utf8WithBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
            return new FileDownload(utf8WithBom.GetBytes(csv.ToString()), $"proteini-orders-{DateTime.UtcNow:yyyyMMdd-HHmm}.csv");
        }

        private static string? NormalizeSearch(string? search) =>
            string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";

        public async Task<OrderAdminStatusResult> UpdateAdminStatusAsync(AdminUpdateOrderStatusDto statusUpdate)
        {
            if (statusUpdate.Order_Id <= 0)
                throw StatusBadRequest("A valid order id is required");

            var requestedStatus = (statusUpdate.Order_Status ?? string.Empty).Trim().ToLowerInvariant();
            if (!AllowedAdminStatuses.Contains(requestedStatus))
                throw StatusBadRequest("Unsupported order status");

            var order = await orderProvider.GetForAdminStatusAsync(statusUpdate.Order_Id)
                ?? throw new NotFoundException("Order not found", new { status = false, message = "Order not found" });

            var currentStatus = (order.Order_Status ?? string.Empty).Trim().ToLowerInvariant();
            if (!CanTransitionOrder(currentStatus, requestedStatus))
            {
                var conflict = $"Order cannot move from {currentStatus} to {requestedStatus}.";
                throw new ConflictException(conflict, new { status = false, message = conflict });
            }

            var trackingNumber = string.IsNullOrWhiteSpace(statusUpdate.Tracking_Number)
                ? order.Tracking_Number
                : statusUpdate.Tracking_Number.Trim();
            var trackingUrl = string.IsNullOrWhiteSpace(statusUpdate.Tracking_Url)
                ? order.Tracking_Url
                : statusUpdate.Tracking_Url.Trim();
            // A new tracking number without a link gets the courier link from the settings template.
            if (requestedStatus == "shipped" && !string.IsNullOrWhiteSpace(trackingNumber)
                && string.IsNullOrWhiteSpace(statusUpdate.Tracking_Url)
                && (string.IsNullOrWhiteSpace(trackingUrl) || trackingNumber != order.Tracking_Number))
            {
                var settings = await commerceSettings.GetShippingAsync();
                trackingUrl = settings.TrackingUrlFor(trackingNumber) ?? trackingUrl;
            }
            if ((trackingNumber?.Length ?? 0) > 120)
                throw StatusBadRequest("Tracking number is too long.");
            if (!string.IsNullOrWhiteSpace(trackingUrl)
                && (!Uri.TryCreate(trackingUrl, UriKind.Absolute, out var parsedTrackingUrl)
                    || parsedTrackingUrl.Scheme is not ("https" or "http")))
                throw StatusBadRequest("Tracking URL must be a valid HTTP or HTTPS URL.");

            string finalOrderStatus = requestedStatus;
            // Payment follows the order: a claimed order has been paid (cash collected by the courier, or by card).
            string finalPaymentStatus = requestedStatus switch
            {
                "delivered" => "completed",
                "rejected" or "cancelled" => IsSuccessfulPaymentStatus(order.Payment_Status) ? "refunded" : "failed",
                _ => order.Payment_Status ?? "pending"
            };

            await orderProvider.UpdateAdminStatusAsync(
                statusUpdate.Order_Id,
                finalOrderStatus,
                finalPaymentStatus,
                statusUpdate.Transaction_Id,
                trackingNumber,
                trackingUrl,
                releaseVoucher: requestedStatus is "rejected" or "cancelled" && currentStatus != requestedStatus);

            // Customers are told when an order is confirmed, shipped, delivered or rejected; repeating the
            // same status (e.g. editing tracking details) does not send a second email.
            var emailSent = statusUpdate.Send_Email
                && CustomerNotifiedStatuses.Contains(requestedStatus)
                && currentStatus != requestedStatus
                && await orderEmailService.SendAdminStatusEmailAsync(
                    order,
                    finalOrderStatus,
                    finalPaymentStatus,
                    trackingNumber,
                    trackingUrl);

            return new OrderAdminStatusResult(true, "Order status updated", finalOrderStatus, finalPaymentStatus, trackingNumber, trackingUrl, emailSent);
        }

        private static readonly HashSet<string> CustomerNotifiedStatuses =
            new(StringComparer.OrdinalIgnoreCase) { "confirmed", "shipped", "delivered", "rejected" };

        private static bool CanTransitionOrder(string current, string requested)
        {
            if (current == requested) return true;
            // "processing" and "completed" are older statuses; such orders can still move on to shipping.
            var transitions = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["pending"] = new[] { "confirmed", "rejected", "cancelled" },
                ["pending_confirmation"] = new[] { "confirmed", "rejected", "cancelled" },
                ["paid"] = new[] { "confirmed", "shipped", "rejected", "cancelled" },
                ["confirmed"] = new[] { "shipped", "rejected", "cancelled" },
                ["processing"] = new[] { "shipped", "rejected", "cancelled" },
                ["completed"] = new[] { "shipped", "delivered" },
                ["shipped"] = new[] { "delivered" },
            };
            return transitions.TryGetValue(current, out var allowed) && allowed.Contains(requested, StringComparer.OrdinalIgnoreCase);
        }

        public async Task<(dynamic Order, List<dynamic> Items, List<dynamic> FreeGifts, List<dynamic> IssuedVouchers, List<dynamic> VoucherRedemptions)> GetAdminDetailsAsync(int orderId)
        {
            if (orderId <= 0)
                throw StatusBadRequest("A valid order id is required");

            var details = await orderProvider.GetAdminDetailsAsync(orderId);
            if (details.Order == null)
                throw new NotFoundException("Order not found", new { status = false, message = "Order not found" });

            return details!;
        }

        public async Task<FileDownload?> GetOperationalDocumentAsync(int orderId)
        {
            await TryRegisterOperationalDocumentAsync(orderId);
            var document = await orderProvider.GetLatestDocumentAsync(orderId);
            if (document == null) return null;

            var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true)
                .GetBytes(document.HtmlContent ?? string.Empty);
            var number = document.Order_Number ?? orderId.ToString(CultureInfo.InvariantCulture);
            return new FileDownload(bytes, $"order-{number}.html");
        }

        private async Task TryRegisterOperationalDocumentAsync(int orderId)
        {
            try
            {
                if (await orderProvider.DocumentExistsAsync(orderId))
                    return;

                var (order, items) = await orderProvider.GetDocumentSourceAsync(orderId);
                if (order == null) return;

                var rows = new StringBuilder();
                foreach (var item in items)
                {
                    var variant = string.Join(" / ", new[]
                    {
                        Convert.ToString(item.Variant_Name),
                        Convert.ToString(item.Variant_Packaging)
                    }.Where(value => !string.IsNullOrWhiteSpace(value)));
                    rows.Append($"<tr><td>{HtmlEncode(Convert.ToString(item.Product_Name) ?? string.Empty)}</td><td>{HtmlEncode(variant)}</td><td>{Convert.ToInt32(item.Quantity)}</td><td>{PriceFormat.Mkd(Convert.ToDecimal(item.Product_Price))}</td><td>{PriceFormat.Mkd(Convert.ToDecimal(item.Subtotal))}</td></tr>");
                }

                var useDelivery = ToBoolean(order.Delivery_IsDifferent);
                var deliveryName = useDelivery ? Convert.ToString(order.Delivery_FullName) : Convert.ToString(order.Billing_FullName);
                var deliveryAddress = useDelivery ? Convert.ToString(order.Delivery_Address) : Convert.ToString(order.Billing_Address);
                var deliveryPostCode = useDelivery ? Convert.ToString(order.Delivery_PostCode) : Convert.ToString(order.Billing_PostCode);
                var deliveryCity = useDelivery ? Convert.ToString(order.Delivery_City) : Convert.ToString(order.Billing_City);
                var html = $@"<!doctype html><html><head><meta charset='utf-8'><title>Operational order {HtmlEncode(Convert.ToString(order.Order_Number) ?? string.Empty)}</title>
<style>body{{font-family:Arial,sans-serif;max-width:980px;margin:30px auto;color:#111}}h1{{border-bottom:4px solid #fdc700;padding-bottom:12px}}.notice{{background:#fff8d6;padding:12px;font-weight:bold}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:20px}}table{{width:100%;border-collapse:collapse;margin-top:22px}}th,td{{border:1px solid #ccc;padding:9px;text-align:left}}th{{background:#f3f5f7}}.totals{{margin-left:auto;width:360px}}@media print{{.notice{{border:1px solid #999}}}}</style></head><body>
<p class='notice'>Operational order document — not a fiscal or tax invoice</p>
<h1>Order {HtmlEncode(Convert.ToString(order.Order_Number) ?? string.Empty)}</h1>
<div class='grid'><section><h2>Customer</h2><p>{HtmlEncode(Convert.ToString(order.Billing_FullName) ?? string.Empty)}<br>{HtmlEncode(Convert.ToString(order.Billing_Email) ?? string.Empty)}<br>{HtmlEncode(Convert.ToString(order.Billing_Phone) ?? string.Empty)}</p></section>
<section><h2>Delivery</h2><p>{HtmlEncode(deliveryName ?? string.Empty)}<br>{HtmlEncode(deliveryAddress ?? string.Empty)}<br>{HtmlEncode($"{deliveryPostCode} {deliveryCity}".Trim())}</p></section></div>
<p><strong>Order date:</strong> {Convert.ToDateTime(order.Order_Date):yyyy-MM-dd HH:mm}<br><strong>Payment:</strong> {HtmlEncode(Convert.ToString(order.Payment_Method) ?? string.Empty)} / {HtmlEncode(Convert.ToString(order.Payment_Status) ?? string.Empty)}</p>
<table><thead><tr><th>Product</th><th>Variant / flavour</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>{rows}</tbody></table>
<table class='totals'><tr><th>Subtotal</th><td>{PriceFormat.Mkd(Convert.ToDecimal(order.Subtotal))}</td></tr><tr><th>Promotion</th><td>- {PriceFormat.Mkd(Convert.ToDecimal(order.Promo_Discount))}</td></tr><tr><th>Points</th><td>- {PriceFormat.Mkd(Convert.ToDecimal(order.Points_Discount))}</td></tr><tr><th>Gift voucher</th><td>- {PriceFormat.Mkd(Convert.ToDecimal(order.Gift_Voucher_Amount))}</td></tr><tr><th>Delivery</th><td>{PriceFormat.Mkd(Convert.ToDecimal(order.Delivery_Fee))}</td></tr><tr><th>Total</th><td><strong>{PriceFormat.Mkd(Convert.ToDecimal(order.Total_Amount))}</strong></td></tr></table>
</body></html>";
                var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(html))).ToLowerInvariant();
                await orderProvider.RegisterDocumentAsync(orderId, hash, html);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Operational order document generation failed for order {OrderId}: {Message}", orderId, exception.Message);
            }
        }

        public string GetSamplePaymentForm() =>
            cpayService.GeneratePaymentForm(1118, 22m, "TEST-ORDER-001", "Test Customer", "test@example.com");

        public async Task<string?> GetLastOrderPaymentFormAsync()
        {
            var lastOrder = await orderProvider.GetLastAsync();
            if (lastOrder == null)
                return null;

            var user = lastOrder.User_Id is int userId ? await orderProvider.GetCheckoutUserAsync(userId) : null;
            string userEmail = user?.User_Email ?? "test@example.com";
            string userName = user?.User_FullName ?? "Test User";

            return cpayService.GeneratePaymentForm(lastOrder.Order_Id, lastOrder.Total_Amount, lastOrder.Order_Number, userName, userEmail);
        }

        public async Task<int> GetLastOrderIdAsync() => (await orderProvider.GetLastAsync())?.Order_Id ?? 0;

        public Task<bool> ExistsAsync(int orderId) => orderProvider.ExistsAsync(orderId);

        public Task<(dynamic? Order, List<dynamic> Items)> GetEmailDebugDataAsync(int orderId) =>
            orderProvider.GetEmailDebugDataAsync(orderId);

        /// <summary>Rejects invalid phones, non-deliverable cities, mismatched post codes, invalid emails and advert notes.</summary>
        private async Task ValidateContactDetailsAsync(CreateOrderDto orderDto)
        {
            var options = addressLookup != null ? await addressLookup.GetCheckoutOptionsAsync() : null;
            var phoneCountries = options?.PhoneCountries ?? CheckoutFieldValidator.DefaultCountries;
            var shippingCountries = options?.ShippingCountries ?? CheckoutFieldValidator.DefaultCountries;
            var cities = options?.Cities;

            if (!string.IsNullOrWhiteSpace(orderDto.Billing_Email))
            {
                var (emailValid, normalizedEmail, emailError, _) = CheckoutFieldValidator.ValidateEmail(orderDto.Billing_Email);
                if (!emailValid)
                    throw FieldError("Billing_Email", emailError!);

                var domainError = await CheckoutFieldValidator.ValidateEmailDomainAsync(normalizedEmail!);
                if (domainError != null)
                    throw FieldError("Billing_Email", domainError);

                orderDto.Billing_Email = normalizedEmail!;
            }

            var billingPhone = CheckoutFieldValidator.NormalizePhone(orderDto.Billing_Phone, phoneCountries)
                ?? throw FieldError("Billing_Phone", "Please enter a valid phone number for an allowed country (e.g. +389 71 000 000).");
            orderDto.Billing_Phone = billingPhone;

            var billingCountry = CheckoutFieldValidator.NormalizeShippingCountry(orderDto.Billing_Country, shippingCountries)
                ?? throw FieldError("Billing_Country", "Shipping is only available in North Macedonia.");
            orderDto.Billing_Country = billingCountry;

            var (cityValid, canonicalCity, canonicalPostCode, cityError) =
                CheckoutFieldValidator.ValidateCityAndPostCode(orderDto.Billing_City, orderDto.Billing_PostCode, cities);
            if (!cityValid)
            {
                var fieldName = !CheckoutFieldValidator.IsValidPostCode(orderDto.Billing_PostCode) || (cityError?.StartsWith("Post code", StringComparison.OrdinalIgnoreCase) == true)
                    ? "Billing_PostCode"
                    : "Billing_City";
                throw FieldError(fieldName, cityError!);
            }
            orderDto.Billing_City = canonicalCity!;
            orderDto.Billing_PostCode = canonicalPostCode!;

            if (orderDto.Delivery_IsDifferent)
            {
                orderDto.Delivery_Phone = CheckoutFieldValidator.NormalizePhone(orderDto.Delivery_Phone, phoneCountries)
                    ?? throw FieldError("Delivery_Phone", "Please enter a valid phone number for delivery (e.g. +389 71 000 000).");

                var deliveryCountry = CheckoutFieldValidator.NormalizeShippingCountry(orderDto.Delivery_Country, shippingCountries)
                    ?? throw FieldError("Delivery_Country", "Delivery is only available in North Macedonia.");
                orderDto.Delivery_Country = deliveryCountry;

                var (delCityValid, delCanonicalCity, delCanonicalPostCode, delCityError) =
                    CheckoutFieldValidator.ValidateCityAndPostCode(orderDto.Delivery_City, orderDto.Delivery_PostCode, cities);
                if (!delCityValid)
                {
                    var delField = !CheckoutFieldValidator.IsValidPostCode(orderDto.Delivery_PostCode) || (delCityError?.StartsWith("Post code", StringComparison.OrdinalIgnoreCase) == true)
                        ? "Delivery_PostCode"
                        : "Delivery_City";
                    throw FieldError(delField, delCityError!);
                }
                orderDto.Delivery_City = delCanonicalCity!;
                orderDto.Delivery_PostCode = delCanonicalPostCode!;
            }

            var noteProblem = CheckoutFieldValidator.CheckNote(orderDto.Order_Note);
            if (noteProblem != null)
                throw FieldError("Order_Note", noteProblem);

            orderDto.Gift_Recipient_Name = TrimToNull(orderDto.Gift_Recipient_Name);
            orderDto.Gift_Recipient_Email = TrimToNull(orderDto.Gift_Recipient_Email);
            orderDto.Gift_Message = TrimToNull(orderDto.Gift_Message);
            if (orderDto.Gift_Recipient_Name?.Length > 200)
                throw FieldError("Gift_Recipient_Name", "The recipient's name is too long.");
            if (orderDto.Gift_Recipient_Email != null)
            {
                var (recipientValid, recipientEmail, recipientError, _) = CheckoutFieldValidator.ValidateEmail(orderDto.Gift_Recipient_Email);
                if (!recipientValid)
                    throw FieldError("Gift_Recipient_Email", recipientError!);
                orderDto.Gift_Recipient_Email = recipientEmail;
            }
            if (orderDto.Gift_Message != null)
            {
                if (orderDto.Gift_Message.Length > 500)
                    throw FieldError("Gift_Message", "The gift message can be at most 500 characters.");
                if (CheckoutFieldValidator.CheckNote(orderDto.Gift_Message) != null)
                    throw FieldError("Gift_Message", "The gift message cannot contain links or advertising.");
            }
        }

        private static string? TrimToNull(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static BadRequestException FieldError(string field, string message) =>
            new(message, new { status = false, field, message });

        private static BadRequestException BadRequest(string message) => new(message, new { message });

        private static BadRequestException StatusBadRequest(string message) => new(message, new { status = false, message });

        private static NotFoundException OrderNotFound() => new("Order not found", new { message = "Order not found" });
    }
}
