using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IFavoriteService
{
    Task<FavoriteResponseDto> AddAsync(int userId, int productId);
    Task<FavoriteResponseDto> RemoveAsync(int userId, int productId);
    Task<FavoritesListResponseDto> GetByUserAsync(int userId);
    Task<bool> IsFavoriteAsync(int userId, int productId);
    Task<int> CountByProductAsync(int productId);
}
