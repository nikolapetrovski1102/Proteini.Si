using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class LoyaltyProvider(ISqlHelper sql) : ILoyaltyProvider
{
    public Task<LoyaltySummary?> GetSummaryAsync(int userId) =>
        sql.QuerySingleOrDefaultAsync<LoyaltySummary>(StoredProcedures.Loyalty.GetSummary, new { UserId = userId });

    public async Task<List<LoyaltyPoint>> GetHistoryAsync(int userId, int offset, int pageSize) =>
        (await sql.QueryAsync<LoyaltyPoint>(StoredProcedures.Loyalty.GetHistory, new { UserId = userId, Offset = offset, PageSize = pageSize })).ToList();

    public Task<decimal> GetAvailablePointsAsync(int userId) =>
        sql.ExecuteScalarAsync<decimal>(StoredProcedures.Loyalty.GetAvailable, new { UserId = userId });
}
