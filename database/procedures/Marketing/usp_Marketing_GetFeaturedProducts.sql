SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Products for the offers block in marketing emails: on sale first, then new and recommended.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetFeaturedProducts
    @Top INT = 4
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Top) p.Product_Id AS ProductId, p.Name AS ProductName, p.Img AS ProductImg,
           CAST(p.Price AS DECIMAL(18, 2)) AS Price,
           CASE WHEN p.SalePrice > 0 AND p.SalePrice < p.Price AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS DATE))
                THEN p.SalePrice END AS SalePrice
    FROM dbo.Products p
    WHERE p.Img IS NOT NULL AND p.Price > 0 AND ISNULL(p.IsGiftVoucher, 0) = 0
      AND (p.ProductsOnSale = 1 OR p.SalePrice IS NOT NULL OR p.NewInTheShop = 1 OR p.RecommendedForYou = 1)
      AND (p.HasVariants = 0 OR EXISTS (SELECT 1 FROM dbo.ProductVariants v WHERE v.Product_Id = p.Product_Id AND v.IsActive = 1 AND v.Quantity > 0)
           OR NOT EXISTS (SELECT 1 FROM dbo.ProductVariants v WHERE v.Product_Id = p.Product_Id))
    ORDER BY CASE WHEN p.SalePrice > 0 AND p.SalePrice < p.Price THEN 0 WHEN p.ProductsOnSale = 1 THEN 1 ELSE 2 END,
             p.UpdatedAt DESC;
END
GO
