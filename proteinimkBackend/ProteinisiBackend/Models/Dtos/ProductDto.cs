using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProteinisiBackend.Models.DTOs
{
    public class ProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Img { get; set; }
        public string? Category { get; set; }

        public int Quantity { get; set; } = 0;
        public int Servings { get; set; } = 0;
        public double GPerServing { get; set; } = 0;
        public double GNutrition { get; set; } = 0;

        public string? Flavor { get; set; }

        // Main descriptions
        public List<string>? MainDescriptions { get; set; } = new List<string>();

        // Other description
        public string? OtherDescriptionTitle { get; set; }
        public string? OtherDescriptionText { get; set; }

        // Nutrition values
        public string? NutritionValuesIngredients { get; set; }
        public string? NutritionValuesIngredientsDescription { get; set; }
        public string? NutritionInformation { get; set; }

        // Instructions
        public string? InstructionsForUse { get; set; }
        public string? InstructionsForUseDescription { get; set; }
        public string? InstructionsOnHowToUseIt { get; set; }
        // In your Product model, add these if they exist in DB
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public decimal Price { get; set; } = 0;

        public bool NewInTheShop { get; set; } = false;

        public bool ProductsOnSale { get; set; } = false;

        public decimal? SalePrice { get; set; }
        public DateTime? SaleEndDate { get; set; }

        public bool UpcomingPromotion { get; set; } = false;
        public bool ShortExpiry { get; set; } = false;
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

        public bool RecommendedForYou { get; set; } = false;

        public bool ProductsInTheOutlet { get; set; } = false;
        public bool JustForMe { get; set; }

        public int? Parent_Product_Id { get; set; }
        public int? Variant_Id { get; set; }
        public bool IsVariant { get; set; }
        public decimal? LoyaltyPercentage { get; set; }

        [JsonProperty("ddvPercentage")]
        public decimal DDV_Percentage { get; set; } = 0;

        private decimal CalculateDDVAmount()
        {
            return Price * DDV_Percentage / 100;
        }

        public decimal Price_With_DDV => Price + CalculateDDVAmount();
        public decimal DDV_Amount => CalculateDDVAmount();
        // Add these properties to ProductDto
        public bool HasVariants { get; set; }
        public string? Variant_Display_Type { get; set; }
        public List<ProductVariantDto>? Variants { get; set; }
    }
}
