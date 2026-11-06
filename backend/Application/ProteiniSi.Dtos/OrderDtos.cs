namespace ProteiniSi.Dtos;

public class GuestCartItemDto
{
    public int Product_Id { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public int? Variant_Id { get; set; }
    public string? Variant_Name { get; set; }
    public string? Variant_Packaging { get; set; }
    public decimal? Variant_Weight_Grams { get; set; }
}

public class CreateOrderDto
{
    public string Billing_Type { get; set; } = string.Empty;
    public string Billing_FullName { get; set; } = string.Empty;
    public string Billing_Address { get; set; } = string.Empty;
    public string Billing_PostCode { get; set; } = string.Empty;
    public string Billing_City { get; set; } = string.Empty;
    public string Billing_Country { get; set; } = string.Empty;
    public string Billing_Phone { get; set; } = string.Empty;
    public string Billing_Email { get; set; } = string.Empty;
    public string? Billing_TaxNumber { get; set; }
    public string? Billing_CompanyName { get; set; }

    public bool Delivery_IsDifferent { get; set; }
    public string? Delivery_FullName { get; set; }
    public string? Delivery_Address { get; set; }
    public string? Delivery_PostCode { get; set; }
    public string? Delivery_City { get; set; }
    public string? Delivery_Country { get; set; }
    public string? Delivery_Phone { get; set; }

    public string? Order_Note { get; set; }
    public string? Gift_Voucher_Code { get; set; }
    public string? Promo_Code { get; set; }
    public int? Selected_Free_Gift_Id { get; set; }
    public string Payment_Method { get; set; } = string.Empty;

    public bool CreateAccount { get; set; }
    public string? Password { get; set; }
    public decimal? PointsToRedeem { get; set; }

    public List<GuestCartItemDto>? CartItems { get; set; }
}

public class OrderItemDto
{
    public int Product_Id { get; set; }
    public string Product_Name { get; set; } = string.Empty;
    public decimal Product_Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public int? Variant_Id { get; set; }
    public string? Variant_Name { get; set; }
    public string? Variant_Packaging { get; set; }
    public int LoyaltyPointsEarned { get; set; }
    public decimal LoyaltyPercentage { get; set; }
}

public class UpdatePaymentStatusDto
{
    public int Order_Id { get; set; }
    public string Payment_Status { get; set; } = string.Empty;
    public string? Transaction_Id { get; set; }
}

public class AdminUpdateOrderStatusDto
{
    public int Order_Id { get; set; }
    public string Order_Status { get; set; } = string.Empty;
    public string? Payment_Status { get; set; }
    public string? Transaction_Id { get; set; }
    public bool Send_Email { get; set; }
    public string? Tracking_Number { get; set; }
    public string? Tracking_Url { get; set; }
}

public class OrderCreateRequest
{
    public int? UserId { get; set; }
    public string OrderNumberPrefix { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public CreateOrderDto Order { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime Now { get; set; }
    public int? PromoCodeId { get; set; }
    public string? PromoCode { get; set; }
    public decimal PromoDiscount { get; set; }
    public int? GiftVoucherId { get; set; }
    public string? GiftVoucherCode { get; set; }
    public decimal GiftVoucherAmount { get; set; }
    public decimal AmountBeforeVoucher { get; set; }
    public int? FreeGiftId { get; set; }
    public int? FreeGiftProductId { get; set; }
    public int? FreeGiftVariantId { get; set; }
    public string? FreeGiftDisplayName { get; set; }
    public decimal PointsRedeemed { get; set; }
    public decimal PointsDiscount { get; set; }
    public decimal PointsEarned { get; set; }
    public int? CartId { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}

public class OrderAdminFilter
{
    public string? OrderStatus { get; set; }
    public string? PaymentStatus { get; set; }
    public string? Search { get; set; }
    public string SortBy { get; set; } = "date";
    public bool SortDescending { get; set; } = true;
    public int Offset { get; set; }
    public int PageSize { get; set; }
}

public record PaymentCompletionResult(bool Success, bool EmailSent, string Message);

public record OrderCancellationStatus(bool CanCancel, string? OrderStatus, double HoursRemaining);

public record OrderAdminStatusResult(
    bool Status,
    string Message,
    string? OrderStatus = null,
    string? PaymentStatus = null,
    string? TrackingNumber = null,
    string? TrackingUrl = null,
    bool EmailSent = false,
    bool? ConfirmationEmailSent = null);

public record FileDownload(byte[] Content, string FileName);

public class OrderCheckoutResult
{
    public bool Status { get; set; }
    public string Message { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public bool OrderConfirmationEmailSent { get; set; }
    public decimal PointsRedeemed { get; set; }
    public decimal PointsDiscount { get; set; }
    public decimal PromoDiscount { get; set; }
    public decimal GiftVoucherAmount { get; set; }
    public string? FreeGift { get; set; }
    public decimal PointsToEarn { get; set; }
    public string? PaymentUrl { get; set; }
    public string? PaymentFormHtml { get; set; }
    public string? GuestAccessToken { get; set; }
}

public class MockPaymentDto
{
    public int Order_Id { get; set; }
    public string? Payment_Status { get; set; }
    public string? Token { get; set; }
}
