using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Services.Helpers;

public static class UploadHelper
{
    public const long FiveMegabytes = 5 * 1024 * 1024;

    public static readonly string[] ImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    public static string Extension(IFormFile file) => Path.GetExtension(file.FileName).ToLowerInvariant();
}
