using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class OrderController(
    IOrderService orderService,
    IOrderEmailService orderEmailService,
    ICPayService cpayService,
    IConfiguration config,
    ILogger<OrderController> logger) : ControllerBase
{
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

        var configuredDiagnosticsKey = config["MailSettings:DiagnosticsKey"] ?? config["AppSettings:DiagnosticsKey"];
        if (string.IsNullOrWhiteSpace(configuredDiagnosticsKey))
            return false;

        var providedDiagnosticsKey = Request.Headers["X-Diagnostics-Key"].FirstOrDefault() ?? Request.Query["diagnosticsKey"].FirstOrDefault();
        return string.Equals(providedDiagnosticsKey, configuredDiagnosticsKey, StringComparison.Ordinal);
    }

    private string? GetEnvironmentName() =>
        config["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

    private bool IsDevelopment() =>
        string.Equals(GetEnvironmentName(), "Development", StringComparison.OrdinalIgnoreCase);

    [AllowAnonymous]
    [HttpPost("Create")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
    {
        var result = await orderService.CreateAsync(orderDto, GetCurrentUserId());

        if (result.PaymentFormHtml != null)
            return Content(result.PaymentFormHtml, "text/html");

        if (result.PaymentUrl != null)
        {
            return Ok(new
            {
                status = result.Status,
                message = result.Message,
                orderId = result.OrderId,
                orderNumber = result.OrderNumber,
                totalAmount = result.TotalAmount,
                paymentMethod = result.PaymentMethod,
                paymentUrl = result.PaymentUrl,
                requiresFormSubmit = false,
                pointsRedeemed = result.PointsRedeemed,
                pointsDiscount = result.PointsDiscount,
                promoDiscount = result.PromoDiscount,
                giftVoucherAmount = result.GiftVoucherAmount,
                freeGift = result.FreeGift,
                pointsToEarn = result.PointsToEarn,
                guestAccessToken = result.GuestAccessToken
            });
        }

        return Ok(new
        {
            status = result.Status,
            message = result.Message,
            orderId = result.OrderId,
            orderNumber = result.OrderNumber,
            totalAmount = result.TotalAmount,
            paymentMethod = result.PaymentMethod,
            orderConfirmationEmailSent = result.OrderConfirmationEmailSent,
            pointsRedeemed = result.PointsRedeemed,
            pointsDiscount = result.PointsDiscount,
            promoDiscount = result.PromoDiscount,
            giftVoucherAmount = result.GiftVoucherAmount,
            freeGift = result.FreeGift,
            pointsToEarn = result.PointsToEarn,
            guestAccessToken = result.GuestAccessToken
        });
    }

    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    [SkipClientKey]
    [HttpPost("cpay-webhook")]
    public async Task<IActionResult> HandleCPayWebhook()
    {
        try
        {
            var callbackParams = await ReadPaymentCallbackParametersAsync();
            var orderId = GetPaymentOrderId(callbackParams);
            var paymentStatus = GetPaymentStatus(callbackParams);
            var transactionId = GetFirstValue(callbackParams, "transaction_id", "TransactionId", "cPayPaymentRef", "PaymentRef");

            logger.LogInformation("Received cPay webhook: OrderId={OrderId}, Status={Status}", orderId, paymentStatus);

            if (orderId <= 0)
                return BadRequest(new { message = "Missing order id" });

            if (!HasCpayChecksum(callbackParams) || !cpayService.ProcessCallback(callbackParams))
            {
                logger.LogWarning("Invalid or missing cPay checksum for order {OrderId}", orderId);
                return BadRequest(new { message = "Invalid signature" });
            }

            var result = await orderService.ApplyPaymentStatusAsync(orderId, paymentStatus, transactionId);
            if (result != null)
                return Ok(new { status = result.Success, result.EmailSent, result.Message });

            return Ok("OK");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing cPay webhook");
            return BadRequest(new { message = "Error processing callback" });
        }
    }

    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    [SkipClientKey]
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
                return BrowserRedirect($"{frontendUrl}/payment/failure?error=missing-order-id");

            if (!HasCpayChecksum(callbackParams) || !cpayService.ProcessCallback(callbackParams))
            {
                logger.LogWarning("cPay {Result} return could not be verified. OrderId={OrderId}", result, orderId);
                return BrowserRedirect($"{frontendUrl}/payment/failure?orderId={orderId}&error=payment-verification-failed");
            }

            // Only grants access to guest orders, so it is safe to add for every order.
            var guestToken = orderService.CreateGuestAccessToken(orderId);

            if (string.Equals(result, "success", StringComparison.OrdinalIgnoreCase))
            {
                var completion = await orderService.CompleteCPayPaymentAsync(orderId, GetFirstValue(callbackParams, "AmountToPay"), transactionId);
                if (!completion.Success)
                    return BrowserRedirect($"{frontendUrl}/payment/failure?orderId={orderId}&token={guestToken}&error=payment-verification-failed");

                return BrowserRedirect($"{frontendUrl}/payment/success?orderId={orderId}&token={guestToken}&transaction_id={Uri.EscapeDataString(transactionId ?? string.Empty)}&emailSent={completion.EmailSent.ToString().ToLowerInvariant()}");
            }

            await orderService.MarkPaymentFailedAsync(orderId, transactionId);
            return BrowserRedirect($"{frontendUrl}/payment/failure?orderId={orderId}&token={guestToken}&error=payment-failed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing cPay return");
            return BrowserRedirect($"{frontendUrl}/payment/failure?error=payment-processing-error");
        }
    }

    // cPay sends the same request to the OK/Fail URL both as a browser redirect and as a server push,
    // and retries the push until it gets 200 OK, so redirects are done client-side instead of with a 302.
    private ContentResult BrowserRedirect(string url)
    {
        var htmlUrl = WebUtility.HtmlEncode(url);
        var jsUrl = JsonSerializer.Serialize(url);

        return Content(
            $"<!DOCTYPE html><html><head><meta http-equiv=\"refresh\" content=\"0;url={htmlUrl}\"></head>" +
            $"<body><script>window.location.replace({jsUrl});</script><a href=\"{htmlUrl}\">Continue</a></body></html>",
            "text/html");
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

    private static string? GetPaymentStatus(IReadOnlyDictionary<string, string> parameters) =>
        GetFirstValue(parameters, "payment_status", "PaymentStatus", "status", "Status");

    private static string? GetFirstValue(IReadOnlyDictionary<string, string> parameters, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (parameters.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }

    private static bool HasCpayChecksum(IReadOnlyDictionary<string, string> parameters) =>
        parameters.ContainsKey("ReturnCheckSum") && parameters.ContainsKey("ReturnCheckSumHeader");

    private string GetFrontendUrl() =>
        (config["AppSettings:FrontendUrl"]
            ?? config["AppSettings:PublicBaseUrl"]
            ?? config["CPayConfiguration:SuccessUrl"]?.Replace("/payment/success", "", StringComparison.OrdinalIgnoreCase)
            ?? "https://proteini.mk").TrimEnd('/');

    [Authorize(Policy = "SuperAdmin")]
    [HttpGet("cpay-debug-simple")]
    public IActionResult DebugCPayFormSimple() => Content(orderService.GetSamplePaymentForm(), "text/html");

    [Authorize(Policy = "SuperAdmin")]
    [HttpGet("cpay-debug")]
    public async Task<IActionResult> DebugCPayForm()
    {
        var cpayHtml = await orderService.GetLastOrderPaymentFormAsync();
        return cpayHtml == null
            ? Content("No orders found. Please create an order first.", "text/plain")
            : Content(cpayHtml, "text/plain");
    }

    [Authorize(Policy = "SuperAdmin")]
    [HttpPost("debug/send-order-confirmation-test")]
    public async Task<IActionResult> SendOrderConfirmationTest([FromQuery] string email = "proteinisi@gmail.com", [FromQuery] int? orderId = null, [FromQuery] bool paymentConfirmed = false)
    {
        if (!IsDevelopment())
            return NotFound();

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { status = false, message = "Email is required" });

        var targetOrderId = orderId ?? await orderService.GetLastOrderIdAsync();
        if (targetOrderId <= 0)
            return NotFound(new { status = false, message = "No order found to use for the test email" });

        var sent = await orderEmailService.SendOrderConfirmationAsync(targetOrderId, paymentConfirmed, email, sendSellerNotification: false);

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
    public async Task<IActionResult> SendSampleOrderConfirmationTest([FromQuery] string email = "proteinisi@gmail.com")
    {
        if (!IsDevelopment())
            return NotFound();

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { status = false, message = "Email is required" });

        var (sent, orderNumber) = await orderEmailService.SendSampleOrderConfirmationAsync(email);

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

        var mailSettings = config.GetSection("MailSettings");
        var sellerRecipients = orderEmailService.GetSellerNotificationRecipients();

        return Ok(new
        {
            status = true,
            environment = GetEnvironmentName() ?? "unknown",
            mailSettings = new
            {
                hostConfigured = !string.IsNullOrWhiteSpace(mailSettings["host"]),
                host = mailSettings["host"],
                smtpPort = mailSettings.GetValue<int?>("SMTPPort") ?? 587,
                enableSsl = mailSettings.GetValue<bool?>("EnableSsl") ?? true,
                senderUsernameConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_username"]),
                senderUsername = EmailMask.Mask(mailSettings["sender_username"]),
                senderEmailConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_email"]),
                senderEmail = EmailMask.Mask(mailSettings["sender_email"]),
                senderName = mailSettings["sender_name"] ?? "Proteini.mk",
                senderPasswordConfigured = !string.IsNullOrWhiteSpace(mailSettings["sender_password"]),
                senderPasswordLength = mailSettings["sender_password"]?.Length ?? 0,
                orderNotificationEmailConfigured = !string.IsNullOrWhiteSpace(mailSettings["OrderNotificationEmail"]),
                sellerRecipientCount = sellerRecipients.Count,
                sellerRecipients = sellerRecipients.Select(EmailMask.Mask).ToList()
            }
        });
    }

    [Authorize(Policy = "SuperAdmin")]
    [HttpGet("admin/debug/order-email-data/{orderId}")]
    public async Task<IActionResult> GetOrderEmailDataDebug(int orderId)
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Diagnostics key or admin access required" });

        if (orderId <= 0)
            return BadRequest(new { status = false, message = "A valid orderId is required" });

        var (order, items) = await orderService.GetEmailDebugDataAsync(orderId);
        if (order == null)
            return NotFound(new { status = false, message = $"Order {orderId} was not found" });

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
                customerEmail = EmailMask.Mask((string?)order.Customer_Email),
                customerFullName = order.Customer_FullName,
                billingEmail = EmailMask.Mask((string?)order.Billing_Email),
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
    public async Task<IActionResult> SendSmtpSampleDebug([FromQuery] string email)
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Diagnostics key or admin access required" });

        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            return BadRequest(new { status = false, message = "A valid email is required" });

        var (sampleNumber, result) = await orderEmailService.SendSmtpSampleAsync(email);

        return Ok(new
        {
            status = result.Success,
            sampleNumber,
            email = EmailMask.Mask(email),
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

        if (!await orderService.ExistsAsync(orderId))
            return NotFound(new { status = false, message = $"Order {orderId} was not found" });

        var sent = await orderEmailService.SendOrderConfirmationAsync(
            orderId,
            paymentConfirmed,
            string.IsNullOrWhiteSpace(email) ? null : email,
            sendSellerNotification);

        return Ok(new
        {
            status = sent,
            orderId,
            overrideEmail = EmailMask.Mask(email),
            paymentConfirmed,
            sendSellerNotification,
            message = sent ? "Order confirmation email sent" : "Order confirmation email failed. Check backend logs for detailed SMTP diagnostics."
        });
    }

    [AllowAnonymous]
    [HttpGet("Confirmation/{orderId}")]
    public async Task<IActionResult> GetOrderConfirmation(int orderId, [FromQuery] string? token = null)
    {
        var userId = GetCurrentUserId();
        var (order, items) = userId > 0
            ? await orderService.GetConfirmationAsync(orderId, userId)
            : await orderService.GetGuestConfirmationAsync(orderId, token);
        return Ok(new { status = true, order, items });
    }

    // Stands in for cPay while CPayConfiguration:TestMode is on (stage/dev); it does not exist otherwise.
    [AllowAnonymous]
    [HttpPost("MockPayment")]
    public async Task<IActionResult> MockPayment([FromBody] MockPaymentDto payment)
    {
        if (!config.GetSection("CPayConfiguration").GetValue<bool>("TestMode", false))
            return NotFound();

        var userId = GetCurrentUserId();
        if (userId > 0)
            await orderService.GetConfirmationAsync(payment.Order_Id, userId);
        else
            await orderService.GetGuestConfirmationAsync(payment.Order_Id, payment.Token);

        var status = string.Equals(payment.Payment_Status, "completed", StringComparison.OrdinalIgnoreCase) ? "completed" : "failed";
        var result = await orderService.ApplyPaymentStatusAsync(payment.Order_Id, status, $"MOCK_{Guid.NewGuid():N}");
        return Ok(new { status = result?.Success ?? true, message = result?.Message ?? "Payment status updated" });
    }

    [HttpPost("Cancel/{orderId}")]
    public async Task<IActionResult> CancelOrder(int orderId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        await orderService.CancelAsync(orderId, userId);
        return Ok(new { status = true, message = "Order cancelled successfully. Your refund will be processed within 5-7 business days." });
    }

    [HttpGet("CanCancel/{orderId}")]
    public async Task<IActionResult> CanCancelOrder(int orderId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        var result = await orderService.GetCancellationStatusAsync(orderId, userId);
        return Ok(new
        {
            canCancel = result.CanCancel,
            orderStatus = result.OrderStatus,
            hoursRemaining = result.HoursRemaining
        });
    }

    [Authorize(Policy = "SuperAdmin")]
    [HttpPost("UpdatePaymentStatus")]
    public async Task<IActionResult> UpdatePaymentStatus([FromBody] UpdatePaymentStatusDto paymentUpdate)
    {
        if (!IsDevelopment() && !IsAdmin())
            return Unauthorized(new { message = "Admin access required" });

        var result = await orderService.ApplyPaymentStatusAsync(paymentUpdate.Order_Id, paymentUpdate.Payment_Status, paymentUpdate.Transaction_Id);
        if (result != null)
            return Ok(new { status = result.Success, message = result.Message, confirmationEmailSent = result.EmailSent });

        return Ok(new { status = true, message = "Payment status updated", confirmationEmailSent = false });
    }

    [HttpGet("Admin")]
    public async Task<IActionResult> GetAdminOrders(
        [FromQuery] string? orderStatus = null,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? sortBy = "date",
        [FromQuery] string? sortOrder = "desc")
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Admin access required" });

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var (totalCount, orders) = await orderService.GetAdminPageAsync(orderStatus, paymentStatus, search, page, pageSize, sortBy, sortOrder);

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

    [HttpGet("Admin/Export.csv")]
    public async Task<IActionResult> ExportAdminOrders(
        [FromQuery] string? orderStatus = null,
        [FromQuery] string? paymentStatus = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Admin access required" });

        var export = await orderService.ExportAdminCsvAsync(orderStatus, paymentStatus, search, from, to);
        return File(export.Content, "text/csv; charset=utf-8", export.FileName);
    }

    [HttpPost("Admin/Status")]
    public async Task<IActionResult> UpdateAdminOrderStatus([FromBody] AdminUpdateOrderStatusDto statusUpdate)
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Admin access required" });

        var result = await orderService.UpdateAdminStatusAsync(statusUpdate);
        if (result.ConfirmationEmailSent.HasValue)
            return Ok(new { status = result.Status, message = result.Message, confirmationEmailSent = result.ConfirmationEmailSent.Value });

        return Ok(new
        {
            status = result.Status,
            message = result.Message,
            orderStatus = result.OrderStatus,
            paymentStatus = result.PaymentStatus,
            trackingNumber = result.TrackingNumber,
            trackingUrl = result.TrackingUrl,
            emailSent = result.EmailSent
        });
    }

    [HttpGet("Admin/{orderId}")]
    public async Task<IActionResult> GetAdminOrderDetails(int orderId)
    {
        if (!IsAdmin())
            return Unauthorized(new { message = "Admin access required" });

        var (order, items, freeGifts, issuedVouchers, voucherRedemptions) = await orderService.GetAdminDetailsAsync(orderId);
        return Ok(new { status = true, order, items, freeGifts, issuedVouchers, voucherRedemptions });
    }

    [HttpGet("Admin/{orderId:int}/document")]
    public async Task<IActionResult> DownloadOperationalOrderDocument(int orderId)
    {
        if (!IsAdmin()) return Forbid();

        var document = await orderService.GetOperationalDocumentAsync(orderId);
        if (document == null) return NotFound(new { message = "Order document was not found." });

        return File(document.Content, "text/html; charset=utf-8", document.FileName);
    }

    [HttpGet("History")]
    public async Task<IActionResult> GetOrderHistory()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        return Ok(new { status = true, orders = await orderService.GetHistoryAsync(userId) });
    }
}
