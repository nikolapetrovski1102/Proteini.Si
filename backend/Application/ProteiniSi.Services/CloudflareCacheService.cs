using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

/// <summary>
/// Cloudflare purge API client. Configured from the "Cloudflare" section:
/// ZoneId, ApiToken (Zone.Cache Purge permission) and PublicBaseUrls
/// (every origin that serves images, e.g. https://proteini.mk, https://www.proteini.mk).
/// </summary>
public class CloudflareCacheService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    ILogger<CloudflareCacheService> logger) : ICdnCacheService
{
    // Cloudflare accepts at most 30 URLs per purge-by-URL request.
    private const int MaxUrlsPerRequest = 30;

    private string? ZoneId => config["Cloudflare:ZoneId"];
    private string? ApiToken => config["Cloudflare:ApiToken"];

    private string[] PublicBaseUrls =>
        config.GetSection("Cloudflare:PublicBaseUrls").Get<string[]>()?
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Select(url => url.TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray() ?? [];

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ZoneId) && !string.IsNullOrWhiteSpace(ApiToken);

    public async Task<bool> PurgePathsAsync(IEnumerable<string> webPaths, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return false;

        var baseUrls = PublicBaseUrls;
        if (baseUrls.Length == 0)
        {
            logger.LogWarning("Cloudflare purge skipped: Cloudflare:PublicBaseUrls is empty");
            return false;
        }

        var urls = webPaths
            .Where(path => !string.IsNullOrWhiteSpace(path))
            .Select(path => "/" + path.Trim().TrimStart('/'))
            .SelectMany(path => baseUrls.Select(baseUrl => baseUrl + path))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (urls.Count == 0)
            return true;

        var success = true;
        foreach (var chunk in urls.Chunk(MaxUrlsPerRequest))
            success &= await SendPurgeAsync(new { files = chunk }, cancellationToken);

        return success;
    }

    public Task<bool> PurgeEverythingAsync(CancellationToken cancellationToken = default) =>
        IsConfigured
            ? SendPurgeAsync(new { purge_everything = true }, cancellationToken)
            : Task.FromResult(false);

    private async Task<bool> SendPurgeAsync(object body, CancellationToken cancellationToken)
    {
        try
        {
            using var client = httpClientFactory.CreateClient(nameof(CloudflareCacheService));
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://api.cloudflare.com/client/v4/zones/{ZoneId}/purge_cache")
            {
                Content = JsonContent.Create(body)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ApiToken);

            using var response = await client.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
                return true;

            var details = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning("Cloudflare purge failed with {StatusCode}: {Details}", (int)response.StatusCode, details);
            return false;
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(ex, "Cloudflare purge request failed");
            return false;
        }
    }
}
