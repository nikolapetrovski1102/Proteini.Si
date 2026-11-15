SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Recommendations for a product page, in two groups (Reason):
--   'together' : led by products from paired categories (dbo.CategoryPairings: proteins <-> creatine, proteins <->
--                pre-workout, creatine <-> pre-workout), taken in turn from each paired category, then what customers
--                put in the same order as this product (shaker), topped up with best sellers that serve the same goal.
--                Never a product from this product's own top categories (no protein next to a protein): those are
--                rivals and belong in 'similar';
--   'similar'  : alternatives from the same subcategory, ranked by shared goals, same brand and sales.
-- Only products that can be bought right now (in stock, active packaging, not gift vouchers); a product is never in
-- both groups. Up to @Limit per group.
CREATE OR ALTER PROCEDURE dbo.usp_Product_GetRelated
    @ProductId INT,
    @Limit INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Valid orders only (as in usp_Product_Filter).
    SELECT o.Order_Id
    INTO #ValidOrders
    FROM dbo.Orders o
    WHERE ISNULL(LOWER(o.Order_Status), '') <> 'cancelled'
      AND ISNULL(LOWER(o.Payment_Status), '') NOT IN ('failed', 'refunded');

    -- Products that can be bought right now.
    SELECT p.Product_Id, p.Name, p.Img, p.Price, p.Brand_Id, p.CreatedAt
    INTO #Buyable
    FROM dbo.Products p
    WHERE p.Product_Id <> @ProductId
      AND ISNULL(p.IsGiftVoucher, 0) = 0
      AND (
            (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0)
         OR (ISNULL(p.HasVariants, 0) = 1 AND EXISTS (
                SELECT 1 FROM dbo.ProductVariants pv
                WHERE pv.Product_Id = p.Product_Id AND pv.IsActive = 1 AND pv.Quantity > 0))
      );

    SELECT b.Product_Id, SUM(ISNULL(oi.Quantity, 0)) AS SoldCount
    INTO #Sales
    FROM #Buyable b
    LEFT JOIN dbo.OrderItems oi ON oi.Product_Id = b.Product_Id
        AND oi.Order_Id IN (SELECT Order_Id FROM #ValidOrders)
    GROUP BY b.Product_Id;

    -- The most specific categories of this product: its subcategories, or its top categories when it has none.
    SELECT pcm.Category_Id
    INTO #OwnCategories
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    WHERE pcm.Product_Id = @ProductId
      AND (c.Parent_Category_Id IS NOT NULL
           OR NOT EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping own
                INNER JOIN dbo.ProductCategories ownCategory ON ownCategory.Category_Id = own.Category_Id
                WHERE own.Product_Id = @ProductId AND ownCategory.Parent_Category_Id IS NOT NULL));

    -- This product's top categories (a subcategory counts as its parent). 'together' never shows products from these.
    SELECT DISTINCT COALESCE(c.Parent_Category_Id, c.Category_Id) AS Category_Id
    INTO #OwnTop
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    WHERE pcm.Product_Id = @ProductId;

    -- Buyable products from another top category only (candidates for 'together').
    SELECT b.Product_Id
    INTO #Complements
    FROM #Buyable b
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.ProductCategoryMapping pcm
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
        WHERE pcm.Product_Id = b.Product_Id
          AND COALESCE(c.Parent_Category_Id, c.Category_Id) IN (SELECT Category_Id FROM #OwnTop));

    SELECT Goal_Id INTO #OwnGoals FROM dbo.ProductGoalMapping WHERE Product_Id = @ProductId;
    DECLARE @BrandId INT = (SELECT Brand_Id FROM dbo.Products WHERE Product_Id = @ProductId);

    -- Similar: shares one of the specific categories.
    SELECT TOP (@Limit)
        b.Product_Id,
        (SELECT COUNT(*) FROM dbo.ProductCategoryMapping pcm
            WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #OwnCategories)) * 4
        + (SELECT COUNT(*) FROM dbo.ProductGoalMapping pgm
            WHERE pgm.Product_Id = b.Product_Id AND pgm.Goal_Id IN (SELECT Goal_Id FROM #OwnGoals)) * 2
        + CASE WHEN @BrandId IS NOT NULL AND b.Brand_Id = @BrandId THEN 1 ELSE 0 END AS Score,
        s.SoldCount
    INTO #Similar
    FROM #Buyable b
    INNER JOIN #Sales s ON s.Product_Id = b.Product_Id
    WHERE EXISTS (
        SELECT 1 FROM dbo.ProductCategoryMapping pcm
        WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #OwnCategories))
    ORDER BY Score DESC, s.SoldCount DESC, b.CreatedAt DESC, b.Product_Id DESC;

    -- How many valid orders hold this product together with each other product.
    SELECT other.Product_Id, COUNT(DISTINCT other.Order_Id) AS TogetherCount
    INTO #CoPurchase
    FROM dbo.OrderItems mine
    INNER JOIN dbo.OrderItems other ON other.Order_Id = mine.Order_Id AND other.Product_Id <> mine.Product_Id
    WHERE mine.Product_Id = @ProductId
      AND mine.Order_Id IN (SELECT Order_Id FROM #ValidOrders)
    GROUP BY other.Product_Id;

    -- Paired categories (dbo.CategoryPairings, e.g. creatine <-> pre-workout): the pairing is set on top categories,
    -- so this product counts by its top categories and the paired side includes the subcategories.
    SELECT DISTINCT pair.Paired_Category_Id AS Category_Id
    INTO #PairedTop
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    INNER JOIN dbo.CategoryPairings pair ON pair.Category_Id = COALESCE(c.Parent_Category_Id, c.Category_Id)
    WHERE pcm.Product_Id = @ProductId;

    -- Each candidate's paired top category (the lowest id when it sits in more than one).
    SELECT b.Product_Id, MIN(COALESCE(c.Parent_Category_Id, c.Category_Id)) AS PairedTop_Id
    INTO #PairedOf
    FROM #Buyable b
    INNER JOIN dbo.ProductCategoryMapping pcm ON pcm.Product_Id = b.Product_Id
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    WHERE COALESCE(c.Parent_Category_Id, c.Category_Id) IN (SELECT Category_Id FROM #PairedTop)
      AND b.Product_Id NOT IN (SELECT Product_Id FROM #Similar)
      AND b.Product_Id IN (SELECT Product_Id FROM #Complements)
    GROUP BY b.Product_Id;

    -- Ranked within each paired category, then taken in turn (creatine, pre-workout, creatine, ...), so one paired
    -- category does not fill the row on its own.
    SELECT
        ranked.Product_Id,
        ranked.Score,
        ranked.SoldCount,
        ROW_NUMBER() OVER (ORDER BY ranked.CategoryRank, ranked.Score DESC, ranked.SoldCount DESC, ranked.Product_Id DESC) AS PairedRank
    INTO #Paired
    FROM (
        SELECT
            po.Product_Id,
            ISNULL(cp.TogetherCount, 0) AS Score,
            s.SoldCount,
            ROW_NUMBER() OVER (PARTITION BY po.PairedTop_Id
                ORDER BY ISNULL(cp.TogetherCount, 0) DESC, s.SoldCount DESC, b.CreatedAt DESC, b.Product_Id DESC) AS CategoryRank
        FROM #PairedOf po
        INNER JOIN #Buyable b ON b.Product_Id = po.Product_Id
        INNER JOIN #Sales s ON s.Product_Id = po.Product_Id
        LEFT JOIN #CoPurchase cp ON cp.Product_Id = po.Product_Id
    ) ranked;

    -- Bought together, filled in this order (Bucket):
    --   1. paired-category products, up to half the row, so they always lead;
    --   2. products bought in the same orders as this one;
    --   3. more paired-category products;
    --   4. best sellers for the same goals from other categories (a complement, not a rival).
    -- PairedRank keeps the paired products in turn (buckets 1 and 3); 0 for the others, which sort by Score.
    CREATE TABLE #Together (Product_Id INT PRIMARY KEY, Bucket INT, PairedRank INT, Score INT, SoldCount INT);
    DECLARE @PairedFirst INT = CEILING(@Limit / 2.0);

    INSERT INTO #Together (Product_Id, Bucket, PairedRank, Score, SoldCount)
    SELECT Product_Id, 1, PairedRank, Score, SoldCount FROM #Paired WHERE PairedRank <= @PairedFirst;

    DECLARE @Missing INT = @Limit - (SELECT COUNT(*) FROM #Together);
    IF @Missing > 0
        INSERT INTO #Together (Product_Id, Bucket, PairedRank, Score, SoldCount)
        SELECT TOP (@Missing) b.Product_Id, 2, 0, cp.TogetherCount, s.SoldCount
        FROM #CoPurchase cp
        INNER JOIN #Buyable b ON b.Product_Id = cp.Product_Id
        INNER JOIN #Sales s ON s.Product_Id = b.Product_Id
        WHERE b.Product_Id NOT IN (SELECT Product_Id FROM #Similar)
          AND b.Product_Id NOT IN (SELECT Product_Id FROM #Together)
          AND b.Product_Id IN (SELECT Product_Id FROM #Complements)
        ORDER BY cp.TogetherCount DESC, s.SoldCount DESC, b.Product_Id DESC;

    SET @Missing = @Limit - (SELECT COUNT(*) FROM #Together);
    IF @Missing > 0
        INSERT INTO #Together (Product_Id, Bucket, PairedRank, Score, SoldCount)
        SELECT TOP (@Missing) p.Product_Id, 3, p.PairedRank, p.Score, p.SoldCount
        FROM #Paired p
        WHERE p.Product_Id NOT IN (SELECT Product_Id FROM #Together)
        ORDER BY p.PairedRank;

    SET @Missing = @Limit - (SELECT COUNT(*) FROM #Together);
    IF @Missing > 0
        INSERT INTO #Together (Product_Id, Bucket, PairedRank, Score, SoldCount)
        SELECT TOP (@Missing) b.Product_Id, 4, 0, 0, s.SoldCount
        FROM #Buyable b
        INNER JOIN #Sales s ON s.Product_Id = b.Product_Id
        WHERE b.Product_Id NOT IN (SELECT Product_Id FROM #Similar)
          AND b.Product_Id NOT IN (SELECT Product_Id FROM #Together)
          AND b.Product_Id IN (SELECT Product_Id FROM #Complements)
          AND EXISTS (
                SELECT 1 FROM dbo.ProductGoalMapping pgm
                WHERE pgm.Product_Id = b.Product_Id AND pgm.Goal_Id IN (SELECT Goal_Id FROM #OwnGoals))
          AND NOT EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping pcm
                WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #OwnCategories))
        ORDER BY s.SoldCount DESC, b.CreatedAt DESC, b.Product_Id DESC;

    SELECT
        b.Product_Id,
        b.Name,
        b.Img,
        CAST(b.Price AS decimal(18, 2)) AS Price,
        r.SoldCount AS OrderCount,
        r.Reason
    FROM (
        SELECT Product_Id, SoldCount, N'together' AS Reason, 0 AS GroupOrder,
               ROW_NUMBER() OVER (ORDER BY Bucket, PairedRank, Score DESC, SoldCount DESC, Product_Id DESC) AS Position
        FROM #Together
        UNION ALL
        SELECT Product_Id, SoldCount, N'similar', 1,
               ROW_NUMBER() OVER (ORDER BY Score DESC, SoldCount DESC, Product_Id DESC)
        FROM #Similar
    ) r
    INNER JOIN #Buyable b ON b.Product_Id = r.Product_Id
    ORDER BY r.GroupOrder, r.Position;
END
GO
