SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetResetToken
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ResetToken, ResetTokenExpiration, IsResetTokenUsed
    FROM dbo.[User]
    WHERE User_Id = @UserId;
END
GO
