using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ProteiniSi.Api.Extensions;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/// <summary>Public side of the automated marketing emails: consent from the cookie banner and unsubscribe links.</summary>
[ApiController]
[Route("api/Marketing")]
public class MarketingEmailsController(IMarketingAutomationService marketing) : ControllerBase
{
    /// <summary>Stores the signed-in visitor's cookie-banner "Marketing" choice for their account email.</summary>
    [Authorize]
    [HttpPost("consent")]
    [EnableRateLimiting(CheckoutAbuseExtensions.AnalyticsPolicy)]
    public async Task<IActionResult> Consent([FromBody] MarketingConsentDto dto)
    {
        if (!int.TryParse(User.FindFirst("userId")?.Value, out var userId)) return Unauthorized();
        await marketing.SetConsentAsync(userId, dto);
        return NoContent();
    }

    /// <summary>Unsubscribe page (/unsubscribe?e=&amp;t=) of the storefront.</summary>
    [AllowAnonymous]
    [HttpPost("email-unsubscribe")]
    [EnableRateLimiting(CheckoutAbuseExtensions.AnalyticsPolicy)]
    public async Task<IActionResult> Unsubscribe([FromBody] MarketingUnsubscribeDto dto) =>
        await marketing.UnsubscribeAsync(dto.Email, dto.Token)
            ? Ok(new { status = true })
            : BadRequest(new { status = false, message = "Invalid or expired unsubscribe link." });

    /// <summary>RFC 8058 one-click unsubscribe, posted by Gmail/Yahoo from the List-Unsubscribe header (no API key).</summary>
    [AllowAnonymous]
    [SkipClientKey]
    [HttpPost("unsubscribe/one-click")]
    [EnableRateLimiting(CheckoutAbuseExtensions.AnalyticsPolicy)]
    public async Task<IActionResult> OneClick([FromQuery] string? e, [FromQuery] string? t) =>
        await marketing.UnsubscribeAsync(e, t) ? Ok() : BadRequest();
}
