SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CartItem_UpdateQuantity
    @UserId INT,
    @CartItemId INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE ci
    SET ci.Quantity = @Quantity, ci.UpdatedAt = GETDATE()
    FROM dbo.CartItems ci
    INNER JOIN dbo.ShoppingCart c ON ci.Cart_Id = c.Cart_Id
    WHERE ci.CartItem_Id = @CartItemId AND c.User_Id = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
