using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace ProteinisiBackend.Models.DTOs
{
    public class ProductCreateDto
    {
        public string? Name { get; set; }
        public IFormFile? Image { get; set; }
        public string? Category { get; set; }
        public int? Quantity { get; set; }
        public int? Servings { get; set; }
        public double? GPerServing { get; set; }
        public double? GNutrition { get; set; }
        public decimal Price { get; set; }
        [JsonProperty("ddvPercentage")]
        public decimal DDV_Percentage { get; set; } = 0;

        // NEW FIELDS - Change to string to accept JSON from FormData
        public int? BrandId { get; set; }
        public int? FlavorId { get; set; }
        public string? FlavorIds { get; set; }
        public string? BrandIds { get; set; }
        public string? CategoryIds { get; set; }
        public string? SportIds { get; set; }
        public string? GoalIds { get; set; }
        public string? UseTimingIds { get; set; }
        public string? TagIds { get; set; }

        // Existing fields...
        public string? MainDescriptions { get; set; }  // CHANGE FROM List<string> TO string
        public string? OtherDescriptionTitle { get; set; }
        public string? OtherDescriptionText { get; set; }
        public string? NutritionValuesIngredients { get; set; }
        public string? NutritionValuesIngredientsDescription { get; set; }
        public string? NutritionInformation { get; set; }
        public string? InstructionsForUse { get; set; }
        public string? InstructionsForUseDescription { get; set; }
        public string? InstructionsOnHowToUseIt { get; set; }
        public bool NewInTheShop { get; set; }
        public bool ProductsOnSale { get; set; }
        public decimal? SalePrice { get; set; }
        public DateTime? SaleEndDate { get; set; }
        public bool UpcomingPromotion { get; set; }
        public bool ShortExpiry { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsGiftVoucher { get; set; }
        public decimal? VoucherMinAmount { get; set; }
        public decimal? VoucherMaxAmount { get; set; }
        public string? NameAl { get; set; }
        public string? DescriptionAl { get; set; }
        public string? NutritionValuesIngredientsAl { get; set; }
        public string? NutritionValuesIngredientsDescriptionAl { get; set; }
        public string? NutritionInformationAl { get; set; }
        public string? InstructionsForUseAl { get; set; }
        public string? InstructionsForUseDescriptionAl { get; set; }
        public string? InstructionsOnHowToUseItAl { get; set; }
        public bool RecommendedForYou { get; set; }
        public bool ProductsInTheOutlet { get; set; }
        public bool JustForMe { get; set; }
        public List<CreateProductVariantDto>? Variants { get; set; }
        public bool HasVariants { get; set; } = false;
        public string? Variant_Display_Type { get; set; } = "tabs";
        public decimal? LoyaltyPercentage { get; set; }
    }
}
