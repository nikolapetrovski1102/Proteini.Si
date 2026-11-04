using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IPromotionProvider
{
    Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal);
    Task<PromoCodeEligibility?> GetCodeForValidationAsync(string code, string? customerEmail);
    Task<List<PromoCode>> GetCodesAsync();
    Task<(PromotionWriteResult Result, int? PromoCodeId)> CreateCodeAsync(PromoCodeValues values);
    Task<PromotionWriteResult> UpdateCodeAsync(int id, PromoCodeValues values);
    Task<PromotionDeleteResult> DeleteCodeAsync(int id);
    Task<List<FreeGift>> GetFreeGiftsAsync();
    Task<(PromotionWriteResult Result, int? FreeGiftId)> CreateFreeGiftAsync(FreeGiftValues values);
    Task<PromotionWriteResult> UpdateFreeGiftAsync(int id, FreeGiftValues values);
    Task<PromotionDeleteResult> DeleteFreeGiftAsync(int id);
    Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to);
}
