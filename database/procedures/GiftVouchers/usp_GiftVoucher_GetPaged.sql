SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_GetPaged
    @Search NVARCHAR(4000),
    @Status NVARCHAR(4000),
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1)
    FROM dbo.GiftVouchers v
    WHERE (@Search IS NULL OR v.Code LIKE @Search OR v.PurchaserEmail LIKE @Search OR v.RecipientEmail LIKE @Search)
      AND (@Status IS NULL OR v.Status = @Status);

    SELECT v.GiftVoucherId, v.Code, v.InitialValue, v.RemainingValue, v.Currency,
           CASE WHEN v.Status = 'active' AND v.ExpiresAt < SYSUTCDATETIME() THEN 'expired' ELSE v.Status END AS Status,
           v.PurchasedOrderId, v.PurchaserEmail, v.RecipientEmail, v.ValidFrom, v.ExpiresAt,
           v.CreatedAt, v.UpdatedAt,
           (SELECT COUNT(1) FROM dbo.GiftVoucherRedemptions r WHERE r.GiftVoucherId = v.GiftVoucherId AND r.Status = 'redeemed') AS RedemptionCount,
           (SELECT COALESCE(SUM(r.Amount), 0) FROM dbo.GiftVoucherRedemptions r WHERE r.GiftVoucherId = v.GiftVoucherId AND r.Status = 'redeemed') AS RedeemedValue
    FROM dbo.GiftVouchers v
    WHERE (@Search IS NULL OR v.Code LIKE @Search OR v.PurchaserEmail LIKE @Search OR v.RecipientEmail LIKE @Search)
      AND (@Status IS NULL OR v.Status = @Status)
    ORDER BY v.CreatedAt DESC, v.GiftVoucherId DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
