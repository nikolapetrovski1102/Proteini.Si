import { useEffect, useState } from "react";
import { FiBarChart2, FiCreditCard, FiDownload, FiEdit2, FiGift, FiPercent, FiPlus, FiSearch, FiTrash2, FiTruck } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  Loading,
  Modal,
  Notice,
  Segmented,
  Toggle,
  VisibilityBadge,
  inputClass,
  selectClass,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import PromoScopeFields, { ScopeBadge } from "./PromoScopeFields";
import VoucherRedeemCard from "./VoucherRedeemCard";
import { emptyScope, scopeError, scopeFromCode, scopePayload } from "./promoScope";
import { formatDate, formatDateTime, formatMoney } from "./adminUtils";
import { DEFAULT_LOYALTY_MIN_BALANCE, loyaltyTiers } from "../../utils/loyaltyRules";

const emptyCode = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: 0,
  maximumDiscountAmount: "",
  usageLimit: "",
  perCustomerLimit: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
  ...emptyScope,
};

const emptyGift = {
  productId: "",
  variantId: "",
  displayName: "",
  minimumOrderAmount: 0,
  validFrom: "",
  validUntil: "",
  isActive: true,
};

const defaultShipping = {
  flatDeliveryFee: 165,
  cashOnDeliveryFee: 30,
  freeDeliveryThreshold: 3000,
  courierCodThreshold: 3000,
  courierCodFixedFee: 30,
  courierCodPercent: 1.6,
  homeDeliveryEnabled: true,
  cardPaymentEnabled: true,
  loyaltyMinBalance: DEFAULT_LOYALTY_MIN_BALANCE,
  trackingUrlTemplate: "",
};

const TABS = [
  { value: "codes", label: "Discount codes" },
  { value: "gifts", label: "Free gifts" },
  { value: "vouchers", label: "Gift vouchers" },
  { value: "shipping", label: "Delivery & payment" },
  { value: "report", label: "Code usage" },
];

const VOUCHER_TONE = { active: "green", disabled: "neutral", depleted: "ink", redeemed: "ink", expired: "orange" };

