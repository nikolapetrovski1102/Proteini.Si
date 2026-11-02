using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Services.Helpers;
using ProteiniSi.Models;
using ProteiniSi.Dtos;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

public class HomepageCardService(IHomepageCardProvider provider, IImageStorageService imageStorage) : IHomepageCardService
{
    private const string ImageFolder = "homepage-cards";
    private static readonly string[] AllowedSections = ["goal", "sport"];
    private static readonly string[] AllowedHosts = ["proteini.mk", "www.proteini.mk"];

    public Task<List<HomepageCard>> GetActiveAsync(string? section)
    {
        var normalized = section?.Trim().ToLowerInvariant();
        return provider.GetActiveAsync(AllowedSections.Contains(normalized) ? normalized : null);
    }

    public Task<List<HomepageCard>> GetAllAsync() => provider.GetAllAsync();

    public async Task<int> CreateAsync(HomepageCardForm form)
    {
        Validate(form);
        var slug = await GetUniqueSlugAsync(form.Slug, excludingId: null);

        var imagePath = await imageStorage.SaveAsync(form.Image, ImageFolder, "homepage")
            ?? throw new BadRequestException("Choose an image for the homepage card.");

        return await provider.CreateAsync(ToCard(form, 0, slug, imagePath));
    }

    public async Task UpdateAsync(int id, HomepageCardForm form)
    {
        Validate(form);
        var slug = await GetUniqueSlugAsync(form.Slug, excludingId: id);

        var existing = await provider.GetByIdAsync(id)
            ?? throw new NotFoundException("Homepage card not found.");

        var imagePath = await imageStorage.SaveAsync(form.Image, ImageFolder, "homepage") ?? existing.ImagePath;

        await provider.UpdateAsync(ToCard(form, id, slug, imagePath));
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeleteAsync(id))
            throw new NotFoundException("Homepage card not found.");
    }

    private async Task<string> GetUniqueSlugAsync(string value, int? excludingId)
    {
        var slug = SlugHelper.Normalize(value);

        if (await provider.SlugExistsAsync(slug, excludingId))
            throw new ConflictException("A homepage card with this URL slug already exists.");

        return slug;
    }

    private static void Validate(HomepageCardForm form)
    {
        var error = GetValidationError(form);
        if (error != null)
            throw new BadRequestException(error);
    }

    private static string? GetValidationError(HomepageCardForm form)
    {
        if (!AllowedSections.Contains(form.Section?.Trim().ToLowerInvariant())) return "Section must be goal or sport.";
        if (string.IsNullOrWhiteSpace(form.TitleMk)) return "Macedonian title is required.";
        if (string.IsNullOrWhiteSpace(form.Slug)) return "URL slug is required.";
        if (string.IsNullOrWhiteSpace(form.FilterValue)) return "Product filter value is required.";
        if (TextHelper.IsLongerThan(form.TitleMk, 200) || TextHelper.IsLongerThan(form.TitleAl, 200))
            return "Card titles must not exceed 200 characters.";
        if (TextHelper.IsLongerThan(form.FilterValue, 200)) return "Product filter value is too long.";
        if (TextHelper.IsLongerThan(form.DestinationUrl, 500)) return "Destination URL is too long.";
        if (!IsAllowedDestination(form.DestinationUrl)) return "Destination URL must be an internal path or a Proteini.mk HTTPS URL.";
        if (string.IsNullOrEmpty(SlugHelper.Normalize(form.Slug))) return "URL slug is invalid.";

        return ImageHelper.GetValidationError(form.Image);
    }

    private static bool IsAllowedDestination(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return true;

        var destination = value.Trim();
        if (destination.StartsWith('/') && !destination.StartsWith("//"))
            return true;

        return Uri.TryCreate(destination, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && AllowedHosts.Contains(uri.Host, StringComparer.OrdinalIgnoreCase);
    }

    private static HomepageCard ToCard(HomepageCardForm form, int id, string slug, string? imagePath) => new()
    {
        Id = id,
        Section = form.Section.Trim().ToLowerInvariant(),
        TitleMk = form.TitleMk.Trim(),
        TitleAl = TextHelper.NullIfEmpty(form.TitleAl),
        Slug = slug,
        FilterValue = form.FilterValue.Trim(),
        DestinationUrl = TextHelper.NullIfEmpty(form.DestinationUrl),
        ImagePath = imagePath,
        DisplayOrder = form.DisplayOrder,
        IsActive = form.IsActive
    };
}
