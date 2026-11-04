using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class PartnersController(IPartnerService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllPartners() => Ok(await service.GetActiveAsync());

    [HttpGet("all")]
    public async Task<IActionResult> GetAllPartnersIncludingInactive() => Ok(await service.GetAllAsync());

    [AllowAnonymous]
    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetPartnersByType(string type) => Ok(await service.GetActiveByTypeAsync(type));

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPartnerById(int id) => Ok(await service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> CreatePartner([FromForm] CreatePartnerDto newPartner)
    {
        var (id, imagePath) = await service.CreateAsync(newPartner);
        return Ok(new { Id = id, Message = "Partner created successfully", ImagePath = imagePath });
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePartner([FromForm] UpdatePartnerDto updatedPartner)
    {
        var imagePath = await service.UpdateAsync(updatedPartner);
        return Ok(new { Message = "Partner updated successfully", ImagePath = imagePath });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePartner(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { Message = "Partner deleted successfully" });
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> ReorderPartners([FromBody] List<ReorderItemDto> reorderList)
    {
        await service.ReorderAsync(reorderList);
        return Ok(new { Message = "Partners reordered successfully" });
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadPartnerImage(IFormFile file, string type)
    {
        var path = await service.UploadImageAsync(file, type);
        return Ok(new { imagePath = path, message = "Image uploaded successfully" });
    }
}
