namespace ProteiniSi.Models;

public class ProductCategory
{
    public int Category_Id { get; set; }
    public string Category_Name { get; set; } = string.Empty;
    public string Category_Slug { get; set; } = string.Empty;
    public int? Parent_Category_Id { get; set; }
    public int Display_Order { get; set; }
    public bool Is_Apparel { get; set; }

    /// <summary>
    /// Products listed in the shop under this category or its subcategories. Only filled by the filter options
    /// (null elsewhere); the shop hides categories at 0 in its header menu and filters.
    /// </summary>
    public int? Product_Count { get; set; }
}
