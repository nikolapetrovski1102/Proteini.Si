using System.Security.Claims;
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

    /// <summary>Staff check a code (in the shop or for support): balance, who bought it, for whom, and every use.</summary>
    [HttpGet("admin/lookup")]
    public async Task<IActionResult> Lookup([FromQuery] string code)
    {
        var details = await service.GetDetailsAsync(code);
        return Ok(new { status = true, data = details });
    }

    /// <summary>Deducts an amount from a voucher used at the till in the shop.</summary>
    [HttpPost("admin/redeem")]
    public async Task<IActionResult> Redeem([FromBody] GiftVoucherRedeemDto dto)
    {
        var redeemedBy = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? User.Identity?.Name;
        var details = await service.RedeemInStoreAsync(dto, redeemedBy);
        return Ok(new { status = true, data = details });
    }

    [HttpGet("admin/report.csv")]
    public async Task<IActionResult> ExportReport()
    {
        var export = await service.ExportReportAsync();
        return File(export.Content, "text/csv; charset=utf-8", export.FileName);
    }
}
