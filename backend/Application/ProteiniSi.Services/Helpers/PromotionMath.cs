using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services.Helpers;

/// <summary>Promo code scope rules and discount math, shared by the checkout preview and order creation.</summary>
public static class PromotionMath
{
    public const int MaxTargets = 500;
    public const string NoEligibleItems = "This code doesn't apply to the products in your cart.";

    /// <summary>
    /// Discount on the amount the code applies to: the whole subtotal for "all products", otherwise
    /// only the matching items. Never more than that amount.
    /// </summary>
    public static decimal Discount(string? discountType, decimal discountValue, decimal? maximumDiscount, decimal eligibleSubtotal)
    {
        if (eligibleSubtotal <= 0) return 0m;
        var discount = string.Equals(discountType, "percentage", StringComparison.OrdinalIgnoreCase)
            ? eligibleSubtotal * discountValue / 100m
            : discountValue;
        if (maximumDiscount != null)
            discount = Math.Min(discount, maximumDiscount.Value);
        // Whole denars, rounded down, so the price left after the discount is the rounded-up one.
        return PriceFormat.RoundDiscount(Math.Min(Math.Max(discount, 0m), eligibleSubtotal));
    }

    /// <summary>Sum of the lines whose product the code applies to.</summary>
    public static decimal EligibleSubtotal(IEnumerable<(int ProductId, decimal LineTotal)> lines, IReadOnlySet<int> eligibleProductIds) =>
        lines.Where(line => eligibleProductIds.Contains(line.ProductId)).Sum(line => line.LineTotal);

    /// <summary>Normalizes and checks the "applies to" part of a code form. Returns an error message or the scope.</summary>
    public static (PromoCodeScope? Scope, string? Error) ToScope(IPromotionScopeDto dto)
    {
        var appliesTo = (dto.AppliesTo ?? PromoScope.All).Trim().ToLowerInvariant();
        switch (appliesTo)
        {
            case "" or PromoScope.All:
                return (PromoCodeScope.Everything, null);
            case PromoScope.Products:
            {
                var ids = CleanIds(dto.ProductIds);
                if (ids.Length == 0) return (null, "Choose at least one product, or make the code apply to all products.");
                if (ids.Length > MaxTargets) return (null, $"A code can apply to at most {MaxTargets} products.");
                return (new PromoCodeScope(PromoScope.Products, ids, []), null);
            }
            case PromoScope.Categories:
            {
                var ids = CleanIds(dto.CategoryIds);
                if (ids.Length == 0) return (null, "Choose at least one category, or make the code apply to all products.");
                if (ids.Length > MaxTargets) return (null, $"A code can apply to at most {MaxTargets} categories.");
                return (new PromoCodeScope(PromoScope.Categories, [], ids), null);
            }
            default:
                return (null, "Applies to must be all products, products or categories.");
        }
    }

    private static int[] CleanIds(IEnumerable<int>? ids) => (ids ?? []).Where(id => id > 0).Distinct().Order().ToArray();
}
