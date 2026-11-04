using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

[Route("api/products")]
[ApiController]
[AllowAnonymous]
public class PublicProductsController(IRelatedProductService relatedProductService) : ControllerBase
{
    [HttpGet("{productId:int}/related")]
    public async Task<IActionResult> GetRelatedProducts(int productId, [FromQuery] int? limit = null) =>
        Ok(await relatedProductService.GetRelatedProductsAsync(productId, limit));
}
