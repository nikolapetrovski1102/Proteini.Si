using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class FavoriteController(IFavoriteService service) : ControllerBase
{
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User not authenticated");
        return int.Parse(userIdClaim);
    }

    [HttpPost("add/{productId}")]
    public async Task<IActionResult> AddFavorite(int productId) =>
        Ok(await service.AddAsync(GetCurrentUserId(), productId));

    [HttpDelete("remove/{productId}")]
    public async Task<IActionResult> RemoveFavorite(int productId) =>
        Ok(await service.RemoveAsync(GetCurrentUserId(), productId));

    [HttpGet("my-favorites")]
    public async Task<IActionResult> GetMyFavorites() =>
        Ok(await service.GetByUserAsync(GetCurrentUserId()));

    [HttpGet("check/{productId}")]
    public async Task<IActionResult> IsFavorite(int productId) =>
        Ok(new IsFavoriteResponseDto { IsFavorite = await service.IsFavoriteAsync(GetCurrentUserId(), productId) });

    [HttpGet("count/{productId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFavoriteCount(int productId) =>
        Ok(new { ProductId = productId, FavoriteCount = await service.CountByProductAsync(productId) });
}
