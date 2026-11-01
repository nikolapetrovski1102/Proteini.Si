IF OBJECT_ID('dbo.PromoCodes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PromoCodes (
        PromoCodeId int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Code nvarchar(60) NOT NULL UNIQUE,
        Description nvarchar(500) NULL,
        DiscountType nvarchar(20) NOT NULL,
        DiscountValue decimal(18,2) NOT NULL,
        MinimumOrderAmount decimal(18,2) NOT NULL CONSTRAINT DF_PromoCodes_Minimum DEFAULT (0),
        MaximumDiscountAmount decimal(18,2) NULL,
        UsageLimit int NULL,
        PerCustomerLimit int NULL,
        ValidFrom datetime2 NULL,
        ValidUntil datetime2 NULL,
        IsActive bit NOT NULL CONSTRAINT DF_PromoCodes_IsActive DEFAULT (1),
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_PromoCodes_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt datetime2 NOT NULL CONSTRAINT DF_PromoCodes_UpdatedAt DEFAULT (GETDATE()),
        CONSTRAINT CK_PromoCodes_DiscountType CHECK (DiscountType IN ('percentage', 'fixed'))
    );
END;

IF OBJECT_ID('dbo.PromoCodeUsages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PromoCodeUsages (
        PromoCodeUsageId int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PromoCodeId int NOT NULL,
        OrderId int NOT NULL,
        UserId int NULL,
        CustomerEmail nvarchar(320) NULL,
        DiscountAmount decimal(18,2) NOT NULL,
        UsedAt datetime2 NOT NULL CONSTRAINT DF_PromoCodeUsages_UsedAt DEFAULT (GETDATE())
    );
    CREATE INDEX IX_PromoCodeUsages_PromoCodeId ON dbo.PromoCodeUsages(PromoCodeId);
    CREATE INDEX IX_PromoCodeUsages_CustomerEmail ON dbo.PromoCodeUsages(CustomerEmail);
END;

IF OBJECT_ID('dbo.FreeGifts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FreeGifts (
        FreeGiftId int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductId int NOT NULL,
        VariantId int NULL,
        DisplayName nvarchar(250) NULL,
        MinimumOrderAmount decimal(18,2) NOT NULL CONSTRAINT DF_FreeGifts_Minimum DEFAULT (0),
        ValidFrom datetime2 NULL,
        ValidUntil datetime2 NULL,
        IsActive bit NOT NULL CONSTRAINT DF_FreeGifts_IsActive DEFAULT (1),
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_FreeGifts_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt datetime2 NOT NULL CONSTRAINT DF_FreeGifts_UpdatedAt DEFAULT (GETDATE())
    );
END;

IF OBJECT_ID('dbo.OrderFreeGifts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderFreeGifts (
        OrderFreeGiftId int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        OrderId int NOT NULL,
        FreeGiftId int NOT NULL,
        ProductId int NOT NULL,
        VariantId int NULL,
        DisplayName nvarchar(250) NOT NULL,
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_OrderFreeGifts_CreatedAt DEFAULT (GETDATE())
    );
END;

IF COL_LENGTH('dbo.Orders', 'Promo_Code') IS NULL
    ALTER TABLE dbo.Orders ADD Promo_Code nvarchar(60) NULL;
IF COL_LENGTH('dbo.Orders', 'Promo_Discount') IS NULL
    ALTER TABLE dbo.Orders ADD Promo_Discount decimal(18,2) NOT NULL CONSTRAINT DF_Orders_PromoDiscount DEFAULT (0);
IF COL_LENGTH('dbo.Orders', 'Selected_Free_Gift_Id') IS NULL
    ALTER TABLE dbo.Orders ADD Selected_Free_Gift_Id int NULL;

IF COL_LENGTH('dbo.Products', 'ShortExpiry') IS NULL
    ALTER TABLE dbo.Products ADD ShortExpiry bit NOT NULL CONSTRAINT DF_Products_ShortExpiry DEFAULT (0);
IF COL_LENGTH('dbo.Products', 'ExpiryDate') IS NULL
    ALTER TABLE dbo.Products ADD ExpiryDate date NULL;
IF COL_LENGTH('dbo.Products', 'UpcomingPromotion') IS NULL
    ALTER TABLE dbo.Products ADD UpcomingPromotion bit NOT NULL CONSTRAINT DF_Products_UpcomingPromotion DEFAULT (0);
