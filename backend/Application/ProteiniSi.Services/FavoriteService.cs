using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Services;

public class FavoriteService(IFavoriteProvider provider) : IFavoriteService
{
    public async Task<FavoriteResponseDto> AddAsync(int userId, int productId)
    {
        var favorite = await provider.AddAsync(userId, productId);
        if (favorite == null)
            return new FavoriteResponseDto { Success = false, Message = "Product is already in favorites" };

        favorite.CreatedAt = DateTime.Now;
        return new FavoriteResponseDto { Success = true, Message = "Product added to favorites successfully", Data = favorite };
    }

    public async Task<FavoriteResponseDto> RemoveAsync(int userId, int productId) =>
        await provider.RemoveAsync(userId, productId)
            ? new FavoriteResponseDto { Success = true, Message = "Product removed from favorites successfully" }
            : new FavoriteResponseDto { Success = false, Message = "Product not found in favorites" };

    public async Task<FavoritesListResponseDto> GetByUserAsync(int userId)
    {
        var favorites = await provider.GetByUserAsync(userId);
        return new FavoritesListResponseDto
        {
            Success = true,
            Message = "Favorites retrieved successfully",
            Data = favorites,
            TotalCount = favorites.Count
        };
    }

    public Task<bool> IsFavoriteAsync(int userId, int productId) => provider.ExistsAsync(userId, productId);

    public Task<int> CountByProductAsync(int productId) => provider.CountByProductAsync(productId);
}
