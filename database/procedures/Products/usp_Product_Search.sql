SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Search
    @SearchTerm NVARCHAR(MAX) = NULL,
    @SearchTermExact NVARCHAR(MAX) = NULL,
    @BrandId INT = NULL,
    @FlavorId INT = NULL,
    @CategoryId INT = NULL,
    @MinPrice DECIMAL(38, 10) = NULL,
    @MaxPrice DECIMAL(38, 10) = NULL,
    @NewInTheShop BIT = 0,
    @ProductsOnSale BIT = 0,
    @ProductsInTheOutlet BIT = 0,
    @SortBy NVARCHAR(20),
    @SortDesc BIT,
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        p.Product_Id,
        p.Name,
        CASE
            WHEN pv.Variant_Id IS NOT NULL THEN COALESCE(pv.Variant_Image_Path, p.Img)
            ELSE p.Img
        END AS Img,
        p.Price,
        CASE
            WHEN p.ProductsOnSale = 1
             AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
             AND p.SalePrice > 0
             AND p.SalePrice < p.Price
                THEN p.SalePrice
            ELSE NULL
        END AS Compare_Price,
        p.DDV_Percentage,
        p.HasVariants,
        CASE WHEN p.HasVariants = 1 THEN COALESCE((
            SELECT SUM(stock.Quantity) FROM dbo.ProductVariants stock
            WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
        ), 0) ELSE p.Quantity END AS Quantity,
        p.Servings,
        p.NewInTheShop,
        p.ProductsOnSale,
        p.SaleEndDate,
        p.UpcomingPromotion,
        p.ShortExpiry,
        p.ExpiryDate,
        p.IsGiftVoucher,
        p.VoucherMinAmount,
        p.VoucherMaxAmount,
        p.NameAl,
        p.ProductsInTheOutlet,
        p.CreatedAt,
        b.Brand_Name AS BrandName,
        COALESCE(f.Flavor_Name, pv.Flavor_Name) AS FlavorName,
        pv.Variant_Id,
        pv.Price AS Variant_Price,
        CASE
            WHEN p.ProductsOnSale = 1
             AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                THEN pv.Compare_Price
            ELSE NULL
        END AS Variant_Compare_Price,
        pv.Flavor_Name AS VariantFlavorName,
        pv.Packaging_Name AS VariantPackagingName,
        CASE WHEN pv.Variant_Id IS NOT NULL THEN 1 ELSE 0 END AS IsVariant,
        STUFF(
            (SELECT ', ' + c.Category_Name
             FROM dbo.ProductCategoryMapping pcm2
             INNER JOIN dbo.ProductCategories c ON pcm2.Category_Id = c.Category_Id
             WHERE pcm2.Product_Id = p.Product_Id
             FOR XML PATH('')), 1, 2, ''
        ) AS Categories
    INTO #Results
    FROM dbo.Products p
    LEFT JOIN dbo.Brands b ON p.Brand_Id = b.Brand_Id
    LEFT JOIN dbo.Flavors f ON p.Flavor_Id = f.Flavor_Id
    LEFT JOIN dbo.ProductVariants pv ON p.Product_Id = pv.Product_Id AND pv.IsActive = 1
    WHERE (@SearchTerm IS NULL OR (
            p.Product_Id = TRY_CONVERT(int, @SearchTermExact)
            OR p.Name LIKE @SearchTerm
            OR p.NameAl LIKE @SearchTerm
            OR b.Brand_Name LIKE @SearchTerm
            OR COALESCE(f.Flavor_Name, pv.Flavor_Name) LIKE @SearchTerm
            OR EXISTS (SELECT 1 FROM dbo.ProductVariants pv2
                       WHERE pv2.Product_Id = p.Product_Id
                         AND pv2.IsActive = 1
                         AND pv2.Flavor_Name LIKE @SearchTerm)))
      AND (@BrandId IS NULL OR p.Brand_Id = @BrandId)
      AND (@FlavorId IS NULL OR (
            p.Flavor_Id = @FlavorId
            OR EXISTS (SELECT 1 FROM dbo.ProductVariants pv2
                       WHERE pv2.Product_Id = p.Product_Id
                         AND pv2.IsActive = 1
                         AND pv2.Flavor_Id = @FlavorId)))
      AND (@CategoryId IS NULL OR EXISTS (
            SELECT 1 FROM dbo.ProductCategoryMapping pcm2
            WHERE pcm2.Product_Id = p.Product_Id AND pcm2.Category_Id = @CategoryId))
      AND (@MinPrice IS NULL OR p.Price >= @MinPrice)
      AND (@MaxPrice IS NULL OR p.Price <= @MaxPrice)
      AND (@NewInTheShop = 0 OR p.NewInTheShop = 1)
      AND (@ProductsOnSale = 0 OR (p.ProductsOnSale = 1 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))))
      AND (@ProductsInTheOutlet = 0 OR p.ProductsInTheOutlet = 1)
    OPTION (RECOMPILE);

    SELECT COUNT(DISTINCT Product_Id) FROM #Results;

    SELECT *
    FROM #Results
    ORDER BY
        CASE WHEN @SortBy = 'price' AND @SortDesc = 0 THEN Price END ASC,
        CASE WHEN @SortBy = 'price' AND @SortDesc = 1 THEN Price END DESC,
        CASE WHEN @SortBy = 'name' AND @SortDesc = 0 THEN Name END ASC,
        CASE WHEN @SortBy = 'name' AND @SortDesc = 1 THEN Name END DESC,
        CASE WHEN @SortBy = 'createdat' AND @SortDesc = 0 THEN CreatedAt END ASC,
        CASE WHEN @SortBy = 'createdat' AND @SortDesc = 1 THEN CreatedAt END DESC,
        Product_Id,
        Variant_Id
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
