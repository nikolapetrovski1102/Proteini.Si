using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class RelatedProductService(IRelatedProductProvider provider, IMemoryCache cache) : IRelatedProductService
{
    private const int DefaultLimit = 8;
    private const int MaxLimit = 24;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

    public async Task<IReadOnlyList<RelatedProduct>> GetRelatedProductsAsync(int productId, int? limit)
    {
        if (productId <= 0)
            return [];

        var safeLimit = NormalizeLimit(limit);
        var cacheKey = $"related-products:{productId}:{safeLimit}";

        var products = await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            return await LoadRelatedProductsAsync(productId, safeLimit);
        });

        return products ?? [];
    }

    private async Task<IReadOnlyList<RelatedProduct>> LoadRelatedProductsAsync(int productId, int limit)
    {
        var products = await provider.GetRelatedAsync(productId, limit);
        foreach (var product in products)
            product.Slug = BuildSlug(product.Name, product.Product_Id);

        return products;
    }

    private static int NormalizeLimit(int? limit)
    {
        if (!limit.HasValue || limit.Value <= 0)
            return DefaultLimit;

        return Math.Min(limit.Value, MaxLimit);
    }

    private static string BuildSlug(string? name, int productId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return productId.ToString();

        var builder = new StringBuilder();
        foreach (var ch in name.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) == UnicodeCategory.NonSpacingMark)
                continue;

            builder.Append(char.ToLowerInvariant(ch));
        }

        var slug = Regex.Replace(builder.ToString(), @"[^a-z0-9]+", "-").Trim('-');
        return string.IsNullOrEmpty(slug) ? productId.ToString() : $"{slug}-{productId}";
    }
}
