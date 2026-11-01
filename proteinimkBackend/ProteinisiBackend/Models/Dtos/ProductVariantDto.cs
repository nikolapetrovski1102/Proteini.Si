using System.Text.Json.Serialization;

namespace ProteinisiBackend.Models.DTOs
{
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
        public string? Variant_Image_Path { get; set; }  // ADD THIS
        public string? Ingredients { get; set; }
        public string? Nutrition_Info { get; set; }
        public string? Description { get; set; }
        public int Display_Order { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string? Nutrition_Table_Json { get; set; } // Full table as JSON
        public string? Nutrition_Table_Columns { get; set; } // JSON array of column headers
        public string? Nutrition_Table_Rows { get; set; } // JSON array of rows
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
        public decimal DDV_Percentage { get; set; } = 0;  // Only once!
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
        public decimal DDV_Percentage { get; set; } = 0;  // ADD THIS
        public decimal DDV_Amount { get; set; }  // ADD THIS
        public decimal Price_With_DDV { get; set; }  // ADD THIS
        public int Quantity { get; set; }
        public int Low_Stock_Threshold { get; set; }
        public string? Variant_Name { get; set; }
        public string Option_Type { get; set; } = "flavor";
        public string? Image_Path { get; set; }
        public string? Variant_Image_Path { get; set; }  // ADD THIS
        public string? Ingredients { get; set; }
        public string? Nutrition_Info { get; set; }
        public string? Description { get; set; }
        public int Display_Order { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public List<string>? GalleryImages { get; set; } // Base64 or URLs
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

    public class CreatePackagingDto
    {
        public string Packaging_Name { get; set; } = string.Empty;
        public string? Packaging_Type { get; set; }
        public decimal? Weight_Grams { get; set; }
        public int? Quantity_Per_Box { get; set; }
        public int Display_Order { get; set; }
    }

    public class UpdatePackagingDto
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
}
