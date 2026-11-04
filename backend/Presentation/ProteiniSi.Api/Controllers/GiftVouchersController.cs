using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class GiftVouchersController(IGiftVoucherService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] GiftVoucherValidationDto dto)
    {
        var result = await service.ValidateAsync(dto);
        return Ok(new
        {
            status = true,
            code = result.Code,
            remainingValue = result.RemainingValue,
            applicableAmount = result.ApplicableAmount,
            currency = "MKD"
        });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminVouchers(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        var result = await service.GetPagedAsync(search, status, page, pageSize);

        return Ok(new
        {
            status = true,
            data = result.Items,
            page,
            pageSize,
            totalCount = result.TotalCount,
            totalPages = (int)Math.Ceiling(result.TotalCount / (double)pageSize)
        });
    }

    [HttpPut("admin/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] GiftVoucherStatusDto dto)
    {
        await service.UpdateStatusAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpGet("admin/report.csv")]
    public async Task<IActionResult> ExportReport()
    {
        var export = await service.ExportReportAsync();
        return File(export.Content, "text/csv; charset=utf-8", export.FileName);
    }
}
