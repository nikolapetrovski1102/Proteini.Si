SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FreeGift_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.FreeGifts WITH (UPDLOCK, HOLDLOCK) WHERE FreeGiftId = @Id)
    BEGIN
        COMMIT;
        SELECT 4 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.OrderFreeGifts WITH (UPDLOCK, HOLDLOCK) WHERE FreeGiftId = @Id)
    BEGIN
        UPDATE dbo.FreeGifts SET IsActive = 0, UpdatedAt = GETDATE() WHERE FreeGiftId = @Id;
        COMMIT;
        SELECT 1 AS Result;
        RETURN;
    END

    DELETE FROM dbo.FreeGifts WHERE FreeGiftId = @Id;
    COMMIT;
    SELECT 0 AS Result;
END
GO
