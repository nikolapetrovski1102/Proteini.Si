using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class YouTubeVideoService(IYouTubeVideoProvider provider, IImageStorageService storage) : IYouTubeVideoService
{
    private const string Folder = "uploads/youtube";
    private const string InvalidTypeMessage = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.";
    private const string TooLargeMessage = "File size too large. Maximum 5MB allowed.";

    public Task<List<YouTubeVideo>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<YouTubeVideo>> GetAllAsync() => provider.GetAllAsync();

    public async Task<YouTubeVideo> GetByIdAsync(int id) =>
        await provider.GetByIdAsync(id) ?? throw NotFound(id);

    public async Task<(int Id, string ThumbnailPath)> CreateAsync(CreateYouTubeVideoDto video)
    {
        if (string.IsNullOrEmpty(video.VideoUrl))
            throw Text("VideoUrl is required");

        if (string.IsNullOrEmpty(video.Title))
            throw Text("Title is required");

        if (video.Thumbnail == null || video.Thumbnail.Length == 0)
            throw Text("Thumbnail image is required");

        ValidateThumbnail(video.Thumbnail);
        var thumbnailPath = await SaveThumbnailAsync(video.Thumbnail, "youtube");

        var id = await provider.CreateAsync(video, thumbnailPath);
        return (id, thumbnailPath);
    }

    public async Task<string> UpdateAsync(UpdateYouTubeVideoDto video)
    {
        var existing = await provider.GetByIdAsync(video.Id) ?? throw NotFound(video.Id);
        var thumbnailPath = existing.ThumbnailPath;

        if (video.Thumbnail is { Length: > 0 })
        {
            ValidateThumbnail(video.Thumbnail);
            storage.Delete(existing.ThumbnailPath);
            thumbnailPath = await SaveThumbnailAsync(video.Thumbnail, "youtube");
        }

        if (!await provider.UpdateAsync(video, thumbnailPath))
            throw new ServerErrorException("Failed to update video", "Failed to update video");

        return thumbnailPath;
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound(id);

        if (!await provider.DeactivateAsync(id))
            throw new ServerErrorException("Failed to delete video", "Failed to delete video");

        storage.Delete(existing.ThumbnailPath);
    }

    public async Task ReorderAsync(List<ReorderItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw Text("Reorder list is required");

        await provider.ReorderAsync(items);
    }

    public async Task<string> UploadThumbnailAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            throw ErrorBody("No file uploaded");

        if (!UploadHelper.ImageExtensions.Contains(UploadHelper.Extension(file)))
            throw ErrorBody(InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw ErrorBody(TooLargeMessage);

        return await SaveThumbnailAsync(file, "youtube_thumb");
    }

    private static void ValidateThumbnail(IFormFile file)
    {
        if (!UploadHelper.ImageExtensions.Contains(UploadHelper.Extension(file)))
            throw Text(InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw Text(TooLargeMessage);
    }

    private Task<string> SaveThumbnailAsync(IFormFile file, string prefix) =>
        storage.SaveFileAsync(file, Folder, $"{prefix}_{Guid.NewGuid()}{UploadHelper.Extension(file)}");

    private static NotFoundException NotFound(int id)
    {
        var message = $"Video with ID {id} not found";
        return new NotFoundException(message, message);
    }

    private static BadRequestException Text(string message) => new(message, message);

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
