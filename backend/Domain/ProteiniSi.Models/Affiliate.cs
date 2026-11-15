using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

/// <summary>Affiliate (influencer/partner) row for the admin list, with period numbers.</summary>
public class AffiliateSummary
{
    public int AffiliateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Handle { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public decimal CommissionPercent { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int CodesCount { get; set; }
    public int LinksCount { get; set; }
    public string? ActiveCodes { get; set; }
    public string? PrimarySlug { get; set; }
    public int Clicks { get; set; }
    public int Orders { get; set; }
    public decimal NetSales { get; set; }
    public decimal DiscountGiven { get; set; }
    public decimal Commission { get; set; }
}

public class AffiliateProfile
{
    public int AffiliateId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Handle { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public decimal CommissionPercent { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AffiliateCode
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
    public DateTime CreatedAt { get; set; }
    public string AppliesTo { get; set; } = PromoScope.All;
    [JsonIgnore] public string? ProductIdList { get; set; }
    [JsonIgnore] public string? CategoryIdList { get; set; }
    public int[] ProductIds => PromoScope.ParseIds(ProductIdList);
    public int[] CategoryIds => PromoScope.ParseIds(CategoryIdList);
    public int Orders { get; set; }
    public decimal NetSales { get; set; }
    public decimal DiscountGiven { get; set; }
}

public class AffiliateOrder
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string? OrderStatus { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public string? CustomerName { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal PromoDiscount { get; set; }
    public decimal NetSales { get; set; }
    public bool IsCommissionable { get; set; }
    public decimal Commission { get; set; }
}

public class AffiliateDetails
{
    public AffiliateProfile Affiliate { get; set; } = new();
    public List<AffiliateCode> Codes { get; set; } = [];
    public List<ShortLink> Links { get; set; } = [];
    public List<AffiliateOrder> Orders { get; set; } = [];
}

public class ShortLink
{
    public int ShortLinkId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string TargetPath { get; set; } = "/";
    public int? PromoCodeId { get; set; }
    public string? Code { get; set; }
    public bool? CodeIsActive { get; set; }
    public int? AffiliateId { get; set; }
    public string? AffiliateName { get; set; }
    public string? Label { get; set; }
    public bool IsActive { get; set; }
    public int TotalClicks { get; set; }
    public int PeriodClicks { get; set; }
    public DateTime? LastClickedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CodeOrders { get; set; }
    public decimal CodeNetSales { get; set; }
}

/// <summary>What a public /r/&lt;slug&gt; visit resolves to.</summary>
public class ShortLinkTarget
{
    public string TargetPath { get; set; } = "/";
    public string? Code { get; set; }
}

public class AffiliateValues
{
    public string Name { get; init; } = string.Empty;
    public string? Handle { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public decimal CommissionPercent { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; }
}

public class ShortLinkValues
{
    public string Slug { get; init; } = string.Empty;
    public string TargetPath { get; init; } = "/";
    public int? PromoCodeId { get; init; }
    public int? AffiliateId { get; init; }
    public string? Label { get; init; }
    public bool IsActive { get; init; }
}

public class AffiliateQuickCreateValues
{
    public AffiliateValues Affiliate { get; init; } = new();
    public string Code { get; init; } = string.Empty;
    public string DiscountType { get; init; } = "percentage";
    public decimal DiscountValue { get; init; }
    public decimal MinimumOrderAmount { get; init; }
    public int? PerCustomerLimit { get; init; }
    public DateTime? ValidUntil { get; init; }
    public PromoCodeScope Scope { get; init; } = PromoCodeScope.Everything;
    public string Slug { get; init; } = string.Empty;
    public string TargetPath { get; init; } = "/";
}

public record AffiliateQuickCreateResult(int AffiliateId, int PromoCodeId, int ShortLinkId);

/// <summary>Procedure result codes shared by the affiliate and short-link writes.</summary>
public enum AffiliateWriteResult
{
    Success = 0,
    DuplicateCode = 1,
    DuplicateSlug = 2,
    InvalidReference = 3,
    NotFound = 4
}
