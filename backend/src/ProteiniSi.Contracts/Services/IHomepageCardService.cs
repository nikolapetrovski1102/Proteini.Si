using ProteiniSi.Models;
using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IHomepageCardService
{
    Task<List<HomepageCard>> GetActiveAsync(string? section);
    Task<List<HomepageCard>> GetAllAsync();
    Task<int> CreateAsync(HomepageCardForm form);
    Task UpdateAsync(int id, HomepageCardForm form);
    Task DeleteAsync(int id);
}
