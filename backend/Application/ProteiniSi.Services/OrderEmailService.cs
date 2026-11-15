using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;
using static ProteiniSi.Services.Helpers.OrderFormatting;

namespace ProteiniSi.Services
{
    public class OrderEmailService(
        IOrderProvider orderProvider,
        IEmailSender emailSender,
        IConfiguration config,
        ILogger<OrderEmailService> logger,
        ICommerceSettingsService commerceSettings) : IOrderEmailService
    {
        private static readonly string[] DefaultOrderCopyRecipients =
        {
            "proteini@yahoo.com",
            "vladimir.proteinisi@gmail.com"
        };

        public async Task<bool> SendOrderConfirmationAsync(int orderId, bool isPaymentConfirmed = true, string? overrideRecipient = null, bool sendSellerNotification = true)
        {
            try
            {
                var orderData = await orderProvider.GetEmailDataAsync(orderId);

                if (orderData.Count == 0) return false;

                var firstItem = orderData.First();
                OrderEmailCopy copy = OrderEmailCopy.For(ReadLanguage((object)firstItem));
                string userEmail = Convert.ToString(overrideRecipient ?? firstItem.Customer_Email) ?? string.Empty;
                string userFullName = Convert.ToString(firstItem.Customer_FullName) ?? copy.DefaultCustomerName;
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
                var itemRows = new List<string[]>();
                foreach (var item in orderData)
                {
                    string sku = Convert.ToString(item.Variant_SKU) ?? $"#{item.Variant_Id ?? item.Product_Id}";
                    string displayName = item.Product_Name;
                    if (!string.IsNullOrEmpty(item.Variant_Name))
                        displayName += $" - {item.Variant_Name}";
                    if (!string.IsNullOrEmpty(item.Variant_Packaging))
                        displayName += $" ({item.Variant_Packaging})";

                    itemRows.Add(new string[]
                    {
                        HtmlEncode(sku),
                        HtmlEncode(displayName),
                        Convert.ToString(item.Quantity) ?? "",
                        $"{PriceFormat.Mkd(item.Product_Price)}",
                        $"{PriceFormat.Mkd(item.Item_Subtotal)}"
                    });
                }
                var productsHtml = EmailLayout.ItemsTable(new[]
                {
                    (copy.ColSku, "left", true, true),
                    (copy.ColProduct, "left", false, false),
                    (copy.ColQty, "center", false, false),
                    (copy.ColPrice, "right", true, false),
                    (copy.ColTotal, "right", false, false)
                }, itemRows);

                // Voucher codes go out in their own buyer / gift recipient emails (GiftVoucherEmailService).
                var issuedVouchers = await orderProvider.GetIssuedVouchersAsync(orderId);
                var voucherHtml = issuedVouchers.Count > 0
                    ? EmailLayout.Row(EmailLayout.Callout(EmailLayout.Note(HtmlEncode(copy.VoucherSentSeparately))))
                    : "";

                // Different email content based on payment method
                string statusTitle;
                string statusLabel;
                string statusDescription;
                string paymentLine;
                string emailSubject;

                if (isPaymentConfirmed)
                {
                    statusTitle = copy.PaidTitle;
                    statusLabel = copy.PaidLabel;
                    statusDescription = string.Format(copy.PaidDescription, orderNumber);
                    paymentLine = copy.PaidOnline;
                    emailSubject = string.Format(copy.PaidSubject, orderNumber);
                }
                else
                {
                    statusTitle = copy.CodTitle;
                    statusLabel = copy.CodLabel;
                    statusDescription = copy.CodDescription;
                    paymentLine = copy.CashOnDelivery;
                    emailSubject = string.Format(copy.CodSubject, orderNumber);
                }

                var totalLines = new List<(string, string, string?)>
                {
                    (copy.Subtotal, $"{PriceFormat.Mkd(subtotal)}", null),
                    (copy.Delivery, $"{PriceFormat.Mkd(deliveryFee)}", copy.DeliveredBy)
                };
                if (promoDiscount > 0) totalLines.Add(($"{copy.Promotion} {HtmlEncode(promoCode)}", $"- {PriceFormat.Mkd(promoDiscount)}", null));
                if (giftVoucherAmount > 0) totalLines.Add((copy.GiftVoucher, $"- {PriceFormat.Mkd(giftVoucherAmount)}", null));
                if (pointsDiscount > 0) totalLines.Add((copy.PointsDiscount, $"- {PriceFormat.Mkd(pointsDiscount)}", null));
                // Each row is shown in whole denars; any leftover from rounding gets its own row so the email adds up.
                var rounding = PriceFormat.Round(totalAmount) - (PriceFormat.Round(subtotal) + PriceFormat.Round(deliveryFee)
                    - PriceFormat.Round(promoDiscount) - PriceFormat.Round(giftVoucherAmount) - PriceFormat.Round(pointsDiscount));
                if (rounding != 0) totalLines.Add((copy.Rounding, $"{(rounding > 0 ? "+" : "-")} {PriceFormat.Mkd(Math.Abs(rounding))}", null));
                if (!string.IsNullOrWhiteSpace(freeGiftName)) totalLines.Add((copy.FreeGift, HtmlEncode(freeGiftName), null));

                var courierCommissionHtml = isPaymentConfirmed
                    ? ""
                    : await CourierCommissionNoteAsync(totalAmount, copy);

                var rows =
                    EmailLayout.Hero(statusTitle, statusLabel, EmailLayout.Tone.Yellow,
                        HtmlEncode(string.Format(copy.Greeting, userFullName)), HtmlEncode(statusDescription)) +
                    EmailLayout.Row(EmailLayout.Panel(
                        EmailLayout.SectionTitle(copy.SectionOrder) +
                            EmailLayout.Field(copy.OrderNumber, $"#{HtmlEncode(orderNumber)}") +
                            EmailLayout.Field(copy.OrderDate, $"{orderDate:dd.MM.yyyy HH:mm}") +
                            EmailLayout.Field(copy.Payment, HtmlEncode(paymentLine), last: true),
                        EmailLayout.SectionTitle(copy.SectionBuyer) +
                            EmailLayout.Field(copy.Name, HtmlEncode(userFullName)) +
                            EmailLayout.Field(copy.Phone, HtmlEncode(customerPhone)) +
                            EmailLayout.Field(copy.Email, HtmlEncode(userEmail), last: true),
                        EmailLayout.SectionTitle(copy.SectionDelivery) +
                            EmailLayout.Field(copy.Name, HtmlEncode(shippingName)) +
                            EmailLayout.Field(copy.Address, HtmlEncode(shippingAddress)) +
                            EmailLayout.Field(copy.City, $"{HtmlEncode(shippingPostCode)} {HtmlEncode(shippingCity)}", last: true))) +
                    EmailLayout.Row(EmailLayout.SectionTitle(copy.ItemsOrdered) + productsHtml, "8px 36px 8px 36px") +
                    voucherHtml +
                    EmailLayout.Row(EmailLayout.Totals(totalLines, copy.Total, $"{PriceFormat.Mkd(totalAmount)}"), "8px 36px 26px 36px") +
                    courierCommissionHtml +
                    (string.IsNullOrWhiteSpace(orderNote)
                        ? ""
                        : EmailLayout.Row(EmailLayout.Field(copy.YourNote, $"<span style='font-weight:400; color:{EmailLayout.Body};'>{HtmlEncode(orderNote)}</span>", last: true))) +
                    EmailLayout.Row(
                        EmailLayout.Button($"{EmailLayout.SiteUrl}/order-confirmation/{orderId}", copy.ViewOrder) +
                        EmailLayout.Note(copy.ThankYou, "20px 0 0 0"),
                        "4px 36px 34px 36px");

                string emailBody = EmailLayout.Page(emailSubject, string.Format(copy.ConfirmationPreheader, statusTitle, orderNumber), rows, copy.AutomatedFooter, copy.Location, language: copy.Language);
                var customerEmailSent = false;
                if (hasCustomerEmail)
                {
                    customerEmailSent = await SendAsync(new[] { userEmail }, emailSubject, emailBody);
                    if (customerEmailSent)
                        logger.LogInformation("Order confirmation email sent to {Email}", EmailMask.Mask(userEmail));
                    else
                        logger.LogWarning("Order confirmation email failed for {Email}", EmailMask.Mask(userEmail));
                }
                else
                {
                    logger.LogWarning("Order confirmation email skipped because order {OrderId} does not have a customer email.", orderId);
                }

                // Send seller notification
                var sellerNotificationSent = false;
                if (sendSellerNotification)
                {
                    sellerNotificationSent = await SendSellerNotificationAsync(
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

                logger.LogInformation("Order email summary. OrderId={OrderId}, CustomerEmailSent={CustomerEmailSent}, SellerNotificationSent={SellerNotificationSent}", orderId, customerEmailSent, sellerNotificationSent);

                return customerEmailSent;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send order confirmation email for order {OrderId}", orderId);
                return false;
            }
        }

        // Cash on delivery: the courier charges the buyer its own commission for collecting the payment.
        private async Task<string> CourierCommissionNoteAsync(decimal totalAmount, OrderEmailCopy copy)
        {
            ShippingSettings settings;
            try
            {
                settings = await commerceSettings.GetShippingAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not load shipping settings for the courier commission note.");
                settings = new ShippingSettings();
            }

            var commission = settings.CourierCodCommission(totalAmount);
            var text = string.Format(copy.CourierText,
                $"{PriceFormat.Mkd(settings.CourierCodThreshold)}",
                $"{PriceFormat.Mkd(settings.CourierCodFixedFee)}",
                settings.CourierCodPercent.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture).Replace('.', ','));
            var thisOrder = string.Format(copy.CourierThisOrder, $"{PriceFormat.Mkd(commission)}");
            return EmailLayout.Row(EmailLayout.Callout(
                $"<p style='margin:0 0 6px 0; font-size:15px; line-height:22px; font-weight:700; color:{EmailLayout.Ink};'>{HtmlEncode(copy.CourierTitle)}</p>" +
                $"<p style='margin:0; font-size:14px; line-height:22px; color:{EmailLayout.Body};'>{HtmlEncode(text)}<br><strong>{HtmlEncode(thisOrder)}</strong></p>"));
        }

        private async Task<bool> SendSellerNotificationAsync(int orderId, string customerName, string customerEmail, string orderNumber, decimal totalAmount, decimal deliveryFee, decimal subtotal, DateTime orderDate, List<dynamic> orderData, bool isPaymentConfirmed)
        {
            try
            {
                var itemRows = new List<string[]>();
                foreach (var item in orderData)
                {
                    string displayName = item.Product_Name;
                    if (!string.IsNullOrEmpty(item.Variant_Name))
                        displayName += $" - {item.Variant_Name}";
                    if (!string.IsNullOrEmpty(item.Variant_Packaging))
                        displayName += $" ({item.Variant_Packaging})";

                    string sku = Convert.ToString(item.Variant_SKU) ?? "";
                    itemRows.Add(new string[]
                    {
                        HtmlEncode(displayName) + (string.IsNullOrWhiteSpace(sku) ? "" : $"<div style='font-size:12px; color:{EmailLayout.Muted};'>{HtmlEncode(sku)}</div>"),
                        Convert.ToString(item.Quantity) ?? "",
                        $"{PriceFormat.Mkd(item.Product_Price)}",
                        $"{PriceFormat.Mkd(item.Item_Subtotal)}"
                    });
                }
                var productsHtml = EmailLayout.ItemsTable(new[]
                {
                    ("Product", "left", false, false),
                    ("Qty", "center", false, false),
                    ("Price", "right", true, false),
                    ("Total", "right", false, false)
                }, itemRows);

                // Get phone from order
                var phone = await orderProvider.GetBillingPhoneAsync(orderId);
                var notificationTitle = isPaymentConfirmed ? "Paid order received" : "Cash on delivery order received";
                var paymentStatusText = isPaymentConfirmed ? "Paid online" : "Cash on delivery";
                var subjectPrefix = isPaymentConfirmed ? "PAID ORDER" : "COD ORDER";

                var rows =
                    EmailLayout.Hero(notificationTitle, subjectPrefix, EmailLayout.Tone.Yellow,
                        $"Order <strong>#{HtmlEncode(orderNumber)}</strong> needs review and fulfillment.") +
                    EmailLayout.Row(EmailLayout.Panel(
                        EmailLayout.Field("Customer", HtmlEncode(customerName)) +
                            EmailLayout.Field("Email", HtmlEncode(customerEmail)) +
                            EmailLayout.Field("Phone", HtmlEncode(phone ?? "N/A"), last: true),
                        EmailLayout.Field("Order date", $"{orderDate:MMMM dd, yyyy HH:mm}") +
                            EmailLayout.Field("Payment", HtmlEncode(paymentStatusText)) +
                            EmailLayout.Field("Total", $"{PriceFormat.Mkd(totalAmount)}", last: true))) +
                    EmailLayout.Row(EmailLayout.SectionTitle("Order items") + productsHtml, "8px 36px 8px 36px") +
                    EmailLayout.Row(EmailLayout.Totals(new List<(string, string, string?)>
                    {
                        ("Subtotal", $"{PriceFormat.Mkd(subtotal)}", null),
                        ("Delivery fee", $"{PriceFormat.Mkd(deliveryFee)}", null)
                    }, "Total", $"{PriceFormat.Mkd(totalAmount)}"), "8px 36px 34px 36px");

                string emailBody = EmailLayout.Page($"{subjectPrefix} #{orderNumber}", $"{notificationTitle} - #{orderNumber}", rows, "Automated order notification for the Proteini.si team.");
                var sellerRecipients = GetSellerNotificationRecipients();
                var sellerEmailSent = await SendAsync(sellerRecipients, $"{subjectPrefix} #{orderNumber} - {customerName}", emailBody);
                if (sellerEmailSent)
                    logger.LogInformation("Seller notification sent for {Kind} #{OrderNumber}", subjectPrefix.ToLowerInvariant(), orderNumber);
                else
                    logger.LogWarning("Seller notification failed for {Kind} #{OrderNumber}", subjectPrefix.ToLowerInvariant(), orderNumber);
                return sellerEmailSent;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send seller notification for order {OrderId}", orderId);
                return false;
            }
        }

        public async Task<bool> SendAdminStatusEmailAsync(OrderStatusSnapshot order, string orderStatus, string paymentStatus, string? trackingNumber = null, string? trackingUrl = null)
        {
            var customerEmail = Convert.ToString(order.Billing_Email);
            if (string.IsNullOrWhiteSpace(customerEmail))
                return false;

            var orderNumber = Convert.ToString(order.Order_Number) ?? order.Order_Id.ToString();
            var copy = OrderEmailCopy.For(order.Language);
            var customerName = Convert.ToString(order.Billing_FullName) ?? copy.DefaultCustomerName;
            decimal totalAmount = Convert.ToDecimal(order.Total_Amount ?? 0);
            var statusTitle = copy.StatusTitles.GetValueOrDefault(orderStatus, copy.StatusTitleFallback);
            var tone = copy.StatusTitles.ContainsKey(orderStatus) ? EmailLayout.Tone.Yellow : EmailLayout.Tone.Ink;
            var emailSubject = $"{statusTitle} - #{orderNumber} | Proteini.mk";
            var statusLabel = copy.StatusLabels.GetValueOrDefault(orderStatus, orderStatus);
            var paymentLabel = copy.PaymentLabels.GetValueOrDefault(paymentStatus, paymentStatus);
            var statusMessage = copy.StatusMessages.GetValueOrDefault(orderStatus, copy.StatusMessageFallback);
            var safeTrackingUrl = !string.IsNullOrWhiteSpace(trackingUrl)
                && Uri.TryCreate(trackingUrl, UriKind.Absolute, out var parsedTrackingUrl)
                && parsedTrackingUrl.Scheme is "https" or "http"
                    ? parsedTrackingUrl.AbsoluteUri
                    : null;
            var trackingHtml = string.IsNullOrWhiteSpace(trackingNumber) && safeTrackingUrl == null
                ? string.Empty
                : EmailLayout.Row(EmailLayout.Callout(
                    EmailLayout.Field(copy.TrackingNumber, $"<span style='font-family:\"Courier New\", Courier, monospace; font-size:17px; letter-spacing:1px;'>{HtmlEncode(trackingNumber ?? "-")}</span>", last: safeTrackingUrl == null) +
                    (safeTrackingUrl == null ? string.Empty : $"<div style='margin-top:4px;'>{EmailLayout.Button(safeTrackingUrl, copy.TrackShipment)}</div>")));

            var rows =
                EmailLayout.Hero(statusTitle, statusLabel, tone,
                    HtmlEncode(string.Format(copy.Dear, customerName)), HtmlEncode(statusMessage)) +
                EmailLayout.Row(EmailLayout.Panel(
                    EmailLayout.Field(copy.OrderNumber, $"#{HtmlEncode(orderNumber)}") +
                        EmailLayout.Field(copy.Total, $"{PriceFormat.Mkd(totalAmount)}", last: true),
                    EmailLayout.Field(copy.OrderStatus, HtmlEncode(statusLabel)) +
                        EmailLayout.Field(copy.PaymentStatus, HtmlEncode(paymentLabel), last: true))) +
                trackingHtml +
                EmailLayout.Row(EmailLayout.Note(copy.ContactNote), "4px 36px 34px 36px");

            var emailBody = EmailLayout.Page(emailSubject, $"{statusTitle} · #{orderNumber}", rows, copy.AutomatedFooter, copy.Location, language: copy.Language);
            try
            {
                return await SendAsync(
                    new[] { customerEmail },
                    emailSubject,
                    emailBody,
                    includeOrderCopyRecipients: false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send admin order status email for order {OrderId}", order.Order_Id);
                return false;
            }
        }

        public async Task SendCancellationAsync(OrderCancelOutcome order)
        {
            try
            {
                var copy = OrderEmailCopy.For(order.Language);
                var subject = string.Format(copy.CancelledSubject, order.Order_Number);
                var rows =
                    EmailLayout.Hero(copy.CancelledTitle, copy.CancelledLabel, EmailLayout.Tone.Yellow,
                        string.Format(copy.CancelledIntro, HtmlEncode(order.User_FullName), HtmlEncode(order.Order_Number))) +
                    (order.Points_Redeemed > 0
                        ? EmailLayout.Row(EmailLayout.Callout($"<p style='margin:0; font-size:15px; line-height:22px; color:{EmailLayout.Ink};'>{string.Format(copy.PointsRefunded, order.Points_Redeemed)}</p>"))
                        : "") +
                    EmailLayout.Row(
                        EmailLayout.Note(copy.NotRequested) +
                        $"<p style='margin:18px 0 22px 0; font-size:15px; line-height:24px; color:{EmailLayout.Body};'>{copy.SeeYouSoon}</p>" +
                        EmailLayout.Button(EmailLayout.SiteUrl, copy.ContinueShopping),
                        "0 36px 34px 36px");

                string emailBody = EmailLayout.Page(subject, $"{copy.CancelledTitle} · #{order.Order_Number}", rows, copy.AutomatedFooter, copy.Location, language: copy.Language);
                await SendAsync(new[] { order.User_Email }, subject, emailBody);
                logger.LogInformation("Cancellation email sent to {Email}", EmailMask.Mask(order.User_Email));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send cancellation email for order {OrderNumber}", order.Order_Number);
            }
        }

        public async Task<(bool Sent, string OrderNumber)> SendSampleOrderConfirmationAsync(string email)
        {
            var orderNumber = $"TEST-{DateTime.Now:yyyyMMdd-HHmmss}";
            var rows =
                EmailLayout.Hero("Order received", "Test email", EmailLayout.Tone.Ink,
                    "Hi Test Customer, this is a development test of the Proteini.si order confirmation email.") +
                EmailLayout.Row(EmailLayout.Panel(
                    EmailLayout.Field("Order number", $"#{HtmlEncode(orderNumber)}") +
                        EmailLayout.Field("Order date", $"{DateTime.Now:MMMM dd, yyyy HH:mm}", last: true),
                    EmailLayout.Field("Payment", "Cash on delivery", last: true))) +
                EmailLayout.Row(EmailLayout.SectionTitle("Items ordered") + EmailLayout.ItemsTable(new[]
                {
                    ("Product", "left", false, false),
                    ("Qty", "center", false, false),
                    ("Price", "right", true, false),
                    ("Total", "right", false, false)
                }, new[] { new[] { "Sample Protein Product", "1", "1.000 MKD", "1.000 MKD" } }), "8px 36px 8px 36px") +
                EmailLayout.Row(EmailLayout.Totals(new List<(string, string, string?)>
                {
                    ("Subtotal", "1.000 MKD", null),
                    ("Delivery", "150 MKD", null)
                }, "Total", "1.150 MKD"), "8px 36px 34px 36px");

            var emailBody = EmailLayout.Page($"Test Order Received - #{orderNumber}", "Test order confirmation", rows, "Development test email.");
            var sent = await SendAsync(new[] { email }, $"Test Order Received - #{orderNumber}", emailBody, includeOrderCopyRecipients: false);
            return (sent, orderNumber);
        }

        public async Task<(string SampleNumber, EmailSendResult Result)> SendSmtpSampleAsync(string email)
        {
            var sampleNumber = $"SMTP-{DateTime.Now:yyyyMMdd-HHmmss}";
            var rows =
                EmailLayout.Hero("SMTP diagnostic", "Test email", EmailLayout.Tone.Ink,
                    "This email confirms the backend reached the SMTP provider.") +
                EmailLayout.Row(EmailLayout.Panel(
                    EmailLayout.Field("Test ID", HtmlEncode(sampleNumber)) +
                    EmailLayout.Field("Sent at", $"{DateTime.Now:yyyy-MM-dd HH:mm:ss}", last: true)), "0 36px 34px 36px");

            var emailBody = EmailLayout.Page($"Proteini.mk SMTP Diagnostic - {sampleNumber}", "SMTP diagnostic", rows);
            var result = await SendDetailedAsync(new[] { email }, $"Proteini.mk SMTP Diagnostic - {sampleNumber}", emailBody, includeOrderCopyRecipients: false);
            return (sampleNumber, result);
        }

        // Order rows come back as dynamic Dapper rows; older procs may not return Language yet.
        private static string? ReadLanguage(object row) =>
            row is IDictionary<string, object?> values && values.TryGetValue("Language", out var value)
                ? Convert.ToString(value)
                : null;

        public List<string> GetSellerNotificationRecipients()
        {
            var configuredRecipients = ParseRecipientSetting(config["MailSettings:OrderNotificationEmail"])
                .Concat(config
                .GetSection("MailSettings:SellerRecipients")
                .GetChildren()
                .Select(value => value.Value)
                .SelectMany(ParseRecipientSetting))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (configuredRecipients.Any())
                return configuredRecipients;

            logger.LogWarning("No order notification email configured. Falling back to proteini@yahoo.com");
            return new List<string> { "proteini@yahoo.com" };
        }

        private List<string> GetOrderCopyRecipients(IEnumerable<string> toRecipients)
        {
            var toRecipientSet = toRecipients
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var configured = ParseRecipientSetting(config["MailSettings:OrderCopyRecipients"])
                .Concat(config
                    .GetSection("MailSettings:OrderCopyRecipients")
                    .GetChildren()
                    .Select(value => value.Value)
                    .SelectMany(ParseRecipientSetting))
                .ToList();

            // Configured copy recipients replace the built-in shop addresses, so stage can point
            // copies at a test inbox instead of the shop owners.
            if (configured.Count == 0)
                configured.AddRange(DefaultOrderCopyRecipients);

            return configured
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

        private async Task<bool> SendAsync(IEnumerable<string?> recipients, string subject, string body, bool includeOrderCopyRecipients = true) =>
            (await SendDetailedAsync(recipients, subject, body, includeOrderCopyRecipients)).Success;

        private Task<EmailSendResult> SendDetailedAsync(IEnumerable<string?> recipients, string subject, string body, bool includeOrderCopyRecipients)
        {
            var recipientList = recipients
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .Cast<string>()
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var ccRecipients = includeOrderCopyRecipients && recipientList.Count > 0
                ? GetOrderCopyRecipients(recipientList)
                : new List<string>();

            return emailSender.SendDetailedAsync(recipientList, ccRecipients, subject, body);
        }
    }
}
