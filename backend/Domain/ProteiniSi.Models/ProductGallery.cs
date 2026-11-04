namespace ProteiniSi.Models;

public class ProductGallery
{
    public int Gallery_Id { get; set; }
    public int Product_Id { get; set; }
    public string Image_Path { get; set; } = string.Empty;
    public int Display_Order { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime? Created_At { get; set; } = DateTime.Now;
    public Product? Product { get; set; }
}
