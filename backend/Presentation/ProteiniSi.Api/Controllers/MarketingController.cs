using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class MarketingController(IMarketingService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("newsletter/subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscriptionDto dto)
    {
        await service.SubscribeAsync(dto);
        return Ok(new { status = true, message = "Subscription saved." });
    }

    [AllowAnonymous]
    [HttpPost("newsletter/unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] NewsletterSubscriptionDto dto)
    {
        await service.UnsubscribeAsync(dto);
        return Ok(new { status = true, message = "The subscription preference was updated." });
    }

    [HttpGet("admin/subscribers")]
    public async Task<IActionResult> GetSubscribers([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        return Paged(await service.GetSubscribersAsync(search, page, pageSize), page, pageSize);
    }

    [HttpPut("admin/subscribers/{id:int}/status")]
    public async Task<IActionResult> UpdateSubscriberStatus(int id, [FromBody] NewsletterStatusDto dto)
    {
        await service.UpdateSubscriberStatusAsync(id, dto.IsActive);
        return Ok(new { status = true });
    }

    [HttpGet("admin/users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        return Paged(await service.GetUsersAsync(search, page, pageSize), page, pageSize);
    }

    [HttpGet("admin/subscribers.csv")]
    public async Task<IActionResult> ExportSubscribers() => CsvFile(await service.ExportSubscribersAsync());

    [HttpGet("admin/users.csv")]
    public async Task<IActionResult> ExportUsers() => CsvFile(await service.ExportUsersAsync());

    private OkObjectResult Paged<T>(PagedResult<T> result, int page, int pageSize) => Ok(new
    {
        status = true,
        data = result.Items,
        page,
        pageSize,
        totalCount = result.TotalCount,
        totalPages = (int)Math.Ceiling(result.TotalCount / (double)pageSize)
    });

    private FileContentResult CsvFile(CsvExport export) => File(export.Content, "text/csv; charset=utf-8", export.FileName);
}
