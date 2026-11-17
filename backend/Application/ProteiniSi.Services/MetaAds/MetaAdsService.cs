using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Services.MetaAds;

/// <summary>
/// Meta Marketing API (Graph API) client for the ads dashboard. Uses a long-lived system user token with
/// ads_management; every call carries appsecret_proof when MetaAds:AppSecret is set. The token travels in the
/// Authorization header only, so it never ends up in HttpClient request logs.
/// </summary>
public partial class MetaAdsService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    IProductFeedService feedService,
    ILogger<MetaAdsService> logger) : IMetaAdsService
{
    public const string HttpClientName = "MetaGraph";
    private const int MaxImageBytes = 8 * 1024 * 1024;

    private static readonly HashSet<string> CallToActions =
        ["SHOP_NOW", "BUY_NOW", "ORDER_NOW", "GET_OFFER", "LEARN_MORE", "SIGN_UP", "CONTACT_US"];

    /// <summary>Currencies Meta counts in whole units; every other currency is sent in cents (offset 100).</summary>
    private static readonly HashSet<string> WholeUnitCurrencies =
        ["CLP", "COP", "CRC", "HUF", "ISK", "IDR", "JPY", "KRW", "PYG", "TWD", "VND"];

    private MetaAdsOptions Options => MetaAdsOptions.From(config);

    // ---------- Status ----------

    public async Task<MetaAdsStatusDto> GetStatusAsync()
    {
        var options = Options;
        var status = new MetaAdsStatusDto
        {
            Missing = MissingSettings(options),
            AdAccountId = options.AdAccountNode,
            PageId = options.PageId,
            InstagramUserId = options.InstagramUserId,
            PixelConfigured = options.PixelId.Length > 0,
        };
        status.Configured = status.Missing.Count == 0;
        if (!status.Configured)
            return status;

        try
        {
            var account = await GetAsync(options, options.AdAccountNode, new() { ["fields"] = "name,currency,account_status,timezone_name" });
            status.AdAccountName = Str(account, "name");
            status.Currency = Str(account, "currency");
            status.AccountStatus = account.TryGetProperty("account_status", out var accountStatus) ? accountStatus.GetInt32() : null;
            status.TimeZone = Str(account, "timezone_name");

            var page = await GetAsync(options, options.PageId, new() { ["fields"] = "name" });
            status.PageName = Str(page, "name");

            if (options.InstagramUserId.Length > 0)
            {
                // Reading the @name needs instagram_basic; publishing only needs the ID, so a missing permission is not an error.
                try
                {
                    var instagram = await GetAsync(options, options.InstagramUserId, new() { ["fields"] = "username" });
                    status.InstagramUsername = Str(instagram, "username");
                }
                catch (BadRequestException ex)
                {
                    logger.LogInformation("Meta ads: could not read the Instagram username ({Message})", ex.Message);
                    status.InstagramUsername = options.InstagramUserId;
                }
            }
        }
        catch (BadRequestException ex)
        {
            status.Error = ex.Message;
        }

        return status;
    }

    private static List<string> MissingSettings(MetaAdsOptions options)
    {
        var missing = new List<string>();
        if (options.AccessToken.Length == 0) missing.Add("MetaAds__AccessToken");
        if (options.AdAccountNode.Length == 0) missing.Add("MetaAds__AdAccountId");
        if (options.PageId.Length == 0) missing.Add("MetaAds__PageId");
        return missing;
    }

    // ---------- Products ----------

    public async Task<List<MetaAdProductDto>> GetProductsAsync()
    {
        var items = await feedService.BuildItemsAsync();
        return items.Select(item => new MetaAdProductDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            VariantId = item.VariantId,
            Title = item.Title,
            Brand = item.Brand,
            Link = item.Link,
            Image = item.ImageLink,
            Price = ParsePrice(item.Price) ?? 0,
            SalePrice = ParsePrice(item.SalePrice),
            InStock = item.Quantity > 0,
            Category = item.CustomLabel1,
            Size = item.Size,
            Flavor = item.Flavor,
            Description = item.Description.Length > 400 ? item.Description[..400] : item.Description,
        }).ToList();
    }

    private static decimal? ParsePrice(string? value)
    {
        var number = value?.Split(' ')[0];
        return decimal.TryParse(number, NumberStyles.Number, CultureInfo.InvariantCulture, out var price) ? price : null;
    }

    // ---------- Images ----------

    public async Task<MetaAdImageDto> UploadImageAsync(Stream content, string fileName, string contentType)
    {
        var options = RequireConfigured();
        if (contentType is not ("image/jpeg" or "image/png"))
            throw new BadRequestException("Only JPEG or PNG images can be sent to Meta.");

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer);
        if (buffer.Length == 0 || buffer.Length > MaxImageBytes)
            throw new BadRequestException("The image must be between 1 byte and 8 MB.");

        var safeName = SafeFileName().Replace(Path.GetFileName(fileName), "_");
        if (string.IsNullOrWhiteSpace(safeName)) safeName = "ad-image.jpg";

        using var form = new MultipartFormDataContent();
        var file = new ByteArrayContent(buffer.ToArray());
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        form.Add(file, "filename", safeName);
        AddProof(options, form);

        using var request = new HttpRequestMessage(HttpMethod.Post, Url(options, $"{options.AdAccountNode}/adimages")) { Content = form };
        var result = await SendAsync(options, request);

        if (result.TryGetProperty("images", out var images))
            foreach (var image in images.EnumerateObject())
                return new MetaAdImageDto(Str(image.Value, "hash") ?? "", Str(image.Value, "url"));

        throw new BadRequestException("Meta did not return an image hash.");
    }

    // ---------- Preview ----------

    public async Task<List<MetaAdPreviewDto>> PreviewAsync(MetaAdPublishDto request)
    {
        var options = RequireConfigured();
        var spec = BuildObjectStorySpec(request, options, Slug(request.Name ?? "preview"));
        var creative = new JsonObject { ["object_story_spec"] = spec }.ToJsonString();

        var formats = new List<string> { "MOBILE_FEED_STANDARD" };
        if (options.InstagramUserId.Length > 0)
            formats.Add("INSTAGRAM_STANDARD");

        var previews = new List<MetaAdPreviewDto>();
        foreach (var format in formats)
        {
            var result = await GetAsync(options, $"{options.AdAccountNode}/generatepreviews", new()
            {
                ["creative"] = creative,
                ["ad_format"] = format,
            });

            if (!result.TryGetProperty("data", out var data))
                continue;
            foreach (var item in data.EnumerateArray())
            {
                var match = IframeSrc().Match(Str(item, "body") ?? "");
                if (!match.Success)
                    continue;
                var src = WebUtility.HtmlDecode(match.Groups[1].Value);
                if (Uri.TryCreate(src, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps
                    && (uri.Host == "facebook.com" || uri.Host.EndsWith(".facebook.com", StringComparison.OrdinalIgnoreCase)))
                    previews.Add(new MetaAdPreviewDto(format, uri.ToString()));
            }
        }

        return previews;
    }

    // ---------- Publish ----------

    public async Task<MetaAdPublishResultDto> PublishAsync(MetaAdPublishDto request, string publishedBy)
    {
        var options = RequireConfigured();
        var status = NormalizeStatus(request.Status);
        var delivery = request.Delivery ?? new MetaAdDeliveryDto();
        var name = Clean(request.Name, 200) ?? $"{(IsCarousel(request) ? "Carousel" : "Image")} {DateTime.UtcNow:yyyy-MM-dd HH:mm}";
        var spec = BuildObjectStorySpec(request, options, Slug(name));

        string? existingAdSetId = null;
        if (string.Equals(delivery.Mode, "existing", StringComparison.OrdinalIgnoreCase))
            existingAdSetId = RequireId(delivery.AdSetId, "Choose the ad set to add this ad to.");

        var result = new MetaAdPublishResultDto();
        try
        {
            var creative = await PostAsync(options, $"{options.AdAccountNode}/adcreatives", new()
            {
                ["name"] = $"{name} · creative",
                ["object_story_spec"] = spec.ToJsonString(),
            });
            result.CreativeId = Str(creative, "id");

            if (existingAdSetId is null)
            {
                var goal = (delivery.Goal ?? "TRAFFIC").Trim().ToUpperInvariant();
                if (goal == "SALES" && options.PixelId.Length == 0)
                    throw new BadRequestException("The SALES goal needs MetaAds__PixelId. Use TRAFFIC or set the pixel.");

                var campaign = await PostAsync(options, $"{options.AdAccountNode}/campaigns", new()
                {
                    ["name"] = Clean(delivery.CampaignName, 200) ?? name,
                    ["objective"] = goal switch { "AWARENESS" => "OUTCOME_AWARENESS", "SALES" => "OUTCOME_SALES", _ => "OUTCOME_TRAFFIC" },
                    ["status"] = status,
                    ["buying_type"] = "AUCTION",
                    ["special_ad_categories"] = "[]",
                    ["is_adset_budget_sharing_enabled"] = "false",
                });
                result.CampaignId = Str(campaign, "id");

                var currency = await GetCurrencyAsync(options);
                var adSet = await PostAsync(options, $"{options.AdAccountNode}/adsets", BuildAdSetForm(delivery, goal, options, name, result.CampaignId!, currency, status));
                result.AdSetId = Str(adSet, "id");
            }
            else
            {
                result.AdSetId = existingAdSetId;
            }

            var ad = await PostAsync(options, $"{options.AdAccountNode}/ads", new()
            {
                ["name"] = name,
                ["adset_id"] = result.AdSetId,
                ["creative"] = new JsonObject { ["creative_id"] = result.CreativeId }.ToJsonString(),
                ["status"] = status,
            });
            result.AdId = Str(ad, "id");
        }
        catch (BadRequestException ex)
        {
            logger.LogWarning("Meta ads: publish by {User} stopped: {Message} (creative {CreativeId}, campaign {CampaignId}, ad set {AdSetId})",
                publishedBy, ex.Message, result.CreativeId, result.CampaignId, result.AdSetId);
            throw new BadRequestException(ex.Message, new
            {
                status = false,
                message = ex.Message,
                creativeId = result.CreativeId,
                campaignId = result.CampaignId,
                adSetId = result.AdSetId,
                note = result.CampaignId is null ? null : "The campaign/ad set already created stay in Ads Manager; delete them there or retry with \"existing ad set\".",
            });
        }

        result.Status = true;
        result.AdsManagerUrl = AdsManagerUrl(options, result.AdId);
        result.Message = status == "ACTIVE"
            ? "Ad published. Meta reviews it before it starts delivering (usually within a few hours)."
            : "Ad created as paused. Check it in Ads Manager and switch it on when ready.";
        logger.LogInformation("Meta ads: {User} published ad {AdId} ({Status}) creative {CreativeId} ad set {AdSetId}",
            publishedBy, result.AdId, status, result.CreativeId, result.AdSetId);
        return result;
    }

    private static Dictionary<string, string?> BuildAdSetForm(MetaAdDeliveryDto delivery, string goal, MetaAdsOptions options, string name,
        string campaignId, string currency, string status)
    {
        if (delivery.DailyBudget <= 0)
            throw new BadRequestException("Set a daily budget above zero.");

        var countries = (delivery.Countries ?? [])
            .Select(code => code.Trim().ToUpperInvariant())
            .Where(code => code.Length == 2 && code.All(char.IsAsciiLetterUpper))
            .Distinct()
            .ToList();
        if (countries.Count == 0)
            countries.Add("MK");

        var targeting = new JsonObject
        {
            ["geo_locations"] = new JsonObject { ["countries"] = new JsonArray(countries.Select(c => (JsonNode)c!).ToArray()) },
            ["age_min"] = Math.Clamp(delivery.AgeMin, 18, 65),
            ["age_max"] = Math.Clamp(Math.Max(delivery.AgeMax, delivery.AgeMin), 18, 65),
            ["targeting_automation"] = new JsonObject { ["advantage_audience"] = 0 },
        };
        switch ((delivery.Placements ?? "auto").ToLowerInvariant())
        {
            case "facebook":
                targeting["publisher_platforms"] = new JsonArray("facebook");
                break;
            case "instagram":
                targeting["publisher_platforms"] = new JsonArray("instagram");
                break;
        }

        var offset = WholeUnitCurrencies.Contains(currency) ? 1 : 100;
        var start = delivery.StartTime is { } s && s > DateTime.UtcNow ? s.ToUniversalTime() : DateTime.UtcNow.AddMinutes(5);
        var form = new Dictionary<string, string?>
        {
            ["name"] = $"{name} · ad set",
            ["campaign_id"] = campaignId,
            ["daily_budget"] = ((long)Math.Round(delivery.DailyBudget * offset)).ToString(CultureInfo.InvariantCulture),
            ["billing_event"] = "IMPRESSIONS",
            ["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP",
            ["optimization_goal"] = goal switch { "AWARENESS" => "REACH", "SALES" => "OFFSITE_CONVERSIONS", _ => "LINK_CLICKS" },
            ["targeting"] = targeting.ToJsonString(),
            ["start_time"] = start.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture),
            ["status"] = status,
        };
        if (goal != "AWARENESS")
            form["destination_type"] = "WEBSITE";
        if (goal == "SALES")
            form["promoted_object"] = new JsonObject { ["pixel_id"] = options.PixelId, ["custom_event_type"] = "PURCHASE" }.ToJsonString();
        if (delivery.EndTime is { } end)
        {
            if (end.ToUniversalTime() <= start.AddHours(1))
                throw new BadRequestException("The end date must be after the start date.");
            form["end_time"] = end.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
        }

        return form;
    }

    /// <summary>The Page post behind the ad: one image + link, or a carousel of 2–10 cards.</summary>
    private static JsonObject BuildObjectStorySpec(MetaAdPublishDto request, MetaAdsOptions options, string utmCampaign)
    {
        var cta = (request.CallToAction ?? "SHOP_NOW").Trim().ToUpperInvariant();
        if (!CallToActions.Contains(cta))
            throw new BadRequestException($"Unknown call to action \"{request.CallToAction}\".");

        var message = Clean(request.PrimaryText, 2000) ?? throw new BadRequestException("Write the primary text (the text above the ad).");
        var cards = request.Cards ?? [];
        var carousel = IsCarousel(request);
        if (carousel && cards.Count is < 2 or > 10)
            throw new BadRequestException("A carousel needs 2 to 10 cards.");
        if (!carousel && cards.Count == 0)
            throw new BadRequestException("Add an image.");

        var links = cards.Select((card, index) =>
            WithUtm(RequireLink(card.Link, $"Card {index + 1} needs a link."), request.AddUtm, utmCampaign)).ToList();
        for (var i = 0; i < cards.Count; i++)
            if (string.IsNullOrWhiteSpace(cards[i].ImageHash))
                throw new BadRequestException($"Card {i + 1} has no uploaded image.");

        var mainLink = string.IsNullOrWhiteSpace(request.Link)
            ? links[0]
            : WithUtm(RequireLink(request.Link, "The main link is not valid."), request.AddUtm, utmCampaign);

        JsonObject linkData;
        if (carousel)
        {
            var children = new JsonArray();
            for (var i = 0; i < cards.Count; i++)
            {
                var child = new JsonObject
                {
                    ["link"] = links[i],
                    ["image_hash"] = cards[i].ImageHash!.Trim(),
                    ["call_to_action"] = new JsonObject { ["type"] = cta, ["value"] = new JsonObject { ["link"] = links[i] } },
                };
                if (Clean(cards[i].Headline, 255) is { } headline) child["name"] = headline;
                if (Clean(cards[i].Description, 255) is { } description) child["description"] = description;
                children.Add(child);
            }

            linkData = new JsonObject
            {
                ["link"] = mainLink,
                ["message"] = message,
                ["child_attachments"] = children,
                ["multi_share_optimized"] = request.OptimizeCardOrder,
                ["multi_share_end_card"] = false,
                ["call_to_action"] = new JsonObject { ["type"] = cta, ["value"] = new JsonObject { ["link"] = mainLink } },
            };
        }
        else
        {
            var card = cards[0];
            linkData = new JsonObject
            {
                ["link"] = links[0],
                ["message"] = message,
                ["image_hash"] = card.ImageHash!.Trim(),
                ["call_to_action"] = new JsonObject { ["type"] = cta, ["value"] = new JsonObject { ["link"] = links[0] } },
            };
            if (Clean(card.Headline, 255) is { } headline) linkData["name"] = headline;
            if (Clean(card.Description, 255) is { } description) linkData["description"] = description;
        }

        var spec = new JsonObject { ["page_id"] = options.PageId, ["link_data"] = linkData };
        if (options.InstagramUserId.Length > 0)
            spec["instagram_user_id"] = options.InstagramUserId;
        return spec;
    }

    // ---------- Lists ----------

    public async Task<List<MetaAdSetSummaryDto>> GetAdSetsAsync()
    {
        var options = RequireConfigured();
        var result = await GetAsync(options, $"{options.AdAccountNode}/adsets", new()
        {
            ["fields"] = "id,name,status,campaign{id,name}",
            ["effective_status"] = "[\"ACTIVE\",\"PAUSED\",\"CAMPAIGN_PAUSED\"]",
            ["limit"] = "100",
        });

        return Rows(result).Select(row => new MetaAdSetSummaryDto
        {
            Id = Str(row, "id") ?? "",
            Name = Str(row, "name") ?? "",
            Status = Str(row, "status"),
            CampaignId = row.TryGetProperty("campaign", out var campaign) ? Str(campaign, "id") : null,
            CampaignName = row.TryGetProperty("campaign", out campaign) ? Str(campaign, "name") : null,
        }).ToList();
    }

    public async Task<List<MetaAdSummaryDto>> GetAdsAsync(int limit)
    {
        var options = RequireConfigured();
        var result = await GetAsync(options, $"{options.AdAccountNode}/ads", new()
        {
            ["fields"] = "id,name,status,effective_status,created_time,adset{name},campaign{name},creative{thumbnail_url},insights.date_preset(last_30d){impressions,clicks,spend,ctr}",
            ["limit"] = Math.Clamp(limit, 1, 100).ToString(CultureInfo.InvariantCulture),
        });

        return Rows(result).Select(row =>
        {
            JsonElement? insight = row.TryGetProperty("insights", out var insights) && insights.TryGetProperty("data", out var data) && data.GetArrayLength() > 0
                ? data[0]
                : null;
            var id = Str(row, "id") ?? "";
            return new MetaAdSummaryDto
            {
                Id = id,
                Name = Str(row, "name") ?? "",
                Status = Str(row, "status"),
                EffectiveStatus = Str(row, "effective_status"),
                CreatedTime = DateTime.TryParse(Str(row, "created_time"), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var created) ? created : null,
                AdSetName = row.TryGetProperty("adset", out var adSet) ? Str(adSet, "name") : null,
                CampaignName = row.TryGetProperty("campaign", out var campaign) ? Str(campaign, "name") : null,
                ThumbnailUrl = row.TryGetProperty("creative", out var creative) ? Str(creative, "thumbnail_url") : null,
                Impressions = insight is { } i1 && long.TryParse(Str(i1, "impressions"), out var impressions) ? impressions : null,
                Clicks = insight is { } i2 && long.TryParse(Str(i2, "clicks"), out var clicks) ? clicks : null,
                Spend = insight is { } i3 && decimal.TryParse(Str(i3, "spend"), NumberStyles.Number, CultureInfo.InvariantCulture, out var spend) ? spend : null,
                Ctr = insight is { } i4 && decimal.TryParse(Str(i4, "ctr"), NumberStyles.Number, CultureInfo.InvariantCulture, out var ctr) ? ctr : null,
                AdsManagerUrl = AdsManagerUrl(options, id),
            };
        }).ToList();
    }

    public async Task SetAdStatusAsync(string adId, string status, string changedBy)
    {
        var options = RequireConfigured();
        var id = RequireId(adId, "Unknown ad.");
        var normalized = NormalizeStatus(status);

        // Only ads in our own ad account can be switched from here.
        var ad = await GetAsync(options, id, new() { ["fields"] = "account_id" });
        if (Str(ad, "account_id") != options.AdAccountNumber)
            throw new ForbiddenException("This ad belongs to another ad account.");

        await PostAsync(options, id, new() { ["status"] = normalized });
        logger.LogInformation("Meta ads: {User} set ad {AdId} to {Status}", changedBy, id, normalized);
    }

    // ---------- Graph plumbing ----------

    private MetaAdsOptions RequireConfigured()
    {
        var options = Options;
        var missing = MissingSettings(options);
        if (missing.Count > 0)
            throw new BadRequestException($"The Meta API is not set up yet. Missing: {string.Join(", ", missing)}.");
        return options;
    }

    private async Task<string> GetCurrencyAsync(MetaAdsOptions options)
    {
        var account = await GetAsync(options, options.AdAccountNode, new() { ["fields"] = "currency" });
        return Str(account, "currency")?.ToUpperInvariant() ?? "EUR";
    }

    private async Task<JsonElement> GetAsync(MetaAdsOptions options, string path, Dictionary<string, string?> query)
    {
        if (options.AppSecret.Length > 0)
            query["appsecret_proof"] = Proof(options);
        var queryString = string.Join("&", query.Where(pair => pair.Value is not null)
            .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}"));
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{Url(options, path)}?{queryString}");
        return await SendAsync(options, request);
    }

    private async Task<JsonElement> PostAsync(MetaAdsOptions options, string path, Dictionary<string, string?> form)
    {
        if (options.AppSecret.Length > 0)
            form["appsecret_proof"] = Proof(options);
        using var request = new HttpRequestMessage(HttpMethod.Post, Url(options, path))
        {
            Content = new FormUrlEncodedContent(form.Where(pair => pair.Value is not null).Select(pair => new KeyValuePair<string, string>(pair.Key, pair.Value!))),
        };
        return await SendAsync(options, request);
    }

    private async Task<JsonElement> SendAsync(MetaAdsOptions options, HttpRequestMessage request)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.AccessToken);
        var client = httpClientFactory.CreateClient(HttpClientName);

        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(request);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            logger.LogWarning(ex, "Meta ads: Graph API unreachable");
            throw new BadRequestException("Meta did not answer. Please try again in a minute.");
        }

        using (response)
        {
            var body = await response.Content.ReadAsStringAsync();
            JsonElement json;
            try
            {
                json = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body).RootElement.Clone();
            }
            catch (JsonException)
            {
                throw new BadRequestException($"Meta answered with an unreadable response ({(int)response.StatusCode}).");
            }

            if (response.IsSuccessStatusCode && !json.TryGetProperty("error", out _))
                return json;

            var error = json.TryGetProperty("error", out var e) ? e : default;
            var code = error.ValueKind == JsonValueKind.Object && error.TryGetProperty("code", out var c) && c.ValueKind == JsonValueKind.Number ? c.GetInt32() : 0;
            var message = code == 190
                ? "The Meta access token is invalid or expired. Generate a new system user token (see docs/meta-ads-dashboard.md)."
                : error.ValueKind == JsonValueKind.Object
                    ? Str(error, "error_user_msg") ?? Str(error, "message") ?? "Meta rejected the request."
                    : $"Meta rejected the request ({(int)response.StatusCode}).";
            var title = error.ValueKind == JsonValueKind.Object ? Str(error, "error_user_title") : null;

            logger.LogWarning("Meta ads: Graph {Method} {Path} failed {Status} code {Code}: {Message} (fbtrace {Trace})",
                request.Method, request.RequestUri?.AbsolutePath, (int)response.StatusCode, code,
                error.ValueKind == JsonValueKind.Object ? Str(error, "message") : body, error.ValueKind == JsonValueKind.Object ? Str(error, "fbtrace_id") : null);
            throw new BadRequestException(title is null ? message : $"{title}: {message}");
        }
    }

    private static string Url(MetaAdsOptions options, string path) =>
        $"https://graph.facebook.com/{options.ApiVersion}/{path.TrimStart('/')}";

    private static void AddProof(MetaAdsOptions options, MultipartFormDataContent form)
    {
        if (options.AppSecret.Length > 0)
            form.Add(new StringContent(Proof(options)), "appsecret_proof");
    }

    private static string Proof(MetaAdsOptions options) =>
        Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(options.AppSecret), Encoding.UTF8.GetBytes(options.AccessToken))).ToLowerInvariant();

    private static IEnumerable<JsonElement> Rows(JsonElement result) =>
        result.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Array ? data.EnumerateArray() : [];

    private static string? Str(JsonElement element, string property) =>
        element.ValueKind == JsonValueKind.Object && element.TryGetProperty(property, out var value)
            ? value.ValueKind switch
            {
                JsonValueKind.String => value.GetString(),
                JsonValueKind.Number => value.GetRawText(),
                _ => null,
            }
            : null;

    // ---------- Validation helpers ----------

    private static bool IsCarousel(MetaAdPublishDto request) =>
        !string.Equals(request.Format, "single", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeStatus(string? status) =>
        string.Equals(status?.Trim(), "ACTIVE", StringComparison.OrdinalIgnoreCase) ? "ACTIVE" : "PAUSED";

    private static string RequireId(string? id, string message) =>
        id is { Length: > 0 and <= 32 } value && value.All(char.IsAsciiDigit) ? value : throw new BadRequestException(message);

    private static string RequireLink(string? link, string message) =>
        Uri.TryCreate(link?.Trim(), UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps ? uri.ToString() : throw new BadRequestException(message);

    private static string? Clean(string? value, int max)
    {
        var text = value?.Trim();
        if (string.IsNullOrEmpty(text))
            return null;
        return text.Length > max ? text[..max] : text;
    }

    private static string WithUtm(string link, bool addUtm, string campaign)
    {
        if (!addUtm || link.Contains("utm_source=", StringComparison.OrdinalIgnoreCase))
            return link;
        var separator = link.Contains('?') ? '&' : '?';
        return $"{link}{separator}utm_source=meta&utm_medium=paid_social&utm_campaign={Uri.EscapeDataString(campaign)}";
    }

    private static string Slug(string value)
    {
        var slug = NonSlug().Replace(value.ToLowerInvariant(), "-").Trim('-');
        return slug.Length == 0 ? "meta-ad" : slug.Length > 60 ? slug[..60] : slug;
    }

    private static string? AdsManagerUrl(MetaAdsOptions options, string? adId) =>
        adId is null ? null : $"https://adsmanager.facebook.com/adsmanager/manage/ads?act={options.AdAccountNumber}&selected_ad_ids={adId}";

    [GeneratedRegex(@"<iframe[^>]*\ssrc=""([^""]+)""", RegexOptions.IgnoreCase)]
    private static partial Regex IframeSrc();

    [GeneratedRegex(@"[^\w.\-]")]
    private static partial Regex SafeFileName();

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex NonSlug();
}
