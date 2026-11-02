using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Services.Helpers;

public static class ImageHelper
{
    public const long MaxSizeBytes = 8 * 1024 * 1024;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    public static bool HasFile(IFormFile? image) => image is { Length: > 0 };

    public static string? GetValidationError(IFormFile? image)
    {
        if (!HasFile(image))
            return null;

        if (image!.Length > MaxSizeBytes)
            return "Image must not exceed 8 MB.";

        if (!AllowedExtensions.Contains(Path.GetExtension(image.FileName).ToLowerInvariant()))
            return "Invalid image type.";

        if (!AllowedContentTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
            return "Invalid image content type.";

        return null;
    }
}
