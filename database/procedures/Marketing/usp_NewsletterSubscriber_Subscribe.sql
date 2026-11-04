SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NewsletterSubscriber_Subscribe
    @Email NVARCHAR(320),
    @Source NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.NewsletterSubscribers WITH (UPDLOCK, HOLDLOCK) WHERE Email = @Email)
        UPDATE dbo.NewsletterSubscribers
        SET IsActive = 1, Source = @Source, ConsentCapturedAt = SYSUTCDATETIME(),
            ConsentSource = @Source, UnsubscribedAt = NULL, UpdatedAt = GETDATE()
        WHERE Email = @Email;
    ELSE
        INSERT INTO dbo.NewsletterSubscribers
            (Email, Source, IsActive, SubscribedAt, ConsentCapturedAt, ConsentSource)
        VALUES (@Email, @Source, 1, GETDATE(), SYSUTCDATETIME(), @Source);

    COMMIT TRANSACTION;
END
GO
