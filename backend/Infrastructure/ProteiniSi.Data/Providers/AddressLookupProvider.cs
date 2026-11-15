using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class AddressLookupProvider(ISqlHelper sql) : IAddressLookupProvider
{
    private sealed class CityJoinRow
    {
        public int CityId { get; set; }
        public int CountryId { get; set; }
        public string NameLatin { get; set; } = string.Empty;
        public string? NameMk { get; set; }
        public bool IsTown { get; set; }
        public bool Deliver { get; set; }
        public int SortOrder { get; set; }
        public string? PostCode { get; set; }
        public string? PostOffice { get; set; }
    }

    public Task<List<CountryRule>> GetCountriesAsync() =>
        sql.QueryAsync<CountryRule>(StoredProcedures.AddressLookup.GetCountries);

    public async Task<List<CityLookup>> GetCitiesWithPostCodesAsync()
    {
        var rows = await sql.QueryAsync<CityJoinRow>(StoredProcedures.AddressLookup.GetCitiesWithPostCodes);
        var byCityId = new Dictionary<int, CityLookup>();
        var ordered = new List<CityLookup>();

        foreach (var row in rows)
        {
            if (!byCityId.TryGetValue(row.CityId, out var city))
            {
                city = new CityLookup
                {
                    CityId = row.CityId,
                    CountryId = row.CountryId,
                    NameLatin = row.NameLatin,
                    NameMk = row.NameMk,
                    IsTown = row.IsTown,
                    Deliver = row.Deliver,
                    SortOrder = row.SortOrder,
                    PostCodes = []
                };
                byCityId[row.CityId] = city;
                ordered.Add(city);
            }

            if (!string.IsNullOrWhiteSpace(row.PostCode))
            {
                city.PostCodes.Add(new CityPostCodeItem
                {
                    PostCode = row.PostCode.Trim(),
                    PostOffice = row.PostOffice
                });
            }
        }

        return ordered;
    }

    public async Task<bool> UpdateCityDeliverAsync(int cityId, bool deliver) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AddressLookup.UpdateCityDeliver, new
        {
            City_Id = cityId,
            Deliver = deliver
        }) > 0;

    public async Task<int> BulkUpdateCityDeliverByTypeAsync(bool isTown, bool deliver) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AddressLookup.BulkUpdateCityDeliverByType, new
        {
            Is_Town = isTown,
            Deliver = deliver
        });

    public async Task<bool> UpdateCountryAllowPhoneAsync(int countryId, bool allowPhone) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AddressLookup.UpdateCountryAllowPhone, new
        {
            Country_Id = countryId,
            Allow_Phone = allowPhone
        }) > 0;
}
