using System.Security.Claims;
using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

/// <summary>
/// Sign-in for the Meta ads dashboard (meta-ads.proteini.mk). Only emails on the MetaAds:AllowedUsers list get in,
/// with a Duo Universal Prompt approval or, as a fallback, a 6-digit code sent by email.
/// </summary>
public interface IMetaAdsAuthService
{
    MetaAdsAuthOptionsDto GetOptions();

    bool IsAllowed(string? email);

    /// <summary>Starts a Duo login and returns the Duo URL to send the browser to.</summary>
    Task<MetaAdsDuoStartDto> StartDuoAsync(string? email);

    /// <summary>Finishes a Duo login from the redirect back (state + duo_code).</summary>
    Task<MetaAdsSessionDto> CompleteDuoAsync(string? state, string? code);

    Task<MetaAdsCodeSentDto> SendEmailCodeAsync(string? email);

    MetaAdsSessionDto VerifyEmailCode(string? email, string? code);

    /// <summary>The signed-in user from a validated session principal, or null when that email lost access.</summary>
    MetaAdsSessionUser? GetUser(ClaimsPrincipal principal);
}
