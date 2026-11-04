SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetEmailData
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Total_Amount, o.Delivery_Fee,
           o.Subtotal AS Order_Subtotal, o.Points_Discount, o.Promo_Code, o.Promo_Discount,
           o.Gift_Voucher_Code, o.Gift_Voucher_Amount,
           (SELECT TOP 1 DisplayName FROM dbo.OrderFreeGifts fg WHERE fg.OrderId = o.Order_Id) AS FreeGiftName,
           o.Payment_Method, o.Order_Note,
           o.Billing_FullName, o.Billing_Address, o.Billing_PostCode, o.Billing_City,
           o.Billing_Country, o.Billing_Phone, o.Billing_Email,
           o.Delivery_IsDifferent, o.Delivery_FullName, o.Delivery_Address, o.Delivery_PostCode,
           o.Delivery_City, o.Delivery_Country, o.Delivery_Phone,
           COALESCE(u.User_Email, o.Billing_Email) AS Customer_Email,
           COALESCE(u.User_FullName, o.Billing_FullName) AS Customer_FullName,
           COALESCE(u.User_Phone, o.Billing_Phone) AS Customer_Phone,
           oi.Product_Id, oi.Product_Name, oi.Quantity, oi.Product_Price, oi.Subtotal AS Item_Subtotal,
           oi.Variant_Id, oi.Variant_Name, oi.Variant_Packaging,
           pv.SKU AS Variant_SKU
    FROM dbo.Orders o
    LEFT JOIN dbo.[User] u ON o.User_Id = u.User_Id
    INNER JOIN dbo.OrderItems oi ON o.Order_Id = oi.Order_Id
    LEFT JOIN dbo.ProductVariants pv ON oi.Variant_Id = pv.Variant_Id
    WHERE o.Order_Id = @OrderId;
END
GO
