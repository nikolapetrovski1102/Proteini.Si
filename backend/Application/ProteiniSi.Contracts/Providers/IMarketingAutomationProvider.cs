using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IMarketingAutomationProvider
{
    Task SetConsentAsync(string? email, int? userId, bool consent, string source, DateTime? givenAt);
    Task<List<MarketingEmailTemplate>> GetTemplatesAsync();
    Task<bool> UpdateTemplateAsync(MarketingEmailTemplate template, string? updatedBy);
    Task<bool> TryClaimRunAsync(string templateCode, DateOnly runDate, bool force);
    Task<List<MarketingRecipient>> GetWelcomeRecipientsAsync(int minAgeHours, int maxAgeDays, int capHours);
    Task<List<MarketingRecipient>> GetAbandonedCheckoutsAsync(int minAgeHours, int maxAgeHours, int capHours);
    Task<List<ReplenishmentItem>> GetReplenishmentsAsync(int daysBefore, int minServings, int capHours);
    Task<List<NewDiscountRecipient>> GetNewDiscountRecipientsAsync(int maxAgeDays, int capHours);
    /// <summary>The discount and the products it currently discounts (biggest saving first); null when it no longer exists.</summary>
    Task<MarketingDiscount?> GetDiscountProductsAsync(int discountId, int top);
    Task<List<FeaturedProduct>> GetFeaturedProductsAsync(int top);
    Task<bool> TryLogAsync(string templateCode, string email, int? userId, string referenceKey, string status, string? error);
    Task<(List<MarketingLogEntry> Entries, MarketingAudienceStats Stats)> GetRecentLogAsync(int top);
}
