using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.Dtos;

namespace ProteiniSi.Api.Services.Interfaces;

public interface IHomepageCardService
{
    Task<List<HomepageCard>> GetActiveAsync(string? section);
    Task<List<HomepageCard>> GetAllAsync();
    Task<int> CreateAsync(HomepageCardForm form);
    Task UpdateAsync(int id, HomepageCardForm form);
    Task DeleteAsync(int id);
}
