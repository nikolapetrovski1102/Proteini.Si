SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_GetActiveById
    @Id INT
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
    WHERE pv.Variant_Id = @Id AND pv.IsActive = 1;
END
GO
