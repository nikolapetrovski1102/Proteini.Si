SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Admin "Pinned in shop": every pin, the products that can be pinned (listed in the shop), and their categories, so
-- the admin can narrow the picker by category and brand. Categories and brands come from GetFilterOptions.
CREATE OR ALTER PROCEDURE dbo.usp_ProductPlacement_GetAdmin
AS
BEGIN
    SET NOCOUNT ON;

    SELECT pp.Scope, pp.Target_Id, pp.Product_Id, pp.Position
    FROM dbo.ProductPlacements pp
    ORDER BY pp.Scope, pp.Target_Id, pp.Position, pp.Product_Id;

    SELECT p.Product_Id, p.Name, p.Img, p.Brand_Id,
        CASE WHEN p.HasVariants = 1 THEN COALESCE((
            SELECT SUM(CASE WHEN stock.Quantity > 0 THEN stock.Quantity ELSE 0 END) FROM dbo.ProductVariants stock
            WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
        ), 0) ELSE ISNULL(p.Quantity, 0) END AS Quantity
    FROM dbo.Products p
    WHERE ISNULL(p.HasVariants, 0) = 0
       OR EXISTS (SELECT 1 FROM dbo.ProductVariants pv WHERE pv.Product_Id = p.Product_Id AND pv.IsActive = 1)
    ORDER BY p.Name, p.Product_Id;

    SELECT pcm.Product_Id, pcm.Category_Id
    FROM dbo.ProductCategoryMapping pcm;
END
GO
