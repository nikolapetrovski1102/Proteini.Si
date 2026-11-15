SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetIssuedVouchers
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT v.GiftVoucherId, v.Code, v.InitialValue, v.RemainingValue, v.ExpiresAt,
           COALESCE(v.PurchaserName, o.Billing_FullName) AS PurchaserName,
           v.PurchaserEmail, v.RecipientName, v.RecipientEmail, v.GiftMessage,
           o.Order_Number, o.Language
    FROM dbo.GiftVouchers v
    INNER JOIN dbo.Orders o ON o.Order_Id = v.PurchasedOrderId
    WHERE v.PurchasedOrderId = @OrderId
    ORDER BY v.GiftVoucherId;
END
GO
