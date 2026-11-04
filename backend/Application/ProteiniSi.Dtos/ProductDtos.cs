using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ProteiniSi.Models;

namespace ProteiniSi.Dtos;

public class ProductFilterDto
{
    public List<int> CategoryIds { get; set; } = new List<int>();
    public List<int> SportIds { get; set; } = new List<int>();
    public List<int> GoalIds { get; set; } = new List<int>();
    public List<int> UseTimingIds { get; set; } = new List<int>();
    public List<int> FlavorIds { get; set; } = new List<int>();
    public List<int> BrandIds { get; set; } = new List<int>();
    public List<int> TagIds { get; set; } = new List<int>();
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    public bool? OnSale { get; set; }
    public bool? NewProducts { get; set; }
    public bool? Outlet { get; set; }
    public bool? JustForMe { get; set; }
    public bool? UpcomingPromotions { get; set; }
    public bool? GiftVouchers { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "Priority";
    public string SortOrder { get; set; } = "ASC";
}

public class ProductFilterResponseDto
{
    public List<Product> Products { get; set; } = new List<Product>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class ProductSearchDto
{
    public string SearchTerm { get; set; }
    public int? Brand_Id { get; set; }
    public int? Flavor_Id { get; set; }
    public int? Category_Id { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? NewInTheShop { get; set; }
    public bool? ProductsOnSale { get; set; }
    public bool? ProductsInTheOutlet { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "Name";
    public string SortOrder { get; set; } = "ASC";
}

public class ProductSearchResponseDto
{
    public List<ProductSearchResultDto> Products { get; set; }
    public int TotalCount { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class ProductSearchResultDto
{
    public int Product_Id { get; set; }
    public string Name { get; set; }
    public string Img { get; set; }
    public decimal Price { get; set; }
    public decimal? Compare_Price { get; set; }
    public int? Quantity { get; set; }
    public int? Servings { get; set; }
    public string BrandName { get; set; }
    public string FlavorName { get; set; }
    public string Categories { get; set; }
    public List<string> CategoriesList { get; set; }
    public bool NewInTheShop { get; set; }
    public bool ProductsOnSale { get; set; }
    public DateTime? SaleEndDate { get; set; }
    public bool ShortExpiry { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsGiftVoucher { get; set; }
    public decimal? VoucherMinAmount { get; set; }
    public decimal? VoucherMaxAmount { get; set; }
    public string? NameAl { get; set; }
    public bool ProductsInTheOutlet { get; set; }
    public int? Variant_Id { get; set; }
    public decimal? Variant_Price { get; set; }
    public decimal? Variant_Compare_Price { get; set; }
    public string VariantFlavorName { get; set; }
    public string VariantPackagingName { get; set; }
    public bool IsVariant { get; set; }
    public bool HasVariants { get; set; }
}

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
    public int? BrandId { get; set; }
    public int? FlavorId { get; set; }
    public string? FlavorIds { get; set; }
    public string? BrandIds { get; set; }
    public string? CategoryIds { get; set; }
    public string? SportIds { get; set; }
    public string? GoalIds { get; set; }
    public string? UseTimingIds { get; set; }
    public string? TagIds { get; set; }
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
    public List<CreateProductVariantDto>? Variants { get; set; }
    public bool HasVariants { get; set; } = false;
    public string? Variant_Display_Type { get; set; } = "tabs";
    public decimal? LoyaltyPercentage { get; set; }
}

public class ProductEditDto
{
    public string Name { get; set; }
    public string Category { get; set; }
    public int? Quantity { get; set; }
    public int? Servings { get; set; }
    public double? GPerServing { get; set; }
    public double? GNutrition { get; set; }
    public decimal Price { get; set; }
    [JsonProperty("ddvPercentage")]
    public decimal DDV_Percentage { get; set; } = 0;
    public int? BrandId { get; set; }
    public int? FlavorId { get; set; }
    public string? FlavorIds { get; set; }
    public string? BrandIds { get; set; }
    public string? CategoryIds { get; set; }
    public string? SportIds { get; set; }
    public string? GoalIds { get; set; }
    public string? UseTimingIds { get; set; }
    public string? TagIds { get; set; }
    public string MainDescription { get; set; }
    public string OtherDescriptionTitle { get; set; }
    public string OtherDescriptionText { get; set; }
    public string NutritionValuesIngredients { get; set; }
    public string NutritionValuesIngredientsDesc { get; set; }
    public string NutritionInformation { get; set; }
    public string InstructionsForUse { get; set; }
    public string InstructionsForUseDesc { get; set; }
    public string InstructionsOnHowToUseIt { get; set; }
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
    public bool HasVariants { get; set; } = false;
    public string? Variant_Display_Type { get; set; } = "tabs";
    public int? Default_Variant_Id { get; set; }
    public bool IsPriceWithDDV { get; set; }
    public decimal? LoyaltyPercentage { get; set; }
}

public class UploadGalleryImageDto
{
    public int Product_Id { get; set; }
    public IFormFile Image { get; set; }
    public int? Display_Order { get; set; }
}

public class ReorderGalleryImageDto
{
    public int Gallery_Id { get; set; }
    public int NewDisplayOrder { get; set; }
}

public class SetMainImageDto
{
    public int Product_Id { get; set; }
    public int Gallery_Id { get; set; }
}

public class BulkUpdateDto
{
    public List<int> ProductIds { get; set; }
    public string Action { get; set; }
    public decimal? Value { get; set; }
}

public class BulkStockUpdateDto
{
    public List<int> ProductIds { get; set; }
    public int Quantity { get; set; }
}

public class ProductDetailsDto
{
    public Product Product { get; set; } = new();
    public List<ProductCategory> Categories { get; set; } = new();
    public List<Sport> Sports { get; set; } = new();
    public List<Goal> Goals { get; set; } = new();
    public List<UseTiming> UseTimings { get; set; } = new();
    public List<ProductTag> Tags { get; set; } = new();
    public List<Flavor> Flavors { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class ProductFilterOptionsDto
{
    public List<ProductCategory> Categories { get; set; } = new();
    public List<Sport> Sports { get; set; } = new();
    public List<Goal> Goals { get; set; } = new();
    public List<UseTiming> UseTimings { get; set; } = new();
    public List<Flavor> Flavors { get; set; } = new();
    public List<Brand> Brands { get; set; } = new();
    public List<ProductTag> Tags { get; set; } = new();
    public PriceBoundsDto PriceBounds { get; set; } = new();
    public List<PriceRangeDto> PriceRanges { get; set; } = new();
}

public class PriceBoundsDto
{
    public decimal Min { get; set; }
    public decimal Max { get; set; }
}

public class PriceRangeDto
{
    public decimal Min { get; set; }
    public decimal Max { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ProductSaveResultDto
{
    public int ProductId { get; set; }
    public string? ImagePath { get; set; }
    public decimal PriceWithoutDDV { get; set; }
    public decimal PriceWithDDV { get; set; }
    public decimal DDVAmount { get; set; }
}
