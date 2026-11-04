SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LoyaltyPoints_GetAvailable
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(SUM(CASE
        WHEN PointsType = 'earned' AND (ExpiryDate IS NULL OR ExpiryDate > GETDATE()) THEN Points
        WHEN PointsType = 'redeemed' THEN -Points
        WHEN PointsType = 'expired' THEN -Points
        ELSE 0
    END), 0)
    FROM dbo.LoyaltyPoints
    WHERE UserId = @UserId;
END
GO
