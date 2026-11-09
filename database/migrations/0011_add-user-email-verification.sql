-- Email confirmation with a one-time code for new accounts.
-- Existing accounts are marked as confirmed so nobody is locked out.

IF COL_LENGTH('dbo.[User]', 'EmailConfirmed') IS NULL
BEGIN
    ALTER TABLE dbo.[User]
        ADD EmailConfirmed BIT NOT NULL CONSTRAINT DF_User_EmailConfirmed DEFAULT (0),
            EmailConfirmedAt DATETIME2 NULL,
            EmailCode_Hash VARBINARY(64) NULL,
            EmailCode_ExpiresAt DATETIME2 NULL,
            EmailCode_Attempts INT NOT NULL CONSTRAINT DF_User_EmailCode_Attempts DEFAULT (0),
            EmailCode_SentAt DATETIME2 NULL;

    EXEC('UPDATE dbo.[User] SET EmailConfirmed = 1, EmailConfirmedAt = SYSUTCDATETIME();');
END
GO
