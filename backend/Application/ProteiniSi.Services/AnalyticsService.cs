using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

/// <summary>
/// First-party visit and funnel tracking for the daily report. The storefront keeps a random
/// visitor id in localStorage; nothing is shared with third parties. Tracking never throws:
/// a failed insert must not break browsing or checkout.
/// </summary>
public partial class AnalyticsService(IAnalyticsProvider provider, IMarketingAutomationProvider marketing, IConfiguration config, ILogger<AnalyticsService> logger) : IAnalyticsService
{
    public static readonly IReadOnlySet<string> ClientEventTypes =
        new HashSet<string>(StringComparer.Ordinal) { "page_view", "cart_add", "checkout_start", "order_created" };

    [GeneratedRegex("^[A-Za-z0-9-]{8,64}$")]
    private static partial Regex VisitorIdPattern();

    [GeneratedRegex("bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|httpclient|java/|go-http|facebookexternalhit|whatsapp|telegram", RegexOptions.IgnoreCase)]
    private static partial Regex BotPattern();

    public static bool IsBot(string? userAgent) =>
        string.IsNullOrWhiteSpace(userAgent) || BotPattern().IsMatch(userAgent);

    public async Task TrackAsync(TrackEventDto dto, int? userId, string? userAgent)
    {
        if (dto.Type == null || !ClientEventTypes.Contains(dto.Type)) return;
        if (dto.VisitorId == null || !VisitorIdPattern().IsMatch(dto.VisitorId)) return;
        if (IsBot(userAgent)) return;

        await SafeAddAsync(new SiteEvent
        {
            VisitorId = dto.VisitorId,
            EventType = dto.Type,
            UserId = userId,
            OrderId = dto.Type == "order_created" && dto.OrderId > 0 ? dto.OrderId : null,
            Path = NormalizePath(dto.Path),
            Referrer = dto.Type == "page_view" ? NormalizeReferrer(dto.Referrer, OwnHosts()) : null
        });
    }

    public async Task RecordCheckoutLeadAsync(string email, string? fullName, bool? marketingConsent = null)
    {
        await SafeAddAsync(new SiteEvent
        {
            EventType = "checkout_email",
            Email = Truncate(email.Trim(), 320),
            FullName = Truncate(fullName?.Trim(), 200)
        });

        // Only a "yes" is recorded here: a guest who declined marketing cookies may still be a newsletter subscriber.
        if (marketingConsent != true) return;
        try
        {
            await marketing.SetConsentAsync(email, null, true, "guest_checkout", null);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not store the marketing consent of a checkout guest");
        }
    }

    private async Task SafeAddAsync(SiteEvent siteEvent)
    {
        try
        {
            await provider.AddEventAsync(siteEvent);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not store site event {EventType}", siteEvent.EventType);
        }
    }

    /// <summary>Path only: query strings can carry tokens (guest order links, password resets).</summary>
    public static string? NormalizePath(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        var clean = path.Split('?', '#')[0].Trim();
        if (!clean.StartsWith('/')) clean = "/" + clean;
        return Truncate(clean, 300);
    }

    /// <summary>Reduces a referrer URL to a readable source ("google", "facebook.com"); internal links return null.</summary>
    public static string? NormalizeReferrer(string? referrer, IReadOnlyCollection<string> ownHosts)
    {
        if (string.IsNullOrWhiteSpace(referrer) || !Uri.TryCreate(referrer, UriKind.Absolute, out var uri)) return null;
        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) return null;

        var host = uri.Host.ToLowerInvariant();
        foreach (var prefix in new[] { "www.", "m.", "l.", "lm.", "mobile." })
            if (host.StartsWith(prefix)) host = host[prefix.Length..];

        if (ownHosts.Any(own => host == own || host.EndsWith("." + own))) return null;
        if (host.StartsWith("google.") || host.Contains(".google.")) return "google";
        if (host.StartsWith("bing.")) return "bing";
        if (host is "facebook.com" or "fb.com" or "fb.me") return "facebook";
        if (host is "instagram.com") return "instagram";
        if (host is "t.co" or "x.com" or "twitter.com") return "x / twitter";
        if (host.EndsWith("tiktok.com")) return "tiktok";
        return Truncate(host, 300);
    }

    private List<string> OwnHosts()
    {
        var hosts = new List<string> { "proteini.mk", "proteini.si" };
        foreach (var key in new[] { "AppSettings:FrontendUrl", "AppSettings:BackendUrl" })
            if (Uri.TryCreate(config[key], UriKind.Absolute, out var uri))
                hosts.Add(uri.Host.ToLowerInvariant().Replace("www.", ""));
        return hosts;
    }

    private static string? Truncate(string? value, int max) =>
        value == null ? null : value.Length <= max ? value : value[..max];
}
