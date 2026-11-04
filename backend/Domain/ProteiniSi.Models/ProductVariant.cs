namespace ProteiniSi.Models;

public class VariantWriteValues
{
    public string? Sku { get; set; }
    public string OptionType { get; set; } = "flavor";
    public decimal LoyaltyPercentage { get; set; }
    public string? PackagingLookupName { get; set; }
    public decimal? PackagingWeight { get; set; }
    public bool HasPackagingWeight { get; set; }
}

public class VariantGalleryCreated
{
    public int GalleryId { get; set; }
    public bool IsMain { get; set; }
}

public class DeletedImage
{
    public string? ImagePath { get; set; }
}

public class VariantNutritionColumn
{
    public int Column_Id { get; set; }
    public int Variant_Id { get; set; }
    public string Column_Name { get; set; } = string.Empty;
    public int Display_Order { get; set; }
    public bool Is_First_Column { get; set; }
    public DateTime Created_At { get; set; }
    public DateTime Updated_At { get; set; }
}

public class VariantNutritionRow
{
    public int Row_Id { get; set; }
    public int Variant_Id { get; set; }
    public string Row_Name { get; set; } = string.Empty;
    public int Display_Order { get; set; }
    public DateTime Created_At { get; set; }
    public DateTime Updated_At { get; set; }
}

public class VariantNutritionValue
{
    public int Value_Id { get; set; }
    public int Row_Id { get; set; }
    public int Column_Id { get; set; }
    public string Cell_Value { get; set; } = string.Empty;
    public DateTime Created_At { get; set; }
    public DateTime Updated_At { get; set; }
}

public class VariantNutritionData
{
    public List<VariantNutritionColumn> Columns { get; set; } = [];
    public List<VariantNutritionRow> Rows { get; set; } = [];
    public List<VariantNutritionValue> Values { get; set; } = [];
}

public record NutritionColumnWrite(string Name, string ColumnKey, int DisplayOrder, bool IsFirstColumn);

public record NutritionRowWrite(string Name, int DisplayOrder, List<string> Cells);
