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
public class ProductFeedController(IProductFeedService service) : ControllerBase
{
    [HttpGet("products.xml")]
    [OutputCache(Duration = 1800, VaryByQueryKeys = ["items", "brands", "categories", "onSale"])]
    public async Task<IActionResult> GetProductsXml(
        [FromQuery] string? items, [FromQuery] string? brands, [FromQuery] string? categories, [FromQuery] string? onSale) =>
        Content(await service.BuildXmlFeedAsync(CatalogFeedSelection.Parse(items, brands, categories, onSale)),
            "application/xml; charset=utf-8");
}
