using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IPackagingProvider
{
    Task<List<Packaging>> GetActiveAsync();
    Task<Packaging?> GetActiveByIdAsync(int id);
    Task<int> CreateAsync(CreatePackagingDto packaging);
    Task<bool> UpdateAsync(UpdatePackagingDto packaging);
    Task<bool> DeactivateAsync(int id);
}
