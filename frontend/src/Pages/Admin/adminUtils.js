import { formatAmount } from "../../utils/formatPrice";
/* Non-component helpers shared by admin screens (kept apart from AdminKit.jsx for fast refresh). */

const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const btnSizes = {
  sm: "min-h-[36px] px-3 text-xs",
  md: "min-h-[44px] px-5 text-sm",
  lg: "min-h-[48px] px-7 text-sm",
};

const btnVariants = {
  primary:
    "ink-btn bg-[#141409] text-white hover:bg-black focus-visible:ring-[#FDC700]",
  accent:
    "bg-[#FDC700] text-[#141409] hover:bg-[#f0bd00] focus-visible:ring-[#141409]",
  secondary:
    "bg-white text-gray-900 ring-1 ring-black/[0.12] hover:bg-black/[0.04] hover:ring-black/30 focus-visible:ring-[#141409]",
  ghost:
    "text-gray-700 hover:bg-black/[0.05] hover:text-gray-900 focus-visible:ring-[#141409]",
  danger:
    "bg-[#E3262F] text-white hover:bg-[#c51d25] focus-visible:ring-[#E3262F]",
  dangerSoft:
    "text-[#b3191f] ring-1 ring-[#E3262F]/25 hover:bg-[#E3262F]/[0.07] focus-visible:ring-[#E3262F]",
};

export const buttonClass = (variant = "primary", size = "md") =>
  `${btnBase} ${btnSizes[size]} ${btnVariants[variant]}`;


/* ------------------------------------------------------------------ helpers */

export const formatMoney = (value) => `${formatAmount(value)} ден.`;

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ----------------------------------------------------------- order statuses */

export const ORDER_STATUS = {
  pending: ["New", "yellow"],
  pending_confirmation: ["Awaiting confirmation", "yellow"],
  confirmed: ["Confirmed", "blue"],
  processing: ["Preparing", "blue"],
  paid: ["Paid", "green"],
  completed: ["Completed", "green"],
  shipped: ["Shipped", "ink"],
  delivered: ["Claimed", "green"],
  rejected: ["Rejected", "red"],
  cancelled: ["Cancelled", "neutral"],
  refunded: ["Refunded", "orange"],
};

export const PAYMENT_STATUS = {
  pending: ["Not paid yet", "yellow"],
  completed: ["Paid", "green"],
  failed: ["Payment failed", "red"],
  refunded: ["Refunded", "orange"],
};

export const orderStatusLabel = (s) => ORDER_STATUS[String(s || "").toLowerCase()]?.[0] || s || "—";
export const paymentStatusLabel = (s) => PAYMENT_STATUS[String(s || "").toLowerCase()]?.[0] || s || "—";

