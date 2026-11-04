SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_BulkApplyDiscount
    @ProductIds dbo.IntList READONLY,
    @DiscountMultiplier DECIMAL(38, 20)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET SalePrice = ROUND(Price * @DiscountMultiplier, 2),
        ProductsOnSale = 1,
        UpdatedAt = GETDATE()
    WHERE Product_Id IN (SELECT Id FROM @ProductIds);

    SELECT @@ROWCOUNT;
END
GO
