import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiTruck,
} from "react-icons/fi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { BrandLoader } from "../Components/Loaders/BrandLoader";
import { formatDate } from "../ProfilePages/profileFormat";
import { CourierCodNote } from "../Components/CourierCodNote";
import { confirmDialog } from "../Components/Feedback/siteFeedback";
import Price from "../Components/Price";

// Same type and surfaces as the redesigned cart and checkout pages.
const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";
const cardClass =
  "rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-32px_rgba(20,20,9,0.25)] sm:p-6";
const darkButtonClass =
  "group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#141409] px-6 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] disabled:cursor-not-allowed disabled:opacity-40";
const outlineButtonClass =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 text-sm font-bold text-gray-900 transition hover:border-[#141409] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] disabled:cursor-not-allowed disabled:opacity-50";

const STATUS_STYLES = {
  pending: "bg-[#FDC700]/25 text-[#5c4800]",
  paid: "bg-[#8DC658]/20 text-[#2f5e14]",
  completed: "bg-[#8DC658]/20 text-[#2f5e14]",
  delivered: "bg-[#8DC658]/20 text-[#2f5e14]",
  shipped: "bg-[#141409] text-white",
  cancelled: "bg-[#E3262F]/10 text-[#a3161d]",
  refunded: "bg-[#E3262F]/10 text-[#a3161d]",
  failed: "bg-[#E3262F]/10 text-[#a3161d]",
};
const KNOWN_STATUSES = ["pending", "paid", "cancelled", "shipped", "delivered", "completed", "refunded"];

const PAYMENT_METHOD_KEYS = {
  credit_card: "creditCard",
  home_delivery: "homeDelivery",
};

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

function StepTrail({ translate }) {
  const done = (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141409] text-[#FDC700]">
      <FiCheck size={12} strokeWidth={3} />
    </span>
  );
  return (
    <ol className="hidden items-center gap-2 text-xs font-semibold text-gray-500 sm:flex">
      <li className="inline-flex items-center gap-1.5">
        {done}
        {translate("shoppingCart")}
      </li>
      <li aria-hidden="true" className="h-px w-6 bg-gray-300" />
      <li className="inline-flex items-center gap-1.5">
        {done}
        {translate("checkoutStepDetails")}
      </li>
      <li aria-hidden="true" className="h-px w-6 bg-gray-300" />
      <li aria-current="step" className="inline-flex items-center gap-1.5 text-gray-900">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
          <FiCheck size={12} strokeWidth={3} />
        </span>
        {translate("checkoutStepConfirm")}
      </li>
    </ol>
  );
}

function Shell({ children, translate }) {
  return (
    <div className="home-tint min-h-screen bg-[#f6f5f1]">
      <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <Link
            to="/all-products"
            className="text-sm font-bold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4"
          >
            {translate("continueShopping")}
          </Link>
          <StepTrail translate={translate} />
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, positive = false }) {
  return (
    <div className={`flex justify-between gap-4 ${positive ? "text-green-600" : ""}`}>
      <dt className={positive ? "" : "text-gray-600"}>{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const guestToken = searchParams.get("token");
  const isGuest = !api.isAuthenticated();
  const { translate, language } = useLanguage();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ tone: "success", text: "" });
  const [cancelling, setCancelling] = useState(false);
  const [shippingSettings, setShippingSettings] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.getOrderConfirmation(orderId, isGuest ? guestToken : null);
      if (response?.status && response.order) {
        setOrder(response.order);
        setItems(response.items || []);
      } else {
        setOrder(null);
      }
    } catch (fetchError) {
      console.error("Error fetching order:", fetchError);
      setError(translate("orderLoadError"));
    } finally {
      setLoading(false);
    }
    // translate is recreated on each render; the language does not change what we fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, guestToken, isGuest]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Courier commission tiers for the cash-on-delivery note; the note falls back to defaults if this fails.
  useEffect(() => {
    let active = true;
    api
      .getShippingSettings()
      .then((settings) => active && setShippingSettings(settings))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async () => {
    if (!order || !(await confirmDialog({ title: translate("ordersCancelTitle"), message: translate("ordersCancelConfirm"), confirmLabel: translate("cancelOrder"), cancelLabel: translate("ordersCancelKeep"), tone: "danger" }))) return;
    setCancelling(true);
    setNotice({ tone: "success", text: "" });
    try {
      const response = await api.cancelOrder(order.Order_Id);
      if (response?.status) {
        setNotice({ tone: "success", text: translate("ordersCancelled") });
        await fetchOrder();
      } else {
        setNotice({ tone: "error", text: response?.message || translate("ordersCancelError") });
      }
    } catch (cancelError) {
      console.error("Error cancelling order:", cancelError);
      setNotice({ tone: "error", text: translate("ordersCancelError") });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Shell translate={translate}>
        <div className={`${cardClass} flex flex-col items-center py-16 text-center`}>
          <BrandLoader variant="scoop" size={120} />
          <p className="mt-4 text-sm text-gray-500">{translate("loadingOrderDetails")}</p>
        </div>
      </Shell>
    );
  }

  if (error || !order) {
    return (
      <Shell translate={translate}>
        <div className={`${cardClass} mx-auto max-w-xl py-12 text-center`}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f5f1] text-gray-500">
            <FiPackage size={24} />
          </span>
          <h1 className={`${headingClass} mt-5 text-3xl`}>
            {error ? translate("orderLoadError") : translate("orderNotFoundTitle")}
          </h1>
          {!error && (
            <p className="mx-auto mt-3 max-w-sm text-sm text-gray-600">
              {translate("orderNotFoundText")}
            </p>
          )}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {error && (
              <button type="button" onClick={fetchOrder} className={darkButtonClass}>
                {translate("ordersTryAgain")}
              </button>
            )}
            <Link to="/all-products" className={error ? outlineButtonClass : darkButtonClass}>
              {translate("startShopping")}
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const status = order.Order_Status?.toLowerCase();
  const isCancelled = status === "cancelled";
  const email = order.Billing_Email || order.User_Email;
  const paymentMethodKey = PAYMENT_METHOD_KEYS[order.Payment_Method?.toLowerCase()];
  const paymentMethodLabel = paymentMethodKey
    ? translate(paymentMethodKey)
    : order.Payment_Method || "";

  const useDelivery = Boolean(order.Delivery_IsDifferent);
  const address = {
    name: (useDelivery ? order.Delivery_FullName : order.Billing_FullName) || order.Billing_CompanyName,
    company: !useDelivery && order.Billing_CompanyName && order.Billing_FullName ? order.Billing_CompanyName : "",
    street: useDelivery ? order.Delivery_Address : order.Billing_Address,
    postCode: useDelivery ? order.Delivery_PostCode : order.Billing_PostCode,
    city: useDelivery ? order.Delivery_City : order.Billing_City,
    phone: (useDelivery ? order.Delivery_Phone : order.Billing_Phone) || order.Billing_Phone,
  };

  const subtotal =
    order.Subtotal ??
    items.reduce((sum, item) => sum + Number(item.Product_Price || 0) * Number(item.Quantity || 0), 0);
  const pointsEarned = Math.floor(Number(order.Points_Earned || 0));
  const itemCount = items.reduce((sum, item) => sum + Number(item.Quantity || 0), 0);

  const thankYouText = email
    ? translate("orderConfirmText").replace("{email}", email)
    : translate("orderConfirmTextNoEmail");

  return (
    <Shell translate={translate}>
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-2xl bg-[#141409] p-6 text-white sm:mb-10 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FDC700]/15 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <span
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20 ${
              isCancelled ? "bg-white/10 text-white" : "bg-[#FDC700] text-[#141409]"
            }`}
          >
            {isCancelled ? <FiPackage size={30} /> : <FiCheck size={36} strokeWidth={3} />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#FDC700]">
              {translate("orderNumberLabel")} #{order.Order_Number}
            </p>
            <h1 className="mt-2 font-display text-[34px] font-bold uppercase leading-[0.95] tracking-tight [text-wrap:balance] sm:text-5xl">
              {isCancelled ? translate("ordersCancelled") : translate("orderConfirmTitle")}
            </h1>
            {!isCancelled && (
              <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">{thankYouText}</p>
            )}
          </div>
        </div>
      </section>

      {notice.text && (
        <div
          role="alert"
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
        {/* Left column */}
        <div className="min-w-0 space-y-6">
          <section className={cardClass}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className={`${headingClass} text-xl sm:text-2xl`}>{translate("orderItems")}</h2>
              <span className="text-xs font-semibold text-gray-500">
                {itemCount} × {translate("quantity").toLowerCase()}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const meta = [item.Variant_Name, item.Variant_Packaging].filter(Boolean).join(" · ");
                return (
                  <li key={item.OrderItem_Id ?? index} className="flex items-center gap-4 py-4">
                    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#f6f5f1] text-gray-400">
                      <FiPackage size={22} />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141409] px-1 text-[11px] font-bold text-[#FDC700]">
                        {item.Quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.Product_Id ? (
                        <Link
                          to={`/product/${item.Product_Id}`}
                          className="line-clamp-2 text-sm font-semibold text-gray-900 hover:underline"
                        >
                          {item.Product_Name}
                        </Link>
                      ) : (
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{item.Product_Name}</p>
                      )}
                      {meta && <p className="mt-0.5 text-xs text-gray-500">{meta}</p>}
                      <p className="mt-0.5 text-xs tabular-nums text-gray-500">
                        {item.Quantity} × <Price value={item.Product_Price} />
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                      <Price value={Number(item.Product_Price || 0) * Number(item.Quantity || 0)} />
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className={cardClass}>
              <h2 className={`${headingClass} mb-4 flex items-center gap-2 text-xl`}>
                <FiMapPin className="text-[#141409]" size={18} />
                {translate("deliveryAddress")}
              </h2>
              <address className="space-y-1 text-sm not-italic text-gray-700">
                {address.name && <p className="font-semibold text-gray-900">{address.name}</p>}
                {address.company && <p>{address.company}</p>}
                {address.street && <p>{address.street}</p>}
                {(address.postCode || address.city) && (
                  <p>{[address.postCode, address.city].filter(Boolean).join(" ")}</p>
                )}
                {address.phone && (
                  <p className="flex items-center gap-1.5 pt-1 text-gray-600">
                    <FiPhone size={13} />
                    {address.phone}
                  </p>
                )}
              </address>
            </section>

            <section className={cardClass}>
              <h2 className={`${headingClass} mb-4 flex items-center gap-2 text-xl`}>
                <FiTruck className="text-[#141409]" size={18} />
                {translate("orderWhatNext")}
              </h2>
              <ol className="space-y-3 text-sm text-gray-700">
                {[
                  translate("orderNextPrepare"),
                  translate("orderNextCourier"),
                  order.Payment_Method?.toLowerCase() === "home_delivery"
                    ? translate("orderNextPayOnDelivery")
                    : translate("orderNextEmail"),
                ].map((text, index) => (
                  <li key={text} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FDC700] text-xs font-extrabold text-[#141409]">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {order.Order_Note && (
            <section className={cardClass}>
              <h2 className={`${headingClass} mb-3 text-xl`}>{translate("orderNote")}</h2>
              <p className="whitespace-pre-line text-sm text-gray-700">{order.Order_Note}</p>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h,80px)+24px)]">
          <div className={`${cardClass} space-y-5`}>
            <h2 className={`${headingClass} text-2xl`}>{translate("orderSummary")}</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600">{translate("orderPlacedOn")}</dt>
                <dd className="text-right font-semibold">{formatDate(order.Order_Date, language, true)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-600">{translate("orderStatusLabel")}</dt>
                <dd>
                  <StatusChip status={order.Order_Status} translate={translate} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-600">{translate("orderPaymentLabel")}</dt>
                <dd>
                  <StatusChip status={order.Payment_Status} translate={translate} />
                </dd>
              </div>
              {paymentMethodLabel && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">{translate("paymentMethod")}</dt>
                  <dd className="text-right font-semibold">{paymentMethodLabel}</dd>
                </div>
              )}
            </dl>

            <dl className="space-y-2.5 border-t border-gray-100 pt-5 text-sm tabular-nums">
              <SummaryRow label={translate("subtotal")} value={<Price value={subtotal} />} />
              <SummaryRow label={translate("delivery")} value={<Price value={order.Delivery_Fee} />} />
              {Number(order.Promo_Discount) > 0 && (
                <SummaryRow
                  positive
                  label={`${translate("promotionDiscount")}${order.Promo_Code ? ` (${order.Promo_Code})` : ""}`}
                  value={<>− <Price value={order.Promo_Discount} /></>}
                />
              )}
              {Number(order.Gift_Voucher_Amount) > 0 && (
                <SummaryRow
                  positive
                  label={translate("giftVoucher")}
                  value={<>− <Price value={order.Gift_Voucher_Amount} /></>}
                />
              )}
              {Number(order.Points_Discount) > 0 && (
                <SummaryRow
                  positive
                  label={translate("pointsDiscount")}
                  value={<>− <Price value={order.Points_Discount} /></>}
                />
              )}
            </dl>

            <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-gray-300 pt-4">
              <p className="font-display text-lg font-bold uppercase tracking-tight text-gray-900">
                {translate("total")}
              </p>
              <p className="text-2xl font-extrabold tabular-nums text-gray-900">
                <Price value={order.Total_Amount} />
              </p>
            </div>

            {order.Payment_Method?.toLowerCase() === "home_delivery" && !isCancelled && (
              <CourierCodNote amount={order.Total_Amount} settings={shippingSettings} translate={translate} />
            )}

            {!isGuest && pointsEarned > 0 && !isCancelled && (
              <div className="flex items-center justify-between rounded-xl bg-[#FDC700] px-4 py-3 text-[#141409]">
                <p className="text-sm font-bold">{translate("pointEarned")}</p>
                <p className="text-base font-extrabold tabular-nums">
                  +{pointsEarned} {translate("points")}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link to="/all-products" className={`${darkButtonClass} w-full`}>
                {translate("continueShopping")}
                <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-1" />
              </Link>
              {!isGuest && (
                <Link to="/profile/order-history" className={`${outlineButtonClass} w-full`}>
                  {translate("viewAllOrders")}
                </Link>
              )}
              {!isGuest && canCancelOrder(order) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="min-h-[44px] w-full rounded-lg text-sm font-semibold text-[#a3161d] transition-colors hover:bg-[#E3262F]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? translate("cancellingOrder") : translate("cancelOrder")}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
