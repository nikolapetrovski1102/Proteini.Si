using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

public class PromoCode
{
    [JsonPropertyName("PromoCodeId")] public int PromoCodeId { get; set; }
    [JsonPropertyName("Code")] public string Code { get; set; } = string.Empty;
    [JsonPropertyName("Description")] public string? Description { get; set; }
    [JsonPropertyName("DiscountType")] public string DiscountType { get; set; } = string.Empty;
    [JsonPropertyName("DiscountValue")] public decimal DiscountValue { get; set; }
    [JsonPropertyName("MinimumOrderAmount")] public decimal MinimumOrderAmount { get; set; }
    [JsonPropertyName("MaximumDiscountAmount")] public decimal? MaximumDiscountAmount { get; set; }
    [JsonPropertyName("UsageLimit")] public int? UsageLimit { get; set; }
    [JsonPropertyName("PerCustomerLimit")] public int? PerCustomerLimit { get; set; }
    [JsonPropertyName("ValidFrom")] public DateTime? ValidFrom { get; set; }
    [JsonPropertyName("ValidUntil")] public DateTime? ValidUntil { get; set; }
    [JsonPropertyName("IsActive")] public bool IsActive { get; set; }
    [JsonPropertyName("CreatedAt")] public DateTime CreatedAt { get; set; }
    [JsonPropertyName("UpdatedAt")] public DateTime UpdatedAt { get; set; }
    [JsonPropertyName("TimesUsed")] public int TimesUsed { get; set; }
    [JsonPropertyName("TotalDiscount")] public decimal TotalDiscount { get; set; }
}

public class PromoCodeEligibility
{
    public int PromoCodeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerCustomerLimit { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; }
    public int TimesUsed { get; set; }
    public int CustomerTimesUsed { get; set; }
}

public class PromoCodeUsageRow
{
    [JsonPropertyName("Code")] public string Code { get; set; } = string.Empty;
    [JsonPropertyName("OrderNumber")] public string? OrderNumber { get; set; }
    [JsonPropertyName("CustomerEmail")] public string? CustomerEmail { get; set; }
    [JsonPropertyName("DiscountAmount")] public decimal DiscountAmount { get; set; }
    [JsonPropertyName("UsedAt")] public DateTime UsedAt { get; set; }
}

public class PromoCodeValues
{
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string DiscountType { get; init; } = string.Empty;
    public decimal DiscountValue { get; init; }
    public decimal MinimumOrderAmount { get; init; }
    public decimal? MaximumDiscountAmount { get; init; }
    public int? UsageLimit { get; init; }
    public int? PerCustomerLimit { get; init; }
    public DateTime? ValidFrom { get; init; }
    public DateTime? ValidUntil { get; init; }
    public bool IsActive { get; init; }
}

public enum PromotionWriteResult
{
    Success = 0,
    Duplicate = 1,
    InvalidSelection = 2,
    NotFound = 4
}

public enum PromotionDeleteResult
{
    Deleted = 0,
    Archived = 1,
    NotFound = 4
}
