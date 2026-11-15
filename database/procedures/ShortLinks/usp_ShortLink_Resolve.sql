SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Public: looks up an active link, counts the click and returns where to go plus the code to remember.
-- The code is returned only while it is active; checkout re-validates it anyway.
CREATE OR ALTER PROCEDURE dbo.usp_ShortLink_Resolve
    @Slug NVARCHAR(4000),
    @Today DATE,
    @CountClick BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ShortLinkId INT, @TargetPath NVARCHAR(500), @Code NVARCHAR(60);

    SELECT @ShortLinkId = l.ShortLinkId,
           @TargetPath = l.TargetPath,
           @Code = CASE WHEN pc.IsActive = 1 AND (pc.ValidUntil IS NULL OR pc.ValidUntil >= GETDATE()) THEN pc.Code END
    FROM dbo.ShortLinks l
    LEFT JOIN dbo.PromoCodes pc ON pc.PromoCodeId = l.PromoCodeId
    WHERE l.Slug = @Slug AND l.IsActive = 1;

    IF @ShortLinkId IS NULL
        RETURN;

    IF @CountClick = 1
    BEGIN
        BEGIN TRANSACTION;

        UPDATE dbo.ShortLinks SET Clicks = Clicks + 1, LastClickedAt = GETDATE() WHERE ShortLinkId = @ShortLinkId;

        UPDATE dbo.ShortLinkClicksDaily WITH (UPDLOCK, HOLDLOCK)
        SET Clicks = Clicks + 1
        WHERE ShortLinkId = @ShortLinkId AND ClickDate = @Today;

        IF @@ROWCOUNT = 0
            INSERT INTO dbo.ShortLinkClicksDaily (ShortLinkId, ClickDate, Clicks) VALUES (@ShortLinkId, @Today, 1);

        COMMIT;
    END

    SELECT @TargetPath AS TargetPath, @Code AS Code;
END
GO
