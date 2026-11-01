using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Models.DTOs;
using ProteinisiBackend.Services;
using System.Security.Claims;

namespace ProteinisiBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class LoyaltyController : ControllerBase
    {
        private readonly ILoyaltyService _loyaltyService;

        public LoyaltyController(ILoyaltyService loyaltyService)
        {
            _loyaltyService = loyaltyService;
        }

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

            var summary = await _loyaltyService.GetUserPointsSummaryAsync(userId);
            return Ok(new { status = true, data = summary });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetPointsHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { message = "User not authenticated" });

            var history = await _loyaltyService.GetUserPointsHistoryAsync(userId, page, pageSize);
            return Ok(new { status = true, data = history, page = page, pageSize = pageSize });
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailablePoints()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized(new { message = "User not authenticated" });

            var points = await _loyaltyService.GetAvailablePointsAsync(userId);
            return Ok(new { status = true, availablePoints = points });
        }
    }
}