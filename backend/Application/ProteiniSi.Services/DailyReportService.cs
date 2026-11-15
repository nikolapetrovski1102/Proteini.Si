using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

/// <summary>
/// The daily report: business numbers for the admins (SuperAdmin accounts plus
/// DailyReport:AdminRecipients) and server health plus errors for the developer
/// (DailyReport:DeveloperRecipients). Each day is claimed in DailyReportRuns so a re-run
/// never emails twice unless forced.
/// </summary>
public class DailyReportService(
    IAnalyticsProvider provider,
    IEmailSender emailSender,
    IConfiguration config,
    ILogger<DailyReportService> logger) : IDailyReportService
{
    public const int EventRetentionDays = 400;

    public static TimeZoneInfo ShopTimeZone(IConfiguration config)
    {
        var id = config["DailyReport:TimeZone"] ?? "Europe/Skopje";
        try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
        catch (TimeZoneNotFoundException) { return TimeZoneInfo.Utc; }
    }

    public async Task<DailyReportResult> RunAsync(DailyReportRequest request, Func<DateTimeOffset, DateTimeOffset, Task<ServerStatusReport>>? collectServerStatus)
    {
        var result = new DailyReportResult();
        var dryRun = !string.IsNullOrWhiteSpace(request.DryRunFolder);

        // SQL Server runs in shop-local time (GETDATE()), so the DB window is the local day.
        var from = request.Date.ToDateTime(TimeOnly.MinValue);
        var to = from.AddDays(1);
        var zone = ShopTimeZone(config);
        var fromUtc = new DateTimeOffset(from, zone.GetUtcOffset(from));
        var toUtc = new DateTimeOffset(to, zone.GetUtcOffset(to));

        if (!dryRun)
        {
            if (request.Force)
                await provider.UnmarkReportAsync(request.Date);

            if (!await provider.TryMarkReportSentAsync(request.Date))
            {
                result.Skipped = true;
                result.Messages.Add($"Report for {request.Date:yyyy-MM-dd} was already sent. Use --force to send it again.");
                return result;
            }
        }

        var anySent = false;
        var anyFailed = false;
        DailyReportData? data = null;

        try
        {
            data = await provider.GetDailyReportAsync(from, to);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Daily report query failed for {Date}", request.Date);
            result.Messages.Add($"Business data query failed: {ex.Message}");
        }

        if (request.SendBusinessReport && data != null)
        {
            DailyReportSummary? previous = null;
            try
            {
                previous = (await provider.GetDailyReportAsync(from.AddDays(-1), from)).Summary;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Previous-day comparison failed");
            }

            var (subject, html) = DailyReportEmails.BuildBusiness(request.Date, data, previous);
            var recipients = await GetAdminRecipientsAsync();
            var sent = await DeliverAsync("business", recipients, subject, html, request.DryRunFolder, result);
            result.BusinessSent = sent;
            anySent |= sent;
            anyFailed |= !sent;
        }
        else if (request.SendBusinessReport)
        {
            anyFailed = true;
        }

        if (request.SendServerReport)
        {
            ServerStatusReport status;
            try
            {
                status = collectServerStatus != null ? await collectServerStatus(fromUtc, toUtc) : new ServerStatusReport();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Server status collection failed");
                status = new ServerStatusReport { HostName = Environment.MachineName };
                status.CollectorNotes.Add($"collector crashed: {ex.Message}");
            }

            if (data == null)
                status.CollectorNotes.Add("business report query failed, check the database");

            try
            {
                if (await provider.GetDatabaseInfoAsync() is { } db)
                    status.Databases.Add(db);
            }
            catch (Exception ex)
            {
                status.CollectorNotes.Add($"database info: {ex.Message}");
            }

            var (subject, html) = DailyReportEmails.BuildServer(request.Date, status, data?.Summary);
            var sent = await DeliverAsync("server", GetRecipients("DailyReport:DeveloperRecipients"), subject, html, request.DryRunFolder, result);
            result.ServerSent = sent;
            anySent |= sent;
            anyFailed |= !sent;
        }

        // Nothing went out: release the day so the next run (or a retry) can send it.
        if (!dryRun && !anySent && anyFailed)
            await provider.UnmarkReportAsync(request.Date);

        if (!dryRun)
        {
            try
            {
                var purged = await provider.PurgeEventsAsync(DateTime.Now.AddDays(-EventRetentionDays));
                if (purged > 0) result.Messages.Add($"Purged {purged} old site events.");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Purging old site events failed");
            }
        }

        return result;
    }

    private async Task<bool> DeliverAsync(string kind, List<string> recipients, string subject, string html, string? dryRunFolder, DailyReportResult result)
    {
        if (!string.IsNullOrWhiteSpace(dryRunFolder))
        {
            Directory.CreateDirectory(dryRunFolder);
            var path = Path.Combine(dryRunFolder, $"daily-report-{kind}.html");
            await File.WriteAllTextAsync(path, html);
            result.Messages.Add($"{kind}: written to {path} (would go to {string.Join(", ", recipients.Select(r => EmailMask.Mask(r)))})");
            return true;
        }

        if (recipients.Count == 0)
        {
            result.Messages.Add($"{kind}: no recipients configured, not sent.");
            logger.LogWarning("Daily {Kind} report has no recipients", kind);
            return false;
        }

        // One email per recipient so admins do not see each other's addresses.
        var ok = true;
        foreach (var recipient in recipients)
        {
            var send = await emailSender.SendDetailedAsync(new[] { recipient }, Array.Empty<string>(), subject, html);
            ok &= send.Success;
            result.Messages.Add($"{kind}: {(send.Success ? "sent to" : "FAILED for")} {EmailMask.Mask(recipient)}{(send.Success ? "" : $" ({send.Message})")}");
        }
        return ok;
    }

    private async Task<List<string>> GetAdminRecipientsAsync()
    {
        var recipients = GetRecipients("DailyReport:AdminRecipients");
        if (config.GetValue("DailyReport:IncludeSuperAdmins", true))
        {
            try
            {
                recipients.AddRange(await provider.GetAdminEmailsAsync());
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not load admin emails");
            }
        }

        var excluded = GetRecipients("DailyReport:ExcludeRecipients").ToHashSet(StringComparer.OrdinalIgnoreCase);
        return recipients
            .Where(r => !excluded.Contains(r))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private List<string> GetRecipients(string key) =>
        new[] { config[key] }
            .Concat(config.GetSection(key).GetChildren().Select(c => c.Value))
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .SelectMany(v => v!.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Where(v => v.Contains('@'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
}
