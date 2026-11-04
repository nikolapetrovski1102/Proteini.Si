using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

public class NewsletterSubscriber
{
    [JsonPropertyName("Id")] public int Id { get; set; }
    [JsonPropertyName("Email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("Source")] public string? Source { get; set; }
    [JsonPropertyName("IsActive")] public bool IsActive { get; set; }
    [JsonPropertyName("SubscribedAt")] public DateTime SubscribedAt { get; set; }
    [JsonPropertyName("UpdatedAt")] public DateTime? UpdatedAt { get; set; }
    [JsonPropertyName("ConsentCapturedAt")] public DateTime? ConsentCapturedAt { get; set; }
    [JsonPropertyName("ConsentSource")] public string? ConsentSource { get; set; }
    [JsonPropertyName("UnsubscribedAt")] public DateTime? UnsubscribedAt { get; set; }
}
