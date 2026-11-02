using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IBranchLocationProvider
{
    Task<List<BranchLocation>> GetActiveAsync(string? type);
    Task<List<BranchLocation>> GetAllAsync();
    Task<int> CreateAsync(BranchLocation location);
    Task<bool> UpdateAsync(BranchLocation location);
    Task<bool> DeleteAsync(int id);
}
