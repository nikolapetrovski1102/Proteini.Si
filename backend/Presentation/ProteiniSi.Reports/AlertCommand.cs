using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Data;
using ProteiniSi.Models;
using ProteiniSi.Services;
using ProteiniSi.Services.Helpers;
using static ProteiniSi.Services.Helpers.EmailLayout;

namespace ProteiniSi.Reports;

/// <summary>
/// "alerts" sub-command, run every few minutes by proteinisi-alerts.timer. Emails the developer
/// straight away when something breaks instead of waiting for the next daily report:
///
///   * a service/container stops, a systemd unit fails, a health check fails (checked twice)
///   * the database does not answer, disk or memory runs low, a certificate is about to expire
///   * new errors (ERR/FTL) appear in the API logs, nginx error log or the journal
///
/// State (what was already reported) lives in a small JSON file, so an ongoing problem is mailed
/// once, then again every Alerts:ReminderHours, plus one "resolved" mail when it clears. The same
/// error message is mailed at most once per Alerts:ErrorRepeatMinutes.
///
///   ProteiniSi.Reports alerts                    check and email what is new
///   ProteiniSi.Reports alerts --dry-run ./out    write the email instead of sending (state untouched)
///   ProteiniSi.Reports alerts --test             send a test alert to check delivery
/// </summary>
public static class AlertCommand
{
    private static readonly CultureInfo En = CultureInfo.GetCultureInfo("en-GB");
    private static readonly JsonSerializerOptions Json = new() { WriteIndented = true };
    private const string Bad = "#b3261e";
    private const string Good = "#2e7d32";

