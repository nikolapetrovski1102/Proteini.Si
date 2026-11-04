SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE PromoCodeId = @Id)
    BEGIN
        COMMIT;
        SELECT 4 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.PromoCodeUsages WITH (UPDLOCK, HOLDLOCK) WHERE PromoCodeId = @Id)
    BEGIN
        UPDATE dbo.PromoCodes SET IsActive = 0, UpdatedAt = GETDATE() WHERE PromoCodeId = @Id;
        COMMIT;
        SELECT 1 AS Result;
        RETURN;
    END

    DELETE FROM dbo.PromoCodes WHERE PromoCodeId = @Id;
    COMMIT;
    SELECT 0 AS Result;
END
GO
