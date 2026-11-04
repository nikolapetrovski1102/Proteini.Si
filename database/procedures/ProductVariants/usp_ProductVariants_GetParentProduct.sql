SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_GetParentProduct
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Product_Id,
        p.Name,
        p.Img,
        p.Price,
        CAST(NULL AS decimal(18, 2)) AS Compare_Price,
        p.DDV_Percentage,
        p.Quantity,
        p.Servings,
        p.GPerServing,
        p.NewInTheShop,
        p.ProductsOnSale,
        p.ProductsInTheOutlet,
        b.Brand_Name AS BrandName
    FROM dbo.ProductVariants pv
    INNER JOIN dbo.Products p ON pv.Product_Id = p.Product_Id
    LEFT JOIN dbo.Brands b ON p.Brand_Id = b.Brand_Id
    WHERE pv.Variant_Id = @VariantId AND pv.IsActive = 1;
END
GO
