-- Products with variants are sold at the variant price, but the admin let people type a different product price.
-- Management decided (2026-11-16):
--   * BATTERY REBEL MASS GAINER (2114): the shop price becomes 2990 (variant 1068 was 2890).
--   * BATTERY D3 + K2 (1093) and BATTERY CREATINE 250g (2318): shop prices stay (950 / 1590); only the hidden
--     product price field is aligned to them.
-- Old values go to dbo._PriceAlign_20261116 so it can be undone.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo._PriceAlign_20261116') IS NULL
    CREATE TABLE dbo._PriceAlign_20261116 (
        Kind CHAR(1) NOT NULL, Id INT NOT NULL,
        Old_Price DECIMAL(18, 2) NOT NULL, New_Price DECIMAL(18, 2) NOT NULL,
        Changed_At DATETIME NOT NULL DEFAULT GETDATE()
    );

BEGIN TRANSACTION;

INSERT INTO dbo._PriceAlign_20261116 (Kind, Id, Old_Price, New_Price)
SELECT 'V', Variant_Id, Price, 2990 FROM dbo.ProductVariants WHERE Variant_Id = 1068 AND Product_Id = 2114 AND Price = 2890
UNION ALL SELECT 'P', Product_Id, Price, 950 FROM dbo.Products WHERE Product_Id = 1093 AND Price = 1090
UNION ALL SELECT 'P', Product_Id, Price, 1590 FROM dbo.Products WHERE Product_Id = 2318 AND Price = 1290;

UPDATE dbo.ProductVariants SET Price = 2990, Updated_At = GETDATE() WHERE Variant_Id = 1068 AND Price = 2890;

UPDATE p
SET Price = b.New_Price,
    DDV_Amount = b.New_Price * p.DDV_Percentage / 100,
    Price_Without_DDV = b.New_Price,
    Price_With_DDV = b.New_Price + b.New_Price * p.DDV_Percentage / 100
FROM dbo.Products p
INNER JOIN dbo._PriceAlign_20261116 b ON b.Kind = 'P' AND b.Id = p.Product_Id AND p.Price = b.Old_Price;

COMMIT TRANSACTION;

SELECT * FROM dbo._PriceAlign_20261116;
SELECT p.Product_Id, LEFT(p.Name, 30) Name, p.Price ProductPrice, v.Variant_Id, v.Price VariantPrice
FROM dbo.Products p JOIN dbo.ProductVariants v ON v.Product_Id = p.Product_Id WHERE p.Product_Id IN (2114, 1093, 2318);
