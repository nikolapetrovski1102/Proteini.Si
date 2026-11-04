namespace ProteiniSi.Models;

public class CartItem
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
    public decimal? Variant_Original_Price { get; set; }
    public decimal? Variant_Compare_Price { get; set; }
}

public class CartProduct
{
    public int Product_Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Img { get; set; }
    public bool HasVariants { get; set; }
    public bool IsGiftVoucher { get; set; }
    public decimal? VoucherMinAmount { get; set; }
    public decimal? VoucherMaxAmount { get; set; }
    public int? CatalogVariantId { get; set; }
    public string? CatalogVariantName { get; set; }
    public string? CatalogVariantPackaging { get; set; }
    public decimal? EffectivePrice { get; set; }
    public int? AvailableQuantity { get; set; }
}

public record NewCartItem(
    int CartId,
    int ProductId,
    int? VariantId,
    bool IsGiftVoucher,
    decimal Price,
    int Quantity,
    int AvailableQuantity,
    string? VariantName,
    string? VariantPackaging,
    string DisplayName);
