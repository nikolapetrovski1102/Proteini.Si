SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetEmailDebugData
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Status,
           o.Payment_Method, o.Billing_Email, o.Billing_FullName, o.Billing_Phone,
           o.Subtotal, o.Delivery_Fee, o.Total_Amount, o.Points_Discount,
           COALESCE(u.User_Email, o.Billing_Email) AS Customer_Email,
           COALESCE(u.User_FullName, o.Billing_FullName) AS Customer_FullName
    FROM dbo.Orders o
    LEFT JOIN dbo.[User] u ON o.User_Id = u.User_Id
    WHERE o.Order_Id = @OrderId;

    SELECT OrderItem_Id, Product_Id, Product_Name, Product_Price, Quantity, Subtotal,
           Variant_Id, Variant_Name, Variant_Packaging
    FROM dbo.OrderItems
    WHERE Order_Id = @OrderId
    ORDER BY OrderItem_Id;
END
GO
