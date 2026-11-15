-- 2026-11-15 brands admin + header: brands get a header photo and a "featured" flag. The four featured brands (by
-- Display_Order) are shown with their photos on the left of the header's Brands menu. Images are uploaded from the
-- admin into wwwroot/uploads/brands. Additive and idempotent; older API builds keep working.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Brands', 'Header_Image_Url') IS NULL
    ALTER TABLE dbo.Brands ADD Header_Image_Url NVARCHAR(500) NULL;
GO

IF COL_LENGTH('dbo.Brands', 'Is_Featured') IS NULL
    ALTER TABLE dbo.Brands ADD Is_Featured BIT NOT NULL CONSTRAINT DF_Brands_Is_Featured DEFAULT 0;
GO

-- Start with the four brands that have the most products, so the menu is not empty before photos are uploaded.
IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE Is_Featured = 1)
BEGIN
    UPDATE b
    SET Is_Featured = 1
    FROM dbo.Brands b
    WHERE b.Brand_Id IN (
        SELECT TOP (4) p.Brand_Id
        FROM dbo.Products p
        WHERE p.Brand_Id IS NOT NULL
        GROUP BY p.Brand_Id
        ORDER BY COUNT(*) DESC, p.Brand_Id);
END
GO
