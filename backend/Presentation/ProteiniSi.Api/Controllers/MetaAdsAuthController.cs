using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using ProteiniSi.Api.Extensions;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Services.MetaAds;

namespace ProteiniSi.Api.Controllers;

/// <summary>
/// Sign-in for the Meta ads dashboard on meta-ads.proteini.mk: Duo Universal Prompt or an emailed 6-digit code.
/// The session token is only ever sent as an HttpOnly, Secure, SameSite=Strict cookie.
/// </summary>
[ApiController]
[Route("api/meta-ads/auth")]
[SkipClientKey]
[OutputCache(NoStore = true)]
public class MetaAdsAuthController(
    IMetaAdsAuthService auth,
    ITurnstileVerifier turnstile,
    IConfiguration config,
    ILogger<MetaAdsAuthController> logger) : ControllerBase
{
    private Task<bool> PassesTurnstileAsync(string? token) =>
        turnstile.VerifyAsync(token, HttpContext.Connection.RemoteIpAddress?.ToString(), HttpContext.RequestAborted);

    private IActionResult TurnstileFailed() =>
        BadRequest(new { status = false, field = "turnstile", message = "Please confirm you are not a robot and try again." });

    [HttpGet("options")]
    public IActionResult Options() => Ok(auth.GetOptions());

    [HttpPost("duo")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public async Task<IActionResult> StartDuo([FromBody] MetaAdsEmailDto request)
    {
        if (!await PassesTurnstileAsync(request.TurnstileToken))
            return TurnstileFailed();
        return Ok(await auth.StartDuoAsync(request.Email));
    }

    /// <summary>Duo sends the browser back here with state + duo_code; we set the cookie and return to the dashboard.</summary>
    [HttpGet("duo/callback")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public async Task<IActionResult> DuoCallback(
        [FromQuery] string? state,
        [FromQuery(Name = "duo_code")] string? duoCode,
        [FromQuery] string? code,
        [FromQuery] string? error,
        [FromQuery(Name = "error_description")] string? errorDescription)
    {
        var dashboard = MetaAdsOptions.From(config).PublicUrl;
        if (!string.IsNullOrEmpty(error))
            return Redirect($"{dashboard}/?login_error={Uri.EscapeDataString(errorDescription ?? error)}");

        try
        {
            var session = await auth.CompleteDuoAsync(state, duoCode ?? code);
            SetSessionCookie(session);
            return Redirect($"{dashboard}/");
        }
        catch (AppException ex)
        {
            return Redirect($"{dashboard}/?login_error={Uri.EscapeDataString(ex.Message)}");
        }
    }

    [HttpPost("email-code")]
    [EnableRateLimiting(CheckoutAbuseExtensions.GuestCodePolicy)]
    public async Task<IActionResult> SendEmailCode([FromBody] MetaAdsEmailDto request)
    {
        if (!await PassesTurnstileAsync(request.TurnstileToken))
            return TurnstileFailed();
        return Ok(await auth.SendEmailCodeAsync(request.Email));
    }

    [HttpPost("email-code/verify")]
    [EnableRateLimiting(CheckoutAbuseExtensions.SignInPolicy)]
    public IActionResult VerifyEmailCode([FromBody] MetaAdsCodeVerifyDto request)
    {
        var session = auth.VerifyEmailCode(request.Email, request.Code);
        SetSessionCookie(session);
        return Ok(new { status = true, user = session.User, expiresAt = session.ExpiresAtUtc });
    }

    [HttpGet("me")]
    [Authorize(Policy = MetaAdsSession.Policy)]
    public IActionResult Me()
    {
        var user = auth.GetUser(User);
        return user is null ? Unauthorized() : Ok(user);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(MetaAdsSession.CookieName, CookieOptions(null));
        return Ok(new { status = true });
    }

    private void SetSessionCookie(MetaAdsSessionDto session)
    {
        Response.Cookies.Append(MetaAdsSession.CookieName, session.Token, CookieOptions(session.ExpiresAtUtc));
        logger.LogInformation("Meta ads session started for {Email} via {Method} until {Expires:u}", session.User.Email, session.User.Method, session.ExpiresAtUtc);
    }

    // "__Host-" cookies must be Secure, Path=/ and have no Domain: they stay on meta-ads.proteini.mk only.
    private static CookieOptions CookieOptions(DateTime? expires) => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/",
        Expires = expires,
        IsEssential = true,
    };
}
