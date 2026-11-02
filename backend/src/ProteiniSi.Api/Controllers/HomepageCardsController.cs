using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Models.Dtos;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class HomepageCardsController(IHomepageCardService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetActive([FromQuery] string? section = null)
    {
        var cards = await service.GetActiveAsync(section);
        return Ok(new { status = true, data = cards });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetAll()
    {
        var cards = await service.GetAllAsync();
        return Ok(new { status = true, data = cards });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] HomepageCardForm form)
    {
        var id = await service.CreateAsync(form);
        return Ok(new { status = true, id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] HomepageCardForm form)
    {
        await service.UpdateAsync(id, form);
        return Ok(new { status = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { status = true });
    }
}
