using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

/** Products the admin pins to the top of a category, brand or whole-shop listing (default sort only). */
public class ProductPlacementService(IProductPlacementProvider provider) : IProductPlacementService
{
    public const int MaxPerListing = 12;

    public Task<ProductPlacementAdmin> GetAdminAsync() => provider.GetAdminAsync();

    public async Task SaveAsync(SaveProductPlacementsDto dto)
    {
        var scope = (dto.Scope ?? "").Trim().ToLowerInvariant();
        if (!ProductPlacement.Scopes.Contains(scope))
            throw ErrorBody("Choose a category, a brand or the whole shop.");

        var targetId = scope == ProductPlacement.ScopeAll ? 0 : dto.TargetId;
        if (scope != ProductPlacement.ScopeAll && targetId <= 0)
            throw ErrorBody("Choose a category or a brand.");

        var productIds = (dto.ProductIds ?? []).Where(id => id > 0).Distinct().ToList();
        if (productIds.Count > MaxPerListing)
            throw ErrorBody($"At most {MaxPerListing} products can be pinned in one listing.");

        if (!await provider.SaveAsync(scope, targetId, productIds))
        {
            var message = scope == ProductPlacement.ScopeBrand ? "Brand not found." : "Category not found.";
            throw new NotFoundException(message, new { error = message });
        }
    }

    private static BadRequestException ErrorBody(string message) => new(message, new { error = message });
}
