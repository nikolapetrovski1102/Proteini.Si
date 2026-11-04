SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_ResetPassword
    @UserId INT,
    @Token NVARCHAR(4000),
    @PasswordHash VARBINARY(512),
    @PasswordSalt VARBINARY(512)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.[User]
    SET PasswordHash = @PasswordHash,
        PasswordSalt = @PasswordSalt,
        ResetToken = NULL,
        ResetTokenExpiration = NULL,
        IsResetTokenUsed = 1
    WHERE User_Id = @UserId
      AND ResetToken = @Token
      AND IsResetTokenUsed = 0;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
