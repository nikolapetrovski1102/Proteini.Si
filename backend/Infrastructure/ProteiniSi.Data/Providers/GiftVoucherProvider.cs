using Microsoft.Data.SqlClient;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class GiftVoucherProvider(ISqlHelper sql) : IGiftVoucherProvider
{
    public Task<GiftVoucherBalance?> GetByCodeAsync(string code) =>
        sql.QuerySingleOrDefaultAsync<GiftVoucherBalance>(StoredProcedures.GiftVouchers.GetByCode, new { Code = code });

    public Task<PagedResult<GiftVoucher>> GetPagedAsync(string? search, string? status, int offset, int pageSize) =>
        sql.QueryMultipleAsync(StoredProcedures.GiftVouchers.GetPaged,
            new { Search = search, Status = status, Offset = offset, PageSize = pageSize },
            async grid =>
            {
                var totalCount = await grid.ReadSingleAsync<int>();
                var items = (await grid.ReadAsync<GiftVoucher>()).ToList();
                return new PagedResult<GiftVoucher>(items, totalCount);
            });

    public async Task<bool> UpdateStatusAsync(int id, string status, DateTime? expiresAt) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.GiftVouchers.UpdateStatus, new { Id = id, Status = status, ExpiresAt = expiresAt }) == 1;

    public Task<List<GiftVoucherReportRow>> GetReportAsync() =>
        sql.QueryAsync<GiftVoucherReportRow>(StoredProcedures.GiftVouchers.GetReport);

    public Task<GiftVoucherDetails?> GetDetailsAsync(string code) =>
        sql.QueryMultipleAsync(StoredProcedures.GiftVouchers.GetDetails, new { Code = code },
            async grid =>
            {
                var voucher = await grid.ReadSingleOrDefaultAsync<GiftVoucherDetails>();
                var redemptions = (await grid.ReadAsync<GiftVoucherRedemption>()).ToList();
                if (voucher != null) voucher.Redemptions = redemptions;
                return voucher;
            });

    public async Task<GiftVoucherStoreRedemptionResult> RedeemInStoreAsync(string code, decimal amount, string? redeemedBy, string? note)
    {
        try
        {
            return await sql.QuerySingleOrDefaultAsync<GiftVoucherStoreRedemptionResult>(StoredProcedures.GiftVouchers.RedeemInStore,
                       new { Code = code, Amount = amount, RedeemedBy = redeemedBy, Note = note })
                   ?? throw new InvalidOperationException("Redemption returned no result.");
        }
        catch (SqlException ex) when (ex.Number >= 50000)
        {
            throw new BadRequestException(ex.Message, new { status = false, message = ex.Message });
        }
    }
}
