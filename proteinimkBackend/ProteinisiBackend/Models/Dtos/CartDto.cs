namespace ProteinisiBackend.Models.DTOs
{
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
        public List<CartItemResponseDto> Items { get; set; }
        public decimal Total { get; set; }
        public int TotalItems { get; set; }
    }

    public class CartItemResponseDto
    {
        public int CartItem_Id { get; set; }
        public int Product_Id { get; set; }
        public string? Product_Name { get; set; }
        public string? Product_Img { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
        public int? Variant_Id { get; set; }
        public string? Variant_Name { get; set; }
        public string? Variant_Packaging { get; set; }
        public decimal? Variant_Weight_Grams { get; set; }
        public string? Display_Name { get; set; }

        // Only variant compare price (since only variants have discounts)
        public decimal? Variant_Original_Price { get; set; }
        public decimal? Variant_Compare_Price { get; set; }
    }
}
