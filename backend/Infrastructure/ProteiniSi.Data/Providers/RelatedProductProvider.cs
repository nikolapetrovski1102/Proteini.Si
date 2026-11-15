using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class RelatedProductProvider(ISqlHelper sql) : IRelatedProductProvider
{
    public Task<List<RelatedProduct>> GetRelatedAsync(int productId, int limit) =>
        sql.QueryAsync<RelatedProduct>(StoredProcedures.Products.GetRelated, new { ProductId = productId, Limit = limit });

    public Task<List<CustomerRecommendation>> GetForCustomerAsync(int userId, int limit) =>
        sql.QueryAsync<CustomerRecommendation>(StoredProcedures.Products.GetForCustomer, new { UserId = userId, Limit = limit });
}
