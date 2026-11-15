using System.Globalization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

/// <summary>
/// Automated marketing emails in the recipient's language (Macedonian, or Albanian when the customer uses the site in Albanian):
///   * welcome: offers and deals for new accounts,
///   * abandoned_checkout: reached checkout but did not order,
///   * replenishment: the product bought runs out (Servings × quantity days after the order),
///   * new_discount: an automatic discount (Admin → Discounts) started; everyone with consent hears about it once.
/// Each template has its own send time in Skopje time; the scheduler (ProteiniSi.Reports "marketing",
/// every 15 minutes) sends a template once a day, in the first run at or after its send time.
/// Only people with marketing consent are emailed, at most one marketing email per person per day.
/// Real sends require Marketing:Enabled=true (prod only); Marketing:AllowedRecipients limits who can get them.
/// Marketing:RedirectAllTo, when set, sends every marketing email (scheduled and admin test) to that one
/// address instead of the real recipient, so no customer is emailed while it is set.
/// </summary>
public class MarketingAutomationService(
    IMarketingAutomationProvider provider,
    ICartProvider cartProvider,
    IEmailSender emailSender,
    IConfiguration config,
    ILogger<MarketingAutomationService> logger) : IMarketingAutomationService
{
    private const int FeaturedCount = 4;
    private const int WelcomeMaxAgeDays = 3;
    private const int AbandonedMaxAgeHours = 48;
    private const int MinServings = 14;
    private const int DiscountProductCount = 6;

    private sealed record Outgoing(string Email, int? UserId, IReadOnlyList<string> ReferenceKeys, MarketingEmails.Rendered Mail);

    // ---- consent ---------------------------------------------------------------------------

    public async Task SetConsentAsync(int userId, MarketingConsentDto dto)
    {
        DateTime? givenAt = dto.ConsentGivenAt is { } at ? ToLocal(at) : null;
        await provider.SetConsentAsync(null, userId, dto.Marketing, "cookie_banner", givenAt);
    }

    public async Task SetGuestOrderConsentAsync(string email, DateTime? consentGivenAt)
    {
        // The banner's own time, so a "yes" clicked before an unsubscribe never re-subscribes anyone.
        DateTime? givenAt = consentGivenAt is { } at ? ToLocal(at) : null;
        await provider.SetConsentAsync(email.Trim().ToLowerInvariant(), null, true, "guest_order", givenAt);
    }

    public async Task<bool> UnsubscribeAsync(string? email, string? token)
    {
        if (!UnsubscribeToken.Verify(email, token, TokenKey)) return false;
        await provider.SetConsentAsync(email!.Trim().ToLowerInvariant(), null, false, "unsubscribe", null);
        logger.LogInformation("Marketing unsubscribe for {Email}", EmailMask.Mask(email));
        return true;
    }

    // ---- scheduled run ---------------------------------------------------------------------

    public async Task<List<MarketingRunResult>> RunAsync(MarketingRunOptions options, CancellationToken cancellationToken = default)
    {
        var testing = options.DryRunDirectory != null || options.RedirectTo != null;
        var enabled = config.GetValue<bool>("Marketing:Enabled");
        var allowed = AllowedRecipients();
        var redirectAll = RedirectAllTo;
        var maxPerRun = config.GetValue<int?>("Marketing:MaxPerRun") ?? 200;
        var delay = TimeSpan.FromMilliseconds(config.GetValue<int?>("Marketing:SendDelayMs") ?? 1500);
        var window = TimeSpan.FromHours(config.GetValue<double?>("Marketing:WindowHours") ?? 3);
        var now = LocalNow();
        var results = new List<MarketingRunResult>();
        List<FeaturedProduct>? featured = null;

        foreach (var template in await provider.GetTemplatesAsync())
        {
            if (options.Only != null && !string.Equals(options.Only, template.Code, StringComparison.OrdinalIgnoreCase)) continue;
            var result = new MarketingRunResult { TemplateCode = template.Code };
            results.Add(result);

            if (!testing)
            {
                if (!template.IsActive) { result.Outcome = "inactive"; continue; }
                var inWindow = now.TimeOfDay >= template.SendTime && now.TimeOfDay < template.SendTime + window;
                if (!inWindow && !options.Force) { result.Outcome = $"waiting for {template.SendTime:hh\\:mm}"; continue; }
                if (!enabled) { result.Outcome = "disabled (Marketing:Enabled is false)"; continue; }
                if (!await provider.TryClaimRunAsync(template.Code, DateOnly.FromDateTime(now), options.Force))
                {
                    result.Outcome = "already ran today";
                    continue;
                }
            }

            featured ??= await provider.GetFeaturedProductsAsync(FeaturedCount);
            List<Outgoing> outgoing;
            try
            {
                outgoing = await BuildAsync(template, featured);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Could not build marketing emails for {Template}", template.Code);
                result.Outcome = "error: " + ex.Message;
                continue;
            }

            result.Candidates = outgoing.Count;
            if (options.RedirectTo != null) outgoing = outgoing.Take(1).ToList();
            else if (outgoing.Count > maxPerRun)
            {
                result.Skipped += outgoing.Count - maxPerRun;
                outgoing = outgoing.Take(maxPerRun).ToList();
            }

            foreach (var mail in outgoing)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (options.DryRunDirectory != null)
                {
                    Directory.CreateDirectory(options.DryRunDirectory);
                    var file = Path.Combine(options.DryRunDirectory, $"{template.Code}-{result.Sent + 1:00}-{Safe(mail.Email)}.html");
                    await File.WriteAllTextAsync(file, mail.Mail.Html, cancellationToken);
                    result.Sent++;
                    continue;
                }

                var redirect = options.RedirectTo ?? redirectAll;
                var to = redirect ?? mail.Email;
                if (redirect == null && allowed.Count > 0 && !allowed.Contains(to)) { result.Skipped++; continue; }

                var subject = redirect != null ? $"[ТЕСТ → {mail.Email}] {mail.Mail.Subject}" : mail.Mail.Subject;
                var send = await emailSender.SendMarketingAsync(to, subject, mail.Mail.Html, mail.Mail.Text,
                    UnsubscribePageUrl(to), OneClickUrl(to));

                if (options.RedirectTo == null)
                {
                    foreach (var key in mail.ReferenceKeys)
                        await provider.TryLogAsync(template.Code, mail.Email, mail.UserId, key,
                            send.Success ? "sent" : "failed", send.Success ? null : send.Message);
                }

                if (send.Success) result.Sent++; else result.Failed++;
                if (delay > TimeSpan.Zero) await Task.Delay(delay, cancellationToken);
            }

            result.Outcome = options.DryRunDirectory != null ? "dry run" : options.RedirectTo != null ? "test" : "sent";
            logger.LogInformation("Marketing {Template}: {Outcome}, {Candidates} candidates, {Sent} sent, {Failed} failed, {Skipped} skipped",
                template.Code, result.Outcome, result.Candidates, result.Sent, result.Failed, result.Skipped);
        }

        return results;
    }

    private async Task<List<Outgoing>> BuildAsync(MarketingEmailTemplate template, List<FeaturedProduct> featured)
    {
        var cap = config.GetValue<int?>("Marketing:CapHours") ?? 20;
        var list = new List<Outgoing>();

        switch (template.Code)
        {
            case MarketingEmailTemplate.Welcome:
                foreach (var r in await provider.GetWelcomeRecipientsAsync(Math.Max(0, template.DelayValue), WelcomeMaxAgeDays, cap))
                    list.Add(new Outgoing(r.Email, r.UserId, [r.ReferenceKey],
                        Render(template, r.Email, r.FullName, r.Language, featured: featured)));
                break;

            case MarketingEmailTemplate.AbandonedCheckout:
                foreach (var r in await provider.GetAbandonedCheckoutsAsync(Math.Max(1, template.DelayValue), AbandonedMaxAgeHours, cap))
                {
                    var cart = r.UserId is { } userId ? await SafeCartAsync(userId) : [];
                    list.Add(new Outgoing(r.Email, r.UserId, [r.ReferenceKey],
                        Render(template, r.Email, r.FullName, r.Language, cart: cart)));
                }
                break;

            case MarketingEmailTemplate.Replenishment:
                var items = await provider.GetReplenishmentsAsync(Math.Max(0, template.DelayValue), MinServings, cap);
                foreach (var person in items.GroupBy(i => i.Email, StringComparer.OrdinalIgnoreCase))
                {
                    // One line per product (several flavours of the same product are one reminder).
                    var products = person.GroupBy(i => i.ProductId)
                        .Select(g => g.OrderBy(i => i.RunOutDate).First())
                        .OrderBy(i => i.RunOutDate)
                        .Take(4)
                        .ToList();
                    var keys = person.Select(i => i.ReferenceKey).Distinct().ToList();
                    var first = person.First();
                    list.Add(new Outgoing(person.Key, first.UserId, keys,
                        Render(template, person.Key, first.FullName, first.Language, runningOut: products)));
                }
                break;

            case MarketingEmailTemplate.NewDiscount:
                var rows = await provider.GetNewDiscountRecipientsAsync(Math.Max(1, template.DelayValue), cap);
                var discounts = new Dictionary<int, MarketingDiscount>();
                foreach (var id in rows.Select(r => r.DiscountId).Distinct())
                {
                    // A discount with nothing left to show (e.g. every product out of stock) is not announced.
                    if (await provider.GetDiscountProductsAsync(id, DiscountProductCount) is { Products.Count: > 0 } d)
                        discounts[id] = d;
                }
                // One email per person, even when several discounts started at once.
                foreach (var person in rows.Where(r => discounts.ContainsKey(r.DiscountId))
                             .GroupBy(r => r.Email, StringComparer.OrdinalIgnoreCase))
                {
                    var first = person.First();
                    var theirs = person.Select(r => discounts[r.DiscountId]).DistinctBy(d => d.DiscountId).ToList();
                    list.Add(new Outgoing(person.Key, first.UserId, person.Select(r => r.ReferenceKey).Distinct().ToList(),
                        Render(template, person.Key, first.FullName, first.Language, discounts: theirs)));
                }
                break;
        }

        return list;
    }

    private async Task<IReadOnlyList<CartItem>> SafeCartAsync(int userId)
    {
        try
        {
            var (_, items) = await cartProvider.GetByUserAsync(userId);
            return items.Take(4).ToList();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not load the cart of user {UserId} for the abandoned checkout email", userId);
            return [];
        }
    }

    private MarketingEmails.Rendered Render(MarketingEmailTemplate template, string email, string? fullName, string? language,
        IReadOnlyList<FeaturedProduct>? featured = null, IReadOnlyList<CartItem>? cart = null, IReadOnlyList<ReplenishmentItem>? runningOut = null,
        IReadOnlyList<MarketingDiscount>? discounts = null) =>
        MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = template,
            FullName = fullName,
            Language = language,
            SiteUrl = FrontendUrl,
            AssetUrl = BackendUrl,
            UnsubscribeUrl = UnsubscribePageUrl(email),
            Featured = featured ?? [],
            Cart = cart ?? [],
            RunningOut = runningOut ?? [],
            Discounts = discounts ?? []
        });

    // ---- admin -----------------------------------------------------------------------------

    public async Task<List<MarketingTemplateDto>> GetTemplatesAsync() =>
        (await provider.GetTemplatesAsync()).Select(ToDto).ToList();

    public async Task<(MarketingTemplateDto? Template, string? Error)> UpdateTemplateAsync(string code, MarketingTemplateUpdateDto dto, string? updatedBy)
    {
        var current = (await provider.GetTemplatesAsync()).FirstOrDefault(t => t.Code == code);
        if (current == null) return (null, "Template not found.");

        var (updated, error) = Apply(current, dto);
        if (error != null) return (null, error);

        await provider.UpdateTemplateAsync(updated!, updatedBy);
        var saved = (await provider.GetTemplatesAsync()).First(t => t.Code == code);
        return (ToDto(saved), null);
    }

    public async Task<(MarketingPreviewDto? Preview, string? Error)> PreviewAsync(string code, MarketingTemplateUpdateDto? draft)
    {
        var (template, error) = await LoadDraftAsync(code, draft);
        if (template == null) return (null, error);
        var mail = await RenderSampleAsync(template, null, draft?.Language);
        return (new MarketingPreviewDto(mail.Subject, mail.Html), null);
    }

    public async Task<(bool Success, string Message)> SendTestAsync(string code, MarketingTemplateUpdateDto? draft, string toEmail, string? toName)
    {
        var (template, error) = await LoadDraftAsync(code, draft);
        if (template == null) return (false, error ?? "Template not found.");

        var mail = await RenderSampleAsync(template, toName, draft?.Language, toEmail);
        toEmail = RedirectAllTo ?? toEmail;
        var result = await emailSender.SendMarketingAsync(toEmail, (EmailLanguage.IsAlbanian(draft?.Language) ? "[TEST] " : "[ТЕСТ] ") + mail.Subject, mail.Html, mail.Text,
            UnsubscribePageUrl(toEmail), OneClickUrl(toEmail));
        return result.Success ? (true, $"Test email sent to {toEmail}.") : (false, result.Message ?? "Sending failed.");
    }

    public async Task<object> GetLogAsync(int top)
    {
        var (entries, stats) = await provider.GetRecentLogAsync(Math.Clamp(top, 1, 500));
        return new
        {
            entries,
            stats.ConsentedContacts,
            stats.Unsubscribed,
            enabled = config.GetValue<bool>("Marketing:Enabled"),
            allowedRecipients = AllowedRecipients().Count,
            redirectAllTo = RedirectAllTo,
            timeZone = TimeZoneId,
            localTime = LocalNow().ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture)
        };
    }

    private async Task<(MarketingEmailTemplate? Template, string? Error)> LoadDraftAsync(string code, MarketingTemplateUpdateDto? draft)
    {
        var current = (await provider.GetTemplatesAsync()).FirstOrDefault(t => t.Code == code);
        if (current == null) return (null, "Template not found.");
        return draft == null ? (current, null) : Apply(current, draft);
    }

    /// <summary>Renders a template with sample data (real on-sale products) for the admin preview and test sends.</summary>
    private async Task<MarketingEmails.Rendered> RenderSampleAsync(MarketingEmailTemplate template, string? name, string? language, string? email = null)
    {
        var featured = await provider.GetFeaturedProductsAsync(FeaturedCount);
        var today = LocalNow().Date;
        var sampleCart = featured.Take(2).Select((p, i) => new CartItem
        {
            Product_Id = p.ProductId,
            Product_Name = p.ProductName,
            Product_Img = p.ProductImg,
            Price = p.SalePrice ?? p.Price,
            Quantity = i + 1
        }).ToList();
        var sampleRunOut = featured.Take(1).Select(p => new ReplenishmentItem
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            ProductImg = p.ProductImg,
            Servings = 60,
            Quantity = 1,
            OrderDate = today.AddDays(template.DelayValue - 60),
            RunOutDate = today.AddDays(template.DelayValue)
        }).ToList();
        var onSale = featured.Where(p => p.SalePrice is > 0 && p.SalePrice < p.Price).ToList();
        var sampleDiscount = new MarketingDiscount
        {
            DiscountId = 0,
            Name = EmailLanguage.IsAlbanian(language) ? "Zbritje vjeshte" : "Есенски попуст",
            DiscountType = "percent",
            Percentage = 20,
            EndsOn = today.AddDays(7),
            Products = onSale.Count > 0 ? onSale : featured.Select(p => new FeaturedProduct
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductImg = p.ProductImg,
                Price = p.Price,
                SalePrice = Math.Ceiling(p.Price * 0.8m)
            }).ToList()
        };

        return MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = template,
            FullName = string.IsNullOrWhiteSpace(name) ? (EmailLanguage.IsAlbanian(language) ? "Arta Krasniqi" : "Марија Петровска") : name,
            Language = language,
            SiteUrl = FrontendUrl,
            AssetUrl = BackendUrl,
            UnsubscribeUrl = UnsubscribePageUrl(email ?? "primer@proteini.mk"),
            Featured = template.Code == MarketingEmailTemplate.Welcome ? featured : [],
            Cart = template.Code == MarketingEmailTemplate.AbandonedCheckout ? sampleCart : [],
            RunningOut = template.Code == MarketingEmailTemplate.Replenishment ? sampleRunOut : [],
            Discounts = template.Code == MarketingEmailTemplate.NewDiscount ? [sampleDiscount] : []
        });
    }

    /// <summary>Validates an edit and returns a copy of the template with it applied.</summary>
    public static (MarketingEmailTemplate? Template, string? Error) Apply(MarketingEmailTemplate current, MarketingTemplateUpdateDto dto)
    {
        if (!TimeSpan.TryParseExact(dto.SendTime?.Trim(), [@"hh\:mm", @"hh\:mm\:ss", @"h\:mm"], CultureInfo.InvariantCulture, out var sendTime))
            return (null, "Send time must look like 15:00.");
        if (sendTime < TimeSpan.FromHours(8) || sendTime > TimeSpan.FromHours(20))
            return (null, "Send time must be between 08:00 and 20:00 (Skopje time).");

        var (min, max, unit) = current.Code switch
        {
            MarketingEmailTemplate.Welcome => (0, 48, "hours"),
            MarketingEmailTemplate.AbandonedCheckout => (1, 47, "hours"),
            MarketingEmailTemplate.Replenishment => (0, 30, "days"),
            MarketingEmailTemplate.NewDiscount => (1, 14, "days"),
            _ => (0, 365, "")
        };
        if (dto.DelayValue < min || dto.DelayValue > max)
            return (null, $"Delay must be between {min} and {max} {unit}.");

        if (string.IsNullOrWhiteSpace(dto.Subject) || dto.Subject.Length > 200) return (null, "Subject is required (max 200 characters).");
        if (string.IsNullOrWhiteSpace(dto.Heading) || dto.Heading.Length > 200) return (null, "Heading is required (max 200 characters).");
        if (string.IsNullOrWhiteSpace(dto.Body) || dto.Body.Length > 4000) return (null, "Text is required (max 4000 characters).");
        if (string.IsNullOrWhiteSpace(dto.ButtonText) || dto.ButtonText.Length > 60) return (null, "Button text is required (max 60 characters).");
        if (dto.Preheader?.Length > 300) return (null, "Preview text is too long (max 300 characters).");
        if (dto.CouponText?.Length > 300) return (null, "Coupon text is too long (max 300 characters).");
        if (dto.CouponCode?.Trim().Length > 50) return (null, "Coupon code is too long (max 50 characters).");
        if (dto.SubjectAl?.Length > 200) return (null, "Albanian subject is too long (max 200 characters).");
        if (dto.HeadingAl?.Length > 200) return (null, "Albanian heading is too long (max 200 characters).");
        if (dto.BodyAl?.Length > 4000) return (null, "Albanian text is too long (max 4000 characters).");
        if (dto.ButtonTextAl?.Length > 60) return (null, "Albanian button text is too long (max 60 characters).");
        if (dto.PreheaderAl?.Length > 300) return (null, "Albanian preview text is too long (max 300 characters).");
        if (dto.CouponTextAl?.Length > 300) return (null, "Albanian coupon text is too long (max 300 characters).");
        var url = string.IsNullOrWhiteSpace(dto.ButtonUrl) ? null : dto.ButtonUrl.Trim();
        if (url != null && (url.Length > 300 || !(url.StartsWith('/') || url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))))
            return (null, "Button link must start with / (a page of the shop) or https://.");

        return (new MarketingEmailTemplate
        {
            Code = current.Code,
            Name = current.Name,
            IsActive = dto.IsActive,
            SendTime = sendTime,
            DelayValue = dto.DelayValue,
            Subject = dto.Subject.Trim(),
            Preheader = NullIfEmpty(dto.Preheader),
            Heading = dto.Heading.Trim(),
            Body = dto.Body.Trim(),
            ButtonText = dto.ButtonText.Trim(),
            ButtonUrl = url,
            CouponCode = NullIfEmpty(dto.CouponCode)?.ToUpperInvariant(),
            CouponText = NullIfEmpty(dto.CouponText),
            SubjectAl = NullIfEmpty(dto.SubjectAl),
            PreheaderAl = NullIfEmpty(dto.PreheaderAl),
            HeadingAl = NullIfEmpty(dto.HeadingAl),
            BodyAl = NullIfEmpty(dto.BodyAl),
            ButtonTextAl = NullIfEmpty(dto.ButtonTextAl),
            CouponTextAl = NullIfEmpty(dto.CouponTextAl),
            UpdatedAt = current.UpdatedAt,
            UpdatedBy = current.UpdatedBy
        }, null);
    }

    private static MarketingTemplateDto ToDto(MarketingEmailTemplate t) => new()
    {
        Code = t.Code,
        Name = t.Name,
        IsActive = t.IsActive,
        SendTime = t.SendTime.ToString(@"hh\:mm", CultureInfo.InvariantCulture),
        DelayValue = t.DelayValue,
        Subject = t.Subject,
        Preheader = t.Preheader,
        Heading = t.Heading,
        Body = t.Body,
        ButtonText = t.ButtonText,
        ButtonUrl = t.ButtonUrl,
        CouponCode = t.CouponCode,
        CouponText = t.CouponText,
        SubjectAl = t.SubjectAl,
        PreheaderAl = t.PreheaderAl,
        HeadingAl = t.HeadingAl,
        BodyAl = t.BodyAl,
        ButtonTextAl = t.ButtonTextAl,
        CouponTextAl = t.CouponTextAl,
        UpdatedAt = t.UpdatedAt,
        UpdatedBy = t.UpdatedBy,
        SentLast30Days = t.SentLast30Days,
        SentTotal = t.SentTotal,
        LastSentAt = t.LastSentAt
    };

    // ---- helpers ---------------------------------------------------------------------------

    private string FrontendUrl => (config["AppSettings:FrontendUrl"] ?? EmailLayout.SiteUrl).TrimEnd('/');
    private string BackendUrl => (config["AppSettings:BackendUrl"] ?? FrontendUrl).TrimEnd('/');
    private string TokenKey => config["AppSettings:TokenKey"] is { Length: > 0 } key
        ? key
        : throw new InvalidOperationException("AppSettings:TokenKey is not configured.");
    private string TimeZoneId => config["Marketing:TimeZone"] ?? "Europe/Skopje";

    private string Query(string email) =>
        $"e={Uri.EscapeDataString(email.Trim().ToLowerInvariant())}&t={UnsubscribeToken.Create(email, TokenKey)}";

    private string UnsubscribePageUrl(string email) => $"{FrontendUrl}/unsubscribe?{Query(email)}";
    private string OneClickUrl(string email) => $"{BackendUrl}/api/Marketing/unsubscribe/one-click?{Query(email)}";

    private string? RedirectAllTo => config["Marketing:RedirectAllTo"] is { } v && !string.IsNullOrWhiteSpace(v) ? v.Trim() : null;

    private HashSet<string> AllowedRecipients()
    {
        var section = config.GetSection("Marketing:AllowedRecipients");
        var values = section.GetChildren().Select(c => c.Value).ToList();
        if (values.Count == 0) values = (section.Value ?? string.Empty).Split(',', ';').ToList<string?>();
        return values.Where(v => !string.IsNullOrWhiteSpace(v))
            .Select(v => v!.Trim().ToLowerInvariant())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private TimeZoneInfo Zone()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById(TimeZoneId); }
        catch (TimeZoneNotFoundException) { return TimeZoneInfo.Local; }
    }

    private DateTime LocalNow() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Zone());

    private DateTime ToLocal(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => TimeZoneInfo.ConvertTimeFromUtc(value, Zone()),
        DateTimeKind.Local => TimeZoneInfo.ConvertTime(value, Zone()),
        _ => value
    };

    private static string? NullIfEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string Safe(string email) =>
        new string(email.Select(c => char.IsLetterOrDigit(c) ? c : '_').ToArray());
}
