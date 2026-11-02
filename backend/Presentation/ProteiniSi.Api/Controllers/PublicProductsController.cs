using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Services;

namespace ProteiniSi.Api.Controllers
{
    [Route("api/products")]
    [ApiController]
    [AllowAnonymous]
    public class PublicProductsController : ControllerBase
    {
        private readonly RelatedProductService _relatedProductService;

        public PublicProductsController(RelatedProductService relatedProductService)
        {
            _relatedProductService = relatedProductService;
        }

        [HttpGet("{productId:int}/related")]
        public IActionResult GetRelatedProducts(int productId, [FromQuery] int? limit = null)
        {
            var products = _relatedProductService.GetRelatedProducts(productId, limit);
            return Ok(products);
        }
    }
}
