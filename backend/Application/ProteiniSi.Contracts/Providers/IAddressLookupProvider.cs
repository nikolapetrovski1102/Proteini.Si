using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IAddressLookupProvider
{
    Task<List<CountryRule>> GetCountriesAsync();
    Task<List<CityLookup>> GetCitiesWithPostCodesAsync();
    Task<bool> UpdateCityDeliverAsync(int cityId, bool deliver);
    Task<int> BulkUpdateCityDeliverByTypeAsync(bool isTown, bool deliver);
    Task<bool> UpdateCountryAllowPhoneAsync(int countryId, bool allowPhone);
}
