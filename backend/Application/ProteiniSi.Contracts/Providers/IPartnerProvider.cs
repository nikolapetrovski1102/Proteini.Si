using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IPartnerProvider
{
    Task<List<Partner>> GetActiveAsync();
    Task<List<Partner>> GetAllAsync();
    Task<List<Partner>> GetActiveByTypeAsync(string type);
    Task<Partner?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreatePartnerDto partner, string imagePath);
    Task<bool> UpdateAsync(UpdatePartnerDto partner, string imagePath);
    Task<bool> DeleteAsync(int id);
    Task ReorderAsync(IEnumerable<ReorderItemDto> items);
}
