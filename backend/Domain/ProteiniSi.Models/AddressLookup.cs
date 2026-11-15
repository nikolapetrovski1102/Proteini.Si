namespace ProteiniSi.Models;

public class CountryRule
{
    public int CountryId { get; set; }
    public string Iso2 { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameMk { get; set; } = string.Empty;
    public string DialCode { get; set; } = string.Empty;
    public int PhoneMinDigits { get; set; }
    public int PhoneMaxDigits { get; set; }
    public string? PhonePattern { get; set; }
    public bool StripLeadingZero { get; set; } = true;
    public bool AllowPhone { get; set; }
    public bool AllowShipping { get; set; }
    public int SortOrder { get; set; }
}

public class CityPostCodeItem
{
    public string PostCode { get; set; } = string.Empty;
    public string? PostOffice { get; set; }
}

public class CityLookup
{
    public int CityId { get; set; }
    public int CountryId { get; set; }
    public string NameLatin { get; set; } = string.Empty;
    public string? NameMk { get; set; }
    public bool IsTown { get; set; }
    public bool Deliver { get; set; } = true;
    public int SortOrder { get; set; }
    public List<CityPostCodeItem> PostCodes { get; set; } = [];
}

public class CheckoutLocationOptions
{
    public List<CountryRule> ShippingCountries { get; set; } = [];
    public List<CountryRule> PhoneCountries { get; set; } = [];
    public List<CityLookup> Cities { get; set; } = [];
}
