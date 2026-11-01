SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
BEGIN TRANSACTION;

/* Current confirmed shipping policy, editable through the admin API. */
IF OBJECT_ID('dbo.ShippingSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ShippingSettings
    (
        ShippingSettingsId int NOT NULL CONSTRAINT PK_ShippingSettings PRIMARY KEY,
        FlatDeliveryFee decimal(18,2) NOT NULL,
        CashOnDeliveryFee decimal(18,2) NOT NULL,
        FreeDeliveryThreshold decimal(18,2) NOT NULL,
        HomeDeliveryEnabled bit NOT NULL CONSTRAINT DF_ShippingSettings_HomeDelivery DEFAULT (1),
        CardPaymentEnabled bit NOT NULL CONSTRAINT DF_ShippingSettings_Card DEFAULT (1),
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_ShippingSettings_UpdatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedBy nvarchar(255) NULL,
        CONSTRAINT CK_ShippingSettings_NonNegative CHECK
        (
            FlatDeliveryFee >= 0 AND CashOnDeliveryFee >= 0 AND FreeDeliveryThreshold >= 0
        )
    );

    INSERT dbo.ShippingSettings
        (ShippingSettingsId, FlatDeliveryFee, CashOnDeliveryFee, FreeDeliveryThreshold)
    VALUES (1, 165.00, 30.00, 3000.00);
END;

IF OBJECT_ID('dbo.HomepageCards', 'U') IS NOT NULL
   AND COL_LENGTH('dbo.HomepageCards', 'DestinationUrl') IS NULL
    ALTER TABLE dbo.HomepageCards ADD DestinationUrl nvarchar(500) NULL;

/* Stored-value vouchers are distinct from promotion codes. */
IF OBJECT_ID('dbo.GiftVouchers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GiftVouchers
    (
        GiftVoucherId int IDENTITY(1,1) NOT NULL CONSTRAINT PK_GiftVouchers PRIMARY KEY,
        Code nvarchar(64) NOT NULL,
        InitialValue decimal(18,2) NOT NULL,
        RemainingValue decimal(18,2) NOT NULL,
        Currency char(3) NOT NULL CONSTRAINT DF_GiftVouchers_Currency DEFAULT ('MKD'),
        Status nvarchar(20) NOT NULL CONSTRAINT DF_GiftVouchers_Status DEFAULT ('active'),
        PurchasedOrderId int NOT NULL,
        PurchasedOrderItemId int NOT NULL,
        UnitSequence int NOT NULL,
        PurchaserEmail nvarchar(255) NULL,
        RecipientEmail nvarchar(255) NULL,
        ValidFrom datetime2(3) NOT NULL CONSTRAINT DF_GiftVouchers_ValidFrom DEFAULT SYSUTCDATETIME(),
        ExpiresAt datetime2(3) NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_GiftVouchers_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt datetime2(3) NOT NULL CONSTRAINT DF_GiftVouchers_UpdatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_GiftVouchers_Code UNIQUE (Code),
        CONSTRAINT UQ_GiftVouchers_OrderItemUnit UNIQUE (PurchasedOrderItemId, UnitSequence),
        CONSTRAINT FK_GiftVouchers_Order FOREIGN KEY (PurchasedOrderId) REFERENCES dbo.Orders(Order_Id),
        CONSTRAINT FK_GiftVouchers_OrderItem FOREIGN KEY (PurchasedOrderItemId) REFERENCES dbo.OrderItems(OrderItem_Id),
        CONSTRAINT CK_GiftVouchers_Value CHECK
        (
            InitialValue > 0 AND RemainingValue >= 0 AND RemainingValue <= InitialValue
        ),
        CONSTRAINT CK_GiftVouchers_Status CHECK
        (
            Status IN ('active', 'depleted', 'disabled', 'expired')
        )
    );
END;

IF OBJECT_ID('dbo.GiftVoucherRedemptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.GiftVoucherRedemptions
    (
        GiftVoucherRedemptionId int IDENTITY(1,1) NOT NULL CONSTRAINT PK_GiftVoucherRedemptions PRIMARY KEY,
        GiftVoucherId int NOT NULL,
        OrderId int NOT NULL,
        Amount decimal(18,2) NOT NULL,
        Status nvarchar(20) NOT NULL CONSTRAINT DF_GiftVoucherRedemptions_Status DEFAULT ('reserved'),
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_GiftVoucherRedemptions_CreatedAt DEFAULT SYSUTCDATETIME(),
        CompletedAt datetime2(3) NULL,
        ReleasedAt datetime2(3) NULL,
        CONSTRAINT UQ_GiftVoucherRedemptions_Order UNIQUE (OrderId),
        CONSTRAINT FK_GiftVoucherRedemptions_Voucher FOREIGN KEY (GiftVoucherId) REFERENCES dbo.GiftVouchers(GiftVoucherId),
        CONSTRAINT FK_GiftVoucherRedemptions_Order FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Order_Id),
        CONSTRAINT CK_GiftVoucherRedemptions_Amount CHECK (Amount > 0),
        CONSTRAINT CK_GiftVoucherRedemptions_Status CHECK
        (
            Status IN ('reserved', 'redeemed', 'released')
        )
    );
END;

IF COL_LENGTH('dbo.Orders', 'Gift_Voucher_Amount') IS NULL
    ALTER TABLE dbo.Orders ADD Gift_Voucher_Amount decimal(18,2) NOT NULL
        CONSTRAINT DF_Orders_GiftVoucherAmount DEFAULT (0);
IF COL_LENGTH('dbo.Orders', 'Tracking_Number') IS NULL
    ALTER TABLE dbo.Orders ADD Tracking_Number nvarchar(120) NULL;
IF COL_LENGTH('dbo.Orders', 'Tracking_Url') IS NULL
    ALTER TABLE dbo.Orders ADD Tracking_Url nvarchar(1000) NULL;
IF COL_LENGTH('dbo.Orders', 'Shipped_At') IS NULL
    ALTER TABLE dbo.Orders ADD Shipped_At datetime2(3) NULL;

/* Stable operational documents. The generated HTML is explicitly not a fiscal invoice. */
IF OBJECT_ID('dbo.OrderDocuments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderDocuments
    (
        OrderDocumentId int IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderDocuments PRIMARY KEY,
        OrderId int NOT NULL,
        DocumentType nvarchar(40) NOT NULL,
        Version int NOT NULL,
        GeneratedAt datetime2(3) NOT NULL CONSTRAINT DF_OrderDocuments_GeneratedAt DEFAULT SYSUTCDATETIME(),
        GeneratedBy nvarchar(255) NULL,
        ContentHash char(64) NOT NULL,
        HtmlContent nvarchar(max) NOT NULL,
        CONSTRAINT UQ_OrderDocuments_OrderTypeVersion UNIQUE (OrderId, DocumentType, Version),
        CONSTRAINT FK_OrderDocuments_Order FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Order_Id)
    );
END;

/* Editorial detail pages, localization and SEO. */
IF OBJECT_ID('dbo.TipArticles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TipArticles
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_TipArticles PRIMARY KEY,
        Category nvarchar(100) NOT NULL CONSTRAINT DF_TipArticles_Category DEFAULT ('news'),
        Title nvarchar(300) NOT NULL,
        Subtitle nvarchar(500) NULL,
        Content nvarchar(max) NULL,
        ImagePath nvarchar(500) NULL,
        DisplayOrder int NOT NULL CONSTRAINT DF_TipArticles_DisplayOrder DEFAULT (0),
        IsActive bit NOT NULL CONSTRAINT DF_TipArticles_IsActive DEFAULT (1),
        CreatedAt datetime NOT NULL CONSTRAINT DF_TipArticles_CreatedAt DEFAULT GETDATE(),
        UpdatedAt datetime NULL
    );
END;

IF COL_LENGTH('dbo.TipArticles', 'Slug') IS NULL
    ALTER TABLE dbo.TipArticles ADD Slug nvarchar(180) NULL;
IF COL_LENGTH('dbo.TipArticles', 'TitleAl') IS NULL
    ALTER TABLE dbo.TipArticles ADD TitleAl nvarchar(300) NULL;
IF COL_LENGTH('dbo.TipArticles', 'SubtitleAl') IS NULL
    ALTER TABLE dbo.TipArticles ADD SubtitleAl nvarchar(1000) NULL;
IF COL_LENGTH('dbo.TipArticles', 'Content') IS NULL
    ALTER TABLE dbo.TipArticles ADD Content nvarchar(max) NULL;
IF COL_LENGTH('dbo.TipArticles', 'ContentAl') IS NULL
    ALTER TABLE dbo.TipArticles ADD ContentAl nvarchar(max) NULL;
IF COL_LENGTH('dbo.TipArticles', 'SeoTitle') IS NULL
    ALTER TABLE dbo.TipArticles ADD SeoTitle nvarchar(300) NULL;
IF COL_LENGTH('dbo.TipArticles', 'SeoDescription') IS NULL
    ALTER TABLE dbo.TipArticles ADD SeoDescription nvarchar(500) NULL;

/* Compile this statement after the optional Slug column has been added. */
EXEC sys.sp_executesql N'
;WITH Numbered AS
(
    SELECT Id,
           CONCAT(''tip-'', Id) AS GeneratedSlug
    FROM dbo.TipArticles
    WHERE Slug IS NULL OR LTRIM(RTRIM(Slug)) = ''''
)
UPDATE tips SET Slug = n.GeneratedSlug
FROM dbo.TipArticles tips
INNER JOIN Numbered n ON n.Id = tips.Id;';

IF NOT EXISTS
(
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.TipArticles') AND name = 'UX_TipArticles_Slug'
)
    EXEC sys.sp_executesql N'
        CREATE UNIQUE INDEX UX_TipArticles_Slug
        ON dbo.TipArticles(Slug)
        WHERE Slug IS NOT NULL;';

/* Newsletter consent and unsubscribe audit fields. */
IF OBJECT_ID('dbo.NewsletterSubscribers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.NewsletterSubscribers
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_NewsletterSubscribers PRIMARY KEY,
        Email nvarchar(320) NOT NULL,
        Source nvarchar(50) NULL,
        IsActive bit NOT NULL CONSTRAINT DF_NewsletterSubscribers_IsActive DEFAULT (1),
        SubscribedAt datetime2 NOT NULL CONSTRAINT DF_NewsletterSubscribers_SubscribedAt DEFAULT GETDATE(),
        UpdatedAt datetime2 NULL,
        CONSTRAINT UQ_NewsletterSubscribers_Email UNIQUE (Email)
    );
END;

IF COL_LENGTH('dbo.NewsletterSubscribers', 'ConsentCapturedAt') IS NULL
    ALTER TABLE dbo.NewsletterSubscribers ADD ConsentCapturedAt datetime2(3) NULL;
IF COL_LENGTH('dbo.NewsletterSubscribers', 'ConsentSource') IS NULL
    ALTER TABLE dbo.NewsletterSubscribers ADD ConsentSource nvarchar(100) NULL;
IF COL_LENGTH('dbo.NewsletterSubscribers', 'UnsubscribedAt') IS NULL
    ALTER TABLE dbo.NewsletterSubscribers ADD UnsubscribedAt datetime2(3) NULL;

/* Compile this statement after the optional consent columns have been added. */
EXEC sys.sp_executesql N'
UPDATE dbo.NewsletterSubscribers
SET ConsentCapturedAt = COALESCE(ConsentCapturedAt, SubscribedAt),
    ConsentSource = COALESCE(NULLIF(ConsentSource, ''''), Source)
WHERE ConsentCapturedAt IS NULL OR ConsentSource IS NULL;';

/* Preserve old public category paths after a slug change. */
IF OBJECT_ID('dbo.CategorySlugHistory', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CategorySlugHistory
    (
        CategorySlugHistoryId int IDENTITY(1,1) NOT NULL CONSTRAINT PK_CategorySlugHistory PRIMARY KEY,
        CategoryId int NOT NULL,
        OldSlug nvarchar(255) NOT NULL,
        CreatedAt datetime2(3) NOT NULL CONSTRAINT DF_CategorySlugHistory_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_CategorySlugHistory_OldSlug UNIQUE (OldSlug),
        CONSTRAINT FK_CategorySlugHistory_Category FOREIGN KEY (CategoryId) REFERENCES dbo.ProductCategories(Category_Id)
    );
END;

COMMIT TRANSACTION;
