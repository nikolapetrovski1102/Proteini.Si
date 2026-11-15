-- 2026-11-11 review round:
--   1. Clothing: ProductCategories.Is_Apparel marks the clothing trees. A product mapped to an apparel category
--      (or one of its subcategories) is listed once per product (not once per size), its variants are colours
--      (not flavours) and its packaging is shown as "size". Existing clothing variants are switched to 'color'.
--   2. Home page showcase ("Ново во продавница"): HomeShowcase holds the title, source and card count chosen by the
--      admin; HomeShowcaseProducts the hand-picked products (Source = 'manual') in display order.
--   3. Loyalty: ShippingSettings.LoyaltyMinBalance (points needed before any can be used) and LoyaltyRedeemTiers
--      (JSON: [{"minOrder":1500,"maxPoints":100}, ...] — order value after promo code → most points usable).
-- Additive and idempotent; older API builds keep working.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ---------- 1. Apparel ---------- */
IF COL_LENGTH('dbo.ProductCategories', 'Is_Apparel') IS NULL
    ALTER TABLE dbo.ProductCategories ADD
        Is_Apparel BIT NOT NULL CONSTRAINT DF_ProductCategories_IsApparel DEFAULT (0);
GO

UPDATE dbo.ProductCategories
SET Is_Apparel = 1
WHERE Is_Apparel = 0
  AND Category_Slug IN (N'mens-clothing', N'womens-clothing', N'kids-clothes');
GO

-- Subcategories inherit the flag from their parent in the queries, but set it on them too so a lookup on a single
-- category is enough.
UPDATE child
SET Is_Apparel = 1
FROM dbo.ProductCategories child
INNER JOIN dbo.ProductCategories parent ON parent.Category_Id = child.Parent_Category_Id
WHERE parent.Is_Apparel = 1 AND child.Is_Apparel = 0;
GO

UPDATE pv
SET Option_Type = N'color'
FROM dbo.ProductVariants pv
WHERE pv.Option_Type <> N'color'
  AND EXISTS (
        SELECT 1
        FROM dbo.ProductCategoryMapping pcm
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
        WHERE pcm.Product_Id = pv.Product_Id AND c.Is_Apparel = 1);
GO

/* ---------- 2. Home page showcase ---------- */
IF OBJECT_ID('dbo.HomeShowcase', 'U') IS NULL
    CREATE TABLE dbo.HomeShowcase
    (
        Showcase_Key NVARCHAR(40) NOT NULL CONSTRAINT PK_HomeShowcase PRIMARY KEY,
        Title_Mk NVARCHAR(120) NULL,
        Title_Al NVARCHAR(120) NULL,
        Source NVARCHAR(20) NOT NULL CONSTRAINT DF_HomeShowcase_Source DEFAULT (N'new')
            CONSTRAINT CK_HomeShowcase_Source CHECK (Source IN (N'new', N'bestsellers', N'sale', N'manual')),
        Item_Count INT NOT NULL CONSTRAINT DF_HomeShowcase_ItemCount DEFAULT (3)
            CONSTRAINT CK_HomeShowcase_ItemCount CHECK (Item_Count BETWEEN 1 AND 12),
        Is_Active BIT NOT NULL CONSTRAINT DF_HomeShowcase_IsActive DEFAULT (1),
        Updated_At DATETIME2 NOT NULL CONSTRAINT DF_HomeShowcase_UpdatedAt DEFAULT (SYSUTCDATETIME()),
        Updated_By NVARCHAR(256) NULL
    );
GO

IF OBJECT_ID('dbo.HomeShowcaseProducts', 'U') IS NULL
    CREATE TABLE dbo.HomeShowcaseProducts
    (
        Showcase_Key NVARCHAR(40) NOT NULL
            CONSTRAINT FK_HomeShowcaseProducts_HomeShowcase REFERENCES dbo.HomeShowcase (Showcase_Key) ON DELETE CASCADE,
        Product_Id INT NOT NULL
            CONSTRAINT FK_HomeShowcaseProducts_Products REFERENCES dbo.Products (Product_Id) ON DELETE CASCADE,
        Display_Order INT NOT NULL,
        CONSTRAINT PK_HomeShowcaseProducts PRIMARY KEY (Showcase_Key, Product_Id)
    );
GO

IF NOT EXISTS (SELECT 1 FROM dbo.HomeShowcase WHERE Showcase_Key = N'whats-new')
    INSERT INTO dbo.HomeShowcase (Showcase_Key, Title_Mk, Title_Al, Source, Item_Count, Is_Active)
    VALUES (N'whats-new', NULL, NULL, N'new', 3, 1);
GO

/* ---------- 3. Loyalty redemption rules ---------- */
IF COL_LENGTH('dbo.ShippingSettings', 'LoyaltyMinBalance') IS NULL
    ALTER TABLE dbo.ShippingSettings ADD
        LoyaltyMinBalance DECIMAL(10, 2) NOT NULL CONSTRAINT DF_ShippingSettings_LoyaltyMinBalance DEFAULT (100);
GO

IF COL_LENGTH('dbo.ShippingSettings', 'LoyaltyRedeemTiers') IS NULL
    ALTER TABLE dbo.ShippingSettings ADD
        LoyaltyRedeemTiers NVARCHAR(1000) NOT NULL CONSTRAINT DF_ShippingSettings_LoyaltyRedeemTiers
            DEFAULT (N'[{"minOrder":1500,"maxPoints":100},{"minOrder":3000,"maxPoints":300},{"minOrder":5000,"maxPoints":500}]');
GO
