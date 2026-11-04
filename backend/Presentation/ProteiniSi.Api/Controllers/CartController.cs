using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CartController(ICartService service) : ControllerBase
{
    private int? GetUserId()
    {
        var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
        return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
    }

    [HttpGet]
    public async Task<IActionResult> GetCart() => Ok(await service.GetCartAsync(GetUserId()));

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest(new { error = "Quantity must be greater than zero" });

        var userId = GetUserId();
        if (!userId.HasValue)
            return Ok(new { success = true, message = "Product added to cart (guest mode)", isGuest = true });

        await service.AddAsync(userId.Value, dto);
        return Ok(new { success = true, message = "Product added to cart" });
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized(new { error = "Please login to update cart" });

        await service.UpdateQuantityAsync(userId.Value, dto);
        return Ok(new { success = true, message = "Cart updated" });
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized(new { error = "Please login to remove items from cart" });

        await service.RemoveAsync(userId.Value, cartItemId);
        return Ok(new { success = true, message = "Item removed from cart" });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized(new { error = "Please login to clear cart" });

        await service.ClearAsync(userId.Value);
        return Ok(new { success = true, message = "Cart cleared" });
    }
}
