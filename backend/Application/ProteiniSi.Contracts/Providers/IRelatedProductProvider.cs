using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IRelatedProductProvider
{
    Task<List<RelatedProduct>> GetRelatedAsync(int productId, int limit);
    Task<List<CustomerRecommendation>> GetForCustomerAsync(int userId, int limit);
}
