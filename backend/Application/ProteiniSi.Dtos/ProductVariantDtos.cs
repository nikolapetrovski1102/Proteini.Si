namespace ProteiniSi.Dtos;

public class ProductVariantDto
{
    public int Variant_Id { get; set; }
    public int Product_Id { get; set; }
    public string? SKU { get; set; }
    public int? Flavor_Id { get; set; }
    public string? Flavor_Name { get; set; }
    public int? Packaging_Id { get; set; }
    public string? Packaging_Name { get; set; }
    public string? Packaging_Type { get; set; }
    public decimal? Weight_Grams { get; set; }
    public decimal Price { get; set; }
    public decimal? Compare_Price { get; set; }
    public decimal DDV_Percentage { get; set; } = 0;
    public decimal DDV_Amount { get; set; }
    public decimal Price_With_DDV { get; set; }
    public int Quantity { get; set; }
    public string? Variant_Name { get; set; }
    public string Option_Type { get; set; } = "flavor";
    public string? Image_Path { get; set; }
    public string? Variant_Image_Path { get; set; }
    public string? Ingredients { get; set; }
    public string? Nutrition_Info { get; set; }
    public string? Description { get; set; }
    public int Display_Order { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public string? Nutrition_Table_Json { get; set; }
    public string? Nutrition_Table_Columns { get; set; }
    public string? Nutrition_Table_Rows { get; set; }
    public decimal? LoyaltyPercentage { get; set; }
}

public class UpdateNutritionTableDto
{
    public List<string> Columns { get; set; } = new List<string>();
    public List<NutritionTableRowDto> Rows { get; set; } = new List<NutritionTableRowDto>();
}

public class NutritionTableRowDto
{
    public string RowLabel { get; set; } = string.Empty;
    public List<string> Cells { get; set; } = new List<string>();
    public int? IndentLevel { get; set; }
}

public class CreateProductVariantDto
{
    public int Product_Id { get; set; }
    public string? SKU { get; set; }
    public int? Flavor_Id { get; set; }
    public string? Flavor_Name { get; set; }
    public int? Packaging_Id { get; set; }
    public string? Packaging_Name { get; set; }
    public decimal? Weight_Grams { get; set; }
    public decimal Price { get; set; }
    public decimal DDV_Percentage { get; set; } = 0;
    public decimal? Compare_Price { get; set; }
    public decimal? Cost { get; set; }
    public int Quantity { get; set; } = 0;
    public int Low_Stock_Threshold { get; set; } = 5;
    public string? Variant_Name { get; set; }
    public string Option_Type { get; set; } = "flavor";
    public string? Image_Path { get; set; }
    public string? Variant_Image_Path { get; set; }
    public string? Ingredients { get; set; }
    public string? Nutrition_Info { get; set; }
    public string? Description { get; set; }
    public int Display_Order { get; set; }
    public bool IsDefault { get; set; }
    public List<string>? GalleryImages { get; set; }
    public decimal? LoyaltyPercentage { get; set; }
}

public class UpdateProductVariantDto
{
    public int Variant_Id { get; set; }
    public string? SKU { get; set; }
    public int? Flavor_Id { get; set; }
    public string? Flavor_Name { get; set; }
    public int? Packaging_Id { get; set; }
    public string? Packaging_Name { get; set; }
    public decimal? Weight_Grams { get; set; }
    public decimal Price { get; set; }
    public decimal? Compare_Price { get; set; }
    public decimal? Cost { get; set; }
    public decimal DDV_Percentage { get; set; } = 0;
    public decimal DDV_Amount { get; set; }
    public decimal Price_With_DDV { get; set; }
    public int Quantity { get; set; }
    public int Low_Stock_Threshold { get; set; }
    public string? Variant_Name { get; set; }
    public string Option_Type { get; set; } = "flavor";
    public string? Image_Path { get; set; }
    public string? Variant_Image_Path { get; set; }
    public string? Ingredients { get; set; }
    public string? Nutrition_Info { get; set; }
    public string? Description { get; set; }
    public int Display_Order { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public List<string>? GalleryImages { get; set; }
    public decimal? LoyaltyPercentage { get; set; }
}

public class BulkCreateVariantsDto
{
    public int Product_Id { get; set; }
    public List<int> FlavorIds { get; set; } = new();
    public List<int> PackagingIds { get; set; } = new();
    public decimal BasePrice { get; set; }
    public decimal? DDV_Percentage { get; set; } = 0;
    public decimal? ComparePrice { get; set; }
    public int Quantity { get; set; } = 0;
}

public class PackagingDto
{
    public int Packaging_Id { get; set; }
    public string Packaging_Name { get; set; } = string.Empty;
    public string? Packaging_Type { get; set; }
    public decimal? Weight_Grams { get; set; }
    public int? Quantity_Per_Box { get; set; }
    public int Display_Order { get; set; }
    public bool IsActive { get; set; }
}

public class VariantGalleryDto
{
    public int Gallery_Id { get; set; }
    public int Variant_Id { get; set; }
    public string Image_Path { get; set; }
    public int Display_Order { get; set; }
    public bool IsMain { get; set; }
}

public class SetMainVariantGalleryImageDto
{
    public int Variant_Id { get; set; }
    public int Gallery_Id { get; set; }
}

public class PasteNutritionTableDto
{
    public string RawText { get; set; } = string.Empty;
}

public class VariantNutritionDto
{
    public List<NutritionColumnDto> Columns { get; set; }
    public List<NutritionRowDto> Rows { get; set; }
}

public class NutritionColumnDto
{
    public int? Column_Id { get; set; }
    public string Column_Name { get; set; }
    public int Display_Order { get; set; }
    public bool Is_First_Column { get; set; }
}

public class NutritionRowDto
{
    public int? Row_Id { get; set; }
    public string Row_Name { get; set; }
    public int Display_Order { get; set; }
    public Dictionary<string, string> Values { get; set; }
}

public class VariantNutritionColumnView
{
    public int Column_Id { get; set; }
    public string Column_Name { get; set; } = string.Empty;
    public int Display_Order { get; set; }
    public bool Is_First_Column { get; set; }
}

public class VariantNutritionRowView
{
    public int Row_Id { get; set; }
    public string Row_Name { get; set; } = string.Empty;
    public int Display_Order { get; set; }
    public Dictionary<string, string> Values { get; set; } = new();
}

public class VariantNutritionView
{
    public List<VariantNutritionColumnView> Columns { get; set; } = new();
    public List<VariantNutritionRowView> Rows { get; set; } = new();
}

public class TableRowData
{
    public string RowLabel { get; set; } = string.Empty;
    public List<string> Cells { get; set; } = new List<string>();
    public int IndentLevel { get; set; }
}

public class NutritionTableData
{
    public List<string> Columns { get; set; } = new();
    public List<TableRowData> Rows { get; set; } = new();
}
