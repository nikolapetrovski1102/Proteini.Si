SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CartItem_Remove
    @UserId INT,
    @CartItemId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DELETE ci
    FROM dbo.CartItems ci
    INNER JOIN dbo.ShoppingCart c ON ci.Cart_Id = c.Cart_Id
    WHERE ci.CartItem_Id = @CartItemId AND c.User_Id = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
