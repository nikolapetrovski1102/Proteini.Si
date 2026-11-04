SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetBillingPhone
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Billing_Phone
    FROM dbo.Orders
    WHERE Order_Id = @OrderId;
END
GO
