using Dapper;
using Microsoft.Data.SqlClient;
using ProteiniSi.Api.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ProteiniSi.Api.Services
{
    public class LoyaltyService : ILoyaltyService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;

        public LoyaltyService(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<LoyaltyResponseDto> AddPointsAsync(int userId, decimal points, string sourceType, int? sourceId, string description, DateTime? expiryDate = null)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                if (!expiryDate.HasValue && points > 0)
                {
                    expiryDate = DateTime.Now.AddMonths(12);
                }

                var sql = @"
INSERT INTO LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate, ExpiryDate)
VALUES (@UserId, @Points, 'earned', @SourceType, @SourceId, @Description, GETDATE(), @ExpiryDate);
SELECT CAST(SCOPE_IDENTITY() AS int);";

                var parameters = new
                {
                    UserId = userId,
                    Points = points,
                    SourceType = sourceType,
                    SourceId = sourceId,
                    Description = description,
                    ExpiryDate = expiryDate
                };

                var pointId = await connection.ExecuteScalarAsync<int>(sql, parameters);

                return new LoyaltyResponseDto
                {
                    Success = true,
                    Message = $"{points} loyalty points added successfully",
                    Data = new { PointId = pointId, Points = points }
                };
            }
            catch (Exception ex)
            {
                return new LoyaltyResponseDto
                {
                    Success = false,
                    Message = $"Failed to add points: {ex.Message}"
                };
            }
        }

        public async Task<LoyaltyResponseDto> RedeemPointsAsync(int userId, decimal pointsToRedeem, int? orderId = null)
        {
            try
            {
                var availablePoints = await GetAvailablePointsAsync(userId);

                if (availablePoints < pointsToRedeem)
                {
                    return new LoyaltyResponseDto
                    {
                        Success = false,
                        Message = $"Insufficient points. Available: {availablePoints}, Requested: {pointsToRedeem}"
                    };
                }

                using var connection = new SqlConnection(_connectionString);

                var sql = @"
INSERT INTO LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
VALUES (@UserId, @Points, 'redeemed', 'order', @SourceId, @Description, GETDATE());";

                var parameters = new
                {
                    UserId = userId,
                    Points = pointsToRedeem,
                    SourceId = orderId,
                    Description = $"Redeemed {pointsToRedeem} points for order #{orderId}"
                };

                await connection.ExecuteAsync(sql, parameters);

                return new LoyaltyResponseDto
                {
                    Success = true,
                    Message = $"{pointsToRedeem} points redeemed successfully",
                    Data = new { RedeemedPoints = pointsToRedeem }
                };
            }
            catch (Exception ex)
            {
                return new LoyaltyResponseDto
                {
                    Success = false,
                    Message = $"Failed to redeem points: {ex.Message}"
                };
            }
        }

        public async Task<LoyaltySummaryDto> GetUserPointsSummaryAsync(int userId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var sql = @"
SELECT 
    SUM(CASE 
        WHEN PointsType = 'earned' THEN Points 
        WHEN PointsType = 'redeemed' THEN -Points 
        WHEN PointsType = 'expired' THEN -Points 
        ELSE Points 
    END) AS TotalPoints,
    SUM(CASE 
        WHEN PointsType = 'earned' AND (ExpiryDate IS NULL OR ExpiryDate > GETDATE()) THEN Points 
        WHEN PointsType = 'redeemed' THEN -Points 
        WHEN PointsType = 'expired' THEN -Points 
        ELSE 0 
    END) AS AvailablePoints,
    SUM(CASE WHEN PointsType = 'earned' THEN Points ELSE 0 END) AS TotalEarned,
    SUM(CASE WHEN PointsType = 'redeemed' THEN Points ELSE 0 END) AS TotalRedeemed,
    SUM(CASE WHEN PointsType = 'expired' THEN Points ELSE 0 END) AS TotalExpired,
    COUNT(*) AS TransactionCount
FROM LoyaltyPoints
WHERE UserId = @UserId";

                var result = await connection.QueryFirstOrDefaultAsync<LoyaltySummaryDto>(sql, new { UserId = userId });

                if (result == null)
                {
                    return new LoyaltySummaryDto
                    {
                        TotalPoints = 0,
                        AvailablePoints = 0,
                        TotalEarned = 0,
                        TotalRedeemed = 0,
                        TotalExpired = 0,
                        TransactionCount = 0
                    };
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user points summary: {ex.Message}");
                return new LoyaltySummaryDto
                {
                    TotalPoints = 0,
                    AvailablePoints = 0,
                    TotalEarned = 0,
                    TotalRedeemed = 0,
                    TotalExpired = 0,
                    TransactionCount = 0
                };
            }
        }

        public async Task<List<LoyaltyPointDto>> GetUserPointsHistoryAsync(int userId, int page = 1, int pageSize = 20)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var offset = (page - 1) * pageSize;

                var sql = @"
SELECT 
    LoyaltyPointId,
    UserId,
    Points,
    PointsType,
    SourceType,
    SourceId,
    Description,
    TransactionDate,
    ExpiryDate
FROM LoyaltyPoints
WHERE UserId = @UserId
ORDER BY TransactionDate DESC
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

                var result = await connection.QueryAsync<LoyaltyPointDto>(sql, new { UserId = userId, Offset = offset, PageSize = pageSize });

                return result.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user points history: {ex.Message}");
                return new List<LoyaltyPointDto>();
            }
        }

        public async Task<LoyaltyResponseDto> CalculateAndAddOrderPointsAsync(int orderId, decimal orderSubtotal)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var getUserIdSql = "SELECT User_Id FROM Orders WHERE Order_Id = @OrderId";
                var userId = await connection.ExecuteScalarAsync<int?>(getUserIdSql, new { OrderId = orderId });

                if (!userId.HasValue)
                {
                    return new LoyaltyResponseDto
                    {
                        Success = false,
                        Message = "Order not found"
                    };
                }

                var getOrderItemsSql = @"
