namespace ProteiniSi.Dtos;

public class AffiliateUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public string? Handle { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public decimal CommissionPercent { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Affiliate + code + short link in one step.</summary>
public class AffiliateQuickCreateDto : AffiliateUpsertDto, IPromotionScopeDto
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "percentage";
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public int? PerCustomerLimit { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? TargetPath { get; set; }
    public string? AppliesTo { get; set; }
    public List<int>? ProductIds { get; set; }
    public List<int>? CategoryIds { get; set; }
}

public class ShortLinkUpsertDto
{
    public string Slug { get; set; } = string.Empty;
    public string? TargetPath { get; set; }
    public int? PromoCodeId { get; set; }
    public int? AffiliateId { get; set; }
    public string? Label { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AffiliateCodeOwnerDto
{
    public int? AffiliateId { get; set; }
}
