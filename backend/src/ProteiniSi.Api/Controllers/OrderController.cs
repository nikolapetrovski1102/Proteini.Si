using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.DTOs;
using ProteiniSi.Api.Services;
using ProteiniSi.Api.Helpers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using System.Text.Json;
using System.Globalization;
using System.Security.Cryptography;

namespace ProteiniSi.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IConfiguration _config;
        private readonly ILoyaltyService _loyaltyService;
        private readonly CPayService _cpayService;
        private static readonly string[] DefaultOrderCopyRecipients =
        {
            "gtsport8@yahoo.com",
            "vladimir.proteinisi@gmail.com"
        };

        public OrderController(IConfiguration config, ILoyaltyService loyaltyService, CPayService cpayService)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
            _loyaltyService = loyaltyService;
            _cpayService = cpayService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return 0;
            return int.Parse(userIdClaim);
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            if (isAdminClaim == "True" || isAdminClaim == "true")
                return true;

            var configuredDiagnosticsKey = _config["MailSettings:DiagnosticsKey"] ?? _config["AppSettings:DiagnosticsKey"];
            if (string.IsNullOrWhiteSpace(configuredDiagnosticsKey))
                return false;

            var providedDiagnosticsKey = Request.Headers["X-Diagnostics-Key"].FirstOrDefault() ?? Request.Query["diagnosticsKey"].FirstOrDefault();
            return string.Equals(providedDiagnosticsKey, configuredDiagnosticsKey, StringComparison.Ordinal);
        }

        [AllowAnonymous]
        [HttpPost("Create")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                string userEmail;
                string userFullName;
                List<dynamic> cartItems;
                int? cartId = null;

                if (userId > 0)
                {
                    string getUserEmailSql = "SELECT User_Email, User_FullName FROM [User] WHERE User_Id = @UserId";
                    var user = _dapper.LoadDataSingleOrDefault<dynamic>(getUserEmailSql, new { UserId = userId });

                    if (user == null)
                        return BadRequest(new { message = "User not found" });

                    userEmail = user.User_Email;
                    userFullName = user.User_FullName ?? "Customer";

                    string getCartIdSql = "SELECT Cart_Id FROM ShoppingCart WHERE User_Id = @UserId";
                    cartId = _dapper.LoadDataSingleOrDefault<int?>(getCartIdSql, new { UserId = userId });

                    if (!cartId.HasValue)
                        return BadRequest(new { message = "No active shopping cart found" });

                    string getCartItemsSql = @"
        SELECT 
            ci.CartItem_Id,
            ci.Product_Id,
            ci.Quantity,
            CASE
                WHEN p.IsGiftVoucher = 1 THEN ci.Price
                WHEN ci.Variant_Id IS NULL
                 AND p.ProductsOnSale = 1
                 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                 AND p.SalePrice > 0
                 AND p.SalePrice < p.Price
                    THEN p.SalePrice
                WHEN ci.Variant_Id IS NULL THEN CAST(p.Price AS decimal(18, 2))
                WHEN pv.Variant_Id IS NOT NULL THEN
                    CASE
                        WHEN p.ProductsOnSale = 1
                         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                         AND pv.Compare_Price IS NOT NULL AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                            THEN pv.Compare_Price
                        ELSE pv.Price
                    END
                ELSE NULL
            END as CartPrice,
            ci.Variant_Id,
            pv.Variant_Id as CatalogVariantId,
            CASE
                WHEN pv.Variant_Id IS NOT NULL
                    THEN COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''))
                ELSE NULL
            END as Variant_Name,
            CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Packaging_Name ELSE NULL END as Variant_Packaging,
            p.Name as Product_Name,
            p.Price as Product_Price,
            CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Quantity ELSE p.Quantity END as Product_Stock,
            p.HasVariants,
            p.IsGiftVoucher,
            p.VoucherMinAmount,
            p.VoucherMaxAmount,
            p.LoyaltyPercentage as ProductLoyaltyPercentage,
            pv.LoyaltyPercentage as VariantLoyaltyPercentage,
            pkg.Weight_Grams as VariantWeightGrams
        FROM CartItems ci
        INNER JOIN Products p ON ci.Product_Id = p.Product_Id
        LEFT JOIN ProductVariants pv
            ON ci.Variant_Id = pv.Variant_Id
            AND pv.Product_Id = ci.Product_Id
            AND pv.IsActive = 1
        LEFT JOIN Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
        WHERE ci.Cart_Id = @CartId";

                    cartItems = _dapper.LoadData<dynamic>(getCartItemsSql, new { CartId = cartId.Value }).ToList();

                    var invalidVariantItem = cartItems.FirstOrDefault(item =>
                        (item.Variant_Id != null && item.CatalogVariantId == null)
                        || (item.Variant_Id == null && ToBoolean(item.HasVariants)));
                    if (invalidVariantItem != null)
                    {
                        return BadRequest(new
                        {
                            message = $"The selected variant for product ID {invalidVariantItem.Product_Id} is invalid or unavailable. Please remove it from the cart and select it again."
                        });
                    }
                }
                else
                {
                    userEmail = orderDto.Billing_Email;
                    userFullName = orderDto.Billing_FullName ?? "Guest Customer";

                    if (orderDto.CartItems == null || orderDto.CartItems.Count == 0)
                    {
                        return BadRequest(new { message = "Cart items are required for guest checkout" });
                    }

                    cartItems = new List<dynamic>();
                    foreach (var item in orderDto.CartItems)
                    {
                        string getProductSql = @"
            SELECT 
                p.Name,
                p.Price as ProductPrice,
                p.Quantity as ProductQuantity,
                p.HasVariants,
                p.IsGiftVoucher,
                p.VoucherMinAmount,
                p.VoucherMaxAmount,
                p.LoyaltyPercentage as ProductLoyaltyPercentage,
                pv.Variant_Id as CatalogVariantId,
                pv.Quantity as VariantQuantity,
                pv.LoyaltyPercentage as VariantLoyaltyPercentage,
                COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, '')) as CatalogVariantName,
                pv.Packaging_Name as CatalogVariantPackaging,
                pkg.Weight_Grams as VariantWeightGrams,
                CASE
                    WHEN pv.Variant_Id IS NULL
                     AND p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND p.SalePrice > 0
                     AND p.SalePrice < p.Price
                        THEN p.SalePrice
                    WHEN pv.Variant_Id IS NULL THEN CAST(p.Price AS decimal(18, 2))
                    WHEN p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND pv.Compare_Price IS NOT NULL AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                        THEN pv.Compare_Price
                    ELSE pv.Price
                END as EffectivePrice
            FROM Products p
            LEFT JOIN ProductVariants pv
                ON pv.Variant_Id = @VariantId
                AND pv.Product_Id = p.Product_Id
                AND pv.IsActive = 1
            LEFT JOIN Packaging pkg ON pkg.Packaging_Id = pv.Packaging_Id
            WHERE p.Product_Id = @Product_Id";

                        var product = _dapper.LoadDataSingleOrDefault<dynamic>(getProductSql, new
                        {
                            Product_Id = item.Product_Id,
                            VariantId = item.Variant_Id
                        });

                        if (product == null)
                        {
                            return BadRequest(new { message = $"Product with ID {item.Product_Id} not found" });
                        }

                        if (!item.Variant_Id.HasValue && ToBoolean(product.HasVariants))
                        {
                            return BadRequest(new
                            {
                                message = $"A valid package or variant must be selected for product ID {item.Product_Id}."
                            });
                        }

                        if (item.Variant_Id.HasValue && product.CatalogVariantId == null)
                        {
                            return BadRequest(new
                            {
                                message = $"Variant ID {item.Variant_Id} is invalid, unavailable, or does not belong to product ID {item.Product_Id}."
                            });
                        }

                        // Determine loyalty percentage - priority: variant > product > default 2%
                        decimal loyaltyPercentage = 2.0m;
                        if (item.Variant_Id.HasValue && product.VariantLoyaltyPercentage != null && (decimal)product.VariantLoyaltyPercentage > 0)
                        {
                            loyaltyPercentage = (decimal)product.VariantLoyaltyPercentage;
                        }
                        else if (product.ProductLoyaltyPercentage != null && (decimal)product.ProductLoyaltyPercentage > 0)
                        {
                            loyaltyPercentage = (decimal)product.ProductLoyaltyPercentage;
                        }

                        int availableQuantity = item.Variant_Id.HasValue
                            ? (int)product.VariantQuantity
                            : (int)product.ProductQuantity;

                        if (availableQuantity < item.Quantity)
                        {
                            return BadRequest(new { message = $"Insufficient stock for product: {product.Name}. Available: {availableQuantity}, Requested: {item.Quantity}" });
                        }

                        decimal effectivePrice = (decimal)product.EffectivePrice;
                        if (ToBoolean(product.IsGiftVoucher))
                        {
                            decimal minimum = product.VoucherMinAmount != null
                                ? (decimal)product.VoucherMinAmount
                                : 500m;
                            decimal? maximum = product.VoucherMaxAmount != null
                                ? (decimal?)product.VoucherMaxAmount
                                : null;

                            if (item.Price < minimum || (maximum.HasValue && item.Price > maximum.Value))
                            {
                                return BadRequest(new
                                {
                                    message = maximum.HasValue
                                        ? $"Voucher amount must be between {minimum:F0} and {maximum.Value:F0} MKD"
                                        : $"Voucher amount must be at least {minimum:F0} MKD"
                                });
                            }

                            effectivePrice = decimal.Round(item.Price, 2);
                        }
                        cartItems.Add(new
                        {
                            Product_Id = item.Product_Id,
                            Quantity = item.Quantity,
                            Product_Name = (string)product.Name,
                            Product_Price = effectivePrice,
                            CartPrice = effectivePrice,
                            Product_Stock = availableQuantity,
                            Variant_Id = item.Variant_Id,
                            Variant_Name = item.Variant_Id.HasValue ? (string?)product.CatalogVariantName : null,
                            Variant_Packaging = item.Variant_Id.HasValue ? (string?)product.CatalogVariantPackaging : null,
                            LoyaltyPercentage = loyaltyPercentage,
                            ProductLoyaltyPercentage = product.ProductLoyaltyPercentage != null ? (decimal?)product.ProductLoyaltyPercentage : null,
                            VariantLoyaltyPercentage = product.VariantLoyaltyPercentage != null ? (decimal?)product.VariantLoyaltyPercentage : null,
                            VariantWeightGrams = product.VariantWeightGrams != null ? (decimal?)product.VariantWeightGrams : null,
                            IsGiftVoucher = ToBoolean(product.IsGiftVoucher)
                        });
                    }
                }

                if (cartItems == null || !cartItems.Any())
                    return BadRequest(new { message = "Cart is empty" });

                var paymentMethod = NormalizePaymentMethod(orderDto.Payment_Method);
                if (!IsSupportedPaymentMethod(paymentMethod))
                    return BadRequest(new { message = $"Unsupported payment method: {orderDto.Payment_Method}" });
                var shippingSettings = LoadShippingSettings();
                if ((paymentMethod == "home_delivery" && !shippingSettings.HomeDeliveryEnabled)
                    || (paymentMethod == "credit_card" && !shippingSettings.CardPaymentEnabled))
                    return BadRequest(new { message = "The selected payment method is currently unavailable." });

                var initialOrderStatus = paymentMethod == "home_delivery" ? "pending_confirmation" : "pending";
                decimal subtotal = 0;
                decimal pointsRedeemed = orderDto.PointsToRedeem ?? 0;
                var orderItems = new List<OrderItemDto>();
                decimal totalPointsEarned = 0;

                foreach (var item in cartItems)
                {
                    if ((int)item.Quantity <= 0)
                        return BadRequest(new { message = "Order item quantities must be greater than zero." });

                    if ((int)item.Product_Stock < (int)item.Quantity)
                    {
                        return BadRequest(new
                        {
                            message = $"Insufficient stock for product: {item.Product_Name}. Available: {item.Product_Stock}, Requested: {item.Quantity}"
                        });
                    }

                    decimal itemPrice = (decimal)(item.CartPrice ?? item.Product_Price);
                    decimal itemSubtotal = (decimal)item.Quantity * itemPrice;
                    subtotal += itemSubtotal;

                    // Get loyalty percentage - priority: variant > product > default 2%
                    decimal loyaltyPercentage = 2.0m;

                    // Check if variant has loyalty percentage (for authenticated users)
                    if (item.VariantLoyaltyPercentage != null && (decimal)item.VariantLoyaltyPercentage > 0)
                    {
                        loyaltyPercentage = (decimal)item.VariantLoyaltyPercentage;
                    }
                    // Otherwise use product loyalty percentage
                    else if (item.ProductLoyaltyPercentage != null && (decimal)item.ProductLoyaltyPercentage > 0)
                    {
                        loyaltyPercentage = (decimal)item.ProductLoyaltyPercentage;
                    }
                    // If item has direct LoyaltyPercentage (for guest checkout)
                    else if (item.LoyaltyPercentage != null && (decimal)item.LoyaltyPercentage > 0)
                    {
                        loyaltyPercentage = (decimal)item.LoyaltyPercentage;
                    }
                    // Otherwise default to 2%

                    // Calculate points for this product
                    decimal itemPoints = Math.Floor(itemSubtotal * (loyaltyPercentage / 100m));
                    totalPointsEarned += itemPoints;

                    orderItems.Add(new OrderItemDto
                    {
                        Product_Id = (int)item.Product_Id,
                        Product_Name = item.Product_Name,
                        Product_Price = itemPrice,
                        Quantity = (int)item.Quantity,
                        Subtotal = itemSubtotal,
                        Variant_Id = item.Variant_Id,
                        Variant_Name = item.Variant_Name,
                        Variant_Packaging = item.Variant_Packaging,
                        LoyaltyPointsEarned = (int)itemPoints,
                        LoyaltyPercentage = loyaltyPercentage
                    });
                }

                var promotion = ResolvePromotion(orderDto.Promo_Code, subtotal, userId, userEmail);
                if (!string.IsNullOrWhiteSpace(orderDto.Promo_Code) && promotion == null)
                    return BadRequest(new { message = "The promotion code is invalid, expired, unavailable, or does not meet the order requirements." });

                var containsVoucherPurchase = cartItems.Any(item => ToBoolean(item.IsGiftVoucher));
                if (containsVoucherPurchase && !string.IsNullOrWhiteSpace(orderDto.Gift_Voucher_Code))
                    return BadRequest(new { message = "A gift voucher cannot be used to purchase another gift voucher." });

                var selectedGift = ResolveFreeGift(orderDto.Selected_Free_Gift_Id, subtotal);
                if (orderDto.Selected_Free_Gift_Id.HasValue && selectedGift == null)
                    return BadRequest(new { message = "The selected free gift is unavailable or the order does not meet its requirements." });

                decimal promotionDiscount = promotion?.DiscountAmount ?? 0m;
                decimal deliveryFee = CalculateDeliveryFee(subtotal, paymentMethod, shippingSettings);

                if (userId <= 0)
                {
                    pointsRedeemed = 0;
                }
                else
                {
                    var availablePoints = await _loyaltyService.GetAvailablePointsAsync(userId);
                    var maximumPointsDiscount = Math.Floor(Math.Max(subtotal - promotionDiscount, 0m) * 0.5m);
                    pointsRedeemed = Math.Min(Math.Max(pointsRedeemed, 0m), Math.Min(availablePoints, maximumPointsDiscount));
                }

                decimal pointsDiscount = pointsRedeemed;
                decimal totalAfterDiscount = subtotal - promotionDiscount - pointsDiscount;

                if (totalAfterDiscount < 0)
                {
                    pointsDiscount = subtotal;
                    totalAfterDiscount = 0;
                }

                decimal amountBeforeVoucher = totalAfterDiscount + deliveryFee;
                var giftVoucher = ResolveGiftVoucher(orderDto.Gift_Voucher_Code, amountBeforeVoucher);
                if (!string.IsNullOrWhiteSpace(orderDto.Gift_Voucher_Code) && giftVoucher == null)
                    return BadRequest(new { message = "The gift voucher is invalid, expired, disabled or has no remaining balance." });
                decimal giftVoucherAmount = giftVoucher?.Amount ?? 0m;
                decimal totalAmount = Math.Max(amountBeforeVoucher - giftVoucherAmount, 0m);
                string orderNumber = $"ORD-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";
                int orderId = 0;

                try
                {
                    orderId = _dapper.ExecuteInTransaction((connection, transaction) =>
                    {
                        if (promotion != null)
                        {
                            var lockedPromotion = connection.QuerySingleOrDefault<dynamic>(@"
SELECT pc.*,
       (SELECT COUNT(*) FROM PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
       (SELECT COUNT(*) FROM PromoCodeUsages u
        WHERE u.PromoCodeId = pc.PromoCodeId
          AND ((@UserId > 0 AND u.UserId = @UserId)
               OR (@UserId <= 0 AND LOWER(u.CustomerEmail) = LOWER(@CustomerEmail)))) AS CustomerTimesUsed
FROM PromoCodes pc WITH (UPDLOCK, HOLDLOCK)
WHERE pc.PromoCodeId = @PromoCodeId", new
                            {
                                promotion.PromoCodeId,
                                UserId = userId,
                                CustomerEmail = userEmail
                            }, transaction);

                            var lockedPromotionValid = lockedPromotion != null
                                && ToBoolean(lockedPromotion.IsActive)
                                && (lockedPromotion.ValidFrom == null || DateTime.Now >= (DateTime)lockedPromotion.ValidFrom)
                                && (lockedPromotion.ValidUntil == null || DateTime.Now <= (DateTime)lockedPromotion.ValidUntil)
                                && subtotal >= Convert.ToDecimal(lockedPromotion.MinimumOrderAmount)
                                && (lockedPromotion.UsageLimit == null
                                    || Convert.ToInt32(lockedPromotion.TimesUsed) < Convert.ToInt32(lockedPromotion.UsageLimit))
                                && (lockedPromotion.PerCustomerLimit == null
                                    || Convert.ToInt32(lockedPromotion.CustomerTimesUsed) < Convert.ToInt32(lockedPromotion.PerCustomerLimit));

                            if (!lockedPromotionValid)
                                throw new InvalidOperationException("The promotion code has just reached its limit or is no longer available.");
                        }

                        if (giftVoucher != null)
                        {
                            var lockedVoucher = connection.QuerySingleOrDefault<dynamic>(@"
SELECT GiftVoucherId, Code, RemainingValue, Status, ValidFrom, ExpiresAt
FROM GiftVouchers WITH (UPDLOCK, HOLDLOCK)
WHERE GiftVoucherId = @GiftVoucherId", new { giftVoucher.GiftVoucherId }, transaction);

                            var available = lockedVoucher == null ? 0m : Convert.ToDecimal(lockedVoucher.RemainingValue);
                            var applicable = Math.Round(Math.Min(available, amountBeforeVoucher), 2, MidpointRounding.AwayFromZero);
                            var valid = lockedVoucher != null
                                && string.Equals(Convert.ToString(lockedVoucher.Status), "active", StringComparison.OrdinalIgnoreCase)
                                && Convert.ToDateTime(lockedVoucher.ValidFrom) <= DateTime.UtcNow
                                && (lockedVoucher.ExpiresAt == null || Convert.ToDateTime(lockedVoucher.ExpiresAt) >= DateTime.UtcNow)
                                && applicable > 0
                                && applicable == giftVoucher.Amount;
                            if (!valid)
                                throw new InvalidOperationException("The gift voucher balance changed or is no longer available. Please review the order and try again.");
                        }

                        string insertOrderSql = @"
            INSERT INTO Orders (
                User_Id, Order_Number, Order_Date, Order_Status, Payment_Method, Payment_Status,
                Billing_Type, Billing_FullName, Billing_Address, Billing_PostCode, Billing_City, 
                Billing_Country, Billing_Phone, Billing_Email, Billing_TaxNumber, Billing_CompanyName,
                Delivery_IsDifferent, Delivery_FullName, Delivery_Address, Delivery_PostCode, 
                Delivery_City, Delivery_Country, Delivery_Phone,
                Subtotal, Delivery_Fee, VAT_Amount, Total_Amount, Order_Note, Gift_Voucher_Code, Gift_Voucher_Amount,
                Promo_Code, Promo_Discount, Selected_Free_Gift_Id,
                Points_Redeemed, Points_Discount, Points_Earned,
                Created_At, Updated_At
            ) VALUES (
                @UserId, @OrderNumber, GETDATE(), @OrderStatus, @PaymentMethod, 'pending',
                @BillingType, @BillingFullName, @BillingAddress, @BillingPostCode, @BillingCity,
                @BillingCountry, @BillingPhone, @BillingEmail, @BillingTaxNumber, @BillingCompanyName,
                @DeliveryIsDifferent, @DeliveryFullName, @DeliveryAddress, @DeliveryPostCode,
                @DeliveryCity, @DeliveryCountry, @DeliveryPhone,
                @Subtotal, @DeliveryFee, @VatAmount, @TotalAmount, @OrderNote, @GiftVoucherCode, @GiftVoucherAmount,
                @PromoCode, @PromoDiscount, @SelectedFreeGiftId,
                @PointsRedeemed, @PointsDiscount, @PointsEarned,
                GETDATE(), GETDATE()
            );
            SELECT CAST(SCOPE_IDENTITY() AS int);";

                        var parameters = new
                        {
                            UserId = userId > 0 ? userId : (int?)null,
                            OrderNumber = orderNumber,
                            OrderStatus = initialOrderStatus,
                            PaymentMethod = paymentMethod,
                            BillingType = orderDto.Billing_Type ?? "natural",
                            BillingFullName = orderDto.Billing_FullName ?? userFullName,
                            BillingAddress = orderDto.Billing_Address ?? "",
                            BillingPostCode = orderDto.Billing_PostCode ?? "",
                            BillingCity = orderDto.Billing_City ?? "",
                            BillingCountry = orderDto.Billing_Country ?? "",
                            BillingPhone = orderDto.Billing_Phone ?? "",
                            BillingEmail = userEmail,
                            BillingTaxNumber = orderDto.Billing_TaxNumber,
                            BillingCompanyName = orderDto.Billing_CompanyName,
                            DeliveryIsDifferent = orderDto.Delivery_IsDifferent,
                            DeliveryFullName = orderDto.Delivery_FullName,
                            DeliveryAddress = orderDto.Delivery_Address,
                            DeliveryPostCode = orderDto.Delivery_PostCode,
                            DeliveryCity = orderDto.Delivery_City,
                            DeliveryCountry = orderDto.Delivery_Country,
                            DeliveryPhone = orderDto.Delivery_Phone,
                            Subtotal = subtotal,
                            DeliveryFee = deliveryFee,
                            VatAmount = 0,
                            TotalAmount = totalAmount,
                            OrderNote = orderDto.Order_Note,
                            GiftVoucherCode = giftVoucher?.Code,
                            GiftVoucherAmount = giftVoucherAmount,
                            PromoCode = promotion?.Code,
                            PromoDiscount = promotionDiscount,
                            SelectedFreeGiftId = selectedGift?.FreeGiftId,
                            PointsRedeemed = pointsRedeemed,
                            PointsDiscount = pointsDiscount,
                            PointsEarned = totalPointsEarned
                        };

                        int newOrderId = connection.QuerySingle<int>(insertOrderSql, parameters, transaction);

                        if (newOrderId <= 0)
                            throw new Exception("Failed to create order");

                        if (promotion != null)
                        {
                            connection.Execute(@"
INSERT INTO PromoCodeUsages
    (PromoCodeId, OrderId, UserId, CustomerEmail, DiscountAmount, UsedAt)
VALUES
    (@PromoCodeId, @OrderId, @UserId, @CustomerEmail, @DiscountAmount, GETDATE())", new
                            {
                                promotion.PromoCodeId,
                                OrderId = newOrderId,
                                UserId = userId > 0 ? userId : (int?)null,
                                CustomerEmail = userEmail,
                                DiscountAmount = promotionDiscount
                            }, transaction);
                        }

                        if (giftVoucher != null)
                        {
                            var changed = connection.Execute(@"
UPDATE GiftVouchers
SET RemainingValue = RemainingValue - @Amount,
    Status = CASE WHEN RemainingValue - @Amount <= 0 THEN 'depleted' ELSE 'active' END,
    UpdatedAt = SYSUTCDATETIME()
WHERE GiftVoucherId = @GiftVoucherId AND RemainingValue >= @Amount", new
                            {
                                giftVoucher.GiftVoucherId,
                                Amount = giftVoucherAmount
                            }, transaction);
                            if (changed != 1)
                                throw new InvalidOperationException("The gift voucher balance changed. Please try again.");

                            connection.Execute(@"
INSERT INTO GiftVoucherRedemptions
    (GiftVoucherId, OrderId, Amount, Status, CreatedAt)
VALUES
    (@GiftVoucherId, @OrderId, @Amount, 'reserved', SYSUTCDATETIME())", new
                            {
                                giftVoucher.GiftVoucherId,
                                OrderId = newOrderId,
                                Amount = giftVoucherAmount
                            }, transaction);
                        }

                        if (selectedGift != null)
                        {
                            var stockRows = selectedGift.VariantId.HasValue
                                ? connection.Execute(@"
UPDATE ProductVariants
SET Quantity = Quantity - 1, Updated_At = GETDATE()
WHERE Variant_Id = @VariantId AND Product_Id = @ProductId AND IsActive = 1 AND Quantity > 0", new
                                {
                                    selectedGift.VariantId,
                                    selectedGift.ProductId
                                }, transaction)
                                : connection.Execute(@"
UPDATE Products
SET Quantity = Quantity - 1, UpdatedAt = GETDATE()
WHERE Product_Id = @ProductId AND HasVariants = 0 AND Quantity > 0", new
                                {
                                    selectedGift.ProductId
                                }, transaction);

                            if (stockRows != 1)
                                throw new Exception("The selected free gift has just gone out of stock. Please choose another gift.");

                            connection.Execute(@"
INSERT INTO OrderFreeGifts
    (OrderId, FreeGiftId, ProductId, VariantId, DisplayName, CreatedAt)
VALUES
    (@OrderId, @FreeGiftId, @ProductId, @VariantId, @DisplayName, GETDATE())", new
                            {
                                OrderId = newOrderId,
                                selectedGift.FreeGiftId,
                                selectedGift.ProductId,
                                selectedGift.VariantId,
                                selectedGift.DisplayName
                            }, transaction);
                        }

                        // Redeem points if any
                        if (pointsRedeemed > 0 && userId > 0)
                        {
                            string redeemPointsSql = @"
                INSERT INTO LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
                VALUES (@UserId, @Points, 'redeemed', 'order', @SourceId, @Description, GETDATE())";

                            connection.Execute(redeemPointsSql, new
                            {
                                UserId = userId,
                                Points = pointsRedeemed,
                                SourceId = newOrderId,
                                Description = $"Redeemed {pointsRedeemed} points for order #{orderNumber}"
                            }, transaction);
                        }

                        // Insert order items with loyalty points earned
                        foreach (var item in orderItems)
                        {
                            string insertItemSql = @"
                INSERT INTO OrderItems (
                    Order_Id, Product_Id, Variant_Id, Variant_Name, Variant_Packaging,
                    Product_Name, Product_Price, Quantity, Subtotal, 
                    LoyaltyPercentage, LoyaltyPointsEarned,
                    Created_At
                ) VALUES (
                    @OrderId, @ProductId, @VariantId, @VariantName, @VariantPackaging,
                    @ProductName, @ProductPrice, @Quantity, @Subtotal,
                    @LoyaltyPercentage, @LoyaltyPointsEarned,
                    GETDATE()
                )";

                            connection.Execute(insertItemSql, new
                            {
                                OrderId = newOrderId,
                                ProductId = item.Product_Id,
                                VariantId = item.Variant_Id,
                                VariantName = item.Variant_Name,
                                VariantPackaging = item.Variant_Packaging,
                                ProductName = item.Product_Name,
                                ProductPrice = item.Product_Price,
                                Quantity = item.Quantity,
                                Subtotal = item.Subtotal,
                                LoyaltyPercentage = item.LoyaltyPercentage,
                                LoyaltyPointsEarned = item.LoyaltyPointsEarned
                            }, transaction);

                            // Deduct stock
                            if (item.Variant_Id.HasValue && item.Variant_Id.Value > 0)
                            {
                                string deductVariantStockSql = @"
                    UPDATE ProductVariants 
                    SET Quantity = Quantity - @Quantity,
                        Updated_At = GETDATE()
                    WHERE Variant_Id = @VariantId
                      AND IsActive = 1
                      AND Quantity >= @Quantity";

                                var affectedRows = connection.Execute(deductVariantStockSql, new
                                {
                                    Quantity = item.Quantity,
                                    VariantId = item.Variant_Id.Value
                                }, transaction);

                                if (affectedRows != 1)
                                    throw new InvalidOperationException($"Insufficient stock for product: {item.Product_Name}.");
                            }
                            else
                            {
                                string deductStockSql = @"
                    UPDATE Products 
                    SET Quantity = Quantity - @Quantity
                    WHERE Product_Id = @ProductId
                      AND HasVariants = 0
                      AND Quantity >= @Quantity";

                                var affectedRows = connection.Execute(deductStockSql, new
                                {
                                    Quantity = item.Quantity,
                                    ProductId = item.Product_Id
                                }, transaction);

                                if (affectedRows != 1)
                                    throw new InvalidOperationException($"Insufficient stock for product: {item.Product_Name}.");
                            }
                        }

                        // Clear cart
                        if (cartId.HasValue)
                        {
                            string clearCartItemsSql = "DELETE FROM CartItems WHERE Cart_Id = @CartId";
                            connection.Execute(clearCartItemsSql, new { CartId = cartId.Value }, transaction);
                        }

                        return newOrderId;
                    });
                }
                catch (Exception ex)
                {
                    return StatusCode(400, new { message = ex.Message });
                }

                var orderConfirmationEmailSent = false;
                TryRegisterOperationalDocument(orderId);

                // ✅ FIXED: Home delivery - send email immediately (NOT payment confirmed)
                if (paymentMethod == "home_delivery")
                {
                    orderConfirmationEmailSent = await SendOrderConfirmationEmail(orderId, false);
                    Console.WriteLine(orderConfirmationEmailSent
                        ? $"COD order confirmation email sent. OrderId={orderId}, OrderNumber={orderNumber}"
                        : $"COD order confirmation email failed. OrderId={orderId}, OrderNumber={orderNumber}");
                }

                // Credit card payment
                if (paymentMethod == "credit_card")
                {
                    if (totalAmount <= 0m)
                    {
                        var completion = await CompletePaidOrderAsync(orderId, $"VOUCHER-{orderNumber}");
                        return Ok(new
                        {
                            status = completion.Success,
                            message = completion.Message,
                            orderId,
                            orderNumber,
                            totalAmount,
                            paymentMethod,
                            orderConfirmationEmailSent = completion.EmailSent,
                            pointsRedeemed,
                            pointsDiscount,
                            promoDiscount = promotionDiscount,
                            giftVoucherAmount,
                            freeGift = selectedGift?.DisplayName,
                            pointsToEarn = totalPointsEarned
                        });
                    }

                    var cpayConfig = _config.GetSection("CPayConfiguration");
                    var testMode = cpayConfig.GetValue<bool>("TestMode", true);

                    if (testMode)
                    {
                        var frontendUrl = _config["AppSettings:FrontendUrl"];
                        var mockPaymentUrl = $"{frontendUrl}/mock-payment?orderId={orderId}&amount={totalAmount}&orderNumber={orderNumber}";

                        return Ok(new
                        {
                            status = true,
                            message = "Order created successfully. Redirecting to payment...",
                            orderId = orderId,
                            orderNumber = orderNumber,
                            totalAmount = totalAmount,
                            paymentMethod = "credit_card",
                            paymentUrl = mockPaymentUrl,
                            requiresFormSubmit = false,
                            pointsRedeemed = pointsRedeemed,
                            pointsDiscount = pointsDiscount,
                            promoDiscount = promotionDiscount,
                            giftVoucherAmount = giftVoucherAmount,
                            freeGift = selectedGift?.DisplayName,
                            pointsToEarn = totalPointsEarned
                        });
                    }
                    else
                    {
                        int amountInDeni = (int)(totalAmount * 100);
                        var cpayHtml = _cpayService.GeneratePaymentForm(orderId, amountInDeni, orderNumber, userFullName, userEmail);
                        return Content(cpayHtml, "text/html");
                    }
                }

                return Ok(new
                {
                    status = true,
                    message = "Order created successfully",
                    orderId = orderId,
                    orderNumber = orderNumber,
                    totalAmount = totalAmount,
                    paymentMethod = paymentMethod,
                    orderConfirmationEmailSent = orderConfirmationEmailSent,
                    pointsRedeemed = pointsRedeemed,
                    pointsDiscount = pointsDiscount,
                    promoDiscount = promotionDiscount,
                    giftVoucherAmount = giftVoucherAmount,
                    freeGift = selectedGift?.DisplayName,
                    pointsToEarn = totalPointsEarned
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Order creation failed. Please try again or contact support." });
            }
        }

        private static bool IsSupportedPaymentMethod(string paymentMethod)
        {
            return paymentMethod == "credit_card" || paymentMethod == "home_delivery";
        }

        private static bool CanTransitionOrder(string current, string requested)
        {
            if (current == requested) return true;
            var transitions = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["pending"] = new[] { "confirmed", "paid", "rejected", "cancelled" },
                ["pending_confirmation"] = new[] { "confirmed", "paid", "rejected", "cancelled" },
                ["confirmed"] = new[] { "processing", "paid", "cancelled", "rejected" },
                ["processing"] = new[] { "paid", "completed", "shipped", "cancelled" },
                ["paid"] = new[] { "processing", "completed", "shipped", "refunded" },
                ["completed"] = new[] { "shipped", "delivered", "refunded" },
                ["shipped"] = new[] { "delivered", "refunded" },
                ["delivered"] = new[] { "refunded" },
                ["rejected"] = Array.Empty<string>(),
                ["cancelled"] = Array.Empty<string>(),
                ["refunded"] = Array.Empty<string>()
            };
            return transitions.TryGetValue(current, out var allowed) && allowed.Contains(requested, StringComparer.OrdinalIgnoreCase);
        }

        private PromotionApplication? ResolvePromotion(string? rawCode, decimal subtotal, int userId, string customerEmail)
        {
            if (string.IsNullOrWhiteSpace(rawCode)) return null;
            var code = rawCode.Trim().ToUpperInvariant();
            var promo = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT pc.*,
       (SELECT COUNT(*) FROM PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
       (SELECT COUNT(*) FROM PromoCodeUsages u
        WHERE u.PromoCodeId = pc.PromoCodeId
          AND ((@UserId > 0 AND u.UserId = @UserId)
               OR (@UserId <= 0 AND LOWER(u.CustomerEmail) = LOWER(@CustomerEmail)))) AS CustomerTimesUsed
FROM PromoCodes pc
WHERE UPPER(pc.Code) = @Code", new { Code = code, UserId = userId, CustomerEmail = customerEmail });

            if (promo == null || !ToBoolean(promo.IsActive)) return null;
            var now = DateTime.Now;
            if (promo.ValidFrom != null && now < (DateTime)promo.ValidFrom) return null;
            if (promo.ValidUntil != null && now > (DateTime)promo.ValidUntil) return null;
            if (subtotal < Convert.ToDecimal(promo.MinimumOrderAmount)) return null;
            if (promo.UsageLimit != null && Convert.ToInt32(promo.TimesUsed) >= Convert.ToInt32(promo.UsageLimit)) return null;
            if (promo.PerCustomerLimit != null && Convert.ToInt32(promo.CustomerTimesUsed) >= Convert.ToInt32(promo.PerCustomerLimit)) return null;

            var discountValue = Convert.ToDecimal(promo.DiscountValue);
            var discount = string.Equals(Convert.ToString(promo.DiscountType), "percentage", StringComparison.OrdinalIgnoreCase)
                ? subtotal * discountValue / 100m
                : discountValue;
            if (promo.MaximumDiscountAmount != null)
                discount = Math.Min(discount, Convert.ToDecimal(promo.MaximumDiscountAmount));

            return new PromotionApplication
            {
                PromoCodeId = Convert.ToInt32(promo.PromoCodeId),
                Code = Convert.ToString(promo.Code) ?? code,
                DiscountAmount = Math.Round(Math.Min(Math.Max(discount, 0m), subtotal), 2, MidpointRounding.AwayFromZero)
            };
        }

        private GiftVoucherApplication? ResolveGiftVoucher(string? rawCode, decimal orderAmount)
        {
            if (string.IsNullOrWhiteSpace(rawCode) || orderAmount <= 0) return null;
            var code = rawCode.Trim().ToUpperInvariant();
            var voucher = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT GiftVoucherId, Code, RemainingValue, Status, ValidFrom, ExpiresAt
FROM GiftVouchers
WHERE Code = @Code", new { Code = code });

            if (voucher == null
                || !string.Equals(Convert.ToString(voucher.Status), "active", StringComparison.OrdinalIgnoreCase)
                || Convert.ToDateTime(voucher.ValidFrom) > DateTime.UtcNow
                || (voucher.ExpiresAt != null && Convert.ToDateTime(voucher.ExpiresAt) < DateTime.UtcNow))
                return null;

            var remaining = Convert.ToDecimal(voucher.RemainingValue);
            if (remaining <= 0) return null;
            return new GiftVoucherApplication
            {
                GiftVoucherId = Convert.ToInt32(voucher.GiftVoucherId),
                Code = Convert.ToString(voucher.Code) ?? code,
                Amount = Math.Round(Math.Min(remaining, orderAmount), 2, MidpointRounding.AwayFromZero)
            };
        }

        private FreeGiftApplication? ResolveFreeGift(int? freeGiftId, decimal subtotal)
        {
            if (!freeGiftId.HasValue) return null;
            var gift = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT fg.FreeGiftId, fg.ProductId, fg.VariantId,
       COALESCE(NULLIF(fg.DisplayName, ''),
           CASE WHEN fg.VariantId IS NULL THEN p.Name
                ELSE CONCAT(p.Name, ' - ', COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''), pv.Packaging_Name)) END
       ) AS DisplayName,
       p.HasVariants,
       CASE WHEN fg.VariantId IS NULL THEN p.Quantity ELSE pv.Quantity END AS AvailableQuantity
FROM FreeGifts fg
INNER JOIN Products p ON p.Product_Id = fg.ProductId
LEFT JOIN ProductVariants pv ON pv.Variant_Id = fg.VariantId AND pv.Product_Id = fg.ProductId AND pv.IsActive = 1
WHERE fg.FreeGiftId = @FreeGiftId
  AND fg.IsActive = 1
  AND fg.MinimumOrderAmount <= @Subtotal
  AND (fg.ValidFrom IS NULL OR fg.ValidFrom <= GETDATE())
  AND (fg.ValidUntil IS NULL OR fg.ValidUntil >= GETDATE())", new { FreeGiftId = freeGiftId.Value, Subtotal = subtotal });

            if (gift == null || Convert.ToInt32(gift.AvailableQuantity ?? 0) <= 0) return null;
            if (gift.VariantId == null && ToBoolean(gift.HasVariants)) return null;
            return new FreeGiftApplication
            {
                FreeGiftId = Convert.ToInt32(gift.FreeGiftId),
                ProductId = Convert.ToInt32(gift.ProductId),
                VariantId = gift.VariantId == null ? null : Convert.ToInt32(gift.VariantId),
                DisplayName = Convert.ToString(gift.DisplayName) ?? "Free gift"
            };
        }

        private sealed class PromotionApplication
        {
            public int PromoCodeId { get; init; }
            public string Code { get; init; } = string.Empty;
            public decimal DiscountAmount { get; init; }
        }

        private sealed class FreeGiftApplication
        {
            public int FreeGiftId { get; init; }
            public int ProductId { get; init; }
            public int? VariantId { get; init; }
            public string DisplayName { get; init; } = string.Empty;
        }

        private sealed class GiftVoucherApplication
        {
            public int GiftVoucherId { get; init; }
            public string Code { get; init; } = string.Empty;
            public decimal Amount { get; init; }
        }

        private static decimal CalculateDeliveryFee(decimal subtotal, string paymentMethod, ShippingSettingsDto settings)
        {
            if (subtotal >= settings.FreeDeliveryThreshold)
                return 0m;

            decimal cashOnDeliveryFee = paymentMethod == "home_delivery"
                ? settings.CashOnDeliveryFee
                : 0m;

            return settings.FlatDeliveryFee + cashOnDeliveryFee;
        }

        private ShippingSettingsDto LoadShippingSettings()
        {
            try
            {
                return _dapper.LoadDataSingleOrDefault<ShippingSettingsDto>(@"
SELECT FlatDeliveryFee, CashOnDeliveryFee, FreeDeliveryThreshold,
       HomeDeliveryEnabled, CardPaymentEnabled
FROM ShippingSettings WHERE ShippingSettingsId = 1") ?? new ShippingSettingsDto();
            }
            catch
            {
                // Backward-compatible defaults until the additive migration is applied.
                return new ShippingSettingsDto();
            }
        }

        private static bool ToBoolean(object? value)
        {
            if (value == null)
                return false;

            try
            {
                return Convert.ToBoolean(value, CultureInfo.InvariantCulture);
            }
            catch
            {
                return false;
            }
        }

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

        // STEP 3 & 4: New method to send order confirmation after payment
        private Task<bool> SendOrderConfirmationEmail(int orderId, bool isPaymentConfirmed = true, string? overrideRecipient = null, bool sendSellerNotification = true)
        {
            try
            {
                string getOrderDetailsSql = @"
SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Total_Amount, o.Delivery_Fee,
       o.Subtotal AS Order_Subtotal, o.Points_Discount, o.Promo_Code, o.Promo_Discount,
       o.Gift_Voucher_Code, o.Gift_Voucher_Amount,
       (SELECT TOP 1 DisplayName FROM OrderFreeGifts fg WHERE fg.OrderId = o.Order_Id) AS FreeGiftName,
       o.Payment_Method, o.Order_Note,
       o.Billing_FullName, o.Billing_Address, o.Billing_PostCode, o.Billing_City,
       o.Billing_Country, o.Billing_Phone, o.Billing_Email,
       o.Delivery_IsDifferent, o.Delivery_FullName, o.Delivery_Address, o.Delivery_PostCode,
       o.Delivery_City, o.Delivery_Country, o.Delivery_Phone,
       COALESCE(u.User_Email, o.Billing_Email) AS Customer_Email,
       COALESCE(u.User_FullName, o.Billing_FullName) AS Customer_FullName,
       COALESCE(u.User_Phone, o.Billing_Phone) AS Customer_Phone,
       oi.Product_Id, oi.Product_Name, oi.Quantity, oi.Product_Price, oi.Subtotal AS Item_Subtotal,
       oi.Variant_Id, oi.Variant_Name, oi.Variant_Packaging,
       pv.SKU AS Variant_SKU
FROM Orders o
LEFT JOIN [User] u ON o.User_Id = u.User_Id
INNER JOIN OrderItems oi ON o.Order_Id = oi.Order_Id
LEFT JOIN ProductVariants pv ON oi.Variant_Id = pv.Variant_Id
WHERE o.Order_Id = @OrderId";

                var orderData = _dapper.LoadData<dynamic>(getOrderDetailsSql, new { OrderId = orderId }).ToList();

                if (orderData == null || !orderData.Any()) return Task.FromResult(false);

                var firstItem = orderData.First();
                string userEmail = Convert.ToString(overrideRecipient ?? firstItem.Customer_Email) ?? string.Empty;
                string userFullName = Convert.ToString(firstItem.Customer_FullName) ?? "Customer";
                string orderNumber = Convert.ToString(firstItem.Order_Number) ?? orderId.ToString();
                decimal totalAmount = firstItem.Total_Amount;
                decimal deliveryFee = firstItem.Delivery_Fee;
                decimal subtotal = firstItem.Order_Subtotal;
                decimal pointsDiscount = firstItem.Points_Discount ?? 0;
                decimal promoDiscount = firstItem.Promo_Discount ?? 0;
                decimal giftVoucherAmount = firstItem.Gift_Voucher_Amount ?? 0;
                string promoCode = Convert.ToString(firstItem.Promo_Code) ?? "";
                string freeGiftName = Convert.ToString(firstItem.FreeGiftName) ?? "";
                DateTime orderDate = firstItem.Order_Date;
                var hasCustomerEmail = !string.IsNullOrWhiteSpace(userEmail);
                string customerPhone = Convert.ToString(firstItem.Customer_Phone) ?? "";
                string billingAddress = Convert.ToString(firstItem.Billing_Address) ?? "";
                string billingPostCode = Convert.ToString(firstItem.Billing_PostCode) ?? "";
                string billingCity = Convert.ToString(firstItem.Billing_City) ?? "";
                var hasDifferentDelivery = ToBoolean(firstItem.Delivery_IsDifferent);
                string shippingName = hasDifferentDelivery
                    ? Convert.ToString(firstItem.Delivery_FullName) ?? userFullName
                    : Convert.ToString(firstItem.Billing_FullName) ?? userFullName;
                string shippingAddress = hasDifferentDelivery
                    ? Convert.ToString(firstItem.Delivery_Address) ?? billingAddress
                    : billingAddress;
                string shippingPostCode = hasDifferentDelivery
                    ? Convert.ToString(firstItem.Delivery_PostCode) ?? billingPostCode
                    : billingPostCode;
                string shippingCity = hasDifferentDelivery
                    ? Convert.ToString(firstItem.Delivery_City) ?? billingCity
                    : billingCity;
                string orderNote = Convert.ToString(firstItem.Order_Note) ?? "";

                // Build email-safe products table
                StringBuilder productsHtml = new StringBuilder();
                productsHtml.AppendLine("<table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse: collapse; margin: 0;'>");
                productsHtml.AppendLine("<thead><tr style='background-color: #f4f7fa;'>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align:left;'>SKU</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align:left;'>Product</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: center;'>Qty</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: right;'>Price</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: right;'>Total</th>");
                productsHtml.AppendLine("</tr></thead><tbody>");

                foreach (var item in orderData)
                {
                    string sku = Convert.ToString(item.Variant_SKU) ?? $"#{item.Variant_Id ?? item.Product_Id}";
                    string displayName = item.Product_Name;
                    if (!string.IsNullOrEmpty(item.Variant_Name))
                        displayName += $" - {item.Variant_Name}";
                    if (!string.IsNullOrEmpty(item.Variant_Packaging))
                        displayName += $" ({item.Variant_Packaging})";

                    sku = HtmlEncode(sku);
                    displayName = System.Net.WebUtility.HtmlEncode(displayName);

                    productsHtml.AppendLine($@"
            <tr>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px;'>{sku}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px;'>{displayName}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:center;'>{item.Quantity}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:right;'>MKD {item.Product_Price:F2}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:right; font-weight:700;'>MKD {item.Item_Subtotal:F2}</td>
            </tr>");
                }
                productsHtml.AppendLine("</tbody></table>");

                var issuedVouchers = _dapper.LoadData<dynamic>(@"
SELECT Code, InitialValue, RemainingValue, ExpiresAt
FROM GiftVouchers
WHERE PurchasedOrderId = @OrderId
ORDER BY GiftVoucherId", new { OrderId = orderId }).ToList();
                var voucherHtml = new StringBuilder();
                if (issuedVouchers.Count > 0)
                {
                    voucherHtml.Append("<tr><td style='padding:0 28px 24px 28px;'><div style='border:2px solid #FDC700; background:#fffbea; padding:18px;'><h2 style='margin:0 0 10px;font-size:18px;'>Your gift voucher codes</h2>");
                    foreach (var voucher in issuedVouchers)
                    {
                        var expiry = voucher.ExpiresAt == null ? "No expiry configured" : $"Expires {Convert.ToDateTime(voucher.ExpiresAt):yyyy-MM-dd}";
                        voucherHtml.Append($"<p style='margin:8px 0;font-size:15px;'><strong>{HtmlEncode(Convert.ToString(voucher.Code) ?? string.Empty)}</strong> — MKD {Convert.ToDecimal(voucher.InitialValue):F2}<br><span style='color:#667085;font-size:12px;'>{expiry}</span></p>");
                    }
                    voucherHtml.Append("<p style='margin:12px 0 0;color:#536173;font-size:12px;'>Keep these codes private. They can be partially redeemed until their balance reaches zero.</p></div></td></tr>");
                }

                // Different email content based on payment method
                string statusTitle;
                string statusLabel;
                string statusDescription;
                string paymentLine;
                string emailSubject;

                if (isPaymentConfirmed)
                {
                    statusTitle = "Payment confirmed";
                    statusLabel = "Paid online";
                    statusDescription = $"Your payment for order #{HtmlEncode(orderNumber)} was accepted. We are preparing your products and will update you when the order moves forward.";
                    paymentLine = "Paid online";
                    emailSubject = $"Payment Confirmed - #{orderNumber} | Proteini.mk";
                }
                else
                {
                    statusTitle = "Order received";
                    statusLabel = "Pay on delivery";
                    statusDescription = "Your order has been received and will be prepared shortly. Payment will be collected when ELS - Eko Logistic Service MK delivers your package.";
                    paymentLine = "Cash on delivery";
                    emailSubject = $"Order Received - #{orderNumber} | Proteini.mk";
                }

                string emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>{HtmlEncode(emailSubject)}</title>
</head>
<body style='margin:0; padding:0; background:#f3f6f8; font-family:Arial, Helvetica, sans-serif; color:#111827;'>
    <div style='display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;'>{HtmlEncode(statusTitle)} for order #{HtmlEncode(orderNumber)} from Proteini.mk.</div>
    <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; background:#f3f6f8; padding:24px 12px;'>
        <tr>
            <td align='center'>
                <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; max-width:680px; border-collapse:collapse; background:#ffffff; border:1px solid #dde5ed;'>
                    <tr>
                        <td style='background:#ffffff; padding:24px 28px; border-bottom:4px solid #FDC700;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%;'>
                                <tr>
                                    <td>{GetEmailLogoHtml()}</td>
                                    <td align='right'>
                                        <span style='display:inline-block; padding:7px 12px; background:#2096D8; color:#ffffff; font-size:12px; line-height:14px; font-weight:700; text-transform:uppercase;'>{HtmlEncode(statusLabel)}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:32px 28px 18px 28px;'>
                            <h1 style='margin:0 0 10px 0; color:#111827; font-size:28px; line-height:34px; font-weight:800;'>{HtmlEncode(statusTitle)}</h1>
                            <p style='margin:0; color:#536173; font-size:15px; line-height:24px;'>Hi {HtmlEncode(userFullName)}, {HtmlEncode(statusDescription)}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 22px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse; background:#ffffff; border:1px solid #e3e9ef;'>
                                <tr>
                                    <td style='padding:16px; width:33.33%; vertical-align:top; border-right:1px solid #e3e9ef;'>
                                        <div style='color:#111827; font-size:13px; line-height:18px; font-weight:800; text-transform:uppercase; margin-bottom:12px;'>Order details</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Order number</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>#{HtmlEncode(orderNumber)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Order date</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{orderDate:MMMM dd, yyyy HH:mm}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Payment</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(paymentLine)}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%; vertical-align:top; border-right:1px solid #e3e9ef;'>
                                        <div style='color:#111827; font-size:13px; line-height:18px; font-weight:800; text-transform:uppercase; margin-bottom:12px;'>Buyer</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Name</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{HtmlEncode(userFullName)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Phone</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{HtmlEncode(customerPhone)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Email</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(userEmail)}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%; vertical-align:top;'>
                                        <div style='color:#111827; font-size:13px; line-height:18px; font-weight:800; text-transform:uppercase; margin-bottom:12px;'>Delivery address</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Name</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{HtmlEncode(shippingName)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Address</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{HtmlEncode(shippingAddress)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>City</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700; margin-bottom:10px;'>{HtmlEncode(shippingCity)}</div>
                                        <div style='color:#667085; font-size:12px; line-height:16px;'>Postal code</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(shippingPostCode)}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 24px 28px;'>
                            <h2 style='margin:0 0 12px 0; color:#111827; font-size:18px; line-height:24px;'>Items ordered</h2>
                            {productsHtml}
                        </td>
                    </tr>
                    {voucherHtml}
                    <tr>
                        <td style='padding:0 28px 26px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse;'>
                                <tr>
                                    <td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Subtotal</td>
                                    <td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>MKD {subtotal:F2}</td>
                                </tr>
                                <tr>
                                    <td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Delivery</td>
                                    <td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>MKD {deliveryFee:F2}</td>
                                </tr>
                                <tr>
                                    <td colspan='2' style='padding:3px 0 8px 0; color:#667085; font-size:12px; line-height:18px;'>Delivery is handled by ELS - Eko Logistic Service MK.</td>
                                </tr>
                                {(promoDiscount > 0 ? $"<tr><td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Promotion {HtmlEncode(promoCode)}</td><td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>- MKD {promoDiscount:F2}</td></tr>" : "")}
                                {(giftVoucherAmount > 0 ? $"<tr><td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Gift voucher</td><td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>- MKD {giftVoucherAmount:F2}</td></tr>" : "")}
                                {(pointsDiscount > 0 ? $"<tr><td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Points discount</td><td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>- MKD {pointsDiscount:F2}</td></tr>" : "")}
                                {(!string.IsNullOrWhiteSpace(freeGiftName) ? $"<tr><td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Free gift</td><td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>{HtmlEncode(freeGiftName)}</td></tr>" : "")}
                                <tr>
                                    <td style='padding:14px 0 0 0; border-top:1px solid #dde5ed; color:#111827; font-size:16px; line-height:22px; font-weight:800;'>Total amount</td>
                                    <td align='right' style='padding:14px 0 0 0; border-top:1px solid #dde5ed; color:#111827; font-size:18px; line-height:24px; font-weight:800;'>MKD {totalAmount:F2}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 34px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse; margin:0 0 20px 0;'>
                                <tr>
                                    <td style='width:50%; vertical-align:top; padding:0 14px 0 0;'>
                                        <h3 style='margin:0 0 8px 0; color:#111827; font-size:15px; line-height:21px; font-weight:800;'>Note</h3>
                                        <div style='min-height:44px; padding:12px; border:1px dashed #d6dde5; color:#536173; font-size:13px; line-height:20px;'>{(string.IsNullOrWhiteSpace(orderNote) ? "-" : HtmlEncode(orderNote))}</div>
                                    </td>
                                    <td style='width:50%; vertical-align:top; padding:0 0 0 14px;'>
                                        <h3 style='margin:0 0 8px 0; color:#111827; font-size:15px; line-height:21px; font-weight:800;'>Delivery method</h3>
                                        <div style='min-height:44px; padding:12px; border:1px dashed #d6dde5; color:#536173; font-size:13px; line-height:20px;'>ELS - Eko Logistic Service MK</div>
                                    </td>
                                </tr>
                            </table>
                            <a href='https://proteini.mk/order-confirmation/{orderId}' target='_blank' style='display:inline-block; background:#2096D8; color:#ffffff; padding:13px 20px; text-decoration:none; font-size:14px; line-height:18px; font-weight:700;'>View order details</a>
                            <p style='margin:20px 0 0 0; color:#536173; font-size:14px; line-height:22px;'>Thank you for choosing Proteini.mk. We appreciate your order and will handle it with care.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='background:#f8fafc; padding:20px 28px; color:#667085; font-size:12px; line-height:18px; text-align:center; border-top:1px solid #e3e9ef;'>
                            Proteini.mk &copy; {DateTime.Now.Year}. This is an automated order email.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                var customerEmailSent = false;
                if (hasCustomerEmail)
                {
                    var mm = CreateMailModel(new[] { userEmail }, emailSubject, emailBody);
                    customerEmailSent = SendEmail(mm);
                    Console.WriteLine(customerEmailSent
                        ? $"Order confirmation email sent to {userEmail}"
                        : $"Order confirmation email failed for {userEmail}");
                }
                else
                {
                    Console.WriteLine($"Order confirmation email skipped because order {orderId} does not have a customer email.");
                }

                // Send seller notification
                var sellerNotificationSent = false;
                if (sendSellerNotification)
                {
                    sellerNotificationSent = SendSellerNotificationAfterPayment(
                        orderId,
                        userFullName,
                        hasCustomerEmail ? userEmail : "N/A",
                        orderNumber,
                        totalAmount,
                        deliveryFee,
                        subtotal,
                        orderDate,
                        orderData,
                        isPaymentConfirmed);
                }

                Console.WriteLine($"Order email summary. OrderId={orderId}, CustomerEmailSent={customerEmailSent}, SellerNotificationSent={sellerNotificationSent}");

                return Task.FromResult(customerEmailSent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send order confirmation email: {ex.Message}");
                return Task.FromResult(false);
            }
        }

        // Seller notification after payment
        private bool SendSellerNotificationAfterPayment(int orderId, string customerName, string customerEmail, string orderNumber, decimal totalAmount, decimal deliveryFee, decimal subtotal, DateTime orderDate, dynamic orderData, bool isPaymentConfirmed)
        {
            try
            {
                StringBuilder productsHtml = new StringBuilder();
                productsHtml.AppendLine("<table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse: collapse;'>");
                productsHtml.AppendLine("<thead><tr style='background-color: #f4f7fa;'>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: left;'>Product</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: center;'>Qty</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: right;'>Price</th>");
                productsHtml.AppendLine("<th style='padding: 12px; border-bottom: 1px solid #dde5ed; color:#4a5565; font-size:12px; line-height:16px; text-transform:uppercase; text-align: right;'>Total</th>");
                productsHtml.AppendLine("</tr></thead><tbody>");

                foreach (var item in orderData)
                {
                    string displayName = item.Product_Name;
                    if (!string.IsNullOrEmpty(item.Variant_Name))
                        displayName += $" - {item.Variant_Name}";
                    if (!string.IsNullOrEmpty(item.Variant_Packaging))
                        displayName += $" ({item.Variant_Packaging})";

                    displayName = HtmlEncode(displayName);

                    productsHtml.AppendLine($@"
            <tr>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px;'>{displayName}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:center;'>{item.Quantity}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:right;'>MKD {item.Product_Price:F2}</td>
                <td style='padding: 14px 12px; border-bottom: 1px solid #edf1f5; color:#111827; font-size:14px; line-height:20px; text-align:right; font-weight:700;'>MKD {item.Item_Subtotal:F2}</td>
            </tr>");
                }
                productsHtml.AppendLine("</tbody></table>");

                // Get phone from order
                string getPhoneSql = "SELECT Billing_Phone FROM Orders WHERE Order_Id = @OrderId";
                var phone = _dapper.LoadDataSingleOrDefault<string>(getPhoneSql, new { OrderId = orderId });
                var notificationTitle = isPaymentConfirmed ? "Paid order received" : "Cash on delivery order received";
                var paymentStatusText = isPaymentConfirmed ? "Paid online" : "Cash on delivery";
                var subjectPrefix = isPaymentConfirmed ? "PAID ORDER" : "COD ORDER";
                var badgeColor = isPaymentConfirmed ? "#16a34a" : "#2096D8";

                string emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>{HtmlEncode(subjectPrefix)} #{HtmlEncode(orderNumber)}</title>
</head>
<body style='margin:0; padding:0; background:#eef3f7; font-family:Arial, Helvetica, sans-serif; color:#111827;'>
    <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; background:#eef3f7; padding:24px 12px;'>
        <tr>
            <td align='center'>
                <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; max-width:760px; border-collapse:collapse; background:#ffffff; border:1px solid #dde5ed;'>
                    <tr>
                        <td style='background:#ffffff; padding:24px 28px; border-bottom:4px solid #FDC700;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%;'>
                                <tr>
                                    <td>
                                        {GetEmailLogoHtml()}
                                        <div style='margin-top:8px; color:#536173; font-size:13px; line-height:18px;'>Automated order notification</div>
                                    </td>
                                    <td align='right'>
                                        <span style='display:inline-block; padding:8px 12px; background:{badgeColor}; color:#ffffff; font-size:12px; line-height:14px; font-weight:800; text-transform:uppercase;'>{HtmlEncode(subjectPrefix)}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:28px;'>
                            <h1 style='margin:0 0 8px 0; color:#111827; font-size:24px; line-height:30px; font-weight:800;'>{HtmlEncode(notificationTitle)}</h1>
                            <p style='margin:0; color:#536173; font-size:14px; line-height:22px;'>Order #{HtmlEncode(orderNumber)} needs review and fulfillment.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 22px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse; background:#f8fafc; border:1px solid #e3e9ef;'>
                                <tr>
                                    <td style='padding:16px; width:33.33%; border-bottom:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Customer</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(customerName)}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%; border-bottom:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Email</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(customerEmail)}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%; border-bottom:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Phone</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(phone ?? "N/A")}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding:16px; width:33.33%;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Order date</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{orderDate:MMMM dd, yyyy HH:mm}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Payment</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(paymentStatusText)}</div>
                                    </td>
                                    <td style='padding:16px; width:33.33%;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Total</div>
                                        <div style='color:#2096D8; font-size:18px; line-height:24px; font-weight:800;'>MKD {totalAmount:F2}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 24px 28px;'>
                            <h2 style='margin:0 0 12px 0; color:#111827; font-size:18px; line-height:24px;'>Order items</h2>
                            {productsHtml}
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 30px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse;'>
                                <tr>
                                    <td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Subtotal</td>
                                    <td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>MKD {subtotal:F2}</td>
                                </tr>
                                <tr>
                                    <td style='padding:7px 0; color:#536173; font-size:14px; line-height:20px;'>Delivery fee</td>
                                    <td align='right' style='padding:7px 0; color:#111827; font-size:14px; line-height:20px;'>MKD {deliveryFee:F2}</td>
                                </tr>
                                <tr>
                                    <td style='padding:14px 0 0 0; border-top:1px solid #dde5ed; color:#111827; font-size:16px; line-height:22px; font-weight:800;'>Total amount</td>
                                    <td align='right' style='padding:14px 0 0 0; border-top:1px solid #dde5ed; color:#111827; font-size:18px; line-height:24px; font-weight:800;'>MKD {totalAmount:F2}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='background:#f8fafc; padding:18px 28px; color:#667085; font-size:12px; line-height:18px; text-align:center; border-top:1px solid #e3e9ef;'>
                            Proteini.mk automated order notification &copy; {DateTime.Now.Year}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                var sellerRecipients = GetSellerNotificationRecipients();
                var mm = CreateMailModel(sellerRecipients, $"{subjectPrefix} #{orderNumber} - {customerName}", emailBody);

                var sellerEmailSent = SendEmail(mm);
                Console.WriteLine(sellerEmailSent
                    ? $"Seller notification sent for {subjectPrefix.ToLowerInvariant()} #{orderNumber}"
                    : $"Seller notification failed for {subjectPrefix.ToLowerInvariant()} #{orderNumber}");
                return sellerEmailSent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send seller notification: {ex.Message}");
                return false;
            }
        }

        [AllowAnonymous]
        [IgnoreAntiforgeryToken]
        [HttpPost("cpay-webhook")]
        public async Task<IActionResult> HandleCPayWebhook()
        {
            try
            {
                var callbackParams = await ReadPaymentCallbackParametersAsync();
                var orderId = GetPaymentOrderId(callbackParams);
                var paymentStatus = GetPaymentStatus(callbackParams);
                var transactionId = GetFirstValue(callbackParams, "transaction_id", "TransactionId", "cPayPaymentRef", "PaymentRef");

                Console.WriteLine($"Received cPay webhook: OrderId={orderId}, Status={paymentStatus}");

                if (orderId <= 0)
                    return BadRequest(new { message = "Missing order id" });

                if (!HasCpayChecksum(callbackParams) || !_cpayService.ProcessCallback(callbackParams))
                {
                    Console.WriteLine($"Invalid or missing cPay checksum for order {orderId}");
                    return BadRequest(new { message = "Invalid signature" });
                }

                if (IsSuccessfulPaymentStatus(paymentStatus))
                {
                    var result = await CompletePaidOrderAsync(orderId, transactionId);
                    return Ok(new { status = result.Success, result.EmailSent, result.Message });
                }

                MarkOrderPaymentFailed(orderId, transactionId);
                return Ok("OK");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing cPay webhook: {ex.Message}");
                return BadRequest(new { message = "Error processing callback" });
            }
        }

        [AllowAnonymous]
        [IgnoreAntiforgeryToken]
        [HttpGet("cpay-return/{result}")]
        [HttpPost("cpay-return/{result}")]
        public async Task<IActionResult> HandleCPayReturn(string result)
        {
            var frontendUrl = GetFrontendUrl();
            try
            {
                var callbackParams = await ReadPaymentCallbackParametersAsync();
                var orderId = GetPaymentOrderId(callbackParams);
                var transactionId = GetFirstValue(callbackParams, "transaction_id", "TransactionId", "cPayPaymentRef", "PaymentRef");

                if (orderId <= 0)
                    return Redirect($"{frontendUrl}/payment/failure?error=missing-order-id");

                if (string.Equals(result, "success", StringComparison.OrdinalIgnoreCase))
                {
                    if (!HasCpayChecksum(callbackParams) || !_cpayService.ProcessCallback(callbackParams))
                    {
                        Console.WriteLine($"cPay success return could not be verified. OrderId={orderId}");
                        return Redirect($"{frontendUrl}/payment/failure?orderId={orderId}&error=payment-verification-failed");
                    }

                    var completion = await CompletePaidOrderAsync(orderId, transactionId);
                    return Redirect($"{frontendUrl}/payment/success?orderId={orderId}&transaction_id={Uri.EscapeDataString(transactionId ?? string.Empty)}&emailSent={completion.EmailSent.ToString().ToLowerInvariant()}");
                }

                MarkOrderPaymentFailed(orderId, transactionId);
                return Redirect($"{frontendUrl}/payment/failure?orderId={orderId}&error=payment-failed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing cPay return: {ex.Message}");
                return Redirect($"{frontendUrl}/payment/failure?error=payment-processing-error");
            }
        }

        private async Task<PaymentCompletionResult> CompletePaidOrderAsync(
            int orderId,
            string? transactionId,
            bool sendEmail = true,
            string completedOrderStatus = "paid")
        {
            var completion = _dapper.ExecuteInTransaction((connection, transaction) =>
            {
                var lockedOrder = connection.QuerySingleOrDefault<dynamic>(@"
SELECT Order_Id, Payment_Status, Order_Status, Subtotal, User_Id
FROM Orders WITH (UPDLOCK, HOLDLOCK)
WHERE Order_Id = @OrderId;", new
                {
                    OrderId = orderId
                }, transaction);

                if (lockedOrder == null)
                    return (Found: false, NewlyCompleted: false);

                if (string.Equals(
                    Convert.ToString(lockedOrder.Payment_Status),
                    "completed",
                    StringComparison.OrdinalIgnoreCase))
                {
                    if (string.Equals(completedOrderStatus, "completed", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(Convert.ToString(lockedOrder.Order_Status), "completed", StringComparison.OrdinalIgnoreCase))
                    {
                        connection.Execute(@"
UPDATE Orders
SET Order_Status = 'completed', Updated_At = GETDATE()
WHERE Order_Id = @OrderId", new { OrderId = orderId }, transaction);
                    }
                    return (Found: true, NewlyCompleted: false);
                }

                connection.Execute(@"
UPDATE Orders
SET Payment_Status = 'completed',
    Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
    Order_Status = @OrderStatus,
    Updated_At = GETDATE()
WHERE Order_Id = @OrderId;", new
                {
                    TransactionId = string.IsNullOrWhiteSpace(transactionId) ? null : transactionId,
                    OrderStatus = completedOrderStatus,
                    OrderId = orderId
                }, transaction);

                connection.Execute(@"
UPDATE GiftVoucherRedemptions
SET Status = 'redeemed', CompletedAt = SYSUTCDATETIME()
WHERE OrderId = @OrderId AND Status = 'reserved';", new { OrderId = orderId }, transaction);

                var purchasedVoucherItems = connection.Query<dynamic>(@"
SELECT oi.OrderItem_Id, oi.Product_Price, oi.Quantity, o.Billing_Email
FROM OrderItems oi
INNER JOIN Products p ON p.Product_Id = oi.Product_Id AND p.IsGiftVoucher = 1
INNER JOIN Orders o ON o.Order_Id = oi.Order_Id
WHERE oi.Order_Id = @OrderId", new { OrderId = orderId }, transaction).ToList();

                foreach (var item in purchasedVoucherItems)
                {
                    var quantity = Convert.ToInt32(item.Quantity);
                    var value = Convert.ToDecimal(item.Product_Price);
                    for (var unit = 1; unit <= quantity; unit++)
                    {
                        var code = $"PTV-{Convert.ToHexString(RandomNumberGenerator.GetBytes(10))}";
                        connection.Execute(@"
IF NOT EXISTS (
    SELECT 1 FROM GiftVouchers WITH (UPDLOCK, HOLDLOCK)
    WHERE PurchasedOrderItemId = @OrderItemId AND UnitSequence = @UnitSequence
)
BEGIN
    INSERT INTO GiftVouchers
        (Code, InitialValue, RemainingValue, Currency, Status, PurchasedOrderId,
         PurchasedOrderItemId, UnitSequence, PurchaserEmail, RecipientEmail,
         ValidFrom, ExpiresAt, CreatedAt, UpdatedAt)
    VALUES
        (@Code, @Value, @Value, 'MKD', 'active', @OrderId,
         @OrderItemId, @UnitSequence, @Email, @Email,
         SYSUTCDATETIME(), NULL, SYSUTCDATETIME(), SYSUTCDATETIME());
END", new
                        {
                            Code = code,
                            Value = value,
                            OrderId = orderId,
                            OrderItemId = Convert.ToInt32(item.OrderItem_Id),
                            UnitSequence = unit,
                            Email = Convert.ToString(item.Billing_Email)
                        }, transaction);
                    }
                }

                object? rawUserId = lockedOrder.User_Id;
                var userId = rawUserId == null || rawUserId is DBNull
                    ? (int?)null
                    : Convert.ToInt32(rawUserId);

                if (userId.HasValue)
                {
                    decimal subtotal = Convert.ToDecimal(lockedOrder.Subtotal);
                    var pointsToAdd = Math.Floor(subtotal * 0.02m);
                    if (pointsToAdd > 0)
                    {
                        connection.Execute(@"
IF NOT EXISTS (
    SELECT 1 FROM LoyaltyPoints WITH (UPDLOCK, HOLDLOCK)
    WHERE UserId = @UserId
      AND PointsType = 'earned'
      AND SourceType = 'order'
      AND SourceId = @SourceId
)
BEGIN
    INSERT INTO LoyaltyPoints
        (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate, ExpiryDate)
    VALUES
        (@UserId, @Points, 'earned', 'order', @SourceId, @Description, GETDATE(), DATEADD(MONTH, 12, GETDATE()));
END", new
                        {
                            UserId = userId.Value,
                            Points = pointsToAdd,
                            SourceId = orderId,
                            Description = $"Earned {pointsToAdd} points from order #{orderId}"
                        }, transaction);
                    }
                }

                return (Found: true, NewlyCompleted: true);
            });

            if (!completion.Found)
                return new PaymentCompletionResult(false, false, "Order not found");

            if (!completion.NewlyCompleted)
                return new PaymentCompletionResult(true, false, "Payment was already completed");

            if (!sendEmail)
                return new PaymentCompletionResult(true, false, "Payment completed without email notification");

            var emailSent = await SendOrderConfirmationEmail(orderId, true);
            return new PaymentCompletionResult(true, emailSent, emailSent ? "Payment completed and email sent" : "Payment completed but email failed");
        }

        private void MarkOrderPaymentFailed(int orderId, string? transactionId)
        {
            _dapper.ExecuteInTransaction((connection, transaction) =>
            {
                ReleaseGiftVoucherReservation(connection, transaction, orderId);
                connection.Execute(@"
UPDATE Orders 
SET Payment_Status = 'failed', 
    Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
    Updated_At = GETDATE()
WHERE Order_Id = @OrderId", new
                {
                    TransactionId = string.IsNullOrWhiteSpace(transactionId) ? null : transactionId,
                    OrderId = orderId
                }, transaction);
                return true;
            });
        }

        private static void ReleaseGiftVoucherReservation(
            IDbConnection connection,
            IDbTransaction transaction,
            int orderId)
        {
            var redemption = connection.QuerySingleOrDefault<dynamic>(@"
SELECT GiftVoucherRedemptionId, GiftVoucherId, Amount
FROM GiftVoucherRedemptions WITH (UPDLOCK, HOLDLOCK)
WHERE OrderId = @OrderId AND Status = 'reserved'", new { OrderId = orderId }, transaction);
            if (redemption == null) return;

            connection.Execute(@"
UPDATE GiftVouchers
SET RemainingValue = RemainingValue + @Amount,
    Status = CASE WHEN Status = 'disabled' THEN 'disabled' ELSE 'active' END,
    UpdatedAt = SYSUTCDATETIME()
WHERE GiftVoucherId = @GiftVoucherId;

UPDATE GiftVoucherRedemptions
SET Status = 'released', ReleasedAt = SYSUTCDATETIME()
WHERE GiftVoucherRedemptionId = @RedemptionId AND Status = 'reserved';", new
            {
                Amount = Convert.ToDecimal(redemption.Amount),
                GiftVoucherId = Convert.ToInt32(redemption.GiftVoucherId),
                RedemptionId = Convert.ToInt32(redemption.GiftVoucherRedemptionId)
            }, transaction);
        }

        private void ReleaseGiftVoucherReservation(int orderId)
        {
            _dapper.ExecuteInTransaction((connection, transaction) =>
            {
                ReleaseGiftVoucherReservation(connection, transaction, orderId);
                return true;
            });
        }

        private async Task<Dictionary<string, string>> ReadPaymentCallbackParametersAsync()
        {
            var parameters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var item in Request.Query)
                parameters[item.Key] = item.Value.ToString();

            if (Request.HasFormContentType)
            {
                var form = await Request.ReadFormAsync();
                foreach (var item in form)
                    parameters[item.Key] = item.Value.ToString();
            }
            else if (Request.ContentType?.Contains("json", StringComparison.OrdinalIgnoreCase) == true)
            {
                using var document = await JsonDocument.ParseAsync(Request.Body);
                foreach (var property in document.RootElement.EnumerateObject())
                    parameters[property.Name] = property.Value.ToString();
            }

            return parameters;
        }

        private static int GetPaymentOrderId(IReadOnlyDictionary<string, string> parameters)
        {
            var orderId = GetFirstValue(parameters, "order_id", "OrderId", "orderId", "Details2");
            return int.TryParse(orderId, out var parsedOrderId) ? parsedOrderId : 0;
        }

        private static string? GetPaymentStatus(IReadOnlyDictionary<string, string> parameters)
        {
            return GetFirstValue(parameters, "payment_status", "PaymentStatus", "status", "Status");
        }

        private static string? GetFirstValue(IReadOnlyDictionary<string, string> parameters, params string[] keys)
        {
            foreach (var key in keys)
            {
                if (parameters.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
                    return value;
            }

            return null;
        }

        private static bool HasCpayChecksum(IReadOnlyDictionary<string, string> parameters)
        {
            return parameters.ContainsKey("ReturnCheckSum") && parameters.ContainsKey("ReturnCheckSumHeader");
        }

        private static bool IsSuccessfulPaymentStatus(string? paymentStatus)
        {
            return string.Equals(paymentStatus, "success", StringComparison.OrdinalIgnoreCase)
                || string.Equals(paymentStatus, "completed", StringComparison.OrdinalIgnoreCase)
                || string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase);
        }

        private string GetFrontendUrl()
        {
            return (_config["AppSettings:FrontendUrl"]
                ?? _config["AppSettings:PublicBaseUrl"]
                ?? _config["CPayConfiguration:SuccessUrl"]?.Replace("/payment/success", "", StringComparison.OrdinalIgnoreCase)
                ?? "https://proteini.mk").TrimEnd('/');
        }

        private record PaymentCompletionResult(bool Success, bool EmailSent, string Message);

        [Authorize(Policy = "SuperAdmin")]
        [HttpGet("cpay-debug-simple")]
        public IActionResult DebugCPayFormSimple()
        {
            int testOrderId = 1118;
            int amountInDeni = 2200;
            string orderNumber = "TEST-ORDER-001";
            string customerName = "Test Customer";
            string customerEmail = "test@example.com";

            var cpayHtml = _cpayService.GeneratePaymentForm(testOrderId, amountInDeni, orderNumber, customerName, customerEmail);
            return Content(cpayHtml, "text/html");
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpGet("cpay-debug")]
        public IActionResult DebugCPayForm()
        {
            string getLastOrderSql = "SELECT TOP 1 Order_Id, Total_Amount, Order_Number, User_Id FROM Orders ORDER BY Order_Id DESC";
            var lastOrder = _dapper.LoadDataSingleOrDefault<dynamic>(getLastOrderSql);

            if (lastOrder == null)
                return Content("No orders found. Please create an order first.", "text/plain");

            string getUserSql = "SELECT User_Email, User_FullName FROM [User] WHERE User_Id = @UserId";
            var user = _dapper.LoadDataSingleOrDefault<dynamic>(getUserSql, new { UserId = lastOrder.User_Id });

            string userEmail = user?.User_Email ?? "test@example.com";
            string userName = user?.User_FullName ?? "Test User";
            decimal totalAmountMKD = lastOrder.Total_Amount;
            int amountInDeni = (int)(totalAmountMKD * 100);

            var cpayHtml = _cpayService.GeneratePaymentForm(lastOrder.Order_Id, amountInDeni, lastOrder.Order_Number, userName, userEmail);
            return Content(cpayHtml, "text/plain");
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpPost("debug/send-order-confirmation-test")]
        public async Task<IActionResult> SendOrderConfirmationTest([FromQuery] string email = "proteinisi@gmail.com", [FromQuery] int? orderId = null, [FromQuery] bool paymentConfirmed = false)
        {
            var environmentName = _config["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (!string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase))
                return NotFound();

            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { status = false, message = "Email is required" });

            var targetOrderId = orderId ?? _dapper.LoadDataSingleOrDefault<int>("SELECT TOP 1 Order_Id FROM Orders ORDER BY Order_Id DESC");
            if (targetOrderId <= 0)
                return NotFound(new { status = false, message = "No order found to use for the test email" });

            var sent = await SendOrderConfirmationEmail(targetOrderId, paymentConfirmed, email, sendSellerNotification: false);

            return Ok(new
            {
                status = sent,
                orderId = targetOrderId,
                email,
                paymentConfirmed,
                message = sent ? "Test order confirmation email sent" : "Test order confirmation email failed"
            });
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpPost("debug/send-sample-order-confirmation-test")]
        public IActionResult SendSampleOrderConfirmationTest([FromQuery] string email = "proteinisi@gmail.com")
        {
            var environmentName = _config["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (!string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase))
                return NotFound();

            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { status = false, message = "Email is required" });

            var orderNumber = $"TEST-{DateTime.Now:yyyyMMdd-HHmmss}";
            var emailBody = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <div style='background-color: #28a745; color: white; padding: 20px; text-align: center;'>
            <h2>Order Received!</h2>
        </div>
        <div style='padding: 20px;'>
            <p>Dear Test Customer,</p>
            <p>This is a development test of the Proteini.mk order confirmation email.</p>
            <div style='background-color: #f5f5f5; padding: 15px; margin: 15px 0;'>
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> {orderNumber}</p>
                <p><strong>Order Date:</strong> {DateTime.Now:MMMM dd, yyyy HH:mm}</p>
                <p><strong>Subtotal:</strong> MKD 1000.00</p>
                <p><strong>Delivery Fee:</strong> MKD 150.00</p>
                <p><strong>Total Amount:</strong> MKD 1150.00</p>
                <p><strong>Payment Method:</strong> Cash on Delivery</p>
            </div>
            <table style='width:100%; border-collapse: collapse; margin: 15px 0;'>
                <thead>
                    <tr style='background-color: #f5f5f5;'>
                        <th style='padding: 10px; border: 1px solid #ddd;'>Product</th>
                        <th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>Qty</th>
                        <th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Price</th>
                        <th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style='padding: 10px; border: 1px solid #ddd;'>Sample Protein Product</td>
                        <td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>1</td>
                        <td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>MKD 1000.00</td>
                        <td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>MKD 1000.00</td>
                    </tr>
                </tbody>
            </table>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br/>Your Proteini.mk Team</p>
        </div>
    </div>
</body>
</html>";

            var sent = SendEmail(CreateMailModel(new[] { email }, $"Test Order Received - #{orderNumber}", emailBody, includeOrderCopyRecipients: false));

            return Ok(new
            {
                status = sent,
                email,
                orderNumber,
                message = sent ? "Sample order confirmation email sent" : "Sample order confirmation email failed"
            });
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpGet("admin/debug/email-config")]
        public IActionResult GetEmailConfigDebug()
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Diagnostics key or admin access required" });

            var mailSettings = _config.GetSection("MailSettings");
            var sellerRecipients = GetSellerNotificationRecipients();

            return Ok(new
            {
                status = true,
                environment = _config["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown",
                mailSettings = new
                {
                    hostConfigured = !string.IsNullOrWhiteSpace(mailSettings["host"]),
                    host = mailSettings["host"],
                    smtpPort = mailSettings.GetValue<int?>("SMTPPort") ?? 587,
                    enableSsl = mailSettings.GetValue<bool?>("EnableSsl") ?? true,
                    senderUsernameConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_username"]),
                    senderUsername = MaskEmail(mailSettings["sender_username"]),
                    senderEmailConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_email"]),
                    senderEmail = MaskEmail(mailSettings["sender_email"]),
                    senderName = mailSettings["sender_name"] ?? "Proteini.mk",
                    senderPasswordConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_password"]),
                    senderPasswordLength = mailSettings["sender_password"]?.Length ?? 0,
                    orderNotificationEmailConfigured = !string.IsNullOrWhiteSpace(mailSettings["OrderNotificationEmail"]),
                    sellerRecipientCount = sellerRecipients.Count,
                    sellerRecipients = sellerRecipients.Select(MaskEmail).ToList()
                }
            });
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpGet("admin/debug/order-email-data/{orderId}")]
        public IActionResult GetOrderEmailDataDebug(int orderId)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Diagnostics key or admin access required" });

            if (orderId <= 0)
                return BadRequest(new { status = false, message = "A valid orderId is required" });

            string getOrderSql = @"
SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Status,
       o.Payment_Method, o.Billing_Email, o.Billing_FullName, o.Billing_Phone,
       o.Subtotal, o.Delivery_Fee, o.Total_Amount, o.Points_Discount,
       COALESCE(u.User_Email, o.Billing_Email) AS Customer_Email,
       COALESCE(u.User_FullName, o.Billing_FullName) AS Customer_FullName
FROM Orders o
LEFT JOIN [User] u ON o.User_Id = u.User_Id
WHERE o.Order_Id = @OrderId";

            var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = orderId });
            if (order == null)
                return NotFound(new { status = false, message = $"Order {orderId} was not found" });

            string getItemsSql = @"
SELECT OrderItem_Id, Product_Id, Product_Name, Product_Price, Quantity, Subtotal,
       Variant_Id, Variant_Name, Variant_Packaging
FROM OrderItems
WHERE Order_Id = @OrderId
ORDER BY OrderItem_Id";

            var items = _dapper.LoadData<dynamic>(getItemsSql, new { OrderId = orderId }).ToList();

            return Ok(new
            {
                status = true,
                order = new
                {
                    order.Order_Id,
                    order.Order_Number,
                    order.Order_Date,
                    order.Order_Status,
                    order.Payment_Status,
                    order.Payment_Method,
                    customerEmailConfigured = !string.IsNullOrWhiteSpace((string?)order.Customer_Email),
                    customerEmail = MaskEmail((string?)order.Customer_Email),
                    customerFullName = order.Customer_FullName,
                    billingEmail = MaskEmail((string?)order.Billing_Email),
                    billingFullName = order.Billing_FullName,
                    billingPhoneConfigured = !string.IsNullOrWhiteSpace((string?)order.Billing_Phone),
                    order.Subtotal,
                    order.Delivery_Fee,
                    order.Total_Amount,
                    order.Points_Discount
                },
                itemCount = items.Count,
                items = items.Select(item => new
                {
                    item.OrderItem_Id,
                    item.Product_Id,
                    item.Product_Name,
                    item.Product_Price,
                    item.Quantity,
                    item.Subtotal,
                    item.Variant_Id,
                    item.Variant_Name,
                    item.Variant_Packaging
                }).ToList()
            });
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpPost("admin/debug/send-smtp-sample")]
        public IActionResult SendSmtpSampleDebug([FromQuery] string email)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Diagnostics key or admin access required" });

            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                return BadRequest(new { status = false, message = "A valid email is required" });

            var sampleNumber = $"SMTP-{DateTime.Now:yyyyMMdd-HHmmss}";
            var emailBody = $@"
<!DOCTYPE html>
<html>
<body style='font-family: Arial, sans-serif;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2>Proteini.mk SMTP diagnostic</h2>
        <p>This email confirms the backend reached the SMTP provider.</p>
        <p><strong>Test ID:</strong> {sampleNumber}</p>
        <p><strong>Sent at:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
    </div>
</body>
</html>";

            var result = SendEmailDetailed(CreateMailModel(new[] { email }, $"Proteini.mk SMTP Diagnostic - {sampleNumber}", emailBody, includeOrderCopyRecipients: false));

            return Ok(new
            {
                status = result.Success,
                sampleNumber,
                email = MaskEmail(email),
                result
            });
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpPost("admin/debug/send-order-confirmation/{orderId}")]
        public async Task<IActionResult> SendOrderConfirmationDebug(
            int orderId,
            [FromQuery] string? email = null,
            [FromQuery] bool paymentConfirmed = false,
            [FromQuery] bool sendSellerNotification = false)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Diagnostics key or admin access required" });

            if (orderId <= 0)
                return BadRequest(new { status = false, message = "A valid orderId is required" });

            if (!string.IsNullOrWhiteSpace(email) && !email.Contains("@"))
                return BadRequest(new { status = false, message = "A valid email is required" });

            var orderExists = _dapper.LoadDataSingleOrDefault<int>(
                "SELECT COUNT(1) FROM Orders WHERE Order_Id = @OrderId",
                new { OrderId = orderId });

            if (orderExists == 0)
                return NotFound(new { status = false, message = $"Order {orderId} was not found" });

            var sent = await SendOrderConfirmationEmail(
                orderId,
                paymentConfirmed,
                string.IsNullOrWhiteSpace(email) ? null : email,
                sendSellerNotification);

            return Ok(new
            {
                status = sent,
                orderId,
                overrideEmail = MaskEmail(email),
                paymentConfirmed,
                sendSellerNotification,
                message = sent ? "Order confirmation email sent" : "Order confirmation email failed. Check backend logs for detailed SMTP diagnostics."
            });
        }

        [HttpGet("Confirmation/{orderId}")]
        public IActionResult GetOrderConfirmation(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                string getOrderSql = @"
SELECT * FROM Orders 
WHERE Order_Id = @OrderId AND User_Id = @UserId";

                var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = orderId, UserId = userId });

                if (order == null)
                    return NotFound(new { message = "Order not found" });

                string getItemsSql = @"
SELECT * FROM OrderItems 
WHERE Order_Id = @OrderId";

                var items = _dapper.LoadData<dynamic>(getItemsSql, new { OrderId = orderId });

                return Ok(new
                {
                    status = true,
                    order = order,
                    items = items
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to get order: {ex.Message}" });
            }
        }

        [HttpPost("Cancel/{orderId}")]
        public IActionResult CancelOrder(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                string getOrderSql = @"
SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Status, o.Points_Redeemed,
       u.User_Email, u.User_FullName
FROM Orders o
INNER JOIN [User] u ON o.User_Id = u.User_Id
WHERE o.Order_Id = @OrderId AND o.User_Id = @UserId";

                var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = orderId, UserId = userId });

                if (order == null)
                    return NotFound(new { message = "Order not found" });

                if (order.Order_Status == "shipped" || order.Order_Status == "delivered" || order.Order_Status == "cancelled")
                {
                    return BadRequest(new { message = $"Order cannot be cancelled. Current status: {order.Order_Status}" });
                }

                DateTime orderDate = order.Order_Date;
                if (DateTime.Now > orderDate.AddHours(24))
                {
                    return BadRequest(new { message = "Order cannot be cancelled. 24-hour cancellation window has passed." });
                }

                string updateOrderSql = @"
UPDATE Orders 
SET Order_Status = 'cancelled', 
    Payment_Status = CASE 
        WHEN Payment_Status IN ('pending', 'completed', 'paid') THEN 'refunded'
        ELSE Payment_Status
    END,
    Updated_At = GETDATE()
WHERE Order_Id = @OrderId";

                _dapper.ExecuteSql(updateOrderSql, new { OrderId = orderId });
                ReleaseGiftVoucherReservation(orderId);

                if (order.Points_Redeemed != null && order.Points_Redeemed > 0)
                {
                    string refundPointsSql = @"
INSERT INTO LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
VALUES (@UserId, @Points, 'earned', 'refund', @SourceId, @Description, GETDATE())";

                    _dapper.ExecuteSql(refundPointsSql, new
                    {
                        UserId = userId,
                        Points = (decimal)order.Points_Redeemed,
                        SourceId = orderId,
                        Description = $"Points refunded for cancelled order #{order.Order_Number}"
                    });
                }

                try
                {
                    string emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Order Cancelled</h2>
        </div>
        <div class='content'>
            <p>Dear {order.User_FullName},</p>
            <p>Your order has been successfully cancelled.</p>
            
            {(order.Points_Redeemed > 0 ? $"<p>Your {order.Points_Redeemed} loyalty points have been refunded to your account.</p>" : "")}            
            <p>If you did not request this cancellation, please contact our customer support immediately.</p>
            
            <p>We hope to see you again soon!</p>
            
            <p>Best regards,<br/>Your Proteini.mk Team</p>
        </div>
        <div class='footer'>
            <p>&copy; {DateTime.Now.Year} Proteini.mk. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                    var mm = CreateMailModel(new[] { (string)order.User_Email }, $"Order Cancelled - #{order.Order_Number}", emailBody);

                    SendEmail(mm);
                    Console.WriteLine($"Cancellation email sent to {order.User_Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send cancellation email: {ex.Message}");
                }

                return Ok(new { status = true, message = "Order cancelled successfully. Your refund will be processed within 5-7 business days." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to cancel order: {ex.Message}" });
            }
        }

        [HttpGet("CanCancel/{orderId}")]
        public IActionResult CanCancelOrder(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                string getOrderSql = @"
SELECT Order_Date, Order_Status 
FROM Orders 
WHERE Order_Id = @OrderId AND User_Id = @UserId";

                var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = orderId, UserId = userId });

                if (order == null)
                    return NotFound(new { message = "Order not found" });

                bool canCancel = (order.Order_Status != "shipped" &&
                                 order.Order_Status != "delivered" &&
                                 order.Order_Status != "cancelled") &&
                                 DateTime.Now <= order.Order_Date.AddHours(24);

                return Ok(new
                {
                    canCancel = canCancel,
                    orderStatus = order.Order_Status,
                    hoursRemaining = canCancel ? Math.Max(0, 24 - (DateTime.Now - order.Order_Date).TotalHours) : 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to check cancellation status: {ex.Message}" });
            }
        }

        [Authorize(Policy = "SuperAdmin")]
        [HttpPost("UpdatePaymentStatus")]
        public async Task<IActionResult> UpdatePaymentStatus([FromBody] UpdatePaymentStatusDto paymentUpdate)
        {
            try
            {
                var environmentName = _config["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                if (!string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase) && !IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                var confirmationEmailSent = false;

                if (IsSuccessfulPaymentStatus(paymentUpdate.Payment_Status))
                {
                    var result = await CompletePaidOrderAsync(paymentUpdate.Order_Id, paymentUpdate.Transaction_Id);
                    confirmationEmailSent = result.EmailSent;

                    return Ok(new { status = result.Success, message = result.Message, confirmationEmailSent });
                }

                MarkOrderPaymentFailed(paymentUpdate.Order_Id, paymentUpdate.Transaction_Id);

                return Ok(new { status = true, message = "Payment status updated", confirmationEmailSent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to update payment: {ex.Message}" });
            }
        }

        [HttpGet("Admin")]
        public IActionResult GetAdminOrders(
            [FromQuery] string? orderStatus = null,
            [FromQuery] string? paymentStatus = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? sortBy = "date",
            [FromQuery] string? sortOrder = "desc")
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);
                var offset = (page - 1) * pageSize;
                var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
                var orderColumn = (sortBy ?? "date").Trim().ToLowerInvariant() switch
                {
                    "number" => "o.Order_Number",
                    "customer" => "o.Billing_FullName",
                    "status" => "o.Order_Status",
                    "total" => "o.Total_Amount",
                    _ => "o.Order_Date"
                };
                var orderDirection = string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC";

                string whereSql = @"
WHERE (@OrderStatus IS NULL OR o.Order_Status = @OrderStatus)
  AND (@PaymentStatus IS NULL OR o.Payment_Status = @PaymentStatus)
  AND (
      @Search IS NULL
      OR o.Order_Number LIKE @Search
      OR o.Billing_Email LIKE @Search
      OR o.Billing_FullName LIKE @Search
      OR o.Billing_Phone LIKE @Search
  )";

                string countSql = $@"
SELECT COUNT(*)
FROM Orders o
{whereSql}";

                string ordersSql = $@"
SELECT
    o.Order_Id,
    o.Order_Number,
    o.Order_Date,
    o.Order_Status,
    o.Payment_Method,
    o.Payment_Status,
    o.Subtotal,
    o.Delivery_Fee,
    o.Promo_Code,
    o.Promo_Discount,
    o.Selected_Free_Gift_Id,
    o.Total_Amount,
    o.Transaction_Id,
    o.Tracking_Number,
    o.Tracking_Url,
    o.Shipped_At,
    o.Billing_FullName,
    o.Billing_Email,
    o.Billing_Phone,
    o.Billing_City,
    o.Delivery_FullName,
    o.Delivery_City,
    COALESCE(SUM(oi.Quantity), 0) AS Item_Count
FROM Orders o
LEFT JOIN OrderItems oi ON oi.Order_Id = o.Order_Id
{whereSql}
GROUP BY o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method,
    o.Payment_Status, o.Subtotal, o.Delivery_Fee, o.Promo_Code, o.Promo_Discount,
    o.Selected_Free_Gift_Id, o.Total_Amount, o.Transaction_Id,
    o.Tracking_Number, o.Tracking_Url, o.Shipped_At,
    o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Billing_City,
    o.Delivery_FullName, o.Delivery_City
ORDER BY {orderColumn} {orderDirection}, o.Order_Id DESC
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

                var parameters = new
                {
                    OrderStatus = string.IsNullOrWhiteSpace(orderStatus) ? null : orderStatus,
                    PaymentStatus = string.IsNullOrWhiteSpace(paymentStatus) ? null : paymentStatus,
                    Search = normalizedSearch,
                    Offset = offset,
                    PageSize = pageSize
                };

                var totalCount = _dapper.LoadDataSingle<int>(countSql, parameters);
                var orders = _dapper.LoadData<dynamic>(ordersSql, parameters);

                return Ok(new
                {
                    status = true,
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    orders
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to get admin orders: {ex.Message}" });
            }
        }

        [HttpGet("Admin/Export.csv")]
        public IActionResult ExportAdminOrders(
            [FromQuery] string? orderStatus = null,
            [FromQuery] string? paymentStatus = null,
            [FromQuery] string? search = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
                var rows = _dapper.LoadData<dynamic>(@"
SELECT
    o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method, o.Payment_Status,
    o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Billing_Address,
    o.Billing_PostCode, o.Billing_City, o.Subtotal, o.Delivery_Fee,
    o.Promo_Code, o.Promo_Discount, o.Points_Discount, o.Gift_Voucher_Code,
    o.Gift_Voucher_Amount, o.Total_Amount, o.Transaction_Id,
    o.Tracking_Number, o.Tracking_Url, COALESCE(SUM(oi.Quantity), 0) AS Item_Count,
    (SELECT TOP 1 DisplayName FROM OrderFreeGifts fg WHERE fg.OrderId = o.Order_Id) AS Free_Gift
FROM Orders o
LEFT JOIN OrderItems oi ON oi.Order_Id = o.Order_Id
WHERE (@OrderStatus IS NULL OR o.Order_Status = @OrderStatus)
  AND (@PaymentStatus IS NULL OR o.Payment_Status = @PaymentStatus)
  AND (@FromDate IS NULL OR o.Order_Date >= @FromDate)
  AND (@ToExclusive IS NULL OR o.Order_Date < @ToExclusive)
  AND (
      @Search IS NULL OR o.Order_Number LIKE @Search OR o.Billing_Email LIKE @Search
      OR o.Billing_FullName LIKE @Search OR o.Billing_Phone LIKE @Search
  )
GROUP BY o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method,
    o.Payment_Status, o.Billing_FullName, o.Billing_Email, o.Billing_Phone,
    o.Billing_Address, o.Billing_PostCode, o.Billing_City, o.Subtotal,
    o.Delivery_Fee, o.Promo_Code, o.Promo_Discount, o.Points_Discount,
    o.Gift_Voucher_Code, o.Gift_Voucher_Amount, o.Total_Amount, o.Transaction_Id,
    o.Tracking_Number, o.Tracking_Url
ORDER BY o.Order_Date DESC", new
                {
                    OrderStatus = string.IsNullOrWhiteSpace(orderStatus) ? null : orderStatus,
                    PaymentStatus = string.IsNullOrWhiteSpace(paymentStatus) ? null : paymentStatus,
                    Search = normalizedSearch,
                    FromDate = from?.Date,
                    ToExclusive = to?.Date.AddDays(1)
                });

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
                return File(
                    utf8WithBom.GetBytes(csv.ToString()),
                    "text/csv; charset=utf-8",
                    $"proteini-orders-{DateTime.UtcNow:yyyyMMdd-HHmm}.csv"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to export admin orders: {ex.Message}" });
            }
        }

        [HttpPost("Admin/Status")]
        public async Task<IActionResult> UpdateAdminOrderStatus([FromBody] AdminUpdateOrderStatusDto statusUpdate)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                if (statusUpdate.Order_Id <= 0)
                    return BadRequest(new { status = false, message = "A valid order id is required" });

                var requestedStatus = (statusUpdate.Order_Status ?? string.Empty).Trim().ToLowerInvariant();
                var allowedStatuses = new[] { "pending", "confirmed", "processing", "paid", "completed", "shipped", "delivered", "rejected", "cancelled", "refunded" };
                if (!allowedStatuses.Contains(requestedStatus))
                    return BadRequest(new { status = false, message = "Unsupported order status" });

                string getOrderSql = @"
SELECT o.Order_Id, o.Order_Number, o.Order_Status, o.Payment_Status, o.Billing_Email,
       o.Billing_FullName, o.Payment_Method, o.Total_Amount, o.Transaction_Id,
       o.Tracking_Number, o.Tracking_Url
FROM Orders o
WHERE o.Order_Id = @OrderId";

                var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = statusUpdate.Order_Id });
                if (order == null)
                    return NotFound(new { status = false, message = "Order not found" });

                var currentStatus = (Convert.ToString(order.Order_Status) ?? string.Empty).Trim().ToLowerInvariant();
                if (!CanTransitionOrder(currentStatus, requestedStatus))
                    return Conflict(new { status = false, message = $"Order cannot move from {currentStatus} to {requestedStatus}." });

                var trackingNumber = string.IsNullOrWhiteSpace(statusUpdate.Tracking_Number)
                    ? Convert.ToString(order.Tracking_Number)
                    : statusUpdate.Tracking_Number.Trim();
                var trackingUrl = string.IsNullOrWhiteSpace(statusUpdate.Tracking_Url)
                    ? Convert.ToString(order.Tracking_Url)
                    : statusUpdate.Tracking_Url.Trim();
                if ((trackingNumber?.Length ?? 0) > 120)
                    return BadRequest(new { status = false, message = "Tracking number is too long." });
                Uri? parsedTrackingUrl;
                if (!string.IsNullOrWhiteSpace(trackingUrl)
                    && (!Uri.TryCreate(trackingUrl, UriKind.Absolute, out parsedTrackingUrl)
                        || parsedTrackingUrl.Scheme is not ("https" or "http")))
                    return BadRequest(new { status = false, message = "Tracking URL must be a valid HTTP or HTTPS URL." });

                if (requestedStatus == "paid" || requestedStatus == "completed")
                {
                    var paidResult = await CompletePaidOrderAsync(
                        statusUpdate.Order_Id,
                        statusUpdate.Transaction_Id,
                        sendEmail: false,
                        completedOrderStatus: requestedStatus);
                    return Ok(new
                    {
                        status = paidResult.Success,
                        message = paidResult.Message,
                        confirmationEmailSent = paidResult.EmailSent
                    });
                }

                string finalOrderStatus = requestedStatus;
                string finalPaymentStatus = string.IsNullOrWhiteSpace(statusUpdate.Payment_Status)
                    ? Convert.ToString(order.Payment_Status) ?? "pending"
                    : statusUpdate.Payment_Status.Trim().ToLowerInvariant();

                if (requestedStatus == "confirmed" && string.IsNullOrWhiteSpace(statusUpdate.Payment_Status))
                    finalPaymentStatus = Convert.ToString(order.Payment_Status) ?? "pending";
                else if (requestedStatus == "rejected")
                    finalPaymentStatus = "failed";
                else if (requestedStatus == "cancelled")
                    finalPaymentStatus = IsSuccessfulPaymentStatus(Convert.ToString(order.Payment_Status) ?? string.Empty) ? "refunded" : "failed";
                else if (requestedStatus == "refunded")
                    finalPaymentStatus = "refunded";

                string updateSql = @"
UPDATE Orders
SET Order_Status = @OrderStatus,
    Payment_Status = @PaymentStatus,
    Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
    Tracking_Number = @TrackingNumber,
    Tracking_Url = @TrackingUrl,
    Shipped_At = CASE WHEN @OrderStatus = 'shipped' AND Shipped_At IS NULL THEN SYSUTCDATETIME() ELSE Shipped_At END,
    Updated_At = GETDATE()
WHERE Order_Id = @OrderId";

                _dapper.ExecuteSql(updateSql, new
                {
                    OrderStatus = finalOrderStatus,
                    PaymentStatus = finalPaymentStatus,
                    TransactionId = string.IsNullOrWhiteSpace(statusUpdate.Transaction_Id) ? null : statusUpdate.Transaction_Id,
                    TrackingNumber = trackingNumber,
                    TrackingUrl = trackingUrl,
                    OrderId = statusUpdate.Order_Id
                });

                if (requestedStatus is "rejected" or "cancelled")
                    ReleaseGiftVoucherReservation(statusUpdate.Order_Id);

                var emailSent = requestedStatus == "confirmed" && statusUpdate.Send_Email
                    ? SendAdminOrderStatusEmail(
                        order,
                        finalOrderStatus,
                        finalPaymentStatus,
                        string.IsNullOrWhiteSpace(statusUpdate.Transaction_Id)
                            ? Convert.ToString(order.Transaction_Id)
                            : statusUpdate.Transaction_Id)
                    : false;

                return Ok(new
                {
                    status = true,
                    message = "Order status updated",
                    orderStatus = finalOrderStatus,
                    paymentStatus = finalPaymentStatus,
                    trackingNumber,
                    trackingUrl,
                    emailSent
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to update order status: {ex.Message}" });
            }
        }

        [HttpGet("Admin/{orderId}")]
        public IActionResult GetAdminOrderDetails(int orderId)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                if (orderId <= 0)
                    return BadRequest(new { status = false, message = "A valid order id is required" });

                string getOrderSql = @"
SELECT *
FROM Orders
WHERE Order_Id = @OrderId";

                var order = _dapper.LoadDataSingleOrDefault<dynamic>(getOrderSql, new { OrderId = orderId });
                if (order == null)
                    return NotFound(new { status = false, message = "Order not found" });

                string getItemsSql = @"
SELECT *
FROM OrderItems
WHERE Order_Id = @OrderId
ORDER BY OrderItem_Id";

                var items = _dapper.LoadData<dynamic>(getItemsSql, new { OrderId = orderId });

                var freeGifts = _dapper.LoadData<dynamic>(@"
SELECT OrderFreeGiftId, FreeGiftId, ProductId, VariantId, DisplayName
FROM OrderFreeGifts
WHERE OrderId = @OrderId
ORDER BY OrderFreeGiftId", new { OrderId = orderId });

                var issuedVouchers = _dapper.LoadData<dynamic>(@"
SELECT GiftVoucherId, Code, InitialValue, RemainingValue, Status, ValidFrom, ExpiresAt
FROM GiftVouchers WHERE PurchasedOrderId = @OrderId ORDER BY GiftVoucherId", new { OrderId = orderId });
                var voucherRedemptions = _dapper.LoadData<dynamic>(@"
SELECT r.GiftVoucherRedemptionId, r.Amount, r.Status, r.CreatedAt, r.CompletedAt, r.ReleasedAt,
       v.Code
FROM GiftVoucherRedemptions r
INNER JOIN GiftVouchers v ON v.GiftVoucherId = r.GiftVoucherId
WHERE r.OrderId = @OrderId", new { OrderId = orderId });

                return Ok(new
                {
                    status = true,
                    order,
                    items,
                    freeGifts,
                    issuedVouchers,
                    voucherRedemptions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to get admin order details: {ex.Message}" });
            }
        }

        [HttpGet("Admin/{orderId:int}/document")]
        public IActionResult DownloadOperationalOrderDocument(int orderId)
        {
            if (!IsAdmin()) return Forbid();
            TryRegisterOperationalDocument(orderId);
            var document = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT TOP 1 d.HtmlContent, o.Order_Number
FROM OrderDocuments d
INNER JOIN Orders o ON o.Order_Id = d.OrderId
WHERE d.OrderId = @OrderId AND d.DocumentType = 'operational-order'
ORDER BY d.Version DESC", new { OrderId = orderId });
            if (document == null) return NotFound(new { message = "Order document was not found." });

            var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true)
                .GetBytes(Convert.ToString(document.HtmlContent) ?? string.Empty);
            var number = Convert.ToString(document.Order_Number) ?? orderId.ToString(CultureInfo.InvariantCulture);
            return File(bytes, "text/html; charset=utf-8", $"order-{number}.html");
        }

        private void TryRegisterOperationalDocument(int orderId)
        {
            try
            {
                if (_dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM OrderDocuments
WHERE OrderId = @OrderId AND DocumentType = 'operational-order' AND Version = 1", new { OrderId = orderId }) > 0)
                    return;

                var order = _dapper.LoadDataSingleOrDefault<dynamic>("SELECT * FROM Orders WHERE Order_Id = @OrderId", new { OrderId = orderId });
                if (order == null) return;
                var items = _dapper.LoadData<dynamic>(@"
SELECT Product_Name, Variant_Name, Variant_Packaging, Product_Price, Quantity, Subtotal
FROM OrderItems WHERE Order_Id = @OrderId ORDER BY OrderItem_Id", new { OrderId = orderId }).ToList();

                var rows = new StringBuilder();
                foreach (var item in items)
                {
                    var variant = string.Join(" / ", new[]
                    {
                        Convert.ToString(item.Variant_Name),
                        Convert.ToString(item.Variant_Packaging)
                    }.Where(value => !string.IsNullOrWhiteSpace(value)));
                    rows.Append($"<tr><td>{HtmlEncode(Convert.ToString(item.Product_Name) ?? string.Empty)}</td><td>{HtmlEncode(variant)}</td><td>{Convert.ToInt32(item.Quantity)}</td><td>MKD {Convert.ToDecimal(item.Product_Price):F2}</td><td>MKD {Convert.ToDecimal(item.Subtotal):F2}</td></tr>");
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
<table class='totals'><tr><th>Subtotal</th><td>MKD {Convert.ToDecimal(order.Subtotal):F2}</td></tr><tr><th>Promotion</th><td>- MKD {Convert.ToDecimal(order.Promo_Discount):F2}</td></tr><tr><th>Points</th><td>- MKD {Convert.ToDecimal(order.Points_Discount):F2}</td></tr><tr><th>Gift voucher</th><td>- MKD {Convert.ToDecimal(order.Gift_Voucher_Amount):F2}</td></tr><tr><th>Delivery</th><td>MKD {Convert.ToDecimal(order.Delivery_Fee):F2}</td></tr><tr><th>Total</th><td><strong>MKD {Convert.ToDecimal(order.Total_Amount):F2}</strong></td></tr></table>
</body></html>";
                var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(html))).ToLowerInvariant();
                _dapper.ExecuteSql(@"
IF NOT EXISTS (SELECT 1 FROM OrderDocuments WHERE OrderId = @OrderId AND DocumentType = 'operational-order' AND Version = 1)
    INSERT INTO OrderDocuments (OrderId, DocumentType, Version, GeneratedAt, GeneratedBy, ContentHash, HtmlContent)
    VALUES (@OrderId, 'operational-order', 1, SYSUTCDATETIME(), 'system', @Hash, @Html);", new
                {
                    OrderId = orderId,
                    Hash = hash,
                    Html = html
                });
            }
            catch (Exception exception)
            {
                Console.WriteLine($"Operational order document generation failed for order {orderId}: {exception.Message}");
            }
        }

        [HttpGet("History")]
        public IActionResult GetOrderHistory()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { message = "User not authenticated" });

                string sql = @"
SELECT 
    Order_Id, Order_Number, Order_Date, Order_Status, 
    Payment_Method, Payment_Status, Total_Amount, Points_Redeemed
FROM Orders 
WHERE User_Id = @UserId 
ORDER BY Order_Date DESC";

                var orders = _dapper.LoadData<dynamic>(sql, new { UserId = userId });

                return Ok(new { status = true, orders = orders });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to get orders: {ex.Message}" });
            }
        }

        private bool SendAdminOrderStatusEmail(dynamic order, string orderStatus, string paymentStatus, string? confirmationNumber = null)
        {
            var customerEmail = Convert.ToString(order.Billing_Email);
            if (string.IsNullOrWhiteSpace(customerEmail))
                return false;

            var orderNumber = Convert.ToString(order.Order_Number) ?? order.Order_Id.ToString();
            var customerName = Convert.ToString(order.Billing_FullName) ?? "customer";
            decimal totalAmount = Convert.ToDecimal(order.Total_Amount ?? 0);
            var statusTitle = orderStatus == "confirmed" ? "Нарачката е потврдена" : "Статус на нарачка";
            var statusMessage = orderStatus switch
            {
                "confirmed" => "Вашата нарачка е потврдена.",
                "processing" => "Вашата нарачка е во обработка.",
                "shipped" => "Вашата нарачка е испратена.",
                "delivered" => "Вашата нарачка е доставена.",
                "rejected" => "Вашата нарачка е одбиена.",
                "cancelled" => "Вашата нарачка е откажана.",
                "refunded" => "Повратот за вашата нарачка е означен како обработен.",
                _ => "Статусот на вашата нарачка е ажуриран."
            };
            var confirmationNumberHtml = string.IsNullOrWhiteSpace(confirmationNumber)
                                ? string.Empty
                                : $@"
                                <tr>
                                    <td colspan='2' style='padding:16px; border-top:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Tracking order number</div>
                                        <div style='color:#111827; font-size:16px; line-height:22px; font-weight:800;'>{HtmlEncode(confirmationNumber)}</div>
                                    </td>
                                </tr>";

            var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>{HtmlEncode(statusTitle)} - #{HtmlEncode(orderNumber)}</title>
</head>
<body style='margin:0; padding:0; background:#f3f6f8; font-family:Arial, Helvetica, sans-serif; color:#111827;'>
    <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; background:#f3f6f8; padding:24px 12px;'>
        <tr>
            <td align='center'>
                <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; max-width:680px; border-collapse:collapse; background:#ffffff; border:1px solid #dde5ed;'>
                    <tr>
                        <td style='background:#ffffff; padding:24px 28px; border-bottom:4px solid #FDC700;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%;'>
                                <tr>
                                    <td>{GetEmailLogoHtml()}</td>
                                    <td align='right'>
                                        <span style='display:inline-block; padding:7px 12px; background:#2096D8; color:#ffffff; font-size:12px; line-height:14px; font-weight:700; text-transform:uppercase;'>{HtmlEncode(orderStatus)}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:32px 28px 18px 28px;'>
                            <h1 style='margin:0 0 10px 0; color:#111827; font-size:28px; line-height:34px; font-weight:800;'>{HtmlEncode(statusTitle)}</h1>
                            <p style='margin:0; color:#536173; font-size:15px; line-height:24px;'>Почитувани {HtmlEncode(customerName)}, {HtmlEncode(statusMessage)}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 24px 28px;'>
                            <table role='presentation' cellpadding='0' cellspacing='0' style='width:100%; border-collapse:collapse; background:#f8fafc; border:1px solid #e3e9ef;'>
                                <tr>
                                    <td style='padding:16px; width:50%;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Order number</div>
                                        <div style='color:#111827; font-size:16px; line-height:22px; font-weight:800;'>#{HtmlEncode(orderNumber)}</div>
                                    </td>
                                    <td style='padding:16px; width:50%;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Total</div>
                                        <div style='color:#2096D8; font-size:18px; line-height:24px; font-weight:800;'>MKD {totalAmount:F2}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding:16px; width:50%; border-top:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Order status</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(orderStatus)}</div>
                                    </td>
                                    <td style='padding:16px; width:50%; border-top:1px solid #e3e9ef;'>
                                        <div style='color:#667085; font-size:12px; line-height:16px; text-transform:uppercase;'>Payment status</div>
                                        <div style='color:#111827; font-size:15px; line-height:21px; font-weight:700;'>{HtmlEncode(paymentStatus)}</div>
                                    </td>
                                </tr>
                                {confirmationNumberHtml}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 28px 34px 28px;'>
                            <p style='margin:0; color:#536173; font-size:14px; line-height:22px;'>Доколку имате прашања, контактирајте не на makedonija@proteini.si.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='background:#f8fafc; padding:20px 28px; color:#667085; font-size:12px; line-height:18px; text-align:center; border-top:1px solid #e3e9ef;'>
                            Proteini.mk &copy; {DateTime.Now.Year}. This is an automated order email.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            try
            {
                return SendEmail(CreateMailModel(
                    new List<string> { customerEmail },
                    $"Proteini.mk order confirmation - #{orderNumber}",
                    emailBody,
                    includeOrderCopyRecipients: false));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send admin order status email: {ex.Message}");
                return false;
            }
        }

        private List<string> GetSellerNotificationRecipients()
        {
            var configuredRecipients = ParseRecipientSetting(_config["MailSettings:OrderNotificationEmail"])
                .Concat(_config
                .GetSection("MailSettings:SellerRecipients")
                .GetChildren()
                .Select(value => value.Value)
                .SelectMany(ParseRecipientSetting))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (configuredRecipients.Any())
                return configuredRecipients;

            Console.WriteLine("No order notification email configured. Falling back to gtsport8@yahoo.com");
            return new List<string> { "gtsport8@yahoo.com" };
        }

        private List<string> GetOrderCopyRecipients(IEnumerable<string> toRecipients)
        {
            var toRecipientSet = toRecipients
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return ParseRecipientSetting(_config["MailSettings:OrderCopyRecipients"])
                .Concat(_config
                    .GetSection("MailSettings:OrderCopyRecipients")
                    .GetChildren()
                    .Select(value => value.Value)
                    .SelectMany(ParseRecipientSetting))
                .Concat(DefaultOrderCopyRecipients)
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Where(recipient => !toRecipientSet.Contains(recipient))
                .ToList();
        }

        private static IEnumerable<string> ParseRecipientSetting(string? recipients)
        {
            if (string.IsNullOrWhiteSpace(recipients))
                return Enumerable.Empty<string>();

            return recipients
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient));
        }

        private static string? MaskEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return email;

            var atIndex = email.IndexOf('@');
            if (atIndex <= 1)
                return "***";

            var local = email.Substring(0, atIndex);
            var domain = email.Substring(atIndex);
            var visibleLocal = local.Length <= 2 ? local.Substring(0, 1) : local.Substring(0, 2);
            return $"{visibleLocal}***{domain}";
        }

        private static string HtmlEncode(object? value)
        {
            return System.Net.WebUtility.HtmlEncode(Convert.ToString(value) ?? string.Empty);
        }

        private static string CsvValue(object? value)
        {
            var text = Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
            if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
                text = "'" + text;
            return $"\"{text.Replace("\"", "\"\"")}\"";
        }

        private static string GetEmailLogoHtml()
        {
            return "<img src='https://proteini.mk/logos/proteini-invoice-logo.png' alt='Proteini.mk' width='220' style='display:block; width:220px; max-width:100%; height:auto; border:0;' />";
        }

        private MailModel CreateMailModel(IEnumerable<string> recipients, string subject, string body, bool includeOrderCopyRecipients = true)
        {
            var mailSettings = _config.GetSection("MailSettings");
            var recipientList = recipients
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (!recipientList.Any())
                throw new InvalidOperationException("At least one email recipient is required.");

            return new MailModel
            {
                SMTPPort = mailSettings.GetValue<int?>("SMTPPort") ?? 587,
                host = mailSettings["host"] ?? throw new InvalidOperationException("MailSettings:host is not configured."),
                sender_username = mailSettings["sender_username"] ?? throw new InvalidOperationException("MailSettings:sender_username is not configured."),
                sender_email = mailSettings["sender_email"] ?? throw new InvalidOperationException("MailSettings:sender_email is not configured."),
                sender_name = mailSettings["sender_name"] ?? "Proteini.mk",
                sender_password = mailSettings["sender_password"] ?? throw new InvalidOperationException("MailSettings:sender_password is not configured."),
                EnableSsl = mailSettings.GetValue<bool?>("EnableSsl") ?? true,
                CheckCertificateRevocation = mailSettings.GetValue<bool?>("CheckCertificateRevocation") ?? true,
                ToRecipients = recipientList,
                CcRecipients = includeOrderCopyRecipients ? GetOrderCopyRecipients(recipientList) : new List<string>(),
                content = body,
                subject = subject
            };
        }

        private bool SendEmail(MailModel mailModel)
        {
            return SendEmailDetailed(mailModel).Success;
        }

        private EmailSendDebugResult SendEmailDetailed(MailModel mailModel)
        {
            try
            {
                var startedAt = DateTime.UtcNow;
                var result = new EmailSendDebugResult
                {
                    Success = false,
                    Host = mailModel.host,
                    Port = mailModel.SMTPPort,
                    EnableSsl = mailModel.EnableSsl,
                    SenderEmail = MaskEmail(mailModel.sender_email),
                    SenderUsername = MaskEmail(mailModel.sender_username),
                    RecipientCount = mailModel.ToRecipients?.Count ?? 0,
                    Recipients = mailModel.ToRecipients?.Select(MaskEmail).Where(value => value != null).Cast<string>().ToList() ?? new List<string>(),
                    CcRecipientCount = mailModel.CcRecipients?.Count ?? 0,
                    CcRecipients = mailModel.CcRecipients?.Select(MaskEmail).Where(value => value != null).Cast<string>().ToList() ?? new List<string>(),
                    Subject = mailModel.subject,
                    StartedAtUtc = startedAt
                };

                if (string.IsNullOrWhiteSpace(mailModel.host))
                    throw new InvalidOperationException("SMTP host is empty.");
                if (string.IsNullOrWhiteSpace(mailModel.sender_username))
                    throw new InvalidOperationException("SMTP sender username is empty.");
                if (string.IsNullOrWhiteSpace(mailModel.sender_email))
                    throw new InvalidOperationException("SMTP sender email is empty.");
                if (string.IsNullOrWhiteSpace(mailModel.sender_password))
                    throw new InvalidOperationException("SMTP sender password is empty.");
                if (mailModel.ToRecipients == null || !mailModel.ToRecipients.Any())
                    throw new InvalidOperationException("No email recipients were provided.");

                var message = new MimeKit.MimeMessage();
                message.From.Add(new MimeKit.MailboxAddress(mailModel.sender_name, mailModel.sender_email));

                foreach (var recipient in mailModel.ToRecipients)
                    message.To.Add(MimeKit.MailboxAddress.Parse(recipient));

                foreach (var recipient in mailModel.CcRecipients ?? Enumerable.Empty<string>())
                    message.Cc.Add(MimeKit.MailboxAddress.Parse(recipient));

                message.Subject = mailModel.subject;
                message.Body = new MimeKit.BodyBuilder
                {
                    HtmlBody = mailModel.content
                }.ToMessageBody();

                using var client = new MailKit.Net.Smtp.SmtpClient();
                client.CheckCertificateRevocation = mailModel.CheckCertificateRevocation;
                var socketOptions = GetSecureSocketOptions(mailModel);

                client.Connect(mailModel.host, mailModel.SMTPPort, socketOptions);
                client.Authenticate(mailModel.sender_username, mailModel.sender_password);
                client.Send(message);
                client.Disconnect(true);

                Console.WriteLine($"Email sent successfully to {string.Join(", ", mailModel.ToRecipients)}");
                result.Success = true;
                result.CompletedAtUtc = DateTime.UtcNow;
                result.DurationMs = (long)(result.CompletedAtUtc.Value - startedAt).TotalMilliseconds;
                result.Message = "SMTP send completed with authenticated MailKit SMTP. This means the provider accepted the message, not necessarily inbox delivery.";
                Console.WriteLine($"SMTP diagnostic success: host={result.Host}, port={result.Port}, ssl={result.EnableSsl}, recipients={string.Join(", ", result.Recipients)}, cc={string.Join(", ", result.CcRecipients)}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                var failure = new EmailSendDebugResult
                {
                    Success = false,
                    Host = mailModel.host,
                    Port = mailModel.SMTPPort,
                    EnableSsl = mailModel.EnableSsl,
                    SenderEmail = MaskEmail(mailModel.sender_email),
                    SenderUsername = MaskEmail(mailModel.sender_username),
                    RecipientCount = mailModel.ToRecipients?.Count ?? 0,
                    Recipients = mailModel.ToRecipients?.Select(MaskEmail).Where(value => value != null).Cast<string>().ToList() ?? new List<string>(),
                    CcRecipientCount = mailModel.CcRecipients?.Count ?? 0,
                    CcRecipients = mailModel.CcRecipients?.Select(MaskEmail).Where(value => value != null).Cast<string>().ToList() ?? new List<string>(),
                    Subject = mailModel.subject,
                    StartedAtUtc = DateTime.UtcNow,
                    CompletedAtUtc = DateTime.UtcNow,
                    DurationMs = 0,
                    Message = ex.Message,
                    ExceptionType = ex.GetType().FullName,
                    InnerExceptionType = ex.InnerException?.GetType().FullName,
                    InnerExceptionMessage = ex.InnerException?.Message
                };

                Console.WriteLine($"SMTP diagnostic failure: host={failure.Host}, port={failure.Port}, ssl={failure.EnableSsl}, sender={failure.SenderEmail}, recipients={string.Join(", ", failure.Recipients)}, cc={string.Join(", ", failure.CcRecipients)}, exception={failure.ExceptionType}, message={failure.Message}, inner={failure.InnerExceptionMessage}");
                return failure;
            }
        }

        private static MailKit.Security.SecureSocketOptions GetSecureSocketOptions(MailModel mailModel)
        {
            if (!mailModel.EnableSsl)
                return MailKit.Security.SecureSocketOptions.None;

            return mailModel.SMTPPort == 465
                ? MailKit.Security.SecureSocketOptions.SslOnConnect
                : MailKit.Security.SecureSocketOptions.StartTls;
        }

        private class EmailSendDebugResult
        {
            public bool Success { get; set; }
            public string? Host { get; set; }
            public int Port { get; set; }
            public bool EnableSsl { get; set; }
            public string? SenderEmail { get; set; }
            public string? SenderUsername { get; set; }
            public int RecipientCount { get; set; }
            public List<string> Recipients { get; set; } = new();
            public int CcRecipientCount { get; set; }
            public List<string> CcRecipients { get; set; } = new();
            public string? Subject { get; set; }
            public DateTime StartedAtUtc { get; set; }
            public DateTime? CompletedAtUtc { get; set; }
            public long DurationMs { get; set; }
            public string? Message { get; set; }
            public string? ExceptionType { get; set; }
            public string? InnerExceptionType { get; set; }
            public string? InnerExceptionMessage { get; set; }
        }
    }
}
