using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IdentityModel.Tokens;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.MetaAds;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class MetaAdsAuthTests
{
    private sealed class CapturingEmailSender : IEmailSender
    {
        public List<(string To, string Subject)> Sent { get; } = [];

        public Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody)
        {
            Sent.Add((recipients.Single()!, subject));
            return Task.CompletedTask;
        }

        public Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody) =>
            throw new NotSupportedException();

        public string LastCode => Regex.Match(Sent[^1].Subject, @"\d{6}").Value;
    }

    private static IConfiguration Config(string allowed = "boss@proteini.mk, Marketing@Proteini.mk=mkt") =>
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["AppSettings:TokenKey"] = "synthetic-token-key-for-meta-ads-tests-0123456789",
            ["MetaAds:AllowedUsers"] = allowed,
        }).Build();

    private static (MetaAdsAuthService Service, CapturingEmailSender Sender) Create(IConfiguration? config = null)
    {
        var sender = new CapturingEmailSender();
        return (new MetaAdsAuthService(config ?? Config(), new MemoryCache(new MemoryCacheOptions()), sender, NullLogger<MetaAdsAuthService>.Instance), sender);
    }

    [Fact]
    public void Allowlist_parses_emails_and_duo_usernames()
    {
        var users = MetaAdsOptions.From(Config("a@x.mk;B@X.mk=bduo\nnot-an-email")).Users;
        Assert.Equal(2, users.Count);
        Assert.Equal("a@x.mk", users["a@x.mk"]);
        Assert.Equal("bduo", users["b@x.mk"]);
    }

    [Fact]
    public async Task Email_code_signs_in_an_allowed_user_with_a_valid_session_token()
    {
        var config = Config();
        var (service, sender) = Create(config);

        await service.SendEmailCodeAsync(" Boss@Proteini.mk ");
        var session = service.VerifyEmailCode("boss@proteini.mk", sender.LastCode);

        Assert.Equal("boss@proteini.mk", session.User.Email);
        Assert.Equal("email", session.User.Method);

        // The token validates with exactly the parameters the API's MetaAds scheme uses.
        var principal = new JwtSecurityTokenHandler { MapInboundClaims = false }.ValidateToken(session.Token, new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(MetaAdsSession.SigningKey(config)),
            ValidIssuer = MetaAdsSession.Issuer,
            ValidAudience = MetaAdsSession.Audience,
        }, out _);
        Assert.Equal("boss@proteini.mk", service.GetUser(principal)!.Email);
    }

    [Fact]
    public async Task Unknown_email_gets_the_same_answer_but_no_email()
    {
        var (service, sender) = Create();
        var result = await service.SendEmailCodeAsync("stranger@example.com");

        Assert.True(result.Status);
        Assert.Empty(sender.Sent);
    }

    [Fact]
    public async Task Code_is_single_use_and_wrong_codes_run_out()
    {
        var (service, sender) = Create();
        await service.SendEmailCodeAsync("boss@proteini.mk");
        var code = sender.LastCode;
        var wrong = code == "000000" ? "111111" : "000000";

        for (var i = 0; i < 4; i++)
            Assert.Throws<BadRequestException>(() => service.VerifyEmailCode("boss@proteini.mk", wrong));
        service.VerifyEmailCode("boss@proteini.mk", code);
        Assert.Throws<BadRequestException>(() => service.VerifyEmailCode("boss@proteini.mk", code));
    }

    [Fact]
    public void Session_of_a_removed_user_is_rejected()
    {
        var (service, _) = Create(Config("someone-else@proteini.mk"));
        var principal = new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity(
            [new System.Security.Claims.Claim(MetaAdsSession.EmailClaim, "boss@proteini.mk")], "test"));
        Assert.Null(service.GetUser(principal));
    }

    [Fact]
    public async Task Duo_requires_configuration()
    {
        var (service, _) = Create();
        await Assert.ThrowsAsync<BadRequestException>(() => service.StartDuoAsync("boss@proteini.mk"));
    }

    [Fact]
    public void Shop_tokens_and_dashboard_tokens_use_different_keys()
    {
        var config = Config();
        Assert.NotEqual(Encoding.UTF8.GetBytes(config["AppSettings:TokenKey"]!), MetaAdsSession.SigningKey(config));
    }
}

