using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface ILoyaltyProvider
{
    Task<LoyaltySummary?> GetSummaryAsync(int userId);
    Task<List<LoyaltyPoint>> GetHistoryAsync(int userId, int offset, int pageSize);
    Task<decimal> GetAvailablePointsAsync(int userId);
}
