using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models.DTOs;

namespace ProteiniSi.Api.Services
{
    public class RelatedProductService
    {
        private const int DefaultLimit = 8;
        private const int MaxLimit = 24;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

        private readonly DataContextDapper _dapper;
        private readonly IMemoryCache _cache;

        public RelatedProductService(IConfiguration config, IMemoryCache cache)
        {
            _dapper = new DataContextDapper(config);
            _cache = cache;
        }

        public IReadOnlyList<RelatedProductDto> GetRelatedProducts(int productId, int? limit)
        {
            if (productId <= 0)
                return Array.Empty<RelatedProductDto>();

            var safeLimit = NormalizeLimit(limit);
            var cacheKey = $"related-products:{productId}:{safeLimit}";

            return _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;
                return LoadRelatedProducts(productId, safeLimit);
            }) ?? Array.Empty<RelatedProductDto>();
        }

        private IReadOnlyList<RelatedProductDto> LoadRelatedProducts(int productId, int limit)
        {
            var sql = @"
WITH CurrentCategories AS (
    SELECT Category_Id
    FROM ProductCategoryMapping
    WHERE Product_Id = @ProductId
),
OrderCounts AS (
    SELECT Product_Id, SUM(Quantity) AS OrderCount
    FROM OrderItems
    WHERE Product_Id IS NOT NULL
    GROUP BY Product_Id
)
SELECT TOP (@Limit)
    p.Product_Id,
    p.Name,
    p.Img,
    CAST(p.Price AS decimal(18, 2)) AS Price,
    ISNULL(oc.OrderCount, 0) AS OrderCount
FROM Products p
LEFT JOIN OrderCounts oc ON oc.Product_Id = p.Product_Id
WHERE p.Product_Id <> @ProductId
  AND EXISTS (
      SELECT 1
      FROM ProductCategoryMapping pcm
      INNER JOIN CurrentCategories cc ON cc.Category_Id = pcm.Category_Id
      WHERE pcm.Product_Id = p.Product_Id
  )
ORDER BY
    ISNULL(oc.OrderCount, 0) DESC,
    p.CreatedAt DESC,
    p.Product_Id DESC";

            var products = _dapper.LoadData<RelatedProductDto>(sql, new { ProductId = productId, Limit = limit })
                .ToList();

            foreach (var product in products)
            {
                product.Slug = BuildSlug(product.Name, product.Product_Id);
            }

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

            var normalized = name.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var ch in normalized)
            {
                var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
                if (category == System.Globalization.UnicodeCategory.NonSpacingMark)
                    continue;

                builder.Append(char.ToLowerInvariant(ch));
            }

            var slug = Regex.Replace(builder.ToString(), @"[^a-z0-9]+", "-").Trim('-');
            return string.IsNullOrEmpty(slug)
                ? productId.ToString()
                : $"{slug}-{productId}";
        }
    }
}
