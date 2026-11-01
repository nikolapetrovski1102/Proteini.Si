IF COL_LENGTH('dbo.Products', 'IsGiftVoucher') IS NULL
    ALTER TABLE dbo.Products ADD IsGiftVoucher bit NOT NULL CONSTRAINT DF_Products_IsGiftVoucher DEFAULT (0);

IF COL_LENGTH('dbo.Products', 'VoucherMinAmount') IS NULL
    ALTER TABLE dbo.Products ADD VoucherMinAmount decimal(18,2) NULL;

IF COL_LENGTH('dbo.Products', 'VoucherMaxAmount') IS NULL
    ALTER TABLE dbo.Products ADD VoucherMaxAmount decimal(18,2) NULL;

IF COL_LENGTH('dbo.Products', 'NameAl') IS NULL
    ALTER TABLE dbo.Products ADD NameAl nvarchar(500) NULL;

IF COL_LENGTH('dbo.Products', 'DescriptionAl') IS NULL
    ALTER TABLE dbo.Products ADD DescriptionAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionValuesIngredientsAl') IS NULL
    ALTER TABLE dbo.Products ADD NutritionValuesIngredientsAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionValuesIngredientsDescriptionAl') IS NULL
    ALTER TABLE dbo.Products ADD NutritionValuesIngredientsDescriptionAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionInformationAl') IS NULL
    ALTER TABLE dbo.Products ADD NutritionInformationAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsForUseAl') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsForUseAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsForUseDescriptionAl') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsForUseDescriptionAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsOnHowToUseItAl') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsOnHowToUseItAl nvarchar(max) NULL;

IF NOT EXISTS (SELECT 1 FROM dbo.ProductCategories WHERE Category_Slug = 'gift-voucher')
BEGIN
    INSERT INTO dbo.ProductCategories (Category_Name, Category_Slug, Parent_Category_Id, Display_Order)
    VALUES (N'Подарочни ваучери', N'gift-voucher', NULL,
        ISNULL((SELECT MAX(Display_Order) + 1 FROM dbo.ProductCategories), 0));
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ProductCategories WHERE Category_Slug = 'egg-white-protein')
BEGIN
    DECLARE @ProteinCategoryId int = (
        SELECT TOP 1 Category_Id
        FROM dbo.ProductCategories
        WHERE Category_Slug = 'proteins'
        ORDER BY Category_Id
    );

    INSERT INTO dbo.ProductCategories (Category_Name, Category_Slug, Parent_Category_Id, Display_Order)
    VALUES (N'Протеин од јајце', N'egg-white-protein', @ProteinCategoryId,
        ISNULL((SELECT MAX(Display_Order) + 1 FROM dbo.ProductCategories), 0));
END;
