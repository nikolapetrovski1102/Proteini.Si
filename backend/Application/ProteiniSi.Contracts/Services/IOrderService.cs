using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IOrderService
{
    Task<OrderCheckoutResult> CreateAsync(CreateOrderDto orderDto, int userId);
    Task<PaymentCompletionResult> CompletePaidOrderAsync(int orderId, string? transactionId, bool sendEmail = true, string completedOrderStatus = "paid");
    Task<PaymentCompletionResult?> ApplyPaymentStatusAsync(int orderId, string? paymentStatus, string? transactionId);
    Task MarkPaymentFailedAsync(int orderId, string? transactionId);

    Task<(dynamic Order, List<dynamic> Items)> GetConfirmationAsync(int orderId, int userId);
    Task CancelAsync(int orderId, int userId);
    Task<OrderCancellationStatus> GetCancellationStatusAsync(int orderId, int userId);
    Task<List<dynamic>> GetHistoryAsync(int userId);

    Task<(int TotalCount, List<dynamic> Orders)> GetAdminPageAsync(string? orderStatus, string? paymentStatus, string? search, int page, int pageSize, string? sortBy, string? sortOrder);
    Task<FileDownload> ExportAdminCsvAsync(string? orderStatus, string? paymentStatus, string? search, DateTime? from, DateTime? to);
    Task<OrderAdminStatusResult> UpdateAdminStatusAsync(AdminUpdateOrderStatusDto statusUpdate);
    Task<(dynamic Order, List<dynamic> Items, List<dynamic> FreeGifts, List<dynamic> IssuedVouchers, List<dynamic> VoucherRedemptions)> GetAdminDetailsAsync(int orderId);
    Task<FileDownload?> GetOperationalDocumentAsync(int orderId);

    string GetSamplePaymentForm();
    Task<string?> GetLastOrderPaymentFormAsync();
    Task<int> GetLastOrderIdAsync();
    Task<bool> ExistsAsync(int orderId);
    Task<(dynamic? Order, List<dynamic> Items)> GetEmailDebugDataAsync(int orderId);
}
