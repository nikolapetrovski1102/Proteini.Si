using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/// <summary>Home page "Ново во продавница" section: what it shows is chosen in admin.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class HomeShowcaseController(IHomeShowcaseService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get() =>
        Ok(new { status = true, data = await service.GetAsync() });

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateHomeShowcaseDto dto)
    {
        await service.UpdateAsync(dto, User.FindFirst("email")?.Value);
        return Ok(new { status = true });
    }
}
