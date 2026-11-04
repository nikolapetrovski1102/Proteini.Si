SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetIssuedVouchers
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Code, InitialValue, RemainingValue, ExpiresAt
    FROM dbo.GiftVouchers
    WHERE PurchasedOrderId = @OrderId
    ORDER BY GiftVoucherId;
END
GO
