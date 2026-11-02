using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Caching;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class HomepageCardsController(IHomepageCardService service, IOutputCacheStore cache) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [OutputCache(Tags = [CacheTags.HomepageCards])]
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
        await cache.EvictByTagAsync(CacheTags.HomepageCards, default);
        return Ok(new { status = true, id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] HomepageCardForm form)
    {
        await service.UpdateAsync(id, form);
        await cache.EvictByTagAsync(CacheTags.HomepageCards, default);
        return Ok(new { status = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        await cache.EvictByTagAsync(CacheTags.HomepageCards, default);
        return Ok(new { status = true });
    }
}
