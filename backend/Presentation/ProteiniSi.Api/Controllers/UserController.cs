using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ProteiniSi.Api.Extensions;
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
    [HttpPost("VerifyEmail")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto) =>
        Ok(await service.VerifyEmailAsync(verifyEmailDto));

    [AllowAnonymous]
    [HttpPost("ResendVerificationCode")]
    public async Task<IActionResult> ResendVerificationCode([FromBody] ResendVerificationCodeDto resendDto) =>
        Ok(await service.ResendVerificationCodeAsync(resendDto));

    /// <summary>Signs in or registers with a Google authorization code.</summary>
    [AllowAnonymous]
    [HttpPost("ExternalSignIn")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public async Task<IActionResult> ExternalSignIn([FromBody] ExternalSignInDto request) =>
        Ok(await service.ExternalSignInAsync(request));

    /// <summary>Emails a one-time code for signing in (or registering) without a password.</summary>
    [AllowAnonymous]
    [HttpPost("EmailCode/Send")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public async Task<IActionResult> SendSignInCode([FromBody] EmailCodeSendDto request) =>
        Ok(await service.SendSignInCodeAsync(request));

    [AllowAnonymous]
    [HttpPost("EmailCode/SignIn")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public async Task<IActionResult> SignInWithEmailCode([FromBody] EmailCodeSignInDto request) =>
        Ok(await service.SignInWithEmailCodeAsync(request));

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
