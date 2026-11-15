using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class BrandProvider(ISqlHelper sql) : IBrandProvider
{
    public Task<List<BrandAdmin>> GetAllAsync() =>
        sql.QueryAsync<BrandAdmin>(StoredProcedures.Brands.GetAll);

    public Task<BrandAdmin?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<BrandAdmin>(StoredProcedures.Brands.GetById, new { Id = id });

    public async Task<(int Result, int? Id)> SaveAsync(
        int? id, string name, string slug, string? logoUrl, string? headerImageUrl, bool isFeatured, int displayOrder)
    {
        var row = await sql.QuerySingleOrDefaultAsync<SaveRow>(StoredProcedures.Brands.Save, new
        {
            Id = id,
            Name = name,
            Slug = slug,
            LogoUrl = logoUrl,
            HeaderImageUrl = headerImageUrl,
            IsFeatured = isFeatured,
            DisplayOrder = displayOrder
        });

        return (row!.Result, row.Id);
    }

    public async Task<bool?> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Brands.Delete, new { Id = id }) switch
        {
            0 => true,
            1 => null,
            _ => false
        };

    private sealed record SaveRow(int Result, int? Id);
}
