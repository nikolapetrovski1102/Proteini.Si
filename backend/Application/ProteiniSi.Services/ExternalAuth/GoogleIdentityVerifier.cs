using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services.ExternalAuth;

/// <summary>
/// Google sign-in with the popup authorization-code flow (Google Identity Services code client),
/// which lets the site use its own branded button. The one-time code is exchanged at Google's
/// token endpoint with the client secret; the returned ID token is then validated: signature
/// against Google's keys, issuer, expiry and audience = our client id.
///
/// Configuration (Authentication:Google): ClientId, ClientSecret.
/// </summary>
public class GoogleIdentityVerifier(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    ILogger<GoogleIdentityVerifier> logger) : IExternalIdentityVerifier
{
    public const string HttpClientName = "google-oauth";
    private const string TokenEndpoint = "https://oauth2.googleapis.com/token";

    // Codes from the GIS popup code client are bound to this pseudo redirect URI.
    private const string PopupRedirectUri = "postmessage";

    public string Provider => "google";

    private string? ClientId => config["Authentication:Google:ClientId"];
    private string? ClientSecret => config["Authentication:Google:ClientSecret"];

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ClientId) && !string.IsNullOrWhiteSpace(ClientSecret);

    public async Task<ExternalIdentity?> VerifyAsync(string code, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(code) || code.Length > 2048)
            return null;

        var idToken = await ExchangeCodeAsync(code, cancellationToken);
        if (idToken == null)
            return null;

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [ClientId!],
                IssuedAtClockTolerance = TimeSpan.FromMinutes(1),
                ExpirationTimeClockTolerance = TimeSpan.FromMinutes(1)
            });

            if (string.IsNullOrEmpty(payload.Subject))
                return null;

            return new ExternalIdentity(Provider, payload.Subject, payload.Email, payload.EmailVerified, payload.Name);
        }
        catch (InvalidJwtException ex)
        {
            logger.LogInformation("Rejected Google ID token: {Reason}", ex.Message);
            return null;
        }
    }

    private async Task<string?> ExchangeCodeAsync(string code, CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient(HttpClientName);
            using var response = await client.PostAsync(TokenEndpoint, new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = ClientId!,
                ["client_secret"] = ClientSecret!,
                ["redirect_uri"] = PopupRedirectUri,
                ["grant_type"] = "authorization_code"
            }), cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogInformation("Rejected Google sign-in: code exchange returned {Status}", (int)response.StatusCode);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var json = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            return json.RootElement.TryGetProperty("id_token", out var t) ? t.GetString() : null;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            logger.LogWarning(ex, "Google sign-in code exchange failed");
            return null;
        }
    }
}