const dateInput = (value) => (value ? String(value).slice(0, 10) : "");
const nullableNumber = (value) => (value === "" || value === null || value === undefined ? null : Number(value));
const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path.startsWith("/") ? "" : "/"}${path}`;
};
const dateRange = (from, until) => {
  if (!from && !until) return "Always";
  if (!from) return `Until ${formatDate(until)}`;
  if (!until) return `From ${formatDate(from)}`;
  return `${formatDate(from)} – ${formatDate(until)}`;
};

/** Number input with a fixed suffix like "ден." or "%". */
function SuffixInput({ suffix, className = "", ...props }) {
  return (
    <div className="relative">
      <input type="number" className={`${inputClass} pr-14 ${className}`} {...props} />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>
    </div>
  );
}

export default function AdminPromotions() {
  const confirm = useConfirm();
  const toast = useToast();
  const [tab, setTab] = useState("codes");
  const [codes, setCodes] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [giftVariants, setGiftVariants] = useState([]);
  const [report, setReport] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [shipping, setShipping] = useState(defaultShipping);
  const [loyaltyTierRows, setLoyaltyTierRows] = useState(() => loyaltyTiers(null));
  const [codeForm, setCodeForm] = useState(emptyCode);
  const [giftForm, setGiftForm] = useState(emptyGift);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingGiftId, setEditingGiftId] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [expiryVoucher, setExpiryVoucher] = useState(null);
  const [expiryValue, setExpiryValue] = useState("");
  const [reportDates, setReportDates] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (search = voucherSearch) => {
    try {
      const [codeRows, giftRows, productRows, voucherRows, shippingRows] = await Promise.all([
        api.getAdminPromotionCodes(),
        api.getAdminFreeGifts(),
        api.getProducts(),
        api.getAdminGiftVouchers({ search, pageSize: 200 }),
        api.getShippingSettings(),
      ]);
      setCodes(codeRows || []);
      setGifts(giftRows || []);
      // Categories are only needed for the "Applies to" picker; the page works without them.
      api.getAdminCategories().then((rows) => setCategories(rows || [])).catch(() => {});
      setProducts(productRows || []);
      setVouchers(voucherRows.data || []);
      setShipping({ ...defaultShipping, ...(shippingRows || {}), trackingUrlTemplate: shippingRows?.trackingUrlTemplate || "" });
      setLoyaltyTierRows(loyaltyTiers(shippingRows));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCode = (key, value) => setCodeForm((c) => ({ ...c, [key]: value }));
  const setGift = (key, value) => setGiftForm((c) => ({ ...c, [key]: value }));

  /* ---------- discount codes ---------- */

  const newCode = () => {
    setEditingCodeId(null);
    setCodeForm(emptyCode);
    setCodeOpen(true);
  };

  const editCode = (item) => {
    setEditingCodeId(item.promoCodeId);
    setCodeForm({
      code: item.code || "",
      description: item.description || "",
      discountType: item.discountType || "percentage",
      discountValue: item.discountValue ?? "",
      minimumOrderAmount: item.minimumOrderAmount ?? 0,
      maximumDiscountAmount: item.maximumDiscountAmount ?? "",
      usageLimit: item.usageLimit ?? "",
      perCustomerLimit: item.perCustomerLimit ?? "",
      validFrom: dateInput(item.validFrom),
      validUntil: dateInput(item.validUntil),
      isActive: Boolean(item.isActive),
      ...scopeFromCode(item),
    });
    setCodeOpen(true);
  };

  const saveCode = async (event) => {
    event?.preventDefault();
    if (!codeForm.code.trim() || !(Number(codeForm.discountValue) > 0)) {
      toast.error("Enter a code and a discount greater than 0.");
      return;
    }
    const scopeProblem = scopeError(codeForm);
    if (scopeProblem) {
      toast.error(scopeProblem);
      return;
    }
    setBusy(true);
    try {
      await api.saveAdminPromotionCode(
        {
          ...codeForm,
          discountValue: Number(codeForm.discountValue),
          minimumOrderAmount: Number(codeForm.minimumOrderAmount || 0),
          maximumDiscountAmount: nullableNumber(codeForm.maximumDiscountAmount),
          usageLimit: nullableNumber(codeForm.usageLimit),
          perCustomerLimit: nullableNumber(codeForm.perCustomerLimit),
          validFrom: codeForm.validFrom || null,
          validUntil: codeForm.validUntil || null,
          ...scopePayload(codeForm),
        },
        editingCodeId,
      );
      toast.success(editingCodeId ? "Discount code updated." : `Code ${codeForm.code} is ready to use.`);
      setCodeOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteCode = async (item) => {
    const id = item.promoCodeId;
    if (!id) {
      toast.error("This code could not be identified. Refresh the page and try again.");
      return;
    }
    const ok = await confirm({
      title: `Delete code ${item.code || ""}?`,
      message: "Customers will no longer be able to use it. Past orders keep their discount.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await api.disableAdminPromotionCode(id);
      toast.success(result.message || "Discount code deleted.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  /* ---------- free gifts ---------- */

  const loadGiftVariants = async (productId) => {
    if (!productId) {
      setGiftVariants([]);
      return [];
    }
    const response = await api.getProductVariants(productId);
    const rows = response.data || [];
    setGiftVariants(rows);
    return rows;
  };

  const newGift = () => {
    setEditingGiftId(null);
    setGiftForm(emptyGift);
    setGiftVariants([]);
    setGiftOpen(true);
  };

  const editGift = async (item) => {
    setEditingGiftId(item.freeGiftId);
    setGiftForm({
      productId: item.productId || "",
      variantId: item.variantId || "",
      displayName: item.displayName || "",
      minimumOrderAmount: item.minimumOrderAmount ?? 0,
      validFrom: dateInput(item.validFrom),
      validUntil: dateInput(item.validUntil),
      isActive: Boolean(item.isActive),
    });
    setGiftOpen(true);
    try {
      await loadGiftVariants(item.productId);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const saveGift = async (event) => {
    event?.preventDefault();
    if (!giftForm.productId) {
      toast.error("Choose which product is given away.");
      return;
    }
    setBusy(true);
    try {
      await api.saveAdminFreeGift(
        {
          ...giftForm,
          productId: Number(giftForm.productId),
          variantId: nullableNumber(giftForm.variantId),
          minimumOrderAmount: Number(giftForm.minimumOrderAmount || 0),
          validFrom: giftForm.validFrom || null,
          validUntil: giftForm.validUntil || null,
        },
        editingGiftId,
      );
      toast.success(editingGiftId ? "Free gift updated." : "Free gift added.");
      setGiftOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteGift = async (gift) => {
    const id = gift.freeGiftId;
    if (!id) {
      toast.error("This free gift could not be identified. Refresh the page and try again.");
      return;
    }
    const ok = await confirm({
      title: `Delete “${gift.displayName || gift.productName || "Free gift"}”?`,
      message: "New orders will no longer receive this gift.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const result = await api.disableAdminFreeGift(id);
      toast.success(result.message || "Free gift deleted.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  /* ---------- vouchers ---------- */

  const updateVoucher = async (voucher, status, expiresAt = voucher.expiresAt || null) => {
    setBusy(true);
    try {
      await api.updateAdminGiftVoucher(voucher.giftVoucherId, { status, expiresAt });
      toast.success(`Voucher ${voucher.code} ${status === "active" ? "is active" : "disabled"}.`);
      await load();
      return true;
    } catch (voucherError) {
      toast.error(voucherError.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openExpiry = (voucher) => {
    setExpiryVoucher(voucher);
    setExpiryValue(dateInput(voucher.expiresAt));
  };

  const saveExpiry = async () => {
    const expiresAt = expiryValue ? `${expiryValue}T23:59:59Z` : null;
    const ok = await updateVoucher(expiryVoucher, expiryVoucher.status === "disabled" ? "disabled" : "active", expiresAt);
    if (ok) setExpiryVoucher(null);
  };

  /* ---------- shipping ---------- */

  const saveShipping = async (event) => {
    event?.preventDefault();
    setBusy(true);
    try {
      await api.updateShippingSettings({
        ...shipping,
        flatDeliveryFee: Number(shipping.flatDeliveryFee),
        cashOnDeliveryFee: Number(shipping.cashOnDeliveryFee),
        freeDeliveryThreshold: Number(shipping.freeDeliveryThreshold),
        courierCodThreshold: Number(shipping.courierCodThreshold),
        courierCodFixedFee: Number(shipping.courierCodFixedFee),
        courierCodPercent: Number(shipping.courierCodPercent),
        loyaltyMinBalance: Number(shipping.loyaltyMinBalance),
        trackingUrlTemplate: (shipping.trackingUrlTemplate || "").trim(),
        loyaltyRedeemTiers: loyaltyTierRows
          .filter((t) => t.minOrder !== "" && t.maxPoints !== "")
          .map((t) => ({ minOrder: Number(t.minOrder), maxPoints: Number(t.maxPoints) })),
        redeemTiers: undefined,
      });
      toast.success("Delivery and payment settings saved.");
      await load();
    } catch (shippingError) {
      toast.error(shippingError.message);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- report ---------- */

  const loadReport = async () => {
    setBusy(true);
    try {
      setReport(await api.getPromotionUsageReport(reportDates.from, reportDates.to));
    } catch (reportError) {
      toast.error(reportError.message);
    } finally {
      setBusy(false);
    }
  };

  const pageAction =
    tab === "codes" ? (
      <Button icon={FiPlus} onClick={newCode}>
        New discount code
      </Button>
    ) : tab === "gifts" ? (
      <Button icon={FiPlus} onClick={newGift}>
        New free gift
      </Button>
    ) : null;

  return (
    <AdminPage
      eyebrow="Shop"
      title="Promotions & gifts"
      description="Discount codes, free gifts with orders, gift vouchers and delivery fees — everything that changes what a customer pays."
      actions={pageAction}
    >
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <Segmented
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({
            ...t,
            count: loading ? undefined : t.value === "codes" ? codes.length : t.value === "gifts" ? gifts.length : t.value === "vouchers" ? vouchers.length : undefined,
          }))}
        />
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {loading ? (
        <Card>
          <Loading label="Loading promotions…" />
        </Card>
      ) : (
        <>
          {tab === "codes" && (
            <Card bodyClassName="">
              {codes.length === 0 ? (
                <EmptyState
                  icon={FiPercent}
                  title="No discount codes yet"
                  text="Create a code like SUMMER10 that customers type at checkout."
                  action={<Button icon={FiPlus} onClick={newCode}>New discount code</Button>}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Code</th>
                        <th className={thClass}>Discount</th>
                        <th className={thClass}>Min. order</th>
                        <th className={thClass}>Valid</th>
                        <th className={`${thClass} text-right`}>Used</th>
                        <th className={thClass}>Status</th>
                        <th className={thClass}>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map((item) => (
                        <tr key={item.promoCodeId} className={`${trClass} cursor-pointer`} onClick={() => editCode(item)}>
                          <td className={tdClass}>
                            <span className="rounded-md bg-[#f6f5f1] px-2 py-1 font-mono text-sm font-bold text-gray-900">{item.code}</span>
                            {item.description && <span className="mt-1 block max-w-[220px] truncate text-xs text-gray-500">{item.description}</span>}
                            {item.affiliateName && <Badge tone="blue" className="mt-1">Affiliate: {item.affiliateName}</Badge>}
                            <ScopeBadge code={item} products={products} categories={categories} className="mt-1 block w-fit" />
                          </td>
                          <td className={`${tdClass} font-semibold`}>{item.discountType === "percentage" ? `${item.discountValue}%` : formatMoney(item.discountValue)}</td>
                          <td className={`${tdClass} whitespace-nowrap`}>{Number(item.minimumOrderAmount) ? formatMoney(item.minimumOrderAmount) : "—"}</td>
                          <td className={`${tdClass} whitespace-nowrap text-gray-600`}>{dateRange(item.validFrom, item.validUntil)}</td>
                          <td className={`${tdClass} text-right tabular-nums`}>
                            {item.timesUsed || 0}
                            {item.usageLimit ? <span className="text-gray-400"> / {item.usageLimit}</span> : null}
                          </td>
                          <td className={tdClass}>
                            <VisibilityBadge active={item.isActive} on="Active" off="Off" />
                          </td>
                          <td className={`${tdClass} text-right`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <IconButton icon={FiEdit2} label={`Edit ${item.code}`} onClick={() => editCode(item)} />
                              <IconButton icon={FiTrash2} tone="danger" label={`Delete ${item.code}`} onClick={() => deleteCode(item)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {tab === "gifts" &&
            (gifts.length === 0 ? (
              <Card>
                <EmptyState
                  icon={FiGift}
                  title="No free gifts yet"
                  text="Add a product that is automatically added to orders above a certain amount."
                  action={<Button icon={FiPlus} onClick={newGift}>New free gift</Button>}
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {gifts.map((gift) => (
                  <article key={gift.freeGiftId} className={`flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06] ${gift.isActive ? "" : "opacity-60"}`}>
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#f6f5f1]">
                      {gift.image ? (
                        <img src={imageUrl(gift.image)} alt="" className="h-20 w-20 object-contain" />
                      ) : (
                        <FiGift size={24} className="text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold leading-snug text-gray-900">{gift.displayName || gift.productName || gift.variantName || "Free gift"}</h3>
                        <VisibilityBadge active={gift.isActive} on="Active" off="Off" />
                      </div>
                      {gift.variantName && <p className="text-xs text-gray-500">{gift.variantName}</p>}
                      <p className="mt-1.5 text-sm text-gray-700">
                        For orders from <span className="font-semibold">{formatMoney(gift.minimumOrderAmount || 0)}</span>
                      </p>
                      <p className="text-xs text-gray-500">{dateRange(gift.validFrom, gift.validUntil)}</p>
                      <div className="mt-2 flex justify-end gap-1">
                        <IconButton icon={FiEdit2} label="Edit gift" onClick={() => editGift(gift)} />
                        <IconButton icon={FiTrash2} tone="danger" label="Delete gift" onClick={() => deleteGift(gift)} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}

          {tab === "vouchers" && (
            <div className="space-y-6">
            <VoucherRedeemCard onRedeemed={() => load()} />
            <Card
              title="Issued gift vouchers"
              description="A voucher code is created automatically once a gift-voucher order is paid."
              actions={
                <Button size="sm" variant="secondary" icon={FiDownload} onClick={() => api.downloadGiftVoucherReport()}>
                  Export
                </Button>
              }
              bodyClassName=""
            >
              <form
                className="flex gap-2 border-b border-black/[0.06] px-5 pb-4 sm:px-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  load();
                }}
              >
                <input className={`${inputClass} max-w-sm`} placeholder="Search by code, name or email" value={voucherSearch} onChange={(e) => setVoucherSearch(e.target.value)} />
                <Button type="submit" variant="secondary" icon={FiSearch}>
                  Search
                </Button>
              </form>
              {vouchers.length === 0 ? (
                <EmptyState icon={FiCreditCard} title="No vouchers found" text={voucherSearch ? "Try a different search." : "Vouchers appear here after customers buy them."} />
              ) : (
                <div className="overflow-x-auto">
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Code</th>
                        <th className={`${thClass} text-right`}>Balance</th>
                        <th className={thClass}>Bought by / for</th>
                        <th className={thClass}>Expires</th>
                        <th className={thClass}>Status</th>
                        <th className={`${thClass} text-right`}>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((voucher) => (
                        <tr key={voucher.giftVoucherId} className={trClass}>
                          <td className={`${tdClass} font-mono font-bold`}>{voucher.code}</td>
                          <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                            <span className="font-semibold">{formatMoney(voucher.remainingValue || 0)}</span>
                            <span className="block text-xs text-gray-500">of {formatMoney(voucher.initialValue || 0)}</span>
                          </td>
                          <td className={tdClass}>
                            <span className="block">{[voucher.purchaserName, voucher.purchaserEmail].filter(Boolean).join(" · ") || "—"}</span>
                            {(voucher.recipientName || voucher.recipientEmail) && (
                              <span className="block text-xs text-gray-500">
                                → {[voucher.recipientName, voucher.recipientEmail].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </td>
                          <td className={`${tdClass} whitespace-nowrap`}>{voucher.expiresAt ? formatDate(voucher.expiresAt) : "Never"}</td>
                          <td className={tdClass}>
                            <Badge tone={VOUCHER_TONE[voucher.status] || "neutral"} className="capitalize">
                              {voucher.status}
                            </Badge>
                          </td>
                          <td className={`${tdClass} text-right`}>
                            <div className="flex justify-end gap-1.5">
                              <Button size="sm" variant="ghost" disabled={busy} onClick={() => openExpiry(voucher)}>
                                Change expiry
                              </Button>
                              {voucher.status === "disabled" && (
                                <Button size="sm" variant="secondary" disabled={busy} onClick={() => updateVoucher(voucher, "active")}>
                                  Enable
                                </Button>
                              )}
                              {voucher.status === "active" && (
                                <Button size="sm" variant="dangerSoft" disabled={busy} onClick={() => updateVoucher(voucher, "disabled")}>
                                  Disable
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            </div>
          )}

          {tab === "shipping" && (
            <Card title="Delivery & payment" description="Used both at checkout and when the server calculates order totals.">
              <form onSubmit={saveShipping} className="space-y-6">
                <FormSection title="Delivery fees">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Delivery fee" hint="Charged on every order below the free-delivery amount.">
                      <SuffixInput suffix="ден." required min="0" step="0.01" value={shipping.flatDeliveryFee} onChange={(e) => setShipping({ ...shipping, flatDeliveryFee: e.target.value })} />
                    </Field>
                    <Field label="Free delivery from" hint="Orders at or above this total ship for free.">
                      <SuffixInput suffix="ден." required min="0" step="0.01" value={shipping.freeDeliveryThreshold} onChange={(e) => setShipping({ ...shipping, freeDeliveryThreshold: e.target.value })} />
                    </Field>
                    <Field label="Cash-on-delivery fee" hint="Extra charge when paying the courier in cash.">
                      <SuffixInput suffix="ден." required min="0" step="0.01" value={shipping.cashOnDeliveryFee} onChange={(e) => setShipping({ ...shipping, cashOnDeliveryFee: e.target.value })} />
                    </Field>
                  </div>
                </FormSection>
                <FormSection title="Courier commission (откупнина)">
                  <p className="-mt-1 mb-3 text-xs text-gray-500">
                    Charged by the courier directly to the buyer on cash-on-delivery orders, on top of our total. Only shown as a note at checkout, on the order page and in the confirmation email.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Fixed fee up to" hint="Orders up to this amount pay the fixed fee.">
                      <SuffixInput suffix="ден." required min="0" step="0.01" value={shipping.courierCodThreshold} onChange={(e) => setShipping({ ...shipping, courierCodThreshold: e.target.value })} />
                    </Field>
                    <Field label="Fixed fee" hint="Commission for orders up to that amount.">
                      <SuffixInput suffix="ден." required min="0" step="0.01" value={shipping.courierCodFixedFee} onChange={(e) => setShipping({ ...shipping, courierCodFixedFee: e.target.value })} />
                    </Field>
                    <Field label="Percentage above" hint="Share of the order amount above that amount.">
                      <SuffixInput suffix="%" required min="0" max="100" step="0.01" value={shipping.courierCodPercent} onChange={(e) => setShipping({ ...shipping, courierCodPercent: e.target.value })} />
                    </Field>
                  </div>
                </FormSection>
                <FormSection title="Tracking link">
                  <p className="-mt-1 mb-3 text-xs text-gray-500">
                    The courier page where customers follow their package. Write {"{number}"} where the tracking number goes; when an order is marked as shipped the link is filled in from the tracking number.
                  </p>
                  <Field label="Tracking link template" hint="Leave empty to type the link by hand on each order.">
                    <input
                      className={inputClass}
                      type="text"
                      inputMode="url"
                      placeholder="https://courier.mk/track?number={number}"
                      value={shipping.trackingUrlTemplate}
                      onChange={(e) => setShipping({ ...shipping, trackingUrlTemplate: e.target.value })}
                    />
                  </Field>
                </FormSection>
                <FormSection title="Loyalty points">
                  <p className="-mt-1 mb-3 text-xs text-gray-500">
                    1 point = 1 ден. Only signed-in customers collect points; they are added when an order is confirmed or paid. The order value (after the discount code) decides how many points can be used, never more than half the order.
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Minimum balance" hint="Points a customer needs before any can be used.">
                      <SuffixInput suffix="points" required min="0" step="1" value={shipping.loyaltyMinBalance} onChange={(e) => setShipping({ ...shipping, loyaltyMinBalance: e.target.value })} />
                    </Field>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Points usable per order</p>
                    {loyaltyTierRows.length === 0 && (
                      <Notice tone="warning">With no tiers, customers can't use their points.</Notice>
                    )}
                    {loyaltyTierRows.map((tier, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-3">
                        <Field label={index === 0 ? "Order from" : undefined}>
                          <SuffixInput suffix="ден." required min="0" step="1" value={tier.minOrder}
                            onChange={(e) => setLoyaltyTierRows((rows) => rows.map((r, i) => (i === index ? { ...r, minOrder: e.target.value } : r)))} />
                        </Field>
                        <Field label={index === 0 ? "Up to" : undefined}>
                          <SuffixInput suffix="points" required min="1" step="1" value={tier.maxPoints}
                            onChange={(e) => setLoyaltyTierRows((rows) => rows.map((r, i) => (i === index ? { ...r, maxPoints: e.target.value } : r)))} />
                        </Field>
                        <IconButton icon={FiTrash2} tone="danger" label="Remove tier"
                          onClick={() => setLoyaltyTierRows((rows) => rows.filter((_, i) => i !== index))} />
                      </div>
                    ))}
                    <Button size="sm" variant="secondary" icon={FiPlus} disabled={loyaltyTierRows.length >= 10}
                      onClick={() => setLoyaltyTierRows((rows) => [...rows, { minOrder: "", maxPoints: "" }])}>
                      Add tier
                    </Button>
                    <p className="text-xs text-gray-500">
                      Orders below the lowest tier can't use points. Example: from 3000 ден. up to 300 points.
                    </p>
                  </div>
                </FormSection>
                <FormSection title="Payment options">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Toggle
                      checked={shipping.cardPaymentEnabled}
                      onChange={(v) => setShipping({ ...shipping, cardPaymentEnabled: v })}
                      label="Card payment"
                      description="Customers can pay online with a card."
                    />
                    <Toggle
                      checked={shipping.homeDeliveryEnabled}
                      onChange={(v) => setShipping({ ...shipping, homeDeliveryEnabled: v })}
                      label="Cash on delivery"
                      description="Customers can pay the courier on delivery."
                    />
                  </div>
                  {!shipping.cardPaymentEnabled && !shipping.homeDeliveryEnabled && (
                    <Notice tone="warning" className="mt-3">
                      With both options off, customers can't complete checkout.
                    </Notice>
                  )}
                </FormSection>
                <div className="flex justify-end">
                  <Button type="submit" icon={FiTruck} loading={busy}>
                    Save settings
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {tab === "report" && (
            <Card title="Code usage" description="Which discount codes were used, on which orders, and how much they saved." bodyClassName="">
              <div className="flex flex-wrap items-end gap-3 border-b border-black/[0.06] px-5 pb-4 sm:px-6">
                <Field label="From">
                  <input type="date" className={inputClass} value={reportDates.from} onChange={(e) => setReportDates({ ...reportDates, from: e.target.value })} />
                </Field>
                <Field label="To">
                  <input type="date" className={inputClass} value={reportDates.to} onChange={(e) => setReportDates({ ...reportDates, to: e.target.value })} />
                </Field>
                <Button icon={FiBarChart2} onClick={loadReport} loading={busy}>
                  Show usage
                </Button>
                <Button variant="secondary" icon={FiDownload} onClick={() => api.downloadPromotionUsageReport(reportDates.from, reportDates.to)}>
                  Export
                </Button>
              </div>
              {report === null ? (
                <EmptyState icon={FiBarChart2} title="Pick a date range" text="Leave the dates empty to see all-time usage." />
              ) : report.length === 0 ? (
                <EmptyState icon={FiBarChart2} title="No codes used" text="No discount codes were used in this period." />
              ) : (
                <div className="overflow-x-auto">
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th className={thClass}>Code</th>
                        <th className={thClass}>Order</th>
                        <th className={thClass}>Customer</th>
                        <th className={`${thClass} text-right`}>Discount</th>
                        <th className={thClass}>Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.map((row, index) => (
                        <tr key={`${row.orderNumber}-${index}`} className={trClass}>
                          <td className={`${tdClass} font-mono font-bold`}>{row.code}</td>
                          <td className={`${tdClass} tabular-nums`}>#{row.orderNumber}</td>
                          <td className={tdClass}>{row.customerEmail}</td>
                          <td className={`${tdClass} whitespace-nowrap text-right font-semibold tabular-nums`}>{formatMoney(row.discountAmount)}</td>
                          <td className={`${tdClass} whitespace-nowrap text-gray-600`}>{formatDateTime(row.usedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* discount code form */}
      <Modal
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        size="lg"
        title={editingCodeId ? `Edit ${codeForm.code || "code"}` : "New discount code"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCodeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCode} loading={busy}>
              {editingCodeId ? "Save changes" : "Create code"}
            </Button>
          </>
        }
      >
        <form onSubmit={saveCode} className="space-y-6">
          <FormSection title="The code">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code" required hint="What customers type at checkout.">
                <input data-autofocus className={`${inputClass} font-mono uppercase`} placeholder="SUMMER10" value={codeForm.code} onChange={(e) => setCode("code", e.target.value.toUpperCase())} />
              </Field>
              <Field label="Internal note" hint="Only visible to admins.">
                <input className={inputClass} placeholder="Instagram summer campaign" value={codeForm.description} onChange={(e) => setCode("description", e.target.value)} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Discount">
            <div className="space-y-4">
              <Segmented
                value={codeForm.discountType}
                onChange={(v) => setCode("discountType", v)}
                options={[
                  { value: "percentage", label: "Percent off" },
                  { value: "fixed", label: "Fixed amount off" },
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Discount" required>
                  <SuffixInput suffix={codeForm.discountType === "percentage" ? "%" : "ден."} min="0.01" step="0.01" value={codeForm.discountValue} onChange={(e) => setCode("discountValue", e.target.value)} />
                </Field>
                <Field label="Minimum order" hint="0 = any order.">
                  <SuffixInput suffix="ден." min="0" step="0.01" value={codeForm.minimumOrderAmount} onChange={(e) => setCode("minimumOrderAmount", e.target.value)} />
                </Field>
                {codeForm.discountType === "percentage" && (
                  <Field label="Max. discount" hint="Optional cap.">
                    <SuffixInput suffix="ден." min="0" step="0.01" value={codeForm.maximumDiscountAmount} onChange={(e) => setCode("maximumDiscountAmount", e.target.value)} />
                  </Field>
                )}
              </div>
            </div>
          </FormSection>
          <FormSection title="Applies to" description="Which products the discount is taken off. The minimum order still counts the whole cart.">
            <PromoScopeFields
              value={codeForm}
              onChange={(scope) => setCodeForm((c) => ({ ...c, ...scope }))}
              products={products}
              categories={categories}
            />
          </FormSection>
          <FormSection title="Limits" description="Leave empty for no limit.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Total uses">
                <input type="number" min="1" className={inputClass} value={codeForm.usageLimit} onChange={(e) => setCode("usageLimit", e.target.value)} />
              </Field>
              <Field label="Uses per customer">
                <input type="number" min="1" className={inputClass} value={codeForm.perCustomerLimit} onChange={(e) => setCode("perCustomerLimit", e.target.value)} />
              </Field>
              <Field label="Starts">
                <input type="date" className={inputClass} value={codeForm.validFrom} onChange={(e) => setCode("validFrom", e.target.value)} />
              </Field>
              <Field label="Ends">
                <input type="date" className={inputClass} value={codeForm.validUntil} onChange={(e) => setCode("validUntil", e.target.value)} />
              </Field>
            </div>
          </FormSection>
          <Toggle checked={codeForm.isActive} onChange={(v) => setCode("isActive", v)} label="Active" description="Turn off to pause the code without deleting it." />
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      {/* free gift form */}
      <Modal
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        size="md"
        title={editingGiftId ? "Edit free gift" : "New free gift"}
        description="Automatically added to every order above the minimum amount."
        footer={
          <>
            <Button variant="secondary" onClick={() => setGiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGift} loading={busy}>
              {editingGiftId ? "Save changes" : "Add gift"}
            </Button>
          </>
        }
      >
        <form onSubmit={saveGift} className="space-y-4">
          <Field label="Product" required>
            <select
              className={selectClass}
              value={giftForm.productId}
              onChange={async (e) => {
                const productId = e.target.value;
                setGiftForm((c) => ({ ...c, productId, variantId: "" }));
                try {
                  await loadGiftVariants(productId);
                } catch (err) {
                  toast.error(err.message);
                }
              }}
            >
              <option value="">Choose a product…</option>
              {products.map((product) => (
                <option key={product.product_Id} value={product.product_Id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>
          {giftVariants.length > 0 && (
            <Field label="Flavour / package" hint="Optional. Leave empty to let the shop pick.">
              <select className={selectClass} value={giftForm.variantId} onChange={(e) => setGift("variantId", e.target.value)}>
                <option value="">Any</option>
                {giftVariants.map((variant) => (
                  <option key={variant.variant_Id} value={variant.variant_Id}>
                    {variant.flavor_Name || variant.variant_Name || "Variant"}
                    {variant.packaging_Name ? ` · ${variant.packaging_Name}` : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Name shown to customers" hint="Optional. Defaults to the product name.">
            <input className={inputClass} value={giftForm.displayName} onChange={(e) => setGift("displayName", e.target.value)} />
          </Field>
          <Field label="For orders from">
            <SuffixInput suffix="ден." min="0" step="0.01" value={giftForm.minimumOrderAmount} onChange={(e) => setGift("minimumOrderAmount", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts">
              <input type="date" className={inputClass} value={giftForm.validFrom} onChange={(e) => setGift("validFrom", e.target.value)} />
            </Field>
            <Field label="Ends">
              <input type="date" className={inputClass} value={giftForm.validUntil} onChange={(e) => setGift("validUntil", e.target.value)} />
            </Field>
          </div>
          <Toggle checked={giftForm.isActive} onChange={(v) => setGift("isActive", v)} label="Active" />
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      {/* voucher expiry */}
      <Modal
        open={Boolean(expiryVoucher)}
        onClose={() => setExpiryVoucher(null)}
        size="sm"
        title={`Expiry for ${expiryVoucher?.code || ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setExpiryVoucher(null)}>
              Cancel
            </Button>
            <Button onClick={saveExpiry} loading={busy}>
              Save
            </Button>
          </>
        }
      >
        <Field label="Expires on" hint="Clear the date for a voucher that never expires.">
          <div className="flex gap-2">
            <input type="date" className={inputClass} value={expiryValue} onChange={(e) => setExpiryValue(e.target.value)} />
            {expiryValue && (
              <Button variant="ghost" onClick={() => setExpiryValue("")}>
                Clear
              </Button>
            )}
          </div>
        </Field>
      </Modal>
    </AdminPage>
  );
}
