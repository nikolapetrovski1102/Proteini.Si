import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import { isSaleActive } from "../../utils/salePricing";
import { productHref } from "./HomeProductCard";
import { useInView } from "./sections/useInView";
import DrawnWave from "./sections/DrawnWave";
import { useCutoutImage } from "./sections/useCutoutImage";
import Scribble from "../Components/Scribble";
import Price from "../Components/Price";

const DEFAULT_COUNT = 3;

/** First `count` distinct products (the filter returns one row per packaging). */
const pickDistinct = (rows = [], count) => {
  const seen = new Set();
  return rows
    .filter((row) => !seen.has(row.product_Id) && seen.add(row.product_Id))
    .slice(0, count);
};

// What each admin source fetches, the sticker on its cards and where "show all" goes.
const SOURCES = {
  new: { filter: "newProducts", sortBy: "createdAt", title: "newInTheShop", sticker: "new" },
  bestsellers: { filter: "bestSellers", sortBy: "soldCount", title: "bestSellers", sticker: "bestSeller" },
  sale: { filter: "onSale", sortBy: "createdAt", title: "showcaseSaleTitle", sticker: "showcaseSaleSticker" },
  manual: { filter: null, title: "newInTheShop", sticker: "showcaseFeaturedSticker" },
};

// Over-fetch so packagings of the same product still leave enough distinct cards.
const fetchShowcase = (filter, sortBy, count) =>
  api
    .getFilteredProducts({ [filter]: true, inStock: true, sortBy, sortOrder: "DESC", pageSize: Math.max(24, count * 8) })
    .then((data) => pickDistinct(data.products, count));

