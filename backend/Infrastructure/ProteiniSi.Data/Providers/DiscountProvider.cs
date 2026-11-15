using System.Text.Json;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class DiscountProvider(ISqlHelper sql) : IDiscountProvider
{
    public Task<List<Discount>> GetAllAsync() =>
        sql.QueryMultipleAsync(StoredProcedures.Discounts.GetAll, null, async grid =>
        {
            var discounts = (await grid.ReadAsync<Discount>()).ToList();
            var targets = (await grid.ReadAsync<DiscountTarget>()).ToLookup(t => t.Discount_Id, t => t.Target_Id);
            var items = (await grid.ReadAsync<DiscountItem>()).ToLookup(i => i.Discount_Id);
            foreach (var discount in discounts)
            {
                discount.Target_Ids = targets[discount.Discount_Id].ToList();
                discount.Items = items[discount.Discount_Id].ToList();
            }
            return discounts;
        });

    public Task<List<DiscountItemOption>> GetItemOptionsAsync() =>
        sql.QueryAsync<DiscountItemOption>(StoredProcedures.Discounts.GetItemOptions);

    public async Task<int?> SaveAsync(DiscountSave discount)
    {
        var row = await sql.QuerySingleOrDefaultAsync<SaveRow>(StoredProcedures.Discounts.Save, new
        {
            discount.Id,
            discount.Name,
            DiscountType = discount.Type,
            discount.Percentage,
            discount.AppliesTo,
            StartsOn = discount.StartsOn?.Date,
            EndsOn = discount.EndsOn?.Date,
            discount.IsActive,
            TargetIds = TableParameters.IntList(discount.TargetIds),
            Items = JsonSerializer.Serialize(discount.Items.Select(i => new
            {
                productId = i.Product_Id,
                variantId = i.Variant_Id,
                newPrice = i.New_Price
            }))
        });

        return row is { Result: 0 } ? row.Id : null;
    }

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Discounts.Delete, new { Id = id }) == 1;

    public Task<int> SyncAsync() =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Discounts.Sync);

    private sealed record SaveRow(int Result, int? Id);
}
