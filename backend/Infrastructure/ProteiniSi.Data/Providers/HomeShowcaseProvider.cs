using Dapper;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class HomeShowcaseProvider(ISqlHelper sql) : IHomeShowcaseProvider
{
    public Task<HomeShowcase?> GetAsync(string key) =>
        sql.QueryMultipleAsync(StoredProcedures.HomeShowcase.Get, new { ShowcaseKey = key }, async grid =>
        {
            var showcase = await grid.ReadFirstOrDefaultAsync<HomeShowcase>();
            if (showcase != null)
                showcase.ProductIds = (await grid.ReadAsync<int>()).ToList();
            return showcase;
        });

    public Task UpdateAsync(string key, UpdateHomeShowcaseDto showcase, string? updatedBy) =>
        sql.ExecuteAsync(StoredProcedures.HomeShowcase.Update, new
        {
            ShowcaseKey = key,
            showcase.TitleMk,
            showcase.TitleAl,
            showcase.Source,
            showcase.ItemCount,
            showcase.IsActive,
            UpdatedBy = updatedBy,
            Products = TableParameters.IdOrderList(showcase.ProductIds.Select((id, index) => (id, index)))
        });
}
