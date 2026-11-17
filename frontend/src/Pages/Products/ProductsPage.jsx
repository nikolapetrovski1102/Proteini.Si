// src/Pages/Products/CategoryPage.jsx
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiltersForProducts from "./FiltersForProducts";
import MobileFiltersModal from "./MobileFiltersModal";
import { api } from "../../services/api";
import { FiChevronDown, FiSliders, FiX } from "react-icons/fi";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import { BrandLoader } from "../Components/Loaders/BrandLoader";
import HomeProductCard from "../HomePages/HomeProductCard";
import { useLanguage } from "../translation/LanguageContext";
import { filterLabel, filterText, labelForSlug } from "../../utils/filterLabels";
import { applySeoMetadata } from "../../utils/seo";
import { notify } from "../Components/Feedback/siteFeedback";
import { formatAmount } from "../../utils/formatPrice";

export default function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recommended");
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [favorites, setFavorites] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { translate } = useLanguage();
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sports: [],
    goals: [],
    useTimings: [],
    tags: [],
    flavors: [],
    brands: [],
  });
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const navigate = useNavigate();

  const isLoadingMoreRef = useRef(false);
  const isUpdatingFromURL = useRef(false);
  const isUpdatingFromUser = useRef(false);
  const isAuthenticated = api.isAuthenticated();

  const latestRequestId = useRef(0);
  // Parameters of the last list request, so effects that fire together on load
  // (path, filter options, URL filters, sort) don't send the same query 4-5 times.
  const lastListKey = useRef(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);



  const handleToggleFavorite = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notify(translate("favoritesLoginRequired"));
      navigate("/login");
      return;
    }

    try {
      const response = await api.toggleFavorite(productId);
      if (response.success) {
        setFavorites((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notify(translate("favoritesUpdateFailed"), { tone: "error" });
    }
  };

  const getFiltersFromPath = () => {
    const path = location.pathname;
    const pathParts = path
      .substring(1)
      .split("/")
      .filter((part) => part && part !== "all-products");

    if (pathParts.length >= 2) {
      const parentSlug = pathParts[pathParts.length - 2];
      const childSlug = pathParts[pathParts.length - 1];
      return {
        parentSlug,
        childSlug,
        isSubcategory: true,
        fullPath: pathParts,
      };
    }

    const currentSlug = pathParts[pathParts.length - 1];
    return {
      categorySlug: currentSlug,
      isSubcategory: false,
      fullPath: pathParts,
    };
  };

  const getCategoryDisplayName = () => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");

    if (searchQuery) {
      return filterText("searchResults").replace("{q}", searchQuery);
    }

    const path = location.pathname;
    const pathParts = path.substring(1).split("/");
    let displayPart = `${translate("allProducts")}`;
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i] && pathParts[i] !== "all-products") {
        displayPart = pathParts[i];
        break;
      }
    }
    if (displayPart === `${translate("allProducts")}`)
      return `${translate("allProducts")}`;
    const translated = labelForSlug(displayPart);
    if (translated) return translated;
    return displayPart
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const categories = filterOptions.categories || [];
    if (categories.length === 0) return;
    const parts = location.pathname.split("/").filter(Boolean);
    if (["goals", "sports", "products", "all-products"].includes(parts[0])) return;
    const slug = parts[parts.length - 1];
    if (!slug || slug === "gift-voucher") return;
    if (categories.some((category) => category.category_Slug === slug)) return;

    let cancelled = false;
    api.resolveCategorySlug(slug)
      .then((resolved) => {
        if (cancelled || !resolved?.slug) return;
        const redirectedParts = [...parts];
        redirectedParts[redirectedParts.length - 1] = resolved.slug;
        navigate(`/${redirectedParts.join("/")}${location.search}`, { replace: true });
      })
      .catch((resolveError) => {
        console.warn("Could not resolve historical category URL:", resolveError);
      });
    return () => {
      cancelled = true;
    };
  }, [filterOptions.categories, location.pathname, location.search, navigate]);

  const fetchProducts = async (filters = {}, page = 1, isLoadMore = false, force = false) => {
    // Category paths need the category list to build the right query; firing
    // before it arrives only produces a wrong, immediately superseded request.
    if (!optionsLoaded) return;

    let requestId;
    let listKey;
    try {
      const pathInfo = getFiltersFromPath();
      let combinedFilters = { ...filters };

      if (location.pathname.endsWith("/gift-voucher")) {
        combinedFilters.giftVouchers = true;
      }

      if (pathInfo.isSubcategory && filterOptions.categories.length > 0) {
        const subcategory = filterOptions.categories.find(
          (cat) => cat.category_Slug === pathInfo.childSlug,
        );

        if (
          subcategory &&
          (!combinedFilters.categoryIds ||
            combinedFilters.categoryIds.length === 0)
        ) {
          // A subcategory is already an exact filter. Including its parent here
          // turns the backend's category match into parent OR child and causes
          // unrelated products from the same parent category to appear.
          combinedFilters.categoryIds = [subcategory.category_Id];
        }
      } else if (
        pathInfo.categorySlug &&
        filterOptions.categories.length > 0 &&
        (!combinedFilters.categoryIds ||
          combinedFilters.categoryIds.length === 0)
      ) {
        const category = filterOptions.categories.find(
          (cat) =>
            cat.category_Slug === pathInfo.categorySlug &&
            cat.parent_Category_Id === null,
        );
        if (category) {
          combinedFilters.categoryIds = [category.category_Id];
        }
      }

      const filterParams = {
        ...combinedFilters,
        page,
        pageSize: 20,
        sortBy: getSortByField(selectedSort),
        sortOrder: getSortOrder(selectedSort),
        searchTerm:
          filters.searchTerm || combinedFilters.searchTerm || null,
      };

      listKey = JSON.stringify(filterParams);
      if (!isLoadMore && !force && listKey === lastListKey.current) return;
      lastListKey.current = listKey;

      requestId = ++latestRequestId.current;
      if (isLoadMore) {
        setLoadMoreLoading(true);
        isLoadingMoreRef.current = true;
      } else {
        setLoading(true);
        isLoadingMoreRef.current = false;
      }

      const data = await api.getFilteredProducts(filterParams);

      if (requestId !== latestRequestId.current) {
        return;
      }

      const newProducts = data.products || [];

      if (isLoadMore) {
        setProducts((prevProducts) => {
          const cardKey = (product) =>
            `${product.product_Id}-${product.variant_Id || "base"}`;
          const existingIds = new Set(prevProducts.map(cardKey));
          const uniqueNewProducts = newProducts.filter(
            (product) => !existingIds.has(cardKey(product)),
          );
          return [...prevProducts, ...uniqueNewProducts];
        });
      } else {
        setProducts(newProducts);
      }

      setTotalProducts(data.totalCount || 0);
      setError(null);

      if (isAuthenticated && newProducts.length > 0) {
        await fetchAllFavorites(newProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (requestId === latestRequestId.current) {
        // Let the same query be retried.
        if (lastListKey.current === listKey) lastListKey.current = null;
        setError(translate("failedToLoadProducts"));
      }
    } finally {
      // A superseded request must not clear the spinner: the newer request is
      // still in flight, and clearing it here flashes the empty state.
      if (requestId !== undefined && requestId === latestRequestId.current) {
        if (isLoadMore) {
          setLoadMoreLoading(false);
          isLoadingMoreRef.current = false;
        } else {
          setLoading(false);
        }
      }
    }
  };

  const fetchAllFavorites = async (productsList) => {
    try {
      const ids = await api.getFavoriteIds();
      const favoriteStatus = {};
      for (const product of productsList) {
        favoriteStatus[product.product_Id] = ids.has(Number(product.product_Id));
      }
      setFavorites((prev) => ({ ...prev, ...favoriteStatus }));
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const getSortByField = (sortOption) => {
    switch (sortOption) {
      case "Lowest price":
      case "Highest price":
        return "price";
      case "Bestsellers":
        return "soldCount";
      case "Most recent":
      default:
        return sortOption === "Recommended" ? "priority" : "createdAt";
    }
  };

  const getSortOrder = (sortOption) => {
    switch (sortOption) {
      case "Lowest price":
        return "ASC";
      case "Highest price":
        return "DESC";
      case "Most recent":
      case "Bestsellers":
        return "DESC";
      case "Recommended":
        return "ASC";
      default:
        return "ASC";
    }
  };

  const getFilterDisplayName = (filterKey, value) => {
    if (filterKey === "brandIds" && filterOptions.brands.length > 0) {
      const brand = filterOptions.brands.find((b) => b.brand_Id === value);
      return brand ? brand.brand_Name : null;
    }
    if (filterKey === "categoryIds" && filterOptions.categories.length > 0) {
      const category = filterOptions.categories.find(
        (c) => c.category_Id === value,
      );
      return category ? filterLabel("categoryIds", category.category_Slug, category.category_Name) : null;
    }
    if (filterKey === "sportIds" && filterOptions.sports.length > 0) {
      const sport = filterOptions.sports.find((s) => s.sport_Id === value);
      return sport ? filterLabel("sportIds", sport.sport_Slug, sport.sport_Name) : null;
    }
    if (filterKey === "goalIds" && filterOptions.goals.length > 0) {
      const goal = filterOptions.goals.find((g) => g.goal_Id === value);
      return goal ? filterLabel("goalIds", goal.goal_Slug, goal.goal_Name) : null;
    }
    if (filterKey === "useTimingIds" && filterOptions.useTimings.length > 0) {
      const timing = filterOptions.useTimings.find(
        (t) => t.useTiming_Id === value,
      );
      return timing ? filterLabel("useTimingIds", timing.useTiming_Slug, timing.useTiming_Name) : null;
    }
    if (filterKey === "flavorIds" && filterOptions.flavors.length > 0) {
      const flavor = filterOptions.flavors.find((f) => f.flavor_Id === value);
      return flavor ? filterLabel("flavorIds", flavor.flavor_Slug, flavor.flavor_Name) : null;
    }
    if (filterKey === "sizes") return `${filterText("sizes")}: ${value}`;
    if (filterKey === "tagIds" && filterOptions.tags.length > 0) {
      const tag = filterOptions.tags.find((t) => t.tag_Id === value);
      return tag ? filterLabel("tagIds", tag.tag_Slug, tag.tag_Name) : null;
    }
    if (filterKey === "onSale") return filterLabel("status", "onSale");
    if (filterKey === "upcomingPromotions") return filterLabel("status", "upcomingPromotions");
    if (filterKey === "newProducts") return filterLabel("status", "newProducts");
    if (filterKey === "bestSellers") return filterLabel("status", "bestSellers");
    if (filterKey === "outlet") return filterLabel("status", "outlet");
    if (filterKey === "inStock") return filterLabel("status", "inStock");
    if (filterKey === "searchTerm") return `${filterText("search")}: ${value}`;
    if (filterKey === "minPrice" && selectedFilters.maxPrice)
      return `${filterText("priceRange")}: ${formatAmount(value)} – ${formatAmount(selectedFilters.maxPrice)} ${filterText("currency")}`;
    return null;
  };

  const removeSingleFilter = (filterKey, valueToRemove = null) => {
    const newFilters = { ...selectedFilters };

    if (filterKey === "minPrice" && valueToRemove === "priceRange") {
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    } else if (Array.isArray(newFilters[filterKey])) {
      if (valueToRemove) {
        newFilters[filterKey] = newFilters[filterKey].filter(
          (v) => v !== valueToRemove,
        );
        if (newFilters[filterKey].length === 0) delete newFilters[filterKey];
      } else {
        delete newFilters[filterKey];
      }
    } else if (typeof newFilters[filterKey] === "boolean") {
      delete newFilters[filterKey];
    } else if (filterKey === "searchTerm") {
      delete newFilters.searchTerm;
    }

    handleFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    handleFilterChange({});
  };

  useEffect(() => {
    if (location.state?.preSelectedFilter) {
      const { preSelectedFilter, filterValue } = location.state;

      if (preSelectedFilter === "outlet") {
        setSelectedFilters({ outlet: filterValue });
        fetchProducts({ outlet: filterValue }, 1, false);
      } else if (preSelectedFilter === "newProducts") {
        setSelectedFilters({ newProducts: filterValue });
        fetchProducts({ newProducts: filterValue }, 1, false);
      } else if (preSelectedFilter === "bestSellers") {
        setSelectedFilters({ bestSellers: filterValue });
        fetchProducts({ bestSellers: filterValue }, 1, false);
      } else if (preSelectedFilter === "onSale") {
        setSelectedFilters({ onSale: filterValue });
        fetchProducts({ onSale: filterValue }, 1, false);
      } else if (preSelectedFilter === "upcomingPromotions") {
        setSelectedFilters({ upcomingPromotions: filterValue });
        fetchProducts({ upcomingPromotions: filterValue }, 1, false);
      } else if (preSelectedFilter === "justForMe") {
        setSelectedFilters({ justForMe: filterValue });
        fetchProducts({ justForMe: filterValue }, 1, false);
      } else if (
        preSelectedFilter === "goalIds" &&
        filterOptions.goals.length > 0
      ) {
        const goal = filterOptions.goals.find(
          (g) => g.goal_Name === filterValue,
        );
        if (goal) {
          const newFilters = { goalIds: [goal.goal_Id] };
          setSelectedFilters(newFilters);
          fetchProducts(newFilters, 1, false);
        }
      } else if (
        preSelectedFilter === "sportIds" &&
        filterOptions.sports.length > 0
      ) {
        const sport = filterOptions.sports.find(
          (s) => s.sport_Name === filterValue,
        );
        if (sport) {
          const newFilters = { sportIds: [sport.sport_Id] };
          setSelectedFilters(newFilters);
          fetchProducts(newFilters, 1, false);
        }
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state, filterOptions.goals, filterOptions.sports]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(selectedFilters, 1, false);
  }, [location.pathname, filterOptions.categories, optionsLoaded]);

  useEffect(() => {
    if (!isLoadingMoreRef.current) {
      setCurrentPage(1);
      fetchProducts(selectedFilters, 1, false);
    }
  }, [selectedFilters, selectedSort]);

  const handleFilterChange = (newFilters) => {
    isUpdatingFromUser.current = true;
    setSelectedFilters(newFilters);
    updateURLWithFilters(newFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(selectedFilters, nextPage, true);
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await api.getShopFilterOptions();
        setFilterOptions({
          categories: options.categories || [],
          sports: options.sports || [],
          goals: options.goals || [],
          useTimings: options.useTimings || [],
          tags: options.tags || [],
          flavors: options.flavors || [],
          brands: options.brands || [],
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setOptionsLoaded(true);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search");

    if (searchQuery && searchQuery.trim()) {
      setSelectedFilters({ searchTerm: searchQuery });
    }
  }, [location.search]);

  useEffect(() => {
    if (isUpdatingFromUser.current) {
      isUpdatingFromUser.current = false;
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlFilters = {};

    const brandIds = searchParams.get("brandIds");
    if (brandIds) urlFilters.brandIds = brandIds.split(",").map(Number);

    const brandSlug = searchParams.get("brand");
    if (brandSlug && filterOptions.brands.length > 0) {
      const brand = filterOptions.brands.find(
        (item) => item.brand_Slug === brandSlug,
      );
      if (brand) urlFilters.brandIds = [brand.brand_Id];
    }

    const categoryIds = searchParams.get("categoryIds");
    if (categoryIds)
      urlFilters.categoryIds = categoryIds.split(",").map(Number);

    const sportIds = searchParams.get("sportIds");
    if (sportIds) urlFilters.sportIds = sportIds.split(",").map(Number);

    const goalIds = searchParams.get("goalIds");
    if (goalIds) urlFilters.goalIds = goalIds.split(",").map(Number);

    const useTimingIds = searchParams.get("useTimingIds");
    if (useTimingIds)
      urlFilters.useTimingIds = useTimingIds.split(",").map(Number);

    const flavorIds = searchParams.get("flavorIds");
    if (flavorIds) urlFilters.flavorIds = flavorIds.split(",").map(Number);

    const sizes = searchParams.get("sizes");
    if (sizes) urlFilters.sizes = sizes.split(",").filter(Boolean);

    const tagIds = searchParams.get("tagIds");
    if (tagIds) urlFilters.tagIds = tagIds.split(",").map(Number);

    if (searchParams.get("onSale") === "true") urlFilters.onSale = true;
    if (searchParams.get("upcomingPromotions") === "true")
      urlFilters.upcomingPromotions = true;
    if (searchParams.get("newProducts") === "true")
      urlFilters.newProducts = true;
    if (searchParams.get("bestSellers") === "true" || searchParams.get("bestSeller") === "true")
      urlFilters.bestSellers = true;
    if (searchParams.get("outlet") === "true") urlFilters.outlet = true;
    if (searchParams.get("inStock") === "true") urlFilters.inStock = true;

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice) urlFilters.minPrice = Number(minPrice);
    if (maxPrice) urlFilters.maxPrice = Number(maxPrice);

    if (Object.keys(urlFilters).length > 0) {
      isUpdatingFromURL.current = true;
      setSelectedFilters(urlFilters);
    }
  }, [location.search, filterOptions.brands]);

  const updateURLWithFilters = (filters) => {
    if (window._urlUpdateTimeout) {
      clearTimeout(window._urlUpdateTimeout);
    }

    window._urlUpdateTimeout = setTimeout(() => {
      const params = new URLSearchParams();
      let basePath = "/all-products";

      let categoryIds = filters.categoryIds || [];
      let brandIds = filters.brandIds || [];

      const { categoryIds: _, brandIds: __, ...otherFilters } = filters;

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (value === true) {
          params.set(key, "true");
        } else if (typeof value === "number" && value > 0) {
          params.set(key, value.toString());
        } else if (typeof value === "string" && value) {
          params.set(key, value);
        }
      });

      let categoryPath = "";
      if (categoryIds.length === 1) {
        const category = filterOptions.categories.find(
          (c) => c.category_Id === categoryIds[0],
        );
        if (category) {
          categoryPath = `/${category.category_Slug}`;
        }
      } else if (categoryIds.length === 2) {
        const child = filterOptions.categories.find(
          (c) =>
            categoryIds.includes(c.category_Id) &&
            c.parent_Category_Id !== null,
        );
        if (child) {
          categoryPath = `/${child.category_Slug}`;
        }
      }

      if (brandIds.length === 1) {
        const brand = filterOptions.brands.find(
          (b) => b.brand_Id === brandIds[0],
        );
        if (brand) {
          params.set("brand", brand.brand_Slug);
        }
      } else if (brandIds.length > 1) {
        params.set("brandIds", brandIds.join(","));
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `${basePath}${categoryPath}?${queryString}`
        : `${basePath}${categoryPath}`;

      navigate(newUrl, { replace: true });
    }, 50);
  };

  const parseCategoriesFromPath = () => {
    const path = location.pathname;
    const pathWithoutBase = path.replace("/all-products", "");
    const pathParts = pathWithoutBase.split("/").filter((part) => part);

    if (pathParts.length === 0) return [];

    const slug = pathParts[pathParts.length - 1];
    const category = filterOptions.categories.find(
      (c) => c.category_Slug === slug,
    );

    if (!category) return [];

    if (category.parent_Category_Id !== null) return [category.category_Id];

    return [category.category_Id];
  };

  useEffect(() => {
    if (isUpdatingFromUser.current) {
      isUpdatingFromUser.current = false;
      return;
    }

    if (location.state?.preSelectedFilter) {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const urlFilters = {};

    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      urlFilters.searchTerm = searchTerm;
    }

    const pathCategories = parseCategoriesFromPath();
    if (pathCategories.length > 0) {
      urlFilters.categoryIds = pathCategories;
    }

    const brandId = searchParams.get("brandId");
    const brandSlug = searchParams.get("brand");

    if (brandId && filterOptions.brands.length > 0) {
      const brand = filterOptions.brands.find(
        (b) => b.brand_Id === parseInt(brandId),
      );

      if (brand) {
        urlFilters.brandIds = [brand.brand_Id];
      }
    } else if (brandSlug && filterOptions.brands.length > 0) {
      const brand = filterOptions.brands.find(
        (b) => b.brand_Slug === brandSlug,
      );

      if (brand) {
        urlFilters.brandIds = [brand.brand_Id];
      }
    }

    const brandIds = searchParams.get("brandIds");
    if (brandIds) {
      urlFilters.brandIds = brandIds.split(",").map(Number);
    }

    const sportIds = searchParams.get("sportIds");
    if (sportIds) {
      urlFilters.sportIds = sportIds.split(",").map(Number);
    }

    const goalIds = searchParams.get("goalIds");
    if (goalIds) {
      urlFilters.goalIds = goalIds.split(",").map(Number);
    }

    const useTimingIds = searchParams.get("useTimingIds");
    if (useTimingIds) {
      urlFilters.useTimingIds = useTimingIds.split(",").map(Number);
    }

    const flavorIds = searchParams.get("flavorIds");
    if (flavorIds) {
      urlFilters.flavorIds = flavorIds.split(",").map(Number);
    }

    const sizes = searchParams.get("sizes");
    if (sizes) {
      urlFilters.sizes = sizes.split(",").filter(Boolean);
    }

    const tagIds = searchParams.get("tagIds");
    if (tagIds) {
      urlFilters.tagIds = tagIds.split(",").map(Number);
    }

    if (searchParams.get("onSale") === "true") {
      urlFilters.onSale = true;
    }

    if (searchParams.get("upcomingPromotions") === "true") {
      urlFilters.upcomingPromotions = true;
    }

    if (searchParams.get("newProducts") === "true") {
      urlFilters.newProducts = true;
    }

    if (searchParams.get("bestSellers") === "true" || searchParams.get("bestSeller") === "true") {
      urlFilters.bestSellers = true;
    }

    if (searchParams.get("outlet") === "true") {
      urlFilters.outlet = true;
    }

    if (searchParams.get("inStock") === "true") {
      urlFilters.inStock = true;
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (minPrice) {
      urlFilters.minPrice = Number(minPrice);
    }

    if (maxPrice) {
      urlFilters.maxPrice = Number(maxPrice);
    }

    if (Object.keys(urlFilters).length > 0) {
      isUpdatingFromURL.current = true;
      setSelectedFilters(urlFilters);
    } else if (
      pathCategories.length === 0 &&
      !brandId &&
      !brandSlug &&
      !location.state?.preSelectedFilter
    ) {
      setSelectedFilters({});
    }
  }, [
    location.pathname,
    location.search,
    filterOptions.categories,
    filterOptions.brands,
    location.state,
  ]);

  const fetchProductCountForFilters = async (filters) => {
    try {
      const pathInfo = getFiltersFromPath();
      let combinedFilters = { ...filters };

      if (pathInfo.isSubcategory && filterOptions.categories.length > 0) {
        const subcategory = filterOptions.categories.find(
          (cat) => cat.category_Slug === pathInfo.childSlug,
        );
        if (
          subcategory &&
          (!combinedFilters.categoryIds ||
            combinedFilters.categoryIds.length === 0)
        ) {
          combinedFilters.categoryIds = [subcategory.category_Id];
        }
      } else if (
        pathInfo.categorySlug &&
        filterOptions.categories.length > 0 &&
        (!combinedFilters.categoryIds ||
          combinedFilters.categoryIds.length === 0)
      ) {
        const category = filterOptions.categories.find(
          (cat) =>
            cat.category_Slug === pathInfo.categorySlug &&
            cat.parent_Category_Id === null,
        );
        if (category) {
          combinedFilters.categoryIds = [category.category_Id];
        }
      }

      const filterParams = {
        ...combinedFilters,
        page: 1,
        pageSize: 1,
        sortBy: getSortByField(selectedSort),
        sortOrder: getSortOrder(selectedSort),
        searchTerm: filters.searchTerm || null,
      };

      const data = await api.getFilteredProducts(filterParams);
      return data.totalCount || 0;
    } catch (error) {
      console.error("Error fetching product count:", error);
      return 0;
    }
  };

  const activeChips = Object.entries(selectedFilters).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value
        .map((v) => ({ id: `${key}-${v}`, label: getFilterDisplayName(key, v), remove: () => removeSingleFilter(key, v) }))
        .filter((chip) => chip.label);
    }
    if (key === "minPrice" && selectedFilters.maxPrice) {
      return [{
        id: "priceRange",
        label: `${filterText("priceRange")}: ${formatAmount(value)} – ${formatAmount(selectedFilters.maxPrice)} ${filterText("currency")}`,
        remove: () => removeSingleFilter("minPrice", "priceRange"),
      }];
    }
    if (key === "searchTerm" && value) {
      return [{ id: key, label: `${filterText("search")}: ${value}`, remove: () => removeSingleFilter(key) }];
    }
    if (value === true && ["onSale", "upcomingPromotions", "newProducts", "bestSellers", "outlet", "inStock"].includes(key)) {
      return [{ id: key, label: filterLabel("status", key), remove: () => removeSingleFilter(key) }];
    }
    return [];
  });

  const categoryName = getCategoryDisplayName();
  const loadedProductsCount = products.length;
  const hasMoreProducts = loadedProductsCount < totalProducts;

  useEffect(() => {
    const searchQuery = new URLSearchParams(location.search).get("search");
    const description = searchQuery
      ? `Резултати за ${searchQuery}. Пронајдете спортска исхрана и суплементи на Proteini.si.`
      : `${categoryName} – производи за спортска исхрана и активен начин на живот на Proteini.si.`;

    return applySeoMetadata({
      title: `${categoryName} | Proteini.si`,
      description,
      url: `https://proteini.mk${location.pathname}${location.search}`,
    });
  }, [categoryName, location.pathname, location.search]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => fetchProducts(selectedFilters, 1, false, true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {translate("tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1770px] px-[67.5px] py-[80px] max-lg:px-0">
      <div className="px-[15px] w-full flex max-md:p-0">
        <div className="hidden lg:block">
          <FiltersForProducts
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
          />
        </div>

        <div className="w-full px-[35px] max-lg:px-0">
          <div className="w-full flex justify-between flex-wrap gap-4">
            <p className="px-[15px] w-2/3 max-sm:w-full mb-[20px] text-[20px] font-bold">
              {categoryName}
            </p>
          </div>

          {/* Active Filters Chips Section */}
          {activeChips.length > 0 && (
            <div className="px-[15px] w-full mt-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={chip.remove}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-[#f4f3ef] py-1.5 pl-3 pr-2 text-[12px] font-semibold text-gray-900 transition-colors hover:bg-[#141409] hover:text-white"
                  >
                    {chip.label}
                    <FiX className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-[#FDC700]" aria-hidden />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-2 py-1.5 text-[12px] font-semibold text-gray-500 underline-offset-2 transition-colors hover:text-gray-900 hover:underline"
                >
                  {translate("clearAllFilters")}
                </button>
              </div>
            </div>
          )}

          <div className="w-full flex justify-between items-center flex-wrap gap-4">
            <div className="px-[15px] w-full lg:hidden flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-900 transition-colors active:bg-gray-100"
              >
                <FiSliders size={15} aria-hidden />
                {filterText("filter")}
                {activeChips.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FDC700] px-1.5 text-[11px] font-bold leading-none text-[#141409]">
                    {activeChips.length}
                  </span>
                )}
              </button>
              <p className="text-[13px] text-gray-500">
                {totalProducts} {translate("productCountLabel")}
              </p>
            </div>

            <div className="hidden lg:flex px-[15px] text-[14px] justify-end items-center ml-auto gap-5">
              <p className="text-[13px] text-gray-600 whitespace-nowrap">
                {totalProducts} {translate("productCountLabel")}
              </p>
              <p className="text-[12px] font-bold mr-[20px]">
                {translate("sortBy")}
              </p>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-[12px] font-semibold text-gray-900 transition-colors hover:border-gray-900"
                >
                  {selectedSort === "Recommended" && translate("recommendedOrder")}
                  {selectedSort === "Most recent" && translate("mostRecent")}
                  {selectedSort === "Lowest price" && translate("lowestPrice")}
                  {selectedSort === "Highest price" &&
                    translate("highestPrice")}
                  {selectedSort === "Bestsellers" && translate("bestSellers")}
                  <img
                    src={
                      isOpen ? "/logos/arrow-up.svg" : "/logos/arrow-down.svg"
                    }
                    alt="Arrow"
                    width={16}
                    height={16}
                    className="transition-transform"
                  />
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 z-10 mt-2 w-52 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/[0.06]">
                    <ul className="py-2">
                      {[
                        {
                          value: "Recommended",
                          translation: translate("recommendedOrder"),
                        },
                        {
                          value: "Most recent",
                          translation: translate("mostRecent"),
                        },
                        {
                          value: "Lowest price",
                          translation: translate("lowestPrice"),
                        },
                        {
                          value: "Highest price",
                          translation: translate("highestPrice"),
                        },
                        {
                          value: "Bestsellers",
                          translation: translate("bestSellers"),
                        },
                      ].map((option) => (
                        <li key={option.value}>
                          <button
                            onClick={() => handleSortSelect(option.value)}
                            className={`block w-full px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-[#f8f7f4] ${selectedSort === option.value ? "font-bold text-gray-900" : "text-gray-700"}`}
                          >
                            {option.translation}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <ProductGridSkeleton />
          ) : (
          <div
            className={`relative grid grid-cols-2 lg:grid-cols-4 my-[18px] gap-3 sm:gap-5 transition-opacity duration-150 ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
            aria-busy={loading}
          >
            {loading && (
              <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
                <LargeLoader />
              </div>
            )}
            {products.map((product) => (
              <ProductCard
                key={`${product.product_Id}-${product.variant_Id || "base"}`}
                product={product}
                onQuickPurchase={() => quickPurchase(product)}
                onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites[product.product_Id] || false}
              />
            ))}
          </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filterText("noProducts")}
              </p>
            </div>
          )}

          {products.length > 0 && hasMoreProducts && (
            <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col items-center px-[15px]">
              <p className="text-[13px] text-gray-500">
                {filterText("showingOf")
                  .replace("{n}", loadedProductsCount)
                  .replace("{total}", totalProducts)}
              </p>
              <div
                className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={totalProducts}
                aria-valuenow={loadedProductsCount}
              >
                <div
                  className="h-full rounded-full bg-[#FDC700] transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.min(100, (loadedProductsCount / totalProducts) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadMoreLoading}
                className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#141409] px-6 py-3.5 text-[14px] font-bold text-white transition-colors duration-200 hover:bg-black disabled:pointer-events-none disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
              >
                {loadMoreLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#FDC700]" aria-hidden />
                    {filterText("loadingShort")}
                  </>
                ) : (
                  <>
                    {filterText("showMore")}
                    <FiChevronDown className="h-4 w-4 text-[#FDC700] transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden />
                  </>
                )}
              </button>
            </div>
          )}

          {products.length > 0 && !hasMoreProducts && totalProducts > 0 && (
            <div className="mt-10 text-center">
              <p className="text-[13px] text-gray-500">
                {filterText("allLoaded").replace("{total}", totalProducts)}
              </p>
            </div>
          )}
        </div>
      </div>

      <MobileFiltersModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onFilterChange={handleFilterChange}
        selectedFilters={selectedFilters}
        totalProducts={totalProducts}
        fetchProductCount={fetchProductCountForFilters}
        navigate={navigate}
      />

      {quickPurchaseSheet}
    </div>
  );
}

// ProductCard component
function ProductGridSkeleton({ count = 8 }) {
  const { translate } = useLanguage();
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 my-[18px] gap-3 sm:gap-5"
      aria-busy="true"
      aria-label={translate("loadingProducts")}
    >
      <BrandLoader size={0} className="hidden" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
          <div className="aspect-square w-full bg-gradient-to-b from-[#f8f7f4] to-[#efede7]" />
          <div className="space-y-2 p-3 sm:p-4">
            <div className="h-2.5 w-1/3 rounded-full bg-gray-100" />
            <div className="h-4 w-5/6 rounded-full bg-gray-100" />
            <div className="h-5 w-1/3 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductCard(props) {
  const { translate, language } = useLanguage();
  return (
    <HomeProductCard
      {...props}
      fluid
      showSaleEnd
      showStock
      translate={translate}
      language={language}
      saleEndLocale={language === "al" ? "sq-AL" : language === "en" ? "en-GB" : "mk-MK"}
    />
  );
}
