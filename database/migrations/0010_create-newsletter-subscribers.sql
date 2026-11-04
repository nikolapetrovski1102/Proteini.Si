IF OBJECT_ID('dbo.NewsletterSubscribers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.NewsletterSubscribers (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Email NVARCHAR(320) NOT NULL,
        Source NVARCHAR(50) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_NewsletterSubscribers_IsActive DEFAULT (1),
        SubscribedAt DATETIME2 NOT NULL CONSTRAINT DF_NewsletterSubscribers_SubscribedAt DEFAULT (GETDATE()),
        ConsentCapturedAt DATETIME2 NULL,
        ConsentSource NVARCHAR(100) NULL,
        UnsubscribedAt DATETIME2 NULL,
        UpdatedAt DATETIME2 NULL
    );
    CREATE UNIQUE INDEX UX_NewsletterSubscribers_Email ON dbo.NewsletterSubscribers(Email);
END
GO
