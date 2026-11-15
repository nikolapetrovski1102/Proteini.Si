-- Daily report support:
--   * User.User_CreatedAt so new accounts can be counted (existing accounts stay NULL)
--   * SiteEvents: first-party visit / cart / checkout events sent by the storefront
--   * DailyReportRuns: one row per report day, so a re-run never emails twice

IF COL_LENGTH('dbo.[User]', 'User_CreatedAt') IS NULL
BEGIN
    ALTER TABLE dbo.[User]
        ADD User_CreatedAt DATETIME2 NULL CONSTRAINT DF_User_CreatedAt DEFAULT (GETDATE());
END
GO

IF OBJECT_ID('dbo.SiteEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SiteEvents (
        Id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SiteEvents PRIMARY KEY,
        VisitorId NVARCHAR(64) NULL,
        EventType NVARCHAR(32) NOT NULL,
        UserId INT NULL,
        OrderId INT NULL,
        Email NVARCHAR(320) NULL,
        FullName NVARCHAR(200) NULL,
        Path NVARCHAR(300) NULL,
        Referrer NVARCHAR(300) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SiteEvents_CreatedAt DEFAULT (GETDATE())
    );

    CREATE INDEX IX_SiteEvents_CreatedAt ON dbo.SiteEvents (CreatedAt)
        INCLUDE (VisitorId, EventType, UserId, OrderId, Email);
    CREATE INDEX IX_SiteEvents_VisitorId ON dbo.SiteEvents (VisitorId, CreatedAt);
END
GO

IF OBJECT_ID('dbo.DailyReportRuns', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DailyReportRuns (
        ReportDate DATE NOT NULL CONSTRAINT PK_DailyReportRuns PRIMARY KEY,
        SentAt DATETIME2 NOT NULL CONSTRAINT DF_DailyReportRuns_SentAt DEFAULT (GETDATE())
    );
END
GO