public class MetaAdsServiceTests
{
    private sealed class FakeGraph : HttpMessageHandler
    {
        public List<(HttpMethod Method, string Url, string? Auth, Dictionary<string, string> Form)> Calls { get; } = [];
        public string Currency { get; set; } = "EUR";
        public string? FailOn { get; set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var form = new Dictionary<string, string>();
            if (request.Content is FormUrlEncodedContent)
                foreach (var pair in (await request.Content.ReadAsStringAsync(cancellationToken)).Split('&'))
                {
                    var kv = pair.Split('=', 2);
                    form[WebUtility.UrlDecode(kv[0])] = WebUtility.UrlDecode(kv[1]);
                }

            var url = request.RequestUri!.ToString();
            Calls.Add((request.Method, url, request.Headers.Authorization?.ToString(), form));
            var path = request.RequestUri.AbsolutePath;

            if (FailOn is not null && path.EndsWith(FailOn))
                return Json(HttpStatusCode.BadRequest, """{"error":{"message":"Invalid parameter","error_user_title":"Budget too low","error_user_msg":"Raise the budget.","code":100,"fbtrace_id":"x"}}""");

            string body = path switch
            {
                _ when path.EndsWith("/adcreatives") => """{"id":"111"}""",
                _ when path.EndsWith("/campaigns") => """{"id":"222"}""",
                _ when path.EndsWith("/adsets") => """{"id":"333"}""",
                _ when path.EndsWith("/ads") => """{"id":"444"}""",
                _ when path.EndsWith("/act_987") => $$"""{"currency":"{{Currency}}","name":"Proteini"}""",
                _ => "{}",
            };
            return Json(HttpStatusCode.OK, body);
        }

        private static HttpResponseMessage Json(HttpStatusCode code, string body) =>
            new(code) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
    }

    private sealed class Factory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class NoFeed : IProductFeedService
    {
        public Task<List<CatalogFeedItemDto>> BuildItemsAsync() => Task.FromResult(new List<CatalogFeedItemDto>
        {
            new() { Id = "v1", ProductId = 1, VariantId = 1, Title = "Whey", Link = "https://proteini.mk/product/1?variant=1", Price = "2290.00 MKD", SalePrice = "1990.00 MKD", Quantity = 3 },
        });
        public Task<string> BuildXmlFeedAsync(CatalogFeedSelection? selection = null) => throw new NotSupportedException();
    }

    private static (MetaAdsService Service, FakeGraph Graph) Create(bool configured = true)
    {
        var values = new Dictionary<string, string?>();
        if (configured)
        {
            values["MetaAds:AccessToken"] = "SECRET-TOKEN";
            values["MetaAds:AppSecret"] = "app-secret";
            values["MetaAds:AdAccountId"] = "987";
            values["MetaAds:PageId"] = "555";
            values["MetaAds:InstagramUserId"] = "777";
        }
        var graph = new FakeGraph();
        var config = new ConfigurationBuilder().AddInMemoryCollection(values).Build();
        return (new MetaAdsService(new Factory(graph), config, new NoFeed(), NullLogger<MetaAdsService>.Instance), graph);
    }

    private static MetaAdPublishDto Carousel() => new()
    {
        Name = "Black Friday",
        PrimaryText = "Попуст на протеини!",
        Cards =
        [
            new() { ImageHash = "h1", Headline = "Whey", Description = "1.990 MKD", Link = "https://proteini.mk/product/1" },
            new() { ImageHash = "h2", Headline = "Creatine", Link = "https://proteini.mk/product/2?variant=5" },
        ],
        Delivery = new() { DailyBudget = 12.5m, Countries = ["mk", "AL", "bad!"] },
    };

