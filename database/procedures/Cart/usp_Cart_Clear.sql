SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Cart_Clear
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DELETE ci
    FROM dbo.CartItems ci
    INNER JOIN dbo.ShoppingCart c ON ci.Cart_Id = c.Cart_Id
    WHERE c.User_Id = @UserId;
END
GO
