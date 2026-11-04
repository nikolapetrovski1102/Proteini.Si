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

        if (!settings.HomeDeliveryEnabled && !settings.CardPaymentEnabled)
            throw Invalid("At least one payment method must remain enabled.");

        await provider.UpdateAsync(settings, updatedBy);
    }

    private static BadRequestException Invalid(string message) =>
        new(message, new { status = false, message });
}
