using Ganss.Xss;
using ProteiniSi.Api.Exceptions;
using ProteiniSi.Api.Helpers;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.Dtos;
using ProteiniSi.Api.Providers.Interfaces;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Services.Implementation;

public class TipArticleService(ITipArticleProvider provider, IImageStorageService imageStorage) : ITipArticleService
{
    private const string ImageFolder = "tips";
    private static readonly HtmlSanitizer ContentSanitizer = new();

    public Task<List<TipArticle>> GetActiveAsync() => provider.GetActiveAsync();

    public Task<List<TipArticle>> GetAllAsync() => provider.GetAllAsync();

    public async Task<TipArticle> GetActiveBySlugAsync(string slug) =>
        await provider.GetActiveBySlugAsync(SlugHelper.Normalize(slug))
        ?? throw new NotFoundException("Article not found.");

    public async Task<int> CreateAsync(TipArticleForm form)
    {
        Validate(form);
        var slug = await GetUniqueSlugAsync(form, excludingId: null);
        var imagePath = await imageStorage.SaveAsync(form.Image, ImageFolder, "tip");

        return await provider.CreateAsync(ToArticle(form, slug, imagePath));
    }

    public async Task UpdateAsync(TipArticleForm form)
    {
        var existing = await provider.GetByIdAsync(form.Id)
            ?? throw new NotFoundException("Article not found");

        Validate(form);
        var slug = await GetUniqueSlugAsync(form, excludingId: form.Id);
        var imagePath = await imageStorage.SaveAsync(form.Image, ImageFolder, "tip") ?? existing.ImagePath;

        await provider.UpdateAsync(ToArticle(form, slug, imagePath));
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeleteAsync(id))
            throw new NotFoundException("Article not found");
    }

    private async Task<string> GetUniqueSlugAsync(TipArticleForm form, int? excludingId)
    {
        var slug = SlugHelper.Normalize(string.IsNullOrWhiteSpace(form.Slug) ? form.Title : form.Slug);

        if (await provider.SlugExistsAsync(slug, excludingId))
            throw new ConflictException("An article with this URL slug already exists.");

        return slug;
    }

    private static void Validate(TipArticleForm form)
    {
        var error = GetValidationError(form);
        if (error != null)
            throw new BadRequestException(error);
    }

    private static string? GetValidationError(TipArticleForm form)
    {
        if (string.IsNullOrWhiteSpace(form.Title)) return "Title is required.";
        if (TextHelper.IsLongerThan(form.Title, 300)) return "Title must not exceed 300 characters.";
        if (TextHelper.IsLongerThan(form.TitleAl, 300)) return "Albanian title must not exceed 300 characters.";
        if (TextHelper.IsLongerThan(form.Subtitle, 500)) return "Subtitle must not exceed 500 characters.";
        if (TextHelper.IsLongerThan(form.SubtitleAl, 1000)) return "Albanian subtitle must not exceed 1000 characters.";
        if (TextHelper.IsLongerThan(form.SeoTitle, 300)) return "SEO title must not exceed 300 characters.";
        if ((form.SeoDescription?.Length ?? 0) > 500) return "SEO description must not exceed 500 characters.";

        return ImageHelper.GetValidationError(form.Image);
    }

    private static TipArticle ToArticle(TipArticleForm form, string slug, string? imagePath) => new()
    {
        Id = form.Id,
        Category = form.Category ?? "news",
        Title = form.Title.Trim(),
        TitleAl = TextHelper.NullIfEmpty(form.TitleAl),
        Subtitle = form.Subtitle ?? string.Empty,
        SubtitleAl = TextHelper.NullIfEmpty(form.SubtitleAl),
        Content = ContentSanitizer.Sanitize(form.Content ?? string.Empty),
        ContentAl = ContentSanitizer.Sanitize(form.ContentAl ?? string.Empty),
        Slug = slug,
        SeoTitle = TextHelper.NullIfEmpty(form.SeoTitle),
        SeoDescription = TextHelper.NullIfEmpty(form.SeoDescription),
        ImagePath = imagePath,
        DisplayOrder = form.DisplayOrder,
        IsActive = form.IsActive
    };
}
