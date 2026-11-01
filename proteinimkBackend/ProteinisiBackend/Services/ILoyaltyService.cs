using ProteinisiBackend.Models.DTOs;
using System.Threading.Tasks;

namespace ProteinisiBackend.Services
{
    public interface ILoyaltyService
    {
        Task<LoyaltyResponseDto> AddPointsAsync(int userId, decimal points, string sourceType, int? sourceId, string description, DateTime? expiryDate = null);
        Task<LoyaltyResponseDto> RedeemPointsAsync(int userId, decimal pointsToRedeem, int? orderId = null);
        Task<LoyaltySummaryDto> GetUserPointsSummaryAsync(int userId);
        Task<List<LoyaltyPointDto>> GetUserPointsHistoryAsync(int userId, int page = 1, int pageSize = 20);
        Task<LoyaltyResponseDto> CalculateAndAddOrderPointsAsync(int orderId, decimal orderSubtotal);
        Task<LoyaltyResponseDto> ExpireOldPointsAsync();
        Task<decimal> GetAvailablePointsAsync(int userId);
    }
}