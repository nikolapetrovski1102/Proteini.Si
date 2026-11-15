using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IPromotionProvider
{
    Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal);
    Task<PromoCodeEligibility?> GetCodeForValidationAsync(string code, string? customerEmail);
    Task<List<PromoCode>> GetCodesAsync();
    /// <summary>Which of the given products the code applies to (all of them for an "all products" code).</summary>
    Task<HashSet<int>> GetEligibleProductIdsAsync(int promoCodeId, IEnumerable<int> productIds);
    /// <summary>Every product a "products"/"categories" code applies to (empty for an "all products" code).</summary>
    Task<List<int>> GetTargetProductIdsAsync(int promoCodeId);
    Task<(PromotionWriteResult Result, int? PromoCodeId)> CreateCodeAsync(PromoCodeValues values);
    Task<PromotionWriteResult> UpdateCodeAsync(int id, PromoCodeValues values);
    Task<PromotionDeleteResult> DeleteCodeAsync(int id);
    Task<List<FreeGift>> GetFreeGiftsAsync();
    Task<(PromotionWriteResult Result, int? FreeGiftId)> CreateFreeGiftAsync(FreeGiftValues values);
    Task<PromotionWriteResult> UpdateFreeGiftAsync(int id, FreeGiftValues values);
    Task<PromotionDeleteResult> DeleteFreeGiftAsync(int id);
    Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to);
}
