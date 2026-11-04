using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IHomeSliderProvider
{
    Task<List<HomeSlider>> GetActiveAsync();
    Task<List<HomeSlider>> GetAllAsync();
    Task<HomeSlider?> GetByIdAsync(int id);
    Task<(int Id, int DisplayOrder)> CreateAsync(CreateHomeSliderDto slider, string imagePath, string? mobileImagePath);
    Task<bool> UpdateAsync(int id, UpdateHomeSliderDto slider);
    Task<bool> DeleteAsync(int id);
    Task<List<int>> ReorderAsync(IEnumerable<ReorderItemDto> items);
}
