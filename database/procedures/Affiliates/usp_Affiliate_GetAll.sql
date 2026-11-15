SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Affiliates with their numbers. @From/@To (inclusive dates) limit orders and clicks; NULL = all time.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_GetAll
    @From DATE = NULL,
    @To DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDt DATETIME2 = @From;
    DECLARE @ToDt DATETIME2 = CASE WHEN @To IS NULL THEN NULL ELSE DATEADD(DAY, 1, CAST(@To AS DATETIME2)) END;

    SELECT a.AffiliateId,
           a.Name,
           a.Handle,
           a.Email,
           a.Phone,
           a.CommissionPercent,
           a.Notes,
           a.IsActive,
           a.CreatedAt,
           a.UpdatedAt,
           (SELECT COUNT(*) FROM dbo.PromoCodes pc WHERE pc.AffiliateId = a.AffiliateId) AS CodesCount,
           (SELECT COUNT(*) FROM dbo.ShortLinks l WHERE l.AffiliateId = a.AffiliateId) AS LinksCount,
           (SELECT STRING_AGG(pc.Code, ', ') FROM dbo.PromoCodes pc WHERE pc.AffiliateId = a.AffiliateId AND pc.IsActive = 1) AS ActiveCodes,
           (SELECT TOP (1) l.Slug FROM dbo.ShortLinks l WHERE l.AffiliateId = a.AffiliateId AND l.IsActive = 1 ORDER BY l.ShortLinkId) AS PrimarySlug,
           CASE WHEN @From IS NULL AND @To IS NULL
                THEN (SELECT ISNULL(SUM(l.Clicks), 0) FROM dbo.ShortLinks l WHERE l.AffiliateId = a.AffiliateId)
                ELSE (SELECT ISNULL(SUM(d.Clicks), 0)
                      FROM dbo.ShortLinkClicksDaily d
                      INNER JOIN dbo.ShortLinks l ON l.ShortLinkId = d.ShortLinkId
                      WHERE l.AffiliateId = a.AffiliateId
                        AND (@From IS NULL OR d.ClickDate >= @From)
                        AND (@To IS NULL OR d.ClickDate <= @To)) END AS Clicks,
           ISNULL(s.Orders, 0) AS Orders,
           ISNULL(s.NetSales, 0) AS NetSales,
           ISNULL(s.DiscountGiven, 0) AS DiscountGiven,
           CAST(ROUND(ISNULL(s.NetSales, 0) * a.CommissionPercent / 100, 2) AS DECIMAL(18, 2)) AS Commission
    FROM dbo.Affiliates a
    OUTER APPLY (
        SELECT COUNT(*) AS Orders, SUM(v.NetSales) AS NetSales, SUM(v.PromoDiscount) AS DiscountGiven
        FROM dbo.vw_AffiliateSales v
        WHERE v.AffiliateId = a.AffiliateId
          AND v.IsCommissionable = 1
          AND (@FromDt IS NULL OR v.Order_Date >= @FromDt)
          AND (@ToDt IS NULL OR v.Order_Date < @ToDt)
    ) s
    ORDER BY a.IsActive DESC, ISNULL(s.NetSales, 0) DESC, a.Name;
END
GO
