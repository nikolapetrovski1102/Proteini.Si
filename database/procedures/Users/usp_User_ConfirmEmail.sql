SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_ConfirmEmail
    @UserId INT,
    @CodeHash VARBINARY(64),
    @ConfirmedAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.[User]
    SET EmailConfirmed = 1,
        EmailConfirmedAt = @ConfirmedAt,
        EmailCode_Hash = NULL,
        EmailCode_ExpiresAt = NULL,
        EmailCode_SentAt = NULL,
        EmailCode_Attempts = 0
    WHERE User_Id = @UserId
      AND EmailConfirmed = 0
      AND EmailCode_Hash = @CodeHash;

    SELECT @@ROWCOUNT;
END
GO
