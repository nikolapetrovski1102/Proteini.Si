using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IOrderProvider
{
    Task<CheckoutUser?> GetCheckoutUserAsync(int userId);
    Task<int?> GetCartIdAsync(int userId);
    Task<List<CheckoutCartItem>> GetCartItemsAsync(int cartId);
    Task<GuestCheckoutProduct?> GetGuestProductAsync(int productId, int? variantId);
    Task<CheckoutPromotion?> GetPromotionAsync(string code, int userId, string customerEmail);
    Task<CheckoutFreeGift?> GetFreeGiftAsync(int freeGiftId, decimal subtotal);
    Task<OrderCreated> CreateAsync(OrderCreateRequest request);

    Task<int> CompletePaymentAsync(int orderId, string? transactionId, string orderStatus);
    Task MarkPaymentFailedAsync(int orderId, string? transactionId);
    Task<OrderCancelOutcome?> CancelAsync(int orderId, int userId, DateTime now);
    Task<OrderCancelInfo?> GetCancelInfoAsync(int orderId, int userId);

    Task<List<dynamic>> GetHistoryAsync(int userId);
    Task<(dynamic? Order, List<dynamic> Items)> GetConfirmationAsync(int orderId, int userId);

    Task<(int TotalCount, List<dynamic> Orders)> GetAdminPageAsync(OrderAdminFilter filter);
    Task<List<dynamic>> GetAdminExportAsync(string? orderStatus, string? paymentStatus, string? search, DateTime? fromDate, DateTime? toExclusive);
    Task<OrderStatusSnapshot?> GetForAdminStatusAsync(int orderId);
    Task UpdateAdminStatusAsync(int orderId, string orderStatus, string paymentStatus, string? transactionId, string? trackingNumber, string? trackingUrl, bool releaseVoucher);
    Task<(dynamic? Order, List<dynamic> Items, List<dynamic> FreeGifts, List<dynamic> IssuedVouchers, List<dynamic> VoucherRedemptions)> GetAdminDetailsAsync(int orderId);

    Task<bool> DocumentExistsAsync(int orderId);
    Task<(dynamic? Order, List<dynamic> Items)> GetDocumentSourceAsync(int orderId);
    Task RegisterDocumentAsync(int orderId, string hash, string html);
    Task<OrderDocumentFile?> GetLatestDocumentAsync(int orderId);

    Task<List<dynamic>> GetEmailDataAsync(int orderId);
    Task<List<IssuedVoucher>> GetIssuedVouchersAsync(int orderId);
    Task<string?> GetBillingPhoneAsync(int orderId);
    Task<LastOrder?> GetLastAsync();
    Task<bool> ExistsAsync(int orderId);
    Task<(dynamic? Order, List<dynamic> Items)> GetEmailDebugDataAsync(int orderId);
}
