namespace ProteiniSi.Api.Models.DTOs
{
    public class PromotionValidationDto
    {
        public string Code { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public string? CustomerEmail { get; set; }
    }

    public class PromotionCodeUpsertDto
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
}
