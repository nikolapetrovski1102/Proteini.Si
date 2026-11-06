// ProductDetail.jsx - Complete version with ALL sections including nutrition details
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import { descriptionFromLegacy } from "./productDescription";
import { formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { applySeoMetadata } from "../../utils/seo";

const EMPTY_NUTRITION = { columns: [], rows: [] };

const parsePackagingWeightGrams = (name) => {
  if (!name) return Number.MAX_SAFE_INTEGER;
  const match = String(name).match(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;

  return match[2].toLowerCase() === "kg" ? value * 1000 : value;
};

const getVariantWeightGrams = (variant) => {
  const configuredWeight = variant?.weight_Grams ?? variant?.weight_grams;
  if (configuredWeight && Number(configuredWeight) > 0) {
    return Number(configuredWeight);
  }

  return parsePackagingWeightGrams(variant?.packaging_Name);
};

const getCartWeightGrams = (variant) => {
  const weight = getVariantWeightGrams(variant);
  return Number.isFinite(weight) && weight > 0 && weight < Number.MAX_SAFE_INTEGER
    ? weight
    : null;
};

const sortPackagingsByWeight = (a, b) =>
  (a.weightGrams ?? parsePackagingWeightGrams(a.name)) -
  (b.weightGrams ?? parsePackagingWeightGrams(b.name));

function CollapsibleDescription({ html, showMoreLabel, showLessLabel }) {
  const [expanded, setExpanded] = useState(false);
  const textLength = String(html || "").replace(/<[^>]*>/g, "").trim().length;
  const canCollapse = textLength > 700;

  return (
    <div>
      <div className={`relative ${canCollapse && !expanded ? "max-h-[430px] overflow-hidden" : ""}`}>
        <div className="product-description" dangerouslySetInnerHTML={{ __html: html }} />
        {canCollapse && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 border border-[#2096D8] px-5 py-2 text-sm font-semibold text-[#2096D8] hover:bg-[#2096D8] hover:text-white"
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [imageDirection, setImageDirection] = useState("right");
  const [activeTab, setActiveTab] = useState("description");
  const [isScrolling, setIsScrolling] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const { translate, language } = useLanguage();
  const [voucherAmount, setVoucherAmount] = useState(500);
  const [nutritionResult, setNutritionResult] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Variant states
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const variantOptionType =
    selectedVariant?.option_Type === "color" ||
    (!selectedVariant && variants.some((variant) => variant.option_Type === "color"))
      ? "color"
      : "flavor";
  const variantOptionLabel = translate(variantOptionType);

  // Variant gallery images
  const [variantGalleryImages, setVariantGalleryImages] = useState({});
  const [loadingGallery, setLoadingGallery] = useState(false);

  // For right column (price & image) - using names instead of IDs
  const [selectedFlavorName, setSelectedFlavorName] = useState(null);
  const [selectedPackagingName, setSelectedPackagingName] = useState(null);

  // For nutrition section
  const [selectedFlavorForNutrition, setSelectedFlavorForNutrition] =
    useState(null);

  const packageVariants = variants.filter(
    (variant) => variant.packaging_Name === selectedPackagingName,
  );
  const availableFlavors = [
    ...new Map(
      packageVariants
        .filter((variant) => String(variant.flavor_Name || "").trim())
        .map((variant) => [
          variant.flavor_Name,
          { id: variant.flavor_Name, name: variant.flavor_Name },
        ]),
    ).values(),
  ];
  const [availablePackagings, setAvailablePackagings] = useState([]);

  // Check if user is logged in
  const isAuthenticated = api.isAuthenticated();

  // NEW: State to track if we're redirecting from a variant
  const [isVariantRedirect, setIsVariantRedirect] = useState(false);

  // Refs
  const variantImagesScrollRef = useRef(null);
  const descriptionRef = useRef(null);
  const nutritionRef = useRef(null);
  const instructionsRef = useRef(null);
  const tabsRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // NEW: Function to check if the ID is a variant and redirect to parent
  const checkAndRedirectVariant = async (productId) => {
    try {
      const data = await api.getProductById(productId);
      if (data && data.product) {
        return false;
      }
    } catch (err) {
      try {
        const variantResponse = await api.getVariantWithParent(productId);
        if (variantResponse && variantResponse.status && variantResponse.data) {
          const variant = variantResponse.data;
          navigate(
            `/product/${variant.Parent_Product_Id}?variant=${productId}`,
            { replace: true },
          );
          setIsVariantRedirect(true);
          return true;
        }
      } catch (variantErr) {
        console.error("Not a variant either:", variantErr);
        return false;
      }
    }
    return false;
  };

  // Check favorite status
  const checkFavoriteStatus = async () => {
    if (!isAuthenticated) return;

    const productIdToCheck =
      selectedVariant?.product_Id || productData?.product?.product_Id;
    if (!productIdToCheck) return;

    try {
      const response = await api.isFavorite(productIdToCheck);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      setIsFavorite(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert("Please login to add products to favorites");
      navigate("/login");
      return;
    }

    setFavoriteLoading(true);
    const productIdToToggle =
      selectedVariant?.product_Id || productData?.product?.product_Id;

    try {
      if (isFavorite) {
        await api.removeFromFavorites(productIdToToggle);
        setIsFavorite(false);
      } else {
        await api.addToFavorites(productIdToToggle);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Fetch variant gallery images
  const fetchVariantGallery = async (variantId) => {
    if (!variantId) return;
    setLoadingGallery(true);
    try {
      const data = await api.getVariantGallery(variantId);
      setVariantGalleryImages((prev) => ({
        ...prev,
        [variantId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching variant gallery:", error);
      setVariantGalleryImages((prev) => ({
        ...prev,
        [variantId]: [],
      }));
    } finally {
      setLoadingGallery(false);
    }
  };

  // Get all images for the selected variant
  const getSelectedVariantImages = () => {
    if (!selectedVariant) return [];

    const images = [];
    const gallery = variantGalleryImages[selectedVariant.variant_Id] || [];

    if (selectedVariant.variant_Image_Path) {
      images.push({
        image_Path: selectedVariant.variant_Image_Path,
        variant_Id: selectedVariant.variant_Id,
        flavor_Name: selectedVariant.flavor_Name,
        packaging_Name: selectedVariant.packaging_Name,
        price: calculatePriceWithDDV(
          selectedVariant.price,
          selectedVariant.ddv_Percentage,
        ),
        isMain: true,
      });
    }

    gallery.forEach((img) => {
      if (img.image_Path !== selectedVariant.variant_Image_Path) {
        images.push({
          image_Path: img.image_Path,
          variant_Id: selectedVariant.variant_Id,
          flavor_Name: selectedVariant.flavor_Name,
          packaging_Name: selectedVariant.packaging_Name,
          price: calculatePriceWithDDV(
            selectedVariant.price,
            selectedVariant.ddv_Percentage,
          ),
          isMain: img.isMain,
          gallery_Id: img.gallery_Id,
        });
      }
    });

    return images;
  };

  // Get all variant images from ALL variants
  const getAllVariantImages = () => {
    const images = [];
    variants.forEach((variant) => {
      if (variant.variant_Image_Path) {
        if (
          !images.some((img) => img.image_Path === variant.variant_Image_Path)
        ) {
          images.push({
            image_Path: variant.variant_Image_Path,
            variant_Id: variant.variant_Id,
            flavor_Name: variant.flavor_Name,
            packaging_Name: variant.packaging_Name,
            price: calculatePriceWithDDV(variant.price, variant.ddv_Percentage),
          });
        }
      }
    });
    return images;
  };

  // Helper function to calculate price with DDV
  const calculatePriceWithDDV = (basePrice, ddvPercentage) => {
    if (!basePrice) return 0;
    const ddvRate = (ddvPercentage || 0) / 100;
    return basePrice * (1 + ddvRate);
  };

  const allVariantImages = getAllVariantImages();
  const selectedVariantImages = getSelectedVariantImages();

  const scrollImagesUp = () => {
    if (variantImagesScrollRef.current) {
      if (window.innerWidth >= 768) {
        variantImagesScrollRef.current.scrollBy({
          top: -400,
          behavior: "smooth",
        });
      } else {
        variantImagesScrollRef.current.scrollBy({
          left: -120,
          behavior: "smooth",
        });
      }
    }
  };

  const scrollImagesDown = () => {
    if (variantImagesScrollRef.current) {
      if (window.innerWidth >= 768) {
        variantImagesScrollRef.current.scrollBy({
          top: 400,
          behavior: "smooth",
        });
      } else {
        variantImagesScrollRef.current.scrollBy({
          left: 120,
          behavior: "smooth",
        });
      }
    }
  };

  const syncNutritionToVariant = (variant) => {
    setSelectedFlavorForNutrition(variant?.flavor_Name ?? null);
  };

  const handleVariantImageClick = (imagePath, variantId) => {
    if (imagePath === mainImage) return;
    setImageDirection("right");
    setMainImage(imagePath);
    const variant = variants.find((v) => v.variant_Id === variantId);
    if (variant && selectedVariant?.variant_Id !== variant.variant_Id) {
      setSelectedVariant(variant);
      setSelectedFlavorName(variant.flavor_Name);
      setSelectedPackagingName(variant.packaging_Name);
      setQuantity(1);
      fetchVariantGallery(variant.variant_Id);
      syncNutritionToVariant(variant);
    }
  };

  const handleGalleryImageClick = (imagePath, variantId) => {
    if (imagePath === mainImage) return;

    const variant = variants.find((v) => v.variant_Id === variantId);

    if (variant && selectedVariant?.variant_Id !== variant.variant_Id) {
      setImageDirection("right");
      setMainImage(imagePath);
      setSelectedVariant(variant);
      setSelectedFlavorName(variant.flavor_Name);
      setSelectedPackagingName(variant.packaging_Name);
      setQuantity(1);
      fetchVariantGallery(variant.variant_Id);
      syncNutritionToVariant(variant);
    } else {
      setImageDirection("right");
      setMainImage(imagePath);
    }
  };

  const findBestMatchingVariant = (flavorName, packagingName) => {
    const matchingPackage = variants.filter(
      (variant) => variant.packaging_Name === packagingName,
    );
    return (
      matchingPackage.find(
        (variant) => variant.flavor_Name === flavorName &&
          variant.quantity > 0 && variant.isActive,
      ) ||
      matchingPackage.find((variant) => variant.quantity > 0 && variant.isActive) ||
      matchingPackage[0]
    );
  };

  const handleFlavorSelect = (flavorName) => {
    setSelectedFlavorName(flavorName);
    const bestVariant = findBestMatchingVariant(
      flavorName,
      selectedPackagingName,
    );
    syncNutritionToVariant(bestVariant);
    if (bestVariant && selectedVariant?.variant_Id !== bestVariant.variant_Id) {
      setSelectedVariant(bestVariant);
      setSelectedPackagingName(bestVariant.packaging_Name);
      setQuantity(1);
      fetchVariantGallery(bestVariant.variant_Id);
      if (
        bestVariant.variant_Image_Path &&
        bestVariant.variant_Image_Path !== mainImage
      ) {
        setImageDirection("left");
        setMainImage(bestVariant.variant_Image_Path);
      } else if (
        !bestVariant.variant_Image_Path &&
        productData?.product?.img !== mainImage
      ) {
        setImageDirection("left");
        setMainImage(productData?.product?.img || "");
      }
    }
  };

  const handlePackagingSelect = (packagingName) => {
    setSelectedPackagingName(packagingName);
    const bestVariant = findBestMatchingVariant(
      selectedFlavorName,
      packagingName,
    );
    syncNutritionToVariant(bestVariant);
    if (bestVariant && selectedVariant?.variant_Id !== bestVariant.variant_Id) {
      setSelectedVariant(bestVariant);
      setSelectedFlavorName(bestVariant.flavor_Name);
      setQuantity(1);
      fetchVariantGallery(bestVariant.variant_Id);
      if (
        bestVariant.variant_Image_Path &&
        bestVariant.variant_Image_Path !== mainImage
      ) {
        setImageDirection("left");
        setMainImage(bestVariant.variant_Image_Path);
      } else if (
        !bestVariant.variant_Image_Path &&
        productData?.product?.img !== mainImage
      ) {
        setImageDirection("left");
        setMainImage(productData?.product?.img || "");
      }
    }
  };

  const handleFlavorForNutritionSelect = (flavorName) => {
    if (selectedFlavorForNutrition === flavorName) return;
    if (!packageVariants.some((variant) => variant.flavor_Name === flavorName)) {
      return;
    }
    setSelectedFlavorForNutrition(flavorName);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const nutritionVariant = packageVariants.find(
    (variant) => variant.flavor_Name === selectedFlavorForNutrition,
  );
  const nutritionVariantId = nutritionVariant?.variant_Id;
  const nutritionMatchesSelection =
    nutritionResult && nutritionResult.variantId === nutritionVariantId;
  const variantNutritionData = nutritionMatchesSelection
    ? nutritionResult.data
    : EMPTY_NUTRITION;
  const loadingNutrition = Boolean(
    nutritionVariantId && !nutritionMatchesSelection,
  );

  useEffect(() => {
    if (!nutritionVariantId) return;
    let cancelled = false;
    const loadNutrition = async () => {
      let data = EMPTY_NUTRITION;
      try {
        const response = await api.getVariantNutritionTable(nutritionVariantId);
        if (response.status && response.data) data = response.data;
      } catch (error) {
        console.error("Error fetching variant nutrition:", error);
      }
      if (!cancelled) {
        setNutritionResult({ variantId: nutritionVariantId, data });
      }
    };
    loadNutrition();
    return () => {
      cancelled = true;
    };
  }, [nutritionVariantId]);

  // NEW: Get variant ID from URL query params
  const getVariantIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const variantParam = searchParams.get("variant");
    return variantParam ? parseInt(variantParam) : null;
  };

  // Main fetch function
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (isVariantRedirect) return;

        const isRedirecting = await checkAndRedirectVariant(id);
        if (isRedirecting) return;

        const data = await api.getProductById(id);
        setProductData(data);
        if (data.product?.img) {
          setMainImage(data.product.img);
        }

        if (data.variants && data.variants.length > 0) {
          setVariants(data.variants);

          const uniquePackagings = [
            ...new Map(
              data.variants.map((v) => [
                v.packaging_Name,
                {
                  id: v.packaging_Name,
                  name: v.packaging_Name,
                  weightGrams: getVariantWeightGrams(v),
                },
              ]),
            ).values(),
          ].sort(sortPackagingsByWeight);

          setAvailablePackagings(uniquePackagings);

          const variantIdFromUrl = getVariantIdFromUrl();
          let targetVariant = null;

          if (variantIdFromUrl) {
            targetVariant = data.variants.find(
              (v) => v.variant_Id === variantIdFromUrl,
            );
          }

          if (!targetVariant) {
            targetVariant =
              data.variants.find((v) => v.isDefault && v.isActive && v.quantity > 0) ||
              data.variants.find((v) => v.isActive && v.quantity > 0) ||
              data.variants.find((v) => v.isDefault) || data.variants[0];
          }

          if (targetVariant) {
            setSelectedVariant(targetVariant);
            setSelectedFlavorName(targetVariant.flavor_Name);
            setSelectedFlavorForNutrition(targetVariant.flavor_Name);
            setSelectedPackagingName(targetVariant.packaging_Name);
            if (targetVariant.variant_Image_Path) {
              setMainImage(targetVariant.variant_Image_Path);
            }
            await fetchVariantGallery(targetVariant.variant_Id);
          }
        } else {
          setVariants([]);
          setSelectedVariant(null);
          setSelectedFlavorName(null);
          setSelectedPackagingName(null);
          setSelectedFlavorForNutrition(null);
          setAvailablePackagings([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (id && !isVariantRedirect) {
      fetchProduct();
    }
  }, [id, isVariantRedirect]);

  // Check favorite status when product/variant loads
  useEffect(() => {
    if (productData?.product?.product_Id) {
      checkFavoriteStatus();
    }
  }, [productData?.product?.product_Id, selectedVariant?.variant_Id]);

  useEffect(() => {
    const product = productData?.product;
    if (!product) return undefined;

    const name =
      language === "al" && product.nameAl ? product.nameAl : product.name;
    const rawDescription =
      product.otherDescriptionText ||
      product.mainDescriptions ||
      `${name} – sportска исхрана и суплементи од Proteini.si.`;
    const description = String(rawDescription)
      .replace(/<[^>]*>/g, " ")
      .replaceAll("[", " ")
      .replaceAll("]", " ")
      .replace(/[{}"]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const imagePath = selectedVariant?.variant_Image_Path || product.img;
    const image = imagePath?.startsWith("http")
      ? imagePath
      : `https://proteini.mk${imagePath || "/img/proteini-landing.jpg"}`;

    return applySeoMetadata({
      title: `${name} | Proteini.si`,
      description,
      image,
      url: `https://proteini.mk/product/${product.product_Id}${
        selectedVariant?.variant_Id
          ? `?variant=${selectedVariant.variant_Id}`
          : ""
      }`,
    });
  }, [productData?.product, selectedVariant, language]);

  useEffect(() => {
    if (productData?.product?.isGiftVoucher) {
      setVoucherAmount(
        Number(productData.product.voucherMinAmount) ||
          Number(productData.product.price) ||
          500,
      );
    }
  }, [productData?.product]);

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-image.jpg";
    if (path.startsWith("http")) return path;
    return `https://proteini.mk${path}`;
  };

  const getMainDescriptions = () => {
    if (!productData?.product?.mainDescriptions) return [];
    try {
      const parsed = JSON.parse(productData.product.mainDescriptions);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [productData.product.mainDescriptions];
    }
  };

  const currentProduct = selectedVariant || productData?.product;

  // Calculate price with DDV
  let currentPrice = 0;
  let originalPrice = 0;
  const saleActive = isSaleActive(productData?.product);
  const saleEndDate = formatSaleEndDate(
    productData?.product,
    language === "al" ? "sq-AL" : "mk-MK",
  );

  if (selectedVariant) {
    if (
      saleActive &&
      selectedVariant.compare_Price &&
      selectedVariant.compare_Price > 0 &&
      selectedVariant.compare_Price < selectedVariant.price
    ) {
      currentPrice = selectedVariant.compare_Price;
      originalPrice = selectedVariant.price;
    } else {
      currentPrice = selectedVariant.price;
      originalPrice = selectedVariant.price;
    }
  } else if (productData?.product) {
    if (
      saleActive &&
      productData.product.compare_Price &&
      productData.product.compare_Price > 0 &&
      productData.product.compare_Price < productData.product.price
    ) {
      currentPrice = productData.product.compare_Price;
      originalPrice = productData.product.price;
    } else {
      currentPrice = productData.product.price;
      originalPrice = productData.product.price;
    }
  }

  if (productData?.product?.isGiftVoucher) {
    currentPrice = Number(voucherAmount) || 0;
    originalPrice = currentPrice;
  }

  let currentStock = 0;
  if (selectedVariant) {
    currentStock = selectedVariant.quantity || 0;
  } else if (productData?.product) {
    currentStock = productData.product.quantity || 0;
  }
  const loyaltyPercentage = Number(
    currentProduct?.loyaltyPercentage ??
      currentProduct?.loyalty_Percentage ??
      productData?.product?.loyaltyPercentage ??
      2,
  );
  const loyaltyPoints = Math.floor(
    currentPrice * quantity * (Number.isFinite(loyaltyPercentage) ? loyaltyPercentage : 2) / 100,
  );

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () =>
    setQuantity((prev) => Math.min(currentStock, prev + 1));
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setQuantity(1);
    } else {
      setQuantity(Math.max(1, Math.min(currentStock, value)));
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const productIdToAdd = productData?.product?.product_Id;

    let productDisplayName =
      language === "al" && productData?.product?.nameAl
        ? productData.product.nameAl
        : productData?.product?.name;
    if (selectedVariant) {
      productDisplayName = `${productData?.product?.name}`;
      if (selectedVariant.flavor_Name) {
        productDisplayName += ` - ${selectedVariant.flavor_Name}`;
      }
      if (selectedVariant.packaging_Name) {
        productDisplayName += ` (${selectedVariant.packaging_Name})`;
      }
    }

    const productForCart = {
      name: productDisplayName,
      img: selectedVariant?.variant_Image_Path || productData?.product?.img,
      price: currentPrice,
      isGiftVoucher: productData?.product?.isGiftVoucher || false,
      variant_Id: selectedVariant?.variant_Id || null,
      variant_Name: selectedVariant?.flavor_Name || null,
      variant_Packaging: selectedVariant?.packaging_Name || null,
      variant_Weight_Grams: getCartWeightGrams(selectedVariant),
      weight_Grams: getCartWeightGrams(selectedVariant),
    };

    const success = await addToCart(productIdToAdd, quantity, productForCart);
    setAdding(false);
    if (success) {
      alert(`${quantity} x ${productDisplayName} added to cart!`);
    }
  };

  const scrollToSection = useCallback((sectionRef, tabName) => {
    if (!sectionRef.current) return;
    if (window.innerWidth < 1024) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setActiveTab(tabName);
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      const element = sectionRef.current;
      const tabsHeight = tabsRef.current?.offsetHeight || 0;
      const offsetPosition =
        element.getBoundingClientRect().top +
        window.pageYOffset -
        tabsHeight -
        20;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 800);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      let ticking = false;
      let rafId = null;
      const handleScrollSpy = () => {
        if (ticking || isScrolling) return;
        ticking = true;
        rafId = requestAnimationFrame(() => {
          const sections = [
            { ref: descriptionRef, name: "description" },
            { ref: nutritionRef, name: "nutrition" },
            { ref: instructionsRef, name: "instructions" },
          ];
          const scrollPosition = window.scrollY + 250;
          let currentSection = "description";
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (
              section.ref.current &&
              scrollPosition >= section.ref.current.offsetTop - 50
            ) {
              currentSection = section.name;
              break;
            }
          }
          if (currentSection !== activeTab) setActiveTab(currentSection);
          ticking = false;
        });
      };
      window.addEventListener("scroll", handleScrollSpy, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScrollSpy);
        if (rafId) cancelAnimationFrame(rafId);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }
  }, [activeTab, isScrolling]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !productData?.product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 text-xl">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-[#2096D8] text-white rounded"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const { product } = productData;
  const mainDescriptions = getMainDescriptions();
  const useAlbanianContent = language === "al";
  const displayName =
    useAlbanianContent && product.nameAl ? product.nameAl : product.name;
  const descriptionHtml =
    useAlbanianContent && product.descriptionAl
      ? descriptionFromLegacy([product.descriptionAl], "", "")
      : descriptionFromLegacy(
          mainDescriptions,
          product.otherDescriptionTitle,
          product.otherDescriptionText,
        );
  const localizedNutritionIngredients =
    useAlbanianContent && product.nutritionValuesIngredientsAl
      ? product.nutritionValuesIngredientsAl
      : product.nutritionValuesIngredients;
  const localizedNutritionDescription =
    useAlbanianContent && product.nutritionValuesIngredientsDescriptionAl
      ? product.nutritionValuesIngredientsDescriptionAl
      : product.nutritionValuesIngredientsDescription;
  const localizedNutritionInformation =
    useAlbanianContent && product.nutritionInformationAl
      ? product.nutritionInformationAl
      : product.nutritionInformation;
  const localizedInstructionsTitle =
    useAlbanianContent && product.instructionsForUseAl
      ? product.instructionsForUseAl
      : product.instructionsForUse;
  const localizedInstructionsDescription =
    useAlbanianContent && product.instructionsForUseDescriptionAl
      ? product.instructionsForUseDescriptionAl
      : product.instructionsForUseDescription;
  const localizedDetailedInstructions =
    useAlbanianContent && product.instructionsOnHowToUseItAl
      ? product.instructionsOnHowToUseItAl
      : product.instructionsOnHowToUseIt;
  const hasVariants = variants.length > 0;
  const hasDescription = descriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasNutrition = Boolean(
    localizedNutritionIngredients ||
      localizedNutritionDescription ||
      localizedNutritionInformation ||
      nutritionVariant?.ingredients ||
      nutritionVariant?.nutrition_Info ||
      loadingNutrition ||
      variantNutritionData.columns?.length ||
      variantNutritionData.rows?.length,
  );
  const hasInstructions = Boolean(
    localizedInstructionsTitle ||
      localizedInstructionsDescription ||
      localizedDetailedInstructions,
  );

  const sections = [
    hasDescription && {
      id: "description",
      label: `${translate("description")}`,
      ref: descriptionRef,
    },
    hasNutrition && {
      id: "nutrition",
      label: `${translate("nutritionValues")}`,
      ref: nutritionRef,
    },
    hasInstructions && {
      id: "instructions",
      label: `${translate("instructionsForUse")}`,
      ref: instructionsRef,
    },
  ].filter(Boolean);

  return (
    <div className="w-full flex justify-center bg-gray-50">
      <div className="max-w-[1240px] py-12 px-4 w-full max-lg:flex max-lg:flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          <div className="flex flex-col items-center w-full lg:border-r border-[#E5E5E5]">
            {/* Breadcrumb */}
            <div className="text-[12px] text-gray-500 mb-[20px] w-full">
              <Link to="/" className="hover:text-[#2096D8]">
                Home
              </Link>{" "}
              /<span className="ml-1 text-gray-700">{displayName}</span>
            </div>

            {/* Product Image Gallery */}
            <div className="w-full flex flex-col md:flex-row gap-4 mb-8">
              {(allVariantImages.length > 0 ||
                selectedVariantImages.length > 0) && (
                <div className="relative flex flex-row md:flex-col items-center gap-2 w-full md:w-28 md:flex-shrink-0 order-2 md:order-1 mt-4 md:mt-0">
                  {(allVariantImages.length > 4 ||
                    selectedVariantImages.length > 4) && (
                    <button
                      onClick={scrollImagesUp}
                      className="hidden md:flex items-center justify-center w-8 h-8 bg-white shadow-md absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                    >
                      <img
                        src="/logos/arrow-up.svg"
                        className="w-6 h-6"
                        alt="Up"
                      />
                    </button>
                  )}
                  <div
                    ref={variantImagesScrollRef}
                    className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar md:max-h-[500px]"
                  >
                    {selectedVariantImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          handleGalleryImageClick(
                            img.image_Path,
                            img.variant_Id,
                          )
                        }
                        className={`cursor-pointer border p-1 flex-shrink-0 w-20 md:w-full ${
                          mainImage === img.image_Path
                            ? "border-[#2096D8]"
                            : "border-transparent hover:border-[#2096D8]"
                        }`}
                      >
                        <img
                          src={getImageUrl(img.image_Path)}
                          alt={img.flavor_Name || "Variant"}
                          className="w-full h-20 md:h-24 object-cover"
                        />
                        <div className="text-center text-xs mt-1 hidden md:block">
                          {img.flavor_Name?.substring(0, 50)}
                        </div>
                      </div>
                    ))}
                    {allVariantImages
                      .filter(
                        (img) => img.variant_Id !== selectedVariant?.variant_Id,
                      )
                      .map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            handleGalleryImageClick(
                              img.image_Path,
                              img.variant_Id,
                            )
                          }
                          className={`cursor-pointer border p-1 flex-shrink-0 w-20 md:w-full ${
                            mainImage === img.image_Path
                              ? "border-[#2096D8]"
                              : "border-transparent hover:border-[#2096D8]"
                          }`}
                        >
                          <img
                            src={getImageUrl(img.image_Path)}
                            alt={img.flavor_Name || "Variant"}
                            className="w-full h-20 md:h-24 object-cover"
                          />
                          <div className="text-center text-xs mt-1 hidden md:block truncate">
                            {img.flavor_Name?.substring(0, 15)}
                          </div>
                        </div>
                      ))}
                  </div>
                  {(allVariantImages.length > 4 ||
                    selectedVariantImages.length > 4) && (
                    <button
                      onClick={scrollImagesDown}
                      className="hidden md:flex items-center justify-center w-8 h-8 bg-white shadow-md absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                    >
                      <img
                        src="/logos/arrow-down.svg"
                        className="w-4 h-4"
                        alt="Down"
                      />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 flex justify-center order-1 md:order-2 overflow-hidden">
                <img
                  key={mainImage}
                  src={getImageUrl(mainImage || product.img)}
                  alt={displayName}
                  className="w-full object-cover max-w-[550px] max-h-[550px] shadow-lg transition-all duration-500 ease-in-out"
                  style={{
                    animation:
                      imageDirection === "left"
                        ? "slide-left 0.5s ease-out"
                        : imageDirection === "right"
                          ? "slide-right 0.5s ease-out"
                          : "none",
                  }}
                  onAnimationEnd={() => setImageDirection("")}
                />
              </div>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="block lg:hidden mb-8 w-full max-w-[600px] mx-auto">
              <div className="bg-white p-6 shadow-md rounded-xl">
                <h1 className="text-[26px] font-bold mb-2">{displayName}</h1>
                {product.shortExpiry && (
                  <p className="mb-3 inline-block bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                    {translate("shortExpiry")}
                    {product.expiryDate
                      ? ` · ${translate("bestBefore")} ${new Date(product.expiryDate).toLocaleDateString()}`
                      : ""}
                  </p>
                )}
                <p className="text-gray-500 text-sm mb-4">
                  {product.BrandName && `Brand: ${product.BrandName}`}
                  {selectedVariant?.flavor_Name &&
                    ` | ${variantOptionLabel}: ${selectedVariant.flavor_Name}`}
                  {selectedVariant?.packaging_Name &&
                    ` | ${translate("size")}: ${selectedVariant.packaging_Name}`}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex text-yellow-400">
                    <IoIosStarOutline />
                    <IoIosStarOutline />
                    <IoIosStarOutline />
                    <IoIosStarOutline />
                    <IoIosStarOutline />
                  </span>
                  <span className="text-xs text-gray-500">(0 reviews)</span>
                </div>

                {product.isGiftVoucher && (
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    {translate("voucherAmount")}
                    <input
                      type="number"
                      min={product.voucherMinAmount || 500}
                      max={product.voucherMaxAmount || undefined}
                      step="100"
                      value={voucherAmount}
                      onChange={(event) => setVoucherAmount(event.target.value)}
                      onBlur={() => {
                        const minimum = Number(product.voucherMinAmount) || 500;
                        const maximum = product.voucherMaxAmount
                          ? Number(product.voucherMaxAmount)
                          : Number.POSITIVE_INFINITY;
                        setVoucherAmount(Math.min(maximum, Math.max(minimum, Number(voucherAmount) || minimum)));
                      }}
                      className="mt-2 w-full border border-gray-300 px-3 py-2 text-lg font-semibold"
                    />
                    <span className="mt-1 block text-xs text-gray-500">
                      {translate("voucherMinimum")} {Number(product.voucherMinAmount || 500).toFixed(0)} MKD
                    </span>
                  </label>
                )}

                <div>
                  {originalPrice > 0 && originalPrice !== currentPrice && (
                    <p className="text-lg text-gray-400 line-through mb-1">
                      MKD {originalPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-[#2096D8] mb-4">
                    MKD {currentPrice.toFixed(2)}
                  </p>
                  {originalPrice > 0 && originalPrice !== currentPrice && (
                    <p className="text-sm text-green-600 mb-2">
                      Save MKD {(originalPrice - currentPrice).toFixed(2)} (
                      {Math.round(
                        ((originalPrice - currentPrice) / originalPrice) * 100,
                      )}
                      % off)
                    </p>
                  )}
                  {originalPrice > 0 && originalPrice !== currentPrice && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span className="bg-red-600 px-2 py-1 text-white">
                        {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% {translate("promotionBadge")}
                      </span>
                      {saleEndDate && (
                        <span className="text-red-600">{translate("saleEnds")} {saleEndDate}</span>
                      )}
                    </div>
                  )}
                </div>

                {hasVariants && availableFlavors.length > 0 && (
                  <FlavorImageSelector
                    flavors={availableFlavors}
                    variants={variants}
                    packageVariants={packageVariants}
                    selectedFlavorName={selectedFlavorName}
                    onSelect={handleFlavorSelect}
                    imageUrl={getImageUrl}
                    label={variantOptionLabel}
                  />
                )}

                {hasVariants && availablePackagings.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translate("packaging")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[...availablePackagings]
                        .sort(sortPackagingsByWeight)
                        .map((packaging) => {
                          const hasStock = variants.some(
                            (v) => v.packaging_Name === packaging.id &&
                              v.quantity > 0 && v.isActive,
                          );
                          const isSelected = selectedPackagingName === packaging.id;
                          return (
                            <button
                              key={packaging.id}
                              onClick={() =>
                                hasStock && handlePackagingSelect(packaging.id)
                              }
                              disabled={!hasStock}
                              className={`px-4 py-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? "bg-[#2096D8] text-white shadow-md"
                                  : hasStock
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {packaging.name}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="mb-2 flex justify-end text-xs font-semibold text-[#1b88c5]">
                  {loyaltyPoints} {translate("loyaltyPoints")}
                </div>
                <div className="flex gap-4">
                  <div className="flex border border-gray-300">
                    <button
                      onClick={decreaseQuantity}
                      disabled={currentStock === 0 || quantity <= 1}
                      className="w-[40px] py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={currentStock > 0 ? currentStock : 1}
                      disabled={currentStock === 0}
                      className="w-12 text-center border-x border-gray-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={currentStock === 0 || quantity >= currentStock}
                      className="w-[40px] py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || currentStock === 0}
                    className={`flex-1 py-2 font-semibold transition-colors max-sm:text-sm ${
                      currentStock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#FDC700] hover:bg-[#e7b700] text-black"
                    }`}
                  >
                    {adding
                      ? "Adding..."
                      : currentStock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className={`p-2 hover:bg-gray-50 transition-colors ${
                      favoriteLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
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

            {/* Mobile/Tablet Dropdown Sections */}
            <div className="w-full lg:hidden space-y-4 mb-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleDropdown(section.id)}
                    className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">
                      {section.label}
                    </span>
                    <span className="text-xl">
                      {openDropdown === section.id ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openDropdown === section.id ? "max-h-[2000px]" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 bg-gray-50 border-t">
                      {section.id === "description" && (
                        <CollapsibleDescription
                          html={descriptionHtml}
                          showMoreLabel={translate("showMore")}
                          showLessLabel={translate("showLess")}
                        />
                      )}
                      {section.id === "nutrition" && (
                        <>
                          {hasVariants && availableFlavors.length > 0 && (
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-3 border-b pb-3">
                                {availableFlavors.map((flavor) => {
                                  const isSelected =
                                    selectedFlavorForNutrition === flavor.id;
                                  return (
                                    <button
                                      key={flavor.id}
                                      onClick={() =>
                                        handleFlavorForNutritionSelect(
                                          flavor.id,
                                        )
                                      }
                                      className={`pb-2 text-sm font-medium transition-all ${
                                        isSelected
                                          ? "text-[#2096D8] border-b-2 border-[#2096D8]"
                                          : "text-gray-600 hover:text-[#2096D8]"
                                      }`}
                                    >
                                      {flavor.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* NUTRITION VALUES INGREDIENTS - ADDED */}
                          {localizedNutritionIngredients && (
                            <div className="mb-6">
                              <h4 className="font-semibold mb-3">
                                {translate("nutritionValuesIngredients")}
                              </h4>
                              <p className="whitespace-pre-line">
                                {localizedNutritionIngredients}
                              </p>
                            </div>
                          )}

                          {/* NUTRITION VALUES INGREDIENTS DESCRIPTION - ADDED */}
                          {localizedNutritionDescription && (
                            <div className="mb-6">
                              <p className="whitespace-pre-line">
                                {localizedNutritionDescription}
                              </p>
                            </div>
                          )}

                          {nutritionVariant?.ingredients && (
                            <div className="mb-6">
                              <h4 className="font-semibold mb-3">
                                {translate("ingredients1")}
                              </h4>
                              <p className="whitespace-pre-line">
                                {nutritionVariant.ingredients}
                              </p>
                            </div>
                          )}

                          {loadingNutrition ? (
                            <div className="text-center py-8 text-gray-500">
                              Loading nutrition data...
                            </div>
                          ) : variantNutritionData.columns &&
                            variantNutritionData.columns.length > 0 ? (
                            <div className="mt-6 overflow-x-auto">
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th
                                      className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                      aria-label={translate("nutritionValues")}
                                    />
                                    {variantNutritionData.columns.map(
                                      (col, idx) => (
                                        <th
                                          key={idx}
                                          className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                        >
                                          {col}
                                        </th>
                                      ),
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {variantNutritionData.rows.map(
                                    (row, rowIdx) => (
                                      <tr
                                        key={rowIdx}
                                        className={
                                          rowIdx % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                        }
                                      >
                                        <td className="border border-gray-300 px-4 py-2 font-medium">
                                          <div
                                            style={{
                                              paddingLeft: `${
                                                (row.indentLevel || 0) * 20
                                              }px`,
                                            }}
                                          >
                                            {row.rowLabel}
                                          </div>
                                        </td>
                                        {row.cells.map((cell, cellIdx) => (
                                          <td
                                            key={cellIdx}
                                            className="border border-gray-300 px-4 py-2"
                                          >
                                            {cell || "—"}
                                          </td>
                                        ))}
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No nutrition information available for this
                              flavor.
                            </div>
                          )}

                          {/* NUTRITION INFORMATION - ADDED */}
                          {localizedNutritionInformation && (
                            <div className="mt-6 pt-4 border-t">
                              <h4 className="font-semibold mb-3">
                                {translate("nutritionInformation")}
                              </h4>
                              <p className="whitespace-pre-line">
                                {localizedNutritionInformation}
                              </p>
                            </div>
                          )}

                          {nutritionVariant?.nutrition_Info && (
                            <div className="mt-6 pt-4 border-t">
                              <h4 className="font-semibold mb-3">
                                Additional Nutrition Information
                              </h4>
                              <p className="whitespace-pre-line">
                                {nutritionVariant.nutrition_Info}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {section.id === "instructions" && (
                        <>
                          {localizedInstructionsTitle && (
                            <p className="text-gray-600 mb-6">
                              {localizedInstructionsTitle}
                            </p>
                          )}
                          {localizedInstructionsDescription && (
                            <p className="text-gray-600">
                              {localizedInstructionsDescription}
                            </p>
                          )}
                          {/* DETAILED INSTRUCTIONS (instructionsOnHowToUseIt) - ADDED */}
                          {localizedDetailedInstructions && (
                            <div className="mt-6 pt-6 border-t">
                              <h4 className="font-semibold mb-3">
                                {translate("detailedInstructions")}
                              </h4>
                              <p className="whitespace-pre-line">
                                {localizedDetailedInstructions}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block w-full">
              <div
                ref={tabsRef}
                className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 w-full pt-6 border-t shadow-sm"
              >
                <div className="flex justify-center gap-8 border-b overflow-x-auto">
                  {sections.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.ref, tab.id)}
                      className={`relative pb-3 font-semibold whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-[#2096D8]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#2096D8] transition-transform ${
                          activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full mt-8 space-y-12">
                {/* Description Section */}
                {hasDescription && (
                  <div
                    ref={descriptionRef}
                    className="scroll-mt-24 animate-fadeIn"
                  >
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <h2 className="text-2xl font-bold mb-4">
                        {translate("description")}
                      </h2>
                      <div className="h-1 w-12 bg-[#2096D8] rounded-full mb-6"></div>
                      <CollapsibleDescription
                        html={descriptionHtml}
                        showMoreLabel={translate("showMore")}
                        showLessLabel={translate("showLess")}
                      />
                    </div>
                  </div>
                )}

                {/* Nutrition Section */}
                {hasNutrition && (
                <div ref={nutritionRef} className="scroll-mt-24 animate-fadeIn">
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">
                      {translate("nutritionValues")}
                    </h2>
                    <div className="h-1 w-12 bg-[#2096D8] rounded-full mb-6"></div>

                    {hasVariants && availableFlavors.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-3 border-b pb-3">
                          {availableFlavors.map((flavor) => {
                            const isSelected =
                              selectedFlavorForNutrition === flavor.id;
                            return (
                              <button
                                key={flavor.id}
                                onClick={() =>
                                  handleFlavorForNutritionSelect(flavor.id)
                                }
                                className={`pb-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? "text-[#2096D8] border-b-2 border-[#2096D8]"
                                    : "text-gray-600 hover:text-[#2096D8]"
                                }`}
                              >
                                {flavor.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* NUTRITION VALUES INGREDIENTS - ADDED */}
                    {localizedNutritionIngredients && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">
                          {translate("nutritionValuesIngredients")}
                        </h4>
                        <p className="whitespace-pre-line">
                          {localizedNutritionIngredients}
                        </p>
                      </div>
                    )}

                    {/* NUTRITION VALUES INGREDIENTS DESCRIPTION - ADDED */}
                    {localizedNutritionDescription && (
                      <div className="mb-6">
                        <p className="whitespace-pre-line">
                          {localizedNutritionDescription}
                        </p>
                      </div>
                    )}

                    {nutritionVariant?.ingredients && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">
                          {translate("ingredients1")}
                        </h4>
                        <p className="whitespace-pre-line">
                          {nutritionVariant.ingredients}
                        </p>
                      </div>
                    )}

                    {loadingNutrition ? (
                      <div className="text-center py-8 text-gray-500">
                        Loading nutrition data...
                      </div>
                    ) : variantNutritionData.columns &&
                      variantNutritionData.columns.length > 0 ? (
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th
                                className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                aria-label={translate("nutritionValues")}
                              />
                              {variantNutritionData.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="border border-gray-300 px-4 py-2 text-left font-semibold"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {variantNutritionData.rows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className={
                                  rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="border border-gray-300 px-4 py-2 font-medium">
                                  <div
                                    style={{
                                      paddingLeft: `${
                                        (row.indentLevel || 0) * 20
                                      }px`,
                                    }}
                                  >
                                    {row.rowLabel}
                                  </div>
                                </td>
                                {row.cells.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="border border-gray-300 px-4 py-2"
                                  >
                                    {cell || "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {translate("noNutritionInfo")}
                      </div>
                    )}

                    {/* NUTRITION INFORMATION - ADDED */}
                    {localizedNutritionInformation && (
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-semibold mb-3">
                          {translate("nutritionInformation")}
                        </h4>
                        <p className="whitespace-pre-line">
                          {localizedNutritionInformation}
                        </p>
                      </div>
                    )}

                    {nutritionVariant?.nutrition_Info && (
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-semibold mb-3">
                          Additional Nutrition Information
                        </h4>
                        <p className="whitespace-pre-line">
                          {nutritionVariant.nutrition_Info}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Instructions Section */}
                {hasInstructions && (
                  <div
                  ref={instructionsRef}
                  className="scroll-mt-24 animate-fadeIn"
                >
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">
                      {translate("instructionsForUse")}
                    </h2>
                    <div className="h-1 w-12 bg-[#2096D8] rounded-full mb-6"></div>
                    {localizedInstructionsTitle && (
                      <p className="text-gray-600 mb-6">
                        {localizedInstructionsTitle}
                      </p>
                    )}
                    {localizedInstructionsDescription && (
                      <p className="text-gray-600">
                        {localizedInstructionsDescription}
                      </p>
                    )}
                    {/* DETAILED INSTRUCTIONS (instructionsOnHowToUseIt) - ADDED */}
                    {localizedDetailedInstructions && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-3">
                          {translate("detailedInstructions")}
                        </h4>
                        <p className="whitespace-pre-line">
                          {localizedDetailedInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Desktop only */}
          <div className="hidden lg:block sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h1 className="text-[26px] font-bold mb-2">{displayName}</h1>
              {product.shortExpiry && (
                <p className="mb-3 inline-block bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  {translate("shortExpiry")}
                  {product.expiryDate
                    ? ` · ${translate("bestBefore")} ${new Date(product.expiryDate).toLocaleDateString()}`
                    : ""}
                </p>
              )}
              <p className="text-gray-500 text-sm mb-4">
                {product.BrandName && `Brand: ${product.BrandName}`}
                {selectedVariant?.flavor_Name &&
                  ` | ${variantOptionLabel}: ${selectedVariant.flavor_Name}`}
                {selectedVariant?.packaging_Name &&
                  ` | ${translate("size")}: ${selectedVariant.packaging_Name}`}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex text-yellow-400">
                  <IoIosStarOutline />
                  <IoIosStarOutline />
                  <IoIosStarOutline />
                  <IoIosStarOutline />
                  <IoIosStarOutline />
                </span>
                <span className="text-xs text-gray-500">(0 reviews)</span>
              </div>

              {product.isGiftVoucher && (
                <label className="mb-4 block text-sm font-medium text-gray-700">
                  {translate("voucherAmount")}
                  <input
                    type="number"
                    min={product.voucherMinAmount || 500}
                    max={product.voucherMaxAmount || undefined}
                    step="100"
                    value={voucherAmount}
                    onChange={(event) => setVoucherAmount(event.target.value)}
                    onBlur={() => {
                      const minimum = Number(product.voucherMinAmount) || 500;
                      const maximum = product.voucherMaxAmount
                        ? Number(product.voucherMaxAmount)
                        : Number.POSITIVE_INFINITY;
                      setVoucherAmount(Math.min(maximum, Math.max(minimum, Number(voucherAmount) || minimum)));
                    }}
                    className="mt-2 w-full border border-gray-300 px-3 py-2 text-lg font-semibold"
                  />
                  <span className="mt-1 block text-xs text-gray-500">
                    {translate("voucherMinimum")} {Number(product.voucherMinAmount || 500).toFixed(0)} MKD
                  </span>
                </label>
              )}

              <div>
                {originalPrice > 0 && originalPrice !== currentPrice && (
                  <p className="text-lg text-gray-400 line-through mb-1">
                    MKD {originalPrice.toFixed(2)}
                  </p>
                )}
                <p className="text-3xl font-bold text-[#2096D8] mb-4">
                  MKD {currentPrice.toFixed(2)}
                </p>
                {originalPrice > 0 && originalPrice !== currentPrice && (
                  <p className="text-sm text-green-600 mb-2">
                    Save MKD {(originalPrice - currentPrice).toFixed(2)} (
                    {Math.round(
                      ((originalPrice - currentPrice) / originalPrice) * 100,
                    )}
                    % off)
                  </p>
                )}
                {originalPrice > 0 && originalPrice !== currentPrice && (
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="bg-red-600 px-2 py-1 text-white">
                      {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% {translate("promotionBadge")}
                    </span>
                    {saleEndDate && (
                      <span className="text-red-600">{translate("saleEnds")} {saleEndDate}</span>
                    )}
                  </div>
                )}
              </div>

              {hasVariants && availableFlavors.length > 0 && (
                <FlavorImageSelector
                  flavors={availableFlavors}
                  variants={variants}
                  packageVariants={packageVariants}
                  selectedFlavorName={selectedFlavorName}
                  onSelect={handleFlavorSelect}
                  imageUrl={getImageUrl}
                  label={variantOptionLabel}
                />
              )}

              {hasVariants && availablePackagings.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translate("packaging")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[...availablePackagings]
                      .sort(sortPackagingsByWeight)
                      .map((packaging) => {
                        const hasStock = variants.some(
                          (v) => v.packaging_Name === packaging.id &&
                            v.quantity > 0 && v.isActive,
                        );
                        const isSelected =
                          selectedPackagingName === packaging.id;
                        return (
                          <button
                            key={packaging.id}
                            onClick={() =>
                              hasStock && handlePackagingSelect(packaging.id)
                            }
                            disabled={!hasStock}
                            className={`px-4 py-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-[#2096D8] text-white shadow-md"
                                : hasStock
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {packaging.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="mb-2 flex justify-end text-xs font-semibold text-[#1b88c5]">
                {loyaltyPoints} {translate("loyaltyPoints")}
              </div>
              <div className="flex gap-2">
                <div className="flex border border-gray-300">
                  <button
                    onClick={decreaseQuantity}
                    disabled={currentStock === 0 || quantity <= 1}
                    className="w-[40px] py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={currentStock > 0 ? currentStock : 1}
                    disabled={currentStock === 0}
                    className="w-12 text-center border-x border-gray-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                  />
                  <button
                    onClick={increaseQuantity}
                    disabled={currentStock === 0 || quantity >= currentStock}
                    className="w-[40px] py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding || currentStock === 0}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors text-nowrap ${
                    currentStock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#FDC700] hover:bg-[#e7b700] text-black"
                  }`}
                >
                  {adding
                    ? `${translate("adding")}`
                    : currentStock === 0
                      ? `${translate("outOfStock")}`
                      : `${translate("addToCart")}`}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`hover:bg-gray-50 transition-colors ${
                    favoriteLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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


        <ProductQuestionForm productName={displayName} />
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slide-left { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function FlavorImageSelector({
  flavors,
  variants,
  packageVariants,
  selectedFlavorName,
  onSelect,
  imageUrl,
  label,
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 block text-sm font-medium text-gray-700">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {flavors.map((flavor) => {
          const variant =
            packageVariants.find((item) => item.flavor_Name === flavor.id) ||
            variants.find((item) => item.flavor_Name === flavor.id);
          const hasStock = Boolean(
            variant && variant.quantity > 0 && variant.isActive,
          );
          const isSelected = selectedFlavorName === flavor.id;

          return (
            <button
              type="button"
              key={flavor.id}
              onClick={() => hasStock && onSelect(flavor.id)}
              disabled={!hasStock}
              aria-pressed={isSelected}
              className={`overflow-hidden border bg-white text-left transition-all ${
                isSelected
                  ? "border-[#2096D8] ring-2 ring-[#2096D8]/20"
                  : hasStock
                    ? "border-gray-200 hover:border-[#2096D8]"
                    : "cursor-not-allowed border-gray-100 opacity-45"
              }`}
            >
              <span className="flex h-20 items-center justify-center bg-white p-1">
                {variant?.variant_Image_Path ? (
                  <img
                    src={imageUrl(variant.variant_Image_Path)}
                    alt={flavor.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
              </span>
              <span className="block min-h-10 border-t border-gray-100 px-2 py-1.5 text-center text-[11px] leading-tight">
                {flavor.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductQuestionForm({ productName }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `Product question: ${productName}`;
    const body = [
      `Product: ${productName}`,
      `Name: ${form.get("name")}`,
      `Email: ${form.get("email")}`,
      "",
      String(form.get("question") || ""),
    ].join("\n");
    const link = document.createElement("a");
    link.href = `mailto:makedonija@proteini.si?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    setSubmitted(true);
  };

  return (
    <section className="mt-12 bg-white p-6 shadow-sm lg:p-8" aria-labelledby="product-question-title">
      <h2 id="product-question-title" className="mb-6 text-2xl font-bold">
        Frequently Asked Questions
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            autoComplete="name"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Question about {productName}
          <textarea
            name="question"
            required
            rows="5"
            className="resize-y border border-gray-300 px-3 py-2 outline-none focus:border-[#2096D8]"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" required className="mt-0.5 accent-[#FDC700]" />
          I agree that my details may be used to answer this product question.
        </label>
        <button
          type="submit"
          className="bg-[#FDC700] px-5 py-3 font-semibold text-black hover:bg-[#e7b700]"
        >
          Send a question
        </button>
        {submitted && (
          <p className="text-sm text-gray-600">
            Your email application has been opened with the product details filled in.
          </p>
        )}
      </form>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <div
      className="w-full flex justify-center bg-gray-50"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="max-w-[1240px] py-12 px-4 w-full animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          <div className="w-full">
            <div className="mb-[20px] h-3 w-40 bg-gray-200" />
            <div className="flex flex-col md:flex-row gap-4">
              <div className="order-2 md:order-1 flex flex-row md:flex-col gap-3 md:w-28">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 w-20 md:h-24 md:w-24 bg-gray-200" />
                ))}
              </div>
              <div className="order-1 md:order-2 flex-1 flex justify-center">
                <div className="aspect-square w-full max-w-[550px] bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="w-full max-w-[600px] mx-auto lg:max-w-none bg-white rounded-xl p-6 shadow-md space-y-4">
            <div className="h-7 w-3/4 bg-gray-200" />
            <div className="h-3 w-1/2 bg-gray-200" />
            <div className="h-4 w-1/3 bg-gray-200" />
            <div className="h-8 w-1/3 bg-gray-200" />
            <div className="h-10 w-full bg-gray-200" />
            <div className="h-10 w-full bg-gray-200" />
            <div className="h-11 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
