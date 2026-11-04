SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_AdminList
    @OrderStatus NVARCHAR(4000) = NULL,
    @PaymentStatus NVARCHAR(4000) = NULL,
    @Search NVARCHAR(4000) = NULL,
    @SortBy NVARCHAR(20),
    @SortDescending BIT,
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(*) AS TotalCount
    FROM dbo.Orders o
    WHERE (@OrderStatus IS NULL OR o.Order_Status = @OrderStatus)
      AND (@PaymentStatus IS NULL OR o.Payment_Status = @PaymentStatus)
      AND (
          @Search IS NULL
          OR o.Order_Number LIKE @Search
          OR o.Billing_Email LIKE @Search
          OR o.Billing_FullName LIKE @Search
          OR o.Billing_Phone LIKE @Search
      );

    SELECT
        o.Order_Id,
        o.Order_Number,
        o.Order_Date,
        o.Order_Status,
        o.Payment_Method,
        o.Payment_Status,
        o.Subtotal,
        o.Delivery_Fee,
        o.Promo_Code,
        o.Promo_Discount,
        o.Selected_Free_Gift_Id,
        o.Total_Amount,
        o.Transaction_Id,
        o.Tracking_Number,
        o.Tracking_Url,
        o.Shipped_At,
        o.Billing_FullName,
        o.Billing_Email,
        o.Billing_Phone,
        o.Billing_City,
        o.Delivery_FullName,
        o.Delivery_City,
        COALESCE(SUM(oi.Quantity), 0) AS Item_Count
    FROM dbo.Orders o
    LEFT JOIN dbo.OrderItems oi ON oi.Order_Id = o.Order_Id
    WHERE (@OrderStatus IS NULL OR o.Order_Status = @OrderStatus)
      AND (@PaymentStatus IS NULL OR o.Payment_Status = @PaymentStatus)
      AND (
          @Search IS NULL
          OR o.Order_Number LIKE @Search
          OR o.Billing_Email LIKE @Search
          OR o.Billing_FullName LIKE @Search
          OR o.Billing_Phone LIKE @Search
      )
    GROUP BY o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method,
        o.Payment_Status, o.Subtotal, o.Delivery_Fee, o.Promo_Code, o.Promo_Discount,
        o.Selected_Free_Gift_Id, o.Total_Amount, o.Transaction_Id,
        o.Tracking_Number, o.Tracking_Url, o.Shipped_At,
        o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Billing_City,
        o.Delivery_FullName, o.Delivery_City
    ORDER BY
        CASE WHEN @SortBy = 'number' AND @SortDescending = 0 THEN o.Order_Number END ASC,
        CASE WHEN @SortBy = 'number' AND @SortDescending = 1 THEN o.Order_Number END DESC,
        CASE WHEN @SortBy = 'customer' AND @SortDescending = 0 THEN o.Billing_FullName END ASC,
        CASE WHEN @SortBy = 'customer' AND @SortDescending = 1 THEN o.Billing_FullName END DESC,
        CASE WHEN @SortBy = 'status' AND @SortDescending = 0 THEN o.Order_Status END ASC,
        CASE WHEN @SortBy = 'status' AND @SortDescending = 1 THEN o.Order_Status END DESC,
        CASE WHEN @SortBy = 'total' AND @SortDescending = 0 THEN o.Total_Amount END ASC,
        CASE WHEN @SortBy = 'total' AND @SortDescending = 1 THEN o.Total_Amount END DESC,
        CASE WHEN @SortBy = 'date' AND @SortDescending = 0 THEN o.Order_Date END ASC,
        CASE WHEN @SortBy = 'date' AND @SortDescending = 1 THEN o.Order_Date END DESC,
        o.Order_Id DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
