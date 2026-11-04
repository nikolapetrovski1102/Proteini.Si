SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetForAdminStatus
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT o.Order_Id, o.Order_Number, o.Order_Status, o.Payment_Status, o.Billing_Email,
           o.Billing_FullName, o.Payment_Method, o.Total_Amount, o.Transaction_Id,
           o.Tracking_Number, o.Tracking_Url
    FROM dbo.Orders o
    WHERE o.Order_Id = @OrderId;
END
GO
