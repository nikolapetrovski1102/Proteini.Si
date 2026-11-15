SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT pc.PromoCodeId,
           pc.Code,
           pc.Description,
           pc.DiscountType,
           pc.DiscountValue,
           pc.MinimumOrderAmount,
           pc.MaximumDiscountAmount,
           pc.UsageLimit,
           pc.PerCustomerLimit,
           pc.ValidFrom,
           pc.ValidUntil,
           pc.IsActive,
           pc.CreatedAt,
           pc.UpdatedAt,
           pc.AffiliateId,
           pc.AppliesTo,
           (SELECT STRING_AGG(CAST(t.TargetId AS NVARCHAR(20)), N',') FROM dbo.PromoCodeTargets t
            WHERE t.PromoCodeId = pc.PromoCodeId AND t.TargetType = N'product') AS ProductIdList,
           (SELECT STRING_AGG(CAST(t.TargetId AS NVARCHAR(20)), N',') FROM dbo.PromoCodeTargets t
            WHERE t.PromoCodeId = pc.PromoCodeId AND t.TargetType = N'category') AS CategoryIdList,
           a.Name AS AffiliateName,
           (SELECT COUNT(*) FROM dbo.PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
           (SELECT COALESCE(SUM(u.DiscountAmount), 0) FROM dbo.PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TotalDiscount
    FROM dbo.PromoCodes pc
    LEFT JOIN dbo.Affiliates a ON a.AffiliateId = pc.AffiliateId
    ORDER BY pc.CreatedAt DESC, pc.PromoCodeId DESC;
END
GO
