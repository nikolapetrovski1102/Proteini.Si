using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class PackagingProvider(ISqlHelper sql) : IPackagingProvider
{
    public Task<List<Packaging>> GetActiveAsync() =>
        sql.QueryAsync<Packaging>(StoredProcedures.Packaging.GetActive);

    public Task<Packaging?> GetActiveByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<Packaging>(StoredProcedures.Packaging.GetActiveById, new { Id = id });

    public async Task<int> CreateAsync(CreatePackagingDto packaging) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Packaging.Create, new
        {
            packaging.Packaging_Name,
            packaging.Packaging_Type,
            packaging.Weight_Grams,
            packaging.Quantity_Per_Box,
            packaging.Display_Order
        });

    public async Task<bool> UpdateAsync(UpdatePackagingDto packaging) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Packaging.Update, new
        {
            packaging.Packaging_Id,
            packaging.Packaging_Name,
            packaging.Packaging_Type,
            packaging.Weight_Grams,
            packaging.Quantity_Per_Box,
            packaging.Display_Order,
            packaging.IsActive
        }) > 0;

    public async Task<bool> DeactivateAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Packaging.Deactivate, new { Id = id }) > 0;
}
