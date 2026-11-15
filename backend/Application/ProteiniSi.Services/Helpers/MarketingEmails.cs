using System.Globalization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using ProteiniSi.Models;
using static ProteiniSi.Services.Helpers.EmailLayout;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Renders the automated marketing emails in the same branded layout as the order emails, in Macedonian
/// or Albanian (the recipient's language). Template copy comes from the database (the *Al fields for
/// Albanian, each falling back to the Macedonian text when empty) and may use the placeholders
/// {ime} (first name), {proizvod} (product name, replenishment), {kod} (coupon code), and for new_discount
/// {popust} (discount name) and {procent} (biggest saving, e.g. "20%").
/// </summary>
public static partial class MarketingEmails
{
    public const string FallbackName = "пријателе";

    /// <summary>Fixed text of the marketing layout (everything that is not template copy).</summary>
    public sealed record Copy
    {
        public required string Language { get; init; }
        public required string FallbackName { get; init; }
        public required string[] Months { get; init; }
        public required string Location { get; init; }
        public required string CouponLabel { get; init; }
        public required string OnSale { get; init; }
        public required string InYourCart { get; init; }
        public required string YourProduct { get; init; }
        public required string YourProducts { get; init; }
        public required string ProductWord { get; init; }
        public required string And { get; init; }
        /// <summary>{0} = first product, {1} = how many more.</summary>
        public required string AndMore { get; init; }
        public required string Currency { get; init; }
        public required string BadgeWelcome { get; init; }
        public required string BadgeAbandoned { get; init; }
        public required string BadgeReplenishment { get; init; }
        public required string BadgeNewDiscount { get; init; }
        /// <summary>{0} = last day of the discount.</summary>
        public required string ValidUntil { get; init; }
        /// <summary>{0} = order date, {1} = doses, {2} = run-out date.</summary>
        public required string RunningOutDetail { get; init; }
        /// <summary>{0} = run-out date.</summary>
        public required string RunsOutAround { get; init; }
        public required string OrderAgain { get; init; }
        public required string TrustPayment { get; init; }
        public required string TrustPaymentValue { get; init; }
        public required string TrustDelivery { get; init; }
        public required string TrustDeliveryValue { get; init; }
        public required string TrustProducts { get; init; }
        public required string TrustProductsValue { get; init; }
        public required string UnsubscribeReason { get; init; }
        public required string UnsubscribeLink { get; init; }
        public required string UnsubscribeText { get; init; }
    }

    public static readonly Copy Macedonian = new()
    {
        Language = EmailLanguage.Macedonian,
        FallbackName = "пријателе",
        Months = ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"],
        Location = "Proteini.si · Скопје, Македонија",
        CouponLabel = "Код за попуст",
        OnSale = "Моментално на попуст",
        InYourCart = "Во твојата кошничка",
        YourProduct = "Твојот производ",
        YourProducts = "Твоите производи",
        ProductWord = "производ",
        And = "и",
        AndMore = "{0} и уште {1} производи",
        Currency = "ден.",
        BadgeWelcome = "Добредојде",
        BadgeAbandoned = "Те чекаме",
        BadgeReplenishment = "Време за нова залиха",
        BadgeNewDiscount = "Нов попуст",
        ValidUntil = "Важи до {0}",
        RunningOutDetail = "Нарачано на {0} · {1} дози · <strong>заврши околу {2}</strong>",
        RunsOutAround = "заврши околу {0}",
        OrderAgain = "Нарачај повторно →",
        TrustPayment = "Плаќање",
        TrustPaymentValue = "Со картичка или во готово при достава",
        TrustDelivery = "Достава",
        TrustDeliveryValue = "Низ цела Македонија",
        TrustProducts = "Производи",
        TrustProductsValue = "100% оригинални",
        UnsubscribeReason = "Ја добиваш оваа порака бидејќи се согласи да добиваш понуди и известувања од Proteini.si.",
        UnsubscribeLink = "Одјави се од маркетинг пораките",
        UnsubscribeText = "Одјава од маркетинг пораките"
    };

