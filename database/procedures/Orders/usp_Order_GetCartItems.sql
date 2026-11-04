SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetCartItems
    @CartId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ci.CartItem_Id,
        ci.Product_Id,
        ci.Quantity,
        CASE
            WHEN p.IsGiftVoucher = 1 THEN ci.Price
            WHEN ci.Variant_Id IS NULL
             AND p.ProductsOnSale = 1
             AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
             AND p.SalePrice > 0
             AND p.SalePrice < p.Price
                THEN p.SalePrice
            WHEN ci.Variant_Id IS NULL THEN CAST(p.Price AS decimal(18, 2))
            WHEN pv.Variant_Id IS NOT NULL THEN
                CASE
                    WHEN p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND pv.Compare_Price IS NOT NULL AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                        THEN pv.Compare_Price
                    ELSE pv.Price
                END
            ELSE NULL
        END AS CartPrice,
        ci.Variant_Id,
        pv.Variant_Id AS CatalogVariantId,
        CASE
            WHEN pv.Variant_Id IS NOT NULL
                THEN COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''))
            ELSE NULL
        END AS Variant_Name,
        CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Packaging_Name ELSE NULL END AS Variant_Packaging,
        p.Name AS Product_Name,
        p.Price AS Product_Price,
        CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Quantity ELSE p.Quantity END AS Product_Stock,
        p.HasVariants,
        p.IsGiftVoucher,
        p.VoucherMinAmount,
        p.VoucherMaxAmount,
        p.LoyaltyPercentage AS ProductLoyaltyPercentage,
        pv.LoyaltyPercentage AS VariantLoyaltyPercentage,
        pkg.Weight_Grams AS VariantWeightGrams
    FROM dbo.CartItems ci
    INNER JOIN dbo.Products p ON ci.Product_Id = p.Product_Id
    LEFT JOIN dbo.ProductVariants pv
        ON ci.Variant_Id = pv.Variant_Id
        AND pv.Product_Id = ci.Product_Id
        AND pv.IsActive = 1
    LEFT JOIN dbo.Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
    WHERE ci.Cart_Id = @CartId
    ORDER BY ci.CartItem_Id;
END
GO
