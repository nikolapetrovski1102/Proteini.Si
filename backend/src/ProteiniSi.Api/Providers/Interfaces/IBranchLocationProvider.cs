using ProteiniSi.Api.Models;

namespace ProteiniSi.Api.Providers.Interfaces;

public interface IBranchLocationProvider
{
    Task<List<BranchLocation>> GetActiveAsync(string? type);
    Task<List<BranchLocation>> GetAllAsync();
    Task<int> CreateAsync(BranchLocation location);
    Task<bool> UpdateAsync(BranchLocation location);
    Task<bool> DeleteAsync(int id);
}