    public static async Task<int> RunAsync(string[] args)
    {
        string? dryRun = null;
        var test = false;
        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--dry-run" when i + 1 < args.Length: dryRun = args[++i]; break;
                case "--test": test = true; break;
                case "-h" or "--help":
                    Console.WriteLine("usage: ProteiniSi.Reports alerts [--dry-run <folder>] [--test]");
                    return 0;
                default:
                    Console.Error.WriteLine($"unknown argument: {args[i]}");
                    return 2;
            }
        }

        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            Args = Array.Empty<string>(),
            ContentRootPath = AppContext.BaseDirectory
        });
        builder.Services.AddMemoryCache();
        builder.Services.AddHttpClient(ServerStatusCollector.HttpClientName, client =>
        {
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("ProteiniSi-Alerts/1.0");
        });
        builder.Services.AddDataAccess();
        builder.Services.AddApplicationServices();
        EmailLayout.Configure(builder.Configuration["AppSettings:FrontendUrl"]);
        builder.Services.AddSingleton<ServerStatusCollector>();

        using var host = builder.Build();
        using var scope = host.Services.CreateScope();
        var config = builder.Configuration;
        var options = config.GetSection("Alerts");
        var recipients = (config["DailyReport:DeveloperRecipients"] ?? "")
            .Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (!options.GetValue("Enabled", true))
        {
            Console.WriteLine("Alerts are switched off (Alerts:Enabled=false).");
            return 0;
        }

        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
        var hostName = Environment.MachineName;

        if (test)
        {
            var (testSubject, testHtml) = Build(hostName, new AlertChanges
            {
                New = { new Problem("test", "Test alert: delivery works", DateTime.UtcNow) }
            }, DateTime.UtcNow);
            return await DeliverAsync(emailSender, recipients, testSubject, testHtml, dryRun) ? 0 : 1;
        }

        var statePath = options["StateFile"] ?? "/var/lib/proteinisi/alerts-state.json";
        var state = LoadState(statePath);
        var now = DateTime.UtcNow;
        var maxWindow = TimeSpan.FromMinutes(options.GetValue("MaxWindowMinutes", 60));
        var from = state.LastCheckUtc is { } last && last < now && now - last <= maxWindow
            ? last
            : now - (state.LastCheckUtc == null ? TimeSpan.FromMinutes(10) : maxWindow);

        // ---- collect ------------------------------------------------------------------------
        var collector = scope.ServiceProvider.GetRequiredService<ServerStatusCollector>();
        var status = await collector.CollectAsync(new DateTimeOffset(from, TimeSpan.Zero), new DateTimeOffset(now, TimeSpan.Zero), includeTraffic: false);
        if (status.Endpoints.Any(e => !e.Ok))
        {
            await Task.Delay(TimeSpan.FromSeconds(options.GetValue("RecheckDelaySeconds", 20)));
            await collector.RecheckFailedEndpointsAsync(status);
        }

        var current = new Dictionary<string, string>();
        foreach (var s in status.Services.Where(s => !s.Ok)) current[$"service:{s.Name}"] = $"{s.Name} is {s.State}";
        foreach (var u in status.FailedUnits) current[$"unit:{u}"] = $"systemd unit {u} failed";
        foreach (var e in status.Endpoints.Where(e => !e.Ok))
            current[$"endpoint:{e.Name}"] = $"{e.Name} is not responding ({e.StatusCode?.ToString(En) ?? e.Error ?? "down"}) {e.Url}";
        var certDays = options.GetValue("CertificateDays", 7);
        foreach (var c in status.Certificates.Where(c => c.Error != null || c.DaysLeft < certDays))
            current[$"cert:{c.Name}"] = c.DaysLeft is { } d ? $"certificate {c.Name} expires in {d} day{(d == 1 ? "" : "s")}" : $"certificate {c.Name}: {c.Error}";
        var diskPercent = options.GetValue("DiskPercent", 90);
        foreach (var d in status.Disks.Where(d => d.UsedPercent >= diskPercent))
            current[$"disk:{d.Mount}"] = string.Create(En, $"disk {d.Mount} is {d.UsedPercent:0}% full ({d.FreeGb:0.0} GB free)");
        var memoryPercent = options.GetValue("MemoryFreePercent", 5);
        if (status.MemoryTotalMb > 0 && status.MemoryAvailableMb is { } available && available * 100 / status.MemoryTotalMb < memoryPercent)
            current["memory"] = string.Create(En, $"memory low: {available:N0} MB of {status.MemoryTotalMb:N0} MB free");

        try
        {
            if (await scope.ServiceProvider.GetRequiredService<IAnalyticsProvider>().GetDatabaseInfoAsync() == null)
                current["database"] = "database returned no info";
        }
        catch (Exception ex)
        {
            current["database"] = $"database is not answering: {ex.GetBaseException().Message}";
        }

        // ---- compare with what was already reported ------------------------------------------
        var reminder = TimeSpan.FromHours(options.GetValue("ReminderHours", 3.0));
        var changes = new AlertChanges();
        foreach (var (key, text) in current)
        {
            if (state.Active.TryGetValue(key, out var known))
            {
                known.Text = text;
                known.MissedChecks = 0;
                if (now - known.LastNotifiedUtc >= reminder)
                    changes.Ongoing.Add(new Problem(key, text, known.FirstSeenUtc));
            }
            else
            {
                changes.New.Add(new Problem(key, text, now));
            }
        }
        // A problem must be gone for two checks in a row before it counts as resolved (no flapping).
        foreach (var (key, known) in state.Active.Where(a => !current.ContainsKey(a.Key)))
        {
            known.MissedChecks++;
            if (known.MissedChecks >= 2)
                changes.Resolved.Add(new Problem(key, known.Text, known.FirstSeenUtc));
        }

        var repeat = TimeSpan.FromMinutes(options.GetValue("ErrorRepeatMinutes", 60));
        foreach (var error in status.Errors)
        {
            var signature = $"{error.Source}|{error.Level}|{error.Message}";
            if (state.ErrorsNotified.TryGetValue(signature, out var sent) && now - sent < repeat) continue;
            changes.Errors.Add(error);
        }

        Console.WriteLine($"Alert check {from:HH:mm}–{now:HH:mm} UTC: {current.Count} problem(s), {status.Errors.Count} error group(s); " +
                          $"new {changes.New.Count}, ongoing reminders {changes.Ongoing.Count}, resolved {changes.Resolved.Count}, new errors {changes.Errors.Count}");
        foreach (var note in status.CollectorNotes) Console.WriteLine("  note: " + note);

        var ok = true;
        if (changes.Any)
        {
            var (subject, html) = Build(hostName, changes, now);
            ok = await DeliverAsync(emailSender, recipients, subject, html, dryRun);
            if (dryRun != null) return ok ? 0 : 1; // dry run never touches the state
        }

        if (ok)
        {
            foreach (var p in changes.New)
                state.Active[p.Key] = new ActiveProblem { Text = p.Text, FirstSeenUtc = now, LastNotifiedUtc = now };
            foreach (var p in changes.Ongoing)
                state.Active[p.Key].LastNotifiedUtc = now;
            foreach (var p in changes.Resolved)
                state.Active.Remove(p.Key);
            foreach (var e in changes.Errors)
                state.ErrorsNotified[$"{e.Source}|{e.Level}|{e.Message}"] = now;
            state.LastCheckUtc = now;
        }
        // On a failed send the state stays as it was, so the next run tries again with the same window.

        foreach (var old in state.ErrorsNotified.Where(e => now - e.Value > TimeSpan.FromDays(2)).Select(e => e.Key).ToList())
            state.ErrorsNotified.Remove(old);

        if (dryRun == null) SaveState(statePath, state);
        return ok ? 0 : 1;
    }

    private static async Task<bool> DeliverAsync(IEmailSender sender, List<string> recipients, string subject, string html, string? dryRun)
    {
        if (dryRun != null)
        {
            Directory.CreateDirectory(dryRun);
            var path = Path.Combine(dryRun, "alert.html");
            await File.WriteAllTextAsync(path, html);
            Console.WriteLine($"  {subject}\n  written to {path} (would go to {string.Join(", ", recipients.Select(r => EmailMask.Mask(r)))})");
            return true;
        }
        if (recipients.Count == 0)
        {
            Console.Error.WriteLine("  no DailyReport:DeveloperRecipients configured, alert not sent");
            return false;
        }

        var ok = true;
        foreach (var recipient in recipients)
        {
            var send = await sender.SendDetailedAsync(new[] { recipient }, Array.Empty<string>(), subject, html);
            ok &= send.Success;
            Console.WriteLine($"  {(send.Success ? "sent to" : "FAILED for")} {EmailMask.Mask(recipient)}{(send.Success ? "" : $" ({send.Message})")}: {subject}");
        }
        return ok;
    }

    // ---- email -----------------------------------------------------------------------------

    private static (string Subject, string Html) Build(string hostName, AlertChanges c, DateTime now)
    {
        var broken = c.New.Count + c.Ongoing.Count;
        string subject;
        if (broken > 0)
        {
            var first = (c.New.FirstOrDefault() ?? c.Ongoing[0]).Text;
            var more = broken - 1 + (c.Errors.Count > 0 ? 1 : 0);
            subject = $"🚨 {first}{(more > 0 ? $" (+{more} more)" : "")} | {hostName}";
        }
        else if (c.Errors.Count > 0)
        {
            var count = c.Errors.Sum(e => e.Count);
            subject = $"🚨 {count} new error{(count == 1 ? "" : "s")}: {Shorten(c.Errors[0].Message, 80)} | {hostName}";
        }
        else
        {
            subject = $"✅ Resolved: {c.Resolved[0].Text}{(c.Resolved.Count > 1 ? $" (+{c.Resolved.Count - 1} more)" : "")} | {hostName}";
        }

        var rows = new StringBuilder();
        var heroItems = c.New.Concat(c.Ongoing).Select(p => p.Text)
            .Concat(c.Errors.Take(3).Select(e => $"{e.Count}× {Shorten(e.Message, 120)}"))
            .ToList();
        rows.Append(heroItems.Count > 0
            ? Hero("Something is wrong", "Alert", Tone.Ink, "<ul style='margin:0; padding-left:18px;'>" + string.Concat(heroItems.Select(i => $"<li>{Encode(i)}</li>")) + "</ul>")
            : Hero("Back to normal", "Resolved", Tone.Yellow, $"The problem{(c.Resolved.Count == 1 ? "" : "s")} below cleared on <strong>{Encode(hostName)}</strong>."));

        if (c.New.Count > 0)
            rows.Append(Row(SectionTitle("New problems") + List(c.New, Bad, p => "detected " + Time(now)), "8px 36px 16px 36px"));
        if (c.Ongoing.Count > 0)
            rows.Append(Row(SectionTitle("Still broken") + List(c.Ongoing, Bad, p => $"since {Time(p.SinceUtc)} ({Duration(now - p.SinceUtc)})"), "8px 36px 16px 36px"));
        if (c.Resolved.Count > 0)
            rows.Append(Row(SectionTitle("Resolved") + List(c.Resolved, Good, p => $"was broken {Duration(now - p.SinceUtc)}"), "8px 36px 16px 36px"));

        if (c.Errors.Count > 0)
        {
            var errors = new StringBuilder(SectionTitle("New errors in the logs"));
            foreach (var group in c.Errors.Take(15))
            {
                errors.Append($"<div style='margin-top:16px; padding:14px 16px; background:{Paper}; border-left:4px solid {(group.Level == "FTL" ? Bad : Yellow)}; border-radius:8px;'>");
                errors.Append($"<div style='font-size:11px; line-height:15px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:{Muted};'>{Encode(group.Source)} · {Encode(group.Level)} · {group.Count}× · {group.FirstSeen:HH:mm}{(group.Count > 1 ? $" to {group.LastSeen:HH:mm}" : "")} UTC</div>");
                errors.Append($"<div style='margin-top:4px; font-size:14px; line-height:20px; font-weight:700; color:{Ink}; word-break:break-word;'>{Encode(group.Message)}</div>");
                if (!string.IsNullOrWhiteSpace(group.Detail))
                    errors.Append($"<pre style='margin:8px 0 0 0; white-space:pre-wrap; word-break:break-all; font-family:\"Courier New\", Courier, monospace; font-size:11px; line-height:16px; color:{Body};'>{Encode(group.Detail)}</pre>");
                errors.Append("</div>");
            }
            if (c.Errors.Count > 15)
                errors.Append(Note($"+ {c.Errors.Count - 15} more distinct errors. The daily report has the full list.", "12px 0 0 0"));
            rows.Append(Row(errors.ToString(), "8px 36px 24px 36px"));
        }

        rows.Append(Row(Note($"Checked {now:yyyy-MM-dd HH:mm} UTC on {Encode(hostName)}. Ongoing problems are repeated every few hours until fixed; the same error is mailed at most once an hour."), "0 36px 34px 36px"));

        var preheader = heroItems.Count > 0 ? string.Join(", ", heroItems) : "Resolved: " + string.Join(", ", c.Resolved.Select(p => p.Text));
        return (subject, Page(subject, preheader, rows.ToString(), "Instant server alert for the developer.", width: 640));
    }

    private static string List(IEnumerable<Problem> problems, string color, Func<Problem, string> meta) =>
        string.Concat(problems.Select(p =>
            $"<div style='margin-top:12px; padding:12px 16px; background:{Paper}; border-left:4px solid {color}; border-radius:8px;'>" +
            $"<div style='font-size:14px; line-height:20px; font-weight:700; color:{Ink}; word-break:break-word;'>{Encode(p.Text)}</div>" +
            $"<div style='margin-top:2px; font-size:12px; color:{Muted};'>{Encode(meta(p))}</div></div>"));

    private static string Time(DateTime utc)
    {
        var zone = TryZone("Europe/Skopje");
        var local = TimeZoneInfo.ConvertTimeFromUtc(utc, zone);
        return local.ToString("d MMM HH:mm", En) + (zone == TimeZoneInfo.Utc ? " UTC" : " Skopje");
    }

    private static TimeZoneInfo TryZone(string id)
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
        catch (TimeZoneNotFoundException) { return TimeZoneInfo.Utc; }
    }

    private static string Duration(TimeSpan span) =>
        span.TotalMinutes < 1 ? "under a minute"
        : span.TotalHours < 1 ? $"{(int)span.TotalMinutes} min"
        : span.TotalDays < 1 ? $"{(int)span.TotalHours} h {span.Minutes} min"
        : $"{(int)span.TotalDays} d {span.Hours} h";

    private static string Shorten(string text, int max) => text.Length <= max ? text : text[..(max - 1)] + "…";

    // ---- state -----------------------------------------------------------------------------

    private static AlertState LoadState(string path)
    {
        try
        {
            if (File.Exists(path))
                return JsonSerializer.Deserialize<AlertState>(File.ReadAllText(path)) ?? new AlertState();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"  could not read {path} ({ex.Message}), starting fresh");
        }
        return new AlertState();
    }

    private static void SaveState(string path, AlertState state)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path))!);
            var temp = path + ".tmp";
            File.WriteAllText(temp, JsonSerializer.Serialize(state, Json));
            File.Move(temp, path, overwrite: true);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"  could not save {path}: {ex.Message}");
        }
    }

    private sealed record Problem(string Key, string Text, DateTime SinceUtc);

    private sealed class AlertChanges
    {
        public List<Problem> New { get; } = new();
        public List<Problem> Ongoing { get; } = new();
        public List<Problem> Resolved { get; } = new();
        public List<LogErrorGroup> Errors { get; } = new();
        public bool Any => New.Count + Ongoing.Count + Resolved.Count + Errors.Count > 0;
    }

    public sealed class AlertState
    {
        public DateTime? LastCheckUtc { get; set; }
        public Dictionary<string, ActiveProblem> Active { get; set; } = new();
        public Dictionary<string, DateTime> ErrorsNotified { get; set; } = new();
    }

    public sealed class ActiveProblem
    {
        public string Text { get; set; } = string.Empty;
        public DateTime FirstSeenUtc { get; set; }
        public DateTime LastNotifiedUtc { get; set; }
        public int MissedChecks { get; set; }
    }
}
