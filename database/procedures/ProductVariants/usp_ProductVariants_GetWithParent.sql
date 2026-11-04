SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_GetWithParent
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pv.*,
        f.Flavor_Name AS Flavor_Name,
        pkg.Packaging_Name AS Packaging_Name,
        pkg.Packaging_Type AS Packaging_Type,
        p.Product_Id AS Parent_Product_Id,
        p.Name AS Parent_Product_Name,
        p.Img AS Parent_Product_Img
    FROM dbo.ProductVariants pv
    LEFT JOIN dbo.Flavors f ON pv.Flavor_Id = f.Flavor_Id
    LEFT JOIN dbo.Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
    INNER JOIN dbo.Products p ON pv.Product_Id = p.Product_Id
    WHERE pv.Variant_Id = @Id AND pv.IsActive = 1;
END
GO
