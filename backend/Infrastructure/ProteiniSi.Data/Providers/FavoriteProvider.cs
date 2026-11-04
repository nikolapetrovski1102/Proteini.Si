using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class FavoriteProvider(ISqlHelper sql) : IFavoriteProvider
{
    public async Task<FavoriteProduct?> AddAsync(int userId, int productId)
    {
        var row = await sql.QuerySingleOrDefaultAsync<AddedRow>(StoredProcedures.Favorites.Add, new { UserId = userId, ProductId = productId });
        if (row?.FavoriteId == null)
            return null;

        return new FavoriteProduct
        {
            FavoriteId = row.FavoriteId.Value,
            UserId = userId,
            ProductId = productId,
            ProductName = row.ProductName,
            ProductPrice = row.ProductPrice ?? 0,
            ProductImage = row.ProductImage
        };
    }

    public async Task<bool> RemoveAsync(int userId, int productId) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Favorites.Remove, new { UserId = userId, ProductId = productId }) > 0;

    public Task<List<FavoriteProduct>> GetByUserAsync(int userId) =>
        sql.QueryAsync<FavoriteProduct>(StoredProcedures.Favorites.GetByUser, new { UserId = userId });

    public Task<bool> ExistsAsync(int userId, int productId) =>
        sql.ExecuteScalarAsync<bool>(StoredProcedures.Favorites.Exists, new { UserId = userId, ProductId = productId });

    public Task<int> CountByProductAsync(int productId) =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Favorites.CountByProduct, new { ProductId = productId });

    private sealed class AddedRow
    {
        public int? FavoriteId { get; init; }
        public string? ProductName { get; init; }
        public decimal? ProductPrice { get; init; }
        public string? ProductImage { get; init; }
    }
}
