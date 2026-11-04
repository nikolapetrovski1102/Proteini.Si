using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class LandingPageController(ILandingPageService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllSections() => Ok(await service.GetActiveAsync());

    [HttpGet("all")]
    public async Task<IActionResult> GetAllSectionsIncludingInactive() => Ok(await service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSectionById(int id) => Ok(await service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> CreateSection([FromForm] CreateLandingPageSectionDto newSection)
    {
        var id = await service.CreateAsync(newSection);
        return Ok(new { Id = id, Message = "Section created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSection([FromForm] UpdateLandingPageSectionDto updatedSection)
    {
        await service.UpdateAsync(updatedSection);
        return Ok(new { Message = "Section updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { Message = "Section deleted successfully" });
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> ReorderSections([FromBody] List<ReorderItemDto> reorderList)
    {
        await service.ReorderAsync(reorderList);
        return Ok(new { Message = "Sections reordered successfully" });
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        var path = await service.UploadImageAsync(file);
        return Ok(new { imagePath = path, message = "Image uploaded successfully" });
    }
}
