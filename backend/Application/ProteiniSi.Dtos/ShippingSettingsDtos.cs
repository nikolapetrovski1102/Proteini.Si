namespace ProteiniSi.Dtos;

public class UpdateShippingSettingsDto
{
    public decimal FlatDeliveryFee { get; set; } = 165m;
    public decimal CashOnDeliveryFee { get; set; } = 30m;
    public decimal FreeDeliveryThreshold { get; set; } = 3000m;
    public bool HomeDeliveryEnabled { get; set; } = true;
    public bool CardPaymentEnabled { get; set; } = true;
    public decimal CourierCodThreshold { get; set; } = 3000m;
    public decimal CourierCodFixedFee { get; set; } = 30m;
    public decimal CourierCodPercent { get; set; } = 1.6m;

    // Null keeps the stored value (older admin builds do not send them).
    public decimal? LoyaltyMinBalance { get; set; }
    public List<LoyaltyRedeemTierDto>? LoyaltyRedeemTiers { get; set; }
    // Empty string clears it.
    public string? TrackingUrlTemplate { get; set; }
}

public class LoyaltyRedeemTierDto
{
    public decimal MinOrder { get; set; }
    public decimal MaxPoints { get; set; }
}
