using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IPackagingService
{
    Task<List<Packaging>> GetActiveAsync();
    Task<Packaging> GetByIdAsync(int id);
    Task<int> CreateAsync(CreatePackagingDto packaging);
    Task UpdateAsync(UpdatePackagingDto packaging);
    Task DeleteAsync(int id);
}
