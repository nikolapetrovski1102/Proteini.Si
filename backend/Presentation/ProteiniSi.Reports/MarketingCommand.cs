using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Data;
using ProteiniSi.Dtos;
using ProteiniSi.Services;

namespace ProteiniSi.Reports;

/// <summary>"marketing" sub-command: sends the automated marketing emails that are due.</summary>
public static class MarketingCommand
{
    public static async Task<int> RunAsync(string[] args)
    {
        var options = new MarketingRunOptions();
        string? samplesDir = null, samplesTo = null;
        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--dry-run" when i + 1 < args.Length: options.DryRunDirectory = args[++i]; break;
                case "--redirect-to" when i + 1 < args.Length: options.RedirectTo = args[++i].Trim(); break;
                case "--only" when i + 1 < args.Length: options.Only = args[++i].Trim().ToLowerInvariant(); break;
                case "--samples" when i + 1 < args.Length: samplesDir = args[++i]; break;
                case "--samples-to" when i + 1 < args.Length: samplesTo = args[++i].Trim(); break;
                case "--force": options.Force = true; break;
                case "-h" or "--help":
                    Console.WriteLine("usage: ProteiniSi.Reports marketing [--only welcome|abandoned_checkout|replenishment] [--force] [--dry-run <folder>] [--redirect-to <email>]\n" +
                        "       ProteiniSi.Reports marketing --samples <folder> | --samples-to <email>   (every template with sample data, like the admin preview)");
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
        builder.Services.AddDataAccess();
        builder.Services.AddApplicationServices();
        ProteiniSi.Services.Helpers.EmailLayout.Configure(builder.Configuration["AppSettings:FrontendUrl"]);

        using var host = builder.Build();
        using var scope = host.Services.CreateScope();
        var marketing = scope.ServiceProvider.GetRequiredService<IMarketingAutomationService>();

        using var cancel = new CancellationTokenSource();
        Console.CancelKeyPress += (_, e) => { e.Cancel = true; cancel.Cancel(); };

        if (samplesDir != null || samplesTo != null)
            return await SamplesAsync(marketing, options.Only, samplesDir, samplesTo);

        var results = await marketing.RunAsync(options, cancel.Token);
        foreach (var r in results)
            Console.WriteLine($"{r.TemplateCode,-20} {r.Outcome,-32} candidates {r.Candidates}, sent {r.Sent}, failed {r.Failed}, skipped {r.Skipped}");

        return results.Any(r => r.Failed > 0 || r.Outcome.StartsWith("error", StringComparison.Ordinal)) ? 1 : 0;
    }

    /// <summary>Renders (or emails) every template with the admin preview's sample customer and products.</summary>
    private static async Task<int> SamplesAsync(IMarketingAutomationService marketing, string? only, string? folder, string? email)
    {
        var codes = (await marketing.GetTemplatesAsync()).Select(t => t.Code).Where(c => only == null || c == only).ToList();
        if (folder != null) Directory.CreateDirectory(folder);
        var failed = 0;
        foreach (var code in codes)
        {
            if (folder != null)
            {
                var (preview, error) = await marketing.PreviewAsync(code, null);
                if (preview == null) { Console.Error.WriteLine($"{code}: {error}"); failed++; continue; }
                var path = Path.Combine(folder, $"{code}.html");
                await File.WriteAllTextAsync(path, preview.Html);
                Console.WriteLine($"{code,-20} {path}  ({preview.Subject})");
            }
            if (email != null)
            {
                var (success, message) = await marketing.SendTestAsync(code, null, email, null);
                Console.WriteLine($"{code,-20} {(success ? "sent" : "FAILED")} {message}");
                if (!success) failed++;
            }
        }
        return failed > 0 ? 1 : 0;
    }
}
