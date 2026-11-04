SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetCancelInfo
    @OrderId INT,
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Order_Date, Order_Status
    FROM dbo.Orders
    WHERE Order_Id = @OrderId AND User_Id = @UserId;
END
GO
