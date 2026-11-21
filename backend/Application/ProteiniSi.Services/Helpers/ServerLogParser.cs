using System.Globalization;
using System.Text.RegularExpressions;
using ProteiniSi.Models;

namespace ProteiniSi.Services.Helpers;

/// <summary>Reads API (Serilog) and nginx access logs for the developer's daily report.</summary>
public static partial class ServerLogParser
{
    // 2026-11-10 08:29:18.082 +00:00 [WRN] Slow procedure dbo.usp_Product_Filter took 515 ms
    [GeneratedRegex(@"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{2}:\d{2}) \[(\w{3})\] (.*)$")]
    private static partial Regex SerilogLine();

    // 1.2.3.4 - - [10/Nov/2026:09:23:12 +0000] "GET /path HTTP/1.1" 200 123 "ref" "ua"
    [GeneratedRegex("^(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] \"(\\S+) (\\S+)[^\"]*\" (\\d{3}) ")]
    private static partial Regex NginxLine();

    // 2026/11/10 09:00:00 [error] 1234#1234: *5 connect() failed ...
    [GeneratedRegex(@"^(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] \d+#\d+: (?:\*\d+ )?(.*)$")]
    private static partial Regex NginxErrorLine();

    // journalctl -o short-iso: 2026-11-10T07:02:23+00:00 host unit[123]: message
    [GeneratedRegex(@"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:?\d{2}) \S+ ([^:]+): (.*)$")]
    private static partial Regex JournalLine();

    // Errors a visitor causes on purpose (bots probing /img/, blocked paths): nginx already answered
    // 403 correctly, so they are warnings, not something the developer has to fix.
    [GeneratedRegex(@"^directory index of "".*"" is forbidden|^access forbidden by rule")]
    private static partial Regex NginxVisitorRefusal();

    [GeneratedRegex(@"\b\d+\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", RegexOptions.IgnoreCase)]
    private static partial Regex VariablePart();

    private const int DetailLines = 8;

    public sealed record SerilogEntry(DateTimeOffset Timestamp, string Level, string Message, List<string> Detail);

    /// <summary>Splits Serilog text into entries; continuation lines (stack traces) attach to the entry above.</summary>
    public static IEnumerable<SerilogEntry> ReadSerilog(IEnumerable<string> lines)
    {
        SerilogEntry? current = null;
        foreach (var line in lines)
        {
            var match = SerilogLine().Match(line);
            if (match.Success
                && DateTimeOffset.TryParseExact(match.Groups[1].Value, new[] { "yyyy-MM-dd HH:mm:ss.fff zzz", "yyyy-MM-dd HH:mm:ss zzz" },
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var timestamp))
            {
                if (current != null) yield return current;
                current = new SerilogEntry(timestamp, match.Groups[2].Value, match.Groups[3].Value.Trim(), new List<string>());
            }
            else if (current != null && current.Detail.Count < DetailLines && !string.IsNullOrWhiteSpace(line))
            {
                current.Detail.Add(line.TrimEnd());
            }
        }
        if (current != null) yield return current;
    }

