using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class AddressLookupService(
    IAddressLookupProvider provider,
    IMemoryCache cache,
    ILogger<AddressLookupService> logger) : IAddressLookupService
{
    private const string CacheKey = "address-lookup:data";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

    public async Task<CheckoutLocationOptions> GetCheckoutOptionsAsync()
    {
        var (countries, cities) = await LoadCachedAsync();

        return new CheckoutLocationOptions
        {
            ShippingCountries = countries.Where(c => c.AllowShipping).OrderBy(c => c.SortOrder).ThenBy(c => c.NameEn).ToList(),
            PhoneCountries = countries.Where(c => c.AllowPhone).OrderBy(c => c.SortOrder).ThenBy(c => c.NameEn).ToList(),
            Cities = cities.Where(c => c.Deliver).OrderBy(c => c.SortOrder).ThenBy(c => c.NameLatin).ToList()
        };
    }

    public async Task<AdminAddressLookupDto> GetAdminOptionsAsync()
    {
        var (countries, cities) = await LoadCachedAsync();
        return new AdminAddressLookupDto(countries, cities);
    }

    public async Task UpdateCityDeliverAsync(int cityId, bool deliver)
    {
        if (cityId <= 0)
            throw new BadRequestException("Invalid city ID");

        if (!await provider.UpdateCityDeliverAsync(cityId, deliver))
            throw new NotFoundException("City not found");

        cache.Remove(CacheKey);
    }

    public async Task<int> BulkUpdateCityDeliverByTypeAsync(bool isTown, bool deliver)
    {
        var updated = await provider.BulkUpdateCityDeliverByTypeAsync(isTown, deliver);
        cache.Remove(CacheKey);
        return updated;
    }

    public async Task UpdateCountryAllowPhoneAsync(int countryId, bool allowPhone)
    {
        if (countryId <= 0)
            throw new BadRequestException("Invalid country ID");

        if (!await provider.UpdateCountryAllowPhoneAsync(countryId, allowPhone))
            throw new NotFoundException("Country not found");

        cache.Remove(CacheKey);
    }

    private async Task<(List<CountryRule> Countries, List<CityLookup> Cities)> LoadCachedAsync()
    {
        if (cache.TryGetValue(CacheKey, out (List<CountryRule> Countries, List<CityLookup> Cities) cached)
            && cached.Countries is { Count: > 0 })
        {
            return cached;
        }

        try
        {
            var countriesTask = provider.GetCountriesAsync();
            var citiesTask = provider.GetCitiesWithPostCodesAsync();
            await Task.WhenAll(countriesTask, citiesTask);

            var countries = countriesTask.Result;
            var cities = citiesTask.Result;

            if (countries.Count == 0)
                countries = CheckoutFieldValidator.DefaultCountries.ToList();

            var data = (countries, cities);
            cache.Set(CacheKey, data, CacheDuration);
            return data;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load Country/City tables from database; falling back to default country rules.");
            return (CheckoutFieldValidator.DefaultCountries.ToList(), []);
        }
    }
}
