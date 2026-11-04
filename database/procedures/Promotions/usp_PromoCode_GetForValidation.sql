SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_GetForValidation
    @Code NVARCHAR(4000),
    @CustomerEmail NVARCHAR(4000)
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
           (SELECT COUNT(*) FROM dbo.PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
           (SELECT COUNT(*) FROM dbo.PromoCodeUsages u
            WHERE u.PromoCodeId = pc.PromoCodeId
              AND @CustomerEmail IS NOT NULL
              AND LOWER(u.CustomerEmail) = LOWER(@CustomerEmail)) AS CustomerTimesUsed
    FROM dbo.PromoCodes pc
    WHERE UPPER(pc.Code) = @Code;
END
GO
