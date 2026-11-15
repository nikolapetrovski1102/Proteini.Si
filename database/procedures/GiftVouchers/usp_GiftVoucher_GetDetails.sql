SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Admin "check a code": the voucher, then every use of it (online orders and in-shop redemptions).
CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_GetDetails
    @Code NVARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Id INT = (SELECT GiftVoucherId FROM dbo.GiftVouchers WHERE Code = @Code);

    SELECT v.GiftVoucherId, v.Code, v.InitialValue, v.RemainingValue, v.Currency,
           CASE WHEN v.Status = 'active' AND v.ExpiresAt < SYSUTCDATETIME() THEN 'expired' ELSE v.Status END AS Status,
           v.PurchasedOrderId, o.Order_Number AS PurchasedOrderNumber,
           COALESCE(v.PurchaserName, o.Billing_FullName) AS PurchaserName, v.PurchaserEmail,
           v.RecipientName, v.RecipientEmail, v.GiftMessage,
           v.ValidFrom, v.ExpiresAt, v.CreatedAt, v.UpdatedAt
    FROM dbo.GiftVouchers v
    LEFT JOIN dbo.Orders o ON o.Order_Id = v.PurchasedOrderId
    WHERE v.GiftVoucherId = @Id;

    SELECT r.GiftVoucherRedemptionId, r.OrderId, o.Order_Number AS OrderNumber, r.Amount, r.Status, r.Channel,
           r.RedeemedBy, r.Note, r.CreatedAt, r.CompletedAt, r.ReleasedAt
    FROM dbo.GiftVoucherRedemptions r
    LEFT JOIN dbo.Orders o ON o.Order_Id = r.OrderId
    WHERE r.GiftVoucherId = @Id
    ORDER BY r.CreatedAt DESC, r.GiftVoucherRedemptionId DESC;
END
GO
