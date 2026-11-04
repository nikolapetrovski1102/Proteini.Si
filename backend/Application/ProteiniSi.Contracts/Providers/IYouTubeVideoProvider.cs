using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IYouTubeVideoProvider
{
    Task<List<YouTubeVideo>> GetActiveAsync();
    Task<List<YouTubeVideo>> GetAllAsync();
    Task<YouTubeVideo?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateYouTubeVideoDto video, string thumbnailPath);
    Task<bool> UpdateAsync(UpdateYouTubeVideoDto video, string thumbnailPath);
    Task<bool> DeactivateAsync(int id);
    Task ReorderAsync(IEnumerable<ReorderItemDto> items);
}
