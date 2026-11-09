import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiCreditCard, FiPackage, FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { BrandLoader } from "../Components/Loaders/BrandLoader";
import {
  Notice,
  ProfileEmpty,
  ProfileHeader,
  ProfileLoading,
  cardClass,
  eyebrowClass,
  ghostButtonClass,
  headingClass,
  pillButtonClass,
} from "./ProfileKit";
import { formatDate, formatPrice } from "./profileFormat";

const STATUS_STYLES = {
  pending: "bg-[#FDC700]/25 text-[#5c4800]",
  paid: "bg-[#8DC658]/20 text-[#2f5e14]",
  completed: "bg-[#8DC658]/20 text-[#2f5e14]",
  delivered: "bg-[#8DC658]/20 text-[#2f5e14]",
  shipped: "bg-[#141409] text-white",
  cancelled: "bg-[#E3262F]/10 text-[#a3161d]",
  refunded: "bg-[#E3262F]/10 text-[#a3161d]",
};

const KNOWN_STATUSES = ["pending", "paid", "cancelled", "shipped", "delivered", "completed", "refunded"];

const canCancelOrder = (order) => {
  const status = order.Order_Status?.toLowerCase();
  const hoursPassed = (Date.now() - new Date(order.Order_Date).getTime()) / 3_600_000;
  return !["cancelled", "shipped", "delivered", "paid"].includes(status) && hoursPassed <= 24;
};

