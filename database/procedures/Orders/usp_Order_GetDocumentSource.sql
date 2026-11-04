SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetDocumentSource
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.Orders
    WHERE Order_Id = @OrderId;

    SELECT Product_Name, Variant_Name, Variant_Packaging, Product_Price, Quantity, Subtotal
    FROM dbo.OrderItems
    WHERE Order_Id = @OrderId
    ORDER BY OrderItem_Id;
END
GO
