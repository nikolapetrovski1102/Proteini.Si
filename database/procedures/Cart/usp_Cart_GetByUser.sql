SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Cart_GetByUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CartId INT = (SELECT TOP 1 Cart_Id FROM dbo.ShoppingCart WHERE User_Id = @UserId ORDER BY Cart_Id);

    SELECT @CartId AS Cart_Id;

    SELECT ci.CartItem_Id,
           ci.Product_Id,
           ci.Variant_Id,
           ci.Variant_Name,
           ci.Variant_Packaging,
           ci.Quantity,
           currentPrice.EffectivePrice AS Price,
           ci.Display_Name,
           p.Name AS Product_Name,
           p.Img AS Product_Img,
           pv.Price AS Variant_Original_Price,
           CASE
               WHEN p.ProductsOnSale = 1
                AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                AND pv.Compare_Price IS NOT NULL
                AND pv.Compare_Price > 0
                AND pv.Compare_Price < pv.Price
                   THEN pv.Compare_Price
               ELSE NULL
           END AS Variant_Compare_Price,
           pkg.Weight_Grams AS Variant_Weight_Grams,
           (ci.Quantity * currentPrice.EffectivePrice) AS Subtotal
    FROM dbo.CartItems ci
    INNER JOIN dbo.Products p ON ci.Product_Id = p.Product_Id
    LEFT JOIN dbo.ProductVariants pv ON ci.Variant_Id = pv.Variant_Id AND pv.IsActive = 1
    LEFT JOIN dbo.Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
    CROSS APPLY (
        SELECT CAST(
            CASE
                WHEN p.IsGiftVoucher = 1 THEN ci.Price
                WHEN ci.Variant_Id IS NULL
                 AND p.ProductsOnSale = 1
                 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                 AND p.SalePrice IS NOT NULL
                 AND p.SalePrice > 0
                 AND p.SalePrice < p.Price
                    THEN p.SalePrice
                WHEN ci.Variant_Id IS NULL THEN p.Price
                WHEN p.ProductsOnSale = 1
                 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                 AND pv.Compare_Price IS NOT NULL
                 AND pv.Compare_Price > 0
                 AND pv.Compare_Price < pv.Price
                    THEN pv.Compare_Price
                ELSE COALESCE(pv.Price, ci.Price)
            END AS decimal(18, 2)
        ) AS EffectivePrice
    ) currentPrice
    WHERE ci.Cart_Id = @CartId;
END
GO
