using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class MarketingProvider(ISqlHelper sql) : IMarketingProvider
{
    public Task SubscribeAsync(string email, string source) =>
        sql.ExecuteAsync(StoredProcedures.Marketing.Subscribe, new { Email = email, Source = source });

    public Task UnsubscribeAsync(string email) =>
        sql.ExecuteAsync(StoredProcedures.Marketing.Unsubscribe, new { Email = email });

    public Task<PagedResult<NewsletterSubscriber>> GetSubscribersAsync(string? search, int offset, int pageSize) =>
        GetPagedAsync<NewsletterSubscriber>(StoredProcedures.Marketing.GetSubscribersPaged, search, offset, pageSize);

    public Task<List<NewsletterSubscriber>> GetAllSubscribersAsync() =>
        sql.QueryAsync<NewsletterSubscriber>(StoredProcedures.Marketing.GetAllSubscribers);

    public async Task<bool> UpdateSubscriberStatusAsync(int id, bool isActive) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Marketing.UpdateSubscriberStatus, new { Id = id, IsActive = isActive }) > 0;

    public Task<PagedResult<MarketingUserSummary>> GetUsersAsync(string? search, int offset, int pageSize) =>
        GetPagedAsync<MarketingUserSummary>(StoredProcedures.Marketing.GetUsersPaged, search, offset, pageSize);

    public Task<List<MarketingUser>> GetAllUsersAsync() =>
        sql.QueryAsync<MarketingUser>(StoredProcedures.Marketing.GetAllUsers);

    private Task<PagedResult<T>> GetPagedAsync<T>(string procedure, string? search, int offset, int pageSize) =>
        sql.QueryMultipleAsync(procedure, new { Search = search, Offset = offset, PageSize = pageSize }, async grid =>
        {
            var totalCount = await grid.ReadSingleAsync<int>();
            var items = (await grid.ReadAsync<T>()).ToList();
            return new PagedResult<T>(items, totalCount);
        });
}
