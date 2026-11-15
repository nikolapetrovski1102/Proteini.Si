using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/** Pinned products per shop listing. The shop applies them inside the product filter (default sort only). */
[ApiController]
[Route("api/admin/product-placements")]
[Authorize(Policy = "SuperAdmin")]
public class AdminProductPlacementsController(IProductPlacementService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await service.GetAdminAsync());

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveProductPlacementsDto dto)
    {
        await service.SaveAsync(dto);
        return Ok(new { status = true });
    }
}
