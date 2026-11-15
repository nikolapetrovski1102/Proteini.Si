import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiMail,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  Notice,
  OrderStatusBadge,
  PaymentStatusBadge,
  SearchInput,
  Segmented,
  inputClass,
  selectClass,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDateTime, formatMoney, orderStatusLabel } from "./adminUtils";

/* Quick status tabs; everything else lives under "More filters". */
const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Claimed" },
];

const ORDER_STATUS_OPTIONS = ["", "pending", "paid", "confirmed", "shipped", "delivered", "rejected", "cancelled"];
const PAYMENT_STATUS_OPTIONS = [
  ["", "Any payment status"],
  ["pending", "Not paid yet"],
  ["completed", "Paid"],
  ["failed", "Payment failed"],
  ["refunded", "Refunded"],
];

/* Each action: what it sets, how it is labelled, and whether the customer gets an email. */
/* Flow: Confirm → Ship (tracking number + link) → Claimed. Reject is only possible before shipping. */
const ACTIONS = [
  { key: "confirm", label: "Mark as confirmed", order_Status: "confirmed", notifyCustomer: true, variant: "primary" },
  { key: "shipped", label: "Mark as shipped", order_Status: "shipped", notifyCustomer: true, variant: "primary" },
  { key: "delivered", label: "Mark as claimed", order_Status: "delivered", notifyCustomer: true, variant: "primary" },
  { key: "reject", label: "Reject order", order_Status: "rejected", notifyCustomer: true, variant: "dangerSoft" },
];

/* "processing" and "completed" are older statuses; those orders can still move on to shipping. */
const TRANSITIONS = {
  pending: ["confirmed", "rejected"],
  pending_confirmation: ["confirmed", "rejected"],
  paid: ["confirmed", "shipped", "rejected"],
  confirmed: ["shipped", "rejected"],
  processing: ["shipped", "rejected"],
  completed: ["shipped", "delivered"],
  shipped: ["delivered"],
};

/* Courier tracking link from the settings template (https://…{number}…). */
const trackingUrlFor = (template, number) => {
  const value = String(number || "").trim();
  if (!value || !template || !/\{number\}/i.test(template)) return "";
  return template.trim().replace(/\{number\}/gi, encodeURIComponent(value));
};

const allowedActionsFor = (status) => {
  const allowed = TRANSITIONS[String(status || "").toLowerCase()] || [];
  return ACTIONS.filter((a) => allowed.includes(a.order_Status));
};

const pick = (source, ...keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return "";
};