// Hand-picked products, in the order the admin set.
const fetchPicked = async (productIds, count) => {
  const ids = productIds.slice(0, count);
  if (ids.length === 0) return [];
  const data = await api.getFilteredProducts({ productIds: ids, pageSize: 100 });
  const byId = new Map();
  (data.products || []).forEach((row) => byId.has(row.product_Id) || byId.set(row.product_Id, row));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

const loadShowcaseSettings = () => api.getHomeShowcase().catch(() => null);

/*
 * Showcase card for the three newest products (or the three best sellers when nothing is new). Follows the home page card rules:
 * rounded-2xl tile with HomeProductCard's warm gradient (50% opacity, 80% on hover, so the section shows through), the
 * black/yellow "new" sticker, left-aligned brand · name · price, and the yellow bar that
 * grows along the bottom on hover (as in ChooseYourGoal). No buttons — the whole card links.
 * Desktop: 3-column grid. Below md: swipeable row, two cards wide with the third peeking in.
 */
function FeaturedNewCard({ product, index, visible, translate, language, sticker }) {
  const saleActive = isSaleActive(product);
  const regularPrice = Number(product.price) || 0;
  const salePrice = saleActive ? Number(product.compare_Price) || 0 : 0;
  const hasDiscount = salePrice > 0 && salePrice < regularPrice;
  const name =
    (language === "al" && product.nameAl) ||
    (language === "en" && product.nameEn) ||
    product.name;
  const label = product.brandName || product.category || "Proteini.si";
  // White photo backgrounds are cut away so the product hides the ribbon; until then (or if
  // that fails) the photo keeps multiply, which melts the white into the tile.
  const photo = useCutoutImage(product.img ? String(product.img) : null);

  return (
    <article
      className={`nis-card w-[44%] max-w-[340px] flex-shrink-0 snap-start md:w-auto md:max-w-none ${visible ? "is-visible" : ""}`}
      style={{ "--i": index }}
    >
      <Link
        to={productHref(product)}
        className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] focus-visible:ring-offset-4"
      >
        {/* Tile */}
        <div className="nis-tile relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-black/[0.05]">
          {/* Background on its own layer so its opacity can ease from 50% to 80% on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#f8f7f4] to-[#efede7] opacity-50 transition-opacity duration-500 ease-out group-hover:opacity-80"
          />
          <div className="nis-img-wrap absolute inset-0 z-[2]">
            <span aria-hidden="true" className="nis-floor" />
            {product.img ? (
              <img
                src={photo.src}
                alt={name}
                loading="lazy"
                decoding="async"
                className={`nis-img h-full w-full object-contain p-[14%] ${photo.cutout ? "nis-img--cutout" : ""}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                {translate("noImage")}
              </div>
            )}
          </div>

          <span className="absolute left-3 top-3 z-[3] -rotate-3 rounded-md bg-[#141409] px-2 py-1 font-display text-[12px] font-semibold uppercase leading-none tracking-wide text-[#FDC700] sm:left-4 sm:top-4 sm:text-[13px]">
            {sticker}
          </span>

          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[3] h-1 origin-left scale-x-0 bg-[#FDC700] transition-transform duration-500 ease-out group-hover:scale-x-100" />
        </div>

        {/* Info */}
        <div className="nis-info pt-3 sm:pt-4">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</span>
          <h3 className="mt-1 line-clamp-2 min-h-[38px] text-[14px] font-bold leading-[19px] text-gray-900 sm:min-h-[44px] sm:text-[16px] sm:leading-[22px]">
            {name}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <>
                <span className="whitespace-nowrap text-[17px] font-extrabold text-[#E3262F] sm:text-xl"><Price value={salePrice} /></span>
                <span className="whitespace-nowrap text-xs text-gray-400 line-through sm:text-sm"><Price value={regularPrice} /></span>
              </>
            ) : (
              <span className="whitespace-nowrap text-[17px] font-extrabold text-gray-900 sm:text-xl"><Price value={regularPrice} /></span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function NewInTheShop() {
  const [products, setProducts] = useState([]);
  // Source shown: the admin's choice, or "bestsellers" when that comes back empty.
  const [mode, setMode] = useState("new");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { translate, language } = useLanguage();
  // On a wrapper that is always rendered: useInView attaches its observer once on mount,
  // so it must not point at markup that only appears after loading.
  const [rowRef, rowInView] = useInView({ threshold: 0.25 });
  const titleRef = useRef(null);
  // The title peeks in under the hero on load; the cards and the ribbon start on the first scroll.
  // Phones always wait for that scroll (part of the section already shows under the banner);
  // desktop also starts when the section is on screen, for tall screens that show it on load.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 0);
  const [isPhone] = useState(() => window.innerWidth < 1024);
  const rowVisible = isPhone ? scrolled : rowInView || scrolled;

  useEffect(() => {
    if (scrolled) return;
    const onScroll = () => {
      if (window.scrollY > 0) setScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrolled]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const showcase = await loadShowcaseSettings();
        if (showcase && showcase.is_Active === false) {
          if (!cancelled) setProducts([]);
          return;
        }
        const count = Math.min(Math.max(Number(showcase?.item_Count) || DEFAULT_COUNT, 1), 12);
        let nextMode = SOURCES[showcase?.source] ? showcase.source : "new";
        let picked =
          nextMode === "manual"
            ? await fetchPicked(showcase.productIds || [], count)
            : await fetchShowcase(SOURCES[nextMode].filter, SOURCES[nextMode].sortBy, count);
        if (picked.length === 0 && nextMode !== "bestsellers") {
          picked = await fetchShowcase("bestSellers", "soldCount", count);
          nextMode = "bestsellers";
        }
        if (cancelled) return;
        setSettings(showcase);
        setProducts(picked);
        setMode(nextMode);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!cancelled) setError("Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Publishes how much of this section must show under the hero for its title to be fully in
  // view (--home-peek); the mobile hero sizes itself to leave exactly that much room.
  useEffect(() => {
    const title = titleRef.current;
    const section = rowRef.current?.closest("section.home-section");
    if (!title || !section) return;
    const root = document.documentElement;
    const measure = () => {
      let top = 0;
      let node = title;
      while (node && node !== section) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      if (node !== section) return;
      root.style.setProperty("--home-peek", `${Math.ceil(top + title.offsetHeight + 14)}px`);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(title);
    return () => {
      observer?.disconnect();
      root.style.removeProperty("--home-peek");
    };
  }, [loading, products.length, rowRef]);

  const handleShowAll = () => {
    window.scrollTo(0, 0);
    const filter = SOURCES[mode]?.filter;
    navigate("/all-products", filter ? { state: { preSelectedFilter: filter, filterValue: true } } : undefined);
  };

  // The admin's own title applies to the source they chose, not to the best-sellers fallback.
  const customTitle =
    settings && mode === (settings.source || "new")
      ? (language === "al" ? settings.title_Al : language === "en" ? null : settings.title_Mk) || (language === "en" ? null : settings.title_Mk)
      : null;
  const title = customTitle || translate(SOURCES[mode].title);

  let content = null;
  if (loading) {
    content = (
      <div className="w-full flex justify-center items-center px-[25px]" style={{ height: "400px" }}>
        <LargeLoader />
      </div>
    );
  } else if (error) {
    content = (
      <div className="w-full flex justify-center pt-12 px-[25px] max-sm:px-4">
        <div className="w-full max-w-[1240px] text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  } else if (products.length > 0) {
    content = (
      <section className="relative w-full flex justify-center px-[25px] pt-5 pb-4 max-sm:px-4 sm:py-12">
        <DrawnWave active={rowVisible} />
        <div className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="nis-head is-visible mb-4 flex items-end justify-between gap-4 sm:mb-7">
            <h2 ref={titleRef} className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-gray-900 [text-wrap:balance] sm:text-5xl">
              {title}
            </h2>
            <button
              type="button"
              onClick={handleShowAll}
              className="group flex flex-shrink-0 items-center gap-1.5 pb-2 text-[12px] font-bold text-gray-800 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
            >
              <Scribble>{translate("showAll")}</Scribble>
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div
            aria-label={title}
            className={`nis-row -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 lg:gap-6 ${
              products.length % 4 === 0 ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            {products.map((product, index) => (
              <FeaturedNewCard
                key={product.product_Id}
                product={product}
                index={index}
                visible={rowVisible}
                translate={translate}
                language={language}
                sticker={translate(SOURCES[mode].sticker)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return <div ref={rowRef}>{content}</div>;
}
