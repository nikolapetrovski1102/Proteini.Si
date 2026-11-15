-- Discounts on specific products now pick single items (each flavor/weight variant, or the product
-- itself when it has no variants) and can set a new price per item instead of a percentage.
--
--   * Discounts.Discount_Type: 'percent' (Percentage off) or 'price' (each item's New_Price; products only).
--     Percentage is NULL for 'price' discounts.
--   * DiscountItems: the items of a 'products' discount. Variant_Id 0 = a product without variants.
--     Brand and category discounts keep using DiscountTargets.
--   * DiscountAppliedVariants.Discount_Id: which discount set the variant's price (NULL = cleared so a
--     stale manual sale price doesn't show next to a discounted variant).
--
-- Existing 'products' discounts are converted: every active variant of a chosen product (or the product
-- itself) becomes an item, so they keep covering exactly what they covered before.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Discounts', 'Discount_Type') IS NULL
    ALTER TABLE dbo.Discounts ADD Discount_Type NVARCHAR(10) NOT NULL
        CONSTRAINT DF_Discounts_DiscountType DEFAULT (N'percent');
GO

IF OBJECT_ID('dbo.CK_Discounts_Percentage', 'C') IS NOT NULL
    ALTER TABLE dbo.Discounts DROP CONSTRAINT CK_Discounts_Percentage;
GO

ALTER TABLE dbo.Discounts ALTER COLUMN Percentage DECIMAL(5, 2) NULL;
GO

IF OBJECT_ID('dbo.CK_Discounts_Type', 'C') IS NULL
    ALTER TABLE dbo.Discounts ADD CONSTRAINT CK_Discounts_Type CHECK (
        (Discount_Type = N'percent' AND Percentage > 0 AND Percentage < 100)
        OR (Discount_Type = N'price' AND Percentage IS NULL AND Applies_To = N'products')
    );
GO

IF OBJECT_ID('dbo.DiscountItems', 'U') IS NULL
    CREATE TABLE dbo.DiscountItems
    (
        Discount_Id INT NOT NULL
            CONSTRAINT FK_DiscountItems_Discounts REFERENCES dbo.Discounts (Discount_Id) ON DELETE CASCADE,
        Product_Id INT NOT NULL,
        Variant_Id INT NOT NULL CONSTRAINT DF_DiscountItems_Variant DEFAULT (0),
        New_Price DECIMAL(18, 2) NULL CONSTRAINT CK_DiscountItems_NewPrice CHECK (New_Price IS NULL OR New_Price > 0),
        CONSTRAINT PK_DiscountItems PRIMARY KEY (Discount_Id, Product_Id, Variant_Id)
    );
GO

IF COL_LENGTH('dbo.DiscountAppliedVariants', 'Discount_Id') IS NULL
    ALTER TABLE dbo.DiscountAppliedVariants ADD Discount_Id INT NULL;
GO

-- Convert existing product discounts into items.
INSERT INTO dbo.DiscountItems (Discount_Id, Product_Id, Variant_Id)
SELECT t.Discount_Id, p.Product_Id, ISNULL(pv.Variant_Id, 0)
FROM dbo.DiscountTargets t
INNER JOIN dbo.Discounts d ON d.Discount_Id = t.Discount_Id AND d.Applies_To = N'products'
INNER JOIN dbo.Products p ON p.Product_Id = t.Target_Id
LEFT JOIN dbo.ProductVariants pv ON ISNULL(p.HasVariants, 0) = 1 AND pv.Product_Id = p.Product_Id AND pv.IsActive = 1
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.DiscountItems i
    WHERE i.Discount_Id = t.Discount_Id AND i.Product_Id = p.Product_Id AND i.Variant_Id = ISNULL(pv.Variant_Id, 0)
);

DELETE t
FROM dbo.DiscountTargets t
INNER JOIN dbo.Discounts d ON d.Discount_Id = t.Discount_Id AND d.Applies_To = N'products';
GO
