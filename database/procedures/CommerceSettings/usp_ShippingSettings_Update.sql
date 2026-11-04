SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ShippingSettings_Update
    @FlatDeliveryFee DECIMAL(38, 10),
    @CashOnDeliveryFee DECIMAL(38, 10),
    @FreeDeliveryThreshold DECIMAL(38, 10),
    @HomeDeliveryEnabled BIT,
    @CardPaymentEnabled BIT,
    @UpdatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.ShippingSettings
    SET FlatDeliveryFee = @FlatDeliveryFee,
        CashOnDeliveryFee = @CashOnDeliveryFee,
        FreeDeliveryThreshold = @FreeDeliveryThreshold,
        HomeDeliveryEnabled = @HomeDeliveryEnabled,
        CardPaymentEnabled = @CardPaymentEnabled,
        UpdatedAt = SYSUTCDATETIME(),
        UpdatedBy = @UpdatedBy
    WHERE ShippingSettingsId = 1;
END
GO
