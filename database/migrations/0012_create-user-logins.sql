-- External sign-in identities (Google, Facebook) linked to a user account.
-- A user can have several; each provider identity belongs to exactly one user.
-- Requires 0011 (EmailConfirmed columns).

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.UserLogin', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserLogin (
        UserLogin_Id INT IDENTITY(1, 1) NOT NULL CONSTRAINT PK_UserLogin PRIMARY KEY,
        User_Id INT NOT NULL CONSTRAINT FK_UserLogin_User REFERENCES dbo.[User] (User_Id) ON DELETE CASCADE,
        Provider NVARCHAR(20) NOT NULL,
        ProviderKey NVARCHAR(255) NOT NULL,
        ProviderEmail NVARCHAR(254) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserLogin_CreatedAt DEFAULT (SYSUTCDATETIME()),
        LastUsedAt DATETIME2 NOT NULL CONSTRAINT DF_UserLogin_LastUsedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT UQ_UserLogin_Provider_Key UNIQUE (Provider, ProviderKey),
        CONSTRAINT CK_UserLogin_Provider CHECK (Provider IN (N'google', N'facebook'))
    );

    CREATE INDEX IX_UserLogin_User_Id ON dbo.UserLogin (User_Id);
END
GO