export default function AdminOrders() {
  const location = useLocation();
  const confirm = useConfirm();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [shipping, setShipping] = useState(null); // { order, action, trackingNumber, trackingUrl, urlEdited }
  const [trackingTemplate, setTrackingTemplate] = useState("");

  useEffect(() => {
    api
      .getShippingSettings()
      .then((settings) => setTrackingTemplate(settings?.trackingUrlTemplate || settings?.TrackingUrlTemplate || ""))
      .catch(() => {});
  }, []);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    orderStatus: location.state?.orderStatus || "",
    paymentStatus: "",
    page: 1,
    pageSize: 50,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getAdminOrders(filters);
      setOrders(response.orders || []);
      setPagination({ totalCount: response.totalCount || 0, totalPages: response.totalPages || 1 });
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

  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value, page: 1 }));

  const exportOrders = async () => {
    setExporting(true);
    try {
      await api.downloadAdminOrders(filters);
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err.message || "Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const openOrderDetails = useCallback(
    async (orderId) => {
      if (!orderId) return;
      setDetailsLoading(true);
      try {
        setSelectedOrderDetails(await api.getAdminOrderDetails(orderId));
      } catch (err) {
        toast.error(err.message || "Failed to load order details");
      } finally {
        setDetailsLoading(false);
      }
    },
    [toast],
  );

  // Arriving from the overview with a specific order.
  useEffect(() => {
    const id = location.state?.openOrderId;
    if (id) openOrderDetails(id);
  }, [location.state, openOrderDetails]);

  const runAction = async (order, action, tracking = {}) => {
    const orderId = pick(order, "order_Id", "Order_Id");
    const orderNumber = pick(order, "order_Number", "Order_Number");
    setSavingOrderId(orderId);
    try {
      const result = await api.updateAdminOrderStatus({
        order_Id: orderId,
        order_Status: action.order_Status,
        payment_Status: action.payment_Status,
        transaction_Id: null,
        tracking_Number: tracking.trackingNumber?.trim() || null,
        tracking_Url: tracking.trackingUrl?.trim() || null,
        send_Email: Boolean(action.notifyCustomer),
      });
      if (action.notifyCustomer && result?.emailSent === false) {
        toast.error(`Order #${orderNumber} updated, but the customer email could not be sent.`);
      } else {
        toast.success(`Order #${orderNumber}: ${orderStatusLabel(action.order_Status)}${action.notifyCustomer ? " · customer emailed" : ""}`);
      }
      await fetchOrders();
      if (selectedOrderDetails) await openOrderDetails(orderId);
    } catch (err) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleAction = async (order, action) => {
    if (action.order_Status === "shipped") {
      setShipping({
        order,
        action,
        trackingNumber: pick(order, "tracking_Number", "Tracking_Number") || "",
        trackingUrl: pick(order, "tracking_Url", "Tracking_Url") || "",
        urlEdited: Boolean(pick(order, "tracking_Url", "Tracking_Url")),
      });
      return;
    }
    const orderNumber = pick(order, "order_Number", "Order_Number");
    const danger = action.variant === "dangerSoft";
    const ok = await confirm({
      title: `${action.label}?`,
      message:
        `Order #${orderNumber} will be set to “${orderStatusLabel(action.order_Status)}”.` +
        (action.notifyCustomer ? "\n\nThe customer will get an email about this." : ""),
      confirmLabel: action.label,
      tone: danger ? "danger" : undefined,
    });
    if (ok) runAction(order, action);
  };

  const submitShipping = async (e) => {
    e?.preventDefault();
    const { order, action, trackingNumber, trackingUrl } = shipping;
    setShipping(null);
    await runAction(order, action, { trackingNumber, trackingUrl });
  };

  const selectedOrder = selectedOrderDetails?.order;
  const selectedItems = selectedOrderDetails?.items || [];
  const selectedFreeGifts = selectedOrderDetails?.freeGifts || [];
  const selectedIssuedVouchers = selectedOrderDetails?.issuedVouchers || [];
  const selectedVoucherRedemptions = selectedOrderDetails?.voucherRedemptions || [];

  const statusInTabs = STATUS_TABS.some((t) => t.value === filters.orderStatus);

  return (
    <AdminPage
      eyebrow="Shop"
      title="Orders"
      count={loading ? undefined : pagination.totalCount}
      description="Open an order to see everything the customer bought and move it to the next step. Steps marked with ✉ email the customer automatically."
      actions={
        <>
          <Button variant="secondary" icon={FiRefreshCw} onClick={fetchOrders} loading={loading && orders.length > 0}>
            Refresh
          </Button>
          <Button variant="primary" icon={FiDownload} onClick={exportOrders} loading={exporting}>
            Export CSV
          </Button>
        </>
      }
    >
      {/* filters */}
      <Card bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={filters.search}
            onChange={(v) => updateFilter("search", v)}
            placeholder="Order number, name, email or phone"
            className="lg:max-w-sm lg:flex-1"
          />
          <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
            <Segmented
              value={statusInTabs ? filters.orderStatus : null}
              onChange={(v) => updateFilter("orderStatus", v)}
              options={STATUS_TABS}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            className="text-sm font-semibold text-gray-700 underline decoration-[#FDC700] decoration-2 underline-offset-4 hover:decoration-[#141409] lg:ml-auto"
            aria-expanded={showMoreFilters}
          >
            {showMoreFilters ? "Fewer filters" : "More filters"}
          </button>
        </div>
        {showMoreFilters && (
          <div className="mt-4 grid gap-3 border-t border-black/[0.06] pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Order status">
              <select value={filters.orderStatus} onChange={(e) => updateFilter("orderStatus", e.target.value)} className={selectClass}>
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <option key={s || "all"} value={s}>
                    {s ? orderStatusLabel(s) : "Any order status"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment">
              <select value={filters.paymentStatus} onChange={(e) => updateFilter("paymentStatus", e.target.value)} className={selectClass}>
                {PAYMENT_STATUS_OPTIONS.map(([v, l]) => (
                  <option key={v || "all"} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort by">
              <select value={filters.sortBy} onChange={(e) => updateFilter("sortBy", e.target.value)} className={selectClass}>
                <option value="date">Date</option>
                <option value="number">Order number</option>
                <option value="customer">Customer</option>
                <option value="status">Status</option>
                <option value="total">Total</option>
              </select>
            </Field>
            <Field label="Order">
              <select value={filters.sortOrder} onChange={(e) => updateFilter("sortOrder", e.target.value)} className={selectClass}>
                <option value="desc">Newest / highest first</option>
                <option value="asc">Oldest / lowest first</option>
              </select>
            </Field>
          </div>
        )}
      </Card>

      {error && <Notice tone="error">{error}</Notice>}

      <Card bodyClassName="">
        {loading && orders.length === 0 ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-black/[0.04]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={FiShoppingBag}
            title="No orders match"
            text={filters.search || filters.orderStatus || filters.paymentStatus ? "Try clearing the search or picking “All”." : "New orders will show up here."}
          />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Order</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Payment</th>
                    <th className={`${thClass} text-right`}>Total</th>
                    <th className={`${thClass} text-right`}>Next step</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const orderId = pick(order, "order_Id", "Order_Id");
                    const status = pick(order, "order_Status", "Order_Status");
                    const next = allowedActionsFor(status)[0];
                    return (
                      <tr key={orderId} className={`${trClass} cursor-pointer`} onClick={() => openOrderDetails(orderId)}>
                        <td className={tdClass}>
                          <span className="font-bold tabular-nums text-gray-900">#{pick(order, "order_Number", "Order_Number")}</span>
                          <span className="block text-xs text-gray-500">{pick(order, "item_Count", "Item_Count")} items</span>
                        </td>
                        <td className={tdClass}>
                          <span className="block font-semibold text-gray-900">{pick(order, "billing_FullName", "Billing_FullName")}</span>
                          <span className="block text-xs text-gray-500">{pick(order, "billing_Email", "Billing_Email")}</span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-gray-600`}>{formatDateTime(pick(order, "order_Date", "Order_Date"))}</td>
                        <td className={tdClass}>
                          <OrderStatusBadge status={status} />
                        </td>
                        <td className={tdClass}>
                          <PaymentStatusBadge status={pick(order, "payment_Status", "Payment_Status")} />
                          <span className="mt-1 block text-xs text-gray-500">{pick(order, "payment_Method", "Payment_Method")}</span>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-right font-bold tabular-nums`}>{formatMoney(pick(order, "total_Amount", "Total_Amount"))}</td>
                        <td className={`${tdClass} text-right`} onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            {next && (
                              <Button
                                size="sm"
                                variant={next.variant === "dangerSoft" ? "secondary" : next.variant}
                                loading={savingOrderId === orderId}
                                onClick={() => handleAction(order, next)}
                              >
                                {next.label}
                                {next.notifyCustomer && <FiMail size={12} aria-label="emails customer" />}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openOrderDetails(orderId)} disabled={detailsLoading}>
                              Open
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* mobile list */}
            <ul className="divide-y divide-black/[0.05] md:hidden">
              {orders.map((order) => {
                const orderId = pick(order, "order_Id", "Order_Id");
                return (
                  <li key={orderId}>
                    <button type="button" onClick={() => openOrderDetails(orderId)} className="block w-full px-4 py-4 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold tabular-nums text-gray-900">#{pick(order, "order_Number", "Order_Number")}</span>
                        <span className="font-bold tabular-nums text-gray-900">{formatMoney(pick(order, "total_Amount", "Total_Amount"))}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-700">{pick(order, "billing_FullName", "Billing_FullName")}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={pick(order, "order_Status", "Order_Status")} />
                        <PaymentStatusBadge status={pick(order, "payment_Status", "Payment_Status")} />
                        <span className="text-xs text-gray-500">{formatDateTime(pick(order, "order_Date", "Order_Date"))}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {filters.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={FiChevronLeft} disabled={filters.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={filters.page >= pagination.totalPages} onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}>
              Next <FiChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* order details */}
      <Modal
        open={Boolean(selectedOrderDetails)}
        onClose={() => setSelectedOrderDetails(null)}
        size="xl"
        title={`Order #${pick(selectedOrder, "order_Number", "Order_Number")}`}
        description={formatDateTime(pick(selectedOrder, "order_Date", "Order_Date"))}
        footer={
          selectedOrder && (
            <>
              <Button
                variant="ghost"
                icon={FiFileText}
                className="mr-auto"
                onClick={() =>
                  api
                    .downloadAdminOrderDocument(pick(selectedOrder, "order_Id", "Order_Id"), pick(selectedOrder, "order_Number", "Order_Number"))
                    .catch((err) => toast.error(err.message))
                }
              >
                Download order PDF
              </Button>
              {allowedActionsFor(pick(selectedOrder, "order_Status", "Order_Status")).map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant}
                  loading={savingOrderId === pick(selectedOrder, "order_Id", "Order_Id")}
                  onClick={() => handleAction(selectedOrder, action)}
                >
                  {action.label}
                  {action.notifyCustomer && <FiMail size={13} aria-label="emails customer" />}
                </Button>
              ))}
            </>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={pick(selectedOrder, "order_Status", "Order_Status")} />
              <PaymentStatusBadge status={pick(selectedOrder, "payment_Status", "Payment_Status")} />
              <Badge>{pick(selectedOrder, "payment_Method", "Payment_Method") || "—"}</Badge>
              {pick(selectedOrder, "tracking_Number", "Tracking_Number") && (
                <Badge tone="ink">Tracking {pick(selectedOrder, "tracking_Number", "Tracking_Number")}</Badge>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoBlock title="Customer">
                <p className="font-semibold text-gray-900">{pick(selectedOrder, "billing_FullName", "Billing_FullName")}</p>
                <p>{pick(selectedOrder, "billing_Email", "Billing_Email")}</p>
                <p>{pick(selectedOrder, "billing_Phone", "Billing_Phone")}</p>
                {pick(selectedOrder, "billing_Type", "Billing_Type") && <p className="text-gray-500">Type: {pick(selectedOrder, "billing_Type", "Billing_Type")}</p>}
                {pick(selectedOrder, "billing_CompanyName", "Billing_CompanyName") && <p>Company: {pick(selectedOrder, "billing_CompanyName", "Billing_CompanyName")}</p>}
                {pick(selectedOrder, "billing_TaxNumber", "Billing_TaxNumber") && <p>Tax no.: {pick(selectedOrder, "billing_TaxNumber", "Billing_TaxNumber")}</p>}
              </InfoBlock>
              <InfoBlock title="Billing address">
                <p>{pick(selectedOrder, "billing_Address", "Billing_Address")}</p>
                <p>
                  {pick(selectedOrder, "billing_PostCode", "Billing_PostCode")} {pick(selectedOrder, "billing_City", "Billing_City")}
                </p>
                <p>{pick(selectedOrder, "billing_Country", "Billing_Country")}</p>
              </InfoBlock>
              <InfoBlock title="Deliver to">
                {pick(selectedOrder, "delivery_IsDifferent", "Delivery_IsDifferent") ? (
                  <>
                    <p className="font-semibold text-gray-900">{pick(selectedOrder, "delivery_FullName", "Delivery_FullName")}</p>
                    <p>{pick(selectedOrder, "delivery_Address", "Delivery_Address")}</p>
                    <p>
                      {pick(selectedOrder, "delivery_PostCode", "Delivery_PostCode")} {pick(selectedOrder, "delivery_City", "Delivery_City")}
                    </p>
                    <p>{pick(selectedOrder, "delivery_Country", "Delivery_Country")}</p>
                    <p>{pick(selectedOrder, "delivery_Phone", "Delivery_Phone")}</p>
                  </>
                ) : (
                  <p className="text-gray-500">Same as billing address</p>
                )}
              </InfoBlock>
            </div>

            {/* items */}
            <div className="overflow-x-auto rounded-xl ring-1 ring-black/[0.06]">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Product</th>
                    <th className={thClass}>Variant</th>
                    <th className={`${thClass} text-right`}>Qty</th>
                    <th className={`${thClass} text-right`}>Price</th>
                    <th className={`${thClass} text-right`}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={pick(item, "orderItem_Id", "OrderItem_Id")} className={trClass}>
                      <td className={`${tdClass} font-semibold text-gray-900`}>{pick(item, "product_Name", "Product_Name")}</td>
                      <td className={`${tdClass} text-gray-600`}>
                        {[pick(item, "variant_Name", "Variant_Name"), pick(item, "variant_Packaging", "Variant_Packaging")].filter(Boolean).join(" / ") || "—"}
                      </td>
                      <td className={`${tdClass} text-right tabular-nums`}>{pick(item, "quantity", "Quantity")}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>{formatMoney(pick(item, "product_Price", "Product_Price"))}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{formatMoney(pick(item, "subtotal", "Subtotal"))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock title="Customer note">
                <p className="whitespace-pre-wrap">{pick(selectedOrder, "order_Note", "Order_Note") || <span className="text-gray-400">No note</span>}</p>
                {selectedFreeGifts.map((gift) => (
                  <p key={pick(gift, "orderFreeGiftId", "OrderFreeGiftId")} className="mt-3 rounded-lg bg-[#FDC700]/20 px-3 py-2 font-semibold text-[#5c4800]">
                    🎁 Free gift: {pick(gift, "displayName", "DisplayName")}
                  </p>
                ))}
              </InfoBlock>
              <InfoBlock title="Totals">
                <dl className="space-y-1.5">
                  <Row label="Subtotal" value={formatMoney(pick(selectedOrder, "subtotal", "Subtotal"))} />
                  {Number(pick(selectedOrder, "gift_Voucher_Amount", "Gift_Voucher_Amount") || 0) > 0 && (
                    <Row
                      label={`Gift voucher ${pick(selectedOrder, "gift_Voucher_Code", "Gift_Voucher_Code")}`}
                      value={`− ${formatMoney(pick(selectedOrder, "gift_Voucher_Amount", "Gift_Voucher_Amount"))}`}
                      tone="text-[#2f5e14]"
                    />
                  )}
                  <Row label="Delivery" value={formatMoney(pick(selectedOrder, "delivery_Fee", "Delivery_Fee"))} />
                  {Number(pick(selectedOrder, "points_Discount", "Points_Discount") || 0) > 0 && (
                    <Row label="Loyalty points" value={`− ${formatMoney(pick(selectedOrder, "points_Discount", "Points_Discount"))}`} tone="text-[#2f5e14]" />
                  )}
                  {Number(pick(selectedOrder, "promo_Discount", "Promo_Discount") || 0) > 0 && (
                    <Row
                      label={`Promo ${pick(selectedOrder, "promo_Code", "Promo_Code") || ""}`}
                      value={`− ${formatMoney(pick(selectedOrder, "promo_Discount", "Promo_Discount"))}`}
                      tone="text-[#2f5e14]"
                    />
                  )}
                  <div className="flex justify-between border-t border-black/[0.08] pt-2 text-base font-bold text-gray-900">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatMoney(pick(selectedOrder, "total_Amount", "Total_Amount"))}</dd>
                  </div>
                </dl>
              </InfoBlock>
            </div>

            {(selectedIssuedVouchers.length > 0 || selectedVoucherRedemptions.length > 0) && (
              <div className="grid gap-3 md:grid-cols-2">
                {selectedIssuedVouchers.length > 0 && (
                  <InfoBlock title="Gift vouchers issued">
                    {selectedIssuedVouchers.map((v) => (
                      <div key={pick(v, "giftVoucherId", "GiftVoucherId")} className="mb-2 rounded-lg bg-[#8DC658]/15 px-3 py-2">
                        <p className="font-mono font-bold text-gray-900">{pick(v, "code", "Code")}</p>
                        <p className="text-xs">
                          {formatMoney(pick(v, "remainingValue", "RemainingValue"))} left · {pick(v, "status", "Status")}
                        </p>
                        {(pick(v, "recipientName", "RecipientName") || pick(v, "recipientEmail", "RecipientEmail")) && (
                          <p className="text-xs text-gray-600">
                            For {[pick(v, "recipientName", "RecipientName"), pick(v, "recipientEmail", "RecipientEmail")].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </InfoBlock>
                )}
                {selectedVoucherRedemptions.length > 0 && (
                  <InfoBlock title="Gift vouchers used">
                    {selectedVoucherRedemptions.map((r) => (
                      <div key={pick(r, "giftVoucherRedemptionId", "GiftVoucherRedemptionId")} className="mb-2 rounded-lg bg-sky-50 px-3 py-2">
                        <p className="font-mono font-bold text-gray-900">{pick(r, "code", "Code")}</p>
                        <p className="text-xs">
                          {formatMoney(pick(r, "amount", "Amount"))} · {pick(r, "status", "Status")}
                        </p>
                      </div>
                    ))}
                  </InfoBlock>
                )}
              </div>
            )}

            {allowedActionsFor(pick(selectedOrder, "order_Status", "Order_Status")).length === 0 && (
              <Notice tone="info">This order is finished — there are no further steps.</Notice>
            )}
          </div>
        )}
      </Modal>

      {/* shipping form (replaces browser prompts) */}
      <Modal
        open={Boolean(shipping)}
        onClose={() => setShipping(null)}
        size="sm"
        title="Mark as shipped"
        description={shipping ? `Order #${pick(shipping.order, "order_Number", "Order_Number")} · the customer gets an email with these details.` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShipping(null)}>
              Cancel
            </Button>
            <Button onClick={submitShipping} icon={FiMail}>
              Ship & email customer
            </Button>
          </>
        }
      >
        {shipping && (
          <form onSubmit={submitShipping} className="space-y-4">
            <Field label="Tracking number" hint="Optional. Leave empty if the courier did not give one.">
              <input
                className={inputClass}
                autoFocus
                value={shipping.trackingNumber}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    trackingNumber: e.target.value,
                    trackingUrl: s.urlEdited ? s.trackingUrl : trackingUrlFor(trackingTemplate, e.target.value),
                  }))
                }
              />
            </Field>
            <Field
              label="Tracking link"
              hint={
                trackingTemplate
                  ? "Filled in from the tracking number. Change it only if this package uses another courier."
                  : "Optional. Set a tracking link template under Promotions & gifts → Delivery & payment to fill this in automatically."
              }
            >
              <input
                className={inputClass}
                type="url"
                placeholder="https://"
                value={shipping.trackingUrl}
                onChange={(e) => setShipping((s) => ({ ...s, trackingUrl: e.target.value, urlEdited: Boolean(e.target.value) }))}
              />
            </Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>
    </AdminPage>
  );
}

function InfoBlock({ title, children }) {
  return (
    <div className="rounded-xl bg-[#f6f5f1] p-4 text-sm leading-relaxed text-gray-700">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, tone = "" }) {
  return (
    <div className={`flex justify-between gap-4 ${tone}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
