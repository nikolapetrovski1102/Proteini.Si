namespace ProteiniSi.Models;

/// <summary>Snapshot of the host, its services and the last day's errors, for the developer report.</summary>
public class ServerStatusReport
{
    public DateTime CollectedAtUtc { get; set; } = DateTime.UtcNow;
    public string HostName { get; set; } = string.Empty;
    public TimeSpan? Uptime { get; set; }
    public double[]? LoadAverage { get; set; }
    public int CpuCount { get; set; }
    public long? MemoryTotalMb { get; set; }
    public long? MemoryAvailableMb { get; set; }
    public long? SwapTotalMb { get; set; }
    public long? SwapFreeMb { get; set; }
    public List<DiskStatus> Disks { get; set; } = new();
    public List<ServiceStatus> Services { get; set; } = new();
    public List<EndpointStatus> Endpoints { get; set; } = new();
    public List<CertificateStatus> Certificates { get; set; } = new();
    public List<DatabaseInfo> Databases { get; set; } = new();
    public List<LogSourceSummary> LogSources { get; set; } = new();
    public List<LogErrorGroup> Errors { get; set; } = new();
    public HttpTrafficSummary? Traffic { get; set; }
    public List<string> FailedUnits { get; set; } = new();

    /// <summary>Checks that could not run (missing permission, file not found...).</summary>
    public List<string> CollectorNotes { get; set; } = new();

    public int ErrorCount => Errors.Sum(e => e.Count);

    public List<string> Problems()
    {
        var problems = new List<string>();
        problems.AddRange(Services.Where(s => !s.Ok).Select(s => $"{s.Name} is {s.State}"));
        problems.AddRange(FailedUnits.Select(u => $"unit {u} failed"));
        problems.AddRange(Endpoints.Where(e => !e.Ok).Select(e => $"{e.Name} {(e.StatusCode?.ToString() ?? e.Error ?? "down")}"));
        problems.AddRange(Certificates.Where(c => !c.Ok).Select(c => c.DaysLeft is { } d ? $"certificate {c.Name} expires in {d} days" : $"certificate {c.Name}: {c.Error}"));
        problems.AddRange(Disks.Where(d => d.UsedPercent >= 85).Select(d => $"disk {d.Mount} {d.UsedPercent:0}% full"));
        if (MemoryTotalMb > 0 && MemoryAvailableMb is { } available && available * 100 / MemoryTotalMb < 10)
            problems.Add($"memory low ({available} MB free)");
        if (ErrorCount > 0)
            problems.Add($"{ErrorCount} logged error(s)");
        return problems;
    }
}

public class DiskStatus
{
    public string Mount { get; set; } = string.Empty;
    public double TotalGb { get; set; }
    public double FreeGb { get; set; }
    public double UsedPercent => TotalGb <= 0 ? 0 : (TotalGb - FreeGb) * 100 / TotalGb;
}

public class ServiceStatus
{
    public string Name { get; set; } = string.Empty;
    public string State { get; set; } = "unknown";
    public int? Restarts { get; set; }
    public string? Since { get; set; }
    public bool Ok => State == "active" || State == "running";
}

public class EndpointStatus
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int? StatusCode { get; set; }
    public long ElapsedMs { get; set; }
    public string? Error { get; set; }
    public bool Ok => StatusCode is >= 200 and < 400;
}

public class CertificateStatus
{
    public string Name { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public int? DaysLeft { get; set; }
    public string? Error { get; set; }
    public bool Ok => Error == null && DaysLeft >= 14;
}

public class LogSourceSummary
{
    public string Source { get; set; } = string.Empty;
    public int Fatal { get; set; }
    public int Errors { get; set; }
    public int Warnings { get; set; }
}

public class LogErrorGroup
{
    public string Source { get; set; } = string.Empty;
    public string Level { get; set; } = "ERR";
    public string Message { get; set; } = string.Empty;
    public int Count { get; set; }
    public DateTimeOffset FirstSeen { get; set; }
    public DateTimeOffset LastSeen { get; set; }
    public string? Detail { get; set; }
}

public class HttpTrafficSummary
{
    public int Requests { get; set; }
    public int UniqueIps { get; set; }
    public int Status4xx { get; set; }
    public int Status5xx { get; set; }
    public List<(string Path, int Count)> Top5xx { get; set; } = new();
}
