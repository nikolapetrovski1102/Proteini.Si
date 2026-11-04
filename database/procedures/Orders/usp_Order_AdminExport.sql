SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_AdminExport
    @OrderStatus NVARCHAR(4000) = NULL,
    @PaymentStatus NVARCHAR(4000) = NULL,
    @Search NVARCHAR(4000) = NULL,
    @FromDate DATETIME = NULL,
    @ToExclusive DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method, o.Payment_Status,
        o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Billing_Address,
        o.Billing_PostCode, o.Billing_City, o.Subtotal, o.Delivery_Fee,
        o.Promo_Code, o.Promo_Discount, o.Points_Discount, o.Gift_Voucher_Code,
        o.Gift_Voucher_Amount, o.Total_Amount, o.Transaction_Id,
        o.Tracking_Number, o.Tracking_Url, COALESCE(SUM(oi.Quantity), 0) AS Item_Count,
        (SELECT TOP 1 DisplayName FROM dbo.OrderFreeGifts fg WHERE fg.OrderId = o.Order_Id) AS Free_Gift
    FROM dbo.Orders o
    LEFT JOIN dbo.OrderItems oi ON oi.Order_Id = o.Order_Id
    WHERE (@OrderStatus IS NULL OR o.Order_Status = @OrderStatus)
      AND (@PaymentStatus IS NULL OR o.Payment_Status = @PaymentStatus)
      AND (@FromDate IS NULL OR o.Order_Date >= @FromDate)
      AND (@ToExclusive IS NULL OR o.Order_Date < @ToExclusive)
      AND (
          @Search IS NULL OR o.Order_Number LIKE @Search OR o.Billing_Email LIKE @Search
          OR o.Billing_FullName LIKE @Search OR o.Billing_Phone LIKE @Search
      )
    GROUP BY o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method,
        o.Payment_Status, o.Billing_FullName, o.Billing_Email, o.Billing_Phone,
        o.Billing_Address, o.Billing_PostCode, o.Billing_City, o.Subtotal,
        o.Delivery_Fee, o.Promo_Code, o.Promo_Discount, o.Points_Discount,
        o.Gift_Voucher_Code, o.Gift_Voucher_Amount, o.Total_Amount, o.Transaction_Id,
        o.Tracking_Number, o.Tracking_Url
    ORDER BY o.Order_Date DESC;
END
GO
