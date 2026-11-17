using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml;
using Microsoft.Extensions.Configuration;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Services;

/// <summary>
/// Builds the product catalog feed for ads. Every variant is its own item (id "v{Variant_Id}") grouped under its
/// product (item_group_id "p{Product_Id}"); products without variants use id "p{Product_Id}". Links open the product
/// page with that variant selected.
/// </summary>
public partial class ProductFeedService(IProductProvider provider, IConfiguration config) : IProductFeedService
{
    private const string GoogleNamespace = "http://base.google.com/ns/1.0";
    private const string Currency = "MKD";
    private const string DefaultBrand = "Proteini.si";
    private const string SupplementCategory = "Health & Beauty > Health Care > Fitness & Nutrition";
    private const string ApparelCategory = "Apparel & Accessories > Clothing";
    private const int MaxTitleLength = 150;
    private const int MaxDescriptionLength = 5000;

    private string SiteUrl => (config["AppSettings:FrontendUrl"] ?? "https://proteini.mk").TrimEnd('/');

    public async Task<List<CatalogFeedItemDto>> BuildItemsAsync()
    {
        var items = await provider.GetAdFeedAsync();
        var siteUrl = SiteUrl;
        return items.Select(item => ToCatalogItem(item, siteUrl)).ToList();
    }

    public async Task<string> BuildXmlFeedAsync(CatalogFeedSelection? selection = null)
    {
        var items = await BuildItemsAsync();
        if (selection is { IsEmpty: false })
            items = items.Where(selection.Includes).ToList();
        var siteUrl = SiteUrl;

        var settings = new XmlWriterSettings { Indent = true, Encoding = new UTF8Encoding(false), Async = false };
        var builder = new StringBuilder();
        using (var stringWriter = new Utf8StringWriter(builder))
        using (var xml = XmlWriter.Create(stringWriter, settings))
        {
            xml.WriteStartDocument();
            xml.WriteStartElement("rss");
            xml.WriteAttributeString("version", "2.0");
            xml.WriteAttributeString("xmlns", "g", null, GoogleNamespace);
            xml.WriteStartElement("channel");
            xml.WriteElementString("title", "Proteini.si");
            xml.WriteElementString("link", siteUrl);
            xml.WriteElementString("description", "Proteini.si product catalog");

            foreach (var item in items)
                WriteItem(xml, item);

            xml.WriteEndElement();
            xml.WriteEndElement();
            xml.WriteEndDocument();
        }

        return builder.ToString();
    }

