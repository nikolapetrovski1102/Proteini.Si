using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class LoyaltyService(ILoyaltyProvider provider, ILogger<LoyaltyService> logger) : ILoyaltyService
{
    public async Task<LoyaltySummary> GetUserPointsSummaryAsync(int userId)
    {
        try
        {
            return await provider.GetSummaryAsync(userId) ?? new LoyaltySummary();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting points summary for user {UserId}", userId);
            return new LoyaltySummary();
        }
    }

    public async Task<List<LoyaltyPoint>> GetUserPointsHistoryAsync(int userId, int page = 1, int pageSize = 20)
    {
        var offset = ((long)page - 1) * pageSize;
        if (page < 1 || pageSize < 1 || offset > int.MaxValue)
            return [];

        try
        {
            return await provider.GetHistoryAsync(userId, (int)offset, pageSize);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting points history for user {UserId}", userId);
            return [];
        }
    }

    public async Task<decimal> GetAvailablePointsAsync(int userId)
    {
        try
        {
            return await provider.GetAvailablePointsAsync(userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting available points for user {UserId}", userId);
            return 0;
        }
    }
}
