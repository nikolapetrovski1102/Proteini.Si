SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_GetByProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pv.*,
        f.Flavor_Name AS Flavor_Name,
        pkg.Packaging_Name AS Packaging_Name,
        pkg.Packaging_Type AS Packaging_Type,
        pkg.Weight_Grams AS Weight_Grams
    FROM dbo.ProductVariants pv
    LEFT JOIN dbo.Flavors f ON pv.Flavor_Id = f.Flavor_Id
    LEFT JOIN dbo.Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
    WHERE pv.Product_Id = @ProductId AND pv.IsActive = 1
    ORDER BY
        CASE WHEN pkg.Weight_Grams IS NULL THEN 1 ELSE 0 END,
        pkg.Weight_Grams ASC,
        pv.Display_Order ASC,
        pv.Variant_Id ASC;
END
GO
