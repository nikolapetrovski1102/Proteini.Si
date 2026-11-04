SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LoyaltyPoints_GetSummary
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

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
    FROM dbo.LoyaltyPoints
    WHERE UserId = @UserId;
END
GO
