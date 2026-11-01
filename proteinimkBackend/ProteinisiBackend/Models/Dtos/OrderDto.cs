using System;
using System.Collections.Generic;

namespace ProteinisiBackend.Models.DTOs
{
    // For guest cart items
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

    // For creating an order
    public class CreateOrderDto
    {
        // Billing Information
        public string Billing_Type { get; set; } = string.Empty; // "natural" or "company"
        public string Billing_FullName { get; set; } = string.Empty;
        public string Billing_Address { get; set; } = string.Empty;
        public string Billing_PostCode { get; set; } = string.Empty;
        public string Billing_City { get; set; } = string.Empty;
        public string Billing_Country { get; set; } = string.Empty;
        public string Billing_Phone { get; set; } = string.Empty;
        public string Billing_Email { get; set; } = string.Empty;
        public string? Billing_TaxNumber { get; set; }
        public string? Billing_CompanyName { get; set; }

        // Delivery Information
        public bool Delivery_IsDifferent { get; set; }
        public string? Delivery_FullName { get; set; }
        public string? Delivery_Address { get; set; }
        public string? Delivery_PostCode { get; set; }
        public string? Delivery_City { get; set; }
        public string? Delivery_Country { get; set; }
        public string? Delivery_Phone { get; set; }

        // Order Details
        public string? Order_Note { get; set; }
        public string? Gift_Voucher_Code { get; set; }
        public string? Promo_Code { get; set; }
        public int? Selected_Free_Gift_Id { get; set; }
        public string Payment_Method { get; set; } = string.Empty; // "credit_card" or "home_delivery"

        // Account Creation (if user checks the box)
        public bool CreateAccount { get; set; }
        public string? Password { get; set; }
        public decimal? PointsToRedeem { get; set; }

        // Guest checkout - cart items (required if user is not logged in)
        public List<GuestCartItemDto>? CartItems { get; set; }
    }

    // For order response
    public class OrderResponseDto
    {
        public int Order_Id { get; set; }
        public string Order_Number { get; set; } = string.Empty;
        public DateTime Order_Date { get; set; }
        public string Order_Status { get; set; } = string.Empty;
        public string Payment_Method { get; set; } = string.Empty;
        public string Payment_Status { get; set; } = string.Empty;
        public decimal Total_Amount { get; set; }
        public string? Transaction_Id { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    // For order items
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

    // For delivery address management
    public class DeliveryAddressDto
    {
        public string Delivery_FullName { get; set; } = string.Empty;
        public string Delivery_Address { get; set; } = string.Empty;
        public string Delivery_PostCode { get; set; } = string.Empty;
        public string Delivery_City { get; set; } = string.Empty;
        public string Delivery_Country { get; set; } = string.Empty;
        public string Delivery_Phone { get; set; } = string.Empty;
    }

    // For updating payment status (bank callback)
    public class UpdatePaymentStatusDto
    {
        public int Order_Id { get; set; }
        public string Payment_Status { get; set; } = string.Empty; // "completed", "failed"
        public string? Transaction_Id { get; set; }
    }

    public class AdminUpdateOrderStatusDto
    {
        public int Order_Id { get; set; }
        public string Order_Status { get; set; } = string.Empty;
        public string? Payment_Status { get; set; }
        public string? Transaction_Id { get; set; }
        public bool Send_Email { get; set; } = false;
        public string? Tracking_Number { get; set; }
        public string? Tracking_Url { get; set; }
    }
}
