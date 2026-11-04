using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class LandingPageService(ILandingPageProvider provider, IImageStorageService storage) : ILandingPageService
{
    private const string Folder = "uploads/landing";
    private const string InvalidTypeMessage = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.";
    private const string TooLargeMessage = "File size too large. Maximum 5MB allowed.";
    private static readonly string[] SectionTypes = ["image", "title", "subtitle", "paragraph", "highlight", "italic"];

    public Task<List<LandingPageSection>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<LandingPageSection>> GetAllAsync() => provider.GetAllAsync();

    public async Task<LandingPageSection> GetByIdAsync(int id) =>
        await provider.GetByIdAsync(id) ?? throw NotFound(id);

    public async Task<int> CreateAsync(CreateLandingPageSectionDto section)
    {
        if (string.IsNullOrEmpty(section.SectionType))
            throw new BadRequestException("SectionType is required", "SectionType is required");

        if (!SectionTypes.Contains(section.SectionType))
        {
            const string message = "Invalid SectionType. Must be: image, title, subtitle, paragraph, highlight, or italic";
            throw new BadRequestException(message, message);
        }

        string? imagePath = null;
        if (AcceptsImage(section.SectionType, section.Image))
        {
            ValidateImage(section.Image!);
            imagePath = await SaveImageAsync(section.Image!);
        }

        return await provider.CreateAsync(section, imagePath);
    }

    public async Task UpdateAsync(UpdateLandingPageSectionDto section)
    {
        var existing = await provider.GetByIdAsync(section.Id) ?? throw NotFound(section.Id);
        var imagePath = existing.ImagePath;

        if (AcceptsImage(section.SectionType, section.Image))
        {
            ValidateImage(section.Image!);
            storage.Delete(existing.ImagePath);
            imagePath = await SaveImageAsync(section.Image!);
        }

        if (!await provider.UpdateAsync(section, imagePath))
            throw new ServerErrorException("Failed to update section", "Failed to update section");
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound(id);

        if (!await provider.DeleteAsync(id))
            throw new ServerErrorException("Failed to delete section", "Failed to delete section");

        storage.Delete(existing.ImagePath);
    }

    public async Task ReorderAsync(List<ReorderItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw new BadRequestException("Reorder list is required", "Reorder list is required");

        await provider.ReorderAsync(items);
    }

    public async Task<string> UploadImageAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            throw ErrorBody("No file uploaded");

        if (!UploadHelper.ImageExtensions.Contains(UploadHelper.Extension(file)))
            throw ErrorBody(InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw ErrorBody(TooLargeMessage);

        return await SaveImageAsync(file);
    }

    private static bool AcceptsImage(string sectionType, IFormFile? file) =>
        sectionType == "image" && file is { Length: > 0 };

    private static void ValidateImage(IFormFile file)
    {
        if (!UploadHelper.ImageExtensions.Contains(UploadHelper.Extension(file)))
            throw new BadRequestException(InvalidTypeMessage, InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw new BadRequestException(TooLargeMessage, TooLargeMessage);
    }

    private Task<string> SaveImageAsync(IFormFile file) =>
        storage.SaveFileAsync(file, Folder, $"landing_{Guid.NewGuid()}{UploadHelper.Extension(file)}");

    private static NotFoundException NotFound(int id)
    {
        var message = $"Section with ID {id} not found";
        return new NotFoundException(message, message);
    }

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
