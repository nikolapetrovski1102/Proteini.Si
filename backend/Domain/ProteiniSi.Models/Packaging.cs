namespace ProteiniSi.Models;

public class Packaging
{
    public int Packaging_Id { get; set; }
    public string Packaging_Name { get; set; } = string.Empty;
    public string? Packaging_Type { get; set; }
    public decimal? Weight_Grams { get; set; }
    public int? Quantity_Per_Box { get; set; }
    public int Display_Order { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? Created_At { get; set; } = DateTime.Now;
}
