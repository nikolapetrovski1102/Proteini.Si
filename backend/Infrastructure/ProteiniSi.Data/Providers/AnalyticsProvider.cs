using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class AnalyticsProvider(ISqlHelper sql) : IAnalyticsProvider
{
    public Task AddEventAsync(SiteEvent e) =>
        sql.ExecuteAsync(StoredProcedures.Analytics.AddEvent, new
        {
            e.VisitorId,
            e.EventType,
            e.UserId,
            e.OrderId,
            e.Email,
            e.FullName,
            e.Path,
            e.Referrer
        });

    public Task<DailyReportData> GetDailyReportAsync(DateTime from, DateTime to) =>
        sql.QueryMultipleAsync(StoredProcedures.Analytics.GetDailyReport, new { From = from, To = to }, async grid => new DailyReportData
        {
            Summary = await grid.ReadSingleAsync<DailyReportSummary>(),
            Orders = (await grid.ReadAsync<DailyReportOrder>()).ToList(),
            TopProducts = (await grid.ReadAsync<DailyReportProduct>()).ToList(),
            Sources = (await grid.ReadAsync<DailyReportSource>()).ToList(),
            Leads = (await grid.ReadAsync<DailyReportLead>()).ToList()
        });

    public async Task<bool> TryMarkReportSentAsync(DateOnly reportDate) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Analytics.MarkReportSent, new { ReportDate = reportDate.ToDateTime(TimeOnly.MinValue) }) == 1;

    public Task UnmarkReportAsync(DateOnly reportDate) =>
        sql.ExecuteAsync(StoredProcedures.Analytics.UnmarkReport, new { ReportDate = reportDate.ToDateTime(TimeOnly.MinValue) });

    public async Task<int> PurgeEventsAsync(DateTime before) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Analytics.PurgeEvents, new { Before = before });

    public Task<DatabaseInfo?> GetDatabaseInfoAsync() =>
        sql.QuerySingleOrDefaultAsync<DatabaseInfo>(StoredProcedures.Analytics.DatabaseInfo);

    public Task<List<string>> GetAdminEmailsAsync() =>
        sql.QueryAsync<string>(StoredProcedures.Analytics.GetAdminEmails);
}
