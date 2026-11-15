SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Records a marketing consent decision for an email (or for a user's account email).
-- @Source 'unsubscribe' also stops the newsletter. A consent given in the browser before the person
-- unsubscribed from an email (@GivenAt < UnsubscribedAt) is ignored, so re-syncing an old cookie
-- choice after login never re-subscribes anyone.
CREATE OR ALTER PROCEDURE dbo.usp_MarketingContact_SetConsent
    @Email NVARCHAR(320) = NULL,
    @UserId INT = NULL,
    @Consent BIT,
    @Source NVARCHAR(100),
    @GivenAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @Email IS NULL AND @UserId IS NOT NULL
        SELECT @Email = User_Email FROM dbo.[User] WHERE User_Id = @UserId;
    IF @UserId IS NULL AND @Email IS NOT NULL
        SELECT @UserId = User_Id FROM dbo.[User] WHERE User_Email = @Email;

    SET @Email = LOWER(LTRIM(RTRIM(@Email)));
    IF @Email IS NULL OR @Email = N'' RETURN;

    SET @GivenAt = CASE WHEN @GivenAt IS NULL OR @GivenAt > GETDATE() THEN GETDATE() ELSE @GivenAt END;

    BEGIN TRAN;

    DECLARE @UnsubscribedAt DATETIME2 = (SELECT UnsubscribedAt FROM dbo.MarketingContacts WITH (UPDLOCK, HOLDLOCK) WHERE Email = @Email);
    IF @Consent = 1 AND @UnsubscribedAt IS NOT NULL AND @GivenAt <= @UnsubscribedAt
    BEGIN
        COMMIT;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.MarketingContacts WHERE Email = @Email)
        UPDATE dbo.MarketingContacts
        SET Consent = @Consent,
            UserId = COALESCE(@UserId, UserId),
            ConsentSource = @Source,
            ConsentAt = @GivenAt,
            UnsubscribedAt = CASE WHEN @Source = N'unsubscribe' THEN GETDATE() WHEN @Consent = 1 THEN NULL ELSE UnsubscribedAt END,
            UpdatedAt = GETDATE()
        WHERE Email = @Email;
    ELSE
        INSERT dbo.MarketingContacts (Email, UserId, Consent, ConsentSource, ConsentAt, UnsubscribedAt)
        VALUES (@Email, @UserId, @Consent, @Source, @GivenAt, CASE WHEN @Source = N'unsubscribe' THEN GETDATE() END);

    IF @Source = N'unsubscribe'
        UPDATE dbo.NewsletterSubscribers
        SET IsActive = 0, UnsubscribedAt = SYSUTCDATETIME(), UpdatedAt = GETDATE()
        WHERE Email = @Email AND IsActive = 1;

    COMMIT;
END
GO
