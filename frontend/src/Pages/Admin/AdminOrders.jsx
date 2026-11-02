import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

const orderStatusOptions = [
  "",
  "pending",
  "confirmed",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "rejected",
  "cancelled",
  "refunded",
];

const paymentStatusOptions = [
  "",
  "pending",
  "completed",
  "failed",
  "refunded",
];

const actions = [
  { label: "Confirm", order_Status: "confirmed" },
  { label: "Processing", order_Status: "processing" },
  { label: "Reject", order_Status: "rejected" },
  { label: "Mark Paid", order_Status: "paid", payment_Status: "completed" },
  { label: "Complete", order_Status: "completed", payment_Status: "completed" },
  { label: "Refund", order_Status: "refunded", payment_Status: "refunded" },
  { label: "Shipped", order_Status: "shipped" },
  { label: "Delivered", order_Status: "delivered" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    orderStatus: "",
    paymentStatus: "",
    page: 1,
    pageSize: 50,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.getAdminOrders(filters);
      setOrders(response.orders || []);
      setPagination({
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 1,
      });
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
    }));
  };

  const exportOrders = async () => {
    setExporting(true);
    setError("");
    try {
      await api.downloadAdminOrders(filters);
    } catch (err) {
      setError(err.message || "Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const handleAction = async (order, action) => {
    const ok = window.confirm(
      `${action.label} order #${order.order_Number || order.Order_Number}?`,
    );
    if (!ok) return;

    let trackingNumber = null;
    let trackingUrl = null;
    if (action.order_Status === "shipped") {
      trackingNumber = window.prompt(
        "Courier tracking number (optional):",
        valueOf(order, "tracking_Number", "Tracking_Number") || "",
      );
      if (trackingNumber === null) return;
      trackingUrl = window.prompt(
        "Courier tracking URL (optional):",
        valueOf(order, "tracking_Url", "Tracking_Url") || "",
      );
      if (trackingUrl === null) return;
    }

    setSavingOrderId(order.order_Id || order.Order_Id);
    setError("");

    try {
      await api.updateAdminOrderStatus({
        order_Id: order.order_Id || order.Order_Id,
        order_Status: action.order_Status,
        payment_Status: action.payment_Status,
        transaction_Id: null,
        tracking_Number: trackingNumber?.trim() || null,
        tracking_Url: trackingUrl?.trim() || null,
        send_Email: false,
      });
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Failed to update order");
    } finally {
      setSavingOrderId(null);
    }
  };

  const openOrderDetails = async (order) => {
    const orderId = valueOf(order, "order_Id", "Order_Id");
    if (!orderId) return;

    setDetailsLoading(true);
    setError("");

    try {
      const response = await api.getAdminOrderDetails(orderId);
      setSelectedOrderDetails(response);
    } catch (err) {
      setError(err.message || "Failed to load order details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("mk-MK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const valueOf = (order, camelKey, pascalKey) => order[camelKey] ?? order[pascalKey];
  const detailValue = (source, ...keys) => {
    for (const key of keys) {
      if (source?.[key] !== undefined && source?.[key] !== null) {
        return source[key];
      }
    }
    return "";
  };
  const formatMoney = (value) => `MKD ${Number(value || 0).toFixed(2)}`;
  const selectedOrder = selectedOrderDetails?.order;
  const selectedItems = selectedOrderDetails?.items || [];
  const selectedFreeGifts = selectedOrderDetails?.freeGifts || [];
  const selectedIssuedVouchers = selectedOrderDetails?.issuedVouchers || [];
  const selectedVoucherRedemptions = selectedOrderDetails?.voucherRedemptions || [];

  const allowedActionsFor = (status) => {
    const transitions = {
      pending: ["confirmed", "paid", "rejected", "cancelled"],
      pending_confirmation: ["confirmed", "paid", "rejected", "cancelled"],
      confirmed: ["processing", "paid", "cancelled", "rejected"],
      processing: ["paid", "completed", "shipped", "cancelled"],
      paid: ["processing", "completed", "shipped", "refunded"],
      completed: ["shipped", "delivered", "refunded"],
      shipped: ["delivered", "refunded"],
      delivered: ["refunded"],
    };
    return transitions[String(status || "").toLowerCase()] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Orders</h1>
            <p className="text-sm text-gray-500">
              {pagination.totalCount} orders found
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportOrders}
              disabled={exporting}
              className="bg-[#FDC700] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e5b600] disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={fetchOrders}
              className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 bg-white p-4 shadow-sm md:grid-cols-5">
          <input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search order, email, name, phone"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          />
          <select
            value={filters.orderStatus}
            onChange={(e) => updateFilter("orderStatus", e.target.value)}
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          >
            {orderStatusOptions.map((status) => (
              <option key={status || "all"} value={status}>
                {status || "All order statuses"}
              </option>
            ))}
          </select>
          <select value={filters.sortBy} onChange={(e) => updateFilter("sortBy", e.target.value)} className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]">
            <option value="date">Sort by date</option><option value="number">Sort by number</option><option value="customer">Sort by customer</option><option value="status">Sort by status</option><option value="total">Sort by total</option>
          </select>
          <select value={filters.sortOrder} onChange={(e) => updateFilter("sortOrder", e.target.value)} className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]">
            <option value="desc">Descending</option><option value="asc">Ascending</option>
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => updateFilter("paymentStatus", e.target.value)}
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          >
            {paymentStatusOptions.map((status) => (
              <option key={status || "all"} value={status}>
                {status || "All payment statuses"}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan="7">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan="7">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const orderId = valueOf(order, "order_Id", "Order_Id");
                  const orderNumber = valueOf(
                    order,
                    "order_Number",
                    "Order_Number",
                  );
                  const total = valueOf(order, "total_Amount", "Total_Amount");

                  return (
                    <tr key={orderId} className="border-b align-top">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        #{orderNumber}
                        <div className="text-xs font-normal text-gray-500">
                          {valueOf(order, "item_Count", "Item_Count")} items
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {valueOf(order, "billing_FullName", "Billing_FullName")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {valueOf(order, "billing_Email", "Billing_Email")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {valueOf(order, "billing_Phone", "Billing_Phone")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(valueOf(order, "order_Date", "Order_Date"))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-gray-100 px-2 py-1 text-xs uppercase">
                          {valueOf(order, "order_Status", "Order_Status")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-blue-50 px-2 py-1 text-xs uppercase text-blue-700">
                          {valueOf(order, "payment_Status", "Payment_Status")}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          {valueOf(order, "payment_Method", "Payment_Method")}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        MKD {Number(total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[260px] flex-wrap gap-2">
                          <button
                            disabled={detailsLoading}
                            onClick={() => openOrderDetails(order)}
                            className="border border-[#2096D8] bg-[#2096D8] px-2 py-1 text-xs font-medium text-white hover:bg-[#1678ad] disabled:opacity-50"
                          >
                            View
                          </button>
                          {actions.filter((action) => allowedActionsFor(valueOf(order, "order_Status", "Order_Status")).includes(action.order_Status)).map((action) => (
                            <button
                              key={action.label}
                              disabled={savingOrderId === orderId}
                              onClick={() => handleAction(order, action)}
                              className="border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            disabled={filters.page <= 1}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
            className="border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {filters.page} of {pagination.totalPages}
          </span>
          <button
            disabled={filters.page >= pagination.totalPages}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
            className="border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-8 w-full max-w-5xl bg-white shadow-xl">
              <div className="flex items-start justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{detailValue(selectedOrder, "order_Number", "Order_Number")}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(detailValue(selectedOrder, "order_Date", "Order_Date"))}
                  </p>
                </div>
                <button
                  onClick={() => api.downloadAdminOrderDocument(
                    detailValue(selectedOrder, "order_Id", "Order_Id"),
                    detailValue(selectedOrder, "order_Number", "Order_Number"),
                  ).catch((downloadError) => setError(downloadError.message))}
                  className="mr-2 border border-[#2096D8] px-3 py-1 text-sm font-semibold text-[#1678ad] hover:bg-blue-50"
                >
                  Download order document
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-3">
                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Customer
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">
                      {detailValue(selectedOrder, "billing_FullName", "Billing_FullName")}
                    </p>
                    <p>{detailValue(selectedOrder, "billing_Email", "Billing_Email")}</p>
                    <p>{detailValue(selectedOrder, "billing_Phone", "Billing_Phone")}</p>
                    <p>
                      Type:{" "}
                      {detailValue(selectedOrder, "billing_Type", "Billing_Type") || "-"}
                    </p>
                    {detailValue(selectedOrder, "billing_CompanyName", "Billing_CompanyName") && (
                      <p>
                        Company:{" "}
                        {detailValue(
                          selectedOrder,
                          "billing_CompanyName",
                          "Billing_CompanyName",
                        )}
                      </p>
                    )}
                    {detailValue(selectedOrder, "billing_TaxNumber", "Billing_TaxNumber") && (
                      <p>
                        Tax number:{" "}
                        {detailValue(selectedOrder, "billing_TaxNumber", "Billing_TaxNumber")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Billing Address
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>{detailValue(selectedOrder, "billing_Address", "Billing_Address")}</p>
                    <p>
                      {detailValue(selectedOrder, "billing_PostCode", "Billing_PostCode")}{" "}
                      {detailValue(selectedOrder, "billing_City", "Billing_City")}
                    </p>
                    <p>{detailValue(selectedOrder, "billing_Country", "Billing_Country")}</p>
                  </div>
                </div>

                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Delivery Address
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    {detailValue(selectedOrder, "delivery_IsDifferent", "Delivery_IsDifferent") ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {detailValue(
                            selectedOrder,
                            "delivery_FullName",
                            "Delivery_FullName",
                          )}
                        </p>
                        <p>
                          {detailValue(
                            selectedOrder,
                            "delivery_Address",
                            "Delivery_Address",
                          )}
                        </p>
                        <p>
                          {detailValue(
                            selectedOrder,
                            "delivery_PostCode",
                            "Delivery_PostCode",
                          )}{" "}
                          {detailValue(selectedOrder, "delivery_City", "Delivery_City")}
                        </p>
                        <p>
                          {detailValue(
                            selectedOrder,
                            "delivery_Country",
                            "Delivery_Country",
                          )}
                        </p>
                        <p>
                          {detailValue(selectedOrder, "delivery_Phone", "Delivery_Phone")}
                        </p>
                      </>
                    ) : (
                      <p>Same as billing address</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-6 md:grid-cols-3">
                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      Order:{" "}
                      <span className="font-medium uppercase">
                        {detailValue(selectedOrder, "order_Status", "Order_Status")}
                      </span>
                    </p>
                    <p>
                      Payment:{" "}
                      <span className="font-medium uppercase">
                        {detailValue(selectedOrder, "payment_Status", "Payment_Status")}
                      </span>
                    </p>
                    <p>
                      Method:{" "}
                      {detailValue(selectedOrder, "payment_Method", "Payment_Method")}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Totals
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatMoney(detailValue(selectedOrder, "subtotal", "Subtotal"))}
                      </span>
                    </div>
                    {Number(detailValue(selectedOrder, "gift_Voucher_Amount", "Gift_Voucher_Amount") || 0) > 0 && (
                      <div className="flex justify-between text-green-700"><span>Gift voucher {detailValue(selectedOrder, "gift_Voucher_Code", "Gift_Voucher_Code")}</span><span>- {formatMoney(detailValue(selectedOrder, "gift_Voucher_Amount", "Gift_Voucher_Amount"))}</span></div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>
                        {formatMoney(
                          detailValue(selectedOrder, "delivery_Fee", "Delivery_Fee"),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points discount</span>
                      <span>
                        {formatMoney(
                          detailValue(selectedOrder, "points_Discount", "Points_Discount"),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Promotion{" "}
                        {detailValue(selectedOrder, "promo_Code", "Promo_Code") || ""}
                      </span>
                      <span>
                        - {formatMoney(
                          detailValue(
                            selectedOrder,
                            "promo_Discount",
                            "Promo_Discount",
                          ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total</span>
                      <span>
                        {formatMoney(
                          detailValue(selectedOrder, "total_Amount", "Total_Amount"),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Note
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {detailValue(selectedOrder, "order_Note", "Order_Note") || "-"}
                  </p>
                </div>
              </div>

              {selectedFreeGifts.length > 0 && (
                <div className="px-6 pt-6">
                  <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                    Free gift
                  </h3>
                  {selectedFreeGifts.map((gift) => (
                    <div
                      key={detailValue(
                        gift,
                        "orderFreeGiftId",
                        "OrderFreeGiftId",
                      )}
                      className="border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900"
                    >
                      {detailValue(gift, "displayName", "DisplayName")}
                    </div>
                  ))}
                </div>
              )}

              {(selectedIssuedVouchers.length > 0 || selectedVoucherRedemptions.length > 0) && (
                <div className="grid gap-4 px-6 pt-6 md:grid-cols-2">
                  {selectedIssuedVouchers.length > 0 && <section><h3 className="mb-3 text-sm font-bold uppercase text-gray-700">Issued gift vouchers</h3>{selectedIssuedVouchers.map((voucher) => <div key={detailValue(voucher, "giftVoucherId", "GiftVoucherId")} className="mb-2 border border-green-200 bg-green-50 p-3 text-sm"><div className="font-mono font-bold">{detailValue(voucher, "code", "Code")}</div><div>Remaining {formatMoney(detailValue(voucher, "remainingValue", "RemainingValue"))} · {detailValue(voucher, "status", "Status")}</div></div>)}</section>}
                  {selectedVoucherRedemptions.length > 0 && <section><h3 className="mb-3 text-sm font-bold uppercase text-gray-700">Voucher redemption</h3>{selectedVoucherRedemptions.map((redemption) => <div key={detailValue(redemption, "giftVoucherRedemptionId", "GiftVoucherRedemptionId")} className="mb-2 border border-blue-200 bg-blue-50 p-3 text-sm"><div className="font-mono font-bold">{detailValue(redemption, "code", "Code")}</div><div>{formatMoney(detailValue(redemption, "amount", "Amount"))} · {detailValue(redemption, "status", "Status")}</div></div>)}</section>}
                </div>
              )}

              <div className="p-6">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-700">
                  Ordered Items
                </h3>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Variant</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item) => (
                        <tr
                          key={detailValue(item, "orderItem_Id", "OrderItem_Id")}
                          className="border-t"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {detailValue(item, "product_Name", "Product_Name")}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {[
                              detailValue(item, "variant_Name", "Variant_Name"),
                              detailValue(item, "variant_Packaging", "Variant_Packaging"),
                            ]
                              .filter(Boolean)
                              .join(" / ") || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {detailValue(item, "quantity", "Quantity")}
                          </td>
                          <td className="px-4 py-3">
                            {formatMoney(
                              detailValue(item, "product_Price", "Product_Price"),
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatMoney(detailValue(item, "subtotal", "Subtotal"))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
