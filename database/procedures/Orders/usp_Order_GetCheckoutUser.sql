SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetCheckoutUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT User_Email, User_FullName
    FROM dbo.[User]
    WHERE User_Id = @UserId;
END
GO
