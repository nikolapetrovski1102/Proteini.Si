using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class PartnerService(IPartnerProvider provider, IImageStorageService storage) : IPartnerService
{
    private const string Folder = "uploads/partners";
    private const string InvalidTypeMessage = "Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed.";
    private const string TooLargeMessage = "File size too large. Maximum 5MB allowed.";
    private static readonly string[] Extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

    public Task<List<Partner>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<Partner>> GetAllAsync() => provider.GetAllAsync();

    public Task<List<Partner>> GetActiveByTypeAsync(string type)
    {
        if (type != "partner" && type != "award")
            throw Text("Type must be 'partner' or 'award'");

        return provider.GetActiveByTypeAsync(type);
    }

    public async Task<Partner> GetByIdAsync(int id) =>
        await provider.GetByIdAsync(id) ?? throw NotFound(id);

    public async Task<(int Id, string ImagePath)> CreateAsync(CreatePartnerDto partner)
    {
        if (string.IsNullOrEmpty(partner.Type))
            throw Text("Type is required (partner or award)");

        if (string.IsNullOrEmpty(partner.Name))
            throw Text("Name is required");

        if (partner.Image == null || partner.Image.Length == 0)
            throw Text("Image file is required");

        ValidateImage(partner.Image);
        var imagePath = await SaveImageAsync(partner.Image, partner.Type);

        var id = await provider.CreateAsync(partner, imagePath);
        return (id, imagePath);
    }

    public async Task<string> UpdateAsync(UpdatePartnerDto partner)
    {
        var existing = await provider.GetByIdAsync(partner.Id) ?? throw NotFound(partner.Id);
        var imagePath = existing.ImagePath;

        if (partner.Image is { Length: > 0 })
        {
            ValidateImage(partner.Image);
            storage.Delete(existing.ImagePath);
            imagePath = await SaveImageAsync(partner.Image, partner.Type);
        }

        if (!await provider.UpdateAsync(partner, imagePath))
            throw new ServerErrorException("Failed to update partner", "Failed to update partner");

        return imagePath;
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound(id);

        if (!await provider.DeleteAsync(id))
            throw new ServerErrorException("Failed to delete partner", "Failed to delete partner");

        storage.Delete(existing.ImagePath);
    }

    public async Task ReorderAsync(List<ReorderItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw Text("Reorder list is required");

        await provider.ReorderAsync(items);
    }

    public async Task<string> UploadImageAsync(IFormFile? file, string type)
    {
        if (file == null || file.Length == 0)
            throw ErrorBody("No file uploaded");

        if (!Extensions.Contains(UploadHelper.Extension(file)))
            throw ErrorBody(InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw ErrorBody(TooLargeMessage);

        return await SaveImageAsync(file, type);
    }

    private static void ValidateImage(IFormFile file)
    {
        if (!Extensions.Contains(UploadHelper.Extension(file)))
            throw Text(InvalidTypeMessage);

        if (file.Length > UploadHelper.FiveMegabytes)
            throw Text(TooLargeMessage);
    }

    private Task<string> SaveImageAsync(IFormFile file, string type) =>
        storage.SaveFileAsync(file, Folder, $"{type}_{Guid.NewGuid()}{UploadHelper.Extension(file)}");

    private static NotFoundException NotFound(int id)
    {
        var message = $"Partner with ID {id} not found";
        return new NotFoundException(message, message);
    }

    private static BadRequestException Text(string message) => new(message, message);

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
