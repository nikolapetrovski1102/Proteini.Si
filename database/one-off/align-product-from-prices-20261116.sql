-- One-off (2026-11-16): set each variant product's own price to its lowest active variant price, the rule
-- usp_Product_SyncPriceFromVariants now keeps after every variant save. Undo: dbo._FromPriceAlign_20261116.
SET NOCOUNT ON;
IF OBJECT_ID('dbo._FromPriceAlign_20261116') IS NULL
    CREATE TABLE dbo._FromPriceAlign_20261116 (Product_Id INT PRIMARY KEY, Old_Price DECIMAL(38, 10), New_Price DECIMAL(18, 2));

;WITH f AS (
    SELECT p.Product_Id, p.Price AS Old_Price, MIN(v.Price) AS New_Price
    FROM dbo.Products p
    INNER JOIN dbo.ProductVariants v ON v.Product_Id = p.Product_Id AND v.IsActive = 1 AND v.Price > 0
    WHERE ISNULL(p.HasVariants, 0) = 1 AND ISNULL(p.IsGiftVoucher, 0) = 0
    GROUP BY p.Product_Id, p.Price
    HAVING p.Price IS NULL OR p.Price <> MIN(v.Price))
INSERT INTO dbo._FromPriceAlign_20261116 (Product_Id, Old_Price, New_Price)
SELECT Product_Id, Old_Price, New_Price FROM f
WHERE Product_Id NOT IN (SELECT Product_Id FROM dbo._FromPriceAlign_20261116);

UPDATE p SET Price = a.New_Price, UpdatedAt = GETDATE()
FROM dbo.Products p INNER JOIN dbo._FromPriceAlign_20261116 a ON a.Product_Id = p.Product_Id
WHERE p.Price IS NULL OR p.Price <> a.New_Price;

SELECT COUNT(*) AS ProductsAligned FROM dbo._FromPriceAlign_20261116;
