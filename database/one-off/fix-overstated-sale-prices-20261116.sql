-- Some live sale prices were rounded UP to the next ten (1690 at -20% saved as 1360 instead of 1352), so the "% off"
-- badge promised more than the real discount. This lowers each such sale price to the exact price for the
-- shown percentage, rounded up to a whole denar (1690 -20% -> 1352, 3790 -16% -> 3184).
--
-- Only touches sales that are live (ProductsOnSale = 1, end date not passed), not managed by an admin Discount rule,
-- and only when the saved price is above the exact price by less than 10 denars.
-- Old values go to dbo._SalePriceFix_20261116 so it can be undone. Safe to re-run.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo._SalePriceFix_20261116') IS NULL
    CREATE TABLE dbo._SalePriceFix_20261116 (
        Kind CHAR(1) NOT NULL,          -- P = Products.SalePrice, V = ProductVariants.Compare_Price
        Id INT NOT NULL,
        Old_Price DECIMAL(18, 2) NOT NULL,
        New_Price DECIMAL(18, 2) NOT NULL,
        Changed_At DATETIME NOT NULL DEFAULT GETDATE()
    );

BEGIN TRANSACTION;

;WITH live AS (
    SELECT Product_Id FROM dbo.Products
    WHERE ProductsOnSale = 1 AND (SaleEndDate IS NULL OR SaleEndDate >= CAST(GETDATE() AS date))
), s AS (
    SELECT 'V' AS Kind, v.Variant_Id AS Id, v.Price, v.Compare_Price AS Sale
    FROM dbo.ProductVariants v INNER JOIN live l ON l.Product_Id = v.Product_Id
    WHERE v.Compare_Price > 0 AND v.Compare_Price < v.Price
      AND NOT EXISTS (SELECT 1 FROM dbo.DiscountItems di WHERE di.Variant_Id = v.Variant_Id)
    UNION ALL
    SELECT 'P', p.Product_Id, p.Price, p.SalePrice
    FROM dbo.Products p INNER JOIN live l ON l.Product_Id = p.Product_Id
    WHERE p.SalePrice > 0 AND p.SalePrice < p.Price
), pct AS (
    SELECT *, CAST(ROUND((Price - Sale) * 100.0 / Price, 0) AS int) AS Pct FROM s
), exact AS (
    SELECT *, CAST(CEILING(Price * (100 - Pct) / 100.0) AS decimal(18, 2)) AS Exact FROM pct
)
INSERT INTO dbo._SalePriceFix_20261116 (Kind, Id, Old_Price, New_Price)
SELECT Kind, Id, Sale, Exact
FROM exact
WHERE Sale > Exact AND Sale - Exact < 10;

DECLARE @Batch DATETIME = (SELECT MAX(Changed_At) FROM dbo._SalePriceFix_20261116);

UPDATE pv SET Compare_Price = b.New_Price, Updated_At = GETDATE()
FROM dbo.ProductVariants pv
INNER JOIN dbo._SalePriceFix_20261116 b ON b.Kind = 'V' AND b.Id = pv.Variant_Id AND b.Changed_At = @Batch
WHERE pv.Compare_Price = b.Old_Price;

UPDATE p SET SalePrice = b.New_Price
FROM dbo.Products p
INNER JOIN dbo._SalePriceFix_20261116 b ON b.Kind = 'P' AND b.Id = p.Product_Id AND b.Changed_At = @Batch
WHERE p.SalePrice = b.Old_Price;

COMMIT TRANSACTION;

SELECT Kind, Id, Old_Price, New_Price FROM dbo._SalePriceFix_20261116 WHERE Changed_At = @Batch ORDER BY Kind, Id;

-- Undo:
-- UPDATE pv SET Compare_Price = b.Old_Price FROM dbo.ProductVariants pv JOIN dbo._SalePriceFix_20261116 b ON b.Kind='V' AND b.Id=pv.Variant_Id AND pv.Compare_Price=b.New_Price;
-- UPDATE p SET SalePrice = b.Old_Price FROM dbo.Products p JOIN dbo._SalePriceFix_20261116 b ON b.Kind='P' AND b.Id=p.Product_Id AND p.SalePrice=b.New_Price;
