using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class DynamicContentService(IDynamicSectionProvider provider) : IDynamicContentService
{
    private static readonly string[] PageTypes = ["terms-of-service", "general-provisions"];
    private static readonly string[] SectionTypes = ["title", "subtitle", "paragraph", "award", "spacer"];

    public Task<List<DynamicSection>> GetActiveByPageAsync(string pageType)
    {
        ValidatePageType(pageType);
        return provider.GetActiveByPageAsync(pageType);
    }

    public Task<List<DynamicSection>> GetAllByPageAsync(string pageType)
    {
        ValidatePageType(pageType);
        return provider.GetAllByPageAsync(pageType);
    }

    public async Task<DynamicSection> GetByIdAsync(int id) =>
        await provider.GetByIdAsync(id) ?? throw NotFound();

    public async Task<int> CreateAsync(CreateDynamicSectionDto section, string createdBy)
    {
        ValidatePageType(section.Page_Type);
        ValidateSectionType(section.Section_Type);

        return await provider.CreateAsync(section, createdBy);
    }

    public async Task UpdateAsync(UpdateDynamicSectionDto section, string updatedBy)
    {
        ValidateSectionType(section.Section_Type);

        if (!await provider.UpdateAsync(section, updatedBy))
            throw NotFound();
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeleteAsync(id))
            throw NotFound();
    }

    public Task ReorderAsync(ReorderDynamicSectionsDto reorder) => provider.ReorderAsync(reorder.Sections);

    private static void ValidatePageType(string pageType)
    {
        if (!PageTypes.Contains(pageType))
            throw ErrorBody("Invalid page type. Allowed values: 'terms-of-service', 'general-provisions'");
    }

    private static void ValidateSectionType(string sectionType)
    {
        if (!SectionTypes.Contains(sectionType))
            throw ErrorBody("Invalid section type. Allowed values: 'title', 'subtitle', 'paragraph', 'award', 'spacer'");
    }

    private static NotFoundException NotFound() => new("Section not found", new { error = "Section not found" });

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
