namespace ProteiniSi.Models;

/// <summary>One automatic marketing email (welcome, abandoned checkout, replenishment, new discount) with its editable copy.</summary>
public class MarketingEmailTemplate
{
    public const string Welcome = "welcome";
    public const string AbandonedCheckout = "abandoned_checkout";
    public const string Replenishment = "replenishment";
    public const string NewDiscount = "new_discount";

    public static readonly IReadOnlyList<string> AllCodes = [Welcome, AbandonedCheckout, Replenishment, NewDiscount];

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    /// <summary>Local (Europe/Skopje) time of day the email goes out.</summary>
    public TimeSpan SendTime { get; set; }
    /// <summary>welcome / abandoned_checkout: hours to wait after the event; replenishment: days before the product runs out;
    /// new_discount: how many days after a discount starts it may still be announced.</summary>
    public int DelayValue { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Preheader { get; set; }
    public string Heading { get; set; } = string.Empty;
    /// <summary>Paragraphs separated by blank lines. Placeholders: {ime}, {proizvod}, {kod}; new_discount also {popust}, {procent}.</summary>
    public string Body { get; set; } = string.Empty;
    public string ButtonText { get; set; } = string.Empty;
    public string? ButtonUrl { get; set; }
    public string? CouponCode { get; set; }
    public string? CouponText { get; set; }
    // Albanian copy; empty fields fall back to the Macedonian copy above.
    public string? SubjectAl { get; set; }
    public string? PreheaderAl { get; set; }
    public string? HeadingAl { get; set; }
    public string? BodyAl { get; set; }
    public string? ButtonTextAl { get; set; }
    public string? CouponTextAl { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public int SentLast30Days { get; set; }
    public int SentTotal { get; set; }
    public DateTime? LastSentAt { get; set; }
}

public class MarketingRecipient
{
    public int? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string ReferenceKey { get; set; } = string.Empty;
    public DateTime? LastActivity { get; set; }
    /// <summary>"mk" or "al".</summary>
    public string? Language { get; set; }
}

public class ReplenishmentItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public DateTime OrderDate { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? ProductImg { get; set; }
    public decimal? Price { get; set; }
    public int Servings { get; set; }
    public int Quantity { get; set; }
    public DateTime RunOutDate { get; set; }
    public string ReferenceKey { get; set; } = string.Empty;
    public string? Language { get; set; }
}

public class FeaturedProduct
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImg { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
}

/// <summary>One person to tell about one new automatic discount.</summary>
public class NewDiscountRecipient : MarketingRecipient
{
    public int DiscountId { get; set; }
}

/// <summary>A new automatic discount with the products it currently discounts (for the "new discount" email).</summary>
public class MarketingDiscount
{
    public int DiscountId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>"percent" or "price".</summary>
    public string DiscountType { get; set; } = "percent";
    public decimal? Percentage { get; set; }
    public string AppliesTo { get; set; } = "products";
    public DateTime? EndsOn { get; set; }
    public List<FeaturedProduct> Products { get; set; } = [];
}

public class MarketingLogEntry
{
    public long Id { get; set; }
    public string TemplateCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Error { get; set; }
    public DateTime SentAt { get; set; }
}

public class MarketingAudienceStats
{
    public int ConsentedContacts { get; set; }
    public int Unsubscribed { get; set; }
}
