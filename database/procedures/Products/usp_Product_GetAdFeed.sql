SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Product catalog for ads (Meta / Instagram catalog, Google Merchant Center): one row per item a customer can buy.
-- Products with variants give one row per active variant (each weight/flavour/colour/size), grouped by Product_Id;
-- products without variants give one row. Gift vouchers and items without a price are left out.
CREATE OR ALTER PROCEDURE dbo.usp_Product_GetAdFeed
AS
BEGIN
    SET NOCOUNT ON;

    WITH ApparelProducts AS (
        SELECT DISTINCT pcm.Product_Id
        FROM dbo.ProductCategoryMapping pcm
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
        LEFT JOIN dbo.ProductCategories parent ON parent.Category_Id = c.Parent_Category_Id
        WHERE c.Is_Apparel = 1 OR parent.Is_Apparel = 1
    ),
    -- One category path per product ("Parent > Child"), the deepest mapped category first.
    ProductCategoryPath AS (
        SELECT
            pcm.Product_Id,
            CASE WHEN parent.Category_Name IS NULL THEN c.Category_Name
                 ELSE CONCAT(parent.Category_Name, N' > ', c.Category_Name) END AS CategoryPath,
            ROW_NUMBER() OVER (
                PARTITION BY pcm.Product_Id
                ORDER BY CASE WHEN c.Parent_Category_Id IS NULL THEN 1 ELSE 0 END, c.Display_Order, c.Category_Id
            ) AS RowNumber
        FROM dbo.ProductCategoryMapping pcm
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
        LEFT JOIN dbo.ProductCategories parent ON parent.Category_Id = c.Parent_Category_Id
    ),
    Items AS (
        SELECT
            p.Product_Id,
            v.Variant_Id,
            p.Name,
            p.MainDescriptions,
            COALESCE(NULLIF(v.Variant_Image_Path, ''), p.Img) AS Img,
            v.Packaging_Name AS PackagingName,
            v.Flavor_Name AS FlavorName,
            v.Option_Type AS OptionType,
            v.Price,
            v.Compare_Price AS DiscountPrice,
            v.Quantity,
            p.ProductsOnSale,
            p.SaleEndDate
        FROM dbo.Products p
        INNER JOIN dbo.ProductVariants v ON v.Product_Id = p.Product_Id AND v.IsActive = 1
        WHERE p.HasVariants = 1

        UNION ALL

        SELECT
            p.Product_Id,
            NULL,
            p.Name,
            p.MainDescriptions,
            p.Img,
            NULL,
            f.Flavor_Name,
            NULL,
            p.Price,
            p.SalePrice,
            p.Quantity,
            p.ProductsOnSale,
            p.SaleEndDate
        FROM dbo.Products p
        LEFT JOIN dbo.Flavors f ON f.Flavor_Id = p.Flavor_Id
        WHERE ISNULL(p.HasVariants, 0) = 0
    )
    SELECT
        i.Product_Id AS ProductId,
        i.Variant_Id AS VariantId,
        i.Name,
        i.MainDescriptions AS Description,
        i.Img,
        b.Brand_Name AS BrandName,
        i.PackagingName,
        i.FlavorName,
        i.OptionType,
        CAST(CASE WHEN ap.Product_Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsApparel,
        cp.CategoryPath,
        i.Price,
        -- Same sale rule as the shop (usp_Product_Filter): a lower price while the product's sale is running.
        CASE
            WHEN i.ProductsOnSale = 1
             AND (i.SaleEndDate IS NULL OR i.SaleEndDate >= CAST(GETDATE() AS date))
             AND i.DiscountPrice > 0
             AND i.DiscountPrice < i.Price
                THEN i.DiscountPrice
            ELSE NULL
        END AS SalePrice,
        i.SaleEndDate,
        ISNULL(i.Quantity, 0) AS Quantity
    FROM Items i
    INNER JOIN dbo.Products p ON p.Product_Id = i.Product_Id
    LEFT JOIN dbo.Brands b ON b.Brand_Id = p.Brand_Id
    LEFT JOIN ApparelProducts ap ON ap.Product_Id = i.Product_Id
    LEFT JOIN ProductCategoryPath cp ON cp.Product_Id = i.Product_Id AND cp.RowNumber = 1
    WHERE ISNULL(p.IsGiftVoucher, 0) = 0
      AND i.Price > 0
      AND NULLIF(LTRIM(RTRIM(i.Name)), '') IS NOT NULL
    ORDER BY i.Product_Id, i.Variant_Id;
END
GO
