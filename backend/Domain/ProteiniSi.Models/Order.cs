namespace ProteiniSi.Models;

public class CheckoutUser
{
    public string User_Email { get; set; } = string.Empty;
    public string? User_FullName { get; set; }
}

public class CheckoutCartItem
{
    public int Product_Id { get; set; }
    public int Quantity { get; set; }
    public decimal? CartPrice { get; set; }
    public decimal Product_Price { get; set; }
    public int? Product_Stock { get; set; }
    public int? Variant_Id { get; set; }
    public int? CatalogVariantId { get; set; }
    public string? Variant_Name { get; set; }
    public string? Variant_Packaging { get; set; }
    public string Product_Name { get; set; } = string.Empty;
    public bool HasVariants { get; set; }
    public bool IsGiftVoucher { get; set; }
    public decimal? LoyaltyPercentage { get; set; }
    public decimal? ProductLoyaltyPercentage { get; set; }
    public decimal? VariantLoyaltyPercentage { get; set; }
}

public class GuestCheckoutProduct
{
    public string Name { get; set; } = string.Empty;
    public int? ProductQuantity { get; set; }
    public bool HasVariants { get; set; }
    public bool IsGiftVoucher { get; set; }
    public decimal? VoucherMinAmount { get; set; }
    public decimal? VoucherMaxAmount { get; set; }
    public decimal? ProductLoyaltyPercentage { get; set; }
    public int? CatalogVariantId { get; set; }
    public int? VariantQuantity { get; set; }
    public decimal? VariantLoyaltyPercentage { get; set; }
    public string? CatalogVariantName { get; set; }
    public string? CatalogVariantPackaging { get; set; }
    public decimal? EffectivePrice { get; set; }
}

public class CheckoutPromotion
{
    public int PromoCodeId { get; set; }
    public string? Code { get; set; }
    public string? DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public decimal? MaximumDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerCustomerLimit { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; }
    public int TimesUsed { get; set; }
    public int CustomerTimesUsed { get; set; }
}

public class CheckoutFreeGift
{
    public int FreeGiftId { get; set; }
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string? DisplayName { get; set; }
    public bool HasVariants { get; set; }
    public int? AvailableQuantity { get; set; }
}

public class OrderCreated
{
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
}

public class OrderCancelOutcome
{
    public int Result { get; set; }
    public string? Order_Status { get; set; }
    public string? Order_Number { get; set; }
    public decimal? Points_Redeemed { get; set; }
    public string? User_Email { get; set; }
    public string? User_FullName { get; set; }
}

public class OrderCancelInfo
{
    public DateTime Order_Date { get; set; }
    public string? Order_Status { get; set; }
}

public class OrderStatusSnapshot
{
    public int Order_Id { get; set; }
    public string? Order_Number { get; set; }
    public string? Order_Status { get; set; }
    public string? Payment_Status { get; set; }
    public string? Billing_Email { get; set; }
    public string? Billing_FullName { get; set; }
    public string? Payment_Method { get; set; }
    public decimal? Total_Amount { get; set; }
    public string? Transaction_Id { get; set; }
    public string? Tracking_Number { get; set; }
    public string? Tracking_Url { get; set; }
}

public class OrderDocumentFile
{
    public string? HtmlContent { get; set; }
    public string? Order_Number { get; set; }
}

public class LastOrder
{
    public int Order_Id { get; set; }
    public decimal Total_Amount { get; set; }
    public string Order_Number { get; set; } = string.Empty;
    public int? User_Id { get; set; }
}

public class IssuedVoucher
{
    public string Code { get; set; } = string.Empty;
    public decimal InitialValue { get; set; }
    public decimal RemainingValue { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class EmailSendResult
{
    public bool Success { get; set; }
    public string? Host { get; set; }
    public int Port { get; set; }
    public bool EnableSsl { get; set; }
    public string? SenderEmail { get; set; }
    public string? SenderUsername { get; set; }
    public int RecipientCount { get; set; }
    public List<string> Recipients { get; set; } = [];
    public int CcRecipientCount { get; set; }
    public List<string> CcRecipients { get; set; } = [];
    public string? Subject { get; set; }
    public DateTime StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public long DurationMs { get; set; }
    public string? Message { get; set; }
    public string? ExceptionType { get; set; }
    public string? InnerExceptionType { get; set; }
    public string? InnerExceptionMessage { get; set; }
}
