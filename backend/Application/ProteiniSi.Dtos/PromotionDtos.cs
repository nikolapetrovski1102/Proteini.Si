namespace ProteiniSi.Dtos;

public class PromotionValidationDto
{
    public string Code { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public string? CustomerEmail { get; set; }
    /// <summary>The cart lines, so a code limited to some products is only applied to those.</summary>
    public List<PromotionCartLineDto>? Items { get; set; }
}

public class PromotionCartLineDto
{
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

/// <summary>"all", "products" or "categories", plus the chosen ids.</summary>
public interface IPromotionScopeDto
{
    string? AppliesTo { get; }
    List<int>? ProductIds { get; }
    List<int>? CategoryIds { get; }
}

public class PromotionCodeUpsertDto : IPromotionScopeDto
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = "percentage";
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerCustomerLimit { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
    public string? AppliesTo { get; set; }
    public List<int>? ProductIds { get; set; }
    public List<int>? CategoryIds { get; set; }
}

public class FreeGiftUpsertDto
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string? DisplayName { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Public view of a usable promo code, so the shop can show its price on product cards.
/// ProductIds lists the products a scoped code applies to; it is empty for an "all products" code.
/// </summary>
public record PromotionPreview(
    string Code,
    string? Description,
    string DiscountType,
    decimal DiscountValue,
    decimal MinimumOrderAmount,
    decimal? MaximumDiscountAmount,
    DateTime? ValidUntil,
    string AppliesTo,
    IReadOnlyList<int> ProductIds);

public record PromotionValidationResult(bool Status, int PromoCodeId, string Code, string? Description, decimal DiscountAmount, string AppliesTo = "all");
