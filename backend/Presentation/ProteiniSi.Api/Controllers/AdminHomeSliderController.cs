using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Route("api/admin/homeslider")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class AdminHomeSliderController(IHomeSliderService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetHomeSliders() => Ok(await service.GetActiveAsync());

    [HttpGet("all")]
    public async Task<IActionResult> GetAllHomeSliders() => Ok(await service.GetAllAsync());

    [HttpPost("upload")]
    public async Task<IActionResult> UploadHomeSlider([FromForm] CreateHomeSliderDto model)
    {
        var created = await service.CreateAsync(model);
        return Ok(new
        {
            status = true,
            sliderId = created.SliderId,
            imagePath = created.ImagePath,
            mobileImagePath = created.MobileImagePath,
            displayOrder = created.DisplayOrder
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHomeSlider(int id, [FromBody] UpdateHomeSliderDto model)
    {
        await service.UpdateAsync(id, model);
        return Ok(new { status = true, message = "Home slider updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHomeSlider(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { status = true, message = "Home slider deleted successfully" });
    }

    [HttpPatch("reorder")]
    public async Task<IActionResult> ReorderSliders([FromBody] List<ReorderItemDto> reorderList)
    {
        await service.ReorderAsync(reorderList);
        return Ok(new { status = true, message = "Sliders reordered successfully" });
    }
}
