using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class CommerceSettingsService(IShippingSettingsProvider provider) : ICommerceSettingsService
{
    public async Task<ShippingSettings> GetShippingAsync()
    {
        try
        {
            return await provider.GetAsync() ?? new ShippingSettings();
        }
        catch
        {
            // Keeps checkout available during a rolling deployment before the additive migration runs.
            return new ShippingSettings();
        }
    }

    public async Task UpdateShippingAsync(UpdateShippingSettingsDto settings, string? updatedBy)
    {
        if (settings.FlatDeliveryFee < 0 || settings.CashOnDeliveryFee < 0 || settings.FreeDeliveryThreshold < 0)
            throw Invalid("Shipping fees and threshold cannot be negative.");

        if (settings.CourierCodThreshold < 0 || settings.CourierCodFixedFee < 0
            || settings.CourierCodPercent < 0 || settings.CourierCodPercent > 100)
            throw Invalid("Courier commission amounts cannot be negative and the percentage must be between 0 and 100.");

        if (!settings.HomeDeliveryEnabled && !settings.CardPaymentEnabled)
            throw Invalid("At least one payment method must remain enabled.");

        if (settings.LoyaltyMinBalance is < 0 or > 100000)
            throw Invalid("The minimum points balance must be between 0 and 100000.");

        if (settings.LoyaltyRedeemTiers != null)
        {
            var tiers = settings.LoyaltyRedeemTiers;
            if (tiers.Count > 10)
                throw Invalid("At most 10 loyalty tiers are allowed.");
            if (tiers.Any(t => t.MinOrder < 0 || t.MaxPoints <= 0 || t.MaxPoints > 100000))
                throw Invalid("Each loyalty tier needs an order value of 0 or more and between 1 and 100000 points.");
            if (tiers.Select(t => t.MinOrder).Distinct().Count() != tiers.Count)
                throw Invalid("Two loyalty tiers cannot start at the same order value.");
        }

        if (!string.IsNullOrWhiteSpace(settings.TrackingUrlTemplate))
        {
            var template = settings.TrackingUrlTemplate.Trim();
            if (template.Length > 500
                || !template.Contains(ShippingSettings.TrackingNumberPlaceholder, StringComparison.OrdinalIgnoreCase)
                || !Uri.TryCreate(template.Replace(ShippingSettings.TrackingNumberPlaceholder, "0", StringComparison.OrdinalIgnoreCase),
                        UriKind.Absolute, out var sample)
                || sample.Scheme is not ("https" or "http"))
                throw Invalid("The tracking link must be an http(s) address containing {number}, e.g. https://courier.mk/track?n={number}.");
            settings.TrackingUrlTemplate = template;
        }

        await provider.UpdateAsync(settings, updatedBy);
    }

    private static BadRequestException Invalid(string message) =>
        new(message, new { status = false, message });
}
