using System.Diagnostics;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Reports;

/// <summary>
/// Gathers host health, service states, health checks, certificates and the day's errors
/// (API Serilog files, nginx, systemd journal) for the developer report. Every check is
/// independent: a failure becomes a collector note instead of stopping the report.
/// Targets come from DailyReport:Server:* in configuration.
/// </summary>
public class ServerStatusCollector(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<ServerStatusCollector> logger)
{
    public const string HttpClientName = "daily-report-health";

    private IConfigurationSection Server => config.GetSection("DailyReport:Server");

    public async Task<ServerStatusReport> CollectAsync(DateTimeOffset from, DateTimeOffset to)
    {
        var report = new ServerStatusReport
        {
            HostName = Environment.MachineName,
            CpuCount = Environment.ProcessorCount
        };

        Run(report, "uptime", () => ReadUptime(report));
        Run(report, "load", () => ReadLoad(report));
        Run(report, "memory", () => ReadMemory(report));
        Run(report, "disks", () => ReadDisks(report));
        await RunAsync(report, "services", () => ReadServicesAsync(report));
        await RunAsync(report, "health checks", () => CheckEndpointsAsync(report));
        Run(report, "certificates", () => ReadCertificates(report));
        Run(report, "API logs", () => ReadApiLogs(report, from, to));
        Run(report, "nginx", () => ReadNginx(report, from, to));
        await RunAsync(report, "journal", () => ReadJournalAsync(report, from, to));

        report.Errors = report.Errors
            .OrderByDescending(e => e.Level == "FTL")
            .ThenByDescending(e => e.Count)
            .ThenByDescending(e => e.LastSeen)
            .ToList();
        return report;
    }

