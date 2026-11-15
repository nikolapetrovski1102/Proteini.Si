using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

/// <summary>Automatic marketing emails: consent, scheduling, rendering and unsubscribe.</summary>
public interface IMarketingAutomationService
{
    Task SetConsentAsync(int userId, MarketingConsentDto dto);
    /// <summary>A guest's cookie-banner "yes" sent with their order (card guests never get the email code).</summary>
    Task SetGuestOrderConsentAsync(string email, DateTime? consentGivenAt);
    Task<bool> UnsubscribeAsync(string? email, string? token);
    Task<List<MarketingRunResult>> RunAsync(MarketingRunOptions options, CancellationToken cancellationToken = default);

    Task<List<MarketingTemplateDto>> GetTemplatesAsync();
    Task<(MarketingTemplateDto? Template, string? Error)> UpdateTemplateAsync(string code, MarketingTemplateUpdateDto dto, string? updatedBy);
    Task<(MarketingPreviewDto? Preview, string? Error)> PreviewAsync(string code, MarketingTemplateUpdateDto? draft);
    Task<(bool Success, string Message)> SendTestAsync(string code, MarketingTemplateUpdateDto? draft, string toEmail, string? toName);
    Task<object> GetLogAsync(int top);
}
