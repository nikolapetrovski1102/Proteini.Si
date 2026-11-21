using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/// <summary>
/// Public product catalog feed for ads. Add https://proteini.mk/api/feed/products.xml as a scheduled data feed in
/// Meta Commerce Manager (Facebook/Instagram catalog ads) or Google Merchant Center. Optional filters (built by the
/// admin "Meta catalog" page): ?items=v12,p5&amp;brands=3&amp;categories=7&amp;onSale=1; an item matching any of them is included.
/// </summary>
[Route("api/feed")]
[ApiController]
[AllowAnonymous]
public partial class ProductFeedController(IProductFeedService service) : ControllerBase
{
    [HttpGet("products.xml")]
    [OutputCache(Duration = 1800, VaryByQueryKeys = ["items", "brands", "categories", "onSale"])]
    public async Task<IActionResult> GetProductsXml(
        [FromQuery] string? items, [FromQuery] string? brands, [FromQuery] string? categories, [FromQuery] string? onSale) =>
        Content(await service.BuildXmlFeedAsync(CatalogFeedSelection.Parse(items, brands, categories, onSale)),
            "application/xml; charset=utf-8");

    /// <summary>
    /// Products for the proteini.mk/collection page a Meta collection ad opens: ?items=v12,p5,... (up to 50) in that order,
    /// with the same names, photos and prices as the feed. Unknown IDs are skipped.
    /// </summary>
    [HttpGet("collection")]
    [OutputCache(Duration = 600, VaryByQueryKeys = ["items"])]
    public async Task<ActionResult<List<CollectionItemDto>>> GetCollection([FromQuery] string? items)
    {
        var ids = (items ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(id => id.ToLowerInvariant())
            .Where(id => ItemId().IsMatch(id))
            .Distinct()
            .Take(50)
            .ToList();
        if (ids.Count == 0)
            return Ok(new List<CollectionItemDto>());

        var byId = (await service.BuildItemsAsync()).GroupBy(i => i.Id).ToDictionary(g => g.Key, g => g.First());
        return Ok(ids.Where(byId.ContainsKey).Select(id =>
        {
            var item = byId[id];
            return new CollectionItemDto(
                item.Id,
                item.ProductId,
                item.VariantId,
                item.Title,
                item.VariantId is { } variantId ? $"/product/{item.ProductId}?variant={variantId}" : $"/product/{item.ProductId}",
                item.ImageLink,
                Amount(item.Price) ?? 0,
                Amount(item.SalePrice),
                item.Quantity > 0);
        }).ToList());
    }

    /// <summary>"2290.00 MKD" → 2290.00.</summary>
    private static decimal? Amount(string? price) =>
        decimal.TryParse(price?.Split(' ')[0], NumberStyles.Number, CultureInfo.InvariantCulture, out var value) ? value : null;

    [GeneratedRegex(@"^[vp][0-9]{1,10}$")]
    private static partial Regex ItemId();
}
