using System.Globalization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Data;
using ProteiniSi.Dtos;
using ProteiniSi.Reports;
using ProteiniSi.Services;

// Daily report, run once a day by proteinisi-daily-report.timer.
//
//   ProteiniSi.Reports                      yesterday (shop time), skipped if already sent
//   ProteiniSi.Reports --date 2026-11-09    a specific day
//   ProteiniSi.Reports --force              send again even if already sent
//   ProteiniSi.Reports --dry-run ./out      write the HTML instead of emailing
//   ProteiniSi.Reports --only business      or: server
//
// Marketing emails, run every 15 minutes by proteinisi-marketing.timer (each template goes out once a
// day, in the first run at or after its send time in Skopje):
//
//   ProteiniSi.Reports marketing                         send what is due
//   ProteiniSi.Reports marketing --dry-run ./out         write the emails that would go out now as HTML
//   ProteiniSi.Reports marketing --redirect-to a@b.mk    send one real example per template to a@b.mk
//   ProteiniSi.Reports marketing --only welcome --force  run now, even outside the send time / again today

if (args.Length > 0 && args[0] == "marketing")
    return await MarketingCommand.RunAsync(args[1..]);

// Instant alerts, run every 5 minutes by proteinisi-alerts.timer: emails the developer as soon as a
// service, health check, the database, disk/memory or a certificate goes bad, or new errors are logged.
//
//   ProteiniSi.Reports alerts                    check and email what is new
//   ProteiniSi.Reports alerts --dry-run ./out    write the alert email instead of sending it
//   ProteiniSi.Reports alerts --test             send a test alert
if (args.Length > 0 && args[0] == "alerts")
    return await AlertCommand.RunAsync(args[1..]);

string? dateArg = null, dryRun = null, only = null;
var force = false;
for (var i = 0; i < args.Length; i++)
{
    switch (args[i])
    {
        case "--date" when i + 1 < args.Length: dateArg = args[++i]; break;
        case "--dry-run" when i + 1 < args.Length: dryRun = args[++i]; break;
        case "--only" when i + 1 < args.Length: only = args[++i].ToLowerInvariant(); break;
        case "--force": force = true; break;
        case "-h" or "--help":
            Console.WriteLine("usage: ProteiniSi.Reports [--date yyyy-MM-dd] [--force] [--dry-run <folder>] [--only business|server]");
            return 0;
        default:
            Console.Error.WriteLine($"unknown argument: {args[i]}");
            return 2;
    }
}
if (only is not (null or "business" or "server"))
{
    Console.Error.WriteLine("--only must be business or server");
    return 2;
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
    client.DefaultRequestHeaders.UserAgent.ParseAdd("ProteiniSi-DailyReport/1.0");
});
builder.Services.AddDataAccess();
builder.Services.AddApplicationServices();
ProteiniSi.Services.Helpers.EmailLayout.Configure(builder.Configuration["AppSettings:FrontendUrl"]);
builder.Services.AddSingleton<ServerStatusCollector>();

using var host = builder.Build();
using var scope = host.Services.CreateScope();

var zone = DailyReportService.ShopTimeZone(builder.Configuration);
DateOnly date;
if (dateArg != null)
{
    if (!DateOnly.TryParseExact(dateArg, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
    {
        Console.Error.WriteLine("--date must be yyyy-MM-dd");
        return 2;
    }
}
else
{
    date = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zone)).AddDays(-1);
}

var collector = scope.ServiceProvider.GetRequiredService<ServerStatusCollector>();
var reports = scope.ServiceProvider.GetRequiredService<IDailyReportService>();
var result = await reports.RunAsync(new DailyReportRequest
{
    Date = date,
    Force = force,
    DryRunFolder = dryRun,
    SendBusinessReport = only is null or "business",
    SendServerReport = only is null or "server"
}, collector.CollectAsync);

Console.WriteLine($"Daily report {date:yyyy-MM-dd}");
foreach (var message in result.Messages)
    Console.WriteLine("  " + message);

if (result.Skipped) return 0;
var wantedBusiness = only is null or "business";
var wantedServer = only is null or "server";
return (!wantedBusiness || result.BusinessSent) && (!wantedServer || result.ServerSent) ? 0 : 1;
