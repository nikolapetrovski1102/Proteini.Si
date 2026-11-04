SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetAdminDetails
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Orders
    WHERE Order_Id = @OrderId;

    SELECT *
    FROM dbo.OrderItems
    WHERE Order_Id = @OrderId
    ORDER BY OrderItem_Id;

    SELECT OrderFreeGiftId, FreeGiftId, ProductId, VariantId, DisplayName
    FROM dbo.OrderFreeGifts
    WHERE OrderId = @OrderId
    ORDER BY OrderFreeGiftId;

    SELECT GiftVoucherId, Code, InitialValue, RemainingValue, Status, ValidFrom, ExpiresAt
    FROM dbo.GiftVouchers
    WHERE PurchasedOrderId = @OrderId
    ORDER BY GiftVoucherId;

    SELECT r.GiftVoucherRedemptionId, r.Amount, r.Status, r.CreatedAt, r.CompletedAt, r.ReleasedAt,
           v.Code
    FROM dbo.GiftVoucherRedemptions r
    INNER JOIN dbo.GiftVouchers v ON v.GiftVoucherId = r.GiftVoucherId
    WHERE r.OrderId = @OrderId;
END
GO
