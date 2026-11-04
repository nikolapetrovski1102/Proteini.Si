using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IDynamicContentService
{
    Task<List<DynamicSection>> GetActiveByPageAsync(string pageType);
    Task<List<DynamicSection>> GetAllByPageAsync(string pageType);
    Task<DynamicSection> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateDynamicSectionDto section, string createdBy);
    Task UpdateAsync(UpdateDynamicSectionDto section, string updatedBy);
    Task DeleteAsync(int id);
    Task ReorderAsync(ReorderDynamicSectionsDto reorder);
}
