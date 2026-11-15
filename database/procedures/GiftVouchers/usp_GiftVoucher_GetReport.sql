SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_GetReport
AS
BEGIN
    SET NOCOUNT ON;

    SELECT v.Code, v.InitialValue, v.RemainingValue,
           CASE WHEN v.Status = 'active' AND v.ExpiresAt < SYSUTCDATETIME() THEN 'expired' ELSE v.Status END AS Status,
           v.PurchasedOrderId,
           v.PurchaserName, v.PurchaserEmail, v.RecipientName, v.RecipientEmail, v.ValidFrom, v.ExpiresAt, v.CreatedAt,
           r.OrderId AS RedemptionOrderId, r.Amount AS RedemptionAmount,
           r.Status AS RedemptionStatus, r.Channel AS RedemptionChannel, r.RedeemedBy, r.CreatedAt AS RedemptionCreatedAt
    FROM dbo.GiftVouchers v
    LEFT JOIN dbo.GiftVoucherRedemptions r ON r.GiftVoucherId = v.GiftVoucherId
    ORDER BY v.CreatedAt DESC, r.CreatedAt DESC;
END
GO
