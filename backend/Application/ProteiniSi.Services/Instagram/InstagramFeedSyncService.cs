using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Services.Instagram;

/// <summary>
/// Syncs the gallery from the official Instagram API. Two kinds of token work:
/// an Instagram Login token ("IG…", graph.instagram.com, refreshed here every 60 days) or a
/// Facebook/System User token ("EAA…", graph.facebook.com) whose system user has the shop's Page
/// and Instagram account assigned. With a Facebook token the Instagram account id is looked up
/// through the Page, or taken from Instagram:UserId when set. Each post's picture is downloaded once into uploads/instagram, because
/// Instagram's CDN links expire; captions, likes and dates are refreshed on every run.
/// Config section "Instagram": AccessToken, MaxPosts (default 12), SyncIntervalDays (default 7, see InstagramSyncWorker).
/// </summary>
public partial class InstagramFeedSyncService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory scopeFactory,
    IImageStorageService storage,
    InstagramTokenStore tokens,
    IConfiguration config,
    ILogger<InstagramFeedSyncService> logger) : IInstagramFeedSyncService
{
    public const string HttpClientName = "Instagram";
    private const string ApiBase = "https://graph.instagram.com";
    private const string FacebookApiBase = "https://graph.facebook.com/v23.0";
    private const string ImageFolder = "uploads/instagram";
    private const long MaxImageBytes = 15 * 1024 * 1024;
    private static readonly TimeSpan RefreshEvery = TimeSpan.FromDays(1);

    private readonly SemaphoreSlim _running = new(1, 1);
    private string? _facebookIgUserId;

    public bool IsConfigured => tokens.HasToken;
    public InstagramSyncResultDto? LastResult { get; private set; }

    private int MaxPosts => Math.Clamp(config.GetValue("Instagram:MaxPosts", 12), 1, 50);

    public async Task<InstagramSyncResultDto> SyncAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return new InstagramSyncResultDto { Configured = false, Error = "Instagram:AccessToken is not set" };

        // One run at a time; a second caller just gets the result of the run in progress.
        if (!await _running.WaitAsync(0, cancellationToken))
        {
            await _running.WaitAsync(cancellationToken);
            _running.Release();
            return LastResult!;
        }

        var result = new InstagramSyncResultDto { Configured = true };
        try
        {
            var client = httpClientFactory.CreateClient(HttpClientName);
            var token = await tokens.GetAsync() ?? throw new InvalidOperationException("No Instagram token");
            if (!IsFacebookToken(token))
                token = await RefreshIfDueAsync(client, token, cancellationToken);

            var media = await FetchMediaAsync(client, token, cancellationToken);
            result.Fetched = media.Count;

            using var scope = scopeFactory.CreateScope();
            var provider = scope.ServiceProvider.GetRequiredService<IInstagramPostProvider>();

            foreach (var item in media)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var shortCode = ShortCodeOf(item.Permalink);
                var imageUrl = item.MediaType == "VIDEO" ? item.ThumbnailUrl : item.MediaUrl;
                if (shortCode == null || string.IsNullOrEmpty(imageUrl))
                    continue;

                var imagePath = await EnsureImageAsync(client, shortCode, imageUrl, result, cancellationToken);
                if (imagePath == null)
                    continue;

                var upsert = await provider.UpsertFromFeedAsync(new InstagramFeedPostDto
                {
                    ShortCode = shortCode,
                    PostUrl = item.Permalink!,
                    ImagePath = imagePath,
                    Description = Truncate(item.Caption, 4000),
                    LikeCount = item.LikeCount,
                    PostedBy = item.Username,
                    PostedDate = ParseTimestamp(item.Timestamp),
                });
                if (upsert.Inserted) result.Added++;
                else result.Updated++;
            }

            result.Success = true;
            logger.LogInformation(
                "Instagram sync: {Fetched} fetched, {Added} added, {Updated} updated, {Images} images downloaded",
                result.Fetched, result.Added, result.Updated, result.ImagesDownloaded);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            result.Error = ex.Message;
            logger.LogWarning(ex, "Instagram sync failed");
        }
        finally
        {
            result.FinishedAt = DateTime.UtcNow;
            LastResult = result;
            _running.Release();
        }

        return result;
    }

    private async Task<string> RefreshIfDueAsync(HttpClient client, string token, CancellationToken ct)
    {
        var last = await tokens.LastRefreshedAtAsync();
        if (last != null && DateTime.UtcNow - last < RefreshEvery)
            return token;

        try
        {
            var url = $"{ApiBase}/refresh_access_token?grant_type=ig_refresh_token&access_token={Uri.EscapeDataString(token)}";
            using var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                // Expected for a token younger than 24 hours; the current one still works.
                logger.LogInformation("Instagram token not refreshed ({Status})", (int)response.StatusCode);
                return token;
            }

            var body = await response.Content.ReadFromJsonAsync<RefreshResponse>(ct);
            if (string.IsNullOrEmpty(body?.AccessToken))
                return token;

            await tokens.SaveRefreshedAsync(body.AccessToken);
            logger.LogInformation("Instagram token refreshed; valid for {Days} more days", body.ExpiresIn / 86400);
            return body.AccessToken;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogWarning(ex, "Instagram token refresh failed");
            return token;
        }
    }

    private async Task<List<MediaItem>> FetchMediaAsync(HttpClient client, string token, CancellationToken ct)
    {
        const string fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,username";
        var url = IsFacebookToken(token)
            ? $"{FacebookApiBase}/{await FacebookIgUserIdAsync(client, token, ct)}/media?fields={fields}&limit={MaxPosts}"
            : $"{ApiBase}/me/media?fields={fields}&limit={MaxPosts}";

        var page = await GetJsonAsync<MediaPage>(client, url, token, ct);
        return page?.Data ?? [];
    }

    public static bool IsFacebookToken(string token) => token.StartsWith("EAA", StringComparison.Ordinal);

    /// <summary>The Instagram business account id behind a Facebook token: Instagram:UserId, or the
    /// first Page the token can see that has an Instagram account linked.</summary>
    private async Task<string> FacebookIgUserIdAsync(HttpClient client, string token, CancellationToken ct)
    {
        if (config["Instagram:UserId"]?.Trim() is { Length: > 0 } configured)
            return configured;
        if (_facebookIgUserId != null)
            return _facebookIgUserId;

        var pages = await GetJsonAsync<PagesResponse>(
            client, $"{FacebookApiBase}/me/accounts?fields=name,instagram_business_account", token, ct);
        _facebookIgUserId = pages?.Data?.Select(p => p.InstagramBusinessAccount?.Id).FirstOrDefault(id => id != null)
            ?? throw new InvalidOperationException(
                "The Facebook token sees no Page with an Instagram account. Assign the shop's Page and Instagram " +
                "account to the system user (or set Instagram:UserId) and include pages_show_list.");
        return _facebookIgUserId;
    }

    private static async Task<T?> GetJsonAsync<T>(HttpClient client, string url, string token, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        using var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct).ConfigureAwait(false);
            throw new HttpRequestException(
                $"Instagram API returned {(int)response.StatusCode}: {error?.Error?.Message ?? response.ReasonPhrase}");
        }
        return await response.Content.ReadFromJsonAsync<T>(ct);
    }

    private async Task<string?> EnsureImageAsync(
        HttpClient client, string shortCode, string imageUrl, InstagramSyncResultDto result, CancellationToken ct)
    {
        var existing = new[] { ".jpg", ".png", ".webp" }
            .Select(ext => $"/{ImageFolder}/instagram_{shortCode}{ext}")
            .FirstOrDefault(storage.Exists);
        if (existing != null)
            return existing;

        try
        {
            using var response = await client.GetAsync(imageUrl, HttpCompletionOption.ResponseHeadersRead, ct);
            response.EnsureSuccessStatusCode();

            var type = response.Content.Headers.ContentType?.MediaType ?? "";
            var ext = type switch
            {
                "image/jpeg" or "image/jpg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => null,
            };
            if (ext == null)
            {
                logger.LogWarning("Instagram image for {ShortCode} has unexpected type {Type}", shortCode, type);
                return null;
            }
            if (response.Content.Headers.ContentLength > MaxImageBytes)
                return null;

            await using var body = await response.Content.ReadAsStreamAsync(ct);
            await using var limited = new MemoryStream();
            await body.CopyToAsync(limited, ct);
            if (limited.Length > MaxImageBytes)
                return null;
            limited.Position = 0;

            var path = await storage.SaveStreamAsync(limited, ImageFolder, $"instagram_{shortCode}{ext}", ct);
            result.ImagesDownloaded++;
            return path;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogWarning(ex, "Could not download the Instagram image for {ShortCode}", shortCode);
            return null;
        }
    }

    public static string? ShortCodeOf(string? permalink) =>
        permalink == null ? null : ShortCodeRegex().Match(permalink) is { Success: true } m ? m.Groups[1].Value : null;

    // Instagram sends "2025-10-27T10:15:00+0000" (offset without a colon).
    public static DateTime? ParseTimestamp(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        if (value.Length > 5 && value[^5] is '+' or '-' && value[^3] != ':')
            value = value.Insert(value.Length - 2, ":");
        return DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed)
            ? parsed.UtcDateTime
            : null;
    }

    private static string? Truncate(string? value, int max) =>
        value == null || value.Length <= max ? value : value[..max];

    [GeneratedRegex(@"instagram\.com/(?:[\w.]+/)?(?:p|reel|reels|tv)/([\w-]+)", RegexOptions.IgnoreCase)]
    private static partial Regex ShortCodeRegex();

    private sealed class MediaPage
    {
        [JsonPropertyName("data")] public List<MediaItem>? Data { get; set; }
    }

    private sealed class MediaItem
    {
        [JsonPropertyName("id")] public string? Id { get; set; }
        [JsonPropertyName("caption")] public string? Caption { get; set; }
        [JsonPropertyName("media_type")] public string? MediaType { get; set; }
        [JsonPropertyName("media_url")] public string? MediaUrl { get; set; }
        [JsonPropertyName("thumbnail_url")] public string? ThumbnailUrl { get; set; }
        [JsonPropertyName("permalink")] public string? Permalink { get; set; }
        [JsonPropertyName("timestamp")] public string? Timestamp { get; set; }
        [JsonPropertyName("like_count")] public int? LikeCount { get; set; }
        [JsonPropertyName("username")] public string? Username { get; set; }
    }

    private sealed class PagesResponse
    {
        [JsonPropertyName("data")] public List<PageItem>? Data { get; set; }
    }

    private sealed class PageItem
    {
        [JsonPropertyName("instagram_business_account")] public IdOnly? InstagramBusinessAccount { get; set; }
    }

    private sealed class IdOnly
    {
        [JsonPropertyName("id")] public string? Id { get; set; }
    }

    private sealed class RefreshResponse
    {
        [JsonPropertyName("access_token")] public string? AccessToken { get; set; }
        [JsonPropertyName("expires_in")] public long ExpiresIn { get; set; }
    }

    private sealed class ErrorResponse
    {
        [JsonPropertyName("error")] public ErrorBody? Error { get; set; }
    }

    private sealed class ErrorBody
    {
        [JsonPropertyName("message")] public string? Message { get; set; }
    }
}
