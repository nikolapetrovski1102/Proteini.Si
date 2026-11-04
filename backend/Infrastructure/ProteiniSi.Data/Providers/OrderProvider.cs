using System.Text.Json;
using Microsoft.Data.SqlClient;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class OrderProvider(ISqlHelper sql) : IOrderProvider
{
    public Task<CheckoutUser?> GetCheckoutUserAsync(int userId) =>
        sql.QuerySingleOrDefaultAsync<CheckoutUser>(StoredProcedures.Orders.GetCheckoutUser, new { UserId = userId });

    public Task<int?> GetCartIdAsync(int userId) =>
        sql.QuerySingleOrDefaultAsync<int?>(StoredProcedures.Orders.GetCartId, new { UserId = userId });

    public Task<List<CheckoutCartItem>> GetCartItemsAsync(int cartId) =>
        sql.QueryAsync<CheckoutCartItem>(StoredProcedures.Orders.GetCartItems, new { CartId = cartId });

    public Task<GuestCheckoutProduct?> GetGuestProductAsync(int productId, int? variantId) =>
        sql.QuerySingleOrDefaultAsync<GuestCheckoutProduct>(StoredProcedures.Orders.GetGuestProduct, new { ProductId = productId, VariantId = variantId });

    public Task<CheckoutPromotion?> GetPromotionAsync(string code, int userId, string customerEmail) =>
        sql.QuerySingleOrDefaultAsync<CheckoutPromotion>(StoredProcedures.Orders.GetPromotion, new { Code = code, UserId = userId, CustomerEmail = customerEmail });

    public Task<CheckoutFreeGift?> GetFreeGiftAsync(int freeGiftId, decimal subtotal) =>
        sql.QuerySingleOrDefaultAsync<CheckoutFreeGift>(StoredProcedures.Orders.GetFreeGift, new { FreeGiftId = freeGiftId, Subtotal = subtotal });

    public async Task<OrderCreated> CreateAsync(OrderCreateRequest request)
    {
        var order = request.Order;
        var items = JsonSerializer.Serialize(request.Items.Select(item => new
        {
            ProductId = item.Product_Id,
            VariantId = item.Variant_Id,
            VariantName = item.Variant_Name,
            VariantPackaging = item.Variant_Packaging,
            ProductName = item.Product_Name,
            ProductPrice = item.Product_Price,
            item.Quantity,
            item.Subtotal,
            item.LoyaltyPercentage,
            item.LoyaltyPointsEarned
        }));

        try
        {
            var created = await sql.QuerySingleOrDefaultAsync<OrderCreated>(StoredProcedures.Orders.Create, new
            {
                request.UserId,
                request.OrderNumberPrefix,
                request.OrderStatus,
                request.PaymentMethod,
                BillingType = order.Billing_Type,
                BillingFullName = order.Billing_FullName,
                BillingAddress = order.Billing_Address,
                BillingPostCode = order.Billing_PostCode,
                BillingCity = order.Billing_City,
                BillingCountry = order.Billing_Country,
                BillingPhone = order.Billing_Phone,
                BillingEmail = order.Billing_Email,
                BillingTaxNumber = order.Billing_TaxNumber,
                BillingCompanyName = order.Billing_CompanyName,
                DeliveryIsDifferent = order.Delivery_IsDifferent,
                DeliveryFullName = order.Delivery_FullName,
                DeliveryAddress = order.Delivery_Address,
                DeliveryPostCode = order.Delivery_PostCode,
                DeliveryCity = order.Delivery_City,
                DeliveryCountry = order.Delivery_Country,
                DeliveryPhone = order.Delivery_Phone,
                request.Subtotal,
                request.DeliveryFee,
                request.TotalAmount,
                OrderNote = order.Order_Note,
                request.Now,
                request.PromoCodeId,
                request.PromoCode,
                request.PromoDiscount,
                request.GiftVoucherId,
                request.GiftVoucherCode,
                request.GiftVoucherAmount,
                request.AmountBeforeVoucher,
                request.FreeGiftId,
                request.FreeGiftProductId,
                request.FreeGiftVariantId,
                request.FreeGiftDisplayName,
                request.PointsRedeemed,
                request.PointsDiscount,
                request.PointsEarned,
                PointsText = request.PointsRedeemed.ToString(),
                request.CartId,
                Items = items
            });

            return created ?? throw new InvalidOperationException("Order creation returned no result.");
        }
        catch (SqlException ex) when (ex.Number >= 50000)
        {
            throw new BadRequestException(ex.Message, new { message = ex.Message });
        }
    }

    public async Task<int> CompletePaymentAsync(int orderId, string? transactionId, string orderStatus) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Orders.CompletePayment, new
        {
            OrderId = orderId,
            TransactionId = string.IsNullOrWhiteSpace(transactionId) ? null : transactionId,
            OrderStatus = orderStatus
        });

    public Task MarkPaymentFailedAsync(int orderId, string? transactionId) =>
        sql.ExecuteAsync(StoredProcedures.Orders.MarkPaymentFailed, new
        {
            OrderId = orderId,
            TransactionId = string.IsNullOrWhiteSpace(transactionId) ? null : transactionId
        });

    public Task<OrderCancelOutcome?> CancelAsync(int orderId, int userId, DateTime now) =>
        sql.QuerySingleOrDefaultAsync<OrderCancelOutcome>(StoredProcedures.Orders.Cancel, new { OrderId = orderId, UserId = userId, Now = now });

    public Task<OrderCancelInfo?> GetCancelInfoAsync(int orderId, int userId) =>
        sql.QuerySingleOrDefaultAsync<OrderCancelInfo>(StoredProcedures.Orders.GetCancelInfo, new { OrderId = orderId, UserId = userId });

    public Task<List<dynamic>> GetHistoryAsync(int userId) =>
        sql.QueryAsync<dynamic>(StoredProcedures.Orders.GetHistory, new { UserId = userId });

    public Task<(dynamic? Order, List<dynamic> Items)> GetConfirmationAsync(int orderId, int userId) =>
        ReadOrderWithItemsAsync(StoredProcedures.Orders.GetConfirmation, new { OrderId = orderId, UserId = userId });

    public Task<(int TotalCount, List<dynamic> Orders)> GetAdminPageAsync(OrderAdminFilter filter) =>
        sql.QueryMultipleAsync(StoredProcedures.Orders.AdminList, new
        {
            filter.OrderStatus,
            filter.PaymentStatus,
            filter.Search,
            filter.SortBy,
            filter.SortDescending,
            filter.Offset,
            filter.PageSize
        }, async grid =>
        {
            var totalCount = await grid.ReadSingleAsync<int>();
            var orders = (await grid.ReadAsync<dynamic>()).ToList();
            return (totalCount, orders);
        });

    public Task<List<dynamic>> GetAdminExportAsync(string? orderStatus, string? paymentStatus, string? search, DateTime? fromDate, DateTime? toExclusive) =>
        sql.QueryAsync<dynamic>(StoredProcedures.Orders.AdminExport, new
        {
            OrderStatus = orderStatus,
            PaymentStatus = paymentStatus,
            Search = search,
            FromDate = fromDate,
            ToExclusive = toExclusive
        });

    public Task<OrderStatusSnapshot?> GetForAdminStatusAsync(int orderId) =>
        sql.QuerySingleOrDefaultAsync<OrderStatusSnapshot>(StoredProcedures.Orders.GetForAdminStatus, new { OrderId = orderId });

    public Task UpdateAdminStatusAsync(int orderId, string orderStatus, string paymentStatus, string? transactionId, string? trackingNumber, string? trackingUrl, bool releaseVoucher) =>
        sql.ExecuteAsync(StoredProcedures.Orders.UpdateAdminStatus, new
        {
            OrderId = orderId,
            OrderStatus = orderStatus,
            PaymentStatus = paymentStatus,
            TransactionId = string.IsNullOrWhiteSpace(transactionId) ? null : transactionId,
            TrackingNumber = trackingNumber,
            TrackingUrl = trackingUrl,
            ReleaseVoucher = releaseVoucher
        });

    public Task<(dynamic? Order, List<dynamic> Items, List<dynamic> FreeGifts, List<dynamic> IssuedVouchers, List<dynamic> VoucherRedemptions)> GetAdminDetailsAsync(int orderId) =>
        sql.QueryMultipleAsync(StoredProcedures.Orders.GetAdminDetails, new { OrderId = orderId }, async grid =>
        {
            var order = (await grid.ReadAsync<dynamic>()).FirstOrDefault();
            var items = (await grid.ReadAsync<dynamic>()).ToList();
            var freeGifts = (await grid.ReadAsync<dynamic>()).ToList();
            var issuedVouchers = (await grid.ReadAsync<dynamic>()).ToList();
            var voucherRedemptions = (await grid.ReadAsync<dynamic>()).ToList();
            return ((dynamic?)order, items, freeGifts, issuedVouchers, voucherRedemptions);
        });

    public async Task<bool> DocumentExistsAsync(int orderId) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Orders.DocumentExists, new { OrderId = orderId }) > 0;

    public Task<(dynamic? Order, List<dynamic> Items)> GetDocumentSourceAsync(int orderId) =>
        ReadOrderWithItemsAsync(StoredProcedures.Orders.GetDocumentSource, new { OrderId = orderId });

    public Task RegisterDocumentAsync(int orderId, string hash, string html) =>
        sql.ExecuteAsync(StoredProcedures.Orders.RegisterDocument, new { OrderId = orderId, Hash = hash, Html = html });

    public Task<OrderDocumentFile?> GetLatestDocumentAsync(int orderId) =>
        sql.QuerySingleOrDefaultAsync<OrderDocumentFile>(StoredProcedures.Orders.GetLatestDocument, new { OrderId = orderId });

    public Task<List<dynamic>> GetEmailDataAsync(int orderId) =>
        sql.QueryAsync<dynamic>(StoredProcedures.Orders.GetEmailData, new { OrderId = orderId });

    public Task<List<IssuedVoucher>> GetIssuedVouchersAsync(int orderId) =>
        sql.QueryAsync<IssuedVoucher>(StoredProcedures.Orders.GetIssuedVouchers, new { OrderId = orderId });

    public Task<string?> GetBillingPhoneAsync(int orderId) =>
        sql.QuerySingleOrDefaultAsync<string>(StoredProcedures.Orders.GetBillingPhone, new { OrderId = orderId });

    public Task<LastOrder?> GetLastAsync() =>
        sql.QuerySingleOrDefaultAsync<LastOrder>(StoredProcedures.Orders.GetLast);

    public async Task<bool> ExistsAsync(int orderId) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Orders.Exists, new { OrderId = orderId }) > 0;

    public Task<(dynamic? Order, List<dynamic> Items)> GetEmailDebugDataAsync(int orderId) =>
        ReadOrderWithItemsAsync(StoredProcedures.Orders.GetEmailDebugData, new { OrderId = orderId });

    private Task<(dynamic? Order, List<dynamic> Items)> ReadOrderWithItemsAsync(string procedure, object parameters) =>
        sql.QueryMultipleAsync(procedure, parameters, async grid =>
        {
            var order = (await grid.ReadAsync<dynamic>()).FirstOrDefault();
            var items = (await grid.ReadAsync<dynamic>()).ToList();
            return ((dynamic?)order, items);
        });
}
