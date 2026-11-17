using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace ProteiniSi.Services.MetaAds;

/// <summary>
/// The dashboard session: a short-lived JWT in an HttpOnly cookie on meta-ads.proteini.mk. It is signed with its own
/// key (derived from AppSettings:TokenKey), so shop tokens are never accepted by the dashboard and vice versa.
/// </summary>
public static class MetaAdsSession
{
    public const string Scheme = "MetaAds";
    public const string Policy = "MetaAds";
    public const string CookieName = "__Host-pmads";
    public const string Issuer = "proteinisi-meta-ads";
    public const string Audience = "meta-ads.proteini.mk";
    public const string EmailClaim = "email";
    public const string MethodClaim = "amr";

    public static byte[] SigningKey(IConfiguration config)
    {
        var tokenKey = config["AppSettings:TokenKey"];
        if (string.IsNullOrWhiteSpace(tokenKey))
            throw new InvalidOperationException("AppSettings:TokenKey is not configured.");

        return HMACSHA256.HashData(Encoding.UTF8.GetBytes(tokenKey), "meta-ads-session-v1"u8.ToArray());
    }
}
