using ProteiniSi.Api.Exceptions;
using ProteiniSi.Api.Helpers;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Services.Implementation;

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
