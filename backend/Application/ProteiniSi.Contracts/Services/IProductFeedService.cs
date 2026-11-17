using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface IProductFeedService
{
    /// <summary>Every catalog row with its feed fields already filled in (titles, links, prices, labels).</summary>
    Task<List<CatalogFeedItemDto>> BuildItemsAsync();

    /// <summary>Product catalog as an RSS 2.0 feed with Google Merchant fields, limited to the selection (empty = everything), read by Meta Commerce Manager and Google Merchant Center.</summary>
    Task<string> BuildXmlFeedAsync(CatalogFeedSelection? selection = null);
}
