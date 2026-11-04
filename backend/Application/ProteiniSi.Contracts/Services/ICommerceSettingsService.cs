using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface ICommerceSettingsService
{
    Task<ShippingSettings> GetShippingAsync();
    Task UpdateShippingAsync(UpdateShippingSettingsDto settings, string? updatedBy);
}
