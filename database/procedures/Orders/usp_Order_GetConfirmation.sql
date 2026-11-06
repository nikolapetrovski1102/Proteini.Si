SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetConfirmation
    @OrderId INT,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- @UserId NULL reads a guest order; callers verify the guest access token first.
    SELECT *
    FROM dbo.Orders
    WHERE Order_Id = @OrderId
      AND (User_Id = @UserId OR (@UserId IS NULL AND User_Id IS NULL));

    SELECT oi.*
    FROM dbo.OrderItems oi
    WHERE oi.Order_Id = @OrderId
      AND EXISTS (
          SELECT 1 FROM dbo.Orders o
          WHERE o.Order_Id = @OrderId
            AND (o.User_Id = @UserId OR (@UserId IS NULL AND o.User_Id IS NULL))
      );
END
GO
