using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IGiftVoucherService
{
    Task<GiftVoucherValidationResult> ValidateAsync(GiftVoucherValidationDto validation);
    Task<PagedResult<GiftVoucher>> GetPagedAsync(string? search, string? status, int page, int pageSize);
    Task UpdateStatusAsync(int id, GiftVoucherStatusDto update);
    Task<CsvExport> ExportReportAsync();
}
