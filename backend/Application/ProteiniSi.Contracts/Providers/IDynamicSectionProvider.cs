using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IDynamicSectionProvider
{
    Task<List<DynamicSection>> GetActiveByPageAsync(string pageType);
    Task<List<DynamicSection>> GetAllByPageAsync(string pageType);
    Task<DynamicSection?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateDynamicSectionDto section, string createdBy);
    Task<bool> UpdateAsync(UpdateDynamicSectionDto section, string updatedBy);
    Task<bool> DeleteAsync(int id);
    Task ReorderAsync(IEnumerable<SectionOrderDto> sections);
}
