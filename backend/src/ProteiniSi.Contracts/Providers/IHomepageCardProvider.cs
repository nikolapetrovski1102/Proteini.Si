using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IHomepageCardProvider
{
    Task<List<HomepageCard>> GetActiveAsync(string? section);
    Task<List<HomepageCard>> GetAllAsync();
    Task<HomepageCard?> GetByIdAsync(int id);
    Task<bool> SlugExistsAsync(string slug, int? excludingId);
    Task<int> CreateAsync(HomepageCard card);
    Task UpdateAsync(HomepageCard card);
    Task<bool> DeleteAsync(int id);
}
