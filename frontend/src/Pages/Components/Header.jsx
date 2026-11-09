import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TfiClose } from "react-icons/tfi";
import { FiArrowRight, FiChevronRight, FiMapPin, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser } from "react-icons/fi";
import LanguageModal from "./LanguageModal";
import DropdownMenu from "./DropdownMenu";
import { BrandDirectory, MobileMenu, OfferList } from "./HeaderMenus";
import MobileTabBar from "./MobileTabBar";
import { buildCategoryNav, buildOfferItems, FALLBACK_BRANDS } from "./headerNav";
import { useLanguage } from "../translation/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../Hooks/useCart";
import { useTheme } from "../Hooks/useTheme";
import { api } from "../../services/api";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";
const SEARCH_DEBOUNCE_MS = 300;

const FLAG_ICONS = {
  al: "/logos/flags/al.svg",
  mk: "/logos/flags/mk.svg",
  sl: "/logos/flags/sl.svg",
  hr: "/logos/flags/hr.svg",
  rs: "/logos/flags/serbia.svg",
  ba: "/logos/flags/bosnia.svg",
  me: "/logos/flags/montenegro.svg",
};

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getInitials = (fullName) => {
  const names = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return "U";
};

const getProductUrl = (product) => {
  const variantId = product.variant_Id;
  if ((product.isVariant || variantId) && variantId) {
    const parentId =
      product.parent_Product_Id || product.parentProductId || product.product_Id;
    return `/product/${parentId}?variant=${variantId}`;
  }
  const productId =
    product.Product_Id || product.product_Id || product.id || product.ProductId;
  return productId ? `/product/${productId}` : null;
};

