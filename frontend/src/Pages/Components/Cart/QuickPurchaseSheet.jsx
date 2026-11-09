// Sheet for picking packaging / flavour / quantity of a product with variants.
// Opened through useQuickPurchase() (Pages/Hooks/useQuickPurchase.jsx).
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { useLanguage } from "../../translation/LanguageContext";
import { isSaleActive } from "../../../utils/salePricing";
import { effectivePrice, loadDetails, parentIdOf } from "./quickPurchaseData";
import {
  getCartWeightGrams,
  getVariantWeightGrams,
} from "../../../utils/variantWeight";

const CLOSE_MS = 260; // keep in sync with .qp-sheet transitions in index.css
const formatMkd = (value) => `MKD ${(Number(value) || 0).toFixed(2)}`;

const isAvailable = (variant) => Boolean(variant?.isActive && variant.quantity > 0);

const pickInitialVariant = (variants, preferredId) =>
  variants.find((v) => v.variant_Id === preferredId && isAvailable(v)) ||
  variants.find((v) => v.isDefault && isAvailable(v)) ||
  variants.find(isAvailable) ||
  variants.find((v) => v.variant_Id === preferredId) ||
  variants[0] ||
  null;

export default function QuickPurchaseSheet({ product, onClose, addToCart }) {
  const { translate, language } = useLanguage();
  const [shown, setShown] = useState(null); // kept while the close animation runs
  const [visible, setVisible] = useState(false);

  // Render the newly opened product right away; the effect only drives the animation.
  if (product && product !== shown) setShown(product);

  useEffect(() => {
    if (product) {
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const hide = setTimeout(() => setVisible(false), 0);
    const unmount = setTimeout(() => setShown(null), CLOSE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(unmount);
    };
  }, [product]);

  // Esc closes, the page behind does not scroll.
  useEffect(() => {
    if (!product) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (!shown) return null;

  return (
    <div
      className={`qp-sheet fixed inset-0 z-[70] ${visible ? "is-visible" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label={translate("quickPurchase")}
    >
      <div className="qp-backdrop absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="qp-panel absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none">
        <div className="mx-auto mt-2.5 h-1.5 w-10 flex-shrink-0 rounded-full bg-gray-200 sm:hidden" />
        <SheetBody
          key={`${parentIdOf(shown)}-${shown.variant_Id || "base"}`}
          product={shown}
          language={language}
          translate={translate}
          onClose={onClose}
          addToCart={addToCart}
        />
      </div>
    </div>
  );
}

function SheetBody({ product, language, translate, onClose, addToCart }) {
  const parentId = parentIdOf(product);
  const [details, setDetails] = useState(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    loadDetails(parentId)
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        const initial = pickInitialVariant(data?.variants || [], product.variant_Id);
        setSelectedId(initial?.variant_Id ?? null);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [parentId, product.variant_Id]);

  const base = details?.product;
  const variants = useMemo(() => details?.variants || [], [details]);
  const selected = variants.find((v) => v.variant_Id === selectedId) || null;
  const saleActive = isSaleActive(base || product);

  const packagings = useMemo(() => {
    const byName = new Map();
    variants.forEach((v) => {
      const entry = byName.get(v.packaging_Name) || {
        name: v.packaging_Name,
        weight: getVariantWeightGrams(v),
        available: false,
      };
      entry.available ||= isAvailable(v);
      byName.set(v.packaging_Name, entry);
    });
    return [...byName.values()].sort((a, b) => a.weight - b.weight);
  }, [variants]);

  const flavors = variants.filter(
    (v) => v.packaging_Name === selected?.packaging_Name && String(v.flavor_Name || "").trim(),
  );

  const choosePackaging = (name) => {
    const inPackage = variants.filter((v) => v.packaging_Name === name);
    const next =
      inPackage.find((v) => v.flavor_Name === selected?.flavor_Name && isAvailable(v)) ||
      inPackage.find(isAvailable) ||
      inPackage[0];
    if (next) {
      setSelectedId(next.variant_Id);
      setQuantity(1);
    }
  };

  const name = (language === "al" && (base?.nameAl || product.nameAl)) || base?.name || product.name;
  const image = selected?.variant_Image_Path || base?.img || product.img;
  const unitPrice = selected ? effectivePrice(selected, saleActive) : effectivePrice(base || product, saleActive);
  const regularPrice = Number(selected?.price ?? base?.price ?? product.price) || 0;
  const stock = selected ? selected.quantity || 0 : base?.quantity || 0;
  const canAdd = Boolean(details) && (variants.length === 0 || isAvailable(selected)) && stock > 0;
  const productLink = selected
    ? `/product/${parentId}?variant=${selected.variant_Id}`
    : `/product/${parentId}`;

  const add = () => {
    if (!canAdd) return;
    let cartName = base?.name || product.name;
    if (selected?.flavor_Name) cartName += ` - ${selected.flavor_Name}`;
    if (selected?.packaging_Name) cartName += ` (${selected.packaging_Name})`;

    // Close first: the fly-to-cart animation and the toast confirm the add.
    onClose();
    addToCart(base?.product_Id || parentId, quantity, {
      name: cartName,
      img: image,
      price: unitPrice,
      variant_Id: selected?.variant_Id || null,
      variant_Name: selected?.flavor_Name || null,
      variant_Packaging: selected?.packaging_Name || null,
      variant_Weight_Grams: getCartWeightGrams(selected),
      weight_Grams: getCartWeightGrams(selected),
      loyaltyPercentage: selected?.loyaltyPercentage ?? base?.loyaltyPercentage,
    });
  };

  const chip = (active, disabled) =>
    `rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
      active
        ? "border-[#141409] bg-[#141409] text-white"
        : disabled
          ? "border-gray-200 text-gray-300 line-through"
          : "border-gray-300 text-gray-800 hover:border-[#141409]"
    }`;

  return (
    <>
      <div className="flex items-start gap-4 border-b border-gray-100 px-5 pb-4 pt-4 sm:px-7 sm:pt-8">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#f8f7f4] to-[#efede7] sm:h-24 sm:w-24">
          {image && (
            <img src={image} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 sm:text-base">{name}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className={`text-lg font-extrabold ${unitPrice < regularPrice ? "text-[#E3262F]" : "text-gray-900"}`}>
              {formatMkd(unitPrice * quantity)}
            </span>
            {unitPrice < regularPrice && (
              <span className="text-xs text-gray-400 line-through">{formatMkd(regularPrice * quantity)}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={translate("close")}
          className="-mr-2 -mt-1 flex-shrink-0 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
        {failed ? (
          <p className="text-sm text-gray-600">{translate("addToCartFailed")}</p>
        ) : !details ? (
          <div className="space-y-4" aria-busy="true">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {packagings.length > 1 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-500">{translate("packaging")}</p>
                <div className="flex flex-wrap gap-2">
                  {packagings.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      disabled={!p.available}
                      onClick={() => choosePackaging(p.name)}
                      className={chip(selected?.packaging_Name === p.name, !p.available)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flavors.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-500">{translate("flavor")}</p>
                <div className="flex flex-wrap gap-2">
                  {flavors.map((v) => (
                    <button
                      key={v.variant_Id}
                      type="button"
                      disabled={!isAvailable(v)}
                      onClick={() => {
                        setSelectedId(v.variant_Id);
                        setQuantity(1);
                      }}
                      className={chip(v.variant_Id === selectedId, !isAvailable(v))}
                    >
                      {v.flavor_Name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-500">{translate("quantity")}</p>
              <div className="inline-flex items-center rounded-full border border-gray-300">
                <button
                  type="button"
                  aria-label="-"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-11 items-center justify-center text-lg text-gray-700 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  aria-label="+"
                  disabled={quantity >= stock}
                  onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                  className="flex h-10 w-11 items-center justify-center text-lg text-gray-700 disabled:opacity-30"
                >
                  +
                </button>
              </div>
              {details && stock <= 0 && (
                <p className="mt-2 text-xs font-semibold text-[#b3233b]">{translate("outOfStock")}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-gray-100 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 sm:px-7 sm:pb-7">
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FDC700] py-3.5 text-[15px] font-bold text-[#141409] transition active:scale-[0.98] enabled:hover:bg-[#f0bc00] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiShoppingBag size={17} />
          {details && stock <= 0 ? translate("outOfStock") : translate("addToCart")}
        </button>
        <Link
          to={productLink}
          onClick={() => {
            onClose();
            window.scrollTo(0, 0);
          }}
          className="block w-full py-1.5 text-center text-[13px] font-semibold text-gray-500 transition hover:text-gray-900"
        >
          {translate("viewArticle")} →
        </Link>
      </div>
    </>
  );
}
