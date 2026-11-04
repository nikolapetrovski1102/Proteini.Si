using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class CartService(ICartProvider provider) : ICartService
{
    public async Task<CartResponseDto> GetCartAsync(int? userId)
    {
        if (!userId.HasValue)
            return new CartResponseDto();

        var (cartId, items) = await provider.GetByUserAsync(userId.Value);
        if (!cartId.HasValue)
            return new CartResponseDto();

        return new CartResponseDto
        {
            Cart_Id = cartId.Value,
            Items = items,
            Total = items.Sum(i => i.Subtotal),
            TotalItems = items.Sum(i => i.Quantity)
        };
    }

    public async Task AddAsync(int userId, AddToCartDto item)
    {
        var cartId = await provider.GetOrCreateCartAsync(userId);

        var product = await provider.GetProductForAddAsync(item.Product_Id, item.Variant_Id)
            ?? throw new NotFoundException("Product not found", new { error = "Product not found" });

        if (!item.Variant_Id.HasValue && product.HasVariants)
            throw Error("A package or variant must be selected for this product");

        if (item.Variant_Id.HasValue && product.CatalogVariantId == null)
            throw Error("The selected variant is invalid, unavailable, or does not belong to this product");

        var finalPrice = product.EffectivePrice!.Value;
        if (product.IsGiftVoucher)
        {
            var minimum = product.VoucherMinAmount ?? 500m;
            var maximum = product.VoucherMaxAmount;
            var requestedAmount = item.Price ?? finalPrice;

            if (requestedAmount < minimum || (maximum.HasValue && requestedAmount > maximum.Value))
            {
                throw Error(maximum.HasValue
                    ? $"Voucher amount must be between {minimum:F0} and {maximum.Value:F0} MKD"
                    : $"Voucher amount must be at least {minimum:F0} MKD");
            }

            finalPrice = decimal.Round(requestedAmount, 2);
        }

        var availableQuantity = product.AvailableQuantity!.Value;
        var variantName = item.Variant_Id.HasValue ? product.CatalogVariantName : null;
        var variantPackaging = item.Variant_Id.HasValue ? product.CatalogVariantPackaging : null;

        var displayName = product.Name;
        if (product.IsGiftVoucher)
            displayName += $" - MKD {finalPrice:F2}";
        if (!string.IsNullOrEmpty(variantName))
            displayName += $" - {variantName}";
        if (!string.IsNullOrEmpty(variantPackaging))
            displayName += $" ({variantPackaging})";

        var (saved, requestedQuantity) = await provider.AddItemAsync(new NewCartItem(
            cartId, item.Product_Id, item.Variant_Id, product.IsGiftVoucher, finalPrice,
            item.Quantity, availableQuantity, variantName, variantPackaging, displayName));

        if (!saved)
            throw Error($"Insufficient stock. Available: {availableQuantity}, Requested: {requestedQuantity}");
    }

    public async Task UpdateQuantityAsync(int userId, UpdateCartItemDto item)
    {
        if (item.Quantity <= 0)
            throw Error("Quantity must be greater than zero");

        if (!await provider.UpdateQuantityAsync(userId, item.CartItem_Id, item.Quantity))
            throw CartItemNotFound();
    }

    public async Task RemoveAsync(int userId, int cartItemId)
    {
        if (!await provider.RemoveItemAsync(userId, cartItemId))
            throw CartItemNotFound();
    }

    public Task ClearAsync(int userId) => provider.ClearAsync(userId);

    private static BadRequestException Error(string message) => new(message, new { error = message });

    private static NotFoundException CartItemNotFound() => new("Cart item not found", new { error = "Cart item not found" });
}
