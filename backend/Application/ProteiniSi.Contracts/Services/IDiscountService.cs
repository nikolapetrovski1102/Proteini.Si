using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IDiscountService
{
    Task<List<Discount>> GetAllAsync();
    Task<List<DiscountItemOption>> GetItemOptionsAsync();
    Task<int> CreateAsync(DiscountWriteDto discount);
    Task UpdateAsync(int id, DiscountWriteDto discount);
    Task DeleteAsync(int id);
    Task<int> SyncAsync();
}
