// ProductDetail.jsx - Complete version with ALL sections including nutrition details
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { IoIosStarOutline } from "react-icons/io";
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import { descriptionFromLegacy } from "./productDescription";
import { formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { applySeoMetadata } from "../../utils/seo";
import {
  getCartWeightGrams,
  getVariantWeightGrams,
  parsePackagingWeightGrams,
} from "../../utils/variantWeight";
import { BrandLoader } from "../Components/Loaders/BrandLoader";

const EMPTY_NUTRITION = { columns: [], rows: [] };

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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--card)] to-transparent" />
        )}
      </div>
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 rounded-full border border-current px-5 py-2 text-sm font-semibold hover:bg-[#FDC700] hover:border-[#FDC700] hover:text-[#141409]"
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
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const { translate, language } = useLanguage();
  const [voucherAmount, setVoucherAmount] = useState(500);
  const [nutritionResult, setNutritionResult] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef(null);

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
  const tabsRef = useRef(null);

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


  const nutritionVariant = packageVariants.find(
    (variant) => variant.flavor_Name === selectedFlavorForNutrition,
  );
  const nutritionVariantId = nutritionVariant?.variant_Id;
  const nutritionMatchesSelection =
    nutritionResult && nutritionResult.variantId === nutritionVariantId;
  const nutritionPending = Boolean(
    nutritionVariantId && !nutritionMatchesSelection,
  );
  // While the next variant's table loads, keep showing the previous one so the
  // page height doesn't collapse and jump (the "scroll stutter").
  const variantNutritionData = nutritionMatchesSelection
    ? nutritionResult.data
    : nutritionPending && nutritionResult
      ? nutritionResult.data
      : EMPTY_NUTRITION;
  const loadingNutrition = nutritionPending && !nutritionResult;

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
      setNutritionResult(null);
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

    // Failures surface as a cart toast from useCart.
    await addToCart(productIdToAdd, quantity, productForCart);
    setAdding(false);
  };

  // Show the sticky bottom bar whenever the main add-to-cart row is off screen.
  useEffect(() => {
    const element = ctaRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, productData?.product?.product_Id]);

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
            className="mt-4 rounded-full bg-[#141409] px-6 py-2.5 font-semibold text-white"
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
    },
    hasNutrition && {
      id: "nutrition",
      label: `${translate("nutritionValues")}`,
    },
    hasInstructions && {
      id: "instructions",
      label: `${translate("instructionsForUse")}`,
    },
  ].filter(Boolean);
  const currentTab = sections.some((section) => section.id === activeTab)
    ? activeTab
    : sections[0]?.id;

  // Headline macros per serving, taken from the variant nutrition table.
  const nutritionStats = (() => {
    const { columns = [], rows = [] } = variantNutritionData;
    if (!columns.length || !rows.length) return null;
    let column = columns.findIndex((label) =>
      /порциј|porcion|serving|скуп|doz/i.test(label || ""),
    );
    if (column < 0) column = 0;
    const isSubRow = (label) =>
      /од кои|заситени|шеќер|prej t|ngopur|sheqer|of which|saturat|sugar/i.test(label);
    const stats = [
      { key: "protein", match: /протеин|protein/i },
      { key: "energy", match: /енергиј|energji|energy|kcal/i },
      { key: "carbs", match: /јаглехидрат|karbohidrat|carbohydrat/i },
      { key: "fat", match: /масти|yndyr|fat/i },
    ]
      .map(({ key, match }) => {
        const row = rows.find(
          (item) =>
            match.test(item.rowLabel || "") && !isSubRow(item.rowLabel || ""),
        );
        let value = String(row?.cells?.[column] || "").trim();
        if (!value) return null;
        if (key === "energy") {
          const kcal = value.match(/([\d.,]+)\s*kcal/i);
          if (kcal) value = `${kcal[1]} kcal`;
        }
        return { key, label: row.rowLabel, value };
      })
      .filter(Boolean);
    return stats.length ? { column: columns[column], stats } : null;
  })();

  const priceForVariant = (variant) => {
    if (!variant) return 0;
    if (
      saleActive &&
      variant.compare_Price > 0 &&
      variant.compare_Price < variant.price
    ) {
      return variant.compare_Price;
    }
    return variant.price || 0;
  };
  const isVariantAvailable = (variant) =>
    Boolean(variant && variant.quantity > 0 && variant.isActive);

  const galleryImages = (() => {
    const seen = new Set();
    const list = [
      ...selectedVariantImages,
      ...allVariantImages.filter(
        (img) => img.variant_Id !== selectedVariant?.variant_Id,
      ),
    ].filter((img) => {
      if (!img.image_Path || seen.has(img.image_Path)) return false;
      seen.add(img.image_Path);
      return true;
    });
    return list.length
      ? list
      : [{ image_Path: product.img, variant_Id: selectedVariant?.variant_Id }];
  })();
  const activeImagePath = mainImage || product.img;
  const activeImageIndex = Math.max(
    0,
    galleryImages.findIndex((img) => img.image_Path === activeImagePath),
  );
  const stepImage = (direction) => {
    const next =
      galleryImages[
        (activeImageIndex + direction + galleryImages.length) %
          galleryImages.length
      ];
    if (!next) return;
    handleGalleryImageClick(next.image_Path, next.variant_Id);
    // slide-left enters from the right, slide-right enters from the left
    setImageDirection(direction > 0 ? "left" : "right");
  };

  const hasDiscount = originalPrice > 0 && originalPrice !== currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const isOutOfStock = currentStock === 0;
  const sortedPackagings = [...availablePackagings].sort(sortPackagingsByWeight);
  const allFlavorNames = [
    ...new Set(
      variants
        .map((variant) => String(variant.flavor_Name || "").trim())
        .filter(Boolean),
    ),
  ];
  const descriptionExcerpt = (() => {
    if (!hasDescription) return "";
    const body = new DOMParser().parseFromString(descriptionHtml, "text/html")
      .body;
    const blocks = [...body.querySelectorAll("p, li, h1, h2, h3, h4")]
      .map((node) => node.textContent.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((text) => (/[.!?:;]$/.test(text) ? text : `${text}.`));
    const text = blocks.length ? blocks.join(" ") : body.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  })();
  const selectionSummary = [
    selectedVariant?.flavor_Name,
    selectedVariant?.packaging_Name,
  ]
    .filter(Boolean)
    .join(" · ");
  const addToCartLabel = adding
    ? translate("adding")
    : isOutOfStock
      ? translate("outOfStock")
      : translate("addToCart");
  const formatPrice = (value) => `MKD ${Number(value || 0).toFixed(2)}`;

  const quantityStepper = (
    <div className="flex h-14 shrink-0 items-center rounded-full border border-gray-300 bg-white">
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={isOutOfStock || quantity <= 1}
        aria-label="-"
        className="h-full w-10 rounded-l-full sm:w-11 text-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleQuantityChange}
        min="1"
        max={currentStock > 0 ? currentStock : 1}
        disabled={isOutOfStock}
        aria-label={translate("quantity")}
        className="pdp-qty w-10 bg-transparent text-center font-semibold outline-none disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={increaseQuantity}
        disabled={isOutOfStock || quantity >= currentStock}
        aria-label="+"
        className="h-full w-10 rounded-r-full sm:w-11 text-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="pdp w-full bg-[var(--paper)] pb-40 lg:pb-28">
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-5 lg:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-5 text-[12px] text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[var(--ink)] hover:underline">
            {translate("home")}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700">{displayName}</span>
        </nav>

        {/* Hero: gallery + details side by side */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="md:sticky md:top-[calc(var(--header-h)+20px)]">
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white">
              <img
                key={activeImagePath}
                src={getImageUrl(activeImagePath)}
                alt={displayName}
                className={`h-full w-full object-contain p-6 sm:p-10 ${
                  nutritionStats ? "pb-24 sm:pb-28" : ""
                }`}
                style={{
                  animation:
                    imageDirection === "left"
                      ? "slide-left 0.35s ease-out"
                      : imageDirection === "right"
                        ? "slide-right 0.35s ease-out"
                        : "none",
                }}
                onAnimationEnd={() => setImageDirection("")}
              />

              {nutritionStats && (
                <div
                  className={`pointer-events-none absolute inset-x-3 bottom-3 grid grid-cols-4 gap-1.5 transition-opacity duration-200 sm:inset-x-4 sm:bottom-4 sm:gap-2 ${
                    nutritionPending ? "opacity-60" : "opacity-100"
                  }`}
                  aria-label={`${translate("nutritionValues")} · ${nutritionStats.column}`}
                >
                  {nutritionStats.stats.map((stat) => (
                    <div
                      key={stat.key}
                      className={`rounded-2xl px-1.5 py-2 text-center shadow-sm backdrop-blur-md sm:px-2 sm:py-2.5 ${
                        stat.key === "protein"
                          ? "bg-[#FDC700] text-[#141409]"
                          : "border border-gray-200/80 bg-white/85 text-[var(--ink)]"
                      }`}
                    >
                      <p className="text-[13px] font-bold leading-tight sm:text-base">
                        {stat.value}
                      </p>
                      <p
                        className={`mt-0.5 truncate text-[10px] font-semibold uppercase leading-tight tracking-wide sm:text-[11px] ${
                          stat.key === "protein" ? "" : "text-gray-500"
                        }`}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {hasDiscount && (
                <span className="absolute left-4 top-4 rounded-full bg-[#FDC700] px-3 py-1 text-xs font-bold text-[#141409]">
                  −{discountPercent}% {translate("promotionBadge")}
                </span>
              )}

              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                aria-pressed={isFavorite}
                aria-label="Favorite"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:scale-105 disabled:opacity-50"
              >
                {isFavorite ? (
                  <FaHeart size={18} className="text-[var(--ink)]" />
                ) : (
                  <FiHeart size={18} strokeWidth={2} className="text-[var(--ink)]" />
                )}
              </button>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepImage(-1)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:scale-105"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepImage(1)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:scale-105"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img) => {
                  const isActive = img.image_Path === activeImagePath;
                  return (
                    <button
                      type="button"
                      key={img.image_Path}
                      onClick={() =>
                        handleGalleryImageClick(img.image_Path, img.variant_Id)
                      }
                      aria-label={img.flavor_Name || displayName}
                      aria-current={isActive}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:h-20 sm:w-20 ${
                        isActive
                          ? "border-[var(--ink)]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getImageUrl(img.image_Path)}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            {product.BrandName && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                {product.BrandName}
              </p>
            )}
            <h1 className="font-display text-3xl font-semibold uppercase leading-tight text-[var(--ink)] lg:text-[40px]">
              {displayName}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <span className="flex text-[#FDC700]">
                <IoIosStarOutline />
                <IoIosStarOutline />
                <IoIosStarOutline />
                <IoIosStarOutline />
                <IoIosStarOutline />
              </span>
              <span className="text-xs text-gray-500">(0 reviews)</span>
            </div>

            {descriptionExcerpt && (
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
                {descriptionExcerpt}
              </p>
            )}
            {hasNutrition && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("nutrition");
                  tabsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="group mt-3 inline-flex items-center gap-1.5 border-b border-[var(--ink)] pb-0.5 text-sm font-semibold text-[var(--ink)]"
              >
                {translate("pdpSeeInside")}
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            )}

            {/* At a glance: flavours, sizes, stock */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              {allFlavorNames.length > 0 && (
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1.5">
                  {allFlavorNames.length}{" "}
                  {variantOptionType === "color"
                    ? translate("pdpColorsShort")
                    : translate("pdpFlavorsShort")}
                </span>
              )}
              {sortedPackagings.length > 0 && (
                <span className="rounded-full border border-gray-300 bg-white px-3 py-1.5">
                  {sortedPackagings.length} {translate("pdpSizesShort")}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                  isOutOfStock
                    ? "bg-red-50 text-red-700"
                    : "bg-[#FDC700] text-[#141409]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOutOfStock ? "bg-red-600" : "bg-[#141409]"
                  }`}
                />
                {isOutOfStock ? translate("outOfStock") : translate("pdpInStock")}
              </span>
              {product.shortExpiry && (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900">
                  {translate("shortExpiry")}
                  {product.expiryDate
                    ? ` · ${translate("bestBefore")} ${new Date(product.expiryDate).toLocaleDateString()}`
                    : ""}
                </span>
              )}
            </div>

            <div className="my-6 h-px bg-gray-200" />

            {product.isGiftVoucher && (
              <label className="mb-6 block text-sm font-semibold">
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
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[var(--ink)]"
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  {translate("voucherMinimum")} {Number(product.voucherMinAmount || 500).toFixed(0)} MKD
                </span>
              </label>
            )}

            {hasVariants && availableFlavors.length > 0 && (
              <FlavorImageSelector
                flavors={availableFlavors}
                variants={variants}
                packageVariants={packageVariants}
                selectedFlavorName={selectedFlavorName}
                onSelect={handleFlavorSelect}
                imageUrl={getImageUrl}
                label={variantOptionLabel}
                soldOutLabel={translate("outOfStock")}
              />
            )}

            {hasVariants && sortedPackagings.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold">
                  {translate("packaging")}:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedPackagingName}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sortedPackagings.map((packaging) => {
                    const variant = findBestMatchingVariant(
                      selectedFlavorName,
                      packaging.id,
                    );
                    const hasStock = variants.some(
                      (v) => v.packaging_Name === packaging.id && isVariantAvailable(v),
                    );
                    const isSelected = selectedPackagingName === packaging.id;
                    return (
                      <button
                        type="button"
                        key={packaging.id}
                        onClick={() => hasStock && handlePackagingSelect(packaging.id)}
                        disabled={!hasStock}
                        aria-pressed={isSelected}
                        className={`flex min-h-[76px] items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                          isSelected
                            ? "border-[var(--ink)] bg-[var(--card)] shadow-sm"
                            : hasStock
                              ? "border-gray-200 bg-[var(--card)] shadow-sm hover:border-gray-400"
                              : "cursor-not-allowed border-dashed border-gray-300 bg-[var(--card-muted)]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-[var(--ink)]"
                              : hasStock
                                ? "border-gray-300"
                                : "border-dashed border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`block text-base font-semibold leading-tight ${
                              hasStock ? "" : "text-gray-400 line-through"
                            }`}
                          >
                            {packaging.name}
                          </span>
                          <span
                            className={`mt-1 block text-sm ${
                              hasStock ? "text-gray-600" : "text-gray-400"
                            }`}
                          >
                            {hasStock
                              ? formatPrice(priceForVariant(variant))
                              : translate("outOfStock")}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-4 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {formatPrice(currentPrice)}
              </p>
              {hasDiscount && (
                <p className="pb-1 text-base text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </p>
              )}
              {hasDiscount && saleEndDate && (
                <p className="w-full text-xs font-semibold text-red-600">
                  {translate("saleEnds")} {saleEndDate}
                </p>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div ref={ctaRef} className="flex gap-3">
              {quantityStepper}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="pdp-cta flex h-14 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[15px] font-semibold sm:px-6 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiShoppingBag size={18} className="hidden shrink-0 sm:block" />
                {addToCartLabel}
              </button>
            </div>
            <p className="mt-3 text-center text-xs font-semibold text-gray-500">
              +{loyaltyPoints} {translate("loyaltyPoints")}
            </p>
          </div>
        </div>

        {/* Product content: description, nutrition, instructions (tabs) */}
        {sections.length > 0 && (
          <div
            ref={tabsRef}
            className="mt-12 scroll-mt-[calc(var(--header-h)+16px)] lg:mt-16"
          >
            <div
              role="tablist"
              aria-label={displayName}
              className="hide-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-gray-200 bg-[var(--card)] p-1.5 sm:inline-flex"
            >
              {sections.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    type="button"
                    role="tab"
                    key={tab.id}
                    id={`pdp-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`pdp-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-7 ${
                      isActive
                        ? "bg-[var(--ink)] text-[var(--paper)]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              key={currentTab}
              role="tabpanel"
              id={`pdp-panel-${currentTab}`}
              aria-labelledby={`pdp-tab-${currentTab}`}
              className="animate-fadeIn mt-4 rounded-3xl border border-gray-200 bg-[var(--card)] p-5 sm:p-8"
            >
              {currentTab === "description" && (
                <CollapsibleDescription
                  html={descriptionHtml}
                  showMoreLabel={translate("showMore")}
                  showLessLabel={translate("showLess")}
                />
              )}

              {currentTab === "nutrition" && (
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
                                  handleFlavorForNutritionSelect(flavor.id)
                                }
                                className={`pb-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? "text-[var(--ink)] border-b-2 border-[#FDC700]"
                                    : "text-gray-600 hover:text-[var(--ink)]"
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
                </>
              )}

              {currentTab === "instructions" && (
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
        )}

        <ProductQuestionForm productName={displayName} />
      </div>

      {/* Sticky bottom bar: options + price + add to cart */}
      <div
        aria-hidden={!showStickyBar}
        className={`pdp-bar fixed inset-x-0 bottom-[var(--bottom-nav-h,0px)] z-50 border-t border-gray-200 bg-white transition-all duration-300 ${
          showStickyBar
            ? "visible translate-y-0"
            : "invisible translate-y-full"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-2 px-4 py-2.5 md:flex-nowrap md:gap-4 md:py-3">
          <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
            <img
              src={getImageUrl(activeImagePath)}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 bg-white object-contain p-0.5"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              {selectionSummary && (
                <p className="truncate text-xs text-gray-500">{selectionSummary}</p>
              )}
            </div>
          </div>

          {hasVariants && (availableFlavors.length > 0 || sortedPackagings.length > 0) && (
            <div className="flex w-full gap-2 md:w-auto">
              {availableFlavors.length > 0 && (
                <label className="relative min-w-0 flex-1 md:w-48 md:flex-none">
                  <span className="sr-only">{variantOptionLabel}</span>
                  <select
                    value={selectedFlavorName || ""}
                    onChange={(event) => handleFlavorSelect(event.target.value)}
                    tabIndex={showStickyBar ? 0 : -1}
                    className="h-10 w-full appearance-none truncate rounded-full border border-gray-300 bg-white pl-4 pr-9 text-sm font-medium outline-none focus:border-[var(--ink)]"
                  >
                    {availableFlavors.map((flavor) => {
                      const variant = packageVariants.find(
                        (item) => item.flavor_Name === flavor.id,
                      );
                      return (
                        <option
                          key={flavor.id}
                          value={flavor.id}
                          disabled={!isVariantAvailable(variant)}
                        >
                          {flavor.name}
                        </option>
                      );
                    })}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </label>
              )}
              {sortedPackagings.length > 0 && (
                <label className="relative min-w-0 flex-1 md:w-36 md:flex-none">
                  <span className="sr-only">{translate("packaging")}</span>
                  <select
                    value={selectedPackagingName || ""}
                    onChange={(event) => handlePackagingSelect(event.target.value)}
                    tabIndex={showStickyBar ? 0 : -1}
                    className="h-10 w-full appearance-none truncate rounded-full border border-gray-300 bg-white pl-4 pr-9 text-sm font-medium outline-none focus:border-[var(--ink)]"
                  >
                    {sortedPackagings.map((packaging) => (
                      <option
                        key={packaging.id}
                        value={packaging.id}
                        disabled={
                          !variants.some(
                            (v) =>
                              v.packaging_Name === packaging.id &&
                              isVariantAvailable(v),
                          )
                        }
                      >
                        {packaging.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </label>
              )}
            </div>
          )}

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="min-w-0 flex-1 md:flex-none md:text-right">
              <p className="text-lg font-bold leading-tight text-[var(--ink)]">
                {formatPrice(currentPrice * quantity)}
              </p>
              {quantity > 1 && (
                <p className="text-[11px] text-gray-500">
                  {quantity} × {formatPrice(currentPrice)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              tabIndex={showStickyBar ? 0 : -1}
              className="pdp-cta flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm sm:px-6 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiShoppingBag size={16} />
              {addToCartLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pdp { --card: #ffffff; --card-muted: #ecebe6; --ink: #141409; --paper: #f6f5f1; --cta-bg: #141409; --cta-fg: #ffffff; --cta-hover: #2c2c22; }
        html[data-theme="dark"] .pdp { --card: var(--d-surface); --card-muted: var(--d-raised); --ink: #ececee; --paper: var(--d-bg); --cta-bg: #fdc700; --cta-fg: #141409; --cta-hover: #ffe066; }
        .pdp-cta { background: var(--cta-bg); color: var(--cta-fg); }
        .pdp-cta:not(:disabled):hover { background: var(--cta-hover); }
        .pdp-cta:not(:disabled):active { transform: scale(0.98); }
        .pdp-bar { box-shadow: 0 -10px 30px -18px rgba(20, 20, 9, 0.35); }
        .pdp-qty::-webkit-outer-spin-button, .pdp-qty::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .pdp-qty { -moz-appearance: textfield; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slide-left { from { transform: translateX(40%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(-40%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .pdp *, .pdp-bar { animation: none !important; transition: none !important; }
        }
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
  soldOutLabel,
}) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-sm font-semibold">
        {label}:{" "}
        <span className="font-normal text-gray-600">{selectedFlavorName}</span>
      </p>
      <div className="grid grid-cols-3 gap-3">
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
              title={hasStock ? flavor.name : `${flavor.name} · ${soldOutLabel}`}
              className={`group relative flex flex-col items-center rounded-2xl border-2 p-3 text-center transition ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--card)] shadow-sm"
                  : hasStock
                    ? "border-gray-200 bg-[var(--card)] shadow-sm hover:border-gray-400"
                    : "cursor-not-allowed border-dashed border-gray-300 bg-[var(--card-muted)]"
              }`}
            >
              <span className="flex h-24 w-full items-center justify-center sm:h-28">
                {variant?.variant_Image_Path ? (
                  <img
                    src={imageUrl(variant.variant_Image_Path)}
                    alt=""
                    className={`h-full w-full object-contain transition-transform ${
                      hasStock ? "group-hover:scale-105" : "opacity-40 grayscale"
                    }`}
                  />
                ) : (
                  <span
                    className={`h-10 w-10 rounded-full ${
                      hasStock ? "bg-[#FDC700]" : "bg-gray-300"
                    }`}
                  />
                )}
              </span>
              <span
                className={`mt-2 line-clamp-3 min-h-[2.5rem] break-words text-xs sm:line-clamp-2 font-semibold leading-tight sm:text-sm ${
                  hasStock ? "" : "text-gray-400"
                }`}
              >
                {flavor.name}
              </span>
              {!hasStock && (
                <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-dashed border-gray-300 bg-[var(--card)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {soldOutLabel}
                </span>
              )}
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
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 lg:p-8" aria-labelledby="product-question-title">
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
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Question about {productName}
          <textarea
            name="question"
            required
            rows="5"
            className="resize-y border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" required className="mt-0.5 accent-[#FDC700]" />
          I agree that my details may be used to answer this product question.
        </label>
        <button
          type="submit"
          className="rounded-full bg-[#FDC700] px-5 py-3 font-semibold text-[#141409] hover:bg-[#e7b700]"
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
      className="w-full bg-[#f6f5f1]"
      aria-busy="true"
      aria-label="Loading product"
    >
      <BrandLoader size={0} className="hidden" />
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-5 pb-12 opacity-60 lg:pt-8">
        <div className="mb-5 h-3 w-40 rounded bg-gray-200" />
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:gap-12">
          <div>
            <div className="aspect-square w-full rounded-3xl bg-gray-200" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-16 rounded-xl bg-gray-200 sm:h-20 sm:w-20" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-9 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-16 w-full rounded bg-gray-200" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-gray-200" />
              ))}
            </div>
            <div className="h-9 w-1/3 rounded bg-gray-200" />
            <div className="h-14 w-full rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
