SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_SetEmailCode
    @UserId INT,
    @CodeHash VARBINARY(64),
    @ExpiresAt DATETIME2,
    @SentAt DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.[User]
    SET EmailCode_Hash = @CodeHash,
        EmailCode_ExpiresAt = @ExpiresAt,
        EmailCode_SentAt = @SentAt,
        EmailCode_Attempts = 0
    WHERE User_Id = @UserId
      AND EmailConfirmed = 0;
END
GO
