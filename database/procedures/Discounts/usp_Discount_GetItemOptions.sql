SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Everything a product discount can pick, one row per sellable item: each active variant with its
-- flavor and weight, or the product itself when it has no variants (Variant_Id 0). Gift vouchers excluded.
CREATE OR ALTER PROCEDURE dbo.usp_Discount_GetItemOptions
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.Product_Id, pv.Variant_Id, p.Name AS Product_Name, b.Brand_Name,
           f.Flavor_Name, pkg.Packaging_Name, pkg.Weight_Grams, pv.Price,
           ISNULL(pv.Display_Order, 0) AS Display_Order
    FROM dbo.Products p
    INNER JOIN dbo.ProductVariants pv ON pv.Product_Id = p.Product_Id AND pv.IsActive = 1
    LEFT JOIN dbo.Brands b ON b.Brand_Id = p.Brand_Id
    LEFT JOIN dbo.Flavors f ON f.Flavor_Id = pv.Flavor_Id
    LEFT JOIN dbo.Packaging pkg ON pkg.Packaging_Id = pv.Packaging_Id
    WHERE ISNULL(p.HasVariants, 0) = 1 AND ISNULL(p.IsGiftVoucher, 0) = 0

    UNION ALL

    SELECT p.Product_Id, 0, p.Name, b.Brand_Name, f.Flavor_Name, NULL, NULL, p.Price, 0
    FROM dbo.Products p
    LEFT JOIN dbo.Brands b ON b.Brand_Id = p.Brand_Id
    LEFT JOIN dbo.Flavors f ON f.Flavor_Id = p.Flavor_Id
    WHERE ISNULL(p.HasVariants, 0) = 0 AND ISNULL(p.IsGiftVoucher, 0) = 0

    ORDER BY Product_Name, Product_Id, Weight_Grams, Display_Order, Variant_Id;
END
GO
