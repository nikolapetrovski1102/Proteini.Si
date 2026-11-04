using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class HomeSliderService(IHomeSliderProvider provider, IImageStorageService storage) : IHomeSliderService
{
    private const string Folder = "home-slider";
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public Task<List<HomeSlider>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<HomeSlider>> GetAllAsync() => provider.GetAllAsync();

    public async Task<CreatedHomeSliderDto> CreateAsync(CreateHomeSliderDto slider)
    {
        if (slider.Image == null || slider.Image.Length == 0)
            throw ErrorBody("Desktop image is required");

        var hasMobileImage = slider.MobileImage is { Length: > 0 };

        ValidateImage(slider.Image);
        if (hasMobileImage)
            ValidateImage(slider.MobileImage!);

        var imagePath = await SaveImageAsync(slider.Image, "desktop");
        var mobileImagePath = hasMobileImage ? await SaveImageAsync(slider.MobileImage!, "mobile") : null;

        var (id, displayOrder) = await provider.CreateAsync(slider, imagePath, mobileImagePath);
        return new CreatedHomeSliderDto(id, imagePath, mobileImagePath, displayOrder);
    }

    public async Task UpdateAsync(int id, UpdateHomeSliderDto slider)
    {
        _ = await provider.GetByIdAsync(id) ?? throw NotFound();

        if (!await provider.UpdateAsync(id, slider))
            throw ErrorBody("Failed to update home slider");
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound();

        if (!await provider.DeleteAsync(id))
            throw ErrorBody("Failed to delete home slider");

        storage.Delete(existing.ImageUrl);
        storage.Delete(existing.MobileImageUrl);
    }

    public async Task ReorderAsync(List<ReorderItemDto>? items)
    {
        if (items == null || items.Count == 0)
            throw ErrorBody("Invalid reorder data");

        var missing = await provider.ReorderAsync(items);
        if (missing.Count == 0)
            return;

        var message = $"Slider with Id {items.First(item => missing.Contains(item.Id)).Id} not found";
        throw new ServerErrorException(message, new { error = message });
    }

    private static void ValidateImage(IFormFile file)
    {
        if (!AllowedExtensions.Contains(UploadHelper.Extension(file)))
            throw ErrorBody("Invalid file type. Only JPG, PNG and WEBP are allowed.");
    }

    private Task<string> SaveImageAsync(IFormFile file, string prefix) =>
        storage.SaveFileAsync(file, Folder, $"{prefix}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString()[..8]}{UploadHelper.Extension(file)}");

    private static NotFoundException NotFound() =>
        new("Home slider not found", new { error = "Home slider not found" });

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
