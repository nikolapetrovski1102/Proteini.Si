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
    public string Categories { get; set; }  // This comes from SQL STRING_AGG
    public List<string> CategoriesList { get; set; }  // This is for the frontend
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
    public decimal? Variant_Compare_Price { get; set; }  // ← ADD THIS

    public string VariantFlavorName { get; set; }
    public string VariantPackagingName { get; set; }
    public bool IsVariant { get; set; }
    public bool HasVariants { get; set; }
}
