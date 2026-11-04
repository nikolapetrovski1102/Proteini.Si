SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCodeUsage_GetReport
    @From DATETIME2,
    @To DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    SELECT pc.Code,
           o.Order_Number AS OrderNumber,
           u.CustomerEmail,
           u.DiscountAmount,
           u.UsedAt
    FROM dbo.PromoCodeUsages u
    INNER JOIN dbo.PromoCodes pc ON pc.PromoCodeId = u.PromoCodeId
    INNER JOIN dbo.Orders o ON o.Order_Id = u.OrderId
    WHERE (@From IS NULL OR u.UsedAt >= @From)
      AND (@To IS NULL OR u.UsedAt < DATEADD(day, 1, @To))
    ORDER BY u.UsedAt DESC;
END
GO
