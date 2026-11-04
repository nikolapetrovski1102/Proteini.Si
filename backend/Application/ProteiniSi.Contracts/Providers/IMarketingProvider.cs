using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IMarketingProvider
{
    Task SubscribeAsync(string email, string source);
    Task UnsubscribeAsync(string email);
    Task<PagedResult<NewsletterSubscriber>> GetSubscribersAsync(string? search, int offset, int pageSize);
    Task<List<NewsletterSubscriber>> GetAllSubscribersAsync();
    Task<bool> UpdateSubscriberStatusAsync(int id, bool isActive);
    Task<PagedResult<MarketingUserSummary>> GetUsersAsync(string? search, int offset, int pageSize);
    Task<List<MarketingUser>> GetAllUsersAsync();
}
