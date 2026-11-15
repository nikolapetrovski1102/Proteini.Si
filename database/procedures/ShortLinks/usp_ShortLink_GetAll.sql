SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- All short links with clicks and the sales of the code they carry. @From/@To inclusive dates; NULL = all time.
CREATE OR ALTER PROCEDURE dbo.usp_ShortLink_GetAll
    @From DATE = NULL,
    @To DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDt DATETIME2 = @From;
    DECLARE @ToDt DATETIME2 = CASE WHEN @To IS NULL THEN NULL ELSE DATEADD(DAY, 1, CAST(@To AS DATETIME2)) END;

    SELECT l.ShortLinkId, l.Slug, l.TargetPath, l.PromoCodeId, pc.Code, pc.IsActive AS CodeIsActive,
           l.AffiliateId, a.Name AS AffiliateName, l.Label, l.IsActive,
           l.Clicks AS TotalClicks, l.LastClickedAt, l.CreatedAt, l.UpdatedAt,
           (SELECT ISNULL(SUM(d.Clicks), 0) FROM dbo.ShortLinkClicksDaily d
            WHERE d.ShortLinkId = l.ShortLinkId
              AND (@From IS NULL OR d.ClickDate >= @From)
              AND (@To IS NULL OR d.ClickDate <= @To)) AS PeriodClicks,
           ISNULL(s.Orders, 0) AS CodeOrders,
           ISNULL(s.NetSales, 0) AS CodeNetSales
    FROM dbo.ShortLinks l
    LEFT JOIN dbo.PromoCodes pc ON pc.PromoCodeId = l.PromoCodeId
    LEFT JOIN dbo.Affiliates a ON a.AffiliateId = l.AffiliateId
    OUTER APPLY (
        SELECT COUNT(*) AS Orders, SUM(ISNULL(o.Subtotal, 0) - ISNULL(o.Promo_Discount, 0)) AS NetSales
        FROM dbo.PromoCodeUsages u
        INNER JOIN dbo.Orders o ON o.Order_Id = u.OrderId
        WHERE u.PromoCodeId = l.PromoCodeId
          AND o.Order_Status NOT IN ('cancelled', 'rejected', 'refunded')
          AND ISNULL(o.Payment_Status, 'pending') NOT IN ('failed', 'refunded')
          AND (o.Payment_Method <> 'credit_card' OR o.Payment_Status IN ('completed', 'paid'))
          AND (@FromDt IS NULL OR o.Order_Date >= @FromDt)
          AND (@ToDt IS NULL OR o.Order_Date < @ToDt)
    ) s
    ORDER BY l.IsActive DESC, l.CreatedAt DESC, l.ShortLinkId DESC;
END
GO
