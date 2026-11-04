namespace ProteiniSi.Dtos;

public class NewsletterSubscriptionDto
{
    public string Email { get; set; } = string.Empty;
    public string? Source { get; set; }
}

public class NewsletterStatusDto
{
    public bool IsActive { get; set; }
}

public record CsvExport(byte[] Content, string FileName);
