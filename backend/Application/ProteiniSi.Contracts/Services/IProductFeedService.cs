namespace ProteiniSi.Contracts.Services;

public interface IProductFeedService
{
    /// <summary>Product catalog as an RSS 2.0 feed with Google Merchant fields, read by Meta Commerce Manager and Google Merchant Center.</summary>
    Task<string> BuildXmlFeedAsync();
}
