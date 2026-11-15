using System.Text.Json;

namespace ProteiniSi.Models;

public class ShippingSettings
{
    public decimal FlatDeliveryFee { get; set; } = 165m;
    public decimal CashOnDeliveryFee { get; set; } = 30m;
    public decimal FreeDeliveryThreshold { get; set; } = 3000m;
    public bool HomeDeliveryEnabled { get; set; } = true;
    public bool CardPaymentEnabled { get; set; } = true;

    // Commission the courier charges the buyer directly for collecting cash on delivery (not part of our total).
    public decimal CourierCodThreshold { get; set; } = 3000m;
    public decimal CourierCodFixedFee { get; set; } = 30m;
    public decimal CourierCodPercent { get; set; } = 1.6m;

    // Loyalty redemption: points needed before any can be used, and the tiers (order value after promo code →
    // most points usable on that order) as JSON, e.g. [{"minOrder":1500,"maxPoints":100}, ...].
    public decimal LoyaltyMinBalance { get; set; } = 100m;
    public string LoyaltyRedeemTiers { get; set; } = DefaultLoyaltyRedeemTiers;

    // Courier tracking page with a {number} placeholder, e.g. https://courier.example/track?n={number}.
    public string? TrackingUrlTemplate { get; set; }

    public const string TrackingNumberPlaceholder = "{number}";

    /// <summary>Tracking link for <paramref name="trackingNumber"/> from <see cref="TrackingUrlTemplate"/>; null when either is missing.</summary>
    public string? TrackingUrlFor(string? trackingNumber)
    {
        if (string.IsNullOrWhiteSpace(trackingNumber) || string.IsNullOrWhiteSpace(TrackingUrlTemplate)
            || !TrackingUrlTemplate.Contains(TrackingNumberPlaceholder, StringComparison.OrdinalIgnoreCase))
            return null;
        return TrackingUrlTemplate.Trim().Replace(TrackingNumberPlaceholder, Uri.EscapeDataString(trackingNumber.Trim()),
            StringComparison.OrdinalIgnoreCase);
    }

    public const string DefaultLoyaltyRedeemTiers =
        "[{\"minOrder\":1500,\"maxPoints\":100},{\"minOrder\":3000,\"maxPoints\":300},{\"minOrder\":5000,\"maxPoints\":500}]";

    /// <summary>Parsed <see cref="LoyaltyRedeemTiers"/>, lowest order value first; the defaults when the JSON is unreadable.</summary>
    public IReadOnlyList<LoyaltyRedeemTier> RedeemTiers => ParseTiers(LoyaltyRedeemTiers);

    /// <summary>
    /// Most points usable on an order worth <paramref name="orderValue"/> (after promo code): the highest tier the
    /// order reaches, 0 below the first tier.
    /// </summary>
    public decimal MaxRedeemablePoints(decimal orderValue) =>
        RedeemTiers.Where(t => orderValue >= t.MinOrder).Select(t => t.MaxPoints).DefaultIfEmpty(0m).Max();

    public static IReadOnlyList<LoyaltyRedeemTier> ParseTiers(string? json)
    {
        try
        {
            var tiers = JsonSerializer.Deserialize<List<LoyaltyRedeemTier>>(json ?? "", TierJson);
            if (tiers != null)
                return tiers.Where(t => t.MinOrder >= 0 && t.MaxPoints > 0).OrderBy(t => t.MinOrder).ToList();
        }
        catch (JsonException)
        {
        }
        return json == DefaultLoyaltyRedeemTiers ? [] : ParseTiers(DefaultLoyaltyRedeemTiers);
    }

    private static readonly JsonSerializerOptions TierJson = new() { PropertyNameCaseInsensitive = true };

    /// <summary>Courier commission for collecting <paramref name="amount"/>: the fixed fee up to the threshold, the percentage above it.</summary>
    public decimal CourierCodCommission(decimal amount) =>
        amount <= CourierCodThreshold
            ? CourierCodFixedFee
            : Math.Round(amount * CourierCodPercent / 100m, 2, MidpointRounding.AwayFromZero);
}

public class LoyaltyRedeemTier
{
    public decimal MinOrder { get; set; }
    public decimal MaxPoints { get; set; }
}
