SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ShippingSettings_Update
    @FlatDeliveryFee DECIMAL(38, 10),
    @CashOnDeliveryFee DECIMAL(38, 10),
    @FreeDeliveryThreshold DECIMAL(38, 10),
    @HomeDeliveryEnabled BIT,
    @CardPaymentEnabled BIT,
    @UpdatedBy NVARCHAR(4000) = NULL,
    -- NULL keeps the stored value, so an older API build can still save the other settings.
    @CourierCodThreshold DECIMAL(38, 10) = NULL,
    @CourierCodFixedFee DECIMAL(38, 10) = NULL,
    @CourierCodPercent DECIMAL(38, 10) = NULL,
    @LoyaltyMinBalance DECIMAL(38, 10) = NULL,
    -- JSON array [{"minOrder":1500,"maxPoints":100}, ...]; validated by the API.
    @LoyaltyRedeemTiers NVARCHAR(1000) = NULL,
    -- Courier tracking page with a {number} placeholder; NULL keeps the stored value, '' clears it.
    @TrackingUrlTemplate NVARCHAR(500) = NULL
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
        CourierCodThreshold = COALESCE(@CourierCodThreshold, CourierCodThreshold),
        CourierCodFixedFee = COALESCE(@CourierCodFixedFee, CourierCodFixedFee),
        CourierCodPercent = COALESCE(@CourierCodPercent, CourierCodPercent),
        LoyaltyMinBalance = COALESCE(@LoyaltyMinBalance, LoyaltyMinBalance),
        LoyaltyRedeemTiers = COALESCE(@LoyaltyRedeemTiers, LoyaltyRedeemTiers),
        TrackingUrlTemplate = CASE WHEN @TrackingUrlTemplate IS NULL THEN TrackingUrlTemplate
                                   ELSE NULLIF(LTRIM(RTRIM(@TrackingUrlTemplate)), N'') END,
        UpdatedAt = SYSUTCDATETIME(),
        UpdatedBy = @UpdatedBy
    WHERE ShippingSettingsId = 1;
END
GO
