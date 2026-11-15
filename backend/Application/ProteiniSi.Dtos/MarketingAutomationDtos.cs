namespace ProteiniSi.Dtos;

/// <summary>Cookie-banner marketing choice of a signed-in visitor.</summary>
public class MarketingConsentDto
{
    public bool Marketing { get; set; }
    /// <summary>When the visitor made the choice in the banner (ISO time), so stale choices never undo an unsubscribe.</summary>
    public DateTime? ConsentGivenAt { get; set; }
}

public class MarketingUnsubscribeDto
{
    public string? Email { get; set; }
    public string? Token { get; set; }
}

/// <summary>Editable fields of a marketing email template.</summary>
public class MarketingTemplateUpdateDto
{
    public bool IsActive { get; set; }
    /// <summary>"HH:mm", Skopje time.</summary>
    public string SendTime { get; set; } = "15:00";
    public int DelayValue { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Preheader { get; set; }
    public string Heading { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string ButtonText { get; set; } = string.Empty;
    public string? ButtonUrl { get; set; }
    public string? CouponCode { get; set; }
    public string? CouponText { get; set; }
    public string? SubjectAl { get; set; }
    public string? PreheaderAl { get; set; }
    public string? HeadingAl { get; set; }
    public string? BodyAl { get; set; }
    public string? ButtonTextAl { get; set; }
    public string? CouponTextAl { get; set; }
    /// <summary>Preview / test send language ("mk" or "al").</summary>
    public string? Language { get; set; }
}

public class MarketingTemplateDto : MarketingTemplateUpdateDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public int SentLast30Days { get; set; }
    public int SentTotal { get; set; }
    public DateTime? LastSentAt { get; set; }
}

public record MarketingPreviewDto(string Subject, string Html);

public class MarketingRunOptions
{
    /// <summary>Run even outside the send window and repeat today's run.</summary>
    public bool Force { get; set; }
    /// <summary>Write the emails as HTML files here instead of sending.</summary>
    public string? DryRunDirectory { get; set; }
    /// <summary>Only this template code.</summary>
    public string? Only { get; set; }
    /// <summary>Send at most one email per template to this address (nothing is logged) – for testing on stage.</summary>
    public string? RedirectTo { get; set; }
}

public class MarketingRunResult
{
    public string TemplateCode { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public int Candidates { get; set; }
    public int Sent { get; set; }
    public int Failed { get; set; }
    public int Skipped { get; set; }
}