    public static readonly Copy Albanian = new()
    {
        Language = EmailLanguage.Albanian,
        FallbackName = "mik",
        Months = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
        Location = "Proteini.si · Shkup, Maqedoni",
        CouponLabel = "Kodi i zbritjes",
        OnSale = "Aktualisht në zbritje",
        InYourCart = "Në shportën tënde",
        YourProduct = "Produkti yt",
        YourProducts = "Produktet e tua",
        ProductWord = "produkti",
        And = "dhe",
        AndMore = "{0} dhe {1} produkte të tjera",
        Currency = "den.",
        BadgeWelcome = "Mirë se erdhe",
        BadgeAbandoned = "Të presim",
        BadgeReplenishment = "Koha për furnizim të ri",
        BadgeNewDiscount = "Zbritje e re",
        ValidUntil = "Vlen deri më {0}",
        RunningOutDetail = "Porositur më {0} · {1} doza · <strong>mbaron rreth {2}</strong>",
        RunsOutAround = "mbaron rreth {0}",
        OrderAgain = "Porosit përsëri →",
        TrustPayment = "Pagesa",
        TrustPaymentValue = "Me kartelë ose me para në dorë në dorëzim",
        TrustDelivery = "Dorëzimi",
        TrustDeliveryValue = "Në gjithë Maqedoninë",
        TrustProducts = "Produktet",
        TrustProductsValue = "100% origjinale",
        UnsubscribeReason = "E merr këtë mesazh sepse pranove të marrësh oferta dhe njoftime nga Proteini.si.",
        UnsubscribeLink = "Çregjistrohu nga mesazhet e marketingut",
        UnsubscribeText = "Çregjistrim nga mesazhet e marketingut"
    };

    public static Copy CopyFor(string? language) => EmailLanguage.IsAlbanian(language) ? Albanian : Macedonian;

    /// <summary>The template text in the given language (Albanian falls back to Macedonian per field when empty).</summary>
    public static MarketingEmailTemplate Localize(MarketingEmailTemplate t, string? language)
    {
        if (!EmailLanguage.IsAlbanian(language)) return t;
        static string Pick(string? al, string mk) => string.IsNullOrWhiteSpace(al) ? mk : al;
        static string? PickOptional(string? al, string? mk) => string.IsNullOrWhiteSpace(al) ? mk : al;
        return new MarketingEmailTemplate
        {
            Code = t.Code,
            Name = t.Name,
            IsActive = t.IsActive,
            SendTime = t.SendTime,
            DelayValue = t.DelayValue,
            Subject = Pick(t.SubjectAl, t.Subject),
            Preheader = PickOptional(t.PreheaderAl, t.Preheader),
            Heading = Pick(t.HeadingAl, t.Heading),
            Body = Pick(t.BodyAl, t.Body),
            ButtonText = Pick(t.ButtonTextAl, t.ButtonText),
            ButtonUrl = t.ButtonUrl,
            CouponCode = t.CouponCode,
            CouponText = PickOptional(t.CouponTextAl, t.CouponText),
            SubjectAl = t.SubjectAl,
            PreheaderAl = t.PreheaderAl,
            HeadingAl = t.HeadingAl,
            BodyAl = t.BodyAl,
            ButtonTextAl = t.ButtonTextAl,
            CouponTextAl = t.CouponTextAl,
            UpdatedAt = t.UpdatedAt,
            UpdatedBy = t.UpdatedBy,
            SentLast30Days = t.SentLast30Days,
            LastSentAt = t.LastSentAt
        };
    }

    public sealed class Context
    {
        public required MarketingEmailTemplate Template { get; init; }
        public string? FullName { get; init; }
        /// <summary>Recipient language: "mk" (default) or "al".</summary>
        public string? Language { get; init; }
        /// <summary>Storefront base URL (links).</summary>
        public string SiteUrl { get; init; } = EmailLayout.SiteUrl;
        /// <summary>Where relative product images are served from.</summary>
        public string AssetUrl { get; init; } = EmailLayout.SiteUrl;
        public string UnsubscribeUrl { get; init; } = EmailLayout.SiteUrl + "/unsubscribe";
        /// <summary>Offers grid (welcome): on-sale products.</summary>
        public IReadOnlyList<FeaturedProduct> Featured { get; init; } = [];
        /// <summary>The signed-in customer's cart (abandoned checkout), when known.</summary>
        public IReadOnlyList<CartItem> Cart { get; init; } = [];
        /// <summary>Products running out (replenishment), one per product.</summary>
        public IReadOnlyList<ReplenishmentItem> RunningOut { get; init; } = [];
        /// <summary>New automatic discounts with their products (new_discount).</summary>
        public IReadOnlyList<MarketingDiscount> Discounts { get; init; } = [];
    }

