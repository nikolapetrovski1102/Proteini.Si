namespace ProteiniSi.Dtos;

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
