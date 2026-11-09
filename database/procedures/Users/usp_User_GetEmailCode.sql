SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetEmailCode
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
           EmailConfirmed,
           EmailCode_Hash,
           EmailCode_ExpiresAt,
           EmailCode_Attempts,
           EmailCode_SentAt
    FROM dbo.[User]
    WHERE User_Id = @UserId;
END
GO
