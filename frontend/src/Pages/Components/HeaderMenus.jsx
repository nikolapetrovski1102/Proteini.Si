import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { brandMatches, groupBrandsByLetter } from "./headerNav";
import { FlameIcon, GridIcon } from "./ShopIcons";
import { iconForLink } from "./shopIconMap";

/** A large free-standing shop icon (no background). */
function ShopIcon({ icon: Icon, size = "md" }) {
  if (!Icon) return null;
  return <Icon className={`shrink-0 text-gray-900 ${size === "lg" ? "h-9 w-9" : "h-8 w-8"}`} />;
}

/* ------------------------------------------------------------------ brands */

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk";
const imageUrl = (path) => (!path ? null : /^https?:/.test(path) ? path : `${IMAGE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Photo tile for one featured brand (picked in the admin). */
function FeaturedBrandTile({ brand, index, compact = false }) {
  const photo = imageUrl(brand.image);
  const logo = imageUrl(brand.logo);
  const picture = photo || logo;
  // The picture is shown as uploaded: whole (not cropped), on white so transparent PNGs keep their look, and
  // with nothing drawn over it. The name sits underneath.
  return (
    <Link
      to={brand.link}
      style={{ "--i": index }}
      className="group block overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.08] transition hover:ring-black/20 active:scale-[0.98]"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-white">
        {picture && (
          <img
            src={picture}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${photo ? "" : "p-4"}`}
          />
        )}
      </span>
      <span className="flex items-center justify-between gap-2 border-t border-black/[0.06] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2">
          {photo && logo && logo !== photo && (
            <img src={logo} alt="" loading="lazy" className="h-5 w-5 shrink-0 object-contain" />
          )}
          <span className={`truncate font-bold text-gray-900 ${compact ? "text-[13px]" : "text-[14px]"}`}>{brand.label}</span>
        </span>
        <FiArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 -translate-x-1 text-gray-900 opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
    </Link>
  );
}

/** Two-by-two grid of the featured brands. */
export function FeaturedBrands({ brands, translate, compact = false }) {
  if (!brands?.length) return null;
  return (
    <section aria-label={translate("headerTopBrands")}>
      <p className="mb-2 text-[12px] font-bold text-gray-400">{translate("headerTopBrands")}</p>
      <div className={`menu-stagger grid grid-cols-2 ${compact ? "gap-2" : "gap-3"}`}>
        {brands.map((brand, index) => (
          <FeaturedBrandTile key={brand.link} brand={brand} index={index} compact={compact} />
        ))}
      </div>
    </section>
  );
}

/** Desktop Brands menu: featured brand photos on the left, the searchable A–Z list on the right. */
export function BrandsPanel({ featured, brands, translate }) {
  if (!featured?.length) return <BrandDirectory brands={brands} translate={translate} />;
  return (
    <div className="grid grid-cols-[minmax(0,400px)_1fr] gap-10">
      <div className="border-r border-black/[0.06] pr-8">
        <FeaturedBrands brands={featured} translate={translate} />
      </div>
      <BrandDirectory brands={brands} translate={translate} columns={3} />
    </div>
  );
}

/**
 * Searchable brand list, shared by the desktop panel and the mobile menu.
 *  variant "desktop": search on top, brands flow in columns under small letter labels.
 *  variant "mobile":  search on top, one brand per row.
 */
export function BrandDirectory({ brands, translate, variant = "desktop", columns = 5, header = null }) {
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
          {header && !query.trim() && <div className="pb-2 pt-1">{header}</div>}
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
          <div key={query.trim()} className="menu-fade-up gap-x-8" style={{ columnCount: columns }}>
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
    {
      key: "today",
      label: translate("todaysOffer"),
      description: translate("todaysOfferDesc"),
      link: "/landing",
      icon: FlameIcon,
      highlight: true,
    },
    ...items,
  ];

  if (variant === "mobile") {
    return (
      <ul className="menu-stagger px-4 pt-2">
        {all.map((item, index) => (
          <li key={item.key} style={{ "--i": index }}>
            <Link
              to={item.link}
              className="flex min-h-[64px] items-center gap-3 border-b border-black/[0.05] py-2 transition active:translate-x-1 active:opacity-60"
            >
              <ShopIcon icon={item.icon} />
              <span className="min-w-0 flex-1">
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
          <Link to={item.link} className="group flex items-start gap-3.5 transition active:scale-[0.98]">
            <span className="transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
              <ShopIcon icon={item.icon} size="lg" />
            </span>
            <span className="min-w-0 pt-0.5">
              <span
                className={`inline-flex items-center gap-1.5 text-[14px] font-bold group-hover:underline ${
                  item.highlight ? "text-[#BF243E]" : "text-gray-900"
                }`}
              >
                {item.label}
                <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </span>
              {item.description && <span className="mt-0.5 block text-[13px] text-gray-500">{item.description}</span>}
            </span>
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
  featuredBrands,
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
              <BrandDirectory
                brands={brands}
                translate={translate}
                variant="mobile"
                header={<FeaturedBrands brands={featuredBrands} translate={translate} compact />}
              />
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
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  <ShopIcon icon={category.icon} />
                  {category.title}
                </h2>
                <Link to={category.link} className="shrink-0 text-sm font-bold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4">
                  {translate("viewAll")}
                </Link>
              </div>
              <div className="menu-stagger">
              {category.columns.flat().map((group, index) => {
                const GroupIcon = iconForLink(group.link);
                return (
                <div key={group.link || group.label} style={{ "--i": index }} className="border-b border-black/[0.05] py-3">
                  <Link to={group.link} className="flex items-center gap-2.5 py-1 text-[15px] font-bold text-gray-900 transition active:translate-x-1">
                    {GroupIcon && <GroupIcon className="h-7 w-7 shrink-0" />}
                    {group.label}
                  </Link>
                  {group.subItems?.length > 0 && (
                    <ul className={GroupIcon ? "pl-[38px]" : ""}>
                      {group.subItems.map((sub) => (
                        <li key={sub.link}>
                          <Link to={sub.link} className="block py-1.5 text-[14px] font-medium text-gray-800 transition active:translate-x-1 active:text-gray-900">
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                );
              })}
              </div>
            </div>
          ) : (
            <div key="products" className={`${direction === "back" ? slide : ""} h-full overflow-y-auto pb-6`}>
              {account}
              <ul className="menu-stagger px-4 pt-1">
                {categories.map((item, index) => (
                  <li key={item.key} style={{ "--i": index }}>
                    <button type="button" onClick={() => openCategory(item)} className={`${row} min-h-[60px] font-semibold text-gray-900`}>
                      <span className="flex min-w-0 items-center gap-3">
                        <ShopIcon icon={item.icon} />
                        <span className="truncate">{item.title}</span>
                      </span>
                      <FiChevronRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-active:translate-x-1"
                      />
                    </button>
                  </li>
                ))}
                <li style={{ "--i": categories.length }}>
                  <Link to="/all-products" className={`${row} min-h-[60px] font-bold text-gray-900`}>
                    <span className="flex min-w-0 items-center gap-3">
                      <ShopIcon icon={GridIcon} />
                      <span className="truncate">{translate("allProducts")}</span>
                    </span>
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
