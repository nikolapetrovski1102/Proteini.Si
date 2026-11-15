SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- The home page "Because you ordered" section for one signed-in customer, in three groups (Reason):
--   'anchor'  : the latest product from the customer's latest real orders (preferring one that can be bought now);
--   'reorder' : up to 3 other products from those orders that can be bought now, shown with an "Order again" tag;
--   'similar' : up to @Limit buyable products the customer never bought, scored against what they ordered:
--                 +4 per category shared with the anchor's specific categories, +2 per category shared with any
--                 ordered product, +2 per goal shared, +3 for a paired category (dbo.CategoryPairings,
--                 creatine <-> pre-workout), +2 same brand as the anchor, +1 brand of any ordered product,
--                 +1 per order (up to 5) in which other customers bought it with an ordered product;
--               ties go to best sellers, then newest.
-- A real order is one that was placed (card orders only once paid) and not cancelled, rejected or refunded; only the
-- latest 3 are used. No rows when the customer has none.
CREATE OR ALTER PROCEDURE dbo.usp_Product_GetForCustomer
    @UserId INT,
    @Limit INT
AS
BEGIN
    SET NOCOUNT ON;

    -- All real orders of this customer; the latest 3 drive the section, all of them decide what was "already bought".
    SELECT o.Order_Id, o.Order_Date,
           ROW_NUMBER() OVER (ORDER BY o.Order_Date DESC, o.Order_Id DESC) AS Recency
    INTO #MyOrders
    FROM dbo.Orders o
    WHERE o.User_Id = @UserId
      AND ISNULL(LOWER(LTRIM(RTRIM(o.Order_Status))), '') NOT IN ('cancelled', 'rejected', 'refunded')
      AND ISNULL(LOWER(o.Payment_Status), '') NOT IN ('failed', 'refunded')
      AND (ISNULL(o.Payment_Method, '') <> 'credit_card' OR LOWER(o.Payment_Status) IN ('completed', 'paid'));

    IF NOT EXISTS (SELECT 1 FROM #MyOrders)
        RETURN;

    -- Products that can be bought right now.
    SELECT p.Product_Id, p.Brand_Id, p.CreatedAt
    INTO #Buyable
    FROM dbo.Products p
    WHERE ISNULL(p.IsGiftVoucher, 0) = 0
      AND (
            (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0)
         OR (ISNULL(p.HasVariants, 0) = 1 AND EXISTS (
                SELECT 1 FROM dbo.ProductVariants pv
                WHERE pv.Product_Id = p.Product_Id AND pv.IsActive = 1 AND pv.Quantity > 0))
      );

    -- Everything the customer ever bought (never recommended as "similar").
    SELECT DISTINCT oi.Product_Id
    INTO #EverBought
    FROM dbo.OrderItems oi
    WHERE oi.Order_Id IN (SELECT Order_Id FROM #MyOrders);

    -- Products of the latest 3 orders, latest first (gift vouchers left out).
    SELECT
        oi.Product_Id,
        MAX(mo.Order_Date) AS OrderedAt,
        MIN(mo.Recency) AS Recency,
        MIN(oi.OrderItem_Id) AS FirstItem,
        CAST(CASE WHEN EXISTS (SELECT 1 FROM #Buyable b WHERE b.Product_Id = oi.Product_Id) THEN 1 ELSE 0 END AS BIT) AS IsBuyable
    INTO #Ordered
    FROM dbo.OrderItems oi
    INNER JOIN #MyOrders mo ON mo.Order_Id = oi.Order_Id AND mo.Recency <= 3
    INNER JOIN dbo.Products p ON p.Product_Id = oi.Product_Id
    WHERE ISNULL(p.IsGiftVoucher, 0) = 0
    GROUP BY oi.Product_Id;

    IF NOT EXISTS (SELECT 1 FROM #Ordered)
        RETURN;

    DECLARE @AnchorId INT = (
        SELECT TOP (1) Product_Id FROM #Ordered
        ORDER BY IsBuyable DESC, Recency, FirstItem);
    DECLARE @AnchorBrandId INT = (SELECT Brand_Id FROM dbo.Products WHERE Product_Id = @AnchorId);

    -- The most specific categories of a product: its subcategories, or its top categories when it has none.
    SELECT pcm.Product_Id, pcm.Category_Id
    INTO #OrderedCategories
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    WHERE pcm.Product_Id IN (SELECT Product_Id FROM #Ordered)
      AND (c.Parent_Category_Id IS NOT NULL
           OR NOT EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping own
                INNER JOIN dbo.ProductCategories ownCategory ON ownCategory.Category_Id = own.Category_Id
                WHERE own.Product_Id = pcm.Product_Id AND ownCategory.Parent_Category_Id IS NOT NULL));

    SELECT DISTINCT Category_Id INTO #AnchorCategories FROM #OrderedCategories WHERE Product_Id = @AnchorId;
    SELECT DISTINCT Category_Id INTO #AnyCategories FROM #OrderedCategories;

    SELECT DISTINCT Goal_Id INTO #Goals
    FROM dbo.ProductGoalMapping WHERE Product_Id IN (SELECT Product_Id FROM #Ordered);

    SELECT DISTINCT Brand_Id INTO #Brands
    FROM dbo.Products WHERE Product_Id IN (SELECT Product_Id FROM #Ordered) AND Brand_Id IS NOT NULL;

    -- Paired categories of the ordered products (pairings are on top categories and cover their subcategories).
    SELECT DISTINCT pair.Paired_Category_Id AS Category_Id
    INTO #PairedTop
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
    INNER JOIN dbo.CategoryPairings pair ON pair.Category_Id = COALESCE(c.Parent_Category_Id, c.Category_Id)
    WHERE pcm.Product_Id IN (SELECT Product_Id FROM #Ordered);

    SELECT c.Category_Id
    INTO #PairedCategories
    FROM dbo.ProductCategories c
    WHERE c.Category_Id IN (SELECT Category_Id FROM #PairedTop)
       OR c.Parent_Category_Id IN (SELECT Category_Id FROM #PairedTop);

    -- Valid orders of all customers, for sales and "bought together".
    SELECT o.Order_Id
    INTO #ValidOrders
    FROM dbo.Orders o
    WHERE ISNULL(LOWER(o.Order_Status), '') <> 'cancelled'
      AND ISNULL(LOWER(o.Payment_Status), '') NOT IN ('failed', 'refunded');

    SELECT oi.Product_Id, SUM(ISNULL(oi.Quantity, 0)) AS SoldCount
    INTO #Sales
    FROM dbo.OrderItems oi
    WHERE oi.Order_Id IN (SELECT Order_Id FROM #ValidOrders)
    GROUP BY oi.Product_Id;

    SELECT other.Product_Id, COUNT(DISTINCT other.Order_Id) AS TogetherCount
    INTO #CoPurchase
    FROM dbo.OrderItems mine
    INNER JOIN dbo.OrderItems other ON other.Order_Id = mine.Order_Id AND other.Product_Id <> mine.Product_Id
    WHERE mine.Product_Id IN (SELECT Product_Id FROM #Ordered)
      AND mine.Order_Id IN (SELECT Order_Id FROM #ValidOrders)
    GROUP BY other.Product_Id;

    SELECT TOP (@Limit)
        b.Product_Id,
        x.Score,
        ISNULL(s.SoldCount, 0) AS SoldCount,
        b.CreatedAt
    INTO #Similar
    FROM #Buyable b
    LEFT JOIN #Sales s ON s.Product_Id = b.Product_Id
    LEFT JOIN #CoPurchase cp ON cp.Product_Id = b.Product_Id
    CROSS APPLY (
        SELECT
            (SELECT COUNT(*) FROM dbo.ProductCategoryMapping pcm
                WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #AnchorCategories)) * 4
          + (SELECT COUNT(*) FROM dbo.ProductCategoryMapping pcm
                WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #AnyCategories)) * 2
          + (SELECT COUNT(*) FROM dbo.ProductGoalMapping pgm
                WHERE pgm.Product_Id = b.Product_Id AND pgm.Goal_Id IN (SELECT Goal_Id FROM #Goals)) * 2
          + CASE WHEN EXISTS (
                SELECT 1 FROM dbo.ProductCategoryMapping pcm
                WHERE pcm.Product_Id = b.Product_Id AND pcm.Category_Id IN (SELECT Category_Id FROM #PairedCategories))
                THEN 3 ELSE 0 END
          + CASE WHEN @AnchorBrandId IS NOT NULL AND b.Brand_Id = @AnchorBrandId THEN 2 ELSE 0 END
          + CASE WHEN b.Brand_Id IN (SELECT Brand_Id FROM #Brands) THEN 1 ELSE 0 END
          + CASE WHEN ISNULL(cp.TogetherCount, 0) > 5 THEN 5 ELSE ISNULL(cp.TogetherCount, 0) END AS Score
    ) x
    WHERE b.Product_Id NOT IN (SELECT Product_Id FROM #EverBought)
      AND x.Score > 0
    ORDER BY x.Score DESC, ISNULL(s.SoldCount, 0) DESC, b.CreatedAt DESC, b.Product_Id DESC;

    SELECT Product_Id, Reason, OrderedAt, Position
    FROM (
        SELECT @AnchorId AS Product_Id, N'anchor' AS Reason,
               (SELECT OrderedAt FROM #Ordered WHERE Product_Id = @AnchorId) AS OrderedAt,
               0 AS GroupOrder, 1 AS Position
        UNION ALL
        SELECT Product_Id, N'reorder', OrderedAt, 1,
               ROW_NUMBER() OVER (ORDER BY Recency, FirstItem)
        FROM (
            SELECT TOP (3) Product_Id, OrderedAt, Recency, FirstItem
            FROM #Ordered
            WHERE Product_Id <> @AnchorId AND IsBuyable = 1
            ORDER BY Recency, FirstItem
        ) reorder
        UNION ALL
        SELECT Product_Id, N'similar', NULL, 2,
               ROW_NUMBER() OVER (ORDER BY Score DESC, SoldCount DESC, CreatedAt DESC, Product_Id DESC)
        FROM #Similar
    ) r
    ORDER BY r.GroupOrder, r.Position;
END
GO
