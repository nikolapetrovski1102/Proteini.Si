SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_UpdateStatus
    @Id INT,
    @Status NVARCHAR(4000),
    @ExpiresAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.GiftVouchers
    SET Status = CASE
            WHEN RemainingValue <= 0 THEN 'depleted'
            WHEN @Status = 'disabled' THEN 'disabled'
            WHEN @ExpiresAt IS NOT NULL AND @ExpiresAt < SYSUTCDATETIME() THEN 'expired'
            ELSE 'active'
        END,
        ExpiresAt = @ExpiresAt,
        UpdatedAt = SYSUTCDATETIME()
    WHERE GiftVoucherId = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
