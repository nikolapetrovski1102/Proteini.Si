import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiRotateCcw } from "react-icons/fi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { formatDate } from "../ProfilePages/profileFormat";
import HomeSection from "./sections/HomeSection";
import HomeProductCard, { productHref } from "./HomeProductCard";
import HomeProductRail from "./HomeProductRail";
import Reveal from "./sections/Reveal";
import Scribble from "../Components/Scribble";

const MAX_SIMILAR = 8;

const inStock = (p) => p.isGiftVoucher || Number(p.quantity) > 0;

// The shop filter returns one row per packaging; keep one per product, preferring a packaging that is in stock.
const bestRowPerProduct = (rows = []) => {
  const byId = new Map();
  rows.forEach((row) => {
    const current = byId.get(row.product_Id);
    if (!current || (!inStock(current) && inStock(row))) byId.set(row.product_Id, row);
  });
  return byId;
};

/*
 * Ids, groups and order come from usp_Product_GetForCustomer (latest real orders, categories, goals, paired
 * categories, brands, bought-together); the cards' data from the shop filter, like the shop grid.
 */
async function loadPersonalisedRows() {
  const rows = await api.getCustomerRecommendations(MAX_SIMILAR);
  const anchorRow = rows.find((row) => row.reason === "anchor");
  if (!anchorRow) return null;

  const data = await api.getFilteredProducts({ productIds: rows.map((row) => row.product_Id), pageSize: 100 });
  const byId = bestRowPerProduct(data?.products);
  const pick = (reason) =>
    rows
      .filter((row) => row.reason === reason)
      .map((row) => byId.get(row.product_Id))
      .filter(Boolean);

  const anchor = byId.get(anchorRow.product_Id);
  if (!anchor) return null;

  return {
    anchor,
    anchorDate: anchorRow.orderedAt,
    reorder: pick("reorder"),
    similar: pick("similar"),
  };
}

export default function BecauseYouOrdered() {
  const { translate, language } = useLanguage();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const [rows, setRows] = useState(null);
  const [favorites, setFavorites] = useState(() => new Set());
  const isAuthenticated = api.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    loadPersonalisedRows()
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch((err) => console.error("Because you ordered:", err));
    // One request for the whole list instead of a check per card.
    api.getFavorites().then((response) => {
      if (cancelled || !response?.success) return;
      setFavorites(new Set((response.data || []).map((fav) => fav.productId)));
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !rows) return null;

  const handleToggleFavorite = async (productId, event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const response = await api.toggleFavorite(productId);
      if (!response.success) return;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const { anchor, anchorDate, reorder, similar } = rows;
  const nameOf = (p) =>
    (language === "al" && p.nameAl) ||
    (language === "en" && p.nameEn) ||
    p.name;
  const cards = [
    ...reorder.map((p) => ({ p, tag: translate("orderAgain") })),
    ...similar.map((p) => ({ p, tag: null })),
  ];

  return (
    <HomeSection
      id="because-you-ordered"
      tint="bg-[#141409]"
      image="/img/gym-11.jpg"
      imageOpacity={0.35}
      blur={3}
      overlay="bg-gradient-to-b from-[#141409]/70 via-[#141409]/80 to-[#141409]"
      className="home-tint-keep py-12 sm:py-20"
      reveal={false}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
        <Reveal className="mb-5 sm:mb-8">
          <span className="inline-block font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white sm:text-[15px]">
            <Scribble>{translate("pickedForYou")}</Scribble>
          </span>
          <h2 className="mt-3 font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-white [text-wrap:balance] sm:text-5xl">
            {translate("becauseYouOrdered")}
          </h2>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          <Reveal variant="left" className="lg:pt-[34px]">
            <LastOrderCard
              product={anchor}
              name={nameOf(anchor)}
              date={formatDate(anchorDate, language)}
              translate={translate}
              onReorder={() => quickPurchase(anchor)}
              onReorderIntent={() => prefetchQuickPurchase(anchor)}
            />
          </Reveal>

          {cards.length > 0 && (
            <div className="min-w-0">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-white/60 sm:mb-2">
                {translate("youMayAlsoLike")}
              </p>
              <HomeProductRail label="recommended products" controls="bottom" tone="dark">
                {cards.map(({ p, tag }) => (
                  <HomeProductCard
                    key={p.product_Id}
                    product={p}
                    tag={tag}
                    large
                    showStock
                    language={language}
                    onQuickPurchase={() => quickPurchase(p)}
                    onQuickPurchaseIntent={() => prefetchQuickPurchase(p)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.has(p.product_Id)}
                    translate={translate}
                  />
                ))}
              </HomeProductRail>
            </div>
          )}
        </div>
      </div>

      {quickPurchaseSheet}
    </HomeSection>
  );
}

/*
 * The product the recommendations are based on: photo, when it was ordered and a one-tap
 * reorder. A horizontal strip on phones, a tall card beside the rail on desktop.
 */
function LastOrderCard({ product, name, date, translate, onReorder, onReorderIntent }) {
  const soldOut = !inStock(product);
  const href = productHref(product);

  return (
    <article className="flex gap-4 overflow-hidden rounded-2xl bg-[#FDC700] p-3 text-[#141409] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] sm:p-4 lg:flex-col lg:p-5">
      <Link
        to={href}
        className="group relative block aspect-square w-[112px] flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#f8f7f4] to-[#efede7] sm:w-[140px] lg:aspect-[5/4] lg:w-full"
      >
        {product.img ? (
          <img
            src={String(product.img)}
            alt={name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 lg:p-5 ${
              soldOut ? "opacity-45 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">{translate("noImage")}</div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#141409]">
          {translate("yourLastOrder")}
        </span>
        {date && <span className="mt-0.5 text-[12px] font-semibold text-[#141409]/60">{date}</span>}
        <Link
          to={href}
          className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-5 hover:underline sm:text-[17px] sm:leading-6"
        >
          {name}
        </Link>
        {(product.brandName || product.category) && (
          <span className="mt-1 truncate text-[12px] text-[#141409]/65">{product.brandName || product.category}</span>
        )}

        <div className="mt-auto pt-3 lg:pt-4">
          {soldOut ? (
            <span className="flex w-full items-center justify-center rounded-lg bg-[#141409]/10 py-2.5 text-[13px] font-bold text-[#141409]/70">
              {translate("outOfStock")}
            </span>
          ) : (
            <button
              type="button"
              onClick={onReorder}
              onPointerEnter={onReorderIntent}
              onPointerDown={onReorderIntent}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#141409] py-2.5 text-[13px] font-bold text-white transition hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FiRotateCcw size={15} className="text-[#FDC700]" />
              {translate("orderAgain")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
