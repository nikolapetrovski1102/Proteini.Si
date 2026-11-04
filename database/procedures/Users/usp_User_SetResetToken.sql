SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_SetResetToken
    @UserId INT,
    @Token NVARCHAR(4000),
    @Expires DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.[User]
    SET ResetToken = @Token,
        ResetTokenExpiration = @Expires,
        IsResetTokenUsed = 0
    WHERE User_Id = @UserId;
END
GO
