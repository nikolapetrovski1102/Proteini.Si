SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_MarkPaymentFailed
    @OrderId INT,
    @TransactionId NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    -- A late or replayed failure notification must never undo a completed payment.
    IF EXISTS (
        SELECT 1 FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK)
        WHERE Order_Id = @OrderId AND LOWER(Payment_Status) = 'completed'
    )
    BEGIN
        COMMIT TRANSACTION;
        RETURN;
    END

    EXEC dbo.usp_Order_ReleaseVoucher @OrderId = @OrderId;

    UPDATE dbo.Orders
    SET Payment_Status = 'failed',
        Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
        Updated_At = GETDATE()
    WHERE Order_Id = @OrderId;

    COMMIT TRANSACTION;
END
GO
