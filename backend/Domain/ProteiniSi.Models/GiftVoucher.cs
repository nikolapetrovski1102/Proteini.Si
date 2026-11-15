using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

public class GiftVoucher
{
    [JsonPropertyName("GiftVoucherId")] public int GiftVoucherId { get; set; }
    [JsonPropertyName("Code")] public string Code { get; set; } = string.Empty;
    [JsonPropertyName("InitialValue")] public decimal InitialValue { get; set; }
    [JsonPropertyName("RemainingValue")] public decimal RemainingValue { get; set; }
    [JsonPropertyName("Currency")] public string Currency { get; set; } = string.Empty;
    [JsonPropertyName("Status")] public string Status { get; set; } = string.Empty;
    [JsonPropertyName("PurchasedOrderId")] public int PurchasedOrderId { get; set; }
    [JsonPropertyName("PurchaserName")] public string? PurchaserName { get; set; }
    [JsonPropertyName("PurchaserEmail")] public string? PurchaserEmail { get; set; }
    [JsonPropertyName("RecipientName")] public string? RecipientName { get; set; }
    [JsonPropertyName("RecipientEmail")] public string? RecipientEmail { get; set; }
    [JsonPropertyName("ValidFrom")] public DateTime ValidFrom { get; set; }
    [JsonPropertyName("ExpiresAt")] public DateTime? ExpiresAt { get; set; }
    [JsonPropertyName("CreatedAt")] public DateTime CreatedAt { get; set; }
    [JsonPropertyName("UpdatedAt")] public DateTime UpdatedAt { get; set; }
    [JsonPropertyName("RedemptionCount")] public int RedemptionCount { get; set; }
    [JsonPropertyName("RedeemedValue")] public decimal RedeemedValue { get; set; }
}

public class GiftVoucherBalance
{
    public int GiftVoucherId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal RemainingValue { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ValidFrom { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class GiftVoucherReportRow
{
    public string Code { get; set; } = string.Empty;
    public decimal InitialValue { get; set; }
    public decimal RemainingValue { get; set; }
    public string Status { get; set; } = string.Empty;
    public int PurchasedOrderId { get; set; }
    public string? PurchaserName { get; set; }
    public string? PurchaserEmail { get; set; }
    public string? RecipientName { get; set; }
    public string? RecipientEmail { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? RedemptionOrderId { get; set; }
    public decimal? RedemptionAmount { get; set; }
    public string? RedemptionStatus { get; set; }
    public string? RedemptionChannel { get; set; }
    public string? RedeemedBy { get; set; }
    public DateTime? RedemptionCreatedAt { get; set; }
}

public class GiftVoucherDetails
{
    public int GiftVoucherId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal InitialValue { get; set; }
    public decimal RemainingValue { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int PurchasedOrderId { get; set; }
    public string? PurchasedOrderNumber { get; set; }
    public string? PurchaserName { get; set; }
    public string? PurchaserEmail { get; set; }
    public string? RecipientName { get; set; }
    public string? RecipientEmail { get; set; }
    public string? GiftMessage { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<GiftVoucherRedemption> Redemptions { get; set; } = [];
}

public class GiftVoucherRedemption
{
    public int GiftVoucherRedemptionId { get; set; }
    public int? OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string? RedeemedBy { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
}

public class GiftVoucherStoreRedemptionResult
{
    public int GiftVoucherId { get; set; }
    public decimal RemainingValue { get; set; }
}
