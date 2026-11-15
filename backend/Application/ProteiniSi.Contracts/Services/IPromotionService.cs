using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IPromotionService
{
    Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal);
    Task<PromotionValidationResult> ValidateAsync(PromotionValidationDto validation);
    /// <summary>What a referral code gives, for showing its price in the shop before checkout. Null when it can't be used.</summary>
    Task<PromotionPreview?> GetPreviewAsync(string code);
    Task<List<PromoCode>> GetCodesAsync();
    Task<int> CreateCodeAsync(PromotionCodeUpsertDto code);
    Task UpdateCodeAsync(int id, PromotionCodeUpsertDto code);
    Task<bool> DeleteCodeAsync(int id);
    Task<List<FreeGift>> GetFreeGiftsAsync();
    Task<int> CreateFreeGiftAsync(FreeGiftUpsertDto gift);
    Task UpdateFreeGiftAsync(int id, FreeGiftUpsertDto gift);
    Task<bool> DeleteFreeGiftAsync(int id);
    Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to);
    Task<CsvExport> ExportUsageReportAsync(DateTime? from, DateTime? to);
}
