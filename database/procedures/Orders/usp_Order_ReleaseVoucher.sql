SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_ReleaseVoucher
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @RedemptionId INT, @GiftVoucherId INT, @Amount DECIMAL(38, 10);

    SELECT TOP 1
        @RedemptionId = GiftVoucherRedemptionId,
        @GiftVoucherId = GiftVoucherId,
        @Amount = Amount
    FROM dbo.GiftVoucherRedemptions WITH (UPDLOCK, HOLDLOCK)
    WHERE OrderId = @OrderId AND Status = 'reserved';

    IF @RedemptionId IS NOT NULL
    BEGIN
        UPDATE dbo.GiftVouchers
        SET RemainingValue = RemainingValue + @Amount,
            Status = CASE WHEN Status = 'disabled' THEN 'disabled' ELSE 'active' END,
            UpdatedAt = SYSUTCDATETIME()
        WHERE GiftVoucherId = @GiftVoucherId;

        UPDATE dbo.GiftVoucherRedemptions
        SET Status = 'released', ReleasedAt = SYSUTCDATETIME()
        WHERE GiftVoucherRedemptionId = @RedemptionId AND Status = 'reserved';
    END

    COMMIT TRANSACTION;
END
GO