    [Fact]
    public async Task Publish_creates_creative_campaign_adset_and_ad_in_order()
    {
        var (service, graph) = Create();
        var result = await service.PublishAsync(Carousel(), "boss@proteini.mk");

        Assert.True(result.Status);
        Assert.Equal(("111", "222", "333", "444"), (result.CreativeId, result.CampaignId, result.AdSetId, result.AdId));
        Assert.Contains("act=987", result.AdsManagerUrl);

        var posts = graph.Calls.Where(c => c.Method == HttpMethod.Post).Select(c => new Uri(c.Url).AbsolutePath).ToList();
        Assert.Equal(["/v24.0/act_987/adcreatives", "/v24.0/act_987/campaigns", "/v24.0/act_987/adsets", "/v24.0/act_987/ads"], posts);

        // Token only in the Authorization header, never in a URL or form body.
        Assert.All(graph.Calls, call =>
        {
            Assert.Equal("Bearer SECRET-TOKEN", call.Auth);
            Assert.DoesNotContain("SECRET-TOKEN", call.Url);
            Assert.DoesNotContain(call.Form.Values, value => value.Contains("SECRET-TOKEN"));
        });
        Assert.All(graph.Calls.Where(c => c.Method == HttpMethod.Post), call => Assert.True(call.Form.ContainsKey("appsecret_proof")));
    }

    [Fact]
    public async Task Carousel_spec_has_cards_page_instagram_and_utm_links()
    {
        var (service, graph) = Create();
        await service.PublishAsync(Carousel(), "boss@proteini.mk");

        var creative = graph.Calls.Single(c => c.Url.EndsWith("/adcreatives")).Form;
        using var spec = JsonDocument.Parse(creative["object_story_spec"]);
        var root = spec.RootElement;
        Assert.Equal("555", root.GetProperty("page_id").GetString());
        Assert.Equal("777", root.GetProperty("instagram_user_id").GetString());

        var linkData = root.GetProperty("link_data");
        var cards = linkData.GetProperty("child_attachments");
        Assert.Equal(2, cards.GetArrayLength());
        Assert.Equal("h1", cards[0].GetProperty("image_hash").GetString());
        Assert.Equal("Whey", cards[0].GetProperty("name").GetString());
        Assert.Equal("https://proteini.mk/product/1?utm_source=meta&utm_medium=paid_social&utm_campaign=black-friday", cards[0].GetProperty("link").GetString());
        Assert.Equal("https://proteini.mk/product/2?variant=5&utm_source=meta&utm_medium=paid_social&utm_campaign=black-friday", cards[1].GetProperty("link").GetString());
        Assert.False(cards[1].TryGetProperty("description", out _));
        Assert.Equal("SHOP_NOW", cards[0].GetProperty("call_to_action").GetProperty("type").GetString());
    }

    [Fact]
    public async Task Ad_set_budget_is_in_cents_and_targeting_is_sanitized()
    {
        var (service, graph) = Create();
        await service.PublishAsync(Carousel(), "boss@proteini.mk");

        var adSet = graph.Calls.Single(c => c.Url.EndsWith("/adsets")).Form;
        Assert.Equal("1250", adSet["daily_budget"]);
        Assert.Equal("PAUSED", adSet["status"]);
        Assert.Equal("LINK_CLICKS", adSet["optimization_goal"]);
        using var targeting = JsonDocument.Parse(adSet["targeting"]);
        Assert.Equal(["MK", "AL"], targeting.RootElement.GetProperty("geo_locations").GetProperty("countries").EnumerateArray().Select(e => e.GetString()));
    }

    [Fact]
    public async Task Gender_placements_and_lifetime_budget_reach_the_ad_set()
    {
        var (service, graph) = Create();
        var request = Carousel();
        request.Delivery = new()
        {
            BudgetType = "lifetime", LifetimeBudget = 70, DailyBudget = 0, Gender = "women", Placements = "stories",
            StartTime = DateTime.UtcNow.AddDays(1), EndTime = DateTime.UtcNow.AddDays(8),
        };
        await service.PublishAsync(request, "boss@proteini.mk");

        var adSet = graph.Calls.Single(c => c.Url.EndsWith("/adsets")).Form;
        Assert.Equal("7000", adSet["lifetime_budget"]);
        Assert.False(adSet.ContainsKey("daily_budget"));
        Assert.True(adSet.ContainsKey("end_time"));
        using var targeting = JsonDocument.Parse(adSet["targeting"]);
        var t = targeting.RootElement;
        Assert.Equal([2], t.GetProperty("genders").EnumerateArray().Select(e => e.GetInt32()));
        Assert.Equal(["story", "reels"], t.GetProperty("instagram_positions").EnumerateArray().Select(e => e.GetString()));
        Assert.Equal(["story", "facebook_reels"], t.GetProperty("facebook_positions").EnumerateArray().Select(e => e.GetString()));
    }

