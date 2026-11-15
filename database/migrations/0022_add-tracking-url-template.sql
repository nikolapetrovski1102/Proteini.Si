-- 2026-11-11 order flow: the admin order flow is now Confirmed → Shipped (tracking number + link) → Claimed.
-- ShippingSettings.TrackingUrlTemplate is the courier's tracking page with a {number} placeholder, e.g.
-- https://courier.example/track?n={number}. When set, the tracking link of a shipped order is filled in from the
-- tracking number. Additive and idempotent; older API builds keep working.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.ShippingSettings', 'TrackingUrlTemplate') IS NULL
    ALTER TABLE dbo.ShippingSettings ADD TrackingUrlTemplate NVARCHAR(500) NULL;
GO
