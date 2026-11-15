SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Staff redeem (part of) a voucher at the shop counter. Same rules as an online order: active, started, not expired,
-- and never more than the remaining balance. Returns the new balance.
CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_RedeemInStore
    @Code NVARCHAR(64),
    @Amount DECIMAL(18, 2),
    @RedeemedBy NVARCHAR(255) = NULL,
    @Note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @Amount IS NULL OR @Amount <= 0
        THROW 50021, 'Enter an amount greater than zero.', 1;

    BEGIN TRANSACTION;

    DECLARE @Id INT, @Status NVARCHAR(20), @Remaining DECIMAL(18, 2), @ValidFrom DATETIME2(3), @ExpiresAt DATETIME2(3);

    SELECT @Id = GiftVoucherId, @Status = Status, @Remaining = RemainingValue, @ValidFrom = ValidFrom, @ExpiresAt = ExpiresAt
    FROM dbo.GiftVouchers WITH (UPDLOCK, HOLDLOCK)
    WHERE Code = @Code;

    IF @Id IS NULL
        THROW 50022, 'No gift voucher with this code.', 1;
    IF @Status = 'disabled'
        THROW 50023, 'This gift voucher is disabled.', 1;
    IF @Remaining <= 0 OR @Status = 'depleted'
        THROW 50024, 'This gift voucher has already been fully used.', 1;
    IF @Status = 'expired' OR (@ExpiresAt IS NOT NULL AND @ExpiresAt < SYSUTCDATETIME())
        THROW 50025, 'This gift voucher has expired.', 1;
    IF @ValidFrom > SYSUTCDATETIME()
        THROW 50026, 'This gift voucher is not valid yet.', 1;
    IF @Amount > @Remaining
        THROW 50027, 'The amount is more than the remaining balance.', 1;

    UPDATE dbo.GiftVouchers
    SET RemainingValue = RemainingValue - @Amount,
        Status = CASE WHEN RemainingValue - @Amount <= 0 THEN 'depleted' ELSE 'active' END,
        UpdatedAt = SYSUTCDATETIME()
    WHERE GiftVoucherId = @Id;

    INSERT INTO dbo.GiftVoucherRedemptions (GiftVoucherId, OrderId, Amount, Status, Channel, RedeemedBy, Note, CreatedAt, CompletedAt)
    VALUES (@Id, NULL, @Amount, 'redeemed', N'store', @RedeemedBy, NULLIF(LTRIM(RTRIM(@Note)), N''), SYSUTCDATETIME(), SYSUTCDATETIME());

    COMMIT TRANSACTION;

    SELECT @Id AS GiftVoucherId, @Remaining - @Amount AS RemainingValue;
END
GO
