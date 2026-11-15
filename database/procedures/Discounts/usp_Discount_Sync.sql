SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Writes the running discounts into the shop's sale fields and puts back what was there before for
-- discounts that ended, were switched off, changed or deleted. Called after every admin change and
-- every few minutes by the API (so start and end dates take effect on their own). Safe to re-run.
--
-- Rules:
--   * Percentage prices are whole denars, rounded up (1690 at 10% off → 1521). 'price' discounts use the
--     item's New_Price as entered; it only applies while it is below the item's normal price.
--   * A discount runs when it is on and today is between Starts_On and Ends_On (both optional, inclusive).
--   * Prices are worked out per item (each variant, or the product itself without variants). An item
--     covered by several running discounts gets the lowest price.
--   * A manual sale price that is already lower than the discount price is kept.
--   * Products without variants get Products.SalePrice; products with variants get each discounted
--     variant's Compare_Price. ProductsOnSale is switched on and SaleEndDate set to the end date of the
--     product's biggest discount. Variants of that product that are not discounted lose a stale manual
--     sale price (one that only showed while the product was on sale), and get it back afterwards.
--   * Putting back only touches a field the admin did not change in the meantime.
CREATE OR ALTER PROCEDURE dbo.usp_Discount_Sync
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Today DATE = CAST(GETDATE() AS date);

    BEGIN TRANSACTION;

    -- One sync at a time (admin saves and the background timer can overlap).
    EXEC sp_getapplock @Resource = N'usp_Discount_Sync', @LockMode = N'Exclusive', @LockOwner = N'Transaction', @LockTimeout = 30000;

    -- 1. Put back everything applied last time.
    UPDATE pv
    SET Compare_Price = CASE
            WHEN pv.Compare_Price = a.Applied_Compare_Price
              OR (pv.Compare_Price IS NULL AND a.Applied_Compare_Price IS NULL)
                THEN a.Prev_Compare_Price
            ELSE pv.Compare_Price
        END
    FROM dbo.ProductVariants pv
    INNER JOIN dbo.DiscountAppliedVariants a ON a.Variant_Id = pv.Variant_Id;

    UPDATE p
    SET ProductsOnSale = CASE WHEN p.ProductsOnSale = 1 THEN a.Prev_ProductsOnSale ELSE p.ProductsOnSale END,
        SalePrice = CASE
            WHEN p.SalePrice = a.Applied_SalePrice OR (p.SalePrice IS NULL AND a.Applied_SalePrice IS NULL)
                THEN a.Prev_SalePrice
            ELSE p.SalePrice
        END,
        SaleEndDate = CASE
            WHEN CAST(p.SaleEndDate AS date) = a.Applied_SaleEndDate OR (p.SaleEndDate IS NULL AND a.Applied_SaleEndDate IS NULL)
                THEN a.Prev_SaleEndDate
            ELSE p.SaleEndDate
        END
    FROM dbo.Products p
    INNER JOIN dbo.DiscountAppliedProducts a ON a.Product_Id = p.Product_Id;

    DELETE FROM dbo.DiscountAppliedVariants;
    DELETE FROM dbo.DiscountAppliedProducts;

    -- 2. Running discounts.
    SELECT d.Discount_Id, d.Applies_To, d.Discount_Type, d.Percentage, d.Ends_On
    INTO #Running
    FROM dbo.Discounts d
    WHERE d.Is_Active = 1
      AND (d.Starts_On IS NULL OR d.Starts_On <= @Today)
      AND (d.Ends_On IS NULL OR d.Ends_On >= @Today);

    -- Every discounted price on offer per item (Variant_Id 0 = product without variants).
    CREATE TABLE #Candidates (
        Product_Id INT NOT NULL, Variant_Id INT NOT NULL, Discount_Id INT NOT NULL,
        Ends_On DATE NULL, Price DECIMAL(18, 2) NOT NULL, Discounted DECIMAL(18, 2) NOT NULL);

    -- Brands and categories: every item of the product, at the percentage.
    INSERT INTO #Candidates
    SELECT p.Product_Id, ISNULL(pv.Variant_Id, 0), r.Discount_Id, r.Ends_On, item.Price,
           CAST(CEILING(item.Price * (100 - r.Percentage) / 100) AS decimal(18, 2))
    FROM #Running r
    INNER JOIN dbo.fn_Discount_Products() dp ON dp.Discount_Id = r.Discount_Id
    INNER JOIN dbo.Products p ON p.Product_Id = dp.Product_Id
    LEFT JOIN dbo.ProductVariants pv ON ISNULL(p.HasVariants, 0) = 1 AND pv.Product_Id = p.Product_Id
    CROSS APPLY (SELECT CASE WHEN ISNULL(p.HasVariants, 0) = 1 THEN pv.Price ELSE p.Price END AS Price) item
    WHERE r.Applies_To <> N'products'
      AND r.Discount_Type = N'percent'
      AND item.Price > 0
      AND (ISNULL(p.HasVariants, 0) = 0 OR pv.Variant_Id IS NOT NULL);

    -- Products: the chosen items, at the percentage or their new price.
    INSERT INTO #Candidates
    SELECT p.Product_Id, i.Variant_Id, r.Discount_Id, r.Ends_On, item.Price,
           CASE WHEN r.Discount_Type = N'price' THEN i.New_Price
                ELSE CAST(CEILING(item.Price * (100 - r.Percentage) / 100) AS decimal(18, 2)) END
    FROM #Running r
    INNER JOIN dbo.DiscountItems i ON i.Discount_Id = r.Discount_Id
    INNER JOIN dbo.Products p ON p.Product_Id = i.Product_Id AND ISNULL(p.IsGiftVoucher, 0) = 0
    LEFT JOIN dbo.ProductVariants pv ON pv.Variant_Id = i.Variant_Id AND pv.Product_Id = i.Product_Id
    CROSS APPLY (SELECT CASE WHEN i.Variant_Id > 0 THEN pv.Price ELSE p.Price END AS Price) item
    WHERE r.Applies_To = N'products'
      AND item.Price > 0
      AND ((i.Variant_Id = 0 AND ISNULL(p.HasVariants, 0) = 0) OR (i.Variant_Id > 0 AND ISNULL(p.HasVariants, 0) = 1))
      AND (r.Discount_Type = N'percent' OR i.New_Price IS NOT NULL);

    DELETE FROM #Candidates WHERE Discounted <= 0 OR Discounted >= Price;

    -- The lowest price per item.
    SELECT ranked.Product_Id, ranked.Variant_Id, ranked.Discount_Id, ranked.Price, ranked.Discounted
    INTO #Best
    FROM (
        SELECT c.*, ROW_NUMBER() OVER (PARTITION BY c.Product_Id, c.Variant_Id ORDER BY c.Discounted, c.Discount_Id) AS Rn
        FROM #Candidates c
    ) ranked
    WHERE ranked.Rn = 1;

    -- Per product: its biggest discount (for the end date and the admin count) and whether the
    -- product's own (manual) sale is running right now.
    SELECT ranked.Product_Id, ranked.Discount_Id, ranked.Ends_On,
           CAST(CASE WHEN p.ProductsOnSale = 1
                      AND (p.SaleEndDate IS NULL OR CAST(p.SaleEndDate AS date) >= @Today)
                     THEN 1 ELSE 0 END AS BIT) AS ManualSaleRunning
    INTO #Targets
    FROM (
        SELECT b.Product_Id, b.Discount_Id, r.Ends_On,
               ROW_NUMBER() OVER (PARTITION BY b.Product_Id ORDER BY (b.Price - b.Discounted) / b.Price DESC, b.Discount_Id) AS Rn
        FROM #Best b
        INNER JOIN #Running r ON r.Discount_Id = b.Discount_Id
    ) ranked
    INNER JOIN dbo.Products p ON p.Product_Id = ranked.Product_Id
    WHERE ranked.Rn = 1;

    -- 3. Remember the current values and the ones we write.
    INSERT INTO dbo.DiscountAppliedProducts
        (Product_Id, Discount_Id, Prev_ProductsOnSale, Prev_SalePrice, Prev_SaleEndDate, Applied_SalePrice, Applied_SaleEndDate)
    SELECT p.Product_Id, t.Discount_Id, ISNULL(p.ProductsOnSale, 0), p.SalePrice, CAST(p.SaleEndDate AS date),
           CASE
               WHEN ISNULL(p.HasVariants, 0) = 1 OR b.Discounted IS NULL THEN p.SalePrice
               WHEN t.ManualSaleRunning = 1 AND p.SalePrice > 0 AND p.SalePrice < p.Price AND p.SalePrice <= b.Discounted
                   THEN p.SalePrice
               ELSE b.Discounted
           END,
           t.Ends_On
    FROM #Targets t
    INNER JOIN dbo.Products p ON p.Product_Id = t.Product_Id
    LEFT JOIN #Best b ON b.Product_Id = t.Product_Id AND b.Variant_Id = 0;

    INSERT INTO dbo.DiscountAppliedVariants (Variant_Id, Product_Id, Discount_Id, Prev_Compare_Price, Applied_Compare_Price)
    SELECT pv.Variant_Id, pv.Product_Id, b.Discount_Id, pv.Compare_Price,
           CASE
               -- Not discounted: keep a running manual sale, drop one that only showed because of the sale switch.
               WHEN b.Variant_Id IS NULL THEN CASE WHEN t.ManualSaleRunning = 1 THEN pv.Compare_Price END
               WHEN t.ManualSaleRunning = 1 AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                AND pv.Compare_Price <= b.Discounted
                   THEN pv.Compare_Price
               ELSE b.Discounted
           END
    FROM #Targets t
    INNER JOIN dbo.Products p ON p.Product_Id = t.Product_Id AND ISNULL(p.HasVariants, 0) = 1
    INNER JOIN dbo.ProductVariants pv ON pv.Product_Id = t.Product_Id
    LEFT JOIN #Best b ON b.Product_Id = pv.Product_Id AND b.Variant_Id = pv.Variant_Id
    WHERE b.Variant_Id IS NOT NULL OR (t.ManualSaleRunning = 0 AND pv.Compare_Price IS NOT NULL);

    -- 4. Write them.
    UPDATE p
    SET ProductsOnSale = 1,
        SalePrice = a.Applied_SalePrice,
        SaleEndDate = a.Applied_SaleEndDate
    FROM dbo.Products p
    INNER JOIN dbo.DiscountAppliedProducts a ON a.Product_Id = p.Product_Id;

    UPDATE pv
    SET Compare_Price = a.Applied_Compare_Price
    FROM dbo.ProductVariants pv
    INNER JOIN dbo.DiscountAppliedVariants a ON a.Variant_Id = pv.Variant_Id;

    COMMIT TRANSACTION;

    SELECT COUNT(*) AS ProductsDiscounted FROM dbo.DiscountAppliedProducts;
END
GO
