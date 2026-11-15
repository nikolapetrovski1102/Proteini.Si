using ProteiniSi.Models;

namespace ProteiniSi.Dtos;

public record UpdateCityDeliverDto(bool Deliver);

public record BulkUpdateCityDeliverDto(bool IsTown, bool Deliver);

public record UpdateCountryAllowPhoneDto(bool AllowPhone);

public record AdminAddressLookupDto(List<CountryRule> Countries, List<CityLookup> Cities);
