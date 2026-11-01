using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace ProteinisiBackend.Models
{
    [Table("Products")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Product_Id { get; set; }
        public string? Name { get; set; }
        public string? Img { get; set; }
        public string? Category { get; set; } // Keep for backward compatibility
        public int? Quantity { get; set; }
        public int? Servings { get; set; }
        public double? GPerServing { get; set; }
        public double? GNutrition { get; set; }
        public decimal Price { get; set; }

        // NEW FIELDS (Foreign Keys)
        public int? Brand_Id { get; set; }
        public int? Flavor_Id { get; set; }

        // Navigation properties (for joins)
        public string? BrandName { get; set; }
        public string? FlavorName { get; set; }

        // Existing fields...
        public string? MainDescriptions { get; set; }
        public string? OtherDescriptionTitle { get; set; }
        public string? OtherDescriptionText { get; set; }
        public string? NutritionValuesIngredients { get; set; }
        public string? NutritionValuesIngredientsDescription { get; set; }
        public string? NutritionInformation { get; set; }
        public string? InstructionsForUse { get; set; }
        public string? InstructionsForUseDescription { get; set; }
        public string? InstructionsOnHowToUseIt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool NewInTheShop { get; set; }
        public bool ProductsOnSale { get; set; }
        public decimal? SalePrice { get; set; }
        public DateTime? SaleEndDate { get; set; }
        [NotMapped]
        public decimal? Compare_Price { get; set; }
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
        public int? Parent_Product_Id { get; set; }
        public int? Variant_Id { get; set; }
        public bool IsVariant { get; set; }
        public decimal? LoyaltyPercentage { get; set; }

        // DDV/VAT Fields
        [JsonProperty("ddvPercentage")]
        public decimal DDV_Percentage { get; set; } = 0;
        public decimal? DDV_Amount { get; set; } // Calculated tax amount
        public decimal? Price_Without_DDV { get; set; } // Base price (same as Price)
        public decimal? Price_With_DDV { get; set; } // Price including tax

        // Helper method to calculate DDV values before saving/updating
        public void CalculateDDVValues()
        {
            DDV_Amount = Price * DDV_Percentage / 100m;
            Price_Without_DDV = Price;
            Price_With_DDV = Price + DDV_Amount.Value;
        }
        // Add to Products.cs
        public bool HasVariants { get; set; } = false;
        public string? Variant_Display_Type { get; set; } = "tabs";
        public int? Default_Variant_Id { get; set; }

        // Listing-only metadata. Variant products are presented as one card per
        // packaging, with a representative (preferably default/in-stock) taste.
        [NotMapped]
        public string? VariantPackagingName { get; set; }
        [NotMapped]
        public string? VariantFlavorName { get; set; }
        [NotMapped]
        public int PackagingCount { get; set; }
        [NotMapped]
        public int FlavorCount { get; set; }
        [NotMapped]
        public int SearchRank { get; set; }
    }
}
