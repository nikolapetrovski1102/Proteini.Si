using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

public class FreeGift
{
    [JsonPropertyName("FreeGiftId")] public int FreeGiftId { get; set; }
    [JsonPropertyName("ProductId")] public int ProductId { get; set; }
    [JsonPropertyName("VariantId")] public int? VariantId { get; set; }
    [JsonPropertyName("DisplayName")] public string? DisplayName { get; set; }
    [JsonPropertyName("MinimumOrderAmount")] public decimal MinimumOrderAmount { get; set; }
    [JsonPropertyName("ValidFrom")] public DateTime? ValidFrom { get; set; }
    [JsonPropertyName("ValidUntil")] public DateTime? ValidUntil { get; set; }
    [JsonPropertyName("IsActive")] public bool IsActive { get; set; }
    [JsonPropertyName("CreatedAt")] public DateTime CreatedAt { get; set; }
    [JsonPropertyName("UpdatedAt")] public DateTime UpdatedAt { get; set; }
    [JsonPropertyName("ProductName")] public string? ProductName { get; set; }
    [JsonPropertyName("VariantName")] public string? VariantName { get; set; }
    [JsonPropertyName("Image")] public string? Image { get; set; }
}

public class ActiveFreeGift
{
    [JsonPropertyName("FreeGiftId")] public int FreeGiftId { get; set; }
    [JsonPropertyName("ProductId")] public int ProductId { get; set; }
    [JsonPropertyName("VariantId")] public int? VariantId { get; set; }
    [JsonPropertyName("DisplayName")] public string? DisplayName { get; set; }
    [JsonPropertyName("MinimumOrderAmount")] public decimal MinimumOrderAmount { get; set; }
    [JsonPropertyName("Image")] public string? Image { get; set; }
    [JsonPropertyName("AvailableQuantity")] public int? AvailableQuantity { get; set; }
}

public record FreeGiftValues(
    int ProductId,
    int? VariantId,
    string? DisplayName,
    decimal MinimumOrderAmount,
    DateTime? ValidFrom,
    DateTime? ValidUntil,
    bool IsActive);
