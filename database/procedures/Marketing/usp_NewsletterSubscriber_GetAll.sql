SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NewsletterSubscriber_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Email, Source, IsActive, SubscribedAt, UpdatedAt,
           ConsentCapturedAt, ConsentSource, UnsubscribedAt
    FROM dbo.NewsletterSubscribers
    ORDER BY SubscribedAt DESC;
END
GO
