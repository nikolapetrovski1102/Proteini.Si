using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IAboutCompanyProvider
{
    Task<List<AboutCompanySection>> GetActiveAsync();
    Task<List<AboutCompanySection>> GetAllAsync();
    Task<AboutCompanySection?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateAboutCompanySectionDto section, string? thumbnailPath);
    Task<bool> UpdateAsync(UpdateAboutCompanySectionDto section, string? thumbnailPath);
    Task<bool> DeleteAsync(int id);
    Task ReorderAsync(IEnumerable<ReorderItemDto> items);
}
