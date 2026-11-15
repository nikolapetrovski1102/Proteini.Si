SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetFilterOptions
AS
BEGIN
    SET NOCOUNT ON;

    -- Product_Count: products listed in the shop (no variants, or at least one active variant) mapped to the category
    -- or to one of its subcategories. The shop hides categories at 0, so they appear and disappear on their own.
    WITH Listed AS (
        SELECT p.Product_Id
        FROM dbo.Products p
        WHERE ISNULL(p.HasVariants, 0) = 0
           OR EXISTS (SELECT 1 FROM dbo.ProductVariants pv WHERE pv.Product_Id = p.Product_Id AND pv.IsActive = 1)
    )
    SELECT
        c.Category_Id, c.Category_Name, c.Category_Slug, c.Parent_Category_Id, c.Display_Order, c.Is_Apparel,
        (
            SELECT COUNT(DISTINCT pcm.Product_Id)
            FROM dbo.ProductCategoryMapping pcm
            INNER JOIN Listed l ON l.Product_Id = pcm.Product_Id
            INNER JOIN dbo.ProductCategories mapped ON mapped.Category_Id = pcm.Category_Id
            WHERE mapped.Category_Id = c.Category_Id OR mapped.Parent_Category_Id = c.Category_Id
        ) AS Product_Count
    FROM dbo.ProductCategories c
    ORDER BY c.Display_Order;
    SELECT * FROM dbo.Sports ORDER BY Display_Order;
    SELECT * FROM dbo.Goals ORDER BY Display_Order;
    SELECT * FROM dbo.UseTimings ORDER BY Display_Order;
    SELECT * FROM dbo.Flavors ORDER BY Display_Order;
    SELECT * FROM dbo.Brands ORDER BY Display_Order;
    SELECT * FROM dbo.ProductTags ORDER BY Display_Order;

    SELECT CEILING(COALESCE(MAX(Price), 10000) / 1000.0) * 1000
    FROM (
        SELECT Price FROM dbo.Products
        UNION ALL
        SELECT Price FROM dbo.ProductVariants
    ) AvailablePrices;

    -- Clothing sizes on sale (packaging names of active clothing variants), smallest first. Read after the price,
    -- so an older API build that stops at the price still works.
    SELECT Size
    FROM (
        SELECT DISTINCT LTRIM(RTRIM(pv.Packaging_Name)) AS Size
        FROM dbo.ProductVariants pv
        WHERE pv.IsActive = 1
          AND NULLIF(LTRIM(RTRIM(pv.Packaging_Name)), '') IS NOT NULL
          AND EXISTS (
                SELECT 1
                FROM dbo.ProductCategoryMapping pcm
                INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
                LEFT JOIN dbo.ProductCategories parent ON parent.Category_Id = c.Parent_Category_Id
                WHERE pcm.Product_Id = pv.Product_Id AND (c.Is_Apparel = 1 OR parent.Is_Apparel = 1))
    ) sizes
    ORDER BY
        CASE UPPER(Size)
            WHEN 'XXS' THEN 1 WHEN 'XS' THEN 2 WHEN 'S' THEN 3 WHEN 'S/M' THEN 4 WHEN 'M' THEN 5 WHEN 'M/L' THEN 6
            WHEN 'L' THEN 7 WHEN 'L/XL' THEN 8 WHEN 'XL' THEN 9 WHEN 'XXL' THEN 10 WHEN '2XL' THEN 10
            WHEN 'XXXL' THEN 11 WHEN '3XL' THEN 11 WHEN '4XL' THEN 12
            ELSE 50
        END,
        Size;
END
GO
