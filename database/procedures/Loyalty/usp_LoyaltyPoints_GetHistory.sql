SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LoyaltyPoints_GetHistory
    @UserId INT,
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

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
    FROM dbo.LoyaltyPoints
    WHERE UserId = @UserId
    ORDER BY TransactionDate DESC, LoyaltyPointId DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
