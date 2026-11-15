using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IAnalyticsService
{
    /// <summary>Stores a storefront event. Invalid input and bots are ignored silently.</summary>
    Task TrackAsync(TrackEventDto dto, int? userId, string? userAgent);

    /// <summary>Remembers a guest who asked for a checkout code, as a possible lead; a cookie-banner
    /// marketing consent is stored for the email so the abandoned-checkout reminder may be sent.</summary>
    Task RecordCheckoutLeadAsync(string email, string? fullName, bool? marketingConsent = null);
}
