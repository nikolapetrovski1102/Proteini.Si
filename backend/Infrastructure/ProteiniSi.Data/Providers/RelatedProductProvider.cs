using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class RelatedProductProvider(ISqlHelper sql) : IRelatedProductProvider
{
    public Task<List<RelatedProduct>> GetRelatedAsync(int productId, int limit) =>
        sql.QueryAsync<RelatedProduct>(StoredProcedures.Products.GetRelated, new { ProductId = productId, Limit = limit });
}
