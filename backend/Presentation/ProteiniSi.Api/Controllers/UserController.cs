using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class UserController(IUserService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("Register")]
    public async Task<IActionResult> Register([FromBody] UserForRegistrationDto userForRegistration) =>
        Ok(await service.RegisterAsync(userForRegistration));

    [AllowAnonymous]
    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] UserForLoginDto userForLogin) =>
        Ok(await service.LoginAsync(userForLogin));

    [AllowAnonymous]
    [HttpPost("ForgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto) =>
        Ok(await service.ForgotPasswordAsync(forgotPasswordDto));

    [AllowAnonymous]
    [HttpPost("ResetPassword")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto) =>
        Ok(await service.ResetPasswordAsync(resetPasswordDto));

    [HttpGet("Current")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "User not authenticated" });

        return Ok(await service.GetCurrentAsync(int.Parse(userIdClaim)));
    }

    [HttpPut("UpdateBillingInfo")]
    public async Task<IActionResult> UpdateBillingInfo([FromBody] UserForUpdateDto updateInfo)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "User not authenticated" });

        return Ok(await service.UpdateBillingInfoAsync(int.Parse(userIdClaim), updateInfo));
    }
}