const normalizeSearchProduct = (product) => {
  const price = Number(product.Price || product.price || 0);
  const comparePrice = Number(
    product.compare_Price ||
      product.Compare_Price ||
      product.Variant_Compare_Price ||
      0,
  );
  return {
    key: `${product.Product_Id || product.product_Id || ""}-${product.variant_Id || ""}`,
    url: getProductUrl(product),
    image: product.Img || product.img || product.product_Img || "",
    name: product.Name || product.name || product.product_Name || "Product",
    brand: product.BrandName || product.brandName || product.Brand_Name || "",
    price,
    salePrice: comparePrice > 0 && comparePrice < price ? comparePrice : null,
  };
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} MKD`;

const IconButton = ({ label, onClick, children, className = "", ...rest }) => (
  <button
    {...rest}
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </button>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function SearchResult({ product, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-white">
        {product.image && (
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{product.brand}</p>
        )}
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</p>
      </div>
      <div className="whitespace-nowrap text-right text-sm">
        {product.salePrice ? (
          <>
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
            <p className="font-semibold text-[#BF243E]">{formatPrice(product.salePrice)}</p>
          </>
        ) : (
          <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
        )}
      </div>
    </button>
  );
}

/** Debounced product search. Ignores responses that arrive out of order. */
function useProductSearch(term, { enabled = true, pageSize = 8 } = {}) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const requestId = useRef(0);
  const trimmed = term.trim();

  useEffect(() => {
    const id = ++requestId.current;
    if (!enabled || !trimmed) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await api.getFilteredProducts({
          searchTerm: trimmed,
          page: 1,
          pageSize,
          sortBy: "priority",
          sortOrder: "ASC",
        });
        if (id !== requestId.current) return;
        setResults((response?.products || []).map(normalizeSearchProduct));
      } catch (error) {
        if (id !== requestId.current) return;
        console.error("Search error:", error);
        setResults([]);
      } finally {
        if (id === requestId.current) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed, enabled, pageSize]);

  return { results, isSearching, hasTerm: Boolean(trimmed) };
}

function SearchResultsPanel({ term, search, onSelect, onViewAll, translate }) {
  const { results, isSearching, hasTerm } = search;
  if (!hasTerm) return null;

  if (isSearching && results.length === 0) {
    return <p className="p-4 text-center text-sm text-gray-500">{translate("searching")}</p>;
  }

  if (results.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        {translate("noProductsFoundFor")} „{term.trim()}“
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {results.map((product) => (
          <SearchResult key={product.key} product={product} onSelect={onSelect} />
        ))}
      </div>
      <button
        type="button"
        onClick={onViewAll}
        className="w-full border-t border-gray-100 px-3 py-3 text-center text-sm font-semibold text-[#2096D8] hover:bg-gray-50"
      >
        {translate("viewAllResults")} →
      </button>
    </>
  );
}

export default function Header() {
  const { translate, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const themeToggleLabel = translate(theme === "dark" ? "bright" : "dark");

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSegment, setMobileSegment] = useState("products");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [offerSections, setOfferSections] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDesktopResults, setShowDesktopResults] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [mobileSuggestions, setMobileSuggestions] = useState(null);
  const searchRef = useRef(null);

  const [brands, setBrands] = useState(null);
  const brandsRequested = useRef(false);

  const loggedIn = isAuthenticated();
  const isSuperAdmin =
    loggedIn &&
    (user?.superAdmin === true ||
      user?.superAdmin === 1 ||
      user?.SuperAdmin === true ||
      user?.SuperAdmin === 1);
  const userInitials = user ? getInitials(user.user_FullName) : "";
  const cartCount = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  const categories = buildCategoryNav(translate);
  const offerItems = buildOfferItems(translate);
  const brandItems = brands?.length ? brands : FALLBACK_BRANDS;

  const desktopSearch = useProductSearch(searchTerm, { pageSize: 8 });
  const mobileSearch = useProductSearch(mobileSearchTerm, {
    enabled: isMobileSearchOpen,
    pageSize: 20,
  });

  // Brands are only needed when someone opens the brands menu.
  const loadBrands = () => {
    if (brandsRequested.current) return;
    brandsRequested.current = true;
    api
      .getFilterOptions()
      .then((options) => {
        const list = (options?.brands || [])
          .map((brand) => ({
            label: brand.brand_Name || brand.Brand_Name,
            link: `/all-products?brand=${brand.brand_Slug || brand.Brand_Slug}`,
          }))
          .filter((brand) => brand.label)
          .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
        if (list.length) setBrands(list);
      })
      .catch((error) => {
        brandsRequested.current = false;
        console.error("Failed to load header brands:", error);
      });
  };

  // The offers drawer content is only fetched the first time it is opened.
  useEffect(() => {
    if (!isOffersOpen || offerSections) return;
    let cancelled = false;
    api
      .getLandingPageSections()
      .then((data) => !cancelled && setOfferSections((data || []).slice(0, 3)))
      .catch((error) => {
        console.error("Error fetching offer sections:", error);
        if (!cancelled) setOfferSections([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOffersOpen, offerSections]);

  // New products as suggestions when the mobile search opens with an empty term.
  useEffect(() => {
    if (!isMobileSearchOpen || mobileSuggestions) return;
    let cancelled = false;
    api
      .getFilteredProducts({
        newProducts: true,
        page: 1,
        pageSize: 8,
        sortBy: "priority",
        sortOrder: "ASC",
      })
      .then((response) => {
        if (!cancelled) setMobileSuggestions((response?.products || []).map(normalizeSearchProduct));
      })
      .catch((error) => {
        console.error("Failed to load mobile search suggestions:", error);
        if (!cancelled) setMobileSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isMobileSearchOpen, mobileSuggestions]);

  // Close overlays on navigation (state adjusted during render, no extra effect pass).
  const routeKey = `${location.pathname}${location.search}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setShowDesktopResults(false);
  }

  // Lock page scroll while a full-screen overlay is open.
  useEffect(() => {
    const locked = isMobileMenuOpen || isMobileSearchOpen || isOffersOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen, isOffersOpen]);

  // Close desktop search results when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDesktopResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape closes whatever overlay is open.
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key !== "Escape") return;
      setShowDesktopResults(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
      setIsOffersOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const goToSearchPage = (term) => {
    const query = term.trim();
    if (!query) return;
    setSearchTerm("");
    setMobileSearchTerm("");
    setShowDesktopResults(false);
    setIsMobileSearchOpen(false);
    navigate(`/all-products?search=${encodeURIComponent(query)}`);
  };

  const selectProduct = (product) => {
    if (!product.url) return;
    setSearchTerm("");
    setMobileSearchTerm("");
    setShowDesktopResults(false);
    setIsMobileSearchOpen(false);
    navigate(product.url);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setMobileSearchTerm("");
  };

  const changeMobileSegment = (segment) => {
    if (segment === "brands") loadBrands();
    setMobileSegment(segment);
  };

  const openMobileMenu = (segment) => {
    setIsMobileSearchOpen(false);
    setIsOffersOpen(false);
    changeMobileSegment(segment);
    setIsMobileMenuOpen(true);
  };

  const renderOfferSection = (section) => {
    switch (section.sectionType) {
      case "image":
        return (
          <img
            key={section.id}
            src={toImageUrl(section.imagePath)}
            alt={section.title || translate("todaysOffer")}
            className="w-full"
            onError={(e) => {
              e.currentTarget.src = "/img/proteini-landing.jpg";
            }}
          />
        );
      case "title":
        return (
          <p key={section.id} className="text-xl font-bold">
            {section.title}
          </p>
        );
      case "paragraph":
        return (
          <p key={section.id} className="leading-relaxed text-gray-600">
            {section.content}
          </p>
        );
      case "highlight":
        return (
          <p key={section.id} className="font-semibold">
            <span className="font-bold">{section.title}:</span> {section.content}
          </p>
        );
      default:
        return null;
    }
  };

  const flagIcon = FLAG_ICONS[language] || "/logos/eu.svg";

  return (
    <>
      {/* Promo bar: one line on every screen; the whole bar opens today's offer. */}
      <button
        type="button"
        onClick={() => setIsOffersOpen(true)}
        className="group flex w-full items-center justify-center gap-1 bg-[#FDC700] px-4 py-2 text-[11px] font-bold leading-none text-[#141409] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#141409] sm:gap-3 sm:py-1.5 sm:text-[12px] sm:leading-normal"
      >
        <span className="truncate">{translate("freeShipping")}</span>
        <span className="hidden whitespace-nowrap underline underline-offset-2 group-hover:no-underline sm:inline">
          {translate("exploreOffers")}
        </span>
        <FiChevronRight aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 sm:hidden" strokeWidth={3} />
      </button>

      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        {/* Single row: logo · navigation · search · actions */}
        <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 lg:h-[72px] lg:gap-6">
          <Link
            to="/"
            className="flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] focus-visible:ring-offset-4"
            aria-label="Proteini.si"
          >
            <img src={theme === "dark" ? "/logos/proteini-dark.svg" : "/logos/proteini.svg"} className="w-[118px] sm:w-[150px] lg:w-[180px]" alt="Proteini.si" />
          </Link>

          {/* Mobile: search is the one header action; menu, cart and account live in the tab bar. */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-gray-100 px-4 text-left text-[14px] text-gray-500 transition-colors active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] lg:hidden"
          >
            <FiSearch aria-hidden="true" className="h-[18px] w-[18px] flex-shrink-0 text-gray-800" strokeWidth={2.4} />
            <span className="truncate">{translate("findAProduct")}</span>
          </button>

          {/* Desktop navigation: three entries only */}
          <nav className="hidden h-full items-stretch gap-5 lg:flex" aria-label={translate("menu")}>
            <DropdownMenu
              title={translate("headerShop")}
              link="/all-products"
              categories={categories}
              viewAllLabel={translate("viewAll")}
            />
            <DropdownMenu title={translate("brands")} onOpen={loadBrands}>
              <BrandDirectory brands={brandItems} translate={translate} />
            </DropdownMenu>
            <DropdownMenu title={translate("offers")} highlight>
              <OfferList items={offerItems} translate={translate} />
            </DropdownMenu>
          </nav>

          {/* Desktop search */}
          <div ref={searchRef} className="relative ml-auto hidden w-full max-w-[340px] lg:block">
            <img
              src="/logos/search.svg"
              className="theme-icon pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
              alt=""
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDesktopResults(true);
              }}
              onFocus={() => setShowDesktopResults(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToSearchPage(searchTerm);
                }
              }}
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-500 hover:border-gray-300 focus:border-[#141409] focus:bg-white focus:ring-2 focus:ring-[#FDC700]/60 [&::-webkit-search-cancel-button]:appearance-none"
              placeholder={translate("findAProduct")}
              aria-label={translate("findAProduct")}
            />
            {showDesktopResults && desktopSearch.hasTerm && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-[480px] w-[440px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                <SearchResultsPanel
                  term={searchTerm}
                  search={desktopSearch}
                  onSelect={selectProduct}
                  onViewAll={() => goToSearchPage(searchTerm)}
                  translate={translate}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="hidden items-center gap-0.5 lg:flex">
            <IconButton
              label={translate("language")}
              onClick={() => setIsLanguageModalOpen(true)}
            >
              <img src={flagIcon} className="h-5 w-5" alt="" />
            </IconButton>

            <IconButton label={themeToggleLabel} onClick={toggleTheme} aria-pressed={theme === "dark"}>
              {theme === "dark" ? (
                <FiSun aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
              ) : (
                <FiMoon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
              )}
            </IconButton>

            {isSuperAdmin && (
              <Link
                to="/admin-orders"
                className="mx-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-black hover:text-black"
              >
                {translate("admin")}
              </Link>
            )}

            <IconButton
              label={translate("myAccount")}
              onClick={() => navigate(loggedIn ? "/profile" : "/login")}
            >
              {loggedIn ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[11px] font-bold text-white">
                  {userInitials}
                </span>
              ) : (
                <img src="/logos/profile.svg" className="theme-icon h-6 w-6" alt="" />
              )}
            </IconButton>

            <IconButton label={translate("shoppingCart")} onClick={() => navigate("/cart")} data-cart-target>
              <FiShoppingBag aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={2.1} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FDC700] px-1 text-[11px] font-bold text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </IconButton>
          </div>
        </div>
      </header>

      {/* Offers drawer */}
      {isOffersOpen && (
        <div className="fixed inset-x-0 top-0 bottom-[var(--bottom-nav-h,0px)] z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOffersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-[460px] overflow-y-auto bg-white px-8 pb-10 pt-16 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOffersOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 hover:bg-gray-100"
              aria-label={translate("close")}
            >
              <TfiClose size={18} />
            </button>
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl font-bold">{translate("todaysOffer")}</h2>
              <div className="h-1 w-16 bg-[#FDC700]" />
              {offerSections === null ? (
                <div className="py-8">
                  <img src="/loaders/scoop.svg" alt="" aria-hidden="true" className="h-24 w-auto select-none" draggable={false} />
                </div>
              ) : offerSections.length > 0 ? (
                offerSections.map(renderOfferSection)
              ) : (
                <>
                  <img src="/img/proteini-landing.jpg" alt="" />
                  <p className="text-xl font-bold">{translate("todaysOfferDesc")}</p>
                  <p>{translate("aTrustedChoice")}</p>
                </>
              )}
              <button
                type="button"
                className="mt-2 w-full max-w-[270px] bg-[#2096D8] py-2.5 text-sm font-semibold text-white hover:bg-[#1b84bf]"
                onClick={() => {
                  setIsOffersOpen(false);
                  navigate("/landing");
                }}
              >
                {translate("shopHere")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile search */}
      {isMobileSearchOpen && (
        <div className="fixed inset-x-0 top-0 bottom-[var(--bottom-nav-h,0px)] z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center gap-2 border-b border-gray-200 p-3">
            <IconButton label={translate("close")} onClick={closeMobileSearch}>
              <CloseIcon />
            </IconButton>
            <div className="relative flex-1">
              <img
                src="/logos/search.svg"
                className="theme-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
                alt=""
              />
              <input
                type="search"
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToSearchPage(mobileSearchTerm);
                  }
                }}
                autoFocus
                className="h-11 w-full rounded-full bg-gray-100 pl-10 pr-4 text-base outline-none"
                placeholder={translate("findAProduct")}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mobileSearch.hasTerm ? (
              <SearchResultsPanel
                term={mobileSearchTerm}
                search={mobileSearch}
                onSelect={selectProduct}
                onViewAll={() => goToSearchPage(mobileSearchTerm)}
                translate={translate}
              />
            ) : (
              <div className="pb-10">
                <div className="px-4 pb-2 pt-5">
                  <p className="font-semibold text-gray-900">{translate("newProducts")}</p>
                  <p className="text-sm text-gray-500">{translate("searchSuggestionsHint")}</p>
                </div>
                {mobileSuggestions === null ? (
                  <p className="p-4 text-center text-sm text-gray-500">{translate("searching")}</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {mobileSuggestions.map((product) => (
                      <SearchResult key={product.key} product={product} onSelect={selectProduct} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <MobileMenu
          segment={mobileSegment}
          onSegmentChange={changeMobileSegment}
          categories={categories}
          brands={brandItems}
          offers={offerItems}
          translate={translate}
          onClose={() => setIsMobileMenuOpen(false)}
          account={
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] px-4 py-3">
              <Link
                to={loggedIn ? "/profile" : "/login"}
                className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-[15px] font-semibold text-gray-900"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f6f5f1] text-[13px] font-bold text-gray-900 ring-1 ring-black/[0.06]">
                  {loggedIn ? userInitials : <FiUser aria-hidden="true" className="h-4 w-4" />}
                </span>
                <span className="truncate">{loggedIn ? user?.user_FullName || translate("myAccount") : translate("signInRegister")}</span>
              </Link>
              {isSuperAdmin && (
                <Link to="/admin-orders" className="shrink-0 text-xs font-bold text-gray-500 underline underline-offset-4">
                  {translate("admin")}
                </Link>
              )}
            </div>
          }
          footer={
            <div className="mx-4 mt-6 divide-y divide-black/[0.05] border-t border-black/[0.05]">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLanguageModalOpen(true);
                }}
                className="flex min-h-[48px] w-full items-center gap-3 text-sm font-medium text-gray-700"
              >
                <img src={flagIcon} className="h-5 w-5" alt="" />
                <span className="flex-1 text-left">{translate("language")}</span>
                <span className="text-xs font-bold text-gray-500">{language.toUpperCase()}</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={theme === "dark"}
                className="flex min-h-[48px] w-full items-center gap-3 text-sm font-medium text-gray-700"
              >
                {theme === "dark" ? (
                  <FiSun aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
                ) : (
                  <FiMoon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
                )}
                <span className="flex-1 text-left">{translate("theme")}</span>
                <span className="text-xs font-bold text-gray-500">{translate(theme === "dark" ? "dark" : "bright")}</span>
              </button>
              <Link to="/sales-points" className="flex min-h-[48px] items-center gap-3 text-sm font-medium text-gray-700">
                <FiMapPin aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
                <span className="flex-1">{translate("branches")}</span>
                <FiChevronRight aria-hidden="true" className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          }
        />
      )}

      <MobileTabBar
        cartCount={cartCount}
        loggedIn={loggedIn}
        isMenuOpen={isMobileMenuOpen}
        menuSegment={mobileSegment}
        onOpenMenu={openMobileMenu}
        onCloseMenu={() => setIsMobileMenuOpen(false)}
        translate={translate}
      />

      <LanguageModal isOpen={isLanguageModalOpen} setIsOpen={setIsLanguageModalOpen} />
    </>
  );
}
