-- 2026-11-15 gift vouchers: the buyer names who the voucher is for (name, email, short message) and both get their own
-- email once the card payment goes through. Staff can also check and redeem a code in the shop from the admin, so a
-- redemption no longer always belongs to an online order. Additive and idempotent; older API builds keep working.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Orders', 'Gift_Recipient_Name') IS NULL
    ALTER TABLE dbo.Orders ADD Gift_Recipient_Name NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Orders', 'Gift_Recipient_Email') IS NULL
    ALTER TABLE dbo.Orders ADD Gift_Recipient_Email NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Orders', 'Gift_Message') IS NULL
    ALTER TABLE dbo.Orders ADD Gift_Message NVARCHAR(500) NULL;
GO

IF COL_LENGTH('dbo.GiftVouchers', 'PurchaserName') IS NULL
    ALTER TABLE dbo.GiftVouchers ADD PurchaserName NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.GiftVouchers', 'RecipientName') IS NULL
    ALTER TABLE dbo.GiftVouchers ADD RecipientName NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.GiftVouchers', 'GiftMessage') IS NULL
    ALTER TABLE dbo.GiftVouchers ADD GiftMessage NVARCHAR(500) NULL;
GO

-- In-shop redemptions have no order. A UNIQUE constraint allows only one NULL, so it becomes a filtered unique index.
IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_GiftVoucherRedemptions_Order'
           AND parent_object_id = OBJECT_ID('dbo.GiftVoucherRedemptions'))
    ALTER TABLE dbo.GiftVoucherRedemptions DROP CONSTRAINT UQ_GiftVoucherRedemptions_Order;
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.GiftVoucherRedemptions')
           AND name = 'OrderId' AND is_nullable = 0)
    ALTER TABLE dbo.GiftVoucherRedemptions ALTER COLUMN OrderId INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_GiftVoucherRedemptions_Order'
               AND object_id = OBJECT_ID('dbo.GiftVoucherRedemptions'))
    CREATE UNIQUE INDEX UX_GiftVoucherRedemptions_Order ON dbo.GiftVoucherRedemptions (OrderId) WHERE OrderId IS NOT NULL;
GO

IF COL_LENGTH('dbo.GiftVoucherRedemptions', 'Channel') IS NULL
    ALTER TABLE dbo.GiftVoucherRedemptions ADD Channel NVARCHAR(20) NOT NULL
        CONSTRAINT DF_GiftVoucherRedemptions_Channel DEFAULT (N'online');
IF COL_LENGTH('dbo.GiftVoucherRedemptions', 'RedeemedBy') IS NULL
    ALTER TABLE dbo.GiftVoucherRedemptions ADD RedeemedBy NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.GiftVoucherRedemptions', 'Note') IS NULL
    ALTER TABLE dbo.GiftVoucherRedemptions ADD Note NVARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_GiftVoucherRedemptions_Channel')
    ALTER TABLE dbo.GiftVoucherRedemptions ADD CONSTRAINT CK_GiftVoucherRedemptions_Channel
        CHECK (Channel IN (N'online', N'store') AND (Channel = N'store' OR OrderId IS NOT NULL));
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GiftVoucherRedemptions_Voucher'
               AND object_id = OBJECT_ID('dbo.GiftVoucherRedemptions'))
    CREATE INDEX IX_GiftVoucherRedemptions_Voucher ON dbo.GiftVoucherRedemptions (GiftVoucherId) INCLUDE (Status, Amount, CreatedAt);
GO

-- Vouchers already issued: copy the buyer's name from their order.
UPDATE v
SET PurchaserName = o.Billing_FullName
FROM dbo.GiftVouchers v
INNER JOIN dbo.Orders o ON o.Order_Id = v.PurchasedOrderId
WHERE v.PurchaserName IS NULL;
GO
