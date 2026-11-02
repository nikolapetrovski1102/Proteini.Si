using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IBranchLocationService
{
    Task<List<BranchLocation>> GetActiveAsync(string? type);
    Task<List<BranchLocation>> GetAllAsync();
    Task<int> CreateAsync(BranchLocation location);
    Task UpdateAsync(BranchLocation location);
    Task DeleteAsync(int id);
}
