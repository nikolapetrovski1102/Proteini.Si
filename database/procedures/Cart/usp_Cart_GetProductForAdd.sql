SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Cart_GetProductForAdd
    @ProductId INT,
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.Product_Id,
           p.Name,
           p.Img,
           p.HasVariants,
           p.IsGiftVoucher,
           p.VoucherMinAmount,
           p.VoucherMaxAmount,
           pv.Variant_Id AS CatalogVariantId,
           COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, '')) AS CatalogVariantName,
           pv.Packaging_Name AS CatalogVariantPackaging,
           CASE
               WHEN pv.Variant_Id IS NULL
                AND p.ProductsOnSale = 1
                AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                AND p.SalePrice > 0
                AND p.SalePrice < p.Price
                   THEN p.SalePrice
               WHEN pv.Variant_Id IS NULL THEN CAST(p.Price AS decimal(18, 2))
               WHEN p.ProductsOnSale = 1
                AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                AND pv.Compare_Price IS NOT NULL AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                   THEN pv.Compare_Price
               ELSE pv.Price
           END AS EffectivePrice,
           CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Quantity ELSE p.Quantity END AS AvailableQuantity
    FROM dbo.Products p
    LEFT JOIN dbo.ProductVariants pv
        ON pv.Variant_Id = @VariantId
       AND pv.Product_Id = p.Product_Id
       AND pv.IsActive = 1
    WHERE p.Product_Id = @ProductId;
END
GO
