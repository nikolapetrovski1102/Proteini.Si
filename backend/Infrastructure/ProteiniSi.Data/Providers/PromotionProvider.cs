using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class PromotionProvider(ISqlHelper sql) : IPromotionProvider
{
    public Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal) =>
        sql.QueryAsync<ActiveFreeGift>(StoredProcedures.Promotions.GetActiveFreeGifts, new { Subtotal = subtotal });

    public Task<PromoCodeEligibility?> GetCodeForValidationAsync(string code, string? customerEmail) =>
        sql.QuerySingleOrDefaultAsync<PromoCodeEligibility>(StoredProcedures.Promotions.GetCodeForValidation, new { Code = code, CustomerEmail = customerEmail });

    public Task<List<PromoCode>> GetCodesAsync() =>
        sql.QueryAsync<PromoCode>(StoredProcedures.Promotions.GetCodes);

    public async Task<(PromotionWriteResult Result, int? PromoCodeId)> CreateCodeAsync(PromoCodeValues values)
    {
        var row = await sql.QuerySingleOrDefaultAsync<WriteRow>(StoredProcedures.Promotions.CreateCode, values);
        return ((PromotionWriteResult)row!.Result, row.PromoCodeId);
    }

    public async Task<PromotionWriteResult> UpdateCodeAsync(int id, PromoCodeValues values) =>
        (PromotionWriteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Promotions.UpdateCode, new
        {
            PromoCodeId = id,
            values.Code,
            values.Description,
            values.DiscountType,
            values.DiscountValue,
            values.MinimumOrderAmount,
            values.MaximumDiscountAmount,
            values.UsageLimit,
            values.PerCustomerLimit,
            values.ValidFrom,
            values.ValidUntil,
            values.IsActive
        });

    public async Task<PromotionDeleteResult> DeleteCodeAsync(int id) =>
        (PromotionDeleteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Promotions.DeleteCode, new { Id = id });

    public Task<List<FreeGift>> GetFreeGiftsAsync() =>
        sql.QueryAsync<FreeGift>(StoredProcedures.Promotions.GetFreeGifts);

    public async Task<(PromotionWriteResult Result, int? FreeGiftId)> CreateFreeGiftAsync(FreeGiftValues values)
    {
        var row = await sql.QuerySingleOrDefaultAsync<WriteRow>(StoredProcedures.Promotions.CreateFreeGift, values);
        return ((PromotionWriteResult)row!.Result, row.FreeGiftId);
    }

    public async Task<PromotionWriteResult> UpdateFreeGiftAsync(int id, FreeGiftValues values) =>
        (PromotionWriteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Promotions.UpdateFreeGift, new
        {
            FreeGiftId = id,
            values.ProductId,
            values.VariantId,
            values.DisplayName,
            values.MinimumOrderAmount,
            values.ValidFrom,
            values.ValidUntil,
            values.IsActive
        });

    public async Task<PromotionDeleteResult> DeleteFreeGiftAsync(int id) =>
        (PromotionDeleteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Promotions.DeleteFreeGift, new { Id = id });

    public Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to) =>
        sql.QueryAsync<PromoCodeUsageRow>(StoredProcedures.Promotions.GetUsageReport, new { From = from, To = to });

    private sealed class WriteRow
    {
        public int Result { get; init; }
        public int? PromoCodeId { get; init; }
        public int? FreeGiftId { get; init; }
    }
}