    public sealed record Rendered(string Subject, string Html, string Text);

    [GeneratedRegex(@"\r?\n\s*\r?\n")]
    private static partial Regex BlankLine();

    public static Rendered Render(Context ctx)
    {
        var c = CopyFor(ctx.Language);
        var t = Localize(ctx.Template, ctx.Language);
        var name = FirstName(ctx.FullName, c);
        var product = ProductPhrase(ctx.RunningOut, c);
        var discountNames = NamePhrase(ctx.Discounts.Select(d => d.Name).ToList(), c);
        var percent = BiggestPercent(ctx.Discounts) is { } pct ? pct.ToString(CultureInfo.InvariantCulture) + "%" : string.Empty;
        string Fill(string? text) => (text ?? string.Empty)
            .Replace("{ime}", name, StringComparison.OrdinalIgnoreCase)
            .Replace("{proizvod}", product, StringComparison.OrdinalIgnoreCase)
            .Replace("{popust}", discountNames, StringComparison.OrdinalIgnoreCase)
            .Replace("{procent}", percent, StringComparison.OrdinalIgnoreCase)
            .Replace("{kod}", t.CouponCode ?? string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim();

        var subject = Fill(t.Subject);
        var heading = Fill(t.Heading);
        var paragraphs = BlankLine().Split(Fill(t.Body)).Select(p => p.Trim()).Where(p => p.Length > 0).ToList();
        var buttonUrl = Link(ctx, ResolveButtonUrl(t, ctx.RunningOut));
        var text = new StringBuilder();
        text.AppendLine(heading.ToUpper(CultureInfo.InvariantCulture)).AppendLine();
        foreach (var p in paragraphs) text.AppendLine(p).AppendLine();

        var rows = new StringBuilder();
        rows.Append(Hero(heading, BadgeFor(t.Code, c), Tone.Yellow,
            paragraphs.Select(p => Encode(p).Replace("\r\n", "<br>").Replace("\n", "<br>")).ToArray()));

        if (!string.IsNullOrWhiteSpace(t.CouponCode))
        {
            rows.Append(Row(Coupon(t.CouponCode!, Fill(t.CouponText), c)));
            text.AppendLine($"{c.CouponLabel}: {t.CouponCode}").AppendLine(Fill(t.CouponText)).AppendLine();
        }

        switch (t.Code)
        {
            case MarketingEmailTemplate.Welcome when ctx.Featured.Count > 0:
                rows.Append(Row(SectionTitle(c.OnSale) + ProductGrid(ctx, ctx.Featured, c)));
                foreach (var p in ctx.Featured)
                    text.AppendLine($"- {p.ProductName}: {Price(p.SalePrice ?? p.Price, c)}: {Link(ctx, "/product/" + p.ProductId)}");
                text.AppendLine();
                break;
            case MarketingEmailTemplate.AbandonedCheckout when ctx.Cart.Count > 0:
                rows.Append(Row(SectionTitle(c.InYourCart) + CartList(ctx, c)));
                foreach (var item in ctx.Cart)
                    text.AppendLine($"- {item.Product_Name} {item.Variant_Name} × {item.Quantity}");
                text.AppendLine();
                break;
            case MarketingEmailTemplate.Replenishment when ctx.RunningOut.Count > 0:
                rows.Append(Row(SectionTitle(ctx.RunningOut.Count == 1 ? c.YourProduct : c.YourProducts) + RunningOutList(ctx, c)));
                foreach (var r in ctx.RunningOut)
                    text.AppendLine($"- {r.ProductName} {r.VariantName}, {string.Format(c.RunsOutAround, Date(r.RunOutDate, c))}: {Link(ctx, "/product/" + r.ProductId)}");
                text.AppendLine();
                break;
            case MarketingEmailTemplate.NewDiscount when ctx.Discounts.Count > 0:
                foreach (var d in ctx.Discounts.Where(d => d.Products.Count > 0))
                {
                    var until = d.EndsOn is { } end ? string.Format(c.ValidUntil, Date(end, c)) : null;
                    var note = until == null ? "" :
                        $"<div style='margin:-6px 0 12px 0; font-size:13px; line-height:19px; color:{Muted};'>{Encode(until)}</div>";
                    rows.Append(Row(SectionTitle(d.Name) + note + ProductGrid(ctx, d.Products, c)));
                    text.AppendLine(d.Name.ToUpper(CultureInfo.InvariantCulture) + (until == null ? "" : $" ({until})"));
                    foreach (var p in d.Products)
                        text.AppendLine($"- {p.ProductName}: {Price(p.SalePrice ?? p.Price, c)}: {Link(ctx, "/product/" + p.ProductId)}");
                    text.AppendLine();
                }
                break;
        }

        rows.Append(Row(Button(buttonUrl, Fill(t.ButtonText)), "6px 36px 30px 36px"));
        if (t.Code == MarketingEmailTemplate.AbandonedCheckout)
            rows.Append(Row(Trust(c)));
        text.AppendLine($"{Fill(t.ButtonText)}: {buttonUrl}").AppendLine();

        var unsubscribe = $"{Encode(c.UnsubscribeReason)} " +
                          $"<a href='{Encode(ctx.UnsubscribeUrl)}' target='_blank' style='color:#6b6b63; text-decoration:underline;'>{Encode(c.UnsubscribeLink)}</a>";
        text.AppendLine("--").AppendLine("Proteini.si · proteini.mk · +389 71 399 036")
            .AppendLine($"{c.UnsubscribeText}: {ctx.UnsubscribeUrl}");

        var html = Page(subject, Fill(t.Preheader), rows.ToString(), locationLine: c.Location, unsubscribeHtml: unsubscribe, language: c.Language);
        return new Rendered(subject, html, text.ToString());
    }

    public static string FirstName(string? fullName, Copy? copy = null)
    {
        var first = (fullName ?? string.Empty).Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        if (string.IsNullOrWhiteSpace(first) || first.Contains('@')) return (copy ?? Macedonian).FallbackName;
        return first.Length > 1 && first.All(c => !char.IsLetter(c) || char.IsUpper(c))
            ? char.ToUpper(first[0], CultureInfo.InvariantCulture) + first[1..].ToLower(CultureInfo.InvariantCulture)
            : first;
    }

    /// <summary>"CREMRISO", "CREMRISO и WHEY", "CREMRISO и уште 2 производи".</summary>
    public static string ProductPhrase(IReadOnlyList<ReplenishmentItem> items, Copy? copy = null)
    {
        var c = copy ?? Macedonian;
        return items.Count switch
        {
            0 => c.ProductWord,
            1 => items[0].ProductName,
            2 => $"{items[0].ProductName} {c.And} {items[1].ProductName}",
            _ => string.Format(c.AndMore, items[0].ProductName, items.Count - 1)
        };
    }

    /// <summary>"Есенски попуст", "A и B", "A, B и C".</summary>
    public static string NamePhrase(IReadOnlyList<string> names, Copy? copy = null)
    {
        var c = copy ?? Macedonian;
        return names.Count switch
        {
            0 => string.Empty,
            1 => names[0],
            _ => string.Join(", ", names.Take(names.Count - 1)) + $" {c.And} " + names[^1]
        };
    }

    /// <summary>The biggest saving across the discounts in whole percent: the set percentage, or for new-price
    /// discounts the biggest drop among the listed products (rounded down, so it never over-promises).</summary>
    public static int? BiggestPercent(IReadOnlyList<MarketingDiscount> discounts)
    {
        int? best = null;
        foreach (var d in discounts)
        {
            int? value = d.DiscountType == "percent" && d.Percentage is > 0
                ? (int)Math.Floor(d.Percentage.Value)
                : d.Products.Where(p => p.Price > 0 && p.SalePrice is > 0 && p.SalePrice < p.Price)
                    .Select(p => (int?)(int)Math.Floor((p.Price - p.SalePrice!.Value) / p.Price * 100))
                    .Max();
            if (value is > 0 && (best == null || value > best)) best = value;
        }
        return best;
    }

    public static string Price(decimal value, Copy? copy = null) =>
        value.ToString("#,0", CultureInfo.InvariantCulture).Replace(',', '.') + " " + (copy ?? Macedonian).Currency;

    public static string Date(DateTime value, Copy? copy = null) => $"{value.Day} {(copy ?? Macedonian).Months[value.Month - 1]}";

    /// <summary>Absolute storefront link with campaign tags (relative paths are joined to the site URL).</summary>
    public static string Link(Context ctx, string? url)
    {
        var target = string.IsNullOrWhiteSpace(url) ? "/" : url.Trim();
        if (!target.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            target = ctx.SiteUrl.TrimEnd('/') + (target.StartsWith('/') ? target : "/" + target);
        var separator = target.Contains('?') ? '&' : '?';
        return $"{target}{separator}utm_source=email&utm_medium=email&utm_campaign={WebUtility.UrlEncode(ctx.Template.Code)}";
    }

    private static string ResolveButtonUrl(MarketingEmailTemplate t, IReadOnlyList<ReplenishmentItem> items)
    {
        if (!string.IsNullOrWhiteSpace(t.ButtonUrl)) return t.ButtonUrl!;
        return t.Code == MarketingEmailTemplate.Replenishment && items.Count == 1 ? "/product/" + items[0].ProductId : "/all-products";
    }

    private static string? BadgeFor(string code, Copy c) => code switch
    {
        MarketingEmailTemplate.Welcome => c.BadgeWelcome,
        MarketingEmailTemplate.AbandonedCheckout => c.BadgeAbandoned,
        MarketingEmailTemplate.Replenishment => c.BadgeReplenishment,
        MarketingEmailTemplate.NewDiscount => c.BadgeNewDiscount,
        _ => null
    };

    private static string Image(Context ctx, string? path) =>
        string.IsNullOrWhiteSpace(path) ? ctx.AssetUrl.TrimEnd('/') + "/img/email/proteini-banner.png?v=" + AssetVersion
        : path.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? path
        : ctx.AssetUrl.TrimEnd('/') + (path.StartsWith('/') ? path : "/" + path);

    private static string Coupon(string code, string note, Copy c) =>
        Callout(
            $"<div style='font-size:11px; line-height:15px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:{Muted};'>{Encode(c.CouponLabel)}</div>" +
            $"<div style='margin:6px 0 0 0; font-family:{DisplayFont}; font-size:28px; line-height:32px; font-weight:700; letter-spacing:3px; color:{Ink}; word-break:break-all;'>{Encode(code)}</div>" +
            (string.IsNullOrWhiteSpace(note) ? "" : $"<div style='margin:6px 0 0 0; font-size:13px; line-height:20px; color:{EmailLayout.Body};'>{Encode(note)}</div>"));

    /// <summary>Two products per row (stacks on phones): image, name, price (with the old price struck through when on sale).</summary>
    private static string ProductGrid(Context ctx, IReadOnlyList<FeaturedProduct> products, Copy c)
    {
        var sb = new StringBuilder("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'>");
        for (var i = 0; i < products.Count; i += 2)
        {
            sb.Append("<tr>");
            for (var j = i; j < i + 2; j++)
            {
                var pad = j % 2 == 0 ? "padding:0 7px 14px 0;" : "padding:0 0 14px 7px;";
                if (j >= products.Count) { sb.Append($"<td class='stack' width='50%' style='{pad}'></td>"); continue; }
                var p = products[j];
                var href = Encode(Link(ctx, "/product/" + p.ProductId));
                var onSale = p.SalePrice is > 0 && p.SalePrice < p.Price;
                var price = onSale
                    ? $"<span style='color:#b42318;'>{Price(p.SalePrice!.Value, c)}</span> <span style='font-weight:400; color:{Muted}; text-decoration:line-through; font-size:12px;'>{Price(p.Price, c)}</span>"
                    : Price(p.Price, c);
                sb.Append($"<td class='stack stack-gap' width='50%' valign='top' style='{pad}'>" +
                          $"<a href='{href}' target='_blank' style='display:block; text-decoration:none; color:{Ink}; background:{Paper}; border-radius:12px; padding:14px;'>" +
                          $"<img src='{Encode(Image(ctx, p.ProductImg))}' width='240' alt='{Encode(p.ProductName)}' style='display:block; width:100%; max-width:240px; height:auto; margin:0 auto 10px auto; border:0; border-radius:8px; background:#ffffff;'>" +
                          $"<div style='font-size:13px; line-height:18px; font-weight:700; color:{Ink};'>{Encode(p.ProductName)}</div>" +
                          $"<div style='margin-top:6px; font-size:14px; line-height:20px; font-weight:700; color:{Ink};'>{price}</div>" +
                          "</a></td>");
            }
            sb.Append("</tr>");
        }
        return sb.Append("</table>").ToString();
    }

    private static string ItemRow(Context ctx, string? img, string title, string? subtitle, string detailHtml, string? href, bool last)
    {
        var border = last ? "" : $" border-bottom:1px solid {Line};";
        var titleHtml = href == null ? Encode(title)
            : $"<a href='{Encode(href)}' target='_blank' style='color:{Ink}; text-decoration:none;'>{Encode(title)}</a>";
        return $"<tr><td width='76' valign='top' style='padding:12px 12px 12px 0;{border}'>" +
               $"<img src='{Encode(Image(ctx, img))}' width='64' height='64' alt='' style='display:block; width:64px; height:64px; object-fit:contain; border:0; border-radius:8px; background:{Paper};'></td>" +
               $"<td valign='top' style='padding:12px 0;{border}'>" +
               $"<div style='font-size:14px; line-height:20px; font-weight:700; color:{Ink};'>{titleHtml}</div>" +
               (string.IsNullOrWhiteSpace(subtitle) ? "" : $"<div style='font-size:12px; line-height:17px; color:{Muted};'>{Encode(subtitle)}</div>") +
               $"<div style='margin-top:4px; font-size:13px; line-height:19px; color:{EmailLayout.Body};'>{detailHtml}</div></td></tr>";
    }

    private static string CartList(Context ctx, Copy copy)
    {
        var sb = new StringBuilder("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='border-collapse:collapse;'>");
        for (var i = 0; i < ctx.Cart.Count; i++)
        {
            var c = ctx.Cart[i];
            sb.Append(ItemRow(ctx, c.Product_Img, c.Product_Name ?? c.Display_Name ?? copy.ProductWord, c.Variant_Name,
                $"{c.Quantity} × {Price(c.Price, copy)}", Link(ctx, "/product/" + c.Product_Id), i == ctx.Cart.Count - 1));
        }
        return sb.Append("</table>").ToString();
    }

    private static string RunningOutList(Context ctx, Copy c)
    {
        var sb = new StringBuilder("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='border-collapse:collapse;'>");
        for (var i = 0; i < ctx.RunningOut.Count; i++)
        {
            var r = ctx.RunningOut[i];
            var href = Link(ctx, "/product/" + r.ProductId);
            var doses = r.Servings * r.Quantity;
            var detail = string.Format(c.RunningOutDetail, Date(r.OrderDate, c), doses, Date(r.RunOutDate, c)) +
                         $"<br><a href='{Encode(href)}' target='_blank' style='color:{Ink}; font-weight:700; text-decoration:underline;'>{Encode(c.OrderAgain)}</a>";
            sb.Append(ItemRow(ctx, r.ProductImg, r.ProductName, r.VariantName, detail, href, i == ctx.RunningOut.Count - 1));
        }
        return sb.Append("</table>").ToString();
    }

    private static string Trust(Copy c) =>
        Panel(
            Field(c.TrustPayment, c.TrustPaymentValue, last: true),
            Field(c.TrustDelivery, c.TrustDeliveryValue, last: true),
            Field(c.TrustProducts, c.TrustProductsValue, last: true));
}
