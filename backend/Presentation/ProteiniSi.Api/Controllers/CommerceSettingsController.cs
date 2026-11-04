using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class CommerceSettingsController(ICommerceSettingsService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("shipping")]
    public async Task<IActionResult> GetShipping() =>
        Ok(new { status = true, data = await service.GetShippingAsync() });

    [HttpPut("shipping")]
    public async Task<IActionResult> UpdateShipping([FromBody] UpdateShippingSettingsDto dto)
    {
        await service.UpdateShippingAsync(dto, User.FindFirst("email")?.Value);
        return Ok(new { status = true });
    }
}
