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
        ILogger<OrderEmailService> logger) : IOrderEmailService
    {
        private static readonly string[] DefaultOrderCopyRecipients =
        {
            "gtsport8@yahoo.com",
            "vladimir.proteinisi@gmail.com"
        };

        public async Task<bool> SendOrderConfirmationAsync(int orderId, bool isPaymentConfirmed = true, string? overrideRecipient = null, bool sendSellerNotification = true)
        {
            try
            {
                var orderData = await orderProvider.GetEmailDataAsync(orderId);

                if (orderData.Count == 0) return false;

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

                var issuedVouchers = await orderProvider.GetIssuedVouchersAsync(orderId);
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

        private async Task<bool> SendSellerNotificationAsync(int orderId, string customerName, string customerEmail, string orderNumber, decimal totalAmount, decimal deliveryFee, decimal subtotal, DateTime orderDate, List<dynamic> orderData, bool isPaymentConfirmed)
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
                var phone = await orderProvider.GetBillingPhoneAsync(orderId);
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

        public async Task<bool> SendAdminStatusEmailAsync(OrderStatusSnapshot order, string orderStatus, string paymentStatus, string? confirmationNumber = null)
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
                return await SendAsync(
                    new[] { customerEmail },
                    $"Proteini.mk order confirmation - #{orderNumber}",
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
            <p>Dear {HtmlEncode(order.User_FullName)},</p>
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

                await SendAsync(new[] { order.User_Email }, $"Order Cancelled - #{order.Order_Number}", emailBody);
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

            var sent = await SendAsync(new[] { email }, $"Test Order Received - #{orderNumber}", emailBody, includeOrderCopyRecipients: false);
            return (sent, orderNumber);
        }

        public async Task<(string SampleNumber, EmailSendResult Result)> SendSmtpSampleAsync(string email)
        {
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


            var result = await SendDetailedAsync(new[] { email }, $"Proteini.mk SMTP Diagnostic - {sampleNumber}", emailBody, includeOrderCopyRecipients: false);
            return (sampleNumber, result);
        }

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

            logger.LogWarning("No order notification email configured. Falling back to gtsport8@yahoo.com");
            return new List<string> { "gtsport8@yahoo.com" };
        }

        private List<string> GetOrderCopyRecipients(IEnumerable<string> toRecipients)
        {
            var toRecipientSet = toRecipients
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return ParseRecipientSetting(config["MailSettings:OrderCopyRecipients"])
                .Concat(config
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

        private static string GetEmailLogoHtml()
        {
            return "<img src='https://proteini.mk/logos/proteini-invoice-logo.png' alt='Proteini.mk' width='220' style='display:block; width:220px; max-width:100%; height:auto; border:0;' />";
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
