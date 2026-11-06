import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TfiClose } from "react-icons/tfi";
import LanguageModal from "./LanguageModal";
import DropdownMenu from "./DropdownMenu";
import { buildCategoryNav, buildOfferItems, FALLBACK_BRANDS } from "./headerNav";
import { useLanguage } from "../translation/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../Hooks/useCart";
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

const IconButton = ({ label, onClick, children, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 ${className}`}
  >
    {children}
  </button>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRight = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState(null);
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
    setMobileCategory(null);
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

  const openMobileCategory = (category) => {
    if (category.key === "brands") loadBrands();
    setMobileCategory(category);
  };

  const mobileNavItems = [
    ...categories.map((category) => ({
      key: category.key,
      title: category.title,
      link: category.link,
      groups: category.columns.flat(),
    })),
    {
      key: "brands",
      title: translate("brands"),
      groups: brandItems,
      flat: true,
    },
    {
      key: "offers",
      title: translate("offers"),
      groups: offerItems,
      flat: true,
    },
  ];

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
      {/* Promo bar */}
      <div className="flex w-full items-center justify-center gap-3 bg-[#FDC700] px-4 py-1.5 text-center">
        <p className="text-[12px] font-bold">{translate("freeShipping")}</p>
        <button
          type="button"
          onClick={() => setIsOffersOpen(true)}
          className="whitespace-nowrap text-[12px] font-bold underline underline-offset-2 hover:no-underline"
        >
          {translate("exploreOffers")}
        </button>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
        {/* Main bar */}
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 lg:h-[72px] lg:gap-8">
          {/* Mobile: menu + search */}
          <div className="flex items-center lg:hidden">
            <IconButton label={translate("menu")} onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </IconButton>
            <IconButton label={translate("findAProduct")} onClick={() => setIsMobileSearchOpen(true)}>
              <img src="/logos/search.svg" className="h-4 w-4" alt="" />
            </IconButton>
          </div>

          <Link to="/" className="flex-shrink-0 max-lg:mx-auto" aria-label="Proteini.si">
            <img src="/logos/proteini.svg" className="w-[150px] lg:w-[220px]" alt="Proteini.si" />
          </Link>

          {/* Desktop search */}
          <div ref={searchRef} className="relative hidden flex-1 lg:block">
            <img
              src="/logos/search.svg"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
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
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white [&::-webkit-search-cancel-button]:appearance-none"
              placeholder={translate("findAProduct")}
              aria-label={translate("findAProduct")}
            />
            {showDesktopResults && desktopSearch.hasTerm && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
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
          <div className="flex items-center gap-1">
            <IconButton
              label={translate("language")}
              onClick={() => setIsLanguageModalOpen(true)}
              className="max-lg:hidden"
            >
              <img src={flagIcon} className="h-6 w-6" alt="" />
            </IconButton>

            {isSuperAdmin && (
              <Link
                to="/admin-orders"
                className="mx-1 hidden rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-black hover:text-black lg:inline-block"
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
                <img src="/logos/profile.svg" className="h-6 w-6" alt="" />
              )}
            </IconButton>

            <IconButton label={translate("shoppingCart")} onClick={() => navigate("/cart")}>
              <img src="/logos/cart.svg" className="h-7 w-7" alt="" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FDC700] px-1 text-[11px] font-bold text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </IconButton>
          </div>
        </div>

        {/* Desktop categories */}
        <nav className="relative hidden border-t border-gray-100 lg:block">
          <div className="mx-auto flex h-11 max-w-[1240px] items-stretch justify-center gap-7 px-4">
            {categories.map((category) => (
              <DropdownMenu
                key={category.key}
                title={category.title}
                link={category.link}
                columns={category.columns}
                viewAllLabel={translate("viewAll")}
              />
            ))}
            <DropdownMenu
              title={translate("brands")}
              items={brandItems}
              listColumns={5}
              onOpen={loadBrands}
            />
            <DropdownMenu
              title={translate("offers")}
              items={offerItems}
              listColumns={3}
              highlight
            />
          </div>
        </nav>
      </header>

      {/* Offers drawer */}
      {isOffersOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
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
                <div className="py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#FDC700]" />
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
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center gap-2 border-b border-gray-200 p-3">
            <IconButton label={translate("close")} onClick={closeMobileSearch}>
              <CloseIcon />
            </IconButton>
            <div className="relative flex-1">
              <img
                src="/logos/search.svg"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
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
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-[400px] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              {mobileCategory ? (
                <button
                  type="button"
                  onClick={() => setMobileCategory(null)}
                  className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {translate("back")}
                </button>
              ) : (
                <span className="px-2 font-semibold">{translate("menu")}</span>
              )}
              <IconButton label={translate("close")} onClick={() => setIsMobileMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div
              className="flex-1 overflow-y-auto"
              onClick={(event) => {
                // Also close when a link to the current page is tapped.
                if (event.target.closest("a")) setIsMobileMenuOpen(false);
              }}
            >
              {mobileCategory ? (
                <div className="p-4">
                  <h2 className="mb-3 text-lg font-bold">{mobileCategory.title}</h2>
                  {mobileCategory.link && (
                    <Link
                      to={mobileCategory.link}
                      className="mb-4 block text-sm font-semibold text-[#2096D8]"
                    >
                      {translate("viewAll")} →
                    </Link>
                  )}
                  {mobileCategory.flat ? (
                    <ul className="divide-y divide-gray-100">
                      {mobileCategory.groups.map((item) => (
                        <li key={item.link}>
                          <Link to={item.link} className="block py-3 text-sm">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-5">
                      {mobileCategory.groups.map((group) => (
                        <div key={group.link || group.label}>
                          <Link
                            to={group.link}
                            className="block border-b border-gray-100 pb-2 text-sm font-bold uppercase"
                          >
                            {group.label}
                          </Link>
                          {group.subItems?.length > 0 && (
                            <ul className="mt-1">
                              {group.subItems.map((subItem) => (
                                <li key={subItem.link}>
                                  <Link to={subItem.link} className="block py-2 pl-3 text-sm text-gray-600">
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="border-b border-gray-100 p-4">
                    {loggedIn ? (
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
                          {userInitials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{user?.user_FullName}</p>
                          <div className="flex gap-4 text-sm">
                            <Link to="/profile" className="text-[#2096D8]">
                              {translate("myAccount")}
                            </Link>
                            {isSuperAdmin && (
                              <Link to="/admin-orders" className="text-gray-600">
                                {translate("admin")}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                        className="block w-full bg-[#2096D8] py-2.5 text-center text-sm font-semibold text-white"
                      >
                        {translate("signInRegister")}
                      </Link>
                    )}
                  </div>

                  <ul className="divide-y divide-gray-100 px-2">
                    {mobileNavItems.map((item) => (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => openMobileCategory(item)}
                          className="flex w-full items-center justify-between px-2 py-3.5 text-left text-sm font-medium"
                        >
                          {item.title}
                          <ChevronRight />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 space-y-1 border-t border-gray-100 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLanguageModalOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-gray-50"
                    >
                      <img src={flagIcon} className="h-5 w-5" alt="" />
                      <span className="flex-1 text-left">{translate("language")}</span>
                      <span className="text-gray-400">{language.toUpperCase()}</span>
                    </button>
                    <Link
                      to="/sales-points"
                      className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-gray-50"
                    >
                      <img src="/logos/location.svg" className="h-5 w-5" alt="" />
                      {translate("branches")}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <LanguageModal isOpen={isLanguageModalOpen} setIsOpen={setIsLanguageModalOpen} />
    </>
  );
}
