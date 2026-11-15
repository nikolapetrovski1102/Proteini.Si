SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result sets: affiliate, its codes (with period stats), its short links, its orders in the period.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_GetDetails
    @AffiliateId INT,
    @From DATE = NULL,
    @To DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromDt DATETIME2 = @From;
    DECLARE @ToDt DATETIME2 = CASE WHEN @To IS NULL THEN NULL ELSE DATEADD(DAY, 1, CAST(@To AS DATETIME2)) END;

    SELECT a.AffiliateId, a.Name, a.Handle, a.Email, a.Phone, a.CommissionPercent, a.Notes,
           a.IsActive, a.CreatedAt, a.UpdatedAt
    FROM dbo.Affiliates a
    WHERE a.AffiliateId = @AffiliateId;

    SELECT pc.PromoCodeId, pc.Code, pc.Description, pc.DiscountType, pc.DiscountValue,
           pc.MinimumOrderAmount, pc.MaximumDiscountAmount, pc.UsageLimit, pc.PerCustomerLimit,
           pc.ValidFrom, pc.ValidUntil, pc.IsActive, pc.CreatedAt,
           pc.AppliesTo,
           (SELECT STRING_AGG(CAST(t.TargetId AS NVARCHAR(20)), N',') FROM dbo.PromoCodeTargets t
            WHERE t.PromoCodeId = pc.PromoCodeId AND t.TargetType = N'product') AS ProductIdList,
           (SELECT STRING_AGG(CAST(t.TargetId AS NVARCHAR(20)), N',') FROM dbo.PromoCodeTargets t
            WHERE t.PromoCodeId = pc.PromoCodeId AND t.TargetType = N'category') AS CategoryIdList,
           ISNULL(s.Orders, 0) AS Orders,
           ISNULL(s.NetSales, 0) AS NetSales,
           ISNULL(s.DiscountGiven, 0) AS DiscountGiven
    FROM dbo.PromoCodes pc
    OUTER APPLY (
        SELECT COUNT(*) AS Orders, SUM(v.NetSales) AS NetSales, SUM(v.PromoDiscount) AS DiscountGiven
        FROM dbo.vw_AffiliateSales v
        WHERE v.PromoCodeId = pc.PromoCodeId
          AND v.IsCommissionable = 1
          AND (@FromDt IS NULL OR v.Order_Date >= @FromDt)
          AND (@ToDt IS NULL OR v.Order_Date < @ToDt)
    ) s
    WHERE pc.AffiliateId = @AffiliateId
    ORDER BY pc.IsActive DESC, pc.CreatedAt DESC;

    SELECT l.ShortLinkId, l.Slug, l.TargetPath, l.PromoCodeId, pc.Code, l.AffiliateId, l.Label,
           l.IsActive, l.Clicks AS TotalClicks, l.LastClickedAt, l.CreatedAt,
           (SELECT ISNULL(SUM(d.Clicks), 0) FROM dbo.ShortLinkClicksDaily d
            WHERE d.ShortLinkId = l.ShortLinkId
              AND (@From IS NULL OR d.ClickDate >= @From)
              AND (@To IS NULL OR d.ClickDate <= @To)) AS PeriodClicks
    FROM dbo.ShortLinks l
    LEFT JOIN dbo.PromoCodes pc ON pc.PromoCodeId = l.PromoCodeId
    WHERE l.AffiliateId = @AffiliateId
    ORDER BY l.IsActive DESC, l.CreatedAt DESC;

    SELECT TOP (500) v.Order_Id AS OrderId, v.Order_Number AS OrderNumber, v.Order_Date AS OrderDate,
           v.Order_Status AS OrderStatus, v.Payment_Method AS PaymentMethod, v.Payment_Status AS PaymentStatus,
           v.Billing_FullName AS CustomerName, v.Code, v.Subtotal, v.PromoDiscount, v.NetSales,
           v.IsCommissionable,
           CAST(CASE WHEN v.IsCommissionable = 1 THEN ROUND(v.NetSales * a.CommissionPercent / 100, 2) ELSE 0 END AS DECIMAL(18, 2)) AS Commission
    FROM dbo.vw_AffiliateSales v
    INNER JOIN dbo.Affiliates a ON a.AffiliateId = v.AffiliateId
    WHERE v.AffiliateId = @AffiliateId
      AND (@FromDt IS NULL OR v.Order_Date >= @FromDt)
      AND (@ToDt IS NULL OR v.Order_Date < @ToDt)
    ORDER BY v.Order_Date DESC, v.Order_Id DESC;
END
GO
