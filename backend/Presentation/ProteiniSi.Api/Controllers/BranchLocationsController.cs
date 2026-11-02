using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Caching;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class BranchLocationsController(IBranchLocationService service, IOutputCacheStore cache) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [OutputCache(Tags = [CacheTags.BranchLocations])]
    public async Task<IActionResult> GetActiveLocations([FromQuery] string? type = null)
    {
        var locations = await service.GetActiveAsync(type);
        return Ok(new { status = true, data = locations });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllLocations()
    {
        var locations = await service.GetAllAsync();
        return Ok(new { status = true, data = locations });
    }

    [HttpPost]
    public async Task<IActionResult> CreateLocation([FromBody] BranchLocation location)
    {
        var id = await service.CreateAsync(location);
        await cache.EvictByTagAsync(CacheTags.BranchLocations, default);
        return Ok(new { status = true, id, message = "Location created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateLocation([FromBody] BranchLocation location)
    {
        await service.UpdateAsync(location);
        await cache.EvictByTagAsync(CacheTags.BranchLocations, default);
        return Ok(new { status = true, message = "Location updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(int id)
    {
        await service.DeleteAsync(id);
        await cache.EvictByTagAsync(CacheTags.BranchLocations, default);
        return Ok(new { status = true, message = "Location deleted successfully" });
    }
}
