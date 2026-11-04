using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface ILoyaltyService
{
    Task<LoyaltySummary> GetUserPointsSummaryAsync(int userId);
    Task<List<LoyaltyPoint>> GetUserPointsHistoryAsync(int userId, int page = 1, int pageSize = 20);
    Task<decimal> GetAvailablePointsAsync(int userId);
}
