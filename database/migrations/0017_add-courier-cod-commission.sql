-- Courier commission for collecting cash on delivery (откупнина). The courier charges it to the buyer
-- directly, on top of our order total: a fixed amount up to the threshold, a percentage above it.
-- Only shown to customers as a note at checkout, on the order page and in the confirmation email.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.ShippingSettings', 'CourierCodThreshold') IS NULL
    ALTER TABLE dbo.ShippingSettings ADD
        CourierCodThreshold DECIMAL(18, 2) NOT NULL CONSTRAINT DF_ShippingSettings_CourierCodThreshold DEFAULT (3000),
        CourierCodFixedFee DECIMAL(18, 2) NOT NULL CONSTRAINT DF_ShippingSettings_CourierCodFixedFee DEFAULT (30),
        CourierCodPercent DECIMAL(5, 2) NOT NULL CONSTRAINT DF_ShippingSettings_CourierCodPercent DEFAULT (1.6);
GO

IF OBJECT_ID('dbo.CK_ShippingSettings_CourierCod', 'C') IS NULL
    ALTER TABLE dbo.ShippingSettings ADD CONSTRAINT CK_ShippingSettings_CourierCod CHECK
        (CourierCodThreshold >= 0 AND CourierCodFixedFee >= 0 AND CourierCodPercent BETWEEN 0 AND 100);
GO
