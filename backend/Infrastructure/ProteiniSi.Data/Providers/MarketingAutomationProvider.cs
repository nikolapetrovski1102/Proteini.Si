using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class MarketingAutomationProvider(ISqlHelper sql) : IMarketingAutomationProvider
{
    public Task SetConsentAsync(string? email, int? userId, bool consent, string source, DateTime? givenAt) =>
        sql.ExecuteAsync(StoredProcedures.MarketingAutomation.SetConsent,
            new { Email = email, UserId = userId, Consent = consent, Source = source, GivenAt = givenAt });

    public Task<List<MarketingEmailTemplate>> GetTemplatesAsync() =>
        sql.QueryAsync<MarketingEmailTemplate>(StoredProcedures.MarketingAutomation.GetTemplates);

    public async Task<bool> UpdateTemplateAsync(MarketingEmailTemplate t, string? updatedBy) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.MarketingAutomation.UpdateTemplate, new
        {
            t.Code,
            t.IsActive,
            t.SendTime,
            t.DelayValue,
            t.Subject,
            t.Preheader,
            t.Heading,
            t.Body,
            t.ButtonText,
            t.ButtonUrl,
            t.CouponCode,
            t.CouponText,
            UpdatedBy = updatedBy,
            t.SubjectAl,
            t.PreheaderAl,
            t.HeadingAl,
            t.BodyAl,
            t.ButtonTextAl,
            t.CouponTextAl
        }) > 0;

    public async Task<bool> TryClaimRunAsync(string templateCode, DateOnly runDate, bool force) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.MarketingAutomation.ClaimRun,
            new { TemplateCode = templateCode, RunDate = runDate.ToDateTime(TimeOnly.MinValue), Force = force }) == 1;

    public Task<List<MarketingRecipient>> GetWelcomeRecipientsAsync(int minAgeHours, int maxAgeDays, int capHours) =>
        sql.QueryAsync<MarketingRecipient>(StoredProcedures.MarketingAutomation.GetWelcomeRecipients,
            new { MinAgeHours = minAgeHours, MaxAgeDays = maxAgeDays, CapHours = capHours });

    public Task<List<MarketingRecipient>> GetAbandonedCheckoutsAsync(int minAgeHours, int maxAgeHours, int capHours) =>
        sql.QueryAsync<MarketingRecipient>(StoredProcedures.MarketingAutomation.GetAbandonedCheckouts,
            new { MinAgeHours = minAgeHours, MaxAgeHours = maxAgeHours, CapHours = capHours });

    public Task<List<ReplenishmentItem>> GetReplenishmentsAsync(int daysBefore, int minServings, int capHours) =>
        sql.QueryAsync<ReplenishmentItem>(StoredProcedures.MarketingAutomation.GetReplenishments,
            new { DaysBefore = daysBefore, MinServings = minServings, CapHours = capHours });

    public Task<List<NewDiscountRecipient>> GetNewDiscountRecipientsAsync(int maxAgeDays, int capHours) =>
        sql.QueryAsync<NewDiscountRecipient>(StoredProcedures.MarketingAutomation.GetNewDiscountRecipients,
            new { MaxAgeDays = maxAgeDays, CapHours = capHours });

    public Task<MarketingDiscount?> GetDiscountProductsAsync(int discountId, int top) =>
        sql.QueryMultipleAsync(StoredProcedures.MarketingAutomation.GetDiscountProducts, new { DiscountId = discountId, Top = top }, async grid =>
        {
            var discount = await grid.ReadSingleOrDefaultAsync<MarketingDiscount>();
            var products = (await grid.ReadAsync<FeaturedProduct>()).ToList();
            if (discount != null) discount.Products = products;
            return discount;
        });

    public Task<List<FeaturedProduct>> GetFeaturedProductsAsync(int top) =>
        sql.QueryAsync<FeaturedProduct>(StoredProcedures.MarketingAutomation.GetFeaturedProducts, new { Top = top });

    public async Task<bool> TryLogAsync(string templateCode, string email, int? userId, string referenceKey, string status, string? error) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.MarketingAutomation.AddLog, new
        {
            TemplateCode = templateCode,
            Email = email,
            UserId = userId,
            ReferenceKey = referenceKey,
            Status = status,
            Error = error
        }) == 1;

    public Task<(List<MarketingLogEntry> Entries, MarketingAudienceStats Stats)> GetRecentLogAsync(int top) =>
        sql.QueryMultipleAsync(StoredProcedures.MarketingAutomation.GetRecentLog, new { Top = top }, async grid =>
        (
            (await grid.ReadAsync<MarketingLogEntry>()).ToList(),
            await grid.ReadSingleAsync<MarketingAudienceStats>()
        ));
}
