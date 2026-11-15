SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 = created, 1 = slug exists, 2 = code or affiliate not found.
CREATE OR ALTER PROCEDURE dbo.usp_ShortLink_Create
    @Slug NVARCHAR(4000),
    @TargetPath NVARCHAR(4000),
    @PromoCodeId INT = NULL,
    @AffiliateId INT = NULL,
    @Label NVARCHAR(4000) = NULL,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF (@PromoCodeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.PromoCodes WHERE PromoCodeId = @PromoCodeId))
       OR (@AffiliateId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Affiliates WHERE AffiliateId = @AffiliateId))
    BEGIN
        COMMIT;
        SELECT 2 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.ShortLinks WITH (UPDLOCK, HOLDLOCK) WHERE Slug = @Slug)
    BEGIN
        COMMIT;
        SELECT 1 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    INSERT INTO dbo.ShortLinks (Slug, TargetPath, PromoCodeId, AffiliateId, Label, IsActive, CreatedAt, UpdatedAt)
    VALUES (@Slug, @TargetPath, @PromoCodeId, @AffiliateId, @Label, @IsActive, GETDATE(), GETDATE());

    DECLARE @Id INT = CAST(SCOPE_IDENTITY() AS INT);
    COMMIT;
    SELECT 0 AS Result, @Id AS Id;
END
GO
