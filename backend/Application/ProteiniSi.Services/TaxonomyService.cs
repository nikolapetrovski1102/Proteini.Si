using System.Globalization;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class TaxonomyService(ITaxonomyProvider provider) : ITaxonomyService
{
    public Task<List<ProductCategory>> GetCategoriesAsync() => provider.GetCategoriesAsync();

    public async Task<int> CreateCategoryAsync(CategoryWriteDto category)
    {
        Validate(category);

        var (result, id) = await provider.CreateCategoryAsync(
            category.Name.Trim(), NormalizeSlug(category.Slug), category.ParentId, category.DisplayOrder);

        ThrowOnFailure(result);
        return id!.Value;
    }

    public async Task UpdateCategoryAsync(int id, CategoryWriteDto category)
    {
        Validate(category);

        if (category.ParentId == id)
            throw ErrorBody("A category cannot be its own parent.");

        var result = await provider.UpdateCategoryAsync(
            id, category.Name.Trim(), NormalizeSlug(category.Slug), category.ParentId, category.DisplayOrder);

        ThrowOnFailure(result);
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var deleted = await provider.DeleteCategoryAsync(id);

        if (deleted == null)
        {
            const string message = "This category is still used by products or subcategories. Move those records before deleting it.";
            throw new ConflictException(message, new { error = message });
        }

        if (deleted == false)
            throw CategoryNotFound();
    }

    public Task<ProductCategory?> ResolveCategorySlugAsync(string slug) =>
        provider.ResolveCategorySlugAsync(NormalizeSlug(slug));

    private static void Validate(CategoryWriteDto category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
            throw ErrorBody("Category name is required.");

        if (string.IsNullOrWhiteSpace(category.Slug))
            throw ErrorBody("Category URL slug is required.");
    }

    private static void ThrowOnFailure(CategoryWriteResult result)
    {
        switch (result)
        {
            case CategoryWriteResult.ParentMissing:
                throw ErrorBody("The selected parent category does not exist.");
            case CategoryWriteResult.WouldCreateCycle:
                throw ErrorBody("That parent selection would create a category cycle.");
            case CategoryWriteResult.SlugEmpty:
                throw ErrorBody("Category URL slug must contain at least one letter or number.");
            case CategoryWriteResult.SlugTaken:
                throw new ConflictException("A category with this slug already exists.", new { error = "A category with this slug already exists." });
            case CategoryWriteResult.NotFound:
                throw CategoryNotFound();
        }
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

    private static NotFoundException CategoryNotFound() =>
        new("Category not found.", new { error = "Category not found." });

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
