namespace ProteiniSi.Api.Caching;

public static class CacheTags
{
    public const string BranchLocations = "branch-locations";
    public const string TipArticles = "tip-articles";
    public const string HomepageCards = "homepage-cards";
    public const string AddressLookup = "address-lookup";

    public static readonly string[] All = [BranchLocations, TipArticles, HomepageCards, AddressLookup];
}
