using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ProteiniSi.Api.Extensions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/// <summary>First-party storefront events (page views, cart, checkout) for the daily report.</summary>
[Route("api/[controller]")]
[ApiController]
public class AnalyticsController(IAnalyticsService analytics) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("event")]
    [EnableRateLimiting(CheckoutAbuseExtensions.AnalyticsPolicy)]
    public async Task<IActionResult> Track([FromBody] TrackEventDto dto)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        int? userId = int.TryParse(userIdClaim, out var id) ? id : null;

        await analytics.TrackAsync(dto, userId, Request.Headers.UserAgent.ToString());
        return NoContent();
    }
}
