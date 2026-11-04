using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Authorize(Policy = "SuperAdmin")]
[Route("api/admin/[controller]")]
[ApiController]
public class PackagingController(IPackagingService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllPackaging() =>
        Ok(new { status = true, data = await service.GetActiveAsync() });

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPackagingById(int id) =>
        Ok(new { status = true, data = await service.GetByIdAsync(id) });

    [HttpPost]
    public async Task<IActionResult> CreatePackaging([FromBody] CreatePackagingDto createDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        var id = await service.CreateAsync(createDto);
        return Ok(new { status = true, message = "Packaging created successfully", packagingId = id });
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePackaging([FromBody] UpdatePackagingDto updateDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.UpdateAsync(updateDto);
        return Ok(new { status = true, message = "Packaging updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePackaging(int id)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.DeleteAsync(id);
        return Ok(new { status = true, message = "Packaging deleted successfully" });
    }

    private bool IsAdmin() => User.FindFirst("superAdmin")?.Value is "True" or "true";

    private UnauthorizedObjectResult AdminRequired() => Unauthorized(new { message = "Admin access required" });
}
