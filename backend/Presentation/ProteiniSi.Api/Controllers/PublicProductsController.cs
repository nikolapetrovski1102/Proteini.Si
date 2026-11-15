using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

[Route("api/products")]
[ApiController]
public class PublicProductsController(IRelatedProductService relatedProductService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{productId:int}/related")]
    public async Task<IActionResult> GetRelatedProducts(int productId, [FromQuery] int? limit = null) =>
        Ok(await relatedProductService.GetRelatedProductsAsync(productId, limit));

    /// <summary>The home page "Because you ordered" section for the signed-in customer.</summary>
    [Authorize]
    [HttpGet("for-me")]
    public async Task<IActionResult> GetForCustomer([FromQuery] int? limit = null)
    {
        if (!int.TryParse(User.FindFirst("userId")?.Value, out var userId))
            return Unauthorized();

        return Ok(await relatedProductService.GetForCustomerAsync(userId, limit));
    }
}
