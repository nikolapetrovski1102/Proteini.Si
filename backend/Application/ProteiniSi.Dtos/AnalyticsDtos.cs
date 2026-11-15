namespace ProteiniSi.Dtos;

public class TrackEventDto
{
    public string? VisitorId { get; set; }
    public string? Type { get; set; }
    public string? Path { get; set; }
    public string? Referrer { get; set; }
    public int? OrderId { get; set; }
}

public class DailyReportRequest
{
    /// <summary>Shop-local day to report on.</summary>
    public DateOnly Date { get; set; }

    /// <summary>Send even when this day was already reported.</summary>
    public bool Force { get; set; }

    /// <summary>Write the emails to this folder instead of sending them.</summary>
    public string? DryRunFolder { get; set; }

    public bool SendBusinessReport { get; set; } = true;
    public bool SendServerReport { get; set; } = true;
}

public class DailyReportResult
{
    public bool Skipped { get; set; }
    public bool BusinessSent { get; set; }
    public bool ServerSent { get; set; }
    public List<string> Messages { get; set; } = new();
}
