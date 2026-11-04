SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NewsletterSubscriber_Unsubscribe
    @Email NVARCHAR(320)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.NewsletterSubscribers
    SET IsActive = 0, UnsubscribedAt = SYSUTCDATETIME(), UpdatedAt = GETDATE()
    WHERE Email = @Email;
END
GO
