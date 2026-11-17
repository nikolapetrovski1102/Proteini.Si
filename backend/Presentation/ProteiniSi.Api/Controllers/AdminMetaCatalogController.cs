using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

/// <summary>
/// Admin "Meta catalog": every row the public feed (/api/feed/products.xml) can contain, uncached, with brand and
/// category ids so the admin can pick variants, brands, categories or discounted items and export them.
/// </summary>
[ApiController]
[Route("api/admin/meta-catalog")]
[Authorize(Policy = "SuperAdmin")]
public class AdminMetaCatalogController(IProductFeedService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetItems() => Ok(await service.BuildItemsAsync());
}
