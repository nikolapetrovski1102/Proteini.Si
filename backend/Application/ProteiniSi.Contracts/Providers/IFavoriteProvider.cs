using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IFavoriteProvider
{
    Task<FavoriteProduct?> AddAsync(int userId, int productId);
    Task<bool> RemoveAsync(int userId, int productId);
    Task<List<FavoriteProduct>> GetByUserAsync(int userId);
    Task<bool> ExistsAsync(int userId, int productId);
    Task<int> CountByProductAsync(int productId);
}
