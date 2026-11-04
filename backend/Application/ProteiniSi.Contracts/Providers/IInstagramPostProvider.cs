using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IInstagramPostProvider
{
    Task<List<InstagramPost>> GetActiveAsync();
    Task<InstagramPost?> GetActiveByIdAsync(int id);
    Task<int> CreateAsync(CreateInstagramPostDto post);
    Task<bool> UpdateAsync(UpdateInstagramPostDto post);
    Task<bool> DeactivateAsync(int id);
}
