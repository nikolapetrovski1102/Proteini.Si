using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class CartProvider(ISqlHelper sql) : ICartProvider
{
    public Task<(int? CartId, List<CartItem> Items)> GetByUserAsync(int userId) =>
        sql.QueryMultipleAsync(StoredProcedures.Cart.GetByUser, new { UserId = userId }, async grid =>
        {
            var cartId = await grid.ReadSingleAsync<int?>();
            var items = (await grid.ReadAsync<CartItem>()).ToList();
            return (cartId, items);
        });

    public async Task<int> GetOrCreateCartAsync(int userId) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Cart.GetOrCreate, new { UserId = userId });

    public Task<CartProduct?> GetProductForAddAsync(int productId, int? variantId) =>
        sql.QuerySingleOrDefaultAsync<CartProduct>(StoredProcedures.Cart.GetProductForAdd, new { ProductId = productId, VariantId = variantId });

    public async Task<(bool Saved, int RequestedQuantity)> AddItemAsync(NewCartItem item)
    {
        var row = await sql.QuerySingleOrDefaultAsync<AddResultRow>(StoredProcedures.Cart.AddItem, new
        {
            item.CartId,
            item.ProductId,
            item.VariantId,
            item.IsGiftVoucher,
            item.Price,
            item.Quantity,
            item.AvailableQuantity,
            item.VariantName,
            item.VariantPackaging,
            item.DisplayName
        });

        return (row!.Result == 0, row.RequestedQuantity);
    }

    public async Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Cart.UpdateItemQuantity, new { UserId = userId, CartItemId = cartItemId, Quantity = quantity }) > 0;

    public async Task<bool> RemoveItemAsync(int userId, int cartItemId) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Cart.RemoveItem, new { UserId = userId, CartItemId = cartItemId }) > 0;

    public Task ClearAsync(int userId) =>
        sql.ExecuteAsync(StoredProcedures.Cart.Clear, new { UserId = userId });

    private sealed class AddResultRow
    {
        public int Result { get; init; }
        public int RequestedQuantity { get; init; }
    }
}
