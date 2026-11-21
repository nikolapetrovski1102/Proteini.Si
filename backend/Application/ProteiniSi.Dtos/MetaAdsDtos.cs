namespace ProteiniSi.Dtos;

// ---------- Sign-in (meta-ads.proteini.mk) ----------

/// <param name="TurnstileToken">Cloudflare "not a robot" token from the sign-in page (single use).</param>
public record MetaAdsEmailDto(string? Email, string? TurnstileToken = null);

public record MetaAdsCodeVerifyDto(string? Email, string? Code);

public record MetaAdsAuthOptionsDto(bool DuoEnabled, bool EmailCodeEnabled);

public record MetaAdsDuoStartDto(string RedirectUrl);

public record MetaAdsCodeSentDto(bool Status, string Message, int RetryAfterSeconds);

/// <summary>A signed-in dashboard user. Method is "duo" or "email".</summary>
public record MetaAdsSessionUser(string Email, string Method);

/// <summary>Result of a successful sign-in: the session token goes into an HttpOnly cookie, never to the page.</summary>
public record MetaAdsSessionDto(MetaAdsSessionUser User, string Token, DateTime ExpiresAtUtc);

// ---------- Account / status ----------

public class MetaAdsStatusDto
{
    public bool Configured { get; set; }
    public List<string> Missing { get; set; } = [];
    public string? AdAccountId { get; set; }
    public string? AdAccountName { get; set; }
    public string? Currency { get; set; }
    public int? AccountStatus { get; set; }
    public string? TimeZone { get; set; }
    public string? PageId { get; set; }
    public string? PageName { get; set; }
    public string? InstagramUserId { get; set; }
    public string? InstagramUsername { get; set; }
    public bool PixelConfigured { get; set; }
    public string? Error { get; set; }
}

// ---------- Publishing ----------

public class MetaAdCardDto
{
    public string? ImageHash { get; set; }
    /// <summary>Optional 1080×1920 version of the same card for Stories and Reels (Meta image hash).</summary>
    public string? VerticalImageHash { get; set; }
    public string? Headline { get; set; }
    public string? Description { get; set; }
    public string? Link { get; set; }
}

public class MetaAdDeliveryDto
{
    /// <summary>"new" creates a campaign + ad set; "existing" adds the ad to <see cref="AdSetId"/>.</summary>
    public string Mode { get; set; } = "new";
    public string? AdSetId { get; set; }
    public string? CampaignName { get; set; }
    /// <summary>TRAFFIC, AWARENESS or SALES (SALES needs MetaAds:PixelId).</summary>
    public string Goal { get; set; } = "TRAFFIC";
    /// <summary>Daily budget in the ad account currency (whole units, e.g. 10 = 10 EUR).</summary>
    public decimal DailyBudget { get; set; } = 10;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public List<string> Countries { get; set; } = ["MK"];
    public int AgeMin { get; set; } = 18;
    public int AgeMax { get; set; } = 65;
    /// <summary>"auto", "facebook", "instagram", "feeds" (feeds only) or "stories" (stories + reels only).</summary>
    public string Placements { get; set; } = "auto";
    /// <summary>"all", "men" or "women".</summary>
    public string Gender { get; set; } = "all";
    /// <summary>"daily" (DailyBudget per day) or "lifetime" (LifetimeBudget for the whole run, needs EndTime).</summary>
    public string BudgetType { get; set; } = "daily";
    public decimal LifetimeBudget { get; set; }
}

/// <summary>Meta's audience size and daily reach guess for a targeting + budget.</summary>
public class MetaAdEstimateDto
{
    public long? AudienceLower { get; set; }
    public long? AudienceUpper { get; set; }
    public long? DailyReachLower { get; set; }
    public long? DailyReachUpper { get; set; }
}

public class MetaAdPublishDto
{
    /// <summary>"carousel" (2–10 cards), "single" (first card only) or "collection" (one image of cover + products, linking to a proteini.mk/collection page with the picked products).</summary>
    public string Format { get; set; } = "carousel";
    public string? Name { get; set; }
    public string? PrimaryText { get; set; }
    /// <summary>Meta call-to-action type, e.g. SHOP_NOW, LEARN_MORE, ORDER_NOW, GET_OFFER.</summary>
    public string CallToAction { get; set; } = "SHOP_NOW";
    /// <summary>Main link (the carousel's "see more" link). Defaults to the first card's link.</summary>
    public string? Link { get; set; }
    public List<MetaAdCardDto> Cards { get; set; } = [];
    /// <summary>Let Meta reorder carousel cards by performance.</summary>
    public bool OptimizeCardOrder { get; set; } = true;
    /// <summary>Append utm_source=meta&amp;utm_medium=paid_social&amp;utm_campaign=... to every link.</summary>
    public bool AddUtm { get; set; } = true;
    /// <summary>"PAUSED" (default, review in Ads Manager first) or "ACTIVE".</summary>
    public string Status { get; set; } = "PAUSED";
    public MetaAdDeliveryDto Delivery { get; set; } = new();
    /// <summary>Collection: product feed item IDs ("v12" variant, "p5" product), 4–50, shown on the proteini.mk/collection page.</summary>
    public List<string>? ProductIds { get; set; }
    /// <summary>Collection: big title and small line on the proteini.mk/collection page.</summary>
    public string? StoreTitle { get; set; }
    public string? StoreSubtitle { get; set; }
    /// <summary>Preview only: Meta ad_format values to render (whitelisted server-side). Empty = Facebook + Instagram feed.</summary>
    public List<string>? PreviewFormats { get; set; }
}

public class MetaAdPublishResultDto
{
    public bool Status { get; set; }
    public string? CreativeId { get; set; }
    public string? CampaignId { get; set; }
    public string? AdSetId { get; set; }
    public string? AdId { get; set; }
    /// <summary>Every ad set / ad made (a carousel with Stories &amp; Reels gets a second ad set with one full-screen ad per card).</summary>
    public List<string> AdSetIds { get; set; } = [];
    public List<string> AdIds { get; set; } = [];
    public string? AdsManagerUrl { get; set; }
    public string? Message { get; set; }
}

public record MetaAdImageDto(string Hash, string? Url);

/// <summary>Src is a facebook.com preview iframe URL (validated server-side).</summary>
public record MetaAdPreviewDto(string Format, string Src);

public record MetaAdStatusChangeDto(string? Status);

// ---------- Lists ----------

public class MetaAdSetSummaryDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Status { get; set; }
    public string? CampaignId { get; set; }
    public string? CampaignName { get; set; }
}

public class MetaAdSummaryDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Status { get; set; }
    public string? EffectiveStatus { get; set; }
    public DateTime? CreatedTime { get; set; }
    public string? AdSetName { get; set; }
    public string? CampaignName { get; set; }
    public string? ThumbnailUrl { get; set; }
    public long? Impressions { get; set; }
    public long? Clicks { get; set; }
    public decimal? Spend { get; set; }
    public decimal? Ctr { get; set; }
    public string? AdsManagerUrl { get; set; }
}

/// <summary>A catalog row trimmed to what the ad builder needs, with numeric prices.</summary>
public class MetaAdProductDto
{
    public string Id { get; set; } = "";
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string Title { get; set; } = "";
    public string Brand { get; set; } = "";
    public string Link { get; set; } = "";
    public string? Image { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public bool InStock { get; set; }
    public string? Category { get; set; }
    public string? Size { get; set; }
    public string? Flavor { get; set; }
    public string Description { get; set; } = "";
}
