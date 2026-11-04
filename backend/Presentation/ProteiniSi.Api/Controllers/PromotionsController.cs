using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class PromotionsController(IPromotionService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("active")]
    public async Task<IActionResult> GetActive([FromQuery] decimal subtotal = 0) =>
        Ok(new { promoCodes = Array.Empty<object>(), freeGifts = await service.GetActiveFreeGiftsAsync(subtotal) });

    [AllowAnonymous]
    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] PromotionValidationDto dto) =>
        Ok(await service.ValidateAsync(dto));

    [HttpGet("admin/codes")]
    public async Task<IActionResult> GetCodes() => Ok(await service.GetCodesAsync());

    [HttpPost("admin/codes")]
    public async Task<IActionResult> CreateCode([FromBody] PromotionCodeUpsertDto dto) =>
        Ok(new { status = true, promoCodeId = await service.CreateCodeAsync(dto) });

    [HttpPut("admin/codes/{id:int}")]
    public async Task<IActionResult> UpdateCode(int id, [FromBody] PromotionCodeUpsertDto dto)
    {
        await service.UpdateCodeAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpDelete("admin/codes/{id:int}")]
    public async Task<IActionResult> DeleteCode(int id)
    {
        var archived = await service.DeleteCodeAsync(id);
        return Ok(new
        {
            status = true,
            archived,
            message = archived
                ? "This promotion was used by an order, so it was archived to preserve the sales report."
                : "Promotion code deleted."
        });
    }

    [HttpGet("admin/free-gifts")]
    public async Task<IActionResult> GetFreeGifts() => Ok(await service.GetFreeGiftsAsync());

    [HttpPost("admin/free-gifts")]
    public async Task<IActionResult> CreateFreeGift([FromBody] FreeGiftUpsertDto dto) =>
        Ok(new { status = true, freeGiftId = await service.CreateFreeGiftAsync(dto) });

    [HttpPut("admin/free-gifts/{id:int}")]
    public async Task<IActionResult> UpdateFreeGift(int id, [FromBody] FreeGiftUpsertDto dto)
    {
        await service.UpdateFreeGiftAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpDelete("admin/free-gifts/{id:int}")]
    public async Task<IActionResult> DeleteFreeGift(int id)
    {
        var archived = await service.DeleteFreeGiftAsync(id);
        return Ok(new
        {
            status = true,
            archived,
            message = archived
                ? "This gift was used by an order, so it was archived to preserve order history."
                : "Free gift deleted."
        });
    }

    [HttpGet("admin/report")]
    public async Task<IActionResult> GetUsageReport([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null) =>
        Ok(await service.GetUsageReportAsync(from, to));

    [HttpGet("admin/report.csv")]
    public async Task<IActionResult> ExportUsageReport([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var export = await service.ExportUsageReportAsync(from, to);
        return File(export.Content, "text/csv; charset=utf-8", export.FileName);
    }
}
