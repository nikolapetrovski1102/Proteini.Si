using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface ILandingPageProvider
{
    Task<List<LandingPageSection>> GetActiveAsync();
    Task<List<LandingPageSection>> GetAllAsync();
    Task<LandingPageSection?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateLandingPageSectionDto section, string? imagePath);
    Task<bool> UpdateAsync(UpdateLandingPageSectionDto section, string? imagePath);
    Task<bool> DeleteAsync(int id);
    Task ReorderAsync(IEnumerable<ReorderItemDto> items);
}
