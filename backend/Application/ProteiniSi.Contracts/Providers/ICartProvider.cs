using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface ICartProvider
{
    Task<(int? CartId, List<CartItem> Items)> GetByUserAsync(int userId);
    Task<int> GetOrCreateCartAsync(int userId);
    Task<CartProduct?> GetProductForAddAsync(int productId, int? variantId);
    Task<(bool Saved, int RequestedQuantity)> AddItemAsync(NewCartItem item);
    Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity);
    Task<bool> RemoveItemAsync(int userId, int cartItemId);
    Task ClearAsync(int userId);
}
