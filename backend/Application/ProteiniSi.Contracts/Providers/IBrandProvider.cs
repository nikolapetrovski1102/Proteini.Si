using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IBrandProvider
{
    Task<List<BrandAdmin>> GetAllAsync();
    Task<BrandAdmin?> GetByIdAsync(int id);

    /** Result: 0 saved, 1 slug empty, 2 slug taken, 3 already four featured, 4 not found. */
    Task<(int Result, int? Id)> SaveAsync(int? id, string name, string slug, string? logoUrl, string? headerImageUrl, bool isFeatured, int displayOrder);

    /** true deleted, null still used by products, false not found. */
    Task<bool?> DeleteAsync(int id);
}
