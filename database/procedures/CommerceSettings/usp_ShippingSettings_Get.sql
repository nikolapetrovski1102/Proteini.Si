SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ShippingSettings_Get
AS
BEGIN
    SET NOCOUNT ON;

    SELECT FlatDeliveryFee, CashOnDeliveryFee, FreeDeliveryThreshold, HomeDeliveryEnabled, CardPaymentEnabled
    FROM dbo.ShippingSettings
    WHERE ShippingSettingsId = 1;
END
GO
