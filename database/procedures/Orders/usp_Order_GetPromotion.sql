SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetPromotion
    @Code NVARCHAR(4000),
    @UserId INT,
    @CustomerEmail NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        pc.PromoCodeId,
        pc.Code,
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
           AND ((@UserId > 0 AND u.UserId = @UserId)
                OR (@UserId <= 0 AND LOWER(u.CustomerEmail) = LOWER(@CustomerEmail)))) AS CustomerTimesUsed
    FROM dbo.PromoCodes pc
    WHERE UPPER(pc.Code) = @Code;
END
GO
