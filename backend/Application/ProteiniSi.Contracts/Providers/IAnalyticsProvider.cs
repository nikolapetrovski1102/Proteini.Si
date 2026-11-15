using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IAnalyticsProvider
{
    Task AddEventAsync(SiteEvent siteEvent);
    Task<DailyReportData> GetDailyReportAsync(DateTime from, DateTime to);
    Task<bool> TryMarkReportSentAsync(DateOnly reportDate);
    Task UnmarkReportAsync(DateOnly reportDate);
    Task<int> PurgeEventsAsync(DateTime before);
    Task<DatabaseInfo?> GetDatabaseInfoAsync();
    Task<List<string>> GetAdminEmailsAsync();
}
