SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NewsletterSubscriber_GetPaged
    @Search NVARCHAR(4000),
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1)
    FROM dbo.NewsletterSubscribers
    WHERE @Search IS NULL OR Email LIKE @Search OR Source LIKE @Search;

    SELECT Id, Email, Source, IsActive, SubscribedAt, UpdatedAt,
           ConsentCapturedAt, ConsentSource, UnsubscribedAt
    FROM dbo.NewsletterSubscribers
    WHERE @Search IS NULL OR Email LIKE @Search OR Source LIKE @Search
    ORDER BY SubscribedAt DESC, Id DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
