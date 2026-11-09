import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { isSaleActive } from "../../utils/salePricing";
import HomeSection from "./sections/HomeSection";
import Reveal from "./sections/Reveal";

const MAX_ORDERS_SCANNED = 3;
const MAX_REORDER = 4;
const MAX_SIMILAR = 8;

const productIdOf = (p) => p?.product_Id ?? p?.Product_Id ?? p?.id;

// Collapse a variant row onto its parent product so we recommend the product page, not one flavour.
const baseProductId = (product) =>
  product?.isVariant && product?.parent_Product_Id ? product.parent_Product_Id : productIdOf(product);

async function loadPersonalisedRows() {
  const history = await api.getOrderHistory();
  const orders = (history?.orders || [])
    .filter((o) => (o.Order_Status || "").toLowerCase() !== "cancelled")
    .sort((a, b) => new Date(b.Order_Date) - new Date(a.Order_Date))
    .slice(0, MAX_ORDERS_SCANNED);
  if (orders.length === 0) return null;

  const [confirmations, products] = await Promise.all([
    Promise.all(orders.map((o) => api.getOrderConfirmation(o.Order_Id).catch(() => null))),
    api.getProducts(),
  ]);

  const byId = new Map(products.map((p) => [productIdOf(p), p]));

  // Ordered product ids, most recent first, de-duplicated and mapped to parent products.
  const orderedIds = [];
  for (const confirmation of confirmations) {
    for (const item of confirmation?.items || []) {
      const product = byId.get(item.Product_Id);
      const id = product ? baseProductId(product) : item.Product_Id;
      if (id != null && !orderedIds.includes(id)) orderedIds.push(id);
    }
  }

  const ordered = orderedIds.map((id) => byId.get(id)).filter((p) => p && !p.isGiftVoucher);
  if (ordered.length === 0) return null;

  const orderedSet = new Set(orderedIds);
  const categories = new Set(ordered.map((p) => p.category).filter(Boolean));
  const brands = new Set(ordered.map((p) => p.brandName).filter(Boolean));

  const similar = products
    .filter((p) => !p.isVariant && !p.isGiftVoucher && !orderedSet.has(productIdOf(p)))
    .map((p) => ({
      p,
      score: (categories.has(p.category) ? 2 : 0) + (brands.has(p.brandName) ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SIMILAR)
    .map((x) => x.p);

  return { anchor: ordered[0], reorder: ordered.slice(0, MAX_REORDER), similar };
}

export default function BecauseYouOrdered() {
  const { translate, language } = useLanguage();
  const [rows, setRows] = useState(null);
  const scrollRef = useRef(null);
  const isAuthenticated = api.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    loadPersonalisedRows()
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch((err) => console.error("Because you ordered:", err));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !rows) return null;

  const nameOf = (p) => (language === "al" && p.nameAl ? p.nameAl : p.name);
  const items = [
    ...rows.reorder.map((p) => ({ p, kind: "reorder" })),
    ...rows.similar.map((p) => ({ p, kind: "similar" })),
  ];

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <HomeSection
      id="because-you-ordered"
      tint="bg-gradient-to-br from-[#e8f4fb] via-[#f4f9fc] to-white"
      image="/img/gym-11.jpg"
      imageOpacity={0.12}
      blur={6}
      overlay="bg-gradient-to-b from-transparent via-white/30 to-white/80"
      className="py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full bg-[#2096D8]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2096D8]">
              {translate("pickedForYou")}
            </span>
            <h2 className="font-display font-bold uppercase tracking-tight text-[28px] leading-[0.95] sm:text-5xl">
              {translate("becauseYouOrdered")}{" "}
              <span className="text-[#2096D8]">{nameOf(rows.anchor)}</span>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scroll(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white transition hover:border-black"
            >
              <img src="/logos/left-arrow.svg" alt="" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scroll(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white transition hover:border-black"
            >
              <img src="/logos/right-arrow.svg" alt="" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map(({ p, kind }, i) => (
            <Reveal key={`${kind}-${productIdOf(p)}`} delay={Math.min(i, 6) * 70} className="snap-start">
              <PersonalCard product={p} kind={kind} name={nameOf(p)} translate={translate} />
            </Reveal>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}

function PersonalCard({ product, kind, name, translate }) {
  const price = Number(product.price) || 0;
  const salePrice = isSaleActive(product) ? Number(product.compare_Price) || 0 : 0;
  const onSale = salePrice > 0 && salePrice < price;

  return (
    <Link
      to={`/product/${productIdOf(product)}`}
      onClick={() => window.scrollTo(0, 0)}
      className="group flex w-[170px] flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[260px]"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.img ? (
          <img
            src={product.img}
            alt={name}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            kind === "reorder" ? "bg-[#FDC700] text-black" : "bg-[#2096D8] text-white"
          }`}
        >
          {translate(kind === "reorder" ? "orderAgain" : "youMayAlsoLike")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] uppercase tracking-wide text-gray-500">{product.category || ""}</span>
        <span className="mt-1 line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-5 sm:text-[15px]">
          {name}
        </span>
        <div className="mt-auto pt-3">
          {onSale ? (
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-red-600">MKD {salePrice.toFixed(2)}</span>
              <span className="text-xs text-gray-400 line-through">{price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-bold">MKD {price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
