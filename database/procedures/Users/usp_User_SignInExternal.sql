SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Resolves a sign-in whose email ownership was proven outside a password:
-- a Google/Facebook identity (@Provider + @ProviderKey) or an emailed code (@Provider NULL).
--
-- Result: 0 = known identity, 1 = linked to the existing account with @Email,
--         2 = new account created, 3 = unknown identity and no email to match,
--         4 = an account with @Email exists but @AllowLink = 0.
--
-- Linking or signing in proves the caller owns @Email. If that account had never confirmed
-- its email, whoever set its password never proved ownership, so the password is cleared:
-- otherwise someone could pre-register a victim's email and keep access after they sign in.
CREATE OR ALTER PROCEDURE dbo.usp_User_SignInExternal
    @Provider NVARCHAR(20),
    @ProviderKey NVARCHAR(255),
    @Email NVARCHAR(254),
    @FullName NVARCHAR(45),
    @AllowLink BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @UserId INT = NULL;
    DECLARE @Result INT;

    BEGIN TRANSACTION;

    IF @Provider IS NOT NULL
        SELECT @UserId = User_Id
        FROM dbo.UserLogin WITH (UPDLOCK, HOLDLOCK)
        WHERE Provider = @Provider AND ProviderKey = @ProviderKey;

    IF @UserId IS NOT NULL
    BEGIN
        UPDATE dbo.UserLogin
        SET LastUsedAt = SYSUTCDATETIME()
        WHERE Provider = @Provider AND ProviderKey = @ProviderKey;

        COMMIT;
        SELECT 0 AS Result, @UserId AS UserId;
        RETURN;
    END

    IF @Email IS NULL OR LTRIM(RTRIM(@Email)) = N''
    BEGIN
        COMMIT;
        SELECT 3 AS Result, CAST(NULL AS INT) AS UserId;
        RETURN;
    END

    SELECT @UserId = User_Id
    FROM dbo.[User] WITH (UPDLOCK, HOLDLOCK)
    WHERE User_Email = @Email;

    IF @UserId IS NOT NULL
    BEGIN
        IF @Provider IS NOT NULL AND @AllowLink = 0
        BEGIN
            COMMIT;
            SELECT 4 AS Result, @UserId AS UserId;
            RETURN;
        END

        UPDATE dbo.[User]
        SET PasswordHash = CASE WHEN EmailConfirmed = 1 THEN PasswordHash END,
            PasswordSalt = CASE WHEN EmailConfirmed = 1 THEN PasswordSalt END,
            EmailConfirmedAt = CASE WHEN EmailConfirmed = 1 THEN EmailConfirmedAt ELSE SYSUTCDATETIME() END,
            EmailConfirmed = 1,
            EmailCode_Hash = NULL,
            EmailCode_ExpiresAt = NULL,
            EmailCode_SentAt = NULL,
            EmailCode_Attempts = 0
        WHERE User_Id = @UserId;

        SET @Result = 1;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.[User] (
            User_FullName, User_Email, User_IsCompany, PasswordHash, PasswordSalt, SuperAdmin, User_Phone,
            EmailConfirmed, EmailConfirmedAt)
        VALUES (
            @FullName, @Email, 0, NULL, NULL, 0, N'',
            1, SYSUTCDATETIME());

        SET @UserId = CAST(SCOPE_IDENTITY() AS INT);
        SET @Result = 2;
    END

    IF @Provider IS NOT NULL
        INSERT INTO dbo.UserLogin (User_Id, Provider, ProviderKey, ProviderEmail)
        VALUES (@UserId, @Provider, @ProviderKey, @Email);

    COMMIT;
    SELECT @Result AS Result, @UserId AS UserId;
END
GO
