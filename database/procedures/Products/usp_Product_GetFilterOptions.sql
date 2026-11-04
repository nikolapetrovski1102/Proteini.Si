SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetFilterOptions
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Category_Id, Category_Name, Category_Slug, Parent_Category_Id, Display_Order FROM dbo.ProductCategories ORDER BY Display_Order;
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
END
GO
