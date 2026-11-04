namespace ProteiniSi.Models;

public class ProductCategory
{
    public int Category_Id { get; set; }
    public string Category_Name { get; set; } = string.Empty;
    public string Category_Slug { get; set; } = string.Empty;
    public int? Parent_Category_Id { get; set; }
    public int Display_Order { get; set; }
}
