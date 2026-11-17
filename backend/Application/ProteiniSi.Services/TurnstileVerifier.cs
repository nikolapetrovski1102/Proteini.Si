using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

/// <summary>
/// Validates Cloudflare Turnstile tokens with the siteverify endpoint. Each token is single use.
/// Configuration: Turnstile:SecretKey. Empty = check off (local dev, or before keys exist).
/// </summary>
public class TurnstileVerifier(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    ILogger<TurnstileVerifier> logger) : ITurnstileVerifier
{
    public const string HttpClientName = "cloudflare-turnstile";
    private const string VerifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private string? SecretKey => config["Turnstile:SecretKey"];

    public bool IsEnabled => !string.IsNullOrWhiteSpace(SecretKey);

    public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
            return true;
        if (string.IsNullOrWhiteSpace(token) || token.Length > 2048)
            return false;

        var form = new Dictionary<string, string> { ["secret"] = SecretKey!, ["response"] = token };
        if (!string.IsNullOrWhiteSpace(remoteIp))
            form["remoteip"] = remoteIp;

        try
        {
            var client = httpClientFactory.CreateClient(HttpClientName);
            using var response = await client.PostAsync(VerifyEndpoint, new FormUrlEncodedContent(form), cancellationToken);
            var result = await response.Content.ReadFromJsonAsync<SiteVerifyResponse>(cancellationToken);
            if (result?.Success == true)
                return true;

            logger.LogInformation("Turnstile rejected a checkout token: {Codes}",
                string.Join(",", result?.ErrorCodes ?? []));
            return false;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            // Cloudflare unreachable: let the order through rather than lose a real customer.
            logger.LogWarning(ex, "Turnstile siteverify unreachable; allowing the request");
            return true;
        }
    }

    private sealed class SiteVerifyResponse
    {
        [JsonPropertyName("success")] public bool Success { get; set; }
        [JsonPropertyName("error-codes")] public string[]? ErrorCodes { get; set; }
    }
}
