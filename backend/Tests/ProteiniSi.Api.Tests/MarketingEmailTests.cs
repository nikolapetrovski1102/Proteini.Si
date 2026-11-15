using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class MarketingEmailTests
{
    private static MarketingEmailTemplate Template(string code, string? coupon = null) => new()
    {
        Code = code,
        Name = code,
        SendTime = TimeSpan.FromHours(15),
        DelayValue = 5,
        Subject = "{ime}, твојот {proizvod} наскоро ќе заврши",
        Preheader = "Нарачај навреме",
        Heading = "Не останувај без {proizvod}",
        Body = "Здраво {ime}, прв ред.\n\nВтор <пасус> со код {kod}.",
        ButtonText = "Нарачај повторно",
        CouponCode = coupon,
        CouponText = "Попуст со {kod}"
    };

    private static ReplenishmentItem Item(int productId, string name) => new()
    {
        ProductId = productId,
        ProductName = name,
        ProductImg = "/product-images/x.webp",
        Servings = 60,
        Quantity = 1,
        OrderDate = new DateTime(2026, 9, 3),
        RunOutDate = new DateTime(2026, 11, 2)
    };

    [Fact]
    public void ReplenishmentFillsPlaceholdersAndLinksTheProduct()
    {
        var mail = MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = Template(MarketingEmailTemplate.Replenishment, "VRATI10"),
            FullName = "IVANA KOLEVA",
            SiteUrl = "https://stage.proteini.mk",
            AssetUrl = "https://stage.proteini.mk",
            UnsubscribeUrl = "https://stage.proteini.mk/unsubscribe?e=a&t=b",
            RunningOut = [Item(2177, "CREMRISO")]
        });

        Assert.Equal("Ivana, твојот CREMRISO наскоро ќе заврши", mail.Subject);
        Assert.Contains("НЕ ОСТАНУВАЈ БЕЗ CREMRISO", mail.Text);
        Assert.Contains("Втор &lt;пасус&gt; со код VRATI10.", mail.Html);   // body is HTML-encoded
        Assert.Contains("VRATI10", mail.Html);
        Assert.Contains("https://stage.proteini.mk/product/2177?utm_source=email", mail.Html);
        Assert.Contains("https://stage.proteini.mk/product-images/x.webp", mail.Html);
        Assert.Contains("2 ноември", mail.Html);
        Assert.Contains("Одјави се", mail.Html);
        Assert.Contains("unsubscribe?e=a&amp;t=b", mail.Html);
        Assert.Contains("https://stage.proteini.mk/unsubscribe?e=a&t=b", mail.Text);
    }

    [Fact]
    public void MissingNameUsesFriendlyFallback()
    {
        Assert.Equal(MarketingEmails.FallbackName, MarketingEmails.FirstName(null));
        Assert.Equal(MarketingEmails.FallbackName, MarketingEmails.FirstName("someone@gmail.com"));
        Assert.Equal("Бубе", MarketingEmails.FirstName("Бубе Малинова"));
    }

    [Fact]
    public void ProductPhraseAndPrices()
    {
        Assert.Equal("A и B", MarketingEmails.ProductPhrase([Item(1, "A"), Item(2, "B")]));
        Assert.Equal("A и уште 2 производи", MarketingEmails.ProductPhrase([Item(1, "A"), Item(2, "B"), Item(3, "C")]));
        Assert.Equal("3.190 ден.", MarketingEmails.Price(3190m));
        Assert.Equal("590 ден.", MarketingEmails.Price(590m));
    }

    [Fact]
    public void WelcomeShowsOffersWithoutCouponBlockWhenNoCode()
    {
        var mail = MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = Template(MarketingEmailTemplate.Welcome),
            FullName = "Марија",
            Featured = [new FeaturedProduct { ProductId = 7, ProductName = "WHEY", Price = 3990, SalePrice = 3190 }]
        });

        Assert.Contains("Моментално на попуст", mail.Html);
        Assert.Contains("3.190 ден.", mail.Html);
        Assert.DoesNotContain("Код за попуст", mail.Html);
        Assert.Contains("/all-products?utm_source=email", mail.Html);   // default button for welcome
    }

    [Fact]
    public void AlbanianRecipientGetsAlbanianCopyAndFallsBackPerField()
    {
        var template = Template(MarketingEmailTemplate.Replenishment, "VRATI10");
        template.SubjectAl = "{ime}, {proizvod} yt së shpejti do të mbarojë";
        template.HeadingAl = "Mos mbetu pa {proizvod}";
        // BodyAl / ButtonTextAl left empty: the Macedonian text is used for them.

        var mail = MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = template,
            FullName = "ARTA KRASNIQI",
            Language = "al",
            RunningOut = [Item(2177, "CREMRISO"), Item(2178, "WHEY")]
        });

        Assert.Equal("Arta, CREMRISO dhe WHEY yt së shpejti do të mbarojë", mail.Subject);
        Assert.Contains("MOS MBETU PA CREMRISO DHE WHEY", mail.Text);
        Assert.Contains("Здраво Arta, прв ред.", mail.Html);           // body falls back to Macedonian
        Assert.Contains("Kodi i zbritjes", mail.Html);
        Assert.Contains("2 nëntor", mail.Html);
        Assert.Contains("&#199;regjistrohu", mail.Html);               // HTML-encoded Ç
        Assert.Contains("<html lang='sq'>", mail.Html);
        Assert.Contains("Shkup, Maqedoni", mail.Html);
        Assert.DoesNotContain("Одјави се", mail.Html);
    }

    [Fact]
    public void UnknownLanguageUsesMacedonian()
    {
        var template = Template(MarketingEmailTemplate.Welcome);
        template.SubjectAl = "Shqip";
        var mail = MarketingEmails.Render(new MarketingEmails.Context { Template = template, FullName = "Ана", Language = null });
        Assert.Equal("Ана, твојот производ наскоро ќе заврши", mail.Subject);
        Assert.Equal("mik", MarketingEmails.FirstName(null, MarketingEmails.Albanian));
    }

    [Fact]
    public void UnsubscribeTokenIsBoundToTheEmail()
    {
        var token = UnsubscribeToken.Create("Ana@Example.com", "secret-key");
        Assert.True(UnsubscribeToken.Verify("ana@example.com", token, "secret-key"));
        Assert.False(UnsubscribeToken.Verify("other@example.com", token, "secret-key"));
        Assert.False(UnsubscribeToken.Verify("ana@example.com", token, "other-key"));
        Assert.False(UnsubscribeToken.Verify("ana@example.com", null, "secret-key"));
    }

    [Theory]
    [InlineData("15:00", 2, null, true)]
    [InlineData("07:30", 2, null, false)]      // too early
    [InlineData("21:00", 2, null, false)]      // too late
    [InlineData("1500", 2, null, false)]       // bad format
    [InlineData("18:30", 99, null, false)]     // delay out of range
    [InlineData("18:30", 3, "javascript:x", false)]
    [InlineData("18:30", 3, "/checkout", true)]
    public void TemplateEditsAreValidated(string sendTime, int delay, string? buttonUrl, bool valid)
    {
        var current = Template(MarketingEmailTemplate.AbandonedCheckout);
        var (template, error) = MarketingAutomationService.Apply(current, new MarketingTemplateUpdateDto
        {
            IsActive = true,
            SendTime = sendTime,
            DelayValue = delay,
            Subject = "s",
            Heading = "h",
            Body = "b",
            ButtonText = "x",
            ButtonUrl = buttonUrl,
            CouponCode = " vrati10 "
        });

        Assert.Equal(valid, template != null);
        Assert.Equal(valid, error == null);
        if (valid) Assert.Equal("VRATI10", template!.CouponCode);
    }

    private static MarketingDiscount Discount(int id, string name, string type, decimal? percentage, params (int Id, decimal Price, decimal Sale)[] products) => new()
    {
        DiscountId = id,
        Name = name,
        DiscountType = type,
        Percentage = percentage,
        EndsOn = new DateTime(2026, 11, 30),
        Products = products.Select(p => new FeaturedProduct
        {
            ProductId = p.Id, ProductName = "P" + p.Id, ProductImg = "/product-images/p.webp", Price = p.Price, SalePrice = p.Sale
        }).ToList()
    };

    [Fact]
    public void NewDiscountListsProductsAndFillsDiscountPlaceholders()
    {
        var template = Template(MarketingEmailTemplate.NewDiscount);
        template.Subject = "{ime}, нов попуст до {procent}";
        template.Body = "Пуштивме: {popust}.";
        var mail = MarketingEmails.Render(new MarketingEmails.Context
        {
            Template = template,
            FullName = "Ana Petrova",
            SiteUrl = "https://stage.proteini.mk",
            AssetUrl = "https://stage.proteini.mk",
            Discounts =
            [
                Discount(1, "Есенски попуст", "percent", 15, (10, 1000, 850)),
                Discount(2, "Креатин недела", "price", null, (20, 2000, 1500), (21, 1000, 900))
            ]
        });

        Assert.Equal("Ana, нов попуст до 25%", mail.Subject);
        Assert.Contains("Пуштивме: Есенски попуст и Креатин недела.", mail.Html);
        Assert.Contains("https://stage.proteini.mk/product/20?utm_source=email&amp;utm_medium=email&amp;utm_campaign=new_discount", mail.Html);
        Assert.Contains("1.500 ден.", mail.Html);
        Assert.Contains("Важи до 30 ноември", mail.Html);
        Assert.Contains("Нов попуст", mail.Html);
        Assert.Contains("- P21: 900 ден.", mail.Text);
    }

    [Fact]
    public void BiggestPercentUsesSetPercentageAndRoundsNewPricesDown()
    {
        Assert.Equal(20, MarketingEmails.BiggestPercent([Discount(1, "a", "percent", 20, (1, 1690, 1352))]));
        Assert.Equal(33, MarketingEmails.BiggestPercent([Discount(1, "a", "price", null, (1, 1500, 1000))]));
        Assert.Null(MarketingEmails.BiggestPercent([]));
        Assert.Equal("A, B и C", MarketingEmails.NamePhrase(["A", "B", "C"]));
        Assert.Equal("A dhe B", MarketingEmails.NamePhrase(["A", "B"], MarketingEmails.Albanian));
    }
}
