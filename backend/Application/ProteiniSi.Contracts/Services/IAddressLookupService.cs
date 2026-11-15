using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IAddressLookupService
{
    Task<CheckoutLocationOptions> GetCheckoutOptionsAsync();
    Task<AdminAddressLookupDto> GetAdminOptionsAsync();
    Task UpdateCityDeliverAsync(int cityId, bool deliver);
    Task<int> BulkUpdateCityDeliverByTypeAsync(bool isTown, bool deliver);
    Task UpdateCountryAllowPhoneAsync(int countryId, bool allowPhone);
}
