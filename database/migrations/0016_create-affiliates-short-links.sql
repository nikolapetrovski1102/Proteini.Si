-- Affiliate marketing: influencers/partners own promo codes (PromoCodes.AffiliateId) and
-- short links (/r/<slug>) that carry a code and auto-apply it at checkout.
-- Sales are attributed through the existing PromoCodeUsages rows, so order creation is unchanged.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Affiliates', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Affiliates (
        AffiliateId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Affiliates PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Handle NVARCHAR(150) NULL,                  -- e.g. @instagram
        Email NVARCHAR(320) NULL,
        Phone NVARCHAR(50) NULL,
        CommissionPercent DECIMAL(5, 2) NOT NULL CONSTRAINT DF_Affiliates_Commission DEFAULT (0),
        Notes NVARCHAR(1000) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Affiliates_IsActive DEFAULT (1),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Affiliates_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Affiliates_UpdatedAt DEFAULT (GETDATE()),
        CONSTRAINT CK_Affiliates_Commission CHECK (CommissionPercent BETWEEN 0 AND 100)
    );
END
GO

IF COL_LENGTH('dbo.PromoCodes', 'AffiliateId') IS NULL
BEGIN
    ALTER TABLE dbo.PromoCodes ADD AffiliateId INT NULL
        CONSTRAINT FK_PromoCodes_Affiliates REFERENCES dbo.Affiliates (AffiliateId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PromoCodes_AffiliateId' AND object_id = OBJECT_ID('dbo.PromoCodes'))
    CREATE INDEX IX_PromoCodes_AffiliateId ON dbo.PromoCodes (AffiliateId) WHERE AffiliateId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PromoCodeUsages_OrderId' AND object_id = OBJECT_ID('dbo.PromoCodeUsages'))
    CREATE INDEX IX_PromoCodeUsages_OrderId ON dbo.PromoCodeUsages (OrderId);
GO

IF OBJECT_ID('dbo.ShortLinks', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ShortLinks (
        ShortLinkId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ShortLinks PRIMARY KEY,
        Slug NVARCHAR(60) NOT NULL CONSTRAINT UX_ShortLinks_Slug UNIQUE,
        TargetPath NVARCHAR(500) NOT NULL CONSTRAINT DF_ShortLinks_Target DEFAULT (N'/'),  -- site-relative path
        PromoCodeId INT NULL CONSTRAINT FK_ShortLinks_PromoCodes REFERENCES dbo.PromoCodes (PromoCodeId),
        AffiliateId INT NULL CONSTRAINT FK_ShortLinks_Affiliates REFERENCES dbo.Affiliates (AffiliateId),
        Label NVARCHAR(150) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_ShortLinks_IsActive DEFAULT (1),
        Clicks INT NOT NULL CONSTRAINT DF_ShortLinks_Clicks DEFAULT (0),
        LastClickedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ShortLinks_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_ShortLinks_UpdatedAt DEFAULT (GETDATE()),
        CONSTRAINT CK_ShortLinks_TargetPath CHECK (TargetPath LIKE N'/%' AND TargetPath NOT LIKE N'//%')
    );
    CREATE INDEX IX_ShortLinks_AffiliateId ON dbo.ShortLinks (AffiliateId) WHERE AffiliateId IS NOT NULL;
END
GO

-- Clicks per link per day, for the admin "clicks in this period" numbers.
IF OBJECT_ID('dbo.ShortLinkClicksDaily', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ShortLinkClicksDaily (
        ShortLinkId INT NOT NULL CONSTRAINT FK_ShortLinkClicksDaily_ShortLinks REFERENCES dbo.ShortLinks (ShortLinkId) ON DELETE CASCADE,
        ClickDate DATE NOT NULL,
        Clicks INT NOT NULL CONSTRAINT DF_ShortLinkClicksDaily_Clicks DEFAULT (0),
        CONSTRAINT PK_ShortLinkClicksDaily PRIMARY KEY (ShortLinkId, ClickDate)
    );
END
GO

-- One row per order that used an affiliate-owned code. Commission counts only orders that are
-- not cancelled/rejected/refunded and, for card payments, only once cPay confirmed the payment.
-- Net sales = products subtotal minus the code discount (delivery, points and vouchers excluded).
CREATE OR ALTER VIEW dbo.vw_AffiliateSales
AS
SELECT pc.AffiliateId,
       u.PromoCodeId,
       pc.Code,
       o.Order_Id,
       o.Order_Number,
       o.Order_Date,
       o.Order_Status,
       o.Payment_Method,
       o.Payment_Status,
       o.Billing_FullName,
       ISNULL(o.Subtotal, 0) AS Subtotal,
       ISNULL(o.Promo_Discount, 0) AS PromoDiscount,
       ISNULL(o.Subtotal, 0) - ISNULL(o.Promo_Discount, 0) AS NetSales,
       CAST(CASE WHEN o.Order_Status NOT IN ('cancelled', 'rejected', 'refunded')
                  AND ISNULL(o.Payment_Status, 'pending') NOT IN ('failed', 'refunded')
                  AND (o.Payment_Method <> 'credit_card' OR o.Payment_Status IN ('completed', 'paid'))
                 THEN 1 ELSE 0 END AS BIT) AS IsCommissionable
FROM dbo.PromoCodeUsages u
INNER JOIN dbo.PromoCodes pc ON pc.PromoCodeId = u.PromoCodeId
INNER JOIN dbo.Orders o ON o.Order_Id = u.OrderId
WHERE pc.AffiliateId IS NOT NULL;
GO
