-- Promo codes (including affiliate codes) can be limited to specific products or categories:
--   * PromoCodes.AppliesTo: 'all' (default, every product), 'products' or 'categories'.
--   * PromoCodeTargets: the chosen products (TargetType 'product') or categories ('category').
--     A category also covers its subcategories.
-- The discount is then calculated only on the matching items in the cart; the minimum order
-- amount still applies to the whole order.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.PromoCodes', 'AppliesTo') IS NULL
    ALTER TABLE dbo.PromoCodes ADD
        AppliesTo NVARCHAR(20) NOT NULL CONSTRAINT DF_PromoCodes_AppliesTo DEFAULT (N'all');
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_PromoCodes_AppliesTo')
    ALTER TABLE dbo.PromoCodes ADD CONSTRAINT CK_PromoCodes_AppliesTo
        CHECK (AppliesTo IN (N'all', N'products', N'categories'));
GO

IF OBJECT_ID('dbo.PromoCodeTargets', 'U') IS NULL
    CREATE TABLE dbo.PromoCodeTargets
    (
        PromoCodeId INT NOT NULL
            CONSTRAINT FK_PromoCodeTargets_PromoCodes REFERENCES dbo.PromoCodes (PromoCodeId) ON DELETE CASCADE,
        TargetType NVARCHAR(20) NOT NULL
            CONSTRAINT CK_PromoCodeTargets_TargetType CHECK (TargetType IN (N'product', N'category')),
        TargetId INT NOT NULL,
        CONSTRAINT PK_PromoCodeTargets PRIMARY KEY (PromoCodeId, TargetType, TargetId)
    );
GO
