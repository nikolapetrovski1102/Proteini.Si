using Dapper;
using ProteiniSi.Data;
using ProteiniSi.Models;
using ProteiniSi.Contracts.Providers;

namespace ProteiniSi.Data.Providers;

public class HomepageCardProvider(ISqlHelper sql) : IHomepageCardProvider
{
    public Task<List<HomepageCard>> GetActiveAsync(string? section) =>
        sql.QueryAsync<HomepageCard>(StoredProcedures.HomepageCards.GetActive, new { Section = section });

    public Task<List<HomepageCard>> GetAllAsync() =>
        sql.QueryAsync<HomepageCard>(StoredProcedures.HomepageCards.GetAll);

    public Task<HomepageCard?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<HomepageCard>(StoredProcedures.HomepageCards.GetById, new { Id = id });

    public async Task<bool> SlugExistsAsync(string slug, int? excludingId) =>
        await sql.ExecuteScalarAsync<bool>(StoredProcedures.HomepageCards.SlugExists, new { Slug = slug, ExcludingId = excludingId });

    public async Task<int> CreateAsync(HomepageCard card) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.HomepageCards.Create, ToParameters(card));

    public Task UpdateAsync(HomepageCard card) =>
        sql.ExecuteAsync(StoredProcedures.HomepageCards.Update, ToParameters(card, includeId: true));

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.HomepageCards.Delete, new { Id = id }) > 0;

    private static DynamicParameters ToParameters(HomepageCard card, bool includeId = false)
    {
        var parameters = new DynamicParameters(new
        {
            card.Section,
            card.TitleMk,
            card.TitleAl,
            card.Slug,
            card.FilterValue,
            card.DestinationUrl,
            card.ImagePath,
            card.DisplayOrder,
            card.IsActive
        });

        if (includeId)
            parameters.Add("Id", card.Id);

        return parameters;
    }
}
