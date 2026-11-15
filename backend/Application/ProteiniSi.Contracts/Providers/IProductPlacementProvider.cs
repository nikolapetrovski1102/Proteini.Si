using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IProductPlacementProvider
{
    Task<ProductPlacementAdmin> GetAdminAsync();

    /** false when the category or brand does not exist. */
    Task<bool> SaveAsync(string scope, int targetId, IReadOnlyList<int> productIds);
}
