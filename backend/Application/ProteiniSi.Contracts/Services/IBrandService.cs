using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IBrandService
{
    Task<List<BrandAdmin>> GetAllAsync();
    Task<int> CreateAsync(BrandWriteDto brand);
    Task UpdateAsync(int id, BrandWriteDto brand);
    Task DeleteAsync(int id);
}
