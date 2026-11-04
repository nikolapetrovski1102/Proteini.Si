SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetLast
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 Order_Id, Total_Amount, Order_Number, User_Id
    FROM dbo.Orders
    ORDER BY Order_Id DESC;
END
GO
