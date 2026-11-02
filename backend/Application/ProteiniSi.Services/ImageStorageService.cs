using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Services.Helpers;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

public class ImageStorageService(IWebHostEnvironment environment) : IImageStorageService
{
    public async Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix)
    {
        if (!ImageHelper.HasFile(image))
            return null;

        var error = ImageHelper.GetValidationError(image);
        if (error != null)
            throw new BadRequestException(error);

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadsFolder = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{filePrefix}_{Guid.NewGuid():N}{Path.GetExtension(image!.FileName).ToLowerInvariant()}";

        await using var stream = new FileStream(Path.Combine(uploadsFolder, fileName), FileMode.Create);
        await image.CopyToAsync(stream);

        return $"/uploads/{folder}/{fileName}";
    }
}
