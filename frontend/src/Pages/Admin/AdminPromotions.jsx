import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

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
  homeDeliveryEnabled: true,
  cardPaymentEnabled: true,
};

const dateInput = (value) => (value ? String(value).slice(0, 10) : "");
const nullableNumber = (value) =>
  value === "" || value === null || value === undefined ? null : Number(value);
const imageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `https://proteini.mk${path.startsWith("/") ? "" : "/"}${path}`;
};
const scrollToForm = (id) => {
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

export default function AdminPromotions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("codes");
  const [codes, setCodes] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [products, setProducts] = useState([]);
  const [giftVariants, setGiftVariants] = useState([]);
  const [report, setReport] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [shipping, setShipping] = useState(defaultShipping);
  const [codeForm, setCodeForm] = useState(emptyCode);
  const [giftForm, setGiftForm] = useState(emptyGift);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingGiftId, setEditingGiftId] = useState(null);
  const [reportDates, setReportDates] = useState({ from: "", to: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const [codeRows, giftRows, productRows, voucherRows, shippingRows] = await Promise.all([
        api.getAdminPromotionCodes(),
        api.getAdminFreeGifts(),
        api.getProducts(),
        api.getAdminGiftVouchers({ search: voucherSearch, pageSize: 200 }),
        api.getShippingSettings(),
      ]);
      setCodes(codeRows || []);
      setGifts(giftRows || []);
      setProducts(productRows || []);
      setVouchers(voucherRows.data || []);
      setShipping({ ...defaultShipping, ...(shippingRows || {}) });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
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
        },
        editingCodeId,
      );
      setMessage(editingCodeId ? "Promotion updated." : "Promotion created.");
      setCodeForm(emptyCode);
      setEditingCodeId(null);
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveGift = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
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
      setMessage(editingGiftId ? "Free gift updated." : "Free gift created.");
      setGiftForm(emptyGift);
      setGiftVariants([]);
      setEditingGiftId(null);
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const editCode = (item) => {
    setMessage("");
    setError("");
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
    });
    scrollToForm("promotion-code-form");
  };

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

  const editGift = async (item) => {
    setMessage("");
    setError("");
    setEditingGiftId(item.freeGiftId);
    await loadGiftVariants(item.productId);
    setGiftForm({
      productId: item.productId || "",
      variantId: item.variantId || "",
      displayName: item.displayName || "",
      minimumOrderAmount: item.minimumOrderAmount ?? 0,
      validFrom: dateInput(item.validFrom),
      validUntil: dateInput(item.validUntil),
      isActive: Boolean(item.isActive),
    });
    scrollToForm("free-gift-form");
  };

  const loadReport = async () => {
    setBusy(true);
    try {
      setReport(
        await api.getPromotionUsageReport(reportDates.from, reportDates.to),
      );
    } catch (reportError) {
      setError(reportError.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteCode = async (item) => {
    const id = item.promoCodeId;
    if (!id) {
      setError("This promotion could not be identified. Refresh the page and try again.");
      return;
    }
    if (!window.confirm(`Delete promotion code "${item.code || "this code"}"?`)) return;

    setBusy(true);
    setError("");
    try {
      const result = await api.disableAdminPromotionCode(id);
      setMessage(result.message || "Promotion code deleted.");
      if (editingCodeId === id) {
        setEditingCodeId(null);
        setCodeForm(emptyCode);
      }
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteGift = async (gift) => {
    const id = gift.freeGiftId;
    if (!id) {
      setError("This free gift could not be identified. Refresh the page and try again.");
      return;
    }
    if (!window.confirm(`Delete free gift "${gift.displayName || gift.productName || "Free gift"}"?`)) return;

    setBusy(true);
    setError("");
    try {
      const result = await api.disableAdminFreeGift(id);
      setMessage(result.message || "Free gift deleted.");
      if (editingGiftId === id) {
        setEditingGiftId(null);
        setGiftForm(emptyGift);
        setGiftVariants([]);
      }
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateVoucher = async (voucher, status, expiresAt = voucher.expiresAt || null) => {
    setBusy(true);
    setError("");
    try {
      await api.updateAdminGiftVoucher(voucher.giftVoucherId, {
        status,
        expiresAt,
      });
      setMessage(`Gift voucher ${status === "active" ? "enabled" : "disabled"}.`);
      await load();
    } catch (voucherError) {
      setError(voucherError.message);
    } finally {
      setBusy(false);
    }
  };

  const editVoucherExpiry = async (voucher) => {
    const value = window.prompt(
      "Expiry date (YYYY-MM-DD). Leave empty for no expiry:",
      dateInput(voucher.expiresAt),
    );
    if (value === null) return;
    const expiresAt = value.trim() ? `${value.trim()}T23:59:59Z` : null;
    await updateVoucher(
      voucher,
      voucher.status === "disabled" ? "disabled" : "active",
      expiresAt,
    );
  };

  const saveShipping = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.updateShippingSettings({
        ...shipping,
        flatDeliveryFee: Number(shipping.flatDeliveryFee),
        cashOnDeliveryFee: Number(shipping.cashOnDeliveryFee),
        freeDeliveryThreshold: Number(shipping.freeDeliveryThreshold),
      });
      setMessage("Delivery and payment settings updated.");
      await load();
    } catch (shippingError) {
      setError(shippingError.message);
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    "w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#2096D8]";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Promotions and free gifts
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create codes, choose gifts, and export code usage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin-panel")}
            className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
          >
            Back to products
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["codes", "Promotion codes"],
            ["gifts", "Free gifts"],
            ["vouchers", "Gift vouchers"],
            ["shipping", "Delivery settings"],
            ["report", "Usage report"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-semibold ${tab === key ? "bg-[#FDC700] text-black" : "bg-white text-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {message && <p className="mb-4 bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-4 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {tab === "codes" && (
          <>
            <form id="promotion-code-form" onSubmit={saveCode} className="mb-8 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">
                {editingCodeId ? "Edit promotion code" : "New promotion code"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <input required className={fieldClass} placeholder="Code" value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} />
                <select className={fieldClass} value={codeForm.discountType} onChange={(e) => setCodeForm({ ...codeForm, discountType: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed MKD</option>
                </select>
                <input required min="0.01" step="0.01" type="number" className={fieldClass} placeholder="Discount value" value={codeForm.discountValue} onChange={(e) => setCodeForm({ ...codeForm, discountValue: e.target.value })} />
                <input min="0" step="0.01" type="number" className={fieldClass} placeholder="Minimum order MKD" value={codeForm.minimumOrderAmount} onChange={(e) => setCodeForm({ ...codeForm, minimumOrderAmount: e.target.value })} />
                <input min="0" step="0.01" type="number" className={fieldClass} placeholder="Maximum discount MKD" value={codeForm.maximumDiscountAmount} onChange={(e) => setCodeForm({ ...codeForm, maximumDiscountAmount: e.target.value })} />
                <input min="1" type="number" className={fieldClass} placeholder="Total usage limit" value={codeForm.usageLimit} onChange={(e) => setCodeForm({ ...codeForm, usageLimit: e.target.value })} />
                <input min="1" type="number" className={fieldClass} placeholder="Per-customer limit" value={codeForm.perCustomerLimit} onChange={(e) => setCodeForm({ ...codeForm, perCustomerLimit: e.target.value })} />
                <input className={fieldClass} placeholder="Description" value={codeForm.description} onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })} />
                <label className="text-xs text-gray-600">Starts<input type="date" className={`${fieldClass} mt-1`} value={codeForm.validFrom} onChange={(e) => setCodeForm({ ...codeForm, validFrom: e.target.value })} /></label>
                <label className="text-xs text-gray-600">Ends<input type="date" className={`${fieldClass} mt-1`} value={codeForm.validUntil} onChange={(e) => setCodeForm({ ...codeForm, validUntil: e.target.value })} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={codeForm.isActive} onChange={(e) => setCodeForm({ ...codeForm, isActive: e.target.checked })} /> Active</label>
              </div>
              <div className="mt-4 flex gap-2">
                <button disabled={busy} className="bg-[#2096D8] px-5 py-2 font-semibold text-white">Save code</button>
                {editingCodeId && <button type="button" onClick={() => { setEditingCodeId(null); setCodeForm(emptyCode); }} className="border px-5 py-2">Cancel</button>}
              </div>
            </form>
            <div className="overflow-x-auto bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Minimum</th><th className="p-3">Dates</th><th className="p-3">Used</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                <tbody>{codes.map((item) => <tr key={item.promoCodeId} className="border-t"><td className="p-3 font-bold">{item.code}</td><td className="p-3">{item.discountType === "percentage" ? `${item.discountValue}%` : `MKD ${Number(item.discountValue).toFixed(2)}`}</td><td className="p-3">MKD {Number(item.minimumOrderAmount || 0).toFixed(2)}</td><td className="p-3">{dateInput(item.validFrom) || "Any"} – {dateInput(item.validUntil) || "Any"}</td><td className="p-3">{item.timesUsed || 0}</td><td className="p-3">{item.isActive ? "Active" : "Inactive"}</td><td className="p-3"><button type="button" onClick={() => editCode(item)} className="mr-3 text-blue-600">Edit</button><button type="button" disabled={busy} onClick={() => deleteCode(item)} className="text-red-600 disabled:opacity-50">Delete</button></td></tr>)}</tbody>
              </table>
            </div>
          </>
        )}

        {tab === "gifts" && (
          <>
            <form id="free-gift-form" onSubmit={saveGift} className="mb-8 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">{editingGiftId ? "Edit free gift" : "New free gift"}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <select required className={fieldClass} value={giftForm.productId} onChange={async (e) => { const productId = e.target.value; setGiftForm({ ...giftForm, productId, variantId: "" }); await loadGiftVariants(productId); }}><option value="">Choose product</option>{products.map((product) => <option key={product.product_Id} value={product.product_Id}>{product.name}</option>)}</select>
                {giftVariants.length > 0 && <select className={fieldClass} value={giftForm.variantId} onChange={(e) => setGiftForm({ ...giftForm, variantId: e.target.value })}><option value="">Choose a package / variant</option>{giftVariants.map((variant) => <option key={variant.variant_Id} value={variant.variant_Id}>{variant.flavor_Name || variant.variant_Name || "Variant"}{variant.packaging_Name ? ` · ${variant.packaging_Name}` : ""}</option>)}</select>}
                <input className={fieldClass} placeholder="Display name (optional)" value={giftForm.displayName} onChange={(e) => setGiftForm({ ...giftForm, displayName: e.target.value })} />
                <input min="0" step="0.01" type="number" className={fieldClass} placeholder="Minimum order MKD" value={giftForm.minimumOrderAmount} onChange={(e) => setGiftForm({ ...giftForm, minimumOrderAmount: e.target.value })} />
                <label className="text-xs text-gray-600">Starts<input type="date" className={`${fieldClass} mt-1`} value={giftForm.validFrom} onChange={(e) => setGiftForm({ ...giftForm, validFrom: e.target.value })} /></label>
                <label className="text-xs text-gray-600">Ends<input type="date" className={`${fieldClass} mt-1`} value={giftForm.validUntil} onChange={(e) => setGiftForm({ ...giftForm, validUntil: e.target.value })} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={giftForm.isActive} onChange={(e) => setGiftForm({ ...giftForm, isActive: e.target.checked })} /> Active</label>
              </div>
              <div className="mt-4 flex gap-2"><button disabled={busy} className="bg-[#2096D8] px-5 py-2 font-semibold text-white">Save gift</button>{editingGiftId && <button type="button" onClick={() => { setEditingGiftId(null); setGiftForm(emptyGift); setGiftVariants([]); }} className="border px-5 py-2">Cancel</button>}</div>
            </form>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{gifts.map((gift) => <article key={gift.freeGiftId} className="flex gap-4 bg-white p-4 shadow-sm">{gift.image && <img src={imageUrl(gift.image)} alt={gift.displayName || gift.productName || "Free gift"} className="h-24 w-24 object-contain" />}<div className="min-w-0 flex-1"><h3 className="font-bold">{gift.displayName || gift.productName || gift.variantName || "Free gift"}</h3>{gift.variantName && <p className="text-xs text-gray-500">{gift.variantName}</p>}<p className="text-sm text-gray-600">From MKD {Number(gift.minimumOrderAmount || 0).toFixed(2)}</p><p className="text-xs text-gray-500">{gift.isActive ? "Active" : "Inactive"}</p><div className="mt-3"><button type="button" onClick={() => editGift(gift)} className="mr-3 text-sm text-blue-600">Edit</button><button type="button" disabled={busy} onClick={() => deleteGift(gift)} className="text-sm text-red-600 disabled:opacity-50">Delete</button></div></div></article>)}</div>
          </>
        )}

        {tab === "vouchers" && (
          <section className="bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Issued gift vouchers</h2>
                <p className="text-sm text-gray-600">Codes are generated only after a voucher-product order is paid.</p>
              </div>
              <div className="flex gap-2">
                <input className={fieldClass} placeholder="Code or email" value={voucherSearch} onChange={(e) => setVoucherSearch(e.target.value)} />
                <button type="button" onClick={load} className="border px-4 py-2 text-sm font-semibold">Search</button>
                <button type="button" onClick={() => api.downloadGiftVoucherReport()} className="bg-[#FDC700] px-4 py-2 text-sm font-semibold">Export CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100"><tr><th className="p-3">Code</th><th className="p-3">Value</th><th className="p-3">Remaining</th><th className="p-3">Buyer / recipient</th><th className="p-3">Expires</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                <tbody>{vouchers.map((voucher) => <tr key={voucher.giftVoucherId} className="border-t"><td className="p-3 font-mono font-bold">{voucher.code}</td><td className="p-3">MKD {Number(voucher.initialValue || 0).toFixed(2)}</td><td className="p-3">MKD {Number(voucher.remainingValue || 0).toFixed(2)}</td><td className="p-3"><div>{voucher.purchaserEmail || "-"}</div><div className="text-xs text-gray-500">{voucher.recipientEmail || ""}</div></td><td className="p-3">{dateInput(voucher.expiresAt) || "No expiry"}</td><td className="p-3 uppercase">{voucher.status}</td><td className="p-3"><button disabled={busy} onClick={() => editVoucherExpiry(voucher)} className="mr-3 text-blue-600">Expiry</button>{voucher.status === "disabled" ? <button disabled={busy} onClick={() => updateVoucher(voucher, "active")} className="text-green-700">Enable</button> : voucher.status === "active" ? <button disabled={busy} onClick={() => updateVoucher(voucher, "disabled")} className="text-red-600">Disable</button> : ""}</td></tr>)}</tbody>
              </table>
              {vouchers.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No issued gift vouchers found.</p>}
            </div>
          </section>
        )}

        {tab === "shipping" && (
          <form onSubmit={saveShipping} className="bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-bold">Delivery and payment settings</h2>
            <p className="mb-5 text-sm text-gray-600">These values control both checkout display and server-side order totals.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-xs text-gray-600">Flat delivery fee (MKD)<input required min="0" step="0.01" type="number" className={`${fieldClass} mt-1`} value={shipping.flatDeliveryFee} onChange={(e) => setShipping({ ...shipping, flatDeliveryFee: e.target.value })} /></label>
              <label className="text-xs text-gray-600">Cash-on-delivery fee (MKD)<input required min="0" step="0.01" type="number" className={`${fieldClass} mt-1`} value={shipping.cashOnDeliveryFee} onChange={(e) => setShipping({ ...shipping, cashOnDeliveryFee: e.target.value })} /></label>
              <label className="text-xs text-gray-600">Free delivery from (MKD)<input required min="0" step="0.01" type="number" className={`${fieldClass} mt-1`} value={shipping.freeDeliveryThreshold} onChange={(e) => setShipping({ ...shipping, freeDeliveryThreshold: e.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shipping.cardPaymentEnabled} onChange={(e) => setShipping({ ...shipping, cardPaymentEnabled: e.target.checked })} /> Card payment enabled</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shipping.homeDeliveryEnabled} onChange={(e) => setShipping({ ...shipping, homeDeliveryEnabled: e.target.checked })} /> Cash on delivery enabled</label>
            </div>
            <button disabled={busy} className="mt-5 bg-[#2096D8] px-5 py-2 font-semibold text-white disabled:opacity-50">Save settings</button>
          </form>
        )}

        {tab === "report" && (
          <section className="bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-end gap-3"><label className="text-xs text-gray-600">From<input type="date" className={`${fieldClass} mt-1`} value={reportDates.from} onChange={(e) => setReportDates({ ...reportDates, from: e.target.value })} /></label><label className="text-xs text-gray-600">To<input type="date" className={`${fieldClass} mt-1`} value={reportDates.to} onChange={(e) => setReportDates({ ...reportDates, to: e.target.value })} /></label><button onClick={loadReport} className="bg-[#2096D8] px-5 py-2 font-semibold text-white">Load report</button><button onClick={() => api.downloadPromotionUsageReport(reportDates.from, reportDates.to)} className="bg-[#FDC700] px-5 py-2 font-semibold text-black">Export CSV</button></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr><th className="p-3">Code</th><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Discount</th><th className="p-3">Used</th></tr></thead><tbody>{report.map((row, index) => <tr key={`${row.orderNumber}-${index}`} className="border-t"><td className="p-3 font-bold">{row.code}</td><td className="p-3">{row.orderNumber}</td><td className="p-3">{row.customerEmail}</td><td className="p-3">MKD {Number(row.discountAmount).toFixed(2)}</td><td className="p-3">{new Date(row.usedAt).toLocaleString()}</td></tr>)}</tbody></table>{report.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Load a date range to view usage.</p>}</div>
          </section>
        )}
      </div>
    </main>
  );
}
