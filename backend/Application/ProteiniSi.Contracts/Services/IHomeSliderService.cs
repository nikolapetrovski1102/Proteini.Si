using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IHomeSliderService
{
    Task<List<HomeSlider>> GetActiveAsync();
    Task<List<HomeSlider>> GetAllAsync();
    Task<CreatedHomeSliderDto> CreateAsync(CreateHomeSliderDto slider);
    Task UpdateAsync(int id, UpdateHomeSliderDto slider);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<ReorderItemDto>? items);
}
