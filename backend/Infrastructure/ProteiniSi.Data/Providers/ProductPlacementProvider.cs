using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class ProductPlacementProvider(ISqlHelper sql) : IProductPlacementProvider
{
    public Task<ProductPlacementAdmin> GetAdminAsync() =>
        sql.QueryMultipleAsync(StoredProcedures.ProductPlacements.GetAdmin, null, async grid =>
        {
            var placements = (await grid.ReadAsync<ProductPlacement>()).ToList();
            var products = (await grid.ReadAsync<ProductPlacementCandidate>()).ToList();
            var categories = (await grid.ReadAsync<(int Product_Id, int Category_Id)>())
                .ToLookup(row => row.Product_Id, row => row.Category_Id);

            foreach (var product in products)
                product.CategoryIds = categories[product.Product_Id].Distinct().ToList();

            return new ProductPlacementAdmin { Placements = placements, Products = products };
        });

    public async Task<bool> SaveAsync(string scope, int targetId, IReadOnlyList<int> productIds) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.ProductPlacements.Save, new
        {
            Scope = scope,
            TargetId = targetId,
            Products = TableParameters.IdOrderList(productIds.Select((id, index) => (id, index)))
        }) == 0;
}
