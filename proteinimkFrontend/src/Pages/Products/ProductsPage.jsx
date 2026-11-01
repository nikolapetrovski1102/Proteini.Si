// src/Pages/Products/CategoryPage.jsx
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiltersForProducts from "./FiltersForProducts";
import MobileFiltersModal from "./MobileFiltersModal";
import { api } from "../../services/api";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import ProductActionModal from "../Components/ProductActionModal";
import { useCart } from "../Hooks/useCart";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import { useLanguage } from "../translation/LanguageContext";
import { formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { applySeoMetadata } from "../../utils/seo";

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
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const isLoadingMoreRef = useRef(false);
  const isUpdatingFromURL = useRef(false);
  const isUpdatingFromUser = useRef(false);
  const isAuthenticated = api.isAuthenticated();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const latestRequestId = useRef(0);

  const handleAddToCart = async (product, quantity) => {
    setAdding(true);
    const success = await addToCart(product.product_Id, quantity, product);
    setAdding(false);

    if (success) {
      alert(`${quantity} x ${product.name} added to cart!`);
      setIsModalOpen(false);
    } else {
      alert("Failed to add to cart. Please login.");
    }
  };

  const handleNavigationToProductDetails = (product) => {
    const productId = product?.product_Id || product?.id || product?._id;

    if (productId) {
      navigate(`/product/${productId}`);
      setIsModalOpen(false);
      window.scrollTo(0, 0);
    } else {
      console.error("No product ID found", product);
    }
  };

  const handleToggleFavorite = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Please login to add products to favorites");
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
      alert("Failed to update favorites. Please try again.");
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
      return `Search results for "${searchQuery}"`;
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

  const fetchProducts = async (filters = {}, page = 1, isLoadMore = false) => {
    const requestId = ++latestRequestId.current;

    if (isLoadMore) {
      setLoadMoreLoading(true);
      isLoadingMoreRef.current = true;
    } else {
      setLoading(true);
      isLoadingMoreRef.current = false;
    }

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
        setError("Failed to load products");
      }
    } finally {
      if (isLoadMore) {
        setLoadMoreLoading(false);
        isLoadingMoreRef.current = false;
      } else {
        setLoading(false);
      }
    }
  };

  const fetchAllFavorites = async (productsList) => {
    const favoriteStatus = {};
    for (const product of productsList) {
      try {
        const response = await api.isFavorite(product.product_Id);
        favoriteStatus[product.product_Id] = response.isFavorite;
      } catch (error) {
        console.error("Error checking favorite:", error);
        favoriteStatus[product.product_Id] = false;
      }
    }
    setFavorites((prev) => ({ ...prev, ...favoriteStatus }));
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
      return category ? category.category_Name : null;
    }
    if (filterKey === "sportIds" && filterOptions.sports.length > 0) {
      const sport = filterOptions.sports.find((s) => s.sport_Id === value);
      return sport ? sport.sport_Name : null;
    }
    if (filterKey === "goalIds" && filterOptions.goals.length > 0) {
      const goal = filterOptions.goals.find((g) => g.goal_Id === value);
      return goal ? goal.goal_Name : null;
    }
    if (filterKey === "useTimingIds" && filterOptions.useTimings.length > 0) {
      const timing = filterOptions.useTimings.find(
        (t) => t.useTiming_Id === value,
      );
      return timing ? timing.useTiming_Name : null;
    }
    if (filterKey === "flavorIds" && filterOptions.flavors.length > 0) {
      const flavor = filterOptions.flavors.find((f) => f.flavor_Id === value);
      return flavor ? flavor.flavor_Name : null;
    }
    if (filterKey === "tagIds" && filterOptions.tags.length > 0) {
      const tag = filterOptions.tags.find((t) => t.tag_Id === value);
      return tag ? tag.tag_Name : null;
    }
    if (filterKey === "onSale") return "On Sale";
    if (filterKey === "upcomingPromotions") return "Upcoming promotions";
    if (filterKey === "newProducts") return "New Products";
    if (filterKey === "outlet") return "Outlet";
    if (filterKey === "inStock") return "In Stock";
    if (filterKey === "searchTerm") return `Search: ${value}`;
    if (filterKey === "minPrice" && selectedFilters.maxPrice)
      return `Price: ${value} - ${selectedFilters.maxPrice} MKD`;
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
      } else if (preSelectedFilter === "onSale") {
        setSelectedFilters({ onSale: filterValue });
        fetchProducts({ onSale: filterValue }, 1, false);
      } else if (preSelectedFilter === "upcomingPromotions") {
        setSelectedFilters({ upcomingPromotions: filterValue });
        fetchProducts({ upcomingPromotions: filterValue }, 1, false);
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
  }, [location.pathname, filterOptions.categories]);

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
        const options = await api.getFilterOptions();
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

    const tagIds = searchParams.get("tagIds");
    if (tagIds) urlFilters.tagIds = tagIds.split(",").map(Number);

    if (searchParams.get("onSale") === "true") urlFilters.onSale = true;
    if (searchParams.get("upcomingPromotions") === "true")
      urlFilters.upcomingPromotions = true;
    if (searchParams.get("newProducts") === "true")
      urlFilters.newProducts = true;
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

  if (loading && products.length === 0) {
    return <LargeLoader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => fetchProducts(selectedFilters, 1, false)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try Again
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
          <div className="px-[15px] w-full mt-4 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(selectedFilters).flatMap(([key, value]) => {
                if (key === "categoryIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`category-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "brandIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`brand-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "sportIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`sport-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "goalIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`goal-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "useTimingIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`useTiming-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "flavorIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`flavor-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "tagIds" && Array.isArray(value)) {
                  return value.map((v) => {
                    const name = getFilterDisplayName(key, v);
                    return name ? (
                      <span
                        key={`tag-${v}`}
                        onClick={() => removeSingleFilter(key, v)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                      >
                        {name}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ) : null;
                  });
                }
                if (key === "onSale" && value === true) {
                  return (
                    <span
                      key="onSale"
                      onClick={() => removeSingleFilter("onSale")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      On Sale
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "upcomingPromotions" && value === true) {
                  return (
                    <span
                      key="upcomingPromotions"
                      onClick={() => removeSingleFilter("upcomingPromotions")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      Upcoming promotions
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "newProducts" && value === true) {
                  return (
                    <span
                      key="newProducts"
                      onClick={() => removeSingleFilter("newProducts")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      New Products
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "outlet" && value === true) {
                  return (
                    <span
                      key="outlet"
                      onClick={() => removeSingleFilter("outlet")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      Outlet
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "inStock" && value === true) {
                  return (
                    <span
                      key="inStock"
                      onClick={() => removeSingleFilter("inStock")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      In Stock
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "searchTerm" && value) {
                  return (
                    <span
                      key="searchTerm"
                      onClick={() => removeSingleFilter("searchTerm")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      Search: {value}
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                if (key === "minPrice" && selectedFilters.maxPrice) {
                  return (
                    <span
                      key="priceRange"
                      onClick={() =>
                        removeSingleFilter("minPrice", "priceRange")
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#2096D8] text-[#2096D8] cursor-pointer hover:bg-blue-50 transition-colors rounded-full"
                    >
                      Price: {selectedFilters.minPrice || 0} -{" "}
                      {selectedFilters.maxPrice} MKD
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  );
                }
                return [];
              })}

              {Object.keys(selectedFilters).length > 0 && (
                <div className="group">
                  <button
                    key="clear-all"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#BF243E] group-hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 group-hover:rotate-90 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {translate("clearAllFilters")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex justify-between items-center flex-wrap gap-4">
            <div className="px-[15px] w-full lg:hidden flex justify-between items-center">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#cacaca] text-[12px] font-semibold"
              >
                <FiFilter size={16} />
                Sort and Filter
                {Object.keys(selectedFilters).length > 0 && (
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {Object.keys(selectedFilters).length}
                  </span>
                )}
              </button>
              <p className="text-[14px] text-gray-600">
                {totalProducts} Products
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
                  className="px-4 py-2 border border-[#cacaca] text-[12px] flex items-center gap-2"
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
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
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
                            className="block w-full text-left px-4 py-2 text-[12px] hover:bg-gray-100"
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

          <div className="grid grid-cols-2 lg:grid-cols-4 my-[18px] gap-1">
            {products.map((product) => (
              <ProductCard
                key={`${product.product_Id}-${product.variant_Id || "base"}`}
                product={product}
                onQuickPurchase={() => {
                  if (product.hasVariants || product.isVariant || product.isGiftVoucher) {
                    const variant = product.variant_Id ? `?variant=${product.variant_Id}` : "";
                    navigate(`/product/${product.product_Id}${variant}`);
                    return;
                  }
                  setSelectedProduct(product);
                  setModalQuantity(1);
                  setIsModalOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites[product.product_Id] || false}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products found in this category.
              </p>
            </div>
          )}

          {products.length > 0 && hasMoreProducts && (
            <div className="w-full flex flex-col items-center mt-8">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">
                  Showing {loadedProductsCount} of {totalProducts} products
                </p>
              </div>
              <button
                onClick={handleLoadMore}
                disabled={loadMoreLoading}
                className="border border-gray-400 text-gray-500 text-[13px] font-semibold py-[10px] px-[60px] leading-4 hover:border-black hover:text-black transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                {loadMoreLoading ? "Loading..." : "Show more"}
              </button>
            </div>
          )}

          {products.length > 0 && !hasMoreProducts && totalProducts > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                All {totalProducts} products loaded
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

      <ProductActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalQuantity(1);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleNavigationToProductDetails}
        title={translate("quickPurchase")}
        addButtonText={translate("addToCart")}
        addButtonColor="bg-[#F7C201]"
        addButtonHoverColor="hover:bg-[#e0b401]"
        addButtonTextColor="text-black"
        removeButtonText={translate("viewArticle")}
        removeButtonColor="bg-[#dadada]"
        removeButtonTextColor="text-black"
        removeButtonHoverColor="hover:bg-[#c0c0c0]"
      />
    </div>
  );
}

// ProductCard component
function ProductCard({
  product,
  onQuickPurchase,
  onToggleFavorite,
  isFavorite,
}) {
  const { translate, language } = useLanguage();
  const displayName = language === "al" && product.nameAl ? product.nameAl : product.name;
  const regularPrice = product.price || 0;
  const saleActive = isSaleActive(product);
  const discountedPrice = saleActive ? product.compare_Price || 0 : 0;
  const hasDiscount = discountedPrice > 0 && discountedPrice < regularPrice;
  const displayPrice = hasDiscount ? discountedPrice : regularPrice;
  const saleEndDate = formatSaleEndDate(product, language === "al" ? "sq-AL" : "mk-MK");

  // Determine the link URL - if it's a variant, pass variant parameter
  const productLink =
    product.isVariant && product.variant_Id
      ? `/product/${product.parent_Product_Id || product.product_Id}?variant=${product.variant_Id}`
      : `/product/${product.product_Id}`;

  return (
    <div className="group relative min-w-0 bg-white">
      <a
        href={productLink}
        className="flex flex-col p-[10px] pb-[18px] max-md:p-0 border border-transparent group-hover:border-gray-400 relative bg-white"
        style={{ borderBottom: "none" }}
      >
        {product.shortExpiry && (
          <span className="absolute left-2 top-2 z-10 bg-amber-400 px-2 py-1 text-[10px] font-bold text-black">
            {translate("shortExpiry")}
            {product.expiryDate
              ? ` · ${String(product.expiryDate).slice(0, 10)}`
              : ""}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-2 top-2 z-10 bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
            {Math.round(((regularPrice - displayPrice) / regularPrice) * 100)}% {translate("promotionBadge")}
          </span>
        )}
        {product.img ? (
          <img
            src={`${product.img}`}
            className="h-[180px] w-full object-contain sm:h-[300px]"
            alt={displayName}
          />
        ) : (
          <div className="flex h-[180px] w-full items-center justify-center bg-gray-200 text-gray-400 sm:h-[300px]">
            {translate("noImage")}
          </div>
        )}
        <span className="text-[10px] mt-[10px]">
          {product.brandName || product.category || "Proteini.si"}
        </span>
        <span className="mb-[2px] min-h-[44px] max-h-[44px] overflow-hidden text-[13px] font-semibold leading-[22px] sm:text-[18px]">
          {displayName}
        </span>
        <div className="flex flex-col">
          <span className="flex text-yellow-400 mb-1">
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
          </span>
          <span className="text-xs">{translate("moreAboutRatings")}</span>
        </div>

        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                MKD {regularPrice.toFixed(2)}
              </span>
              <span className="font-semibold sm:text-lg text-[16px] text-red-600">
                MKD {displayPrice.toFixed(2)}
              </span>
              <span className="text-xs text-green-600">
                Save MKD {(regularPrice - displayPrice).toFixed(2)} (
                {Math.round(
                  ((regularPrice - displayPrice) / regularPrice) * 100,
                )}
                % off)
              </span>
              {saleEndDate && (
                <span className="mt-1 text-xs font-semibold text-red-600">
                  {translate("saleEnds")} {saleEndDate}
                </span>
              )}
            </>
          ) : (
            <span className="font-semibold sm:text-lg text-[16px]">
              MKD {displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        <span className="text-[#2096D8] text-[11px] leading-3 font-bold mt-[10px]">
          {translate("new")}
        </span>
      </a>

      <div
        className="absolute left-0 w-full bg-white border border-gray-400 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible max-lg:hidden"
        style={{ borderTop: "none" }}
      >
        <div className="p-4 flex flex-col justify-between min-h-[100px]">
          {product.hasVariants ? (
            <span className="text-sm">
              {product.packagingCount || 1} {product.packagingCount === 1 ? "packing" : "packings"}
              {" | "}
              {product.flavorCount || 0} {product.flavorCount === 1 ? "taste" : "tastes"}
            </span>
          ) : Number(product.gPerServing) > 0 || Number(product.servings) > 0 ? (
            <span className="text-sm">
              {Number(product.gPerServing) > 0 ? `${product.gPerServing}g per serving` : ""}
              {Number(product.gPerServing) > 0 && Number(product.servings) > 0 ? " | " : ""}
              {Number(product.servings) > 0 ? `${product.servings} servings` : ""}
            </span>
          ) : null}
          <div className="flex justify-between items-center mt-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickPurchase();
              }}
              className="bg-[#E5E5E5] hover:bg-[#d8d8d8] font-bold py-[13px] px-[16px] cursor-pointer"
            >
              {translate("quickPurchase")}
            </button>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product.product_Id, e)}
              className="cursor-pointer"
            >
              {isFavorite ? (
                <FaHeart size={22} color="#1b88c5" />
              ) : (
                <FiHeart size={22} color="#1b88c5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
