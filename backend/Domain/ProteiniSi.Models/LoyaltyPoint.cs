namespace ProteiniSi.Models;

public class LoyaltyPoint
{
    public int LoyaltyPointId { get; set; }
    public int UserId { get; set; }
    public decimal Points { get; set; }
    public string PointsType { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public int? SourceId { get; set; }
    public string? Description { get; set; }
    public DateTime TransactionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class LoyaltySummary
{
    public decimal TotalPoints { get; set; }
    public decimal AvailablePoints { get; set; }
    public decimal TotalEarned { get; set; }
    public decimal TotalRedeemed { get; set; }
    public decimal TotalExpired { get; set; }
    public int TransactionCount { get; set; }
}
