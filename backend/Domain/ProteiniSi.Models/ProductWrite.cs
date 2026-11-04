namespace ProteiniSi.Models;

public class ProductWrite
{
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int? Quantity { get; set; }
    public int? Servings { get; set; }
    public double? GPerServing { get; set; }
    public double? GNutrition { get; set; }
    public decimal Price { get; set; }
    public decimal DDV_Percentage { get; set; }
    public decimal DDV_Amount { get; set; }
    public decimal Price_Without_DDV { get; set; }
    public decimal Price_With_DDV { get; set; }
    public int? Brand_Id { get; set; }
    public int? Flavor_Id { get; set; }
    public string? MainDescriptions { get; set; }
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
    public decimal LoyaltyPercentage { get; set; }
    public bool HasVariants { get; set; }
    public string? Variant_Display_Type { get; set; }
    public List<int> CategoryIds { get; set; } = [];
    public List<int> SportIds { get; set; } = [];
    public List<int> GoalIds { get; set; } = [];
    public List<int> UseTimingIds { get; set; } = [];
    public List<int> TagIds { get; set; } = [];
}

public class ProductImageChange
{
    public string? OldImg { get; set; }
    public string? NewImg { get; set; }
}

public class ProductBulkResult
{
    public int ProductsAffected { get; set; }
    public int VariantsAffected { get; set; }
}

public class ProductGalleryCreated
{
    public int GalleryId { get; set; }
    public int DisplayOrder { get; set; }
}
