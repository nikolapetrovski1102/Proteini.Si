using Microsoft.Extensions.Configuration;

namespace ProteiniSi.Services.MetaAds;

/// <summary>
/// The "MetaAds" config section. On the server it comes from /etc/proteinisi/prod.env, e.g.
/// MetaAds__AccessToken=..., MetaAds__Duo__ClientSecret=... (see docs/meta-ads-dashboard.md).
/// </summary>
public sealed class MetaAdsOptions
{
    public string PublicUrl { get; init; } = "https://meta-ads.proteini.mk";

    /// <summary>Comma/semicolon separated emails. "email=duoUsername" when the Duo username is not the email.</summary>
    public string AllowedUsers { get; init; } = "";

    public int SessionHours { get; init; } = 12;
    public bool EmailCodeEnabled { get; init; } = true;

    public string DuoClientId { get; init; } = "";
    public string DuoClientSecret { get; init; } = "";
    public string DuoApiHost { get; init; } = "";

    public string AccessToken { get; init; } = "";
    public string AppSecret { get; init; } = "";
    public string AdAccountId { get; init; } = "";
    public string PageId { get; init; } = "";
    public string InstagramUserId { get; init; } = "";
    public string PixelId { get; init; } = "";
    public string ApiVersion { get; init; } = "v24.0";

    public bool DuoEnabled =>
        !string.IsNullOrWhiteSpace(DuoClientId) && !string.IsNullOrWhiteSpace(DuoClientSecret) && !string.IsNullOrWhiteSpace(DuoApiHost);

    /// <summary>"act_123" whether the config has "123" or "act_123".</summary>
    public string AdAccountNode =>
        string.IsNullOrWhiteSpace(AdAccountId) ? "" : AdAccountId.Trim().StartsWith("act_") ? AdAccountId.Trim() : $"act_{AdAccountId.Trim()}";

    public string AdAccountNumber => AdAccountNode.Replace("act_", "");

    /// <summary>Allowed email → Duo username.</summary>
    public IReadOnlyDictionary<string, string> Users =>
        AllowedUsers
            .Split([',', ';', '\n', ' '], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(entry =>
            {
                var parts = entry.Split('=', 2, StringSplitOptions.TrimEntries);
                var email = parts[0].ToLowerInvariant();
                return (email, duo: parts.Length == 2 && parts[1].Length > 0 ? parts[1] : email);
            })
            .Where(user => user.email.Contains('@'))
            .GroupBy(user => user.email)
            .ToDictionary(group => group.Key, group => group.First().duo, StringComparer.OrdinalIgnoreCase);

    public static MetaAdsOptions From(IConfiguration config)
    {
        var section = config.GetSection("MetaAds");
        return new MetaAdsOptions
        {
            PublicUrl = (section["PublicUrl"] is { Length: > 0 } url ? url : "https://meta-ads.proteini.mk").TrimEnd('/'),
            AllowedUsers = section["AllowedUsers"] ?? "",
            SessionHours = Math.Clamp(section.GetValue("SessionHours", 12), 1, 72),
            EmailCodeEnabled = section.GetValue("EmailCodeEnabled", true),
            DuoClientId = section["Duo:ClientId"]?.Trim() ?? "",
            DuoClientSecret = section["Duo:ClientSecret"]?.Trim() ?? "",
            DuoApiHost = section["Duo:ApiHost"]?.Trim() ?? "",
            AccessToken = section["AccessToken"]?.Trim() ?? "",
            AppSecret = section["AppSecret"]?.Trim() ?? "",
            AdAccountId = section["AdAccountId"]?.Trim() ?? "",
            PageId = section["PageId"]?.Trim() ?? "",
            InstagramUserId = section["InstagramUserId"]?.Trim() ?? "",
            PixelId = section["PixelId"]?.Trim() ?? "",
            ApiVersion = section["ApiVersion"] is { Length: > 0 } version ? version.Trim() : "v24.0",
        };
    }
}
