namespace ProteiniSi.Models;

public class FavoriteProduct
{
    public int FavoriteId { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ProductName { get; set; }
    public decimal ProductPrice { get; set; }
    public string? ProductImage { get; set; }
}
