SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 = deleted, 1 = archived (its codes were used by orders, so history is kept), 4 = not found.
-- Archiving switches off the affiliate, its codes and its links.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.Affiliates WITH (UPDLOCK, HOLDLOCK) WHERE AffiliateId = @Id)
    BEGIN
        COMMIT;
        SELECT 4 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1
               FROM dbo.PromoCodeUsages u WITH (UPDLOCK, HOLDLOCK)
               INNER JOIN dbo.PromoCodes pc ON pc.PromoCodeId = u.PromoCodeId
               WHERE pc.AffiliateId = @Id)
    BEGIN
        UPDATE dbo.Affiliates SET IsActive = 0, UpdatedAt = GETDATE() WHERE AffiliateId = @Id;
        UPDATE dbo.PromoCodes SET IsActive = 0, UpdatedAt = GETDATE() WHERE AffiliateId = @Id;
        UPDATE dbo.ShortLinks SET IsActive = 0, UpdatedAt = GETDATE() WHERE AffiliateId = @Id;
        COMMIT;
        SELECT 1 AS Result;
        RETURN;
    END

    DELETE FROM dbo.ShortLinks WHERE AffiliateId = @Id;
    UPDATE dbo.ShortLinks SET PromoCodeId = NULL, UpdatedAt = GETDATE()
    WHERE PromoCodeId IN (SELECT PromoCodeId FROM dbo.PromoCodes WHERE AffiliateId = @Id);
    DELETE FROM dbo.PromoCodes WHERE AffiliateId = @Id;
    DELETE FROM dbo.Affiliates WHERE AffiliateId = @Id;
    COMMIT;
    SELECT 0 AS Result;
END
GO
