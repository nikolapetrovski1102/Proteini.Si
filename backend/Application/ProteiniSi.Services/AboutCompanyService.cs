using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class AboutCompanyService(IAboutCompanyProvider provider, IImageStorageService storage) : IAboutCompanyService
{
    private const string Folder = "uploads/about-company";
    private const string InvalidTypeMessage = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.";
    private const string TooLargeMessage = "File size too large. Maximum 5MB allowed.";
    private static readonly string[] SectionTypes = ["video", "title", "paragraph", "subtitle", "award", "business-cooperation"];

    public Task<List<AboutCompanySection>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<AboutCompanySection>> GetAllAsync() => provider.GetAllAsync();

    public async Task<AboutCompanySection> GetByIdAsync(int id) =>
        await provider.GetByIdAsync(id) ?? throw NotFound(id);

    public async Task<int> CreateAsync(CreateAboutCompanySectionDto section)
    {
        if (string.IsNullOrEmpty(section.SectionType))
            throw new BadRequestException("SectionType is required", "SectionType is required");

        if (!SectionTypes.Contains(section.SectionType))
        {
            const string message = "Invalid SectionType. Must be: video, title, paragraph, subtitle, award, or business-cooperation";
            throw new BadRequestException(message, message);
        }

        string? thumbnailPath = null;
        if (AcceptsThumbnail(section.SectionType, section.VideoThumbnail))
        {
            ValidateThumbnail(section.VideoThumbnail!);
            thumbnailPath = await SaveThumbnailAsync(section.VideoThumbnail!, "about_video");
        }

        return await provider.CreateAsync(section, thumbnailPath);
    }

    public async Task UpdateAsync(UpdateAboutCompanySectionDto section)
    {
        var existing = await provider.GetByIdAsync(section.Id) ?? throw NotFound(section.Id);
        var thumbnailPath = existing.VideoThumbnailPath;

        if (AcceptsThumbnail(section.SectionType, section.VideoThumbnail))
        {
            ValidateThumbnail(section.VideoThumbnail!);
            storage.Delete(existing.VideoThumbnailPath);
            thumbnailPath = await SaveThumbnailAsync(section.VideoThumbnail!, "about_video");
        }

        if (!await provider.UpdateAsync(section, thumbnailPath))
            throw new ServerErrorException("Failed to update section", "Failed to update section");
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound(id);

        if (!await provider.DeleteAsync(id))
            throw new ServerErrorException("Failed to delete section", "Failed to delete section");

        storage.Delete(existing.VideoThumbnailPath);
    }

    public async Task ReorderAsync(List<ReorderItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw new BadRequestException("Reorder list is required", "Reorder list is required");

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

        return await SaveThumbnailAsync(file, "about_thumb");
    }

    private static bool AcceptsThumbnail(string sectionType, IFormFile? file) =>
        (sectionType == "video" || sectionType == "business-cooperation") && file is { Length: > 0 };

    private static void ValidateThumbnail(IFormFile file)
    {
        if (!UploadHelper.ImageExtensions.Contains(UploadHelper.Extension(file)))
            throw new BadRequestException(InvalidTypeMessage, InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw new BadRequestException(TooLargeMessage, TooLargeMessage);
    }

    private Task<string> SaveThumbnailAsync(IFormFile file, string prefix) =>
        storage.SaveFileAsync(file, Folder, $"{prefix}_{Guid.NewGuid()}{UploadHelper.Extension(file)}");

    private static NotFoundException NotFound(int id)
    {
        var message = $"Section with ID {id} not found";
        return new NotFoundException(message, message);
    }

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
