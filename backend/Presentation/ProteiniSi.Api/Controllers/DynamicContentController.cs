using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class DynamicContentController(IDynamicContentService service) : ControllerBase
{
    [HttpGet("{pageType}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSectionsByPage(string pageType) =>
        Ok(await service.GetActiveByPageAsync(pageType));

    [HttpGet("admin/{pageType}")]
    [Authorize]
    public async Task<IActionResult> GetAllSectionsForAdmin(string pageType)
    {
        if (!IsAdmin())
            return AdminRequired();

        return Ok(await service.GetAllByPageAsync(pageType));
    }

    [HttpGet("section/{id}")]
    [Authorize]
    public async Task<IActionResult> GetSectionById(int id)
    {
        if (!IsAdmin())
            return AdminRequired();

        return Ok(await service.GetByIdAsync(id));
    }

    [HttpPost("section")]
    [Authorize]
    public async Task<IActionResult> CreateSection([FromBody] CreateDynamicSectionDto createDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        var sectionId = await service.CreateAsync(createDto, CurrentEmail());
        return Ok(new { status = true, message = "Section created successfully", sectionId });
    }

    [HttpPut("section")]
    [Authorize]
    public async Task<IActionResult> UpdateSection([FromBody] UpdateDynamicSectionDto updateDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.UpdateAsync(updateDto, CurrentEmail());
        return Ok(new { status = true, message = "Section updated successfully" });
    }

    [HttpDelete("section/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteSection(int id)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.DeleteAsync(id);
        return Ok(new { status = true, message = "Section deleted successfully" });
    }

    [HttpPost("reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderSections([FromBody] ReorderDynamicSectionsDto reorderDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.ReorderAsync(reorderDto);
        return Ok(new { status = true, message = "Sections reordered successfully" });
    }

    private bool IsAdmin() => User.FindFirst("superAdmin")?.Value is "True" or "true";

    private string CurrentEmail() => User.FindFirst("email")?.Value ?? "admin";

    private UnauthorizedObjectResult AdminRequired() => Unauthorized(new { message = "Admin access required" });
}
