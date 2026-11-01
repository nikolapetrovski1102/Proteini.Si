import { useState, useEffect, useRef } from "react";
import LanguageModal from "./LanguageModal";
import DropdownMenu from "./DropdownMenu";
import { useLanguage } from "../translation/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import { TfiClose } from "react-icons/tfi";
import React from "react";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const { translate, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [userInitials, setUserInitials] = useState("");
  const isSuperAdmin =
    user?.superAdmin === true ||
    user?.superAdmin === 1 ||
    user?.SuperAdmin === true ||
    user?.SuperAdmin === 1;

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [mobileSuggestedProducts, setMobileSuggestedProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMobileResults, setShowMobileResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const desktopSearchRequestId = useRef(0);
  const mobileSearchRequestId = useRef(0);
  const mobileMenuRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [offerSections, setOfferSections] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  const [dynamicBrandColumns, setDynamicBrandColumns] = useState([]);
  const [randomProductPool, setRandomProductPool] = useState([]);

  // Flag mapping based on language
  const getFlagIcon = () => {
    switch (language) {
      case "al":
        return "/logos/flags/al.svg";
      case "mk":
        return "/logos/flags/mk.svg";
      case "sl":
        return "/logos/flags/sl.svg";
      case "hr":
        return "/logos/flags/hr.svg";
      case "rs":
        return "/logos/flags/serbia.svg";
      case "ba":
        return "/logos/flags/bosnia.svg";
      case "me":
        return "/logos/flags/montenegro.svg";
      case "en":
      default:
        return "/logos/eu.svg";
    }
  };

  // Feature items array
  const features = [
    {
      id: "free-shipping",
      icon: "/logos/truck.svg",
      iconClass: "w-10 h-10 mb-1 cursor-pointer",
      text: translate("freeShippingOver"),
      onClick: () => setIsOffersModalOpen(true),
    },
    {
      id: "loyalty-points",
      icon: "/logos/cart.svg",
      iconClass: "w-8 h-8",
      text: translate("youGainLoyaltyPoints"),
    },
    {
      id: "quality",
      icon: "/logos/bin.svg",
      iconClass: "w-8 h-8",
      text: translate("unparalleledQuality"),
    },
    {
      id: "todays-offer",
      icon: "/logos/eye.svg",
      iconClass: "w-8 h-8",
      text: translate("checkTodaysOffer"),
    },
  ];

  useEffect(() => {
    const splitIntoColumns = (items, columnCount = 3) => {
      const columnSize = Math.ceil(items.length / columnCount);
      return Array.from({ length: columnCount }, (_, index) => ({
        subItems: items.slice(index * columnSize, (index + 1) * columnSize),
      })).filter((column) => column.subItems.length > 0);
    };

    const normalizeBrandLogo = (logoPath) => {
      if (!logoPath) return null;
      if (logoPath.startsWith("http")) return logoPath;
      if (logoPath.startsWith("/")) return `https://proteini.mk${logoPath}`;
      return `https://proteini.mk/${logoPath}`;
    };

    api
      .getFilterOptions()
      .then((options) => {
        const brands = options?.brands || [];
        if (!brands.length) return;

        const sortedBrands = [...brands].sort((a, b) => {
          const firstLabel = a.brand_Name || a.Brand_Name || "";
          const secondLabel = b.brand_Name || b.Brand_Name || "";
          return firstLabel.localeCompare(secondLabel, undefined, {
            sensitivity: "base",
          });
        });

        const items = sortedBrands.map((brand) => {
          const label = brand.brand_Name || brand.Brand_Name;
          const slug = brand.brand_Slug || brand.Brand_Slug;
          const logo =
            brand.logo_Url || brand.logo_URL || brand.Logo_Url || brand.logoUrl;

          return {
            label,
            link: `/all-products?brand=${slug}`,
            image: normalizeBrandLogo(logo),
          };
        });

        setDynamicBrandColumns(splitIntoColumns(items));
      })
      .catch((error) => {
        console.error("Failed to load header brands:", error);
      });
  }, []);

  useEffect(() => {
    const normalizeProductImage = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith("http")) return imagePath;
      if (imagePath.startsWith("/")) return `https://proteini.mk${imagePath}`;
      return imagePath;
    };

    const getProductLink = (product) => {
      const productId =
        product.product_Id || product.Product_Id || product.id || product._id;
      const variantId = product.variant_Id || product.Variant_Id;
      const parentProductId =
        product.parent_Product_Id || product.Parent_Product_Id;
      const isVariant = product.isVariant || product.IsVariant;

      if (isVariant && variantId) {
        return `/product/${parentProductId || productId}?variant=${variantId}`;
      }

      return productId ? `/product/${productId}` : "/all-products";
    };

    const formatPromoProduct = (product) => {
      const name =
        product.name ||
        product.Name ||
        product.product_Name ||
        product.Product_Name;
      const image = normalizeProductImage(
        product.img || product.Img || product.product_Img || product.Product_Img,
      );

      if (!name || !image) return null;

      return {
        img: image,
        firstSpan:
          product.brandName ||
          product.BrandName ||
          product.brand_Name ||
          product.Brand_Name ||
          product.category ||
          product.Category ||
          "PROTEINI.MK",
        secondSpan: name,
        thirdSpan: "VIEW",
        link: getProductLink(product),
      };
    };

    let isMounted = true;

    api
      .getProducts()
      .then((productsData) => {
        if (!isMounted || !Array.isArray(productsData)) return;

        const promoProducts = productsData
          .map(formatPromoProduct)
          .filter(Boolean);

        if (promoProducts.length > 0) {
          setRandomProductPool(promoProducts);
        }
      })
      .catch((error) => {
        console.error("Failed to load header promo products:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }
    if (touchStart - touchEnd < -50) {
      setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  // Search function for desktop
  const handleSearch = async (term) => {
    const requestId = ++desktopSearchRequestId.current;
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.getFilteredProducts({
        searchTerm: term,
        page: 1,
        pageSize: 10,
        sortBy: "priority",
        sortOrder: "ASC",
      });

      if (requestId === desktopSearchRequestId.current && response?.products) {
        // Ensure compare_Price is mapped correctly
        const productsWithDiscount = response.products.map((product) => ({
          ...product,
          compare_Price:
            product.compare_Price || product.Variant_Compare_Price || null,
        }));
        setSearchResults(productsWithDiscount);
        setShowResults(true);
      }
    } catch (error) {
      if (requestId !== desktopSearchRequestId.current) return;
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      if (requestId === desktopSearchRequestId.current) setIsSearching(false);
    }
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const searchQuery = searchTerm.trim();
      setSearchTerm(""); // Clear after capturing
      setShowResults(false);
      // Navigate to search results page
      navigate(`/all-products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Search function for mobile
  const handleMobileSearch = async (term) => {
    const requestId = ++mobileSearchRequestId.current;
    if (!term.trim()) {
      setMobileSearchResults([]);
      setShowMobileResults(false);
      return;
    }

    setIsMobileSearching(true);
    try {
      const response = await api.getFilteredProducts({
        searchTerm: term,
        page: 1,
        pageSize: 20,
        sortBy: "priority",
        sortOrder: "ASC",
      });

      if (requestId === mobileSearchRequestId.current && response?.products) {
        setMobileSearchResults(response.products);
        setShowMobileResults(true);
      }
    } catch (error) {
      if (requestId !== mobileSearchRequestId.current) return;
      console.error("Search error:", error);
      setMobileSearchResults([]);
    } finally {
      if (requestId === mobileSearchRequestId.current) setIsMobileSearching(false);
    }
  };

  // Debounced search for desktop
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Debounced search for mobile
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (mobileSearchTerm && isMobileSearchOpen) {
        handleMobileSearch(mobileSearchTerm);
      } else if (!mobileSearchTerm) {
        setMobileSearchResults([]);
        setShowMobileResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [mobileSearchTerm, isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen || mobileSearchTerm.trim()) return;

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
        if (!cancelled) setMobileSuggestedProducts(response?.products || []);
      })
      .catch((error) => {
        console.error("Failed to load mobile search suggestions:", error);
        if (!cancelled) setMobileSuggestedProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isMobileSearchOpen, mobileSearchTerm]);

  // Close search results when clicking outside for desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && user.user_FullName) {
      const fullName = user.user_FullName;
      if (fullName) {
        const names = fullName.trim().split(" ");
        let initials = "";
        if (names.length >= 2) {
          initials =
            names[0].charAt(0).toUpperCase() +
            names[names.length - 1].charAt(0).toUpperCase();
        } else if (names.length === 1) {
          initials = names[0].substring(0, 2).toUpperCase();
        }
        setUserInitials(initials);
      } else {
        setUserInitials("U");
      }
    } else if (user) {
      setUserInitials("U");
    }
  }, [user]);

  // Fetch cart count function
  const fetchCartCount = async () => {
    try {
      const isAuth = isAuthenticated();
      if (isAuth) {
        const cartData = await api.getCart();
        let totalItems = 0;

        if (cartData?.items && Array.isArray(cartData.items)) {
          totalItems = cartData.items.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
          );
        } else if (cartData?.cartItems && Array.isArray(cartData.cartItems)) {
          totalItems = cartData.cartItems.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
          );
        } else if (
          cartData?.data?.items &&
          Array.isArray(cartData.data.items)
        ) {
          totalItems = cartData.data.items.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
          );
        } else if (Array.isArray(cartData)) {
          totalItems = cartData.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0,
          );
        }
        setCartCount(totalItems);
      } else {
        // GUEST USER - Read from localStorage with a small delay to ensure it's updated
        // Use setTimeout to ensure we read after the DOM update
        setTimeout(() => {
          // Try to get cart from multiple possible storage keys
          let cart = null;
          let cartData = null;

          // Try guestCart first
          const guestCart = localStorage.getItem("guestCart");
          if (guestCart) {
            try {
              cartData = JSON.parse(guestCart);
              cart = cartData;
            } catch (e) {
              console.error("Error parsing guestCart:", e);
            }
          }

          // If not found, try legacy cart
          if (!cart) {
            const legacyCart = localStorage.getItem("cart");
            if (legacyCart) {
              try {
                cart = JSON.parse(legacyCart);
              } catch (e) {
                console.error("Error parsing cart:", e);
              }
            }
          }

          let totalItems = 0;
          if (cart) {
            if (Array.isArray(cart)) {
              totalItems = cart.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0,
              );
            } else if (cart.items && Array.isArray(cart.items)) {
              totalItems = cart.items.reduce(
                (sum, item) => sum + (item.quantity || 1),
                0,
              );
            }
          }

          setCartCount(totalItems);
        }, 50); // Small delay to ensure localStorage is updated
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCartCount();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("focus", fetchCartCount);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("focus", fetchCartCount);
    };
  }, []);

  useEffect(() => {
    fetchOfferSections();
  }, []);

  const fetchOfferSections = async () => {
    setOfferLoading(true);
    try {
      const data = await api.getLandingPageSections();
      const firstThreeSections = data.slice(0, 3);
      setOfferSections(firstThreeSections);
    } catch (error) {
      console.error("Error fetching offer sections:", error);
    } finally {
      setOfferLoading(false);
    }
  };

  const handleProductNavigation = (slug) => {
    navigate(`/all-products/${slug}`);
    setIsMobileMenuOpen(false);
    setIsSubMenuOpen(false);
    setSelectedCategory(null);
  };

  const handleBrandNavigation = (brandSlug) => {
    navigate(`/all-products?brandId=${brandSlug}`);
    setIsMobileMenuOpen(false);
    setIsSubMenuOpen(false);
    setSelectedCategory(null);
  };

  const handleHomeNavigation = () => {
    navigate("/");
  };

  const handleLoginNavigation = () => {
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleProfileNavigation = () => {
    navigate("/profile");
    setIsMobileMenuOpen(false);
  };

  const handleAdminOrdersNavigation = () => {
    navigate("/admin-orders");
    setIsMobileMenuOpen(false);
  };

  const handleCartNavigation = () => {
    navigate("/cart");
  };

  const handleProductClick = (product, isMobile = false) => {
    // Check if this is a variant product
    const isVariantProduct = product.isVariant || product.variant_Id;
    const parentProductId =
      product.parent_Product_Id || product.parentProductId;
    const variantId = product.variant_Id;

    let url;

    if (isVariantProduct && variantId) {
      // If it's a variant, navigate to parent product with variant parameter
      const parentId = parentProductId || product.product_Id;
      url = `/product/${parentId}?variant=${variantId}`;
    } else {
      // Regular product
      const productId =
        product.Product_Id ||
        product.product_Id ||
        product.id ||
        product.ProductId;
      url = `/product/${productId}`;
    }

    if (url) {
      navigate(url);
      if (isMobile) {
        setIsMobileSearchOpen(false);
        setMobileSearchTerm("");
        setShowMobileResults(false);
      } else {
        setShowResults(false);
        setSearchTerm("");
      }
      setIsMobileMenuOpen(false);
    } else {
      console.error("No product ID found in:", product);
    }
  };

  // Navigation items data - UPDATED WITH /all-products/ PREFIX
  const sportItems = [
    {
      label: translate("aminoAcids"),
      link: "/all-products/amino-acids",
      subItems: [
        { label: translate("bcaa"), link: "/all-products/bcaa" },
        { label: translate("glutamine"), link: "/all-products/glutamine" },
        { label: translate("hmb"), link: "/all-products/hmb" },
        { label: translate("eaa"), link: "/all-products/eaa" },
        { label: translate("aminoMix"), link: "/all-products/amino-mix" },
      ],
    },
    {
      label: translate("definition"),
      link: "/all-products/definition",
      subItems: [
        {
          label: translate("thermogenics"),
          link: "/all-products/thermogenics",
        },
        { label: translate("carnitine"), link: "/all-products/carnitine" },
      ],
    },
    {
      label: translate("creatine"),
      link: "/all-products/creatine",
      subItems: [
        {
          label: translate("monohydrates"),
          link: "/all-products/monohydrates",
        },
        {
          label: translate("advancedTypes"),
          link: "/all-products/advanced-types",
        },
      ],
    },
    {
      label: translate("proteins"),
      link: "/all-products/proteins",
      subItems: [
        { label: translate("whey"), link: "/all-products/whey" },
        {
          label: translate("eggWhiteProtein"),
          link: "/all-products/egg-white-protein",
        },
        { label: translate("isolate"), link: "/all-products/isolate" },
        {
          label: translate("proteinBlends"),
          link: "/all-products/protein-blends",
        },
        { label: translate("casein"), link: "/all-products/casein" },
        {
          label: translate("veganProtein"),
          link: "/all-products/vegan-protein",
        },
        { label: translate("beefProtein"), link: "/all-products/beef-protein" },
      ],
    },
    {
      label: translate("energyBoosters"),
      link: "/all-products/energy-boosters",
      subItems: [
        {
          label: translate("carbohydrates"),
          link: "/all-products/carbohydrates",
        },
        {
          label: translate("energyIsotonicDrinks"),
          link: "/all-products/energy-isotonic-drinks",
        },
        { label: translate("energyBars"), link: "/all-products/energy-bars" },
        { label: translate("energyGels"), link: "/all-products/energy-gels" },
        {
          label: translate("caffeinatedDrinks"),
          link: "/all-products/caffeinated-drinks",
        },
      ],
    },
    {
      label: translate("gainers"),
      link: "/all-products/gainers",
      subItems: [
        {
          label: translate("muscleMassFastGain"),
          link: "/all-products/muscle-mass-fast-gain",
        },
        {
          label: translate("muscleMassQualityGain"),
          link: "/all-products/muscle-mass-quality-gain",
        },
        { label: translate("recovery"), link: "/all-products/recovery" },
      ],
    },
    {
      label: "PRE-WORKOUT",
      link: "/all-products/pre-workout",
      subItems: [
        {
          label: translate("strengthEnergyPump"),
          link: "/all-products/strength-energy-pump",
        },
        {
          label: translate("endurance"),
          link: "/all-products/endurance-enhancers",
        },
        { label: translate("mentalFocus"), link: "/all-products/mental-focus" },
      ],
    },
    {
      label: translate("hormoneBoosters"),
      link: "/all-products/hormone-boosters",
      subItems: [
        { label: translate("tribulus"), link: "/all-products/tribulus" },
        { label: translate("daa"), link: "/all-products/daa" },
        {
          label: translate("multiFormulas"),
          link: "/all-products/multi-formulas",
        },
      ],
    },
  ];

  const protein = [
    {
      label: translate("proteins"),
      link: "/all-products/proteins",
      subItems: [
        { label: translate("whey"), link: "/all-products/whey" },
        {
          label: translate("eggWhiteProtein"),
          link: "/all-products/egg-white-protein",
        },
        { label: translate("isolate"), link: "/all-products/isolate" },
        {
          label: translate("proteinBlends"),
          link: "/all-products/protein-blends",
        },
        { label: translate("casein"), link: "/all-products/casein" },
        {
          label: translate("veganProtein"),
          link: "/all-products/vegan-protein",
        },
        { label: translate("beefProtein"), link: "/all-products/beef-protein" },
        {
          label: translate("readyToDrink"),
          link: "/all-products/ready-to-drink",
        },
        { label: translate("proteinBars"), link: "/all-products/protein-bars" },
        {
          label: translate("proteinSnaks"),
          link: "/all-products/protein-snaks",
        },
      ],
    },
    {
      label: translate("gainers"),
      link: "/all-products/gainers",
      subItems: [
        {
          label: translate("muscleMassFastGain"),
          link: "/all-products/muscle-mass-fast-gain",
        },
        {
          label: translate("muscleMassQualityGain"),
          link: "/all-products/muscle-mass-quality-gain",
        },
        { label: translate("recovery"), link: "/all-products/recovery" },
      ],
    },
  ];

  const weightLoss = [
    {
      label: translate("weightLoss"),
      link: "/all-products/weight-loss",
      subItems: [
        { label: translate("fatBurners"), link: "/all-products/fat-burners" },
        {
          label: translate("carnitine"),
          link: "/all-products/carnitine-weight",
        },
        { label: translate("cla"), link: "/all-products/cla" },
        { label: translate("greenTea"), link: "/all-products/green-tea" },
        { label: translate("guiltFree"), link: "/all-products/guilt-free" },
        {
          label: translate("mealReplacement"),
          link: "/all-products/meal-replacement",
        },
        {
          label: translate("proteinBars"),
          link: "/all-products/protein-bars-weight",
        },
      ],
    },
  ];

  const vitamins = [
    {
      label: translate("vitamins"),
      link: "/all-products/vitamins",
      subItems: [
        { label: translate("vitaminC"), link: "/all-products/vitamin-c" },
        { label: translate("vitaminD"), link: "/all-products/vitamin-d" },
        { label: translate("bComplex"), link: "/all-products/b-complex" },
      ],
    },
    {
      label: translate("minerals"),
      link: "/all-products/minerals",
      subItems: [
        { label: translate("magnesium"), link: "/all-products/magnesium" },
        { label: translate("zinc"), link: "/all-products/zinc" },
      ],
    },
    {
      label: translate("purpose"),
      link: "/all-products/purpose",
      subItems: [
        {
          label: translate("imuneSystem"),
          link: "/all-products/immune-system",
        },
        {
          label: translate("bonesAndJoints"),
          link: "/all-products/bones-and-joints",
        },
        {
          label: translate("hairAndSkin"),
          link: "/all-products/hair-and-skin",
        },
        { label: translate("digestion"), link: "/all-products/digestion" },
        { label: translate("sleep"), link: "/all-products/sleep" },
        { label: translate("antiAging"), link: "/all-products/anti-aging" },
        { label: translate("stress"), link: "/all-products/stress" },
      ],
    },
    { label: translate("antioxidants"), link: "/all-products/antioxidants" },
    { label: translate("omega3"), link: "/all-products/omega-3" },
    { label: translate("collagen"), link: "/all-products/collagen" },
  ];

  const snacks = [
    {
      label: translate("snacks"),
      link: "/all-products/snacks",
      subItems: [
        { label: translate("muesli"), link: "/all-products/muesli" },
        { label: translate("snacks"), link: "/all-products/snacks" },
        { label: translate("pancakes"), link: "/all-products/pancakes" },
        { label: translate("pudding"), link: "/all-products/pudding" },
        { label: translate("calorieFree"), link: "/all-products/calorie-free" },
        { label: translate("spreads"), link: "/all-products/spreads" },
        { label: translate("oils"), link: "/all-products/oils" },
        { label: translate("energyBars"), link: "/all-products/energy-bars" },
        { label: translate("proteinBars"), link: "/all-products/protein-bars" },
      ],
    },
    {
      label: translate("drinks"),
      link: "/all-products/drinks",
      subItems: [
        {
          label: translate("drinksWithCarnitine"),
          link: "/all-products/drinks-with-carnitine",
        },
        {
          label: translate("instantDrinks"),
          link: "/all-products/instant-drinks",
        },
        {
          label: translate("energyIsotonicDrinks"),
          link: "/all-products/energy-isotonic-drinks",
        },
        {
          label: translate("mealReplacement"),
          link: "/all-products/meal-replacement-drinks",
        },
      ],
    },
  ];

  const accessories = [
    {
      label: translate("trainingEquipment"),
      link: "/all-products/training-equipment",
      subItems: [
        { label: translate("weights"), link: "/all-products/weights" },
        {
          label: translate("trainingBandsAndLoop"),
          link: "/all-products/training-bands-loops",
        },
        { label: translate("gloves"), link: "/all-products/gloves" },
        { label: translate("belts"), link: "/all-products/belts" },
        { label: translate("other"), link: "/all-products/other-equipment" },
      ],
    },
    {
      label: translate("fightGear"),
      link: "/all-products/fight-gear",
      subItems: [
        {
          label: translate("boxingGloves"),
          link: "/all-products/boxing-gloves",
        },
        { label: translate("handWraps"), link: "/all-products/hand-wraps" },
        {
          label: translate("punchingBags"),
          link: "/all-products/punching-bags",
        },
      ],
    },
    {
      label: translate("accessories"),
      link: "/all-products/accessories",
      subItems: [
        { label: translate("shakers"), link: "/all-products/shakers" },
        { label: translate("bidons"), link: "/all-products/bidons" },
        { label: translate("bottles"), link: "/all-products/bottles" },
        { label: translate("bags"), link: "/all-products/bags" },
        { label: translate("towels"), link: "/all-products/towels" },
        { label: translate("other"), link: "/all-products/other-accessories" },
      ],
    },
  ];

  const clothing = [
    {
      label: translate("mensClothing"),
      link: "/all-products/mens-clothing",
      subItems: [
        { label: translate("tShirts"), link: "/all-products/t-shirts-mens" },
        {
          label: translate("pulloversAndZipHoodies"),
          link: "/all-products/pullovers-hoodies-mens",
        },
        {
          label: translate("pantsAndTights"),
          link: "/all-products/pants-tights",
        },
        { label: translate("shorts"), link: "/all-products/shorts-mens" },
        { label: translate("other"), link: "/all-products/other-mens" },
      ],
    },
    {
      label: translate("womensClothing"),
      link: "/all-products/womens-clothing",
      subItems: [
        { label: translate("tShirts"), link: "/all-products/t-shirts-womens" },
        {
          label: translate("pulloversAndZipHoodies"),
          link: "/all-products/pullovers-hoodies-womens",
        },
        { label: translate("pants"), link: "/all-products/pants-womens" },
        { label: translate("tights"), link: "/all-products/tights" },
        {
          label: translate("sportsTshirtsAndTops"),
          link: "/all-products/sports-tops",
        },
        { label: translate("shorts"), link: "/all-products/shorts-womens" },
        { label: translate("other"), link: "/all-products/other-womens" },
      ],
    },
    { label: translate("kidsClothes"), link: "/all-products/kids-clothes" },
  ];

  // Update the brandItems in Header.jsx to use /all-products?brand=slug format

  const brandItems = [
    {
      subItems: [
        { label: "5% Nutrition", link: "/all-products?brand=5-nutrition" },
        { label: "ä Näno", link: "/all-products?brand=a-nano" },
        { label: "AK-47 Labs", link: "/all-products?brand=ak-47-labs" },
        {
          label: "Applied Nutrition",
          link: "/all-products?brand=applied-nutrition",
        },
        { label: "ATOMBODY", link: "/all-products?brand=atombody" },
        {
          label: "Battery Nutrition",
          link: "/all-products?brand=battery-nutrition",
        },
        { label: "BioTechUSA", link: "/all-products?brand=bio-tech-usa" },
        { label: "Body Attack", link: "/all-products?brand=body-attack" },
        { label: "Bolero", link: "/all-products?brand=bolero" },
        { label: "BSN", link: "/all-products?brand=bsn" },
        { label: "Cellucor", link: "/all-products?brand=cellucor" },
        { label: "CHIMPANZEE", link: "/all-products?brand=chimpanzee" },
        { label: "CNP", link: "/all-products?brand=cnp" },
        {
          label: "Dedicated Nutrition",
          link: "/all-products?brand=dedicated-nutrition",
        },
        { label: "DNA", link: "/all-products?brand=dna" },
        { label: "DY Nutrition", link: "/all-products?brand=dy-nutrition" },
        { label: "EHPlabs", link: "/all-products?brand=ehplabs" },
        { label: "German Forge", link: "/all-products?brand=german-forge" },
      ],
    },
    {
      subItems: [
        { label: "Green Cola", link: "/all-products?brand=green-cola" },
        { label: "Haribo", link: "/all-products?brand=haribo" },
        { label: "IronMaxx", link: "/all-products?brand=ironmaxx" },
        { label: "Lenny & Larry", link: "/all-products?brand=lenny-larry" },
        { label: "Liverpool F.C.", link: "/all-products?brand=liverpool-f-c" },
        { label: "Mars", link: "/all-products?brand=mars" },
        { label: "MuscleTech", link: "/all-products?brand=muscletech" },
        { label: "Naughty Boy", link: "/all-products?brand=naughty-boy" },
        { label: "NEBBIA", link: "/all-products?brand=nebbia" },
        { label: "NOCCO", link: "/all-products?brand=nocco" },
        { label: "NOW Foods", link: "/all-products?brand=now-foods" },
        { label: "Nutrend", link: "/all-products?brand=nutrend" },
        {
          label: "Nutrex Research",
          link: "/all-products?brand=nutrex-research",
        },
        {
          label: "Olimp Sport Nutrition",
          link: "/all-products?brand=olimp-sport-nutrition",
        },
        {
          label: "Optimum Nutrition",
          link: "/all-products?brand=optimum-nutrition",
        },
        { label: "OstroVit", link: "/all-products?brand=ostrovit" },
        { label: "Perfect Meals", link: "/all-products?brand=perfect-meals" },
        { label: "PharmaFreak", link: "/all-products?brand=pharmafreak" },
      ],
    },
    {
      subItems: [
        { label: "Proteini.si", link: "/all-products?brand=proteini-si" },
        { label: "PVL", link: "/all-products?brand=pvl" },
        { label: "RABEKO", link: "/all-products?brand=rabeko" },
        { label: "Redcon1", link: "/all-products?brand=redcon1" },
        { label: "RIPT", link: "/all-products?brand=ript" },
        {
          label: "Scitec Nutrition",
          link: "/all-products?brand=scitec-nutrition",
        },
        { label: "Scivation", link: "/all-products?brand=scivation" },
        { label: "Snickers", link: "/all-products?brand=snickers" },
        {
          label: "SPORTNAHRUNG.AT",
          link: "/all-products?brand=sportnahrung-at",
        },
        { label: "Swanson", link: "/all-products?brand=swanson" },
        { label: "THE Nutrition", link: "/all-products?brand=the-nutrition" },
        { label: "Tiger", link: "/all-products?brand=tiger" },
        {
          label: "Universal Nutrition",
          link: "/all-products?brand=universal-nutrition",
        },
        { label: "USN", link: "/all-products?brand=usn" },
        { label: "USP Labs", link: "/all-products?brand=usp-labs" },
        { label: "VAST Sports", link: "/all-products?brand=vast-sports" },
      ],
    },
  ];

  const sortBrandItemsByLabel = (items) =>
    [...items].sort((a, b) =>
      (a.label || "").localeCompare(b.label || "", undefined, {
        sensitivity: "base",
      }),
    );

  const splitBrandItemsIntoColumns = (items, columnCount = 3) => {
    const columnSize = Math.ceil(items.length / columnCount);
    return Array.from({ length: columnCount }, (_, index) => ({
      subItems: items.slice(index * columnSize, (index + 1) * columnSize),
    })).filter((column) => column.subItems.length > 0);
  };

  const displayedBrandItems =
    dynamicBrandColumns.length > 0
      ? dynamicBrandColumns
      : splitBrandItemsIntoColumns(
          sortBrandItemsByLabel(brandItems.flatMap((column) => column.subItems)),
        );

  const helper = [
    { label: translate("forWeightLoss"), link: "/all-products/weight-loss" },
    { label: translate("forMuscleMass"), link: "/all-products/gainers" },
    {
      label: translate("forMoreEndurance"),
      link: "/all-products/endurance-enhancers",
    },
    {
      label: translate("forHealthAndWellBeing"),
      link: "/all-products/vitamins",
    },
    { label: translate("bestSeller"), link: "/all-products?bestSeller=true" },
    { label: translate("new"), link: "/all-products?newProducts=true" },
    {
      label: translate("productsOnSale"),
      link: "/all-products?onSale=true",
      color: "text-[#BF243E]",
      hoverColor: "text-[#BF243E]",
    },
    {
      label: translate("outlet"),
      link: "/all-products?outlet=true",
      color: "text-[#000000]",
    },
  ];

  const offerItems = [
    { label: translate("productsOnSale"), link: "/all-products?onSale=true" },
    {
      label: translate("upcomingPromotions"),
      link: "/all-products?upcomingPromotions=true",
    },
    { label: translate("outlet"), link: "/all-products?outlet=true" },
    { label: translate("bestSeller"), link: "/all-products?bestSeller=true" },
    { label: translate("new"), link: "/all-products?newProducts=true" },
    { label: translate("giftVouchers"), link: "/all-products/gift-voucher" },
    { label: translate("allProducts"), link: "/all-products" },
  ];

  const fallbackPromoProducts = [
    {
      img: "/img/header/proteini.png",
      firstSpan: "USP LABS",
      secondSpan: "USPLABS JACK3D ADVENCED (NEW), 45 servings",
      thirdSpan: "VIEW",
      link: "/all-products?newProducts=true",
    },
    {
      img: "/img/header/proteini-2.jpg",
      firstSpan: "VAST SPORTS",
      secondSpan: "VAST CREATINE ULTRA PURE CAPS, 300 capsules",
      thirdSpan: "VIEW",
      link: "/all-products/creatine",
    },
    {
      img: "/img/new-in-the-shop/mynewwhey.jpg",
      firstSpan: "SPORTNAHRUNG.AT",
      secondSpan: "SPORTNAHRUNG EVERYDAY WHEY (NEW), 900g",
      thirdSpan: "VIEW",
      link: "/all-products/protein",
    },
    {
      img: "/img/new-in-the-shop/ironmaxx-protein.jpg",
      firstSpan: "IRONMAXX",
      secondSpan: "IRONMAXX 100% WHEY PROTEIN, 2350g",
      thirdSpan: "VIEW",
      link: "/all-products/protein",
    },
    {
      img: "/img/battery-complete-aminos-500g.jpg",
      firstSpan: "BATTERY NUTRITION",
      secondSpan: "BATTERY COMPLETE AMINOS, 500g",
      thirdSpan: "VIEW",
      link: "/all-products/amino-mix",
    },
    {
      img: "/img/battery-complete-hydration-250g.jpg",
      firstSpan: "BATTERY NUTRITION",
      secondSpan: "BATTERY COMPLETE HYDRATION, 250g",
      thirdSpan: "VIEW",
      link: "/all-products/isotonic-drinks",
    },
    {
      img: "/img/battery-supercharged-green-tea-250g.jpg",
      firstSpan: "BATTERY NUTRITION",
      secondSpan: "BATTERY SUPERCHARGED GREEN TEA, 250g",
      thirdSpan: "VIEW",
      link: "/all-products/fat-burners",
    },
    {
      img: "/img/battery-vitmin-antiox-90-capsules.jpg",
      firstSpan: "BATTERY NUTRITION",
      secondSpan: "BATTERY VITMIN ANTIOX, 90 capsules",
      thirdSpan: "VIEW",
      link: "/all-products/vitamins",
    },
  ];

  const promoProducts =
    randomProductPool.length > 0 ? randomProductPool : fallbackPromoProducts;

  const featuredBrandLogos = [
    {
      label: "Proteini.si",
      image: "/img/brands/brands-images-1.png",
      link: "/all-products?brand=proteini-si",
    },
    {
      label: "Battery Nutrition",
      image: "/img/brands/brands-images-2.png",
      link: "/all-products?brand=battery-nutrition",
    },
    {
      label: "USN",
      image: "/img/brands/brands-images-3.png",
      link: "/all-products?brand=usn",
    },
    {
      label: "IronMaxx",
      image: "/img/brands/brands-images-4.png",
      link: "/all-products?brand=ironmaxx",
    },
    {
      label: "Nutrend",
      image: "/img/brands/brands-images-5.png",
      link: "/all-products?brand=nutrend",
    },
    {
      label: "Scitec Nutrition",
      image: "/img/brands/brands-images-6.jpg",
      link: "/all-products?brand=scitec-nutrition",
    },
  ];

  // Mobile navigation items with their subitems
  const mobileNavItems = [
    {
      key: "sports-nutrition",
      title: translate("sportsNutrition"),
      subItems: sportItems,
    },
    { key: "protein", title: translate("protein"), subItems: protein },
    { key: "weightLoss", title: translate("weightLoss"), subItems: weightLoss },
    { key: "vitamins", title: translate("vitamins"), subItems: vitamins },
    { key: "snacks", title: translate("snacks"), subItems: snacks },
    {
      key: "accessories",
      title: translate("accessories"),
      subItems: accessories,
    },
    { key: "clothing", title: translate("clothing"), subItems: clothing },
    {
      key: "Brands",
      title: translate("brands"),
      subItems: displayedBrandItems.flatMap((column) => column.subItems),
    },
    { key: "OFFER", title: translate("offers"), subItems: offerItems },
  ];

  const formatMobileSubItemLabel = (categoryKey, label) =>
    categoryKey === "Brands" ? label : String(label || "").toUpperCase();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsSubMenuOpen(true);
  };

  const handleSubItemClick = (link) => {
    navigate(link);
    setIsMobileMenuOpen(false);
    setIsSubMenuOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const handleBackToMainMenu = () => {
    setIsSubMenuOpen(false);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  const renderOfferSection = (section) => {
    switch (section.sectionType) {
      case "image":
        return (
          <img
            key={section.id}
            src={getImageUrl(section.imagePath)}
            alt={section.title || `${translate("todaysOffer")}`}
            className="w-full mb-4"
            onError={(e) => {
              e.target.src = "/img/proteini-landing.jpg";
            }}
          />
        );
      case "title":
        return (
          <p key={section.id} className="text-[20px] font-bold mb-4">
            {section.title}
          </p>
        );
      case "paragraph":
        return (
          <p key={section.id} className="text-gray-600 mb-4 leading-relaxed">
            {section.content}
          </p>
        );
      case "highlight":
        return (
          <p key={section.id} className="text-[16px] font-semibold mb-2">
            <span className="font-bold">{section.title}:</span>{" "}
            {section.content}
          </p>
        );
      default:
        return null;
    }
  };

  // Render product item for mobile search
  const renderMobileProductItem = (product, index) => {
    const getImg = () =>
      product.Img || product.img || product.product_Img || "";
    const getName = () =>
      product.Name || product.name || product.product_Name || "Product";
    const getBrand = () =>
      product.BrandName || product.brandName || product.Brand_Name || "";
    const getFlavor = () =>
      product.FlavorName || product.flavorName || product.Flavor_Name || "";
    const getPrice = () => product.Price || product.price || 0;
    const getComparePrice = () =>
      product.Compare_Price || product.compare_Price || 0;
    const getServings = () => product.Servings || product.servings || 0;
    const getNewFlag = () =>
      product.NewInTheShop || product.newInTheShop || false;
    const getSaleFlag = () =>
      product.ProductsOnSale || product.productsOnSale || false;
    const getOutletFlag = () =>
      product.ProductsInTheOutlet || product.productsInTheOutlet || false;

    const regularPrice = getPrice();
    const discountedPrice = getComparePrice();
    const hasDiscount = discountedPrice > 0 && discountedPrice < regularPrice;
    const displayPrice = hasDiscount ? discountedPrice : regularPrice;

    return (
      <div
        key={
          product.Product_Id || product.product_Id || `mobile-search-${index}`
        }
        onClick={() => handleProductClick(product, true)}
        className="flex gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
      >
        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={getImg() ? `${getImg()}` : ""}
            alt={getName()}
                className="w-full h-full object-contain bg-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-[#2096D8] transition-colors">
                {getName()}
              </h3>
              {getBrand() && (
                <p className="text-xs text-gray-500 mt-0.5">{getBrand()}</p>
              )}
              {getFlavor() && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Flavor: {getFlavor()}
                </p>
              )}
            </div>
            <div className="text-right">
              {product.compare_Price &&
              product.compare_Price > 0 &&
              product.compare_Price < getPrice() ? (
                <>
                  <p className="text-xs text-gray-400 line-through">
                    MKD {getPrice().toFixed(2)}
                  </p>
                  <p className="text-[#2096D8] font-bold text-sm">
                    MKD {product.compare_Price.toFixed(2)}
                  </p>
                </>
              ) : (
                <div className="text-right">
                  {product.compare_Price &&
                  product.compare_Price > 0 &&
                  product.compare_Price < getPrice() ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">
                        MKD {getPrice().toFixed(2)}
                      </p>
                      <p className="text-[#2096D8] font-bold text-sm">
                        MKD {product.compare_Price.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-[#2096D8] font-bold text-sm whitespace-nowrap">
                      MKD {getPrice().toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {getServings() > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {getServings()} servings
            </p>
          )}
          <div className="flex gap-2 mt-2">
            {getNewFlag() && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                New
              </span>
            )}
            {getSaleFlag() && (
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Sale
              </span>
            )}
            {getOutletFlag() && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                Outlet
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Custom dropdown item render for brands with onClick
  const renderBrandDropdown = () => {
    return (
      <div className="absolute top-42 pt-[37px] pb-[80px] left-0 w-full flex justify-center bg-white shadow-lg z-50">
        <div className="w-full max-w-[1240px] flex items-start justify-center">
          <div className="w-full flex flex-col items-start">
            <div className="px-[15px] grid grid-cols-3 gap-24">
              {displayedBrandItems.map((column, colIndex) => (
                <div
                  key={`col-${colIndex}`}
                  className="flex flex-col gap-4 items-start"
                >
                  {column.subItems.map((item, index) => (
                    <div
                      key={`item-${item.label}-${index}`}
                      className="flex flex-col gap-2 items-start"
                    >
                      <button
                        onClick={item.onClick}
                        className="inline-block text-[14px] font-bold border-b border-transparent hover:border-[#FDC700]"
                      >
                        {item.label}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap items-center mt-[16px] pt-[12px] px-[15px]">
              {helper.map((helperItem, index) => (
                <React.Fragment key={`helper-${helperItem.label}-${index}`}>
                  <button
                    onClick={() => navigate(helperItem.link)}
                    className={`inline-block text-[13px] font-bold ${helperItem.color || "text-[#828282]"} ${helperItem.hoverColor || "hover:text-black"}`}
                  >
                    {helperItem.label}
                  </button>
                  {index !== helper.length - 1 && (
                    <span key={`sep-${index}`} className="text-gray-400">
                      |
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Promo */}
      <div className="w-full md:h-[39px] bg-[#FDC700] flex max-md:flex-col justify-center md:gap-2 gap-1 max-md:p-2 items-center p-[5px]">
        <p className="text-[12px] font-extrabold max-lg:font-bold">
          {translate("freeShipping")}
        </p>
        <button
          onClick={() => setIsOffersModalOpen(true)}
          className="bg-black text-white text-xs p-2 leading-none font-semibold"
        >
          {translate("exploreOffers")}
        </button>
      </div>

      {/* Modal */}
      {isOffersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 w-full max-w-[505px] h-full bg-white shadow-2xl animate-slide-in pt-[75px] px-[50px] pb-[40px] overflow-y-auto">
            <button
              onClick={() => setIsOffersModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <TfiClose size={20} color="black" />
            </button>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold mb-4">
                {translate("todaysOffer")}
              </h2>
              <div className="w-20 h-1 bg-[#FDC700] mb-6"></div>
              {offerLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDC700]"></div>
                </div>
              ) : offerSections.length > 0 ? (
                <div className="space-y-4 w-full">
                  {offerSections.map((section) => renderOfferSection(section))}
                  <button
                    className="bg-[#2096D8] text-white max-w-[270px] w-full py-2 text-[14px] mb-4 mx-auto"
                    onClick={() => navigate("/landing")}
                  >
                    {translate("shopHere")}
                  </button>
                </div>
              ) : (
                <>
                  <img src="/img/proteini-landing.jpg" className="mb-4" />
                  <p className="text-[20px] font-bold mb-4">
                    {translate("todaysOfferDesc")}
                  </p>
                  <p>{translate("aTrustedChoice")}</p>
                  <button
                    className="bg-[#2096D8] text-white max-w-[270px] w-full py-2 text-[14px] mb-4 mt-4"
                    onClick={() => navigate("/landing")}
                  >
                    {translate("shopHere")}
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOffersModalOpen(false)}
                className="mt-16 bg-[#E5E5E5] hover:bg-[#DADADA] text-black font-bold py-3 px-6 w-full"
              >
                {translate("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>

      {/* Sticky Header Container */}
      <div className="w-full bg-white z-40 max-lg:sticky top-0 shadow-sm sticky-header">
        {/* Main Header */}
        <div className="w-full flex justify-center lg:py-2.5 items-center">
          <div className="px-4 w-[1240px] h-[73px] flex justify-center max-lg:justify-between items-center gap-8 max-lg:gap-3">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-6 max-md:gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hidden max-lg:flex flex-col items-center justify-center w-6 h-6 gap-1"
              >
                <span
                  className={`w-4 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                ></span>
                <span
                  className={`w-4 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`w-4 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                ></span>
              </button>
              <img
                src="/logos/search.svg"
                className="w-4 h-4 lg:hidden cursor-pointer"
                alt="Search"
                onClick={() => setIsMobileSearchOpen(true)}
              />
            </div>
            <a href="/" onClick={handleHomeNavigation}>
              <img
                src="/logos/proteini.svg"
                className="cursor-pointer w-[400px] max-lg:w-[168px] max-lg:mr-0"
                alt="Logo"
              />
            </a>

            {/* Search Bar - Desktop */}
            <div
              className="w-full border-b border-gray-400 relative max-lg:flex-1 max-lg:hidden"
              ref={searchRef}
            >
              <img
                src="/logos/search.svg"
                className="w-4 absolute left-2.5 bottom-3"
                alt="Search"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchEnter}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="w-full outline-none pl-10 mt-2 pb-2 placeholder-black [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                placeholder={translate("findAProduct")}
              />

              {/* Search Results Dropdown - Desktop */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 divide-y divide-gray-100 p-2">
                      {searchResults.map((product, index) => {
                        const getImg = () =>
                          product.Img ||
                          product.img ||
                          product.product_Img ||
                          "";
                        const getName = () =>
                          product.Name ||
                          product.name ||
                          product.product_Name ||
                          "Product";
                        const getBrand = () =>
                          product.BrandName ||
                          product.brandName ||
                          product.Brand_Name ||
                          "";
                        const getFlavor = () =>
                          product.FlavorName ||
                          product.flavorName ||
                          product.Flavor_Name ||
                          "";
                        const getPrice = () =>
                          product.Price || product.price || 0;
                        const getServings = () =>
                          product.Servings || product.servings || 0;
                        const getNewFlag = () =>
                          product.NewInTheShop || product.newInTheShop || false;
                        const getSaleFlag = () =>
                          product.ProductsOnSale ||
                          product.productsOnSale ||
                          false;
                        const getOutletFlag = () =>
                          product.ProductsInTheOutlet ||
                          product.productsInTheOutlet ||
                          false;

                        return (
                          <div
                            key={
                              product.Product_Id ||
                              product.product_Id ||
                              `search-result-${index}`
                            }
                            onClick={() => handleProductClick(product, false)}
                            className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={getImg() ? `${getImg()}` : ""}
                                alt={getName()}
                                className="w-full h-full object-contain bg-white hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-[#2096D8] transition-colors">
                                    {getName()}
                                  </h3>
                                  {getBrand() && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {getBrand()}
                                    </p>
                                  )}
                                  {getFlavor() && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Flavor: {getFlavor()}
                                    </p>
                                  )}
                                </div>
                                {/* FIXED: Price display with discount support */}
                                <div className="text-right">
                                  {product.compare_Price &&
                                  product.compare_Price > 0 &&
                                  product.compare_Price < getPrice() ? (
                                    <>
                                      <p className="text-xs text-gray-400 line-through">
                                        MKD {getPrice().toFixed(2)}
                                      </p>
                                      <p className="text-[#2096D8] font-bold text-sm">
                                        MKD {product.compare_Price.toFixed(2)}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-[#2096D8] font-bold text-sm whitespace-nowrap">
                                      MKD {getPrice().toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {getServings() > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {getServings()} servings
                                </p>
                              )}
                              <div className="flex gap-2 mt-1.5">
                                {getNewFlag() && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    New
                                  </span>
                                )}
                                {getSaleFlag() && (
                                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                    Sale
                                  </span>
                                )}
                                {getOutletFlag() && (
                                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                    Outlet
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    searchTerm && (
                      <div className="p-8 text-center text-gray-500">
                        <p className="mb-2">
                          No products found for "{searchTerm}"
                        </p>
                        <p className="text-xs">
                          Try searching with different keywords
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Desktop Icons */}
            <div className="lg:w-2/3 flex gap-4 lg:mt-2 justify-center items-center text-nowrap">
              <div
                className="flex flex-col items-center gap-1 cursor-pointer group max-lg:hidden"
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src={getFlagIcon()}
                  className="w-7 h-7"
                  alt="Language flag"
                />
                <div className="relative">
                  <p className="invisible font-semibold text-xs">
                    {translate("language")}
                  </p>
                  <p className="absolute inset-0 text-xs group-hover:font-semibold text-center">
                    {translate("language")}
                  </p>
                </div>
              </div>

              <a
                href="/sales-points"
                aria-label={translate("branches")}
                className="flex flex-col items-center gap-2.5 cursor-pointer mt-1 group max-lg:hidden"
              >
                <img
                  src="/logos/location.svg"
                  className="w-5 h-5"
                  alt=""
                />
                <div className="relative">
                  <p className="invisible font-semibold text-xs">
                    {translate("branches")}
                  </p>
                  <p className="absolute inset-0 text-xs group-hover:font-semibold text-center">
                    {translate("branches")}
                  </p>
                </div>
              </a>

              {isAuthenticated() ? (
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer mt-1 group"
                  onClick={handleProfileNavigation}
                >
                  <div className="w-7 h-7 mb-0.5 rounded-full bg-[#828282] flex items-center justify-center text-white text-xs font-bold">
                    {userInitials || "U"}
                  </div>
                  <div className="relative max-lg:hidden">
                    <p className="invisible font-semibold text-xs">
                      {translate("myAccount")}
                    </p>
                    <p className="absolute inset-0 text-xs group-hover:font-semibold whitespace-nowrap text-center">
                      {translate("myAccount")}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-1 cursor-pointer mt-1 group"
                  onClick={handleLoginNavigation}
                >
                  <img
                    src="/logos/profile.svg"
                    className="w-6 h-6 mb-0.5"
                    alt="Profile"
                  />
                  <div className="relative max-lg:hidden">
                    <p className="invisible font-semibold text-xs">
                      {translate("myAccount")}
                    </p>
                    <p className="absolute inset-0 text-xs group-hover:font-semibold">
                      {translate("myAccount")}
                    </p>
                  </div>
                </div>
              )}

              {isAuthenticated() && isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleAdminOrdersNavigation}
                  className="whitespace-nowrap bg-[#FDC700] px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-[#e6b600]"
                >
                  Admin Orders
                </button>
              )}

              <div
                className="flex flex-col items-center cursor-pointer group relative"
                onClick={handleCartNavigation}
              >
                <div className="relative">
                  <img
                    src="/logos/cart.svg"
                    className="w-8 h-8 lg:mb-0.5"
                    alt="Cart"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FDC700] text-black text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-sm">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <div className="relative max-lg:hidden">
                  <p className="invisible font-semibold text-xs">
                    {translate("shoppingCart")}
                  </p>
                  <p className="absolute inset-0 text-xs group-hover:font-semibold text-center">
                    {translate("shoppingCart")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="w-full max-lg:hidden bg-white">
          <div className="flex justify-center">
            <div className="max-w-[1240px] w-full h-[44px] flex items-center justify-between pl-4 pr-16">
              <div className="max-w-[1000px] w-full flex items-start lg:justify-between text-nowrap gap-8">
                <DropdownMenu
                  key="sports-nutrition"
                  title={translate("sportsNutrition")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[
                    sportItems.slice(0, 3),
                    sportItems.slice(3, 5),
                    sportItems.slice(5, 8),
                  ]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("sports-nutrition")}
                />
                <DropdownMenu
                  key="protein"
                  title={translate("protein")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[protein.slice(0, 1), protein.slice(1, 2)]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("proteins")}
                />
                <DropdownMenu
                  key="weightLoss"
                  title={translate("weightLoss")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[weightLoss.slice(0, 1)]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("weight-loss")}
                />
                <DropdownMenu
                  key="vitamins"
                  title={translate("vitamins")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[
                    vitamins.slice(0, 2),
                    vitamins.slice(2, 3),
                    vitamins.slice(3, 6),
                  ]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("vitamins")}
                />
                <DropdownMenu
                  key="snacks"
                  title={translate("snacks")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[snacks.slice(0, 1), snacks.slice(1, 2)]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("snacks")}
                />
                <DropdownMenu
                  key="accessories"
                  title={translate("accessories")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[
                    accessories.slice(0, 1),
                    accessories.slice(1, 2),
                    accessories.slice(2, 3),
                  ]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("accessories")}
                />
                <DropdownMenu
                  key="clothing"
                  title={translate("clothing")}
                  gridClass="grid-cols-3 gap-24"
                  columns={[
                    clothing.slice(0, 1),
                    clothing.slice(1, 2),
                    clothing.slice(2, 3),
                  ]}
                  helper={helper}
                  products={promoProducts}
                  onClick={() => handleProductNavigation("mens-clothing")}
                />

                <DropdownMenu
                  key="Brands"
                  title={translate("brands")}
                  gridClass="grid-cols-3 gap-24"
                  columns={displayedBrandItems.map((column) => column.subItems)}
                  helper={helper}
                  featuredBrands={featuredBrandLogos}
                  showItemImages={false}
                  uppercaseItems={false}
                />

                <DropdownMenu
                  key="OFFER"
                  title={translate("offers")}
                  gridClass="grid-cols-2 gap-24"
                  columns={[offerItems.slice(0, 4), offerItems.slice(4)]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileSearchOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileSearchOpen ? "opacity-50" : "opacity-0"}`}
          onClick={() => {
            setIsMobileSearchOpen(false);
            setMobileSearchTerm("");
            setShowMobileResults(false);
          }}
        />
        <div
          ref={mobileSearchRef}
          className={`absolute top-0 left-0 w-full h-full bg-white shadow-xl transition-transform duration-300 transform ${isMobileSearchOpen ? "translate-y-0" : "-translate-y-full"}`}
        >
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setMobileSearchTerm("");
                setShowMobileResults(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
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
            </button>
            <div className="flex-1 relative">
              <img
                src="/logos/search.svg"
                className="w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                alt="Search"
              />
              <input
                type="search"
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mobileSearchTerm.trim()) {
                    e.preventDefault();
                    const searchQuery = mobileSearchTerm.trim();
                    setIsMobileSearchOpen(false);
                    setMobileSearchTerm("");
                    navigate(
                      `/all-products?search=${encodeURIComponent(searchQuery)}`,
                    );
                  }
                }}
                autoFocus
                className="w-full outline-none pl-10 pr-4 py-3 rounded-lg bg-gray-100 text-base"
                placeholder={translate("findAProduct")}
              />
            </div>
          </div>
          <div className="h-full overflow-y-auto">
            {isMobileSearching ? (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8]"></div>
                <p className="mt-4 text-gray-500">Searching products...</p>
              </div>
            ) : showMobileResults && mobileSearchResults.length > 0 ? (
              <div className="p-2">
                {mobileSearchResults.map((product, index) =>
                  renderMobileProductItem(product, index),
                )}
              </div>
            ) : mobileSearchTerm && !isMobileSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <img
                  src="/logos/search.svg"
                  className="w-16 h-16 opacity-30 mb-4"
                  alt="No results"
                />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  No products found
                </p>
                <p className="text-sm text-gray-500">
                  We couldn't find any products matching "{mobileSearchTerm}"
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Try checking your spelling or use a different term
                </p>
              </div>
            ) : mobileSuggestedProducts.length > 0 ? (
              <div className="pb-24">
                <div className="px-4 pt-5 pb-2">
                  <p className="text-lg font-semibold text-gray-800">{translate("newProducts")}</p>
                  <p className="text-sm text-gray-500">{translate("searchSuggestionsHint")}</p>
                </div>
                {mobileSuggestedProducts.map((product, index) =>
                  renderMobileProductItem(product, index),
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <p className="text-lg font-medium text-gray-700">{translate("newProducts")}</p>
                <p className="text-sm text-gray-500 mt-2">{translate("searchSuggestionsHint")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Full Width Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-50" : "opacity-0"}`}
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsSubMenuOpen(false);
            setSelectedCategory(null);
          }}
        />
        <div
          ref={mobileMenuRef}
          className={`absolute top-0 left-0 w-full h-full bg-white shadow-xl transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isSubMenuOpen ? "hidden" : "block"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
          <div className="flex-1 overflow-y-auto h-[calc(100%-70px)]">
            <div className="p-4 border-b border-gray-100">
              {isAuthenticated() ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#828282] flex items-center justify-center text-white text-sm font-bold">
                    {userInitials || "U"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user?.user_FullName || "User"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleProfileNavigation}
                        className="text-xs text-[#2096D8]"
                      >
                        View Profile
                      </button>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={handleAdminOrdersNavigation}
                          className="bg-[#FDC700] px-3 py-1.5 text-xs font-bold uppercase text-black"
                        >
                          Admin Orders
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLoginNavigation}
                  className="w-full py-2 bg-[#2096D8] text-white font-medium"
                >
                  Sign In / Register
                </button>
              )}
            </div>
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg"
              >
                <img src={getFlagIcon()} className="w-6 h-6" alt="Language" />
                <span className="flex-1 text-left">Change Language</span>
                <span className="text-gray-400">{language.toUpperCase()}</span>
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <a
                href="/sales-points"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg"
              >
                <img
                  src="/logos/location.svg"
                  className="w-5 h-5"
                  alt=""
                />
                <span>{translate("branches")}</span>
              </a>
            </div>
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {mobileNavItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleCategoryClick(item)}
                    className="flex items-center justify-between w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>{item.title}</span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <div className="space-y-2">
                {helper.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.link);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-1 text-sm hover:text-[#2096D8] transition-colors ${item.color || ""}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`absolute top-0 left-0 w-full h-full bg-white shadow-xl transition-transform duration-300 transform ${isSubMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={handleBackToMainMenu}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>
            <h2 className="text-lg font-semibold">{selectedCategory?.title}</h2>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSubMenuOpen(false);
                setSelectedCategory(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
          <div className="flex-1 overflow-y-auto h-[calc(100%-70px)] p-4">
            {selectedCategory?.subItems?.map((item, index) => (
              <div key={index} className="mb-6">
                <button
                  onClick={() => {
                    if (item.link) handleSubItemClick(item.link);
                  }}
                  className="w-full text-left font-semibold text-gray-800 py-2 mb-2 border-b border-gray-100"
                >
                  {formatMobileSubItemLabel(selectedCategory?.key, item.label)}
                </button>
                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-4 space-y-2">
                    {item.subItems.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => handleSubItemClick(subItem.link)}
                        className="block w-full text-left py-2 px-2 text-sm text-gray-600 hover:text-[#2096D8] hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {formatMobileSubItemLabel(
                          selectedCategory?.key,
                          subItem.label,
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="w-full flex justify-center">
        <div className="hidden md:block w-[1240px] h-[44px]">
          <div className="flex justify-between">
            <div className="flex gap-8 pl-12">
              {features.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-3"
                  onClick={feature.onClick}
                >
                  <img
                    src={feature.icon}
                    className={feature.iconClass}
                    alt={feature.id}
                  />
                  <a className="text-xs whitespace-nowrap cursor-pointer">
                    {feature.text}
                  </a>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pr-12">
              <img
                src={features[3].icon}
                className={features[3].iconClass}
                alt="Eye"
              />
              <a href="#" className="text-xs whitespace-nowrap">
                {features[3].text}
              </a>
            </div>
          </div>
        </div>
        <div className="md:hidden w-full px-4 bg-[#F1F1F1]">
          <div
            ref={carouselRef}
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={feature.icon}
                      className={feature.iconClass}
                      alt={feature.id}
                    />
                    <a href="#" className="text-xs whitespace-nowrap">
                      {feature.text}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-3">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 w-1.5 ${currentIndex === idx ? "bg-[#b9b5b5]" : "bg-gray-300"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <LanguageModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
}
