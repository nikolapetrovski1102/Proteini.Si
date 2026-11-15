SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 = updated, 1 = slug exists, 2 = code or affiliate not found, 4 = link not found.
CREATE OR ALTER PROCEDURE dbo.usp_ShortLink_Update
    @ShortLinkId INT,
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

    IF NOT EXISTS (SELECT 1 FROM dbo.ShortLinks WITH (UPDLOCK, HOLDLOCK) WHERE ShortLinkId = @ShortLinkId)
    BEGIN
        COMMIT;
        SELECT 4 AS Result;
        RETURN;
    END

    IF (@PromoCodeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.PromoCodes WHERE PromoCodeId = @PromoCodeId))
       OR (@AffiliateId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Affiliates WHERE AffiliateId = @AffiliateId))
    BEGIN
        COMMIT;
        SELECT 2 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.ShortLinks WITH (UPDLOCK, HOLDLOCK) WHERE Slug = @Slug AND ShortLinkId <> @ShortLinkId)
    BEGIN
        COMMIT;
        SELECT 1 AS Result;
        RETURN;
    END

    UPDATE dbo.ShortLinks
    SET Slug = @Slug, TargetPath = @TargetPath, PromoCodeId = @PromoCodeId, AffiliateId = @AffiliateId,
        Label = @Label, IsActive = @IsActive, UpdatedAt = GETDATE()
    WHERE ShortLinkId = @ShortLinkId;

    COMMIT;
    SELECT 0 AS Result;
END
GO
