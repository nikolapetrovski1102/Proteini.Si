SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Filter
    @CategoryIds dbo.IntList READONLY,
    @SportIds dbo.IntList READONLY,
    @GoalIds dbo.IntList READONLY,
    @UseTimingIds dbo.IntList READONLY,
    @TagIds dbo.IntList READONLY,
    @BrandIds dbo.IntList READONLY,
    @FlavorIds dbo.IntList READONLY,
    @MinPrice DECIMAL(38, 10) = NULL,
    @MaxPrice DECIMAL(38, 10) = NULL,
    @InStock BIT = 0,
    @OnSale BIT = 0,
    @UpcomingPromotions BIT = 0,
    @NewProducts BIT = 0,
    @BestSellers BIT = 0,
    @Outlet BIT = 0,
    @GiftVouchers BIT = 0,
    @JustForMe BIT = 0,
    @HasSearch BIT = 0,
    @SearchTerms dbo.StringList READONLY,
    @SearchExact NVARCHAR(MAX) = NULL,
    @SearchPrefix NVARCHAR(MAX) = NULL,
    @SearchContains NVARCHAR(MAX) = NULL,
    @SortBy NVARCHAR(20),
    @SortDesc BIT,
    @Offset INT,
    @PageSize INT,
    -- Optional (an older API build leaves them empty): clothing sizes (packaging names) and an explicit product list
    -- for the home page showcase.
    @Sizes dbo.StringList READONLY,
    @ProductIds dbo.IntList READONLY,
    -- Optional: listings whose admin-pinned products go first in the default ("priority") order. Category pins come
    -- before brand pins, brand pins before whole-shop pins (@PinAll). Sold-out pins are not lifted.
    @PinCategoryIds dbo.IntList READONLY,
    @PinBrandIds dbo.IntList READONLY,
    @PinAll BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FilterCategories BIT = CASE WHEN EXISTS (SELECT 1 FROM @CategoryIds) THEN 1 ELSE 0 END;
    DECLARE @FilterSports BIT = CASE WHEN EXISTS (SELECT 1 FROM @SportIds) THEN 1 ELSE 0 END;
    DECLARE @FilterGoals BIT = CASE WHEN EXISTS (SELECT 1 FROM @GoalIds) THEN 1 ELSE 0 END;
    DECLARE @FilterUseTimings BIT = CASE WHEN EXISTS (SELECT 1 FROM @UseTimingIds) THEN 1 ELSE 0 END;
    DECLARE @FilterTags BIT = CASE WHEN EXISTS (SELECT 1 FROM @TagIds) THEN 1 ELSE 0 END;
    DECLARE @FilterBrands BIT = CASE WHEN EXISTS (SELECT 1 FROM @BrandIds) THEN 1 ELSE 0 END;
    DECLARE @FilterFlavors BIT = CASE WHEN EXISTS (SELECT 1 FROM @FlavorIds) THEN 1 ELSE 0 END;
    DECLARE @FilterSizes BIT = CASE WHEN EXISTS (SELECT 1 FROM @Sizes) THEN 1 ELSE 0 END;
    DECLARE @FilterProducts BIT = CASE WHEN EXISTS (SELECT 1 FROM @ProductIds) THEN 1 ELSE 0 END;

    -- Clothing (mapped to an apparel category or its subcategory) is listed once per product: its packagings are
    -- sizes, not different products like the weights of a protein tub.
    WITH ApparelProducts AS (
        SELECT DISTINCT pcm.Product_Id
        FROM dbo.ProductCategoryMapping pcm
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
        LEFT JOIN dbo.ProductCategories parent ON parent.Category_Id = c.Parent_Category_Id
        WHERE c.Is_Apparel = 1 OR parent.Is_Apparel = 1
    ),
    VariantGroups AS (
        SELECT
            pv.*,
            CASE WHEN ap.Product_Id IS NOT NULL THEN 1 ELSE 0 END AS IsApparel,
            CASE WHEN ap.Product_Id IS NOT NULL THEN N'apparel' ELSE
                COALESCE(
                    CONVERT(nvarchar(50), pv.Packaging_Id),
                    NULLIF(LOWER(LTRIM(RTRIM(pv.Packaging_Name))), ''),
                    CONCAT('variant-', pv.Variant_Id)
                )
            END AS GroupKey
        FROM dbo.ProductVariants pv
        LEFT JOIN ApparelProducts ap ON ap.Product_Id = pv.Product_Id
        WHERE pv.IsActive = 1
    ),
    RankedVariants AS (
        SELECT
            pv.*,
            ROW_NUMBER() OVER (
                PARTITION BY pv.Product_Id, pv.GroupKey
                ORDER BY
                    CASE WHEN pv.IsDefault = 1 THEN 0 ELSE 1 END,
                    CASE WHEN pv.Quantity > 0 THEN 0 ELSE 1 END,
                    pv.Display_Order,
                    pv.Variant_Id
            ) AS PackagingRow,
            -- Stock of the whole packaging (all flavours; for clothing all sizes and colours), so a card is only
            -- sold out when none of its options can be bought.
            SUM(CASE WHEN pv.Quantity > 0 THEN pv.Quantity ELSE 0 END) OVER (
                PARTITION BY pv.Product_Id, pv.GroupKey
            ) AS PackagingQuantity
        FROM VariantGroups pv
    ),
    -- Units sold per product, ignoring cancelled, refunded and failed orders.
    ProductSales AS (
        SELECT oi.Product_Id, SUM(oi.Quantity) AS SoldCount
        FROM dbo.OrderItems oi
        INNER JOIN dbo.Orders o ON o.Order_Id = oi.Order_Id
        WHERE ISNULL(LOWER(o.Order_Status), '') <> 'cancelled'
          AND ISNULL(LOWER(o.Payment_Status), '') NOT IN ('failed', 'refunded')
        GROUP BY oi.Product_Id
    )
    SELECT
        p.Product_Id,
        p.Name,
        COALESCE(v.Variant_Image_Path, p.Img) AS Img,
        p.Category,
        CASE WHEN p.HasVariants = 1 THEN COALESCE(v.PackagingQuantity, 0) ELSE p.Quantity END AS Quantity,
        p.Servings,
        p.GPerServing, p.GNutrition, p.MainDescriptions,
        p.OtherDescriptionTitle, p.OtherDescriptionText, p.NutritionValuesIngredients,
        p.NutritionValuesIngredientsDescription, p.NutritionInformation,
        p.InstructionsForUse, p.InstructionsForUseDescription, p.InstructionsOnHowToUseIt,
        p.CreatedAt, p.UpdatedAt, p.NewInTheShop, p.ProductsOnSale, p.SalePrice, p.SaleEndDate,
        CASE
            WHEN p.ProductsOnSale = 1
             AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
             AND COALESCE(v.Compare_Price, p.SalePrice) > 0
             AND COALESCE(v.Compare_Price, p.SalePrice) < COALESCE(v.Price, p.Price)
                THEN COALESCE(v.Compare_Price, p.SalePrice)
            ELSE NULL
        END AS Compare_Price,
        p.UpcomingPromotion,
        p.ShortExpiry, p.ExpiryDate, p.IsGiftVoucher, p.VoucherMinAmount, p.VoucherMaxAmount, p.NameAl,
        p.RecommendedForYou, p.ProductsInTheOutlet, p.JustForMe,
        COALESCE(v.Price, p.Price) AS Price,
        p.HasVariants,
        p.Brand_Id, p.Flavor_Id,
        b.Brand_Name AS BrandName,
        COALESCE(v.Flavor_Name, f.Flavor_Name) AS FlavorName,
        p.Product_Id AS Parent_Product_Id,
        v.Variant_Id,
        CASE WHEN v.Variant_Id IS NULL THEN 0 ELSE 1 END AS IsVariant,
        v.Packaging_Name AS VariantPackagingName,
        v.Flavor_Name AS VariantFlavorName,
        CAST(CASE WHEN ap.Product_Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsApparel,
        CASE WHEN p.HasVariants = 1 THEN (
            SELECT COUNT(*)
            FROM (
                SELECT DISTINCT COALESCE(
                    CONVERT(nvarchar(50), packaging.Packaging_Id),
                    NULLIF(LOWER(LTRIM(RTRIM(packaging.Packaging_Name))), ''),
                    CONCAT('variant-', packaging.Variant_Id)
                ) AS PackagingKey
                FROM dbo.ProductVariants packaging
                WHERE packaging.Product_Id = p.Product_Id AND packaging.IsActive = 1
            ) packagingGroups
        ) ELSE 1 END AS PackagingCount,
        CASE WHEN p.HasVariants = 1 THEN (
            SELECT COUNT(DISTINCT COALESCE(
                CONVERT(nvarchar(50), taste.Flavor_Id),
                NULLIF(LOWER(LTRIM(RTRIM(taste.Flavor_Name))), '')
            ))
            FROM dbo.ProductVariants taste
            WHERE taste.Product_Id = p.Product_Id AND taste.IsActive = 1
        ) ELSE CASE WHEN p.Flavor_Id IS NULL THEN 0 ELSE 1 END END AS FlavorCount,
        CASE WHEN @HasSearch = 1 THEN
            CASE
                WHEN p.Name = @SearchExact OR p.NameAl = @SearchExact THEN 0
                WHEN p.Name LIKE @SearchPrefix OR p.NameAl LIKE @SearchPrefix THEN 1
                WHEN p.Name LIKE @SearchContains OR p.NameAl LIKE @SearchContains THEN 2
                WHEN b.Brand_Name LIKE @SearchContains THEN 3
                ELSE 4
            END
        ELSE 99 END AS SearchRank,
        ISNULL(ps.SoldCount, 0) AS SoldCount,
        CASE
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%battery%' THEN 0
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%sportnahrung%' THEN 0
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%proteini.si%'
              OR LOWER(COALESCE(b.Brand_Name, '')) LIKE '%proteini si%' THEN 1
            WHEN LOWER(COALESCE(b.Brand_Name, '')) = 'usn' THEN 2
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%olimp%' THEN 3
            WHEN EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping priorityPcm
                INNER JOIN dbo.ProductCategories priorityCategory
                    ON priorityCategory.Category_Id = priorityPcm.Category_Id
                WHERE priorityPcm.Product_Id = p.Product_Id
                  AND (LOWER(priorityCategory.Category_Name) LIKE '%whey%'
                       OR LOWER(priorityCategory.Category_Name) LIKE '%protein powder%')
            ) THEN 4
            WHEN EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping priorityPcm
                INNER JOIN dbo.ProductCategories priorityCategory
                    ON priorityCategory.Category_Id = priorityPcm.Category_Id
                WHERE priorityPcm.Product_Id = p.Product_Id
                  AND LOWER(priorityCategory.Category_Name) LIKE '%bar%'
            ) THEN 5
            ELSE 6
        END AS PriorityRank,
        CASE WHEN @SortBy = 'priority' THEN COALESCE((
            SELECT MIN(CASE pin.Scope WHEN N'category' THEN 0 WHEN N'brand' THEN 100000 ELSE 200000 END + pin.Position)
            FROM dbo.ProductPlacements pin
            WHERE pin.Product_Id = p.Product_Id
              AND ((pin.Scope = N'category' AND pin.Target_Id IN (SELECT Id FROM @PinCategoryIds))
                OR (pin.Scope = N'brand' AND pin.Target_Id IN (SELECT Id FROM @PinBrandIds))
                OR (pin.Scope = N'all' AND pin.Target_Id = 0 AND @PinAll = 1))
        ), 2147483647) ELSE 2147483647 END AS PinRank
    INTO #Filtered
    FROM dbo.Products p
    LEFT JOIN RankedVariants v
        ON v.Product_Id = p.Product_Id AND v.PackagingRow = 1
    LEFT JOIN dbo.Brands b ON p.Brand_Id = b.Brand_Id
    LEFT JOIN dbo.Flavors f ON p.Flavor_Id = f.Flavor_Id
    LEFT JOIN ProductSales ps ON ps.Product_Id = p.Product_Id
    LEFT JOIN ApparelProducts ap ON ap.Product_Id = p.Product_Id
    WHERE (ISNULL(p.HasVariants, 0) = 0 OR v.Variant_Id IS NOT NULL)
      AND (@FilterCategories = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductCategoryMapping pcm
            WHERE pcm.Product_Id = p.Product_Id AND pcm.Category_Id IN (SELECT Id FROM @CategoryIds)))
      AND (@FilterSports = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductSportMapping psm
            WHERE psm.Product_Id = p.Product_Id AND psm.Sport_Id IN (SELECT Id FROM @SportIds)))
      AND (@FilterGoals = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductGoalMapping pgm
            WHERE pgm.Product_Id = p.Product_Id AND pgm.Goal_Id IN (SELECT Id FROM @GoalIds)))
      AND (@FilterUseTimings = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductUseTimingMapping putm
            WHERE putm.Product_Id = p.Product_Id AND putm.UseTiming_Id IN (SELECT Id FROM @UseTimingIds)))
      AND (@FilterTags = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductTagMapping ptm
            WHERE ptm.Product_Id = p.Product_Id AND ptm.Tag_Id IN (SELECT Id FROM @TagIds)))
      AND (@FilterBrands = 0 OR p.Brand_Id IN (SELECT Id FROM @BrandIds))
      AND (@FilterFlavors = 0 OR p.Flavor_Id IN (SELECT Id FROM @FlavorIds) OR v.Flavor_Id IN (SELECT Id FROM @FlavorIds))
      AND (@FilterProducts = 0 OR p.Product_Id IN (SELECT Id FROM @ProductIds))
      AND (@FilterSizes = 0 OR EXISTS (
            SELECT 1 FROM dbo.ProductVariants sized
            WHERE sized.Product_Id = p.Product_Id
              AND sized.IsActive = 1
              AND (@InStock = 0 OR sized.Quantity > 0)
              AND LOWER(LTRIM(RTRIM(sized.Packaging_Name))) IN (SELECT LOWER(LTRIM(RTRIM(Value))) FROM @Sizes)))
      AND (@MinPrice IS NULL OR COALESCE(v.Price, p.Price) >= @MinPrice)
      AND (@MaxPrice IS NULL OR COALESCE(v.Price, p.Price) <= @MaxPrice)
      AND (@InStock = 0 OR ((ISNULL(p.HasVariants, 0) = 1 AND v.PackagingQuantity > 0) OR (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0)))
      AND (@OnSale = 0 OR (p.ProductsOnSale = 1 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))))
      AND (@UpcomingPromotions = 0 OR p.UpcomingPromotion = 1)
      AND (@NewProducts = 0 OR p.NewInTheShop = 1)
      AND (@BestSellers = 0 OR ps.SoldCount > 0)
      AND (@Outlet = 0 OR p.ProductsInTheOutlet = 1)
      AND (@GiftVouchers = 0 OR p.IsGiftVoucher = 1)
      AND (@JustForMe = 0 OR (p.JustForMe = 1
            AND ((ISNULL(p.HasVariants, 0) = 1 AND v.PackagingQuantity > 0) OR (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0))))
      AND (@HasSearch = 0 OR EXISTS (
            SELECT 1
            FROM @SearchTerms term
            WHERE p.Name LIKE term.Value
               OR p.NameAl LIKE term.Value
               OR b.Brand_Name LIKE term.Value
               OR f.Flavor_Name LIKE term.Value
               OR v.Flavor_Name LIKE term.Value
               OR v.Packaging_Name LIKE term.Value
               OR v.Variant_Name LIKE term.Value
               OR EXISTS (
                    SELECT 1
                    FROM dbo.ProductVariants searchVariant
                    WHERE searchVariant.Product_Id = p.Product_Id
                      AND searchVariant.IsActive = 1
                      AND (searchVariant.Flavor_Name LIKE term.Value
                           OR searchVariant.Packaging_Name LIKE term.Value
                           OR searchVariant.Variant_Name LIKE term.Value
                           OR searchVariant.SKU LIKE term.Value))
               OR EXISTS (
                    SELECT 1
                    FROM dbo.ProductCategoryMapping searchPcm
                    INNER JOIN dbo.ProductCategories searchCategory
                        ON searchCategory.Category_Id = searchPcm.Category_Id
                    WHERE searchPcm.Product_Id = p.Product_Id
                      AND (searchCategory.Category_Name LIKE term.Value
                           OR searchCategory.Category_Slug LIKE term.Value))))
    OPTION (RECOMPILE);

    SELECT COUNT(*) FROM #Filtered;

    SELECT *
    FROM #Filtered
    ORDER BY
        SearchRank ASC,
        CASE WHEN PinRank < 2147483647 AND Quantity > 0 THEN PinRank ELSE 2147483647 END ASC,
        CASE WHEN @SortBy = 'price' AND @SortDesc = 0 THEN Price END ASC,
        CASE WHEN @SortBy = 'price' AND @SortDesc = 1 THEN Price END DESC,
        CASE WHEN @SortBy = 'name' AND @SortDesc = 0 THEN Name END ASC,
        CASE WHEN @SortBy = 'name' AND @SortDesc = 1 THEN Name END DESC,
        CASE WHEN @SortBy = 'createdat' AND @SortDesc = 0 THEN CreatedAt END ASC,
        CASE WHEN @SortBy = 'createdat' AND @SortDesc = 1 THEN CreatedAt END DESC,
        CASE WHEN @SortBy = 'product_id' AND @SortDesc = 0 THEN Product_Id END ASC,
        CASE WHEN @SortBy = 'product_id' AND @SortDesc = 1 THEN Product_Id END DESC,
        CASE WHEN @SortBy = 'priority' AND @SortDesc = 0 THEN PriorityRank END ASC,
        CASE WHEN @SortBy = 'priority' AND @SortDesc = 1 THEN PriorityRank END DESC,
        CASE WHEN @SortBy = 'soldcount' AND @SortDesc = 0 THEN SoldCount END ASC,
        CASE WHEN @SortBy = 'soldcount' AND @SortDesc = 1 THEN SoldCount END DESC,
        CASE WHEN @SortBy = 'soldcount' THEN PriorityRank END ASC,
        Product_Id ASC,
        Variant_Id ASC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
