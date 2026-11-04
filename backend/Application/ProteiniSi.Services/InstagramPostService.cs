using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class InstagramPostService(IInstagramPostProvider provider, IImageStorageService storage) : IInstagramPostService
{
    public Task<List<InstagramPost>> GetActiveAsync() => provider.GetActiveAsync();

    public async Task<InstagramPost> GetByIdAsync(int id) =>
        await provider.GetActiveByIdAsync(id) ?? throw NotFound(id);

    public async Task<int> CreateAsync(CreateInstagramPostDto post)
    {
        if (string.IsNullOrEmpty(post.PostUrl))
            throw Text("PostUrl is required");

        if (string.IsNullOrEmpty(post.ImagePath))
            throw Text("ImagePath is required");

        return await provider.CreateAsync(post);
    }

    public async Task UpdateAsync(UpdateInstagramPostDto post)
    {
        _ = await provider.GetActiveByIdAsync(post.Id) ?? throw NotFound(post.Id);

        if (!await provider.UpdateAsync(post))
            throw new ServerErrorException("Failed to update post", "Failed to update post");
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetActiveByIdAsync(id) ?? throw NotFound(id);

        if (!await provider.DeactivateAsync(id))
            throw new ServerErrorException("Failed to delete post", "Failed to delete post");

        if (existing.ImagePath.StartsWith('/'))
            storage.Delete(existing.ImagePath);
    }

    public async Task<string> UploadImageAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            throw ErrorBody("No file uploaded");

        var extension = UploadHelper.Extension(file);

        if (!UploadHelper.ImageExtensions.Contains(extension))
            throw ErrorBody("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

        if (file.Length > UploadHelper.FiveMegabytes)
            throw ErrorBody("File size too large. Maximum 5MB allowed.");

        return await storage.SaveFileAsync(file, "uploads/instagram", $"instagram_{Guid.NewGuid()}{extension}");
    }

    private static NotFoundException NotFound(int id)
    {
        var message = $"Post with ID {id} not found";
        return new NotFoundException(message, message);
    }

    private static BadRequestException Text(string message) => new(message, message);

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
