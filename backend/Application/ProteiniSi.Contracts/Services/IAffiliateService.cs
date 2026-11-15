using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IAffiliateService
{
    Task<List<AffiliateSummary>> GetAllAsync(DateTime? from, DateTime? to);
    Task<AffiliateDetails> GetDetailsAsync(int id, DateTime? from, DateTime? to);
    Task<int> CreateAsync(AffiliateUpsertDto dto);
    Task UpdateAsync(int id, AffiliateUpsertDto dto);
    Task<bool> DeleteAsync(int id);
    Task<int> AddCodeAsync(int affiliateId, PromotionCodeUpsertDto dto);
    Task SetCodeOwnerAsync(int promoCodeId, int? affiliateId);
    Task<AffiliateQuickCreateResult> QuickCreateAsync(AffiliateQuickCreateDto dto);
    Task<CsvExport> ExportAsync(DateTime? from, DateTime? to);

    Task<List<ShortLink>> GetLinksAsync(DateTime? from, DateTime? to);
    Task<int> CreateLinkAsync(ShortLinkUpsertDto dto);
    Task UpdateLinkAsync(int id, ShortLinkUpsertDto dto);
    Task DeleteLinkAsync(int id);
    Task<ShortLinkTarget?> ResolveLinkAsync(string slug, bool countClick);
}
