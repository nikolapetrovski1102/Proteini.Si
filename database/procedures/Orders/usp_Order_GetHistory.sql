SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetHistory
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Order_Id, Order_Number, Order_Date, Order_Status,
        Payment_Method, Payment_Status, Total_Amount, Points_Redeemed
    FROM dbo.Orders
    WHERE User_Id = @UserId
    ORDER BY Order_Date DESC;
END
GO
