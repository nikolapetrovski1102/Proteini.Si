using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IGiftVoucherProvider
{
    Task<GiftVoucherBalance?> GetByCodeAsync(string code);
    Task<PagedResult<GiftVoucher>> GetPagedAsync(string? search, string? status, int offset, int pageSize);
    Task<bool> UpdateStatusAsync(int id, string status, DateTime? expiresAt);
    Task<List<GiftVoucherReportRow>> GetReportAsync();
    Task<GiftVoucherDetails?> GetDetailsAsync(string code);
    /// <summary>Throws <see cref="ProteiniSi.Contracts.Exceptions.BadRequestException"/> when the voucher can't be used.</summary>
    Task<GiftVoucherStoreRedemptionResult> RedeemInStoreAsync(string code, decimal amount, string? redeemedBy, string? note);
}
