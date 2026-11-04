SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetConfirmation
    @OrderId INT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Orders
    WHERE Order_Id = @OrderId AND User_Id = @UserId;

    SELECT oi.*
    FROM dbo.OrderItems oi
    WHERE oi.Order_Id = @OrderId
      AND EXISTS (SELECT 1 FROM dbo.Orders o WHERE o.Order_Id = @OrderId AND o.User_Id = @UserId);
END
GO
