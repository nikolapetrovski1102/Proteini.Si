SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_BulkRemoveDiscount
    @ProductIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET ProductsOnSale = 0,
        SalePrice = NULL,
        SaleEndDate = NULL,
        UpdatedAt = GETDATE()
    WHERE Product_Id IN (SELECT Id FROM @ProductIds);

    SELECT @@ROWCOUNT;
END
GO
