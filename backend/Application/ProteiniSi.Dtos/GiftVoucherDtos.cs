namespace ProteiniSi.Dtos;

public class GiftVoucherValidationDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}

public class GiftVoucherStatusDto
{
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
}

public class GiftVoucherRedeemDto
{
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}

public record GiftVoucherValidationResult(string Code, decimal RemainingValue, decimal ApplicableAmount);
