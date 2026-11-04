using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IRelatedProductService
{
    Task<IReadOnlyList<RelatedProduct>> GetRelatedProductsAsync(int productId, int? limit);
}
