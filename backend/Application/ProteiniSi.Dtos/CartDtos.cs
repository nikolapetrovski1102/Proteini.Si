using ProteiniSi.Models;

namespace ProteiniSi.Dtos;

public class AddToCartDto
{
    public int Product_Id { get; set; }
    public int Quantity { get; set; }
    public int? Variant_Id { get; set; }
    public string? Variant_Name { get; set; }
    public string? Variant_Packaging { get; set; }
    public decimal? Price { get; set; }
}

public class UpdateCartItemDto
{
    public int CartItem_Id { get; set; }
    public int Quantity { get; set; }
}

public class CartResponseDto
{
    public int Cart_Id { get; set; }
    public List<CartItem> Items { get; set; } = [];
    public decimal Total { get; set; }
    public int TotalItems { get; set; }
}
