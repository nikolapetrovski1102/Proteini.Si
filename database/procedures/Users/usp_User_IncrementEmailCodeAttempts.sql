SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Counts a verification attempt and returns the new total, so parallel
-- guesses cannot slip past the attempt limit.
CREATE OR ALTER PROCEDURE dbo.usp_User_IncrementEmailCodeAttempts
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.[User]
    SET EmailCode_Attempts = EmailCode_Attempts + 1
    OUTPUT inserted.EmailCode_Attempts
    WHERE User_Id = @UserId
      AND EmailConfirmed = 0;
END
GO
