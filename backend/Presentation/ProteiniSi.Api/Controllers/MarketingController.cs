using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class MarketingController(IMarketingService service, IMarketingAutomationService automation) : ControllerBase
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

    // ---- marketing emails (automatic welcome / abandoned checkout / replenishment) ----

    [HttpGet("admin/email-templates")]
    public async Task<IActionResult> GetEmailTemplates() =>
        Ok(new { status = true, data = await automation.GetTemplatesAsync() });

    [HttpPut("admin/email-templates/{code}")]
    public async Task<IActionResult> UpdateEmailTemplate(string code, [FromBody] MarketingTemplateUpdateDto dto, [FromServices] IUserService users)
    {
        var me = int.TryParse(User.FindFirst("userId")?.Value, out var userId) ? await users.GetCurrentAsync(userId) : null;
        var (template, error) = await automation.UpdateTemplateAsync(code, dto, me?.User_Email);
        return template == null
            ? BadRequest(new { status = false, message = error })
            : Ok(new { status = true, data = template });
    }

    /// <summary>Renders the template (or an unsaved draft of it) with sample data.</summary>
    [HttpPost("admin/email-templates/{code}/preview")]
    public async Task<IActionResult> PreviewEmailTemplate(string code, [FromBody] MarketingTemplateUpdateDto? draft)
    {
        var (preview, error) = await automation.PreviewAsync(code, draft);
        return preview == null
            ? BadRequest(new { status = false, message = error })
            : Ok(new { status = true, subject = preview.Subject, html = preview.Html });
    }

    /// <summary>Sends the template (or draft) with sample data to the signed-in admin.</summary>
    [HttpPost("admin/email-templates/{code}/test")]
    public async Task<IActionResult> SendTestEmail(string code, [FromBody] MarketingTemplateUpdateDto? draft, [FromServices] IUserService users)
    {
        if (!int.TryParse(User.FindFirst("userId")?.Value, out var userId)) return Unauthorized();
        var me = await users.GetCurrentAsync(userId);
        if (string.IsNullOrWhiteSpace(me.User_Email)) return BadRequest(new { status = false, message = "Your account has no email address." });

        var (success, message) = await automation.SendTestAsync(code, draft, me.User_Email, me.User_FullName);
        return success ? Ok(new { status = true, message }) : BadRequest(new { status = false, message });
    }

    [HttpGet("admin/email-log")]
    public async Task<IActionResult> GetEmailLog([FromQuery] int top = 100) =>
        Ok(new { status = true, data = await automation.GetLogAsync(top) });

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
