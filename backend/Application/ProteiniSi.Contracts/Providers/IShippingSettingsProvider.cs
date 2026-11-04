using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IShippingSettingsProvider
{
    Task<ShippingSettings?> GetAsync();
    Task UpdateAsync(UpdateShippingSettingsDto settings, string? updatedBy);
}
