using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

/// <summary>
/// Public product catalog feed for ads. Add https://proteini.mk/api/feed/products.xml as a scheduled data feed in
/// Meta Commerce Manager (Facebook/Instagram catalog ads) or Google Merchant Center.
/// </summary>
[Route("api/feed")]
[ApiController]
[AllowAnonymous]
public class ProductFeedController(IProductFeedService service) : ControllerBase
{
    [HttpGet("products.xml")]
    [OutputCache(Duration = 1800)]
    public async Task<IActionResult> GetProductsXml() =>
        Content(await service.BuildXmlFeedAsync(), "application/xml; charset=utf-8");
}
