using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class HomeShowcaseService(IHomeShowcaseProvider provider) : IHomeShowcaseService
{
    private const int MaxItems = 12;
    private const int MaxTitleLength = 120;

    public async Task<HomeShowcase> GetAsync()
    {
        try
        {
            return await provider.GetAsync(HomeShowcase.WhatsNewKey) ?? new HomeShowcase();
        }
        catch
        {
            // Keeps the home page working during a rolling deployment before the additive migration runs.
            return new HomeShowcase();
        }
    }

    public async Task UpdateAsync(UpdateHomeShowcaseDto showcase, string? updatedBy)
    {
        showcase.Source = (showcase.Source ?? "").Trim().ToLowerInvariant();
        if (!HomeShowcase.Sources.Contains(showcase.Source))
            throw Invalid("Choose what to show: new, bestsellers, sale or manual.");

        if (showcase.ItemCount is < 1 or > MaxItems)
            throw Invalid($"Show between 1 and {MaxItems} products.");

        showcase.TitleMk = showcase.TitleMk?.Trim();
        showcase.TitleAl = showcase.TitleAl?.Trim();
        if (showcase.TitleMk?.Length > MaxTitleLength || showcase.TitleAl?.Length > MaxTitleLength)
            throw Invalid($"Titles can be at most {MaxTitleLength} characters.");

        showcase.ProductIds = (showcase.ProductIds ?? []).Where(id => id > 0).Distinct().Take(MaxItems).ToList();
        if (showcase.Source == "manual" && showcase.ProductIds.Count == 0)
            throw Invalid("Pick at least one product for a hand-picked section.");

        await provider.UpdateAsync(HomeShowcase.WhatsNewKey, showcase, updatedBy);
    }

    private static BadRequestException Invalid(string message) =>
        new(message, new { status = false, message });
}