    [Fact]
    public async Task Lifetime_budget_needs_an_end_date()
    {
        var (service, _) = Create();
        var request = Carousel();
        request.Delivery = new() { BudgetType = "lifetime", LifetimeBudget = 50 };
        await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(request, "boss@proteini.mk"));
    }

    [Fact]
    public async Task Preview_formats_are_whitelisted()
    {
        var (service, graph) = Create();
        var request = Carousel();
        request.PreviewFormats = ["instagram_story", "EVIL_FORMAT", "MOBILE_FEED_STANDARD"];
        await service.PreviewAsync(request);

        var formats = graph.Calls.Where(c => c.Url.Contains("/generatepreviews"))
            .Select(c => Regex.Match(c.Url, "ad_format=([A-Z_]+)").Groups[1].Value).ToList();
        Assert.Equal(["INSTAGRAM_STORY", "MOBILE_FEED_STANDARD"], formats);
    }

    [Fact]
    public async Task Existing_ad_set_skips_campaign_creation()
    {
        var (service, graph) = Create();
        var request = Carousel();
        request.Delivery = new() { Mode = "existing", AdSetId = "999" };
        var result = await service.PublishAsync(request, "boss@proteini.mk");

        Assert.Equal("999", result.AdSetId);
        Assert.DoesNotContain(graph.Calls, c => c.Url.EndsWith("/campaigns") || c.Url.EndsWith("/adsets"));
        Assert.Equal("999", graph.Calls.Single(c => c.Url.EndsWith("/ads")).Form["adset_id"]);
    }

    [Fact]
    public async Task Meta_errors_come_back_readable_with_what_was_already_created()
    {
        var (service, graph) = Create();
        graph.FailOn = "/adsets";

        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(Carousel(), "boss@proteini.mk"));
        Assert.Equal("Budget too low: Raise the budget.", ex.Message);
        var body = JsonSerializer.Serialize(ex.Body);
        Assert.Contains("\"campaignId\":\"222\"", body);
    }

    private static MetaAdPublishDto Collection(string name) => new()
    {
        Format = "collection",
        Name = name,
        PrimaryText = "Нови промоции!",
        Cards = [new() { ImageHash = "sq", VerticalImageHash = "vt", Headline = "Најнови промоции" }],
        ProductIds = ["v1", "V2", "v3", "v4", "p5", "v1"],
        StoreTitle = "НАЈНОВИ ПРОМОЦИИ",
        StoreSubtitle = "Нарачај сега & заштеди!",
        Link = "https://stage.proteini.mk/whatever",
        Delivery = new() { DailyBudget = 10 },
    };

    private static JsonElement CreativeField(FakeGraph graph, string field, int index = 0) =>
        JsonDocument.Parse(graph.Calls.Where(c => c.Url.EndsWith("/adcreatives")).ElementAt(index).Form[field]).RootElement;

    [Fact]
    public async Task Collection_is_one_ad_with_square_and_vertical_image_opening_the_collection_page()
    {
        var (service, graph) = Create();
        var result = await service.PublishAsync(Collection("Collection publish"), "boss@proteini.mk");

        Assert.True(result.Status);
        var posts = graph.Calls.Where(c => c.Method == HttpMethod.Post).Select(c => new Uri(c.Url).AbsolutePath).ToList();
        Assert.Equal(["/v24.0/act_987/adcreatives", "/v24.0/act_987/campaigns", "/v24.0/act_987/adsets", "/v24.0/act_987/ads"], posts);

        // Nothing in the ad set limits placements: the same ad runs everywhere with the right image per placement.
        using (var targeting = JsonDocument.Parse(graph.Calls.Single(c => c.Url.EndsWith("/adsets")).Form["targeting"]))
            Assert.False(targeting.RootElement.TryGetProperty("publisher_platforms", out _));

        var story = CreativeField(graph, "object_story_spec");
        Assert.Equal("555", story.GetProperty("page_id").GetString());
        Assert.Equal("777", story.GetProperty("instagram_user_id").GetString());
        Assert.False(story.TryGetProperty("link_data", out _));

        var feed = CreativeField(graph, "asset_feed_spec");
        Assert.Equal("PLACEMENT", feed.GetProperty("optimization_type").GetString());
        Assert.Equal(["sq", "vt"], feed.GetProperty("images").EnumerateArray().Select(i => i.GetProperty("hash").GetString()));
        var link = feed.GetProperty("link_urls")[0].GetProperty("website_url").GetString()!;
        Assert.StartsWith("https://stage.proteini.mk/collection?p=v1,v2,v3,v4,p5&t=", link);
        Assert.Contains("&s=" + Uri.EscapeDataString("Нарачај сега & заштеди!"), link);
        Assert.Contains("utm_source=meta", link);
        Assert.Equal("Најнови промоции", feed.GetProperty("titles")[0].GetProperty("text").GetString());

        var rules = feed.GetProperty("asset_customization_rules").EnumerateArray().ToList();
        var vertical = rules.Single(r => r.GetProperty("image_label").GetProperty("name").GetString() == "pmads_vertical");
        Assert.Equal(["story", "reels"], vertical.GetProperty("customization_spec").GetProperty("instagram_positions").EnumerateArray().Select(e => e.GetString()));
        var labels = feed.GetProperty("images").EnumerateArray().Select(i => i.GetProperty("adlabels")[0].GetProperty("name").GetString());
        Assert.Equal(["pmads_square", "pmads_vertical"], labels);
    }

    [Fact]
    public async Task Collection_needs_four_valid_products()
    {
        var (service, graph) = Create();
        var request = Collection("Too few");
        request.ProductIds = ["v1", "v2", "v2", "v3"];
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(request, "boss@proteini.mk"));
        Assert.Contains("at least 4", ex.Message);

        request.ProductIds = ["v1", "v2", "v3", "x9"];
        ex = await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(request, "boss@proteini.mk"));
        Assert.Contains("x9", ex.Message);
        Assert.Empty(graph.Calls);
    }

    [Fact]
    public async Task Single_image_without_vertical_stays_a_plain_link_ad()
    {
        var (service, graph) = Create();
        var request = Carousel();
        request.Format = "single";
        await service.PublishAsync(request, "boss@proteini.mk");

        Assert.False(graph.Calls.Single(c => c.Url.EndsWith("/adcreatives")).Form.ContainsKey("asset_feed_spec"));
        Assert.Equal("h1", CreativeField(graph, "object_story_spec").GetProperty("link_data").GetProperty("image_hash").GetString());
    }

    private static MetaAdPublishDto VerticalCarousel(string placements)
    {
        var request = Carousel();
        request.Cards[0].VerticalImageHash = "v1";
        request.Cards[1].VerticalImageHash = "v2";
        request.Delivery.Placements = placements;
        return request;
    }

    [Fact]
    public async Task Carousel_with_stories_gets_a_feeds_ad_set_and_full_screen_ads_on_one_campaign_budget()
    {
        var (service, graph) = Create();
        var result = await service.PublishAsync(VerticalCarousel("auto"), "boss@proteini.mk");

        var posts = graph.Calls.Where(c => c.Method == HttpMethod.Post).Select(c => new Uri(c.Url).AbsolutePath.Replace("/v24.0/act_987/", "")).ToList();
        Assert.Equal(["adcreatives", "adcreatives", "adcreatives", "campaigns", "adsets", "adsets", "ads", "ads", "ads"], posts);
        Assert.Equal(3, result.AdIds.Count);
        Assert.Equal(2, result.AdSetIds.Count);

        // One budget at campaign level (CBO); the ad sets carry none.
        var campaign = graph.Calls.Single(c => c.Url.EndsWith("/campaigns")).Form;
        Assert.Equal("1250", campaign["daily_budget"]);
        Assert.False(campaign.ContainsKey("is_adset_budget_sharing_enabled"));
        var adSets = graph.Calls.Where(c => c.Url.EndsWith("/adsets")).Select(c => c.Form).ToList();
        Assert.All(adSets, a => Assert.False(a.ContainsKey("daily_budget")));

        using var feeds = JsonDocument.Parse(adSets[0]["targeting"]);
        Assert.Equal(["stream"], feeds.RootElement.GetProperty("instagram_positions").EnumerateArray().Select(e => e.GetString()));
        using var stories = JsonDocument.Parse(adSets[1]["targeting"]);
        Assert.Equal(["story", "reels"], stories.RootElement.GetProperty("instagram_positions").EnumerateArray().Select(e => e.GetString()));
        Assert.Contains("stories & reels", adSets[1]["name"]);

        Assert.True(CreativeField(graph, "object_story_spec").GetProperty("link_data").TryGetProperty("child_attachments", out _));
        var second = CreativeField(graph, "object_story_spec", 2).GetProperty("link_data");
        Assert.Equal("v2", second.GetProperty("image_hash").GetString());
        Assert.StartsWith("https://proteini.mk/product/2?variant=5", second.GetProperty("link").GetString());
    }

    [Fact]
    public async Task Carousel_only_in_stories_becomes_full_screen_ads_only()
    {
        var (service, graph) = Create();
        var result = await service.PublishAsync(VerticalCarousel("stories"), "boss@proteini.mk");

        var posts = graph.Calls.Where(c => c.Method == HttpMethod.Post).Select(c => new Uri(c.Url).AbsolutePath.Replace("/v24.0/act_987/", "")).ToList();
        Assert.Equal(["adcreatives", "adcreatives", "campaigns", "adsets", "ads", "ads"], posts);
        Assert.Equal("1250", graph.Calls.Single(c => c.Url.EndsWith("/adsets")).Form["daily_budget"]);
        Assert.Equal(2, result.AdIds.Count);
    }

    [Theory]
    [InlineData("feeds", "new")]
    [InlineData("auto", "existing")]
    public async Task Carousel_stays_one_ad_in_feeds_or_an_existing_ad_set(string placements, string mode)
    {
        var (service, graph) = Create();
        var request = VerticalCarousel(placements);
        request.Delivery.Mode = mode;
        request.Delivery.AdSetId = "333";
        await service.PublishAsync(request, "boss@proteini.mk");

        Assert.Single(graph.Calls, c => c.Url.EndsWith("/adcreatives"));
        Assert.Single(graph.Calls, c => c.Url.EndsWith("/ads"));
    }

    [Fact]
    public async Task Carousel_preview_in_stories_shows_the_full_screen_ad()
    {
        var (service, graph) = Create();
        var request = VerticalCarousel("auto");
        request.PreviewFormats = ["MOBILE_FEED_STANDARD", "INSTAGRAM_STORY"];
        await service.PreviewAsync(request);

        var creatives = graph.Calls.Where(c => c.Url.Contains("/generatepreviews"))
            .Select(c => WebUtility.UrlDecode(Regex.Match(c.Url, "creative=([^&]+)").Groups[1].Value)).ToList();
        Assert.Contains("child_attachments", creatives[0]);
        Assert.DoesNotContain("child_attachments", creatives[1]);
        Assert.Contains("\"image_hash\":\"v1\"", creatives[1]);
        Assert.DoesNotContain(graph.Calls, c => c.Method == HttpMethod.Post);
    }

    [Theory]
    [InlineData(1, "carousel")]
    [InlineData(11, "carousel")]
    [InlineData(0, "single")]
    public async Task Card_count_is_validated(int count, string format)
    {
        var (service, graph) = Create();
        var request = Carousel();
        request.Format = format;
        request.Cards = Enumerable.Range(0, count).Select(i => new MetaAdCardDto { ImageHash = $"h{i}", Link = "https://proteini.mk/" }).ToList();

        await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(request, "boss@proteini.mk"));
        Assert.Empty(graph.Calls);
    }

    [Fact]
    public async Task Non_https_links_are_rejected()
    {
        var (service, _) = Create();
        var request = Carousel();
        request.Cards[1].Link = "javascript:alert(1)";
        await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(request, "boss@proteini.mk"));
    }

    [Fact]
    public async Task Unconfigured_api_reports_missing_settings()
    {
        var (service, _) = Create(configured: false);
        var status = await service.GetStatusAsync();
        Assert.False(status.Configured);
        Assert.Contains("MetaAds__AccessToken", status.Missing);
        await Assert.ThrowsAsync<BadRequestException>(() => service.PublishAsync(Carousel(), "x"));
    }

    [Fact]
    public async Task Products_have_numeric_prices()
    {
        var (service, _) = Create();
        var product = Assert.Single(await service.GetProductsAsync());
        Assert.Equal(2290m, product.Price);
        Assert.Equal(1990m, product.SalePrice);
        Assert.True(product.InStock);
    }
}
