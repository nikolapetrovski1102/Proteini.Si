-- Automatic discounts (no code): a percentage off specific products, every product of chosen brands,
-- or every product in chosen categories (subcategories included), optionally between two dates.
--
--   * Discounts / DiscountTargets: what the admin set up. Target ids are product, brand or category ids,
--     depending on Discounts.Applies_To.
--   * DiscountAppliedProducts / DiscountAppliedVariants: what usp_Discount_Sync wrote into the existing sale
--     fields (Products.SalePrice / ProductsOnSale / SaleEndDate and ProductVariants.Compare_Price), with the
--     values that were there before, so they are put back when the discount ends or is removed.
--
-- Writing into the existing sale fields means the shop, cart, checkout, emails and the ad feed show the
-- discounted price without any change of their own.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Discounts', 'U') IS NULL
    CREATE TABLE dbo.Discounts
    (
        Discount_Id INT IDENTITY(1, 1) NOT NULL CONSTRAINT PK_Discounts PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Percentage DECIMAL(5, 2) NOT NULL
            CONSTRAINT CK_Discounts_Percentage CHECK (Percentage > 0 AND Percentage < 100),
        Applies_To NVARCHAR(20) NOT NULL
            CONSTRAINT CK_Discounts_AppliesTo CHECK (Applies_To IN (N'products', N'brands', N'categories')),
        Starts_On DATE NULL,
        Ends_On DATE NULL,
        Is_Active BIT NOT NULL CONSTRAINT DF_Discounts_IsActive DEFAULT (1),
        Created_At DATETIME2 NOT NULL CONSTRAINT DF_Discounts_CreatedAt DEFAULT (GETDATE()),
        Updated_At DATETIME2 NOT NULL CONSTRAINT DF_Discounts_UpdatedAt DEFAULT (GETDATE()),
        CONSTRAINT CK_Discounts_Dates CHECK (Starts_On IS NULL OR Ends_On IS NULL OR Starts_On <= Ends_On)
    );
GO

IF OBJECT_ID('dbo.DiscountTargets', 'U') IS NULL
    CREATE TABLE dbo.DiscountTargets
    (
        Discount_Id INT NOT NULL
            CONSTRAINT FK_DiscountTargets_Discounts REFERENCES dbo.Discounts (Discount_Id) ON DELETE CASCADE,
        Target_Id INT NOT NULL,
        CONSTRAINT PK_DiscountTargets PRIMARY KEY (Discount_Id, Target_Id)
    );
GO

IF OBJECT_ID('dbo.DiscountAppliedProducts', 'U') IS NULL
    CREATE TABLE dbo.DiscountAppliedProducts
    (
        Product_Id INT NOT NULL CONSTRAINT PK_DiscountAppliedProducts PRIMARY KEY,
        Discount_Id INT NOT NULL,
        Prev_ProductsOnSale BIT NOT NULL,
        Prev_SalePrice DECIMAL(18, 2) NULL,
        Prev_SaleEndDate DATE NULL,
        Applied_SalePrice DECIMAL(18, 2) NULL,
        Applied_SaleEndDate DATE NULL
    );
GO

IF OBJECT_ID('dbo.DiscountAppliedVariants', 'U') IS NULL
    CREATE TABLE dbo.DiscountAppliedVariants
    (
        Variant_Id INT NOT NULL CONSTRAINT PK_DiscountAppliedVariants PRIMARY KEY,
        Product_Id INT NOT NULL,
        Prev_Compare_Price DECIMAL(18, 2) NULL,
        Applied_Compare_Price DECIMAL(18, 2) NULL
    );
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DiscountAppliedProducts_Discount')
    CREATE INDEX IX_DiscountAppliedProducts_Discount ON dbo.DiscountAppliedProducts (Discount_Id);
GO
