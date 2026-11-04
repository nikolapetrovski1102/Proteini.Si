using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class ShippingSettingsProvider(ISqlHelper sql) : IShippingSettingsProvider
{
    public Task<ShippingSettings?> GetAsync() =>
        sql.QuerySingleOrDefaultAsync<ShippingSettings>(StoredProcedures.CommerceSettings.GetShipping);

    public Task UpdateAsync(UpdateShippingSettingsDto settings, string? updatedBy) =>
        sql.ExecuteAsync(StoredProcedures.CommerceSettings.UpdateShipping, new
        {
            settings.FlatDeliveryFee,
            settings.CashOnDeliveryFee,
            settings.FreeDeliveryThreshold,
            settings.HomeDeliveryEnabled,
            settings.CardPaymentEnabled,
            UpdatedBy = updatedBy
        });
}
