using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IMarketingService
{
    Task SubscribeAsync(NewsletterSubscriptionDto subscription);
    Task UnsubscribeAsync(NewsletterSubscriptionDto subscription);
    Task<PagedResult<NewsletterSubscriber>> GetSubscribersAsync(string? search, int page, int pageSize);
    Task UpdateSubscriberStatusAsync(int id, bool isActive);
    Task<PagedResult<MarketingUserSummary>> GetUsersAsync(string? search, int page, int pageSize);
    Task<CsvExport> ExportSubscribersAsync();
    Task<CsvExport> ExportUsersAsync();
}
