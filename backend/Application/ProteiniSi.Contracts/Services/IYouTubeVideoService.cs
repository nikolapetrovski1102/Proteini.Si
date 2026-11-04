using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IYouTubeVideoService
{
    Task<List<YouTubeVideo>> GetActiveAsync();
    Task<List<YouTubeVideo>> GetAllAsync();
    Task<YouTubeVideo> GetByIdAsync(int id);
    Task<(int Id, string ThumbnailPath)> CreateAsync(CreateYouTubeVideoDto video);
    Task<string> UpdateAsync(UpdateYouTubeVideoDto video);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<ReorderItemDto>? items);
    Task<string> UploadThumbnailAsync(IFormFile? file);
}
