using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface ICartService
{
    Task<CartResponseDto> GetCartAsync(int? userId);
    Task AddAsync(int userId, AddToCartDto item);
    Task UpdateQuantityAsync(int userId, UpdateCartItemDto item);
    Task RemoveAsync(int userId, int cartItemId);
    Task ClearAsync(int userId);
}
