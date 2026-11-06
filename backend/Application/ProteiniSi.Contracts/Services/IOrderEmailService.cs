using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IOrderEmailService
{
    Task<bool> SendOrderConfirmationAsync(int orderId, bool isPaymentConfirmed = true, string? overrideRecipient = null, bool sendSellerNotification = true);
    Task<bool> SendAdminStatusEmailAsync(OrderStatusSnapshot order, string orderStatus, string paymentStatus, string? trackingNumber = null, string? trackingUrl = null);
    Task SendCancellationAsync(OrderCancelOutcome order);
    Task<(bool Sent, string OrderNumber)> SendSampleOrderConfirmationAsync(string email);
    Task<(string SampleNumber, EmailSendResult Result)> SendSmtpSampleAsync(string email);
    List<string> GetSellerNotificationRecipients();
}
