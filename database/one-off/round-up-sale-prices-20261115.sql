-- Sale prices set in the old admin were rounded DOWN to the ten below the exact discount
-- (1690 at -10% saved as 1520 instead of 1521). Prices are always rounded up, so this raises
-- each such sale price to the exact discounted price, rounded up to a whole denar.
--
-- Only touches a sale price when:
--   * the discount is a whole multiple of 5% (10%, 15%, 20%...), so the intended % is clear, and
--   * the saved price is below the exact price by less than 10 denars (a rounded-down ten).
-- Prices that were already rounded up, or odd percentages, are left alone.
-- Keeps the old values in dbo._SalePriceRoundUp_20261115 so it can be undone. Safe to re-run.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo._SalePriceRoundUp_20261115') IS NULL
    CREATE TABLE dbo._SalePriceRoundUp_20261115 (
        Kind CHAR(1) NOT NULL,          -- P = Products.SalePrice, V = ProductVariants.Compare_Price
        Id INT NOT NULL,
        Old_Price DECIMAL(18, 2) NOT NULL,
        New_Price DECIMAL(18, 2) NOT NULL,
        Changed_At DATETIME NOT NULL DEFAULT GETDATE()
    );

BEGIN TRANSACTION;

;WITH s AS (
    SELECT 'V' AS Kind, Variant_Id AS Id, Price, Compare_Price AS Sale
    FROM dbo.ProductVariants WHERE Compare_Price > 0 AND Compare_Price < Price
    UNION ALL
    SELECT 'P', Product_Id, Price, SalePrice
    FROM dbo.Products WHERE SalePrice > 0 AND SalePrice < Price
), pct AS (
    SELECT *, CAST(ROUND(100 - Sale * 100 / Price, 0) AS int) AS Pct FROM s
), exact AS (
    SELECT *, CAST(CEILING(Price * (100 - Pct) / 100.0) AS decimal(18, 2)) AS Exact FROM pct
)
INSERT INTO dbo._SalePriceRoundUp_20261115 (Kind, Id, Old_Price, New_Price)
SELECT Kind, Id, Sale, Exact
FROM exact
WHERE Pct % 5 = 0 AND Exact > Sale AND Exact - Sale < 10 AND Exact < Price;

DECLARE @Batch DATETIME = (SELECT MAX(Changed_At) FROM dbo._SalePriceRoundUp_20261115);

UPDATE pv SET Compare_Price = b.New_Price
FROM dbo.ProductVariants pv
INNER JOIN dbo._SalePriceRoundUp_20261115 b ON b.Kind = 'V' AND b.Id = pv.Variant_Id AND b.Changed_At = @Batch
WHERE pv.Compare_Price = b.Old_Price;

UPDATE p SET SalePrice = b.New_Price
FROM dbo.Products p
INNER JOIN dbo._SalePriceRoundUp_20261115 b ON b.Kind = 'P' AND b.Id = p.Product_Id AND b.Changed_At = @Batch
WHERE p.SalePrice = b.Old_Price;

COMMIT TRANSACTION;

SELECT Kind, Id, Old_Price, New_Price FROM dbo._SalePriceRoundUp_20261115 WHERE Changed_At = @Batch ORDER BY Kind, Id;

-- Undo:
-- UPDATE pv SET Compare_Price = b.Old_Price FROM dbo.ProductVariants pv JOIN dbo._SalePriceRoundUp_20261115 b ON b.Kind='V' AND b.Id=pv.Variant_Id AND pv.Compare_Price=b.New_Price;
-- UPDATE p SET SalePrice = b.Old_Price FROM dbo.Products p JOIN dbo._SalePriceRoundUp_20261115 b ON b.Kind='P' AND b.Id=p.Product_Id AND p.SalePrice=b.New_Price;
