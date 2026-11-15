using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IRelatedProductService
{
    Task<IReadOnlyList<RelatedProduct>> GetRelatedProductsAsync(int productId, int? limit);

    /// <summary>The home page "Because you ordered" rows for a signed-in customer (empty without real orders).</summary>
    Task<IReadOnlyList<CustomerRecommendation>> GetForCustomerAsync(int userId, int? limit);
}