    /// <summary>nginx error.log lines (logged in the host's time zone, UTC on our server) as entries.</summary>
    public static IEnumerable<SerilogEntry> ReadNginxErrors(IEnumerable<string> lines, TimeSpan hostOffset)
    {
        foreach (var line in lines)
        {
            var match = NginxErrorLine().Match(line);
            if (!match.Success
                || !DateTime.TryParseExact(match.Groups[1].Value, "yyyy/MM/dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var at))
                continue;
            var message = match.Groups[3].Value.Trim();
            var level = match.Groups[2].Value switch
            {
                "warn" => "WRN",
                "error" when NginxVisitorRefusal().IsMatch(message) => "WRN",
                "error" => "ERR",
                "crit" or "alert" or "emerg" => "FTL",
                _ => "INF"
            };
            yield return new SerilogEntry(new DateTimeOffset(at, hostOffset), level, message, new List<string>());
        }
    }

    /// <summary>journalctl -p err -o short-iso lines as ERR entries, prefixed with the unit/process name.</summary>
    public static IEnumerable<SerilogEntry> ReadJournal(IEnumerable<string> lines)
    {
        foreach (var line in lines)
        {
            var match = JournalLine().Match(line);
            if (!match.Success
                || !DateTimeOffset.TryParse(WithOffsetColon(match.Groups[1].Value), CultureInfo.InvariantCulture, DateTimeStyles.None, out var at))
                continue;
            var process = match.Groups[2].Value;
            var bracket = process.IndexOf('[');
            if (bracket > 0) process = process[..bracket];
            yield return new SerilogEntry(at, "ERR", $"{process}: {match.Groups[3].Value.Trim()}", new List<string>());
        }
    }

    /// <summary>Counts levels and groups ERR/FTL entries in [from, to) by message (numbers and ids ignored).</summary>
    public static (LogSourceSummary Summary, List<LogErrorGroup> Errors) Summarize(string source, IEnumerable<SerilogEntry> entries, DateTimeOffset from, DateTimeOffset to)
    {
        var summary = new LogSourceSummary { Source = source };
        var groups = new Dictionary<string, LogErrorGroup>();

        foreach (var entry in entries)
        {
            if (entry.Timestamp < from || entry.Timestamp >= to) continue;
            switch (entry.Level)
            {
                case "WRN": summary.Warnings++; continue;
                case "ERR": summary.Errors++; break;
                case "FTL": summary.Fatal++; break;
                default: continue;
            }

            var key = entry.Level + "|" + VariablePart().Replace(entry.Message, "#");
            if (!groups.TryGetValue(key, out var group))
            {
                group = new LogErrorGroup
                {
                    Source = source,
                    Level = entry.Level,
                    Message = entry.Message.Length > 400 ? entry.Message[..400] + "…" : entry.Message,
                    FirstSeen = entry.Timestamp,
                    Detail = entry.Detail.Count == 0 ? null : string.Join("\n", entry.Detail)
                };
                groups[key] = group;
            }
            group.Count++;
            group.LastSeen = entry.Timestamp;
        }

        return (summary, groups.Values.ToList());
    }

    /// <summary>Totals for nginx "combined" access log lines in [from, to).</summary>
    public static HttpTrafficSummary SummarizeNginx(IEnumerable<string> lines, DateTimeOffset from, DateTimeOffset to)
    {
        var traffic = new HttpTrafficSummary();
        var ips = new HashSet<string>();
        var errorPaths = new Dictionary<string, int>();

        foreach (var line in lines)
        {
            var match = NginxLine().Match(line);
            if (!match.Success
                || !DateTimeOffset.TryParseExact(WithOffsetColon(match.Groups[2].Value), "dd/MMM/yyyy:HH:mm:ss zzz", CultureInfo.InvariantCulture, DateTimeStyles.None, out var at)
                || at < from || at >= to)
                continue;

            traffic.Requests++;
            ips.Add(match.Groups[1].Value);
            var status = int.Parse(match.Groups[5].Value, CultureInfo.InvariantCulture);
            if (status is >= 400 and < 500) traffic.Status4xx++;
            if (status >= 500)
            {
                traffic.Status5xx++;
                var path = $"{status} {match.Groups[3].Value} {match.Groups[4].Value.Split('?')[0]}";
                errorPaths[path] = errorPaths.GetValueOrDefault(path) + 1;
            }
        }

        traffic.UniqueIps = ips.Count;
        traffic.Top5xx = errorPaths.OrderByDescending(p => p.Value).Take(8).Select(p => (p.Key, p.Value)).ToList();
        return traffic;
    }

    // nginx writes "+0000"; .NET's zzz wants "+00:00".
    private static string WithOffsetColon(string value) =>
        value.Length > 5 && value[^5] is '+' or '-' ? value[..^2] + ":" + value[^2..] : value;
}