function StatusChip({ status, translate }) {
  const key = (status || "pending").toLowerCase();
  const label = KNOWN_STATUSES.includes(key) ? translate(key) : String(status).toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${
        STATUS_STYLES[key] || "bg-black/[0.06] text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "pt-3 text-base font-bold text-gray-900" : "text-sm text-gray-600"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ tone: "success", text: "" });
  const [cancelling, setCancelling] = useState(null);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const navigate = useNavigate();
  const { translate, language } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrderHistory();
      setOrders(response?.orders || []);
      setError("");
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError(translate("ordersLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeDetails = () => {
    setSelected(null);
    setDetails(null);
  };

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDetails();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const openDetails = async (order) => {
    setSelected(order);
    setDetails(null);
    setLoadingDetails(true);
    try {
      const response = await api.getOrderConfirmation(order.Order_Id);
      if (response.status) setDetails({ order: response.order, items: response.items || [] });
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm(translate("ordersCancelConfirm"))) return;
    setCancelling(orderId);
    setNotice({ tone: "success", text: "" });
    try {
      const response = await api.cancelOrder(orderId);
      if (response.status) {
        setNotice({ tone: "success", text: response.message || translate("ordersCancelled") });
        closeDetails();
        await fetchOrders();
      } else {
        setNotice({ tone: "error", text: response.message || translate("ordersCancelError") });
      }
    } catch (err) {
      setNotice({ tone: "error", text: err.message || translate("ordersCancelError") });
    } finally {
      setCancelling(null);
    }
  };

  const header = (count) => (
    <ProfileHeader eyebrow={translate("profileMemberArea")} title={translate("orderHistory")} count={count} />
  );

  if (loading) {
    return (
      <div>
        {header()}
        <ProfileLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {header()}
        <div className={`${cardClass} px-6 py-12 text-center`}>
          <p className="text-sm font-medium text-[#a3161d]">{error}</p>
          <button type="button" onClick={fetchOrders} className={`${ghostButtonClass} mt-5`}>
            {translate("ordersTryAgain")}
          </button>
        </div>
      </div>
    );
  }

  const cancelButton = (order, extra = "") =>
    canCancelOrder(order) && (
      <button
        type="button"
        onClick={() => handleCancel(order.Order_Id)}
        disabled={cancelling === order.Order_Id}
        className={`${ghostButtonClass} !text-[#a3161d] hover:!bg-[#E3262F]/[0.06] hover:!ring-[#E3262F]/40 ${extra}`}
      >
        {cancelling === order.Order_Id ? translate("cancellingOrder") : translate("cancelOrder")}
      </button>
    );

  return (
    <div>
      {header(orders.length)}

      {notice.text && (
        <div className="mb-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}

      {orders.length === 0 ? (
        <ProfileEmpty
          icon={FiPackage}
          title={translate("noOrdersFound")}
          text={translate("ordersEmptyText")}
          actionLabel={translate("startShopping")}
          onAction={() => navigate("/all-products")}
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.Order_Id} className={`${cardClass} p-4 sm:p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={eyebrowClass}>
                    {translate("order")} · {formatDate(order.Order_Date, language, true)}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold uppercase leading-none tracking-tight text-gray-900">
                    #{order.Order_Number}
                  </p>
                </div>
                <p className="font-display text-2xl font-bold leading-none tabular-nums text-gray-900">
                  {formatPrice(order.Total_Amount)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusChip status={order.Order_Status} translate={translate} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-600">
                  <FiCreditCard size={12} />
                  {order.Payment_Method?.toUpperCase() || "—"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-black/[0.06] pt-4">
                <button type="button" onClick={() => openDetails(order)} className={`${ghostButtonClass} flex-1 sm:flex-none`}>
                  {translate("viewDetails")}
                  <FiChevronRight />
                </button>
                {cancelButton(order, "flex-1 sm:flex-none")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#141409]/60 sm:items-center sm:p-4"
          onClick={closeDetails}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-5 sm:p-6">
              <div>
                <p className={eyebrowClass}>{translate("orderDetails")}</p>
                <h2 id="order-details-title" className={`${headingClass} mt-1 text-3xl`}>
                  #{selected.Order_Number}
                </h2>
                <p className="mt-1 text-xs text-gray-500">{formatDate(selected.Order_Date, language, true)}</p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                aria-label={translate("close")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-gray-700 transition hover:bg-black/[0.1]"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6">
              {loadingDetails ? (
                <div className="flex flex-col items-center py-10">
                  <BrandLoader variant="scoop" size={100} />
                  <p className="mt-4 text-sm text-gray-500">{translate("loadingOrderDetails")}</p>
                </div>
              ) : details ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <StatusChip status={selected.Order_Status} translate={translate} />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-gray-600">
                      <FiCreditCard size={12} />
                      {translate("paymentMethod")}: {selected.Payment_Method?.toUpperCase() || "—"}
                    </span>
                  </div>

                  <h3 className="mt-6 text-sm font-bold text-gray-900">{translate("orderItems")}</h3>
                  <ul className="mt-2 divide-y divide-black/[0.06]">
                    {details.items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{item.Product_Name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {[
                              item.Variant_Name && `${translate("flavor")}: ${item.Variant_Name}`,
                              item.Variant_Packaging && `${translate("size")}: ${item.Variant_Packaging}`,
                              `${translate("quantity")}: ${item.Quantity}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-gray-900">
                          {formatPrice(item.Product_Price * item.Quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 space-y-1.5 rounded-2xl bg-[#f6f5f1] p-4">
                    <SummaryRow label={translate("subtotal")} value={formatPrice(details.order?.Subtotal)} />
                    <SummaryRow label={translate("deliveryFee")} value={formatPrice(details.order?.Delivery_Fee)} />
                    <SummaryRow label="DDV (9.5%)" value={formatPrice(details.order?.VAT_9_5)} />
                    <SummaryRow label="DDV (22%)" value={formatPrice(details.order?.VAT_22)} />
                    <div className="border-t border-black/[0.08]">
                      <SummaryRow strong label={translate("total")} value={formatPrice(selected.Total_Amount)} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-[#a3161d]">{translate("ordersDetailsError")}</p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] p-4 sm:flex-row sm:justify-end sm:p-5">
              {cancelButton(selected)}
              <button type="button" onClick={closeDetails} className={pillButtonClass}>
                {translate("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