    private static CatalogFeedItemDto ToCatalogItem(ProductFeedItemDto item, string siteUrl)
    {
        var title = BuildTitle(item);
        var description = CleanDescription(item.Description);
        if (string.IsNullOrWhiteSpace(description))
            description = title;

        var packaging = item.PackagingName?.Trim();
        var option = item.FlavorName?.Trim();
        var topCategory = item.CategoryPath?.Split(" > ")[0].Trim();

        return new CatalogFeedItemDto
        {
            ProductId = item.ProductId,
            VariantId = item.VariantId,
            Id = item.VariantId is { } variantId ? $"v{variantId}" : $"p{item.ProductId}",
            ItemGroupId = item.VariantId is not null ? $"p{item.ProductId}" : null,
            Title = title,
            Description = Truncate(description, MaxDescriptionLength),
            Link = item.VariantId is { } id
                ? $"{siteUrl}/product/{item.ProductId}?variant={id}"
                : $"{siteUrl}/product/{item.ProductId}",
            ImageLink = string.IsNullOrWhiteSpace(item.Img) ? null : AbsoluteUrl(siteUrl, item.Img),
            Availability = item.Quantity > 0 ? "in stock" : "out of stock",
            Price = FormatPrice(item.Price),
            SalePrice = item.SalePrice is { } salePrice ? FormatPrice(salePrice) : null,
            SalePriceEffectiveDate = item is { SalePrice: not null, SaleEndDate: { } end }
                ? $"{DateTime.UtcNow.Date:yyyy-MM-dd}T00:00+01:00/{end.Date:yyyy-MM-dd}T23:59+01:00"
                : null,
            Brand = string.IsNullOrWhiteSpace(item.BrandName) ? DefaultBrand : item.BrandName.Trim(),
            GoogleProductCategory = item.IsApparel ? ApparelCategory : SupplementCategory,
            ProductType = string.IsNullOrWhiteSpace(item.CategoryPath) ? null : item.CategoryPath.Trim(),
            Size = string.IsNullOrEmpty(packaging) ? null : packaging,
            Color = item.IsApparel && !string.IsNullOrEmpty(option) ? option : null,
            // Labels for splitting ad sets in Ads Manager / Google Ads: flavour, top-level category, on sale.
            CustomLabel0 = !item.IsApparel && !string.IsNullOrEmpty(option) ? option : null,
            CustomLabel1 = string.IsNullOrEmpty(topCategory) ? null : topCategory,
            CustomLabel2 = item.SalePrice is not null ? "on sale" : null,
            Quantity = item.Quantity,
            BrandId = item.BrandId,
            CategoryIds = (item.CategoryIds ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(v => int.TryParse(v, out var n) ? n : 0)
                .Where(n => n > 0)
                .ToList(),
            Flavor = string.IsNullOrEmpty(option) ? null : option,
        };
    }

    private static void WriteItem(XmlWriter xml, CatalogFeedItemDto item)
    {
        xml.WriteStartElement("item");
        G(xml, "id", item.Id);
        G(xml, "item_group_id", item.ItemGroupId);
        G(xml, "title", item.Title);
        G(xml, "description", item.Description);
        G(xml, "link", item.Link);
        G(xml, "image_link", item.ImageLink);
        G(xml, "availability", item.Availability);
        G(xml, "condition", item.Condition);
        G(xml, "price", item.Price);
        G(xml, "sale_price", item.SalePrice);
        G(xml, "sale_price_effective_date", item.SalePriceEffectiveDate);
        G(xml, "brand", item.Brand);
        G(xml, "identifier_exists", "no");
        G(xml, "google_product_category", item.GoogleProductCategory);
        G(xml, "product_type", item.ProductType);
        G(xml, "size", item.Size);
        G(xml, "color", item.Color);
        G(xml, "custom_label_0", item.CustomLabel0);
        G(xml, "custom_label_1", item.CustomLabel1);
        G(xml, "custom_label_2", item.CustomLabel2);
        xml.WriteEndElement();
    }

    /// <summary>Writes a g: field; empty values are left out.</summary>
    private static void G(XmlWriter xml, string name, string? value)
    {
        if (!string.IsNullOrEmpty(value))
            xml.WriteElementString("g", name, GoogleNamespace, RemoveInvalidXmlChars(value));
    }

    /// <summary>"NAME, 750ml · лимон": adds the packaging and flavour/colour unless the name already says them.</summary>
    private static string BuildTitle(ProductFeedItemDto item)
    {
        var name = Whitespace().Replace(item.Name, " ").Trim();
        var parts = new List<string>();
        foreach (var part in new[] { item.PackagingName, item.FlavorName })
        {
            var value = part?.Trim();
            if (!string.IsNullOrEmpty(value) && !name.Contains(value, StringComparison.OrdinalIgnoreCase)
                && !parts.Contains(value, StringComparer.OrdinalIgnoreCase))
                parts.Add(value);
        }

        var title = parts.Count == 0 ? name : $"{name}, {string.Join(" · ", parts)}";
        return Truncate(title, MaxTitleLength);
    }

    /// <summary>MainDescriptions holds a JSON array of HTML snippets; turns it into plain text, one point per line.</summary>
    internal static string CleanDescription(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return "";

        var html = raw.Trim();
        if (html.StartsWith('['))
        {
            try
            {
                var parts = JsonSerializer.Deserialize<string[]>(html);
                if (parts is not null)
                    html = string.Join("\n", parts.Where(part => !string.IsNullOrWhiteSpace(part)));
            }
            catch (JsonException)
            {
                // Not JSON after all: use the text as it is.
            }
        }

        html = BlockBreak().Replace(html, "\n");
        html = Tags().Replace(html, "");
        var text = WebUtility.HtmlDecode(html);

        // Descriptions often repeat a paragraph (or start the long text with the short one): keep each once.
        var lines = new List<string>();
        foreach (var line in text.Split('\n').Select(line => Whitespace().Replace(line, " ").Trim()))
        {
            if (line.Length == 0 || lines.Any(kept => kept.Contains(line, StringComparison.OrdinalIgnoreCase)))
                continue;
            lines.RemoveAll(kept => line.Contains(kept, StringComparison.OrdinalIgnoreCase));
            lines.Add(line);
        }
        return string.Join("\n", lines);
    }

    private static string AbsoluteUrl(string siteUrl, string path)
    {
        if (path.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return path;

        var segments = path.Trim().TrimStart('/').Split('/').Select(Uri.EscapeDataString);
        return $"{siteUrl}/{string.Join('/', segments)}";
    }

    private static string FormatPrice(decimal price) =>
        $"{price.ToString("0.00", CultureInfo.InvariantCulture)} {Currency}";

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..(maxLength - 1)].TrimEnd() + "…";

    private static string RemoveInvalidXmlChars(string value) =>
        new(value.Where(XmlConvert.IsXmlChar).ToArray());

    [GeneratedRegex(@"<\s*(br\s*/?|/\s*(p|li|div|h[1-6]|ul|ol|tr))\s*>", RegexOptions.IgnoreCase)]
    private static partial Regex BlockBreak();

    [GeneratedRegex(@"<[^>]+>")]
    private static partial Regex Tags();

    [GeneratedRegex(@"[ \t\r\f\v ]+")]
    private static partial Regex Whitespace();

    private sealed class Utf8StringWriter(StringBuilder builder) : StringWriter(builder, CultureInfo.InvariantCulture)
    {
        public override Encoding Encoding => new UTF8Encoding(false);
    }
}
