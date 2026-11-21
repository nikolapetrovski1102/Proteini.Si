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

    private const string SquareLabel = "pmads_square";
    private const string VerticalLabel = "pmads_vertical";
    private const int CollectionMin = 4;
    private const int CollectionMax = 50;

    /// <summary>Full-screen preview formats; a carousel previews its first Stories/Reels ad there.</summary>
    private static readonly HashSet<string> StoryFormats = ["FACEBOOK_STORY_MOBILE", "FACEBOOK_REELS_MOBILE", "INSTAGRAM_STORY", "INSTAGRAM_REELS"];

    private static readonly HashSet<string> PreviewFormats =
    [
        "MOBILE_FEED_STANDARD", "DESKTOP_FEED_STANDARD", "FACEBOOK_STORY_MOBILE", "FACEBOOK_REELS_MOBILE",
        "INSTAGRAM_STANDARD", "INSTAGRAM_STORY", "INSTAGRAM_REELS", "INSTAGRAM_EXPLORE_GRID_HOME",
    ];

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
        var name = Clean(request.Name, 200) ?? "preview";
        var plan = BuildPlan(request, options, name, request.Delivery ?? new MetaAdDeliveryDto());

        var formats = (request.PreviewFormats ?? [])
            .Select(f => f.Trim().ToUpperInvariant())
            .Where(PreviewFormats.Contains)
            .Where(f => options.InstagramUserId.Length > 0 || !f.StartsWith("INSTAGRAM_", StringComparison.Ordinal))
            .Distinct()
            .Take(4)
            .ToList();
        if (formats.Count == 0)
        {
            formats.Add("MOBILE_FEED_STANDARD");
            if (options.InstagramUserId.Length > 0)
                formats.Add("INSTAGRAM_STANDARD");
        }

        var previews = new List<MetaAdPreviewDto>();
        foreach (var format in formats)
        {
            // Stories/Reels of a carousel run as the full-screen single ads, so preview the first of those there.
            var creative = (StoryFormats.Contains(format) || plan.Main is null) && plan.Stories.Count > 0
                ? plan.Stories[0]
                : plan.Main ?? plan.Stories[0];
            var result = await GetAsync(options, $"{options.AdAccountNode}/generatepreviews", new()
            {
                ["creative"] = creative.ToJsonString(),
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
        var name = Clean(request.Name, 200) ?? $"{(IsCollection(request) ? "Collection" : IsCarousel(request) ? "Carousel" : "Image")} {DateTime.UtcNow:yyyy-MM-dd HH:mm}";

        string? existingAdSetId = null;
        if (string.Equals(delivery.Mode, "existing", StringComparison.OrdinalIgnoreCase))
            existingAdSetId = RequireId(delivery.AdSetId, "Choose the ad set to add this ad to.");
        var plan = BuildPlan(request, options, name, delivery);

        var result = new MetaAdPublishResultDto();
        string? storyAdSetId = null;
        var storyCreativeIds = new List<string>();
        try
        {
            if (plan.Main is not null)
            {
                var creative = await PostAsync(options, $"{options.AdAccountNode}/adcreatives", CreativeForm($"{name} · creative", plan.Main));
                result.CreativeId = Str(creative, "id");
            }
            for (var i = 0; i < plan.Stories.Count; i++)
            {
                var creative = await PostAsync(options, $"{options.AdAccountNode}/adcreatives", CreativeForm($"{name} · story {i + 1} · creative", plan.Stories[i]));
                storyCreativeIds.Add(Str(creative, "id")!);
                result.CreativeId ??= storyCreativeIds[^1];
            }

            if (existingAdSetId is null)
            {
                var goal = (delivery.Goal ?? "TRAFFIC").Trim().ToUpperInvariant();
                if (goal == "SALES" && options.PixelId.Length == 0)
                    throw new BadRequestException("The SALES goal needs MetaAds__PixelId. Use TRAFFIC or set the pixel.");

                // Two ad sets (feeds carousel + full-screen Stories/Reels ads) share one budget at campaign level,
                // so Meta moves money to whichever works better and the total stays what was set.
                var split = plan.Main is not null && plan.Stories.Count > 0;
                var currency = await GetCurrencyAsync(options);
                var campaignForm = new Dictionary<string, string?>
                {
                    ["name"] = Clean(delivery.CampaignName, 200) ?? name,
                    ["objective"] = goal switch { "AWARENESS" => "OUTCOME_AWARENESS", "SALES" => "OUTCOME_SALES", _ => "OUTCOME_TRAFFIC" },
                    ["status"] = status,
                    ["buying_type"] = "AUCTION",
                    ["special_ad_categories"] = "[]",
                };
                if (split)
                {
                    var (key, value) = BudgetField(delivery, currency);
                    campaignForm[key] = value;
                    campaignForm["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP";
                }
                else
                {
                    campaignForm["is_adset_budget_sharing_enabled"] = "false";
                }
                var campaign = await PostAsync(options, $"{options.AdAccountNode}/campaigns", campaignForm);
                result.CampaignId = Str(campaign, "id");

                if (plan.Main is not null)
                {
                    var targeting = BuildTargeting(delivery, split ? "feeds" : null);
                    var adSet = await PostAsync(options, $"{options.AdAccountNode}/adsets",
                        BuildAdSetForm(delivery, goal, options, split ? $"{name} · feeds" : name, result.CampaignId!, currency, status, targeting, campaignBudget: split));
                    result.AdSetId = Str(adSet, "id");
                    result.AdSetIds.Add(result.AdSetId!);
                }
                if (plan.Stories.Count > 0)
                {
                    var adSet = await PostAsync(options, $"{options.AdAccountNode}/adsets",
                        BuildAdSetForm(delivery, goal, options, $"{name} · stories & reels", result.CampaignId!, currency, status,
                            BuildTargeting(delivery, "stories"), campaignBudget: split));
                    storyAdSetId = Str(adSet, "id");
                    result.AdSetId ??= storyAdSetId;
                    result.AdSetIds.Add(storyAdSetId!);
                }
            }
            else
            {
                result.AdSetId = existingAdSetId;
                result.AdSetIds.Add(existingAdSetId);
            }

            if (plan.Main is not null)
                result.AdIds.Add(await CreateAdAsync(options, name, result.AdSetId!, result.CreativeId!, status));
            for (var i = 0; i < storyCreativeIds.Count; i++)
                result.AdIds.Add(await CreateAdAsync(options, $"{name} · story {i + 1}", storyAdSetId ?? result.AdSetId!, storyCreativeIds[i], status));
            result.AdId = result.AdIds.FirstOrDefault();
        }
        catch (BadRequestException ex)
        {
            logger.LogWarning("Meta ads: publish by {User} stopped: {Message} (creative {CreativeId}, campaign {CampaignId}, ad sets {AdSetIds})",
                publishedBy, ex.Message, result.CreativeId, result.CampaignId, string.Join(",", result.AdSetIds));
            throw new BadRequestException(ex.Message, new
            {
                status = false,
                message = ex.Message,
                creativeId = result.CreativeId,
                campaignId = result.CampaignId,
                adSetId = result.AdSetId,
                adIds = result.AdIds,
                note = result.CampaignId is null ? null : "The campaign/ad sets already created stay in Ads Manager; delete them there or retry with \"existing ad set\".",
            });
        }

        result.Status = true;
        result.AdsManagerUrl = AdsManagerUrl(options, result.AdId);
        var count = result.AdIds.Count > 1 ? $"{result.AdIds.Count} ads" : "Ad";
        result.Message = status == "ACTIVE"
            ? $"{count} published. Meta reviews them before they start delivering (usually within a few hours)."
            : $"{count} created as paused. Check in Ads Manager and switch on when ready.";
        if (result.AdSetIds.Count > 1)
            result.Message += " Feeds show the carousel, Stories and Reels show one full-screen ad per product; Meta splits the budget between them.";
        logger.LogInformation("Meta ads: {User} published ads {AdIds} ({Status}) ad sets {AdSetIds}",
            publishedBy, string.Join(",", result.AdIds), status, string.Join(",", result.AdSetIds));
        return result;
    }

    private async Task<string> CreateAdAsync(MetaAdsOptions options, string name, string adSetId, string creativeId, string status)
    {
        var ad = await PostAsync(options, $"{options.AdAccountNode}/ads", new()
        {
            ["name"] = name,
            ["adset_id"] = adSetId,
            ["creative"] = new JsonObject { ["creative_id"] = creativeId }.ToJsonString(),
            ["status"] = status,
        });
        return Str(ad, "id") ?? throw new BadRequestException("Meta did not return the new ad's ID.");
    }

    /// <summary>Each top-level creative field (object_story_spec, asset_feed_spec) goes as its own JSON form value.</summary>
    private static Dictionary<string, string?> CreativeForm(string name, JsonObject creative)
    {
        var form = new Dictionary<string, string?> { ["name"] = name };
        foreach (var (key, value) in creative)
            form[key] = value is JsonValue v && v.TryGetValue<string>(out var text) ? text : value?.ToJsonString();
        return form;
    }

    private static (string Key, string Value) BudgetField(MetaAdDeliveryDto delivery, string currency)
    {
        var lifetime = string.Equals(delivery.BudgetType, "lifetime", StringComparison.OrdinalIgnoreCase);
        if (lifetime ? delivery.LifetimeBudget <= 0 : delivery.DailyBudget <= 0)
            throw new BadRequestException(lifetime ? "Set a total budget above zero." : "Set a daily budget above zero.");
        if (lifetime && delivery.EndTime is null)
            throw new BadRequestException("A total budget needs an end date.");
        var offset = WholeUnitCurrencies.Contains(currency) ? 1 : 100;
        var budget = lifetime ? delivery.LifetimeBudget : delivery.DailyBudget;
        return (lifetime ? "lifetime_budget" : "daily_budget", ((long)Math.Round(budget * offset)).ToString(CultureInfo.InvariantCulture));
    }

    private static Dictionary<string, string?> BuildAdSetForm(MetaAdDeliveryDto delivery, string goal, MetaAdsOptions options, string name,
        string campaignId, string currency, string status, JsonObject targeting, bool campaignBudget)
    {
        var lifetime = string.Equals(delivery.BudgetType, "lifetime", StringComparison.OrdinalIgnoreCase);
        var (budgetKey, budgetValue) = BudgetField(delivery, currency);
        var start = delivery.StartTime is { } s && s > DateTime.UtcNow ? s.ToUniversalTime() : DateTime.UtcNow.AddMinutes(5);
        var form = new Dictionary<string, string?>
        {
            ["name"] = $"{name} · ad set",
            ["campaign_id"] = campaignId,
            ["billing_event"] = "IMPRESSIONS",
            ["optimization_goal"] = OptimizationGoal(goal),
            ["targeting"] = targeting.ToJsonString(),
            ["start_time"] = start.ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture),
            ["status"] = status,
        };
        if (!campaignBudget)
        {
            form["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP";
            form[budgetKey] = budgetValue;
        }
        if (goal != "AWARENESS")
            form["destination_type"] = "WEBSITE";
        if (goal == "SALES")
            form["promoted_object"] = new JsonObject { ["pixel_id"] = options.PixelId, ["custom_event_type"] = "PURCHASE" }.ToJsonString();
        if (delivery.EndTime is { } end)
        {
            if (end.ToUniversalTime() <= start.AddHours(lifetime ? 24 : 1))
                throw new BadRequestException(lifetime ? "A total budget needs at least one day between start and end." : "The end date must be after the start date.");
            form["end_time"] = end.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
        }

        return form;
    }

    private static string OptimizationGoal(string goal) =>
        goal switch { "AWARENESS" => "REACH", "SALES" => "OFFSITE_CONVERSIONS", _ => "LINK_CLICKS" };

    /// <summary>
    /// Countries, age, gender and placements for a new ad set (also used for the audience estimate). <paramref name="group"/>
    /// ("feeds" or "stories") narrows the chosen platforms to those positions, for the two ad sets of a carousel with Stories &amp; Reels.
    /// </summary>
    private static JsonObject BuildTargeting(MetaAdDeliveryDto delivery, string? group = null)
    {
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
        switch ((delivery.Gender ?? "all").ToLowerInvariant())
        {
            case "men":
                targeting["genders"] = new JsonArray(1);
                break;
            case "women":
                targeting["genders"] = new JsonArray(2);
                break;
        }
        var placements = (delivery.Placements ?? "auto").Trim().ToLowerInvariant();
        if (placements is "feeds" or "stories")
            group = placements;
        var facebook = placements != "instagram";
        var instagram = placements != "facebook";
        var platforms = new JsonArray();
        if (facebook) platforms.Add("facebook");
        if (instagram) platforms.Add("instagram");
        if (group is "feeds" or "stories" || placements is "facebook" or "instagram")
            targeting["publisher_platforms"] = platforms;
        if (group == "feeds")
        {
            if (facebook) targeting["facebook_positions"] = new JsonArray("feed");
            if (instagram) targeting["instagram_positions"] = new JsonArray("stream");
        }
        else if (group == "stories")
        {
            if (facebook) targeting["facebook_positions"] = new JsonArray("story", "facebook_reels");
            if (instagram) targeting["instagram_positions"] = new JsonArray("story", "reels");
        }
        return targeting;
    }

    // ---------- Audience estimate ----------

    public async Task<MetaAdEstimateDto> EstimateAsync(MetaAdDeliveryDto delivery)
    {
        var options = RequireConfigured();
        var goal = (delivery.Goal ?? "TRAFFIC").Trim().ToUpperInvariant();
        var query = new Dictionary<string, string?>
        {
            ["targeting_spec"] = BuildTargeting(delivery).ToJsonString(),
            ["optimization_goal"] = goal == "SALES" && options.PixelId.Length == 0 ? "LINK_CLICKS" : OptimizationGoal(goal),
        };
        if (goal == "SALES" && options.PixelId.Length > 0)
            query["promoted_object"] = new JsonObject { ["pixel_id"] = options.PixelId, ["custom_event_type"] = "PURCHASE" }.ToJsonString();

        var result = await GetAsync(options, $"{options.AdAccountNode}/delivery_estimate", query);
        var estimate = new MetaAdEstimateDto();
        if (!result.TryGetProperty("data", out var data) || data.GetArrayLength() == 0)
            return estimate;

        var row = data[0];
        estimate.AudienceLower = Long(row, "estimate_mau_lower_bound");
        estimate.AudienceUpper = Long(row, "estimate_mau_upper_bound");

        // daily_outcomes_curve: [{spend (account minor units), reach, ...}] -> reach at the chosen daily budget.
        if (row.TryGetProperty("daily_outcomes_curve", out var curve) && curve.ValueKind == JsonValueKind.Array && curve.GetArrayLength() > 0)
        {
            var currency = await GetCurrencyAsync(options);
            var offset = WholeUnitCurrencies.Contains(currency) ? 1 : 100;
            var daily = string.Equals(delivery.BudgetType, "lifetime", StringComparison.OrdinalIgnoreCase) && delivery.StartTime is { } st && delivery.EndTime is { } en
                ? delivery.LifetimeBudget / (decimal)Math.Max(1, Math.Ceiling((en - st).TotalDays))
                : delivery.DailyBudget;
            var target = (double)(daily * offset);
            JsonElement? best = null;
            foreach (var point in curve.EnumerateArray())
            {
                var spend = point.TryGetProperty("spend", out var sp) && sp.TryGetDouble(out var v) ? v : 0;
                if (spend <= target || best is null)
                    best = point;
                if (spend > target)
                    break;
            }
            if (best is { } b && Long(b, "reach") is { } reach and > 0)
            {
                estimate.DailyReachLower = (long)(reach * 0.8);
                estimate.DailyReachUpper = (long)(reach * 1.2);
            }
        }
        return estimate;
    }

    private static long? Long(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value)
            ? value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out var n) ? n
            : value.ValueKind == JsonValueKind.Number && value.TryGetDouble(out var d) ? (long)d
            : long.TryParse(Str(element, name), out var parsed) ? parsed : null
            : null;

    // ---------- Creatives ----------

    /// <summary>
    /// What gets posted. <see cref="Main"/> is the ad's creative fields (null when a carousel runs only in Stories &amp; Reels);
    /// <see cref="Stories"/> are full-screen single-image creatives, one per carousel card, for a separate Stories &amp; Reels
    /// ad set (Meta has no vertical carousel cards, and a square carousel looks lost in a full-screen placement).
    /// </summary>
    private sealed record AdPlan(JsonObject? Main, List<JsonObject> Stories);

    private static AdPlan BuildPlan(MetaAdPublishDto request, MetaAdsOptions options, string name, MetaAdDeliveryDto delivery)
    {
        var utmCampaign = Slug(name);
        var cta = (request.CallToAction ?? "SHOP_NOW").Trim().ToUpperInvariant();
        if (!CallToActions.Contains(cta))
            throw new BadRequestException($"Unknown call to action \"{request.CallToAction}\".");

        var message = Clean(request.PrimaryText, 2000) ?? throw new BadRequestException("Write the primary text (the text above the ad).");
        var cards = request.Cards ?? [];
        var carousel = IsCarousel(request);
        var collection = IsCollection(request);
        if (carousel && cards.Count is < 2 or > 10)
            throw new BadRequestException("A carousel needs 2 to 10 cards.");
        if (!carousel && cards.Count == 0)
            throw new BadRequestException(collection ? "The collection image was not uploaded." : "Add an image.");
        if (!carousel)
            cards = cards.Take(1).ToList();
        for (var i = 0; i < cards.Count; i++)
            if (string.IsNullOrWhiteSpace(cards[i].ImageHash))
                throw new BadRequestException($"Card {i + 1} has no uploaded image.");

        if (collection)
        {
            var link = WithUtm(CollectionLink(request), request.AddUtm, utmCampaign);
            var card = cards[0];
            return new AdPlan(SingleCreative(options, message, cta, card.ImageHash!, card.VerticalImageHash, link, card.Headline, card.Description), []);
        }

        var links = cards.Select((card, index) =>
            WithUtm(RequireLink(card.Link, $"Card {index + 1} needs a link."), request.AddUtm, utmCampaign)).ToList();

        if (!carousel)
            return new AdPlan(SingleCreative(options, message, cta, cards[0].ImageHash!, cards[0].VerticalImageHash, links[0], cards[0].Headline, cards[0].Description), []);

        var mainLink = string.IsNullOrWhiteSpace(request.Link)
            ? links[0]
            : WithUtm(RequireLink(request.Link, "The main link is not valid."), request.AddUtm, utmCampaign);

        // Full-screen ads only with a new ad set (an existing one keeps its own placements) and when the placements include Stories/Reels.
        var placements = (delivery.Placements ?? "auto").Trim().ToLowerInvariant();
        var newAdSet = !string.Equals(delivery.Mode, "existing", StringComparison.OrdinalIgnoreCase);
        var stories = newAdSet && placements != "feeds" && cards.All(c => !string.IsNullOrWhiteSpace(c.VerticalImageHash))
            ? cards.Select((card, i) => StoryCreative(options, message, cta, card.VerticalImageHash!, links[i], card.Headline, card.Description)).ToList()
            : [];
        if (stories.Count > 0 && placements == "stories")
            return new AdPlan(null, stories);

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

        var linkData = new JsonObject
        {
            ["link"] = mainLink,
            ["message"] = message,
            ["child_attachments"] = children,
            ["multi_share_optimized"] = request.OptimizeCardOrder,
            ["multi_share_end_card"] = false,
            ["call_to_action"] = new JsonObject { ["type"] = cta, ["value"] = new JsonObject { ["link"] = mainLink } },
        };
        return new AdPlan(new JsonObject { ["object_story_spec"] = StorySpec(options, linkData) }, stories);
    }

    private static JsonObject StorySpec(MetaAdsOptions options, JsonObject? linkData)
    {
        var spec = new JsonObject { ["page_id"] = options.PageId };
        if (linkData is not null)
            spec["link_data"] = linkData;
        if (options.InstagramUserId.Length > 0)
            spec["instagram_user_id"] = options.InstagramUserId;
        return spec;
    }

    private static JsonObject LinkData(string message, string cta, string imageHash, string link, string? headline, string? description)
    {
        var linkData = new JsonObject
        {
            ["link"] = link,
            ["message"] = message,
            ["image_hash"] = imageHash.Trim(),
            ["call_to_action"] = new JsonObject { ["type"] = cta, ["value"] = new JsonObject { ["link"] = link } },
        };
        if (Clean(headline, 255) is { } h) linkData["name"] = h;
        if (Clean(description, 255) is { } d) linkData["description"] = d;
        return linkData;
    }

    /// <summary>Full-screen ad for a Stories &amp; Reels-only ad set: a plain single image, the vertical one.</summary>
    private static JsonObject StoryCreative(MetaAdsOptions options, string message, string cta, string verticalHash, string link, string? headline, string? description) =>
        new() { ["object_story_spec"] = StorySpec(options, LinkData(message, cta, verticalHash, link, headline, description)) };

    /// <summary>
    /// One image + link. With a vertical version it becomes a placement-customised ad (asset_feed_spec): the square image
    /// in feeds, the 9:16 one in Stories and Reels, in the same ad and ad set.
    /// </summary>
    private static JsonObject SingleCreative(MetaAdsOptions options, string message, string cta, string imageHash, string? verticalHash,
        string link, string? headline, string? description)
    {
        if (string.IsNullOrWhiteSpace(verticalHash))
            return new JsonObject { ["object_story_spec"] = StorySpec(options, LinkData(message, cta, imageHash, link, headline, description)) };

        var feed = new JsonObject
        {
            ["images"] = new JsonArray(
                new JsonObject { ["hash"] = imageHash.Trim(), ["adlabels"] = new JsonArray(new JsonObject { ["name"] = SquareLabel }) },
                new JsonObject { ["hash"] = verticalHash.Trim(), ["adlabels"] = new JsonArray(new JsonObject { ["name"] = VerticalLabel }) }),
            ["bodies"] = new JsonArray(new JsonObject { ["text"] = message }),
            ["link_urls"] = new JsonArray(new JsonObject { ["website_url"] = link }),
            ["call_to_action_types"] = new JsonArray(cta),
            ["ad_formats"] = new JsonArray("SINGLE_IMAGE"),
            ["optimization_type"] = "PLACEMENT",
            ["asset_customization_rules"] = new JsonArray(
                new JsonObject
                {
                    ["customization_spec"] = new JsonObject
                    {
                        ["publisher_platforms"] = new JsonArray("facebook", "instagram"),
                        ["facebook_positions"] = new JsonArray("story", "facebook_reels"),
                        ["instagram_positions"] = new JsonArray("story", "reels"),
                    },
                    ["image_label"] = new JsonObject { ["name"] = VerticalLabel },
                    ["priority"] = 1,
                },
                new JsonObject
                {
                    ["customization_spec"] = new JsonObject
                    {
                        ["publisher_platforms"] = new JsonArray("facebook", "instagram", "audience_network", "messenger"),
                        ["facebook_positions"] = new JsonArray("feed", "marketplace", "video_feeds", "search", "right_hand_column", "profile_feed"),
                        ["instagram_positions"] = new JsonArray("stream", "explore", "explore_home", "profile_feed"),
                    },
                    ["image_label"] = new JsonObject { ["name"] = SquareLabel },
                    ["priority"] = 2,
                }),
        };
        if (Clean(headline, 255) is { } h) feed["titles"] = new JsonArray(new JsonObject { ["text"] = h });
        if (Clean(description, 255) is { } d) feed["descriptions"] = new JsonArray(new JsonObject { ["text"] = d });
        return new JsonObject { ["object_story_spec"] = StorySpec(options, null), ["asset_feed_spec"] = feed };
    }

    /// <summary>
    /// The proteini.mk page a collection ad opens: /collection with the picked feed items, title and subtitle in the URL,
    /// on the same site as the shop link (so stage ads open stage).
    /// </summary>
    private static string CollectionLink(MetaAdPublishDto request)
    {
        var ids = (request.ProductIds ?? []).Select(id => id.Trim().ToLowerInvariant()).Where(id => id.Length > 0).Distinct().ToList();
        if (ids.Count < CollectionMin)
            throw new BadRequestException($"A collection needs at least {CollectionMin} products.");
        if (ids.Count > CollectionMax)
            throw new BadRequestException($"A collection can show up to {CollectionMax} products.");
        if (ids.FirstOrDefault(id => !CatalogItemId().IsMatch(id)) is { } bad)
            throw new BadRequestException($"Unknown product \"{bad}\".");

        var site = new Uri(RequireLink(string.IsNullOrWhiteSpace(request.Link) ? "https://proteini.mk/" : request.Link, "The shop link is not valid."));
        var query = $"p={string.Join(",", ids)}";
        if (Clean(request.StoreTitle, 80) is { } title) query += $"&t={Uri.EscapeDataString(title)}";
        if (Clean(request.StoreSubtitle, 160) is { } subtitle) query += $"&s={Uri.EscapeDataString(subtitle)}";
        return $"{site.GetLeftPart(UriPartial.Authority)}/collection?{query}";
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
            ["fields"] = "id,name,status,effective_status,created_time,adset{name},campaign{name},creative.thumbnail_width(600).thumbnail_height(600){thumbnail_url},insights.date_preset(last_30d){impressions,clicks,spend,ctr}",
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

    private async Task<JsonElement> GetAsync(MetaAdsOptions options, string path, Dictionary<string, string?> query, string? token = null)
    {
        if (options.AppSecret.Length > 0)
            query["appsecret_proof"] = Proof(options, token);
        var queryString = string.Join("&", query.Where(pair => pair.Value is not null)
            .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}"));
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{Url(options, path)}?{queryString}");
        return await SendAsync(options, request, token);
    }

    private async Task<JsonElement> PostAsync(MetaAdsOptions options, string path, Dictionary<string, string?> form, string? token = null)
    {
        if (options.AppSecret.Length > 0)
            form["appsecret_proof"] = Proof(options, token);
        using var request = new HttpRequestMessage(HttpMethod.Post, Url(options, path))
        {
            Content = new FormUrlEncodedContent(form.Where(pair => pair.Value is not null).Select(pair => new KeyValuePair<string, string>(pair.Key, pair.Value!))),
        };
        return await SendAsync(options, request, token);
    }

    /// <param name="token">A Page access token for Page edges (photos, Instant Experiences); null = the system user token.</param>
    private async Task<JsonElement> SendAsync(MetaAdsOptions options, HttpRequestMessage request, string? token = null)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token ?? options.AccessToken);
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

    private static string Proof(MetaAdsOptions options, string? token = null) =>
        Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(options.AppSecret), Encoding.UTF8.GetBytes(token ?? options.AccessToken))).ToLowerInvariant();

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
        string.Equals(request.Format?.Trim(), "carousel", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(request.Format);

    private static bool IsCollection(MetaAdPublishDto request) =>
        string.Equals(request.Format?.Trim(), "collection", StringComparison.OrdinalIgnoreCase);

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

    [GeneratedRegex(@"^[vp][0-9]{1,10}$")]
    private static partial Regex CatalogItemId();
}
