using System.Globalization;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

/** Admin brand management. Logos and header photos are stored in wwwroot/uploads/brands. */
public class BrandService(IBrandProvider provider, IImageStorageService storage) : IBrandService
{
    private const string Folder = "brands";

    public Task<List<BrandAdmin>> GetAllAsync() => provider.GetAllAsync();

    public Task<int> CreateAsync(BrandWriteDto brand) => SaveAsync(null, null, brand);

    public async Task UpdateAsync(int id, BrandWriteDto brand)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound();
        await SaveAsync(id, existing, brand);
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await provider.GetByIdAsync(id) ?? throw NotFound();
        var deleted = await provider.DeleteAsync(id);

        if (deleted == null)
        {
            var message = $"This brand is used by {existing.Product_Count} product(s). Move them to another brand before deleting it.";
            throw new ConflictException(message, new { error = message });
        }

        if (deleted == false)
            throw NotFound();

        storage.Delete(existing.Logo_Url);
        storage.Delete(existing.Header_Image_Url);
    }

    private async Task<int> SaveAsync(int? id, Brand? existing, BrandWriteDto brand)
    {
        var name = brand.Name?.Trim() ?? "";
        if (name.Length == 0)
            throw ErrorBody("Brand name is required.");
        if (name.Length > 100)
            throw ErrorBody("Brand name must be at most 100 characters.");

        var slug = NormalizeSlug(string.IsNullOrWhiteSpace(brand.Slug) ? name : brand.Slug);
        if (slug.Length > 100)
            throw ErrorBody("Brand URL must be at most 100 characters.");

        // Save new files first; the database only points at them once the row is saved.
        var newLogo = await storage.SaveAsync(brand.Logo, Folder, "logo");
        string? newHeader;
        try
        {
            newHeader = await storage.SaveAsync(brand.HeaderImage, Folder, "header");
        }
        catch
        {
            storage.Delete(newLogo);
            throw;
        }

        var logo = newLogo ?? (brand.RemoveLogo ? null : existing?.Logo_Url);
        var header = newHeader ?? (brand.RemoveHeaderImage ? null : existing?.Header_Image_Url);

        (int Result, int? Id) saved;
        try
        {
            saved = await provider.SaveAsync(id, name, slug, logo, header, brand.IsFeatured, brand.DisplayOrder);
        }
        catch
        {
            storage.Delete(newLogo);
            storage.Delete(newHeader);
            throw;
        }

        if (saved.Result != 0)
        {
            storage.Delete(newLogo);
            storage.Delete(newHeader);
            throw saved.Result switch
            {
                1 => ErrorBody("Brand URL must contain at least one letter or number."),
                2 => new ConflictException("A brand with this URL already exists.", new { error = "A brand with this URL already exists." }),
                3 => ErrorBody("Only 4 brands can be shown in the header. Remove one of them from the header first."),
                _ => NotFound()
            };
        }

        // Old files that were replaced or removed are no longer referenced.
        if (existing != null)
        {
            if (existing.Logo_Url != logo) storage.Delete(existing.Logo_Url);
            if (existing.Header_Image_Url != header) storage.Delete(existing.Header_Image_Url);
        }

        return saved.Id!.Value;
    }

    private static string NormalizeSlug(string value)
    {
        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var output = new StringBuilder();
        var previousDash = false;

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(character))
            {
                output.Append(character);
                previousDash = false;
            }
            else if (!previousDash && output.Length > 0)
            {
                output.Append('-');
                previousDash = true;
            }
        }

        return output.ToString().Trim('-');
    }

    private static NotFoundException NotFound() => new("Brand not found.", new { error = "Brand not found." });

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
