import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { brandMatches, groupBrandsByLetter } from "./headerNav";

/* ------------------------------------------------------------------ brands */

/**
 * Searchable brand list, shared by the desktop panel and the mobile menu.
 *  variant "desktop": search on top, brands flow in columns under small letter labels.
 *  variant "mobile":  search on top, one brand per row.
 */
export function BrandDirectory({ brands, translate, variant = "desktop" }) {
  const [query, setQuery] = useState("");
  const isMobile = variant === "mobile";

  const filtered = useMemo(
    () => (query.trim() ? brands.filter((b) => brandMatches(b.label, query)) : brands),
    [brands, query],
  );
  const groups = useMemo(() => groupBrandsByLetter(filtered), [filtered]);

  const search = (
    <div className={`relative ${isMobile ? "" : "max-w-[320px]"}`}>
      <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={translate("headerBrandsSearch")}
        aria-label={translate("headerBrandsSearch")}
        className="h-10 w-full rounded-full border border-black/[0.1] bg-white pl-10 pr-9 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#141409] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label={translate("close")}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-gray-900"
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  );

  const empty = (
    <p className="py-6 text-sm text-gray-500">
      {translate("headerNoBrands")} „{query.trim()}“
    </p>
  );

  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="px-4 pb-3 pt-4">{search}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
          {groups.length === 0
            ? empty
            : groups.map(({ letter, brands: list }, index) => (
                <section key={letter} className="menu-fade-up pt-3" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
                  <p className="text-[12px] font-bold text-gray-400">{letter}</p>
                  <ul>
                    {list.map((brand) => (
                      <li key={brand.link}>
                        <Link to={brand.link} className="flex min-h-[44px] items-center border-b border-black/[0.05] text-[15px] text-gray-800 transition active:translate-x-1 active:text-gray-500">
                          {brand.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {search}
      <div className="mt-5 max-h-[min(52vh,420px)] overflow-y-auto pr-2">
        {groups.length === 0 ? (
          empty
        ) : (
          <div key={query.trim()} className="menu-fade-up gap-x-8" style={{ columnCount: 5 }}>
            {groups.map(({ letter, brands: list }) => (
              <section key={letter} className="mb-4 break-inside-avoid">
                <p className="mb-1 text-[12px] font-bold text-gray-400">{letter}</p>
                <ul className="space-y-1">
                  {list.map((brand) => (
                    <li key={brand.link}>
                      <Link to={brand.link} className="inline-block text-[13px] text-gray-700 transition hover:translate-x-0.5 hover:text-gray-900 hover:underline active:scale-[0.97]">
                        {brand.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ offers */

/** Plain list of offer links, with today's landing-page offer first. */
export function OfferList({ items, translate, variant = "desktop" }) {
  const all = [
    { key: "today", label: translate("todaysOffer"), description: translate("todaysOfferDesc"), link: "/landing", highlight: true },
    ...items,
  ];

  if (variant === "mobile") {
    return (
      <ul className="menu-stagger px-4 pt-2">
        {all.map((item, index) => (
          <li key={item.key} style={{ "--i": index }}>
            <Link
              to={item.link}
              className="flex min-h-[60px] items-center justify-between gap-3 border-b border-black/[0.05] py-2 transition active:translate-x-1 active:opacity-60"
            >
              <span className="min-w-0">
                <span className={`block text-[15px] font-semibold ${item.highlight ? "text-[#BF243E]" : "text-gray-900"}`}>
                  {item.label}
                </span>
                {item.description && <span className="mt-0.5 block truncate text-[13px] text-gray-500">{item.description}</span>}
              </span>
              <FiChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-300" />
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="menu-stagger grid grid-cols-3 gap-x-10 gap-y-5">
      {all.map((item, index) => (
        <li key={item.key} style={{ "--i": index }}>
          <Link to={item.link} className="group block transition active:scale-[0.98]">
            <span
              className={`inline-flex items-center gap-1.5 text-[14px] font-bold group-hover:underline ${
                item.highlight ? "text-[#BF243E]" : "text-gray-900"
              }`}
            >
              {item.label}
              <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
            {item.description && <span className="mt-0.5 block text-[13px] text-gray-500">{item.description}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------- mobile menu */

const SEGMENTS = ["products", "brands", "offers"];

/**
 * Mobile menu with Products | Brands | Offers tabs.
 * Product categories drill down in place; brands and offers are one tap away.
 */
export function MobileMenu({
  segment,
  onSegmentChange,
  categories,
  brands,
  offers,
  translate,
  onClose,
  account,
  footer,
}) {
  const [category, setCategory] = useState(null);
  // Which way the drill-down content slides in: "forward" into a category, "back" out of it.
  const [direction, setDirection] = useState("forward");
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 200);
  };

  const openCategory = (item) => {
    setDirection("forward");
    setCategory(item);
  };

  const closeCategory = () => {
    setDirection("back");
    setCategory(null);
  };

  const labels = {
    products: translate("headerShop"),
    brands: translate("brands"),
    offers: translate("offers"),
  };

  const changeSegment = (next) => {
    if (next === segment) return;
    setDirection("forward");
    setCategory(null);
    onSegmentChange(next);
  };

  const segmentIndex = Math.max(0, SEGMENTS.indexOf(segment));
  const slide = direction === "back" ? "menu-from-left" : "menu-from-right";
  const row =
    "group flex min-h-[48px] w-full items-center justify-between gap-3 border-b border-black/[0.05] text-left text-[15px] transition active:bg-black/[0.03] active:pl-1";

  return (
    <div className="fixed inset-x-0 top-0 bottom-[var(--bottom-nav-h,0px)] z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={translate("menu")}>
      <div
        className={`absolute inset-0 bg-[#141409]/40 ${closing ? "menu-backdrop-out" : "menu-backdrop-in"}`}
        onClick={requestClose}
      />
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden bg-white sm:right-auto sm:w-[400px] ${
          closing ? "menu-sheet-out" : "menu-sheet-in"
        }`}
        onClick={(event) => {
          // Close when any link is followed (also when it points to the current page).
          if (event.target.closest("a")) requestClose();
        }}
      >
        {/* tabs */}
        <div className="flex items-stretch border-b border-black/[0.08] pl-2 pr-1">
          <div role="tablist" aria-label={translate("menu")} className="relative flex flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-1/3 px-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(${segmentIndex * 100}%)` }}
            >
              <span className="block h-full rounded-full bg-[#FDC700]" />
            </span>
            {SEGMENTS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={segment === key}
                onClick={() => changeSegment(key)}
                className={`min-h-[52px] flex-1 truncate px-2 text-[14px] font-bold transition-colors active:scale-95 ${
                  segment === key ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {labels[key]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={translate("close")}
            className="flex w-12 shrink-0 items-center justify-center text-gray-700 transition active:rotate-90 active:scale-90"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {segment === "brands" ? (
            <div key="brands" className="menu-fade-up h-full">
              <BrandDirectory brands={brands} translate={translate} variant="mobile" />
            </div>
          ) : segment === "offers" ? (
            <div key="offers" className="h-full overflow-y-auto pb-8">
              <OfferList items={offers} translate={translate} variant="mobile" />
            </div>
          ) : category ? (
            <div key={`category-${category.key}`} className={`${slide} h-full overflow-y-auto px-4 pb-8 pt-2`}>
              <button
                type="button"
                onClick={closeCategory}
                className="group -ml-1 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-gray-500 transition active:text-gray-900"
              >
                <FiChevronLeft size={17} className="transition-transform group-active:-translate-x-1" />
                {translate("back")}
              </button>
              <div className="flex items-baseline justify-between gap-3 pb-2">
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                <Link to={category.link} className="shrink-0 text-sm font-bold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4">
                  {translate("viewAll")}
                </Link>
              </div>
              <div className="menu-stagger">
              {category.columns.flat().map((group, index) => (
                <div key={group.link || group.label} style={{ "--i": index }} className="border-b border-black/[0.05] py-3">
                  <Link to={group.link} className="block py-1 text-[15px] font-bold text-gray-900 transition active:translate-x-1">
                    {group.label}
                  </Link>
                  {group.subItems?.length > 0 && (
                    <ul>
                      {group.subItems.map((sub) => (
                        <li key={sub.link}>
                          <Link to={sub.link} className="block py-1.5 text-[14px] text-gray-600 transition active:translate-x-1 active:text-gray-900">
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div key="products" className={`${direction === "back" ? slide : ""} h-full overflow-y-auto pb-6`}>
              {account}
              <ul className="menu-stagger px-4 pt-1">
                {categories.map((item, index) => (
                  <li key={item.key} style={{ "--i": index }}>
                    <button type="button" onClick={() => openCategory(item)} className={`${row} font-semibold text-gray-900`}>
                      {item.title}
                      <FiChevronRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-active:translate-x-1"
                      />
                    </button>
                  </li>
                ))}
                <li style={{ "--i": categories.length }}>
                  <Link to="/all-products" className={`${row} font-bold text-gray-900`}>
                    {translate("allProducts")}
                    <FiArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </Link>
                </li>
              </ul>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
