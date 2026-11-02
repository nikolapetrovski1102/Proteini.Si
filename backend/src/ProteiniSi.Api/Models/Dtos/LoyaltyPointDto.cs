using System;

namespace ProteiniSi.Api.Models.DTOs
{
    public class LoyaltyPointDto
    {
        public int LoyaltyPointId { get; set; }
        public int UserId { get; set; }
        public decimal Points { get; set; }
        public string PointsType { get; set; }
        public string SourceType { get; set; }
        public int? SourceId { get; set; }
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class LoyaltySummaryDto
    {
        public decimal TotalPoints { get; set; }
        public decimal AvailablePoints { get; set; }
        public decimal TotalEarned { get; set; }
        public decimal TotalRedeemed { get; set; }
        public decimal TotalExpired { get; set; }
        public int TransactionCount { get; set; }
    }

    public class AddLoyaltyPointsDto
    {
        public int UserId { get; set; }
        public decimal Points { get; set; }
        public string SourceType { get; set; }
        public int? SourceId { get; set; }
        public string Description { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class RedeemPointsDto
    {
        public int UserId { get; set; }
        public decimal PointsToRedeem { get; set; }
        public int? OrderId { get; set; }
    }

    public class LoyaltyResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public dynamic Data { get; set; }
    }
}