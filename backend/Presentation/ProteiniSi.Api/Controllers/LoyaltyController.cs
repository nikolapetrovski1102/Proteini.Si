using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class LoyaltyController(ILoyaltyService loyaltyService) : ControllerBase
{
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return 0;
        return int.Parse(userIdClaim);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetPointsSummary()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        var summary = await loyaltyService.GetUserPointsSummaryAsync(userId);
        return Ok(new { status = true, data = summary });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetPointsHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        var history = await loyaltyService.GetUserPointsHistoryAsync(userId, page, pageSize);
        return Ok(new { status = true, data = history, page, pageSize });
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailablePoints()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(new { message = "User not authenticated" });

        var points = await loyaltyService.GetAvailablePointsAsync(userId);
        return Ok(new { status = true, availablePoints = points });
    }
}
