namespace ProteiniSi.Models;

public class Product
{
    public int Product_Id { get; set; }
    public string? Name { get; set; }
    public string? Img { get; set; }
    public string? Category { get; set; }
    public int? Quantity { get; set; }
    public int? Servings { get; set; }
    public double? GPerServing { get; set; }
    public double? GNutrition { get; set; }
    public decimal Price { get; set; }

    public int? Brand_Id { get; set; }
    public int? Flavor_Id { get; set; }

    public string? BrandName { get; set; }
    public string? FlavorName { get; set; }

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

    public decimal DDV_Percentage { get; set; } = 0;
    public decimal? DDV_Amount { get; set; }
    public decimal? Price_Without_DDV { get; set; }
    public decimal? Price_With_DDV { get; set; }

    public bool HasVariants { get; set; } = false;
    public string? Variant_Display_Type { get; set; } = "tabs";
    public int? Default_Variant_Id { get; set; }

    public string? VariantPackagingName { get; set; }
    public string? VariantFlavorName { get; set; }
    public int PackagingCount { get; set; }
    public int FlavorCount { get; set; }
    public int SearchRank { get; set; }
}
