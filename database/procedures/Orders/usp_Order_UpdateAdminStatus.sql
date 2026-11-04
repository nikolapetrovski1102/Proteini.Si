SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_UpdateAdminStatus
    @OrderId INT,
    @OrderStatus NVARCHAR(50),
    @PaymentStatus NVARCHAR(4000),
    @TransactionId NVARCHAR(4000) = NULL,
    @TrackingNumber NVARCHAR(4000) = NULL,
    @TrackingUrl NVARCHAR(4000) = NULL,
    @ReleaseVoucher BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    UPDATE dbo.Orders
    SET Order_Status = @OrderStatus,
        Payment_Status = @PaymentStatus,
        Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
        Tracking_Number = @TrackingNumber,
        Tracking_Url = @TrackingUrl,
        Shipped_At = CASE WHEN @OrderStatus = 'shipped' AND Shipped_At IS NULL THEN SYSUTCDATETIME() ELSE Shipped_At END,
        Updated_At = GETDATE()
    WHERE Order_Id = @OrderId;

    IF @ReleaseVoucher = 1
        EXEC dbo.usp_Order_ReleaseVoucher @OrderId = @OrderId;

    COMMIT TRANSACTION;
END
GO