    private void Run(ServerStatusReport report, string name, Action action)
    {
        try { action(); }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Collector step {Step} failed", name);
            report.CollectorNotes.Add($"{name}: {ex.Message}");
        }
    }

    private async Task RunAsync(ServerStatusReport report, string name, Func<Task> action)
    {
        try { await action(); }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Collector step {Step} failed", name);
            report.CollectorNotes.Add($"{name}: {ex.Message}");
        }
    }

    // ---- host ------------------------------------------------------------------------

    private static void ReadUptime(ServerStatusReport report)
    {
        if (!File.Exists("/proc/uptime")) return;
        var seconds = double.Parse(File.ReadAllText("/proc/uptime").Split(' ')[0], CultureInfo.InvariantCulture);
        report.Uptime = TimeSpan.FromSeconds(seconds);
    }

    private static void ReadLoad(ServerStatusReport report)
    {
        if (!File.Exists("/proc/loadavg")) return;
        report.LoadAverage = File.ReadAllText("/proc/loadavg").Split(' ').Take(3)
            .Select(v => double.Parse(v, CultureInfo.InvariantCulture)).ToArray();
    }

    private static void ReadMemory(ServerStatusReport report)
    {
        if (!File.Exists("/proc/meminfo")) return;
        var values = File.ReadAllLines("/proc/meminfo")
            .Select(l => l.Split(':', 2))
            .Where(p => p.Length == 2)
            .ToDictionary(p => p[0].Trim(), p => long.TryParse(p[1].Trim().Split(' ')[0], out var kb) ? kb / 1024 : 0);
        report.MemoryTotalMb = values.GetValueOrDefault("MemTotal");
        report.MemoryAvailableMb = values.GetValueOrDefault("MemAvailable");
        report.SwapTotalMb = values.GetValueOrDefault("SwapTotal");
        report.SwapFreeMb = values.GetValueOrDefault("SwapFree");
    }

    private void ReadDisks(ServerStatusReport report)
    {
        var mounts = Server.GetSection("Disks").Get<string[]>() ?? new[] { "/" };
        foreach (var mount in mounts)
        {
            var drive = new DriveInfo(mount);
            report.Disks.Add(new DiskStatus
            {
                Mount = mount,
                TotalGb = Math.Round(drive.TotalSize / 1024d / 1024 / 1024, 1),
                FreeGb = Math.Round(drive.AvailableFreeSpace / 1024d / 1024 / 1024, 1)
            });
        }
    }

    // ---- services ----------------------------------------------------------------------

    private async Task ReadServicesAsync(ServerStatusReport report)
    {
        if (!OperatingSystem.IsLinux()) return;

        foreach (var unit in Server.GetSection("Services").Get<string[]>() ?? Array.Empty<string>())
        {
            var show = await ExecAsync("systemctl", "show", unit, "--no-pager",
                "-p", "ActiveState", "-p", "SubState", "-p", "NRestarts", "-p", "ActiveEnterTimestamp");
            var props = show.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.Split('=', 2))
                .Where(p => p.Length == 2)
                .ToDictionary(p => p[0], p => p[1].Trim());
            report.Services.Add(new ServiceStatus
            {
                Name = unit,
                State = props.GetValueOrDefault("ActiveState") ?? "unknown",
                Restarts = int.TryParse(props.GetValueOrDefault("NRestarts"), out var restarts) ? restarts : null,
                Since = string.IsNullOrWhiteSpace(props.GetValueOrDefault("ActiveEnterTimestamp")) ? null : props["ActiveEnterTimestamp"]
            });
        }

        foreach (var container in Server.GetSection("Containers").Get<string[]>() ?? Array.Empty<string>())
        {
            string state;
            try
            {
                state = (await ExecAsync("docker", "inspect", "-f", "{{.State.Status}} {{.State.StartedAt}} {{.RestartCount}}", container)).Trim();
            }
            catch (Exception ex)
            {
                state = "missing";
                report.CollectorNotes.Add($"docker {container}: {ex.Message}");
            }
            var parts = state.Split(' ');
            report.Services.Add(new ServiceStatus
            {
                Name = $"docker: {container}",
                State = parts[0],
                Since = parts.Length > 1 && DateTimeOffset.TryParse(parts[1], CultureInfo.InvariantCulture, DateTimeStyles.None, out var started)
                    ? started.UtcDateTime.ToString("yyyy-MM-dd HH:mm 'UTC'", CultureInfo.InvariantCulture)
                    : null,
                Restarts = parts.Length > 2 && int.TryParse(parts[2], out var restarts) ? restarts : null
            });
        }

        var failed = await ExecAsync("systemctl", "list-units", "--state=failed", "--no-legend", "--plain", "--no-pager");
        report.FailedUnits = failed.Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(l => l.Trim().Split(' ')[0])
            .Where(u => u.Length > 0)
            .ToList();
    }

    private async Task CheckEndpointsAsync(ServerStatusReport report)
    {
        var client = httpClientFactory.CreateClient(HttpClientName);
        var checks = Server.GetSection("Endpoints").GetChildren()
            .Where(c => !string.IsNullOrWhiteSpace(c.Value))
            .Select(async c =>
            {
                var status = new EndpointStatus { Name = c.Key, Url = c.Value! };
                var watch = Stopwatch.StartNew();
                try
                {
                    using var response = await client.GetAsync(c.Value, HttpCompletionOption.ResponseHeadersRead);
                    status.StatusCode = (int)response.StatusCode;
                }
                catch (Exception ex)
                {
                    status.Error = ex is TaskCanceledException ? "timeout" : ex.GetBaseException().Message;
                }
                status.ElapsedMs = watch.ElapsedMilliseconds;
                return status;
            });
        report.Endpoints.AddRange(await Task.WhenAll(checks));
    }

    // Reads the origin certificates Let's Encrypt issued (Cloudflare serves its own to visitors,
    // so a TLS handshake through the public hostname would not show ours).
    private void ReadCertificates(ServerStatusReport report)
    {
        var folder = Server["CertificateFolder"] ?? "/etc/letsencrypt/live";
        foreach (var name in Server.GetSection("CertificateHosts").Get<string[]>() ?? Array.Empty<string>())
        {
            var status = new CertificateStatus { Name = name };
            try
            {
                using var cert = X509CertificateLoader.LoadCertificateFromFile(Path.Combine(folder, name, "cert.pem"));
                status.ExpiresAt = cert.NotAfter.ToUniversalTime();
                status.DaysLeft = (int)Math.Floor((status.ExpiresAt.Value - DateTime.UtcNow).TotalDays);
            }
            catch (Exception ex)
            {
                status.Error = ex is DirectoryNotFoundException or FileNotFoundException ? "certificate file not found" : ex.Message;
            }
            report.Certificates.Add(status);
        }
    }

    // ---- logs --------------------------------------------------------------------------

    private void ReadApiLogs(ServerStatusReport report, DateTimeOffset from, DateTimeOffset to)
    {
        foreach (var source in Server.GetSection("LogFolders").GetChildren())
        {
            if (string.IsNullOrWhiteSpace(source.Value) || !Directory.Exists(source.Value))
            {
                report.CollectorNotes.Add($"log folder for {source.Key} not found");
                continue;
            }

            // Serilog rolls by UTC day (proteinisi-20261110.log, plus _001 when size-limited).
            var files = new List<string>();
            for (var day = from.UtcDateTime.Date; day <= to.UtcDateTime.Date; day = day.AddDays(1))
                files.AddRange(Directory.GetFiles(source.Value, $"*{day:yyyyMMdd}*.log").Order());

            var (summary, errors) = ServerLogParser.Summarize($"API {source.Key}",
                ServerLogParser.ReadSerilog(files.SelectMany(ReadSharedLines)), from, to);
            report.LogSources.Add(summary);
            report.Errors.AddRange(errors);
        }
    }

    private void ReadNginx(ServerStatusReport report, DateTimeOffset from, DateTimeOffset to)
    {
        var accessLogs = (Server.GetSection("NginxAccessLogs").Get<string[]>() ?? Array.Empty<string>()).Where(File.Exists).ToList();
        if (accessLogs.Count > 0)
            report.Traffic = ServerLogParser.SummarizeNginx(accessLogs.SelectMany(ReadSharedLines), from, to);

        var errorLog = Server["NginxErrorLog"];
        if (string.IsNullOrWhiteSpace(errorLog)) return;
        var errorFiles = new[] { errorLog, errorLog + ".1" }.Where(File.Exists).ToList();
        if (errorFiles.Count == 0) return;

        var offset = TimeZoneInfo.Local.GetUtcOffset(DateTime.Now);
        var (summary, errors) = ServerLogParser.Summarize("nginx",
            ServerLogParser.ReadNginxErrors(errorFiles.SelectMany(ReadSharedLines), offset), from, to);
        report.LogSources.Add(summary);
        report.Errors.AddRange(errors);
    }

    private async Task ReadJournalAsync(ServerStatusReport report, DateTimeOffset from, DateTimeOffset to)
    {
        if (!OperatingSystem.IsLinux()) return;
        var units = Server.GetSection("Services").Get<string[]>() ?? Array.Empty<string>();
        if (units.Length == 0) return;

        var args = new List<string>
        {
            "-p", "err", "-o", "short-iso", "--no-pager", "-q",
            "--since", from.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) + " UTC",
            "--until", to.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) + " UTC"
        };
        foreach (var unit in units) args.AddRange(new[] { "-u", unit });

        var output = await ExecAsync("journalctl", args.ToArray());
        var (summary, errors) = ServerLogParser.Summarize("systemd journal",
            ServerLogParser.ReadJournal(output.Split('\n')), from, to);
        report.LogSources.Add(summary);
        report.Errors.AddRange(errors);
    }

    // Log files are still being written by the API/nginx, so open them shared.
    private static IEnumerable<string> ReadSharedLines(string path)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        using var reader = new StreamReader(stream);
        while (reader.ReadLine() is { } line)
            yield return line;
    }

    private static async Task<string> ExecAsync(string file, params string[] args)
    {
        var info = new ProcessStartInfo(file)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };
        foreach (var arg in args) info.ArgumentList.Add(arg);

        using var process = Process.Start(info) ?? throw new InvalidOperationException($"{file} did not start");
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        var stdout = process.StandardOutput.ReadToEndAsync(timeout.Token);
        var stderr = process.StandardError.ReadToEndAsync(timeout.Token);
        await process.WaitForExitAsync(timeout.Token);
        var output = await stdout;
        if (process.ExitCode != 0 && string.IsNullOrWhiteSpace(output))
            throw new InvalidOperationException($"{file} exited with {process.ExitCode}: {(await stderr).Trim()}");
        return output;
    }
}
