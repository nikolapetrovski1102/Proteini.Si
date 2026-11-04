namespace ProteiniSi.Dtos;

public class UpdateShippingSettingsDto
{
    public decimal FlatDeliveryFee { get; set; } = 165m;
    public decimal CashOnDeliveryFee { get; set; } = 30m;
    public decimal FreeDeliveryThreshold { get; set; } = 3000m;
    public bool HomeDeliveryEnabled { get; set; } = true;
    public bool CardPaymentEnabled { get; set; } = true;
}