SELECT 
    oi.Quantity,
    oi.UnitPrice,
    oi.Variant_Id,
    pv.Price AS Variant_Price,
    pv.Compare_Price AS Variant_Compare_Price,
    p.Compare_Price AS Product_Compare_Price,
    p.Price AS Product_Price
FROM OrderItems oi
LEFT JOIN ProductVariants pv ON oi.Variant_Id = pv.Variant_Id AND pv.IsActive = 1
LEFT JOIN Products p ON oi.Product_Id = p.Product_Id
WHERE oi.Order_Id = @OrderId";

                var orderItems = await connection.QueryAsync<dynamic>(getOrderItemsSql, new { OrderId = orderId });

                decimal totalNonDiscountedAmount = 0;
                int discountedItemsCount = 0;
                int nonDiscountedItemsCount = 0;

                foreach (var item in orderItems)
                {
                    decimal itemTotal = (decimal)item.UnitPrice * (int)item.Quantity;
                    bool hasDiscount = false;

                    if (item.Variant_Id != null)
                    {
                        decimal? variantPrice = item.Variant_Price;
                        decimal? variantComparePrice = item.Variant_Compare_Price;

                        if (variantComparePrice.HasValue && variantComparePrice > 0 && variantComparePrice < variantPrice)
                        {
                            hasDiscount = true;
                        }
                    }
                    else
                    {
                        decimal? productPrice = item.Product_Price;
                        decimal? productComparePrice = item.Product_Compare_Price;

                        if (productComparePrice.HasValue && productComparePrice > 0 && productComparePrice < productPrice)
                        {
                            hasDiscount = true;
                        }
                    }

                    if (hasDiscount)
                    {
                        discountedItemsCount++;
                    }
                    else
                    {
                        totalNonDiscountedAmount += itemTotal;
                        nonDiscountedItemsCount++;
                    }
                }

                var pointsToAdd = Math.Floor(totalNonDiscountedAmount * 0.02m);

                if (pointsToAdd <= 0)
                {
                    return new LoyaltyResponseDto
                    {
                        Success = true,
                        Message = discountedItemsCount > 0
                            ? $"No points awarded because all items were on sale. Discounted items: {discountedItemsCount}"
                            : "No points to add (order subtotal too low)",
                        Data = new
                        {
                            PointsAdded = 0,
                            TotalNonDiscountedAmount = totalNonDiscountedAmount,
                            DiscountedItemsCount = discountedItemsCount,
                            NonDiscountedItemsCount = nonDiscountedItemsCount
                        }
                    };
                }

                var expiryDate = DateTime.Now.AddMonths(12);
                var description = discountedItemsCount > 0
                    ? $"Earned {pointsToAdd} points from order #{orderId} (2% of {totalNonDiscountedAmount} MKD from non-discounted items). {discountedItemsCount} discounted item(s) earned 0 points."
                    : $"Earned {pointsToAdd} points from order #{orderId} (2% of {orderSubtotal} MKD)";

                var result = await AddPointsAsync(
                    userId.Value,
                    pointsToAdd,
                    "order",
                    orderId,
                    description,
                    expiryDate
                );

                return result;
            }
            catch (Exception ex)
            {
                return new LoyaltyResponseDto
                {
                    Success = false,
                    Message = $"Failed to calculate and add order points: {ex.Message}"
                };
            }
        }

        public async Task<LoyaltyResponseDto> ExpireOldPointsAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var findExpiredSql = @"
SELECT LoyaltyPointId, UserId, Points
FROM LoyaltyPoints
WHERE PointsType = 'earned' 
    AND ExpiryDate IS NOT NULL 
    AND ExpiryDate < GETDATE()
    AND NOT EXISTS (
        SELECT 1 FROM LoyaltyPoints lp2 
        WHERE lp2.SourceId = LoyaltyPoints.LoyaltyPointId 
        AND lp2.PointsType = 'expired'
    )";

                var expiredPoints = await connection.QueryAsync<dynamic>(findExpiredSql);

                var expiredCount = 0;
                foreach (var point in expiredPoints)
                {
                    var insertExpiredSql = @"
INSERT INTO LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
VALUES (@UserId, @Points, 'expired', 'system', @SourceId, @Description, GETDATE())";

                    await connection.ExecuteAsync(insertExpiredSql, new
                    {
                        UserId = point.UserId,
                        Points = point.Points,
                        SourceId = point.LoyaltyPointId,
                        Description = $"Points expired on {DateTime.Now:yyyy-MM-dd}"
                    });
                    expiredCount++;
                }

                return new LoyaltyResponseDto
                {
                    Success = true,
                    Message = $"{expiredCount} expired points processed",
                    Data = new { ExpiredCount = expiredCount }
                };
            }
            catch (Exception ex)
            {
                return new LoyaltyResponseDto
                {
                    Success = false,
                    Message = $"Failed to expire points: {ex.Message}"
                };
            }
        }

        public async Task<decimal> GetAvailablePointsAsync(int userId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);

                var sql = @"
SELECT ISNULL(SUM(CASE 
    WHEN PointsType = 'earned' AND (ExpiryDate IS NULL OR ExpiryDate > GETDATE()) THEN Points 
    WHEN PointsType = 'redeemed' THEN -Points 
    WHEN PointsType = 'expired' THEN -Points 
    ELSE 0 
END), 0)
FROM LoyaltyPoints
WHERE UserId = @UserId";

                var points = await connection.ExecuteScalarAsync<decimal>(sql, new { UserId = userId });
                return points;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting available points: {ex.Message}");
                return 0;
            }
        }
    }
}