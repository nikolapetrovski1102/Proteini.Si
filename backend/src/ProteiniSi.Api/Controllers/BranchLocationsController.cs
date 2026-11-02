using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class BranchLocationsController(IBranchLocationService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
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
        return Ok(new { status = true, id, message = "Location created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateLocation([FromBody] BranchLocation location)
    {
        await service.UpdateAsync(location);
        return Ok(new { status = true, message = "Location updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLocation(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { status = true, message = "Location deleted successfully" });
    }
}
