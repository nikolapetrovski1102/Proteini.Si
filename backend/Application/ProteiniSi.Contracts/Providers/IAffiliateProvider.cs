using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IAffiliateProvider
{
    Task<List<AffiliateSummary>> GetAllAsync(DateTime? from, DateTime? to);
    Task<AffiliateDetails?> GetDetailsAsync(int id, DateTime? from, DateTime? to);
    Task<int> CreateAsync(AffiliateValues values);
    Task<AffiliateWriteResult> UpdateAsync(int id, AffiliateValues values);
    Task<PromotionDeleteResult> DeleteAsync(int id);
    Task<(AffiliateWriteResult Result, int? PromoCodeId)> AddCodeAsync(int affiliateId, PromoCodeValues values);
    Task<AffiliateWriteResult> SetCodeOwnerAsync(int promoCodeId, int? affiliateId);
    Task<(AffiliateWriteResult Result, AffiliateQuickCreateResult? Created)> QuickCreateAsync(AffiliateQuickCreateValues values);

    Task<List<ShortLink>> GetLinksAsync(DateTime? from, DateTime? to);
    Task<(AffiliateWriteResult Result, int? ShortLinkId)> CreateLinkAsync(ShortLinkValues values);
    Task<AffiliateWriteResult> UpdateLinkAsync(int id, ShortLinkValues values);
    Task<AffiliateWriteResult> DeleteLinkAsync(int id);
    Task<ShortLinkTarget?> ResolveLinkAsync(string slug, DateOnly today, bool countClick);
}
