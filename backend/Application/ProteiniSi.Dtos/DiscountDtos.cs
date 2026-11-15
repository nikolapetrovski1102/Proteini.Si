namespace ProteiniSi.Dtos;

/**
 * Admin discount form. AppliesTo: "products", "brands" or "categories".
 * Type: "percent" (Percentage off) or "price" (each item's NewPrice; products only).
 * Brands/categories use TargetIds; products use Items (one per variant, VariantId 0 = product without variants).
 */
public class DiscountWriteDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "percent";
    public decimal? Percentage { get; set; }
    public string AppliesTo { get; set; } = "products";
    public List<int> TargetIds { get; set; } = [];
    public List<DiscountItemDto> Items { get; set; } = [];
    public DateTime? StartsOn { get; set; }
    public DateTime? EndsOn { get; set; }
    public bool IsActive { get; set; } = true;
}

public class DiscountItemDto
{
    public int ProductId { get; set; }
    public int VariantId { get; set; }
    public decimal? NewPrice { get; set; }
}
