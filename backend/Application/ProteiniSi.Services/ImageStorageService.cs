using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Services.Helpers;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

public class ImageStorageService(
    IWebHostEnvironment environment,
    ICdnCacheService cdnCache,
    ILogger<ImageStorageService> logger) : IImageStorageService
{
    private string WebRoot => environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");

    public async Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix)
    {
        if (!ImageHelper.HasFile(image))
            return null;

        var error = ImageHelper.GetValidationError(image);
        if (error != null)
            throw new BadRequestException(error);

        var fileName = $"{filePrefix}_{Guid.NewGuid():N}{Path.GetExtension(image!.FileName).ToLowerInvariant()}";

        return await SaveFileAsync(image, $"uploads/{folder}", fileName);
    }

    public async Task<string> SaveFileAsync(IFormFile file, string webFolder, string fileName)
    {
        var folder = Path.Combine(WebRoot, webFolder);
        Directory.CreateDirectory(folder);

        await using var stream = new FileStream(Path.Combine(folder, Path.GetFileName(fileName)), FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/{webFolder}/{Path.GetFileName(fileName)}";
    }

    public void Delete(string? webPath)
    {
        if (string.IsNullOrWhiteSpace(webPath))
            return;

        var root = Path.GetFullPath(WebRoot);
        var fullPath = Path.GetFullPath(Path.Combine(root, webPath.TrimStart('/', '\\')));

        if (!fullPath.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.Ordinal))
            return;

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        // Uploads always get a new unique file name, so only removed/replaced files can be
        // stale at the edge. Purge them in the background so the request is not slowed down.
        if (cdnCache.IsConfigured)
            _ = PurgeInBackgroundAsync(webPath);
    }

    private async Task PurgeInBackgroundAsync(string webPath)
    {
        try
        {
            await cdnCache.PurgePathsAsync([webPath]);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "CDN purge for {WebPath} failed", webPath);
        }
    }
}
