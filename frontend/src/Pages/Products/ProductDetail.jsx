// ProductDetail.jsx - Complete version with ALL sections including nutrition details
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { IoIosStarOutline } from "react-icons/io";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import { descriptionFromLegacy } from "./productDescription";
import { discountPercent, formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { applySeoMetadata } from "../../utils/seo";
import {
  getCartWeightGrams,
  getVariantWeightGrams,
  parsePackagingWeightGrams,
} from "../../utils/variantWeight";
import { BrandLoader } from "../Components/Loaders/BrandLoader";
import ReferralOfferCard from "../Components/ReferralOfferCard";
import ProductRecommendations from "./ProductRecommendations";
import StickyOptionPicker from "./StickyOptionPicker";
import {
  offerAppliesTo,
  referralPrice,
  showsPerProductPrice,
  useReferralOffer,
} from "../../utils/referralOffer";
import { notify } from "../Components/Feedback/siteFeedback";
import Price from "../Components/Price";
import { Starburst } from "../HomePages/sections/Decor";
import { metaViewContent } from "../../services/metaPixel";

const EMPTY_NUTRITION = { columns: [], rows: [] };

const sortPackagingsByWeight = (a, b) =>
  (a.weightGrams ?? parsePackagingWeightGrams(a.name)) -
  (b.weightGrams ?? parsePackagingWeightGrams(b.name));

const CLOTHING_SIZE_ORDER = ["XXS", "XS", "S", "S/M", "M", "M/L", "L", "L/XL", "XL", "XXL", "2XL", "XXL/2XL", "XXXL", "3XL", "XXXL/3XL", "4XL"];
const clothingSizeRank = (name) => {
  const index = CLOTHING_SIZE_ORDER.indexOf(String(name || "").trim().toUpperCase());
  return index < 0 ? CLOTHING_SIZE_ORDER.length : index;
};
const sortClothingSizes = (a, b) =>
  clothingSizeRank(a.name) - clothingSizeRank(b.name) ||
  String(a.name).localeCompare(String(b.name), undefined, { numeric: true });

function CollapsibleDescription({ html, showMoreLabel, showLessLabel }) {
  const [expanded, setExpanded] = useState(false);
  const textLength = String(html || "").replace(/<[^>]*>/g, "").trim().length;
  const canCollapse = textLength > 700;

  return (
    <div>
      <div className={`relative ${canCollapse && !expanded ? "max-h-[430px] overflow-hidden" : ""}`}>
        <div className="product-description" dangerouslySetInnerHTML={{ __html: html }} />
        {canCollapse && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--paper)] to-transparent" />
        )}
      </div>
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 border-b border-current pb-0.5 text-sm font-semibold hover:opacity-70"
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
  const referralOffer = useReferralOffer();
  const [voucherAmount, setVoucherAmount] = useState(500);
  const [nutritionResult, setNutritionResult] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef(null);

  // Variant states
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  // Clothing: variants are colours and the "packaging" is the size; no nutrition or instructions.
  const isApparel = Boolean(productData?.product?.isApparel);
  const variantOptionType =
    isApparel ||
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
  // Clothes list every colour; those missing or sold out in the selected size are shown disabled.
  const colorSourceVariants = isApparel ? variants : packageVariants;
  const availableFlavors = [
    ...new Map(
      colorSourceVariants
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
  // Returns the loaded product data, or true when it redirected to the parent.
  const checkAndRedirectVariant = async (productId) => {
    try {
      const data = await api.getProductById(productId);
      if (data && data.product) {
        return data;
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
      notify(translate("favoritesLoginRequired"));
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
      notify(translate("favoritesUpdateFailed"), { tone: "error" });
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Fetch variant gallery images
  const fetchVariantGallery = async (variantId) => {
    if (!variantId) return;
    // Already loaded (switching back to a flavour/size seen before): no request.
    if (variantGalleryImages[variantId]) return;
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

  // Clothes: keep the size when the colour has it, otherwise the first size of that colour in stock.
  const findVariantForColor = (flavorName, packagingName) => {
    const ofColor = variants.filter((variant) => variant.flavor_Name === flavorName);
    const inStock = (variant) => variant.quantity > 0 && variant.isActive;
    const bySize = [...ofColor].sort((a, b) =>
      sortClothingSizes({ name: a.packaging_Name }, { name: b.packaging_Name }),
    );
    return (
      ofColor.find((variant) => variant.packaging_Name === packagingName && inStock(variant)) ||
      bySize.find(inStock) ||
      ofColor.find((variant) => variant.packaging_Name === packagingName) ||
      bySize[0]
    );
  };

  const handleFlavorSelect = (flavorName) => {
    setSelectedFlavorName(flavorName);
    const bestVariant = isApparel
      ? findVariantForColor(flavorName, selectedPackagingName)
      : findBestMatchingVariant(flavorName, selectedPackagingName);
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
  const rawNutritionData = nutritionMatchesSelection
    ? nutritionResult.data
    : nutritionPending && nutritionResult
      ? nutritionResult.data
      : EMPTY_NUTRITION;
  // The API sends AL/EN copies of the table labels (Macedonian where no
  // translation exists yet); pick the ones for the current language.
  const variantNutritionData = useMemo(() => {
    const suffix = language === "al" ? "Al" : language === "en" ? "En" : null;
    if (!suffix || !rawNutritionData?.rows) return rawNutritionData;
    const columns = rawNutritionData[`columns${suffix}`];
    return {
      ...rawNutritionData,
      columns:
        Array.isArray(columns) && columns.length === (rawNutritionData.columns || []).length
          ? columns
          : rawNutritionData.columns,
      rows: rawNutritionData.rows.map((row) => {
        const cells = row[`cells${suffix}`];
        return {
          ...row,
          rowLabel: row[`rowLabel${suffix}`] || row.rowLabel,
          cells: Array.isArray(cells) && cells.length === (row.cells || []).length ? cells : row.cells,
        };
      }),
    };
  }, [rawNutritionData, language]);
  const loadingNutrition = nutritionPending && !nutritionResult;
  const localizedVariantIngredients =
    (language === "al" && nutritionVariant?.ingredientsAl?.trim()) ||
    (language === "en" && nutritionVariant?.ingredientsEn?.trim()) ||
    nutritionVariant?.ingredients ||
    "";

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

        // One request: the lookup that detects variant ids already returns the product.
        const loaded = await checkAndRedirectVariant(id);
        if (loaded === true) return;

        const data = loaded || (await api.getProductById(id));
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

          // Prefer a discounted variant (e.g. only "2kg · Chocolate" is on sale)
          // so the shopper lands on the price they clicked through for.
          if (!targetVariant) {
            const isDiscounted = (v) =>
              v.compare_Price > 0 && v.compare_Price < v.price;
            const available = (v) => v.isActive && v.quantity > 0;
            targetVariant =
              data.variants.find((v) => isDiscounted(v) && available(v) && v.isDefault) ||
              data.variants.find((v) => isDiscounted(v) && available(v));
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
        setError(translate("productNotFound"));
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
      language === "al" && product.nameAl
        ? product.nameAl
        : language === "en" && product.nameEn
          ? product.nameEn
          : product.name;
    const rawDescription =
      (language === "al" && product.descriptionAl) ||
      (language === "en" && product.descriptionEn) ||
      product.otherDescriptionText ||
      product.mainDescriptions ||
      (language === "al"
        ? `${name} – ushqim sportiv dhe suplemente nga Proteini.si.`
        : language === "en"
          ? `${name} – sports nutrition and supplements from Proteini.si.`
          : `${name} – спортска исхрана и суплементи од Proteini.si.`);
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
    return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
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
    language === "al" ? "sq-AL" : language === "en" ? "en-GB" : "mk-MK",
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

  // Meta Pixel: one ViewContent per product/variant shown (ids match the catalog feed).
  const metaProductId = productData?.product?.product_Id;
  const metaVariantId = selectedVariant?.variant_Id || null;
  const metaName = productData?.product?.name;
  const metaPrice = productData?.product?.isGiftVoucher ? 0 : currentPrice;
  useEffect(() => {
    if (!metaProductId || loading) return;
    if (variants.length > 0 && !metaVariantId) return;
    metaViewContent({ productId: metaProductId, variantId: metaVariantId, name: metaName, price: metaPrice });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaProductId, metaVariantId, loading]);

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

    const localizedBaseName =
      language === "al" && productData?.product?.nameAl
        ? productData.product.nameAl
        : language === "en" && productData?.product?.nameEn
          ? productData.product.nameEn
          : productData?.product?.name;
    let productDisplayName = localizedBaseName;
    if (selectedVariant) {
      productDisplayName = `${localizedBaseName}`;
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
          <p className="text-red-500 text-xl">{error || translate("productNotFound")}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-lg bg-[#141409] px-6 py-2.5 font-semibold text-white"
          >
            {translate("goBackHome")}
          </button>
        </div>
      </div>
    );
  }

  const { product } = productData;
  const mainDescriptions = getMainDescriptions();
  const pickLocalized = (mkValue, alValue, enValue) => {
    if (language === "al" && alValue) return alValue;
    if (language === "en" && enValue) return enValue;
    return mkValue;
  };
  const displayName = pickLocalized(product.name, product.nameAl, product.nameEn);
  const descriptionHtml =
    language === "al" && product.descriptionAl
      ? descriptionFromLegacy([product.descriptionAl], "", "")
      : language === "en" && product.descriptionEn
        ? descriptionFromLegacy([product.descriptionEn], "", "")
        : descriptionFromLegacy(
            mainDescriptions,
            product.otherDescriptionTitle,
            product.otherDescriptionText,
          );
  const localizedNutritionIngredients = pickLocalized(
    product.nutritionValuesIngredients,
    product.nutritionValuesIngredientsAl,
    product.nutritionValuesIngredientsEn,
  );
  const localizedNutritionDescription = pickLocalized(
    product.nutritionValuesIngredientsDescription,
    product.nutritionValuesIngredientsDescriptionAl,
    product.nutritionValuesIngredientsDescriptionEn,
  );
  const localizedNutritionInformation = pickLocalized(
    product.nutritionInformation,
    product.nutritionInformationAl,
    product.nutritionInformationEn,
  );
  const localizedInstructionsTitle = pickLocalized(
    product.instructionsForUse,
    product.instructionsForUseAl,
    product.instructionsForUseEn,
  );
  const localizedInstructionsDescription = pickLocalized(
    product.instructionsForUseDescription,
    product.instructionsForUseDescriptionAl,
    product.instructionsForUseDescriptionEn,
  );
  const localizedDetailedInstructions = pickLocalized(
    product.instructionsOnHowToUseIt,
    product.instructionsOnHowToUseItAl,
    product.instructionsOnHowToUseItEn,
  );
  const hasVariants = variants.length > 0;
  const hasDescription = descriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0;
  const hasNutrition = !isApparel && Boolean(
    localizedNutritionIngredients ||
      localizedNutritionDescription ||
      localizedNutritionInformation ||
      localizedVariantIngredients ||
      nutritionVariant?.nutrition_Info ||
      loadingNutrition ||
      variantNutritionData.columns?.length ||
      variantNutritionData.rows?.length,
  );
  const hasInstructions = !isApparel && Boolean(
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
      { key: "energy", match: /енерг|energ|kcal/i },
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
        return { key, value: roundMacro(value) };
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

  // The visitor's affiliate code: shown here, applied at checkout (the cart keeps the regular price).
  const withCode = (price) =>
    referralPrice(referralOffer, {
      productId: productData?.product?.product_Id,
      price,
      isGiftVoucher: productData?.product?.isGiftVoucher,
    });
  const codePrice = withCode(currentPrice);
  const displayPrice = codePrice ?? currentPrice;
  // Fixed-amount or minimum-order codes can't be shown per product, so the card explains them instead.
  const showReferralCard =
    Boolean(referralOffer) &&
    !productData?.product?.isGiftVoucher &&
    (showsPerProductPrice(referralOffer)
      ? codePrice != null
      : offerAppliesTo(referralOffer, productData?.product?.product_Id));

  const hasDiscount = originalPrice > 0 && originalPrice !== currentPrice;
  const badgePercent = discountPercent(originalPrice, displayPrice);
  const isOutOfStock = currentStock === 0;
  const sortedPackagings = [...availablePackagings].sort(
    isApparel ? sortClothingSizes : sortPackagingsByWeight,
  );
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
    const blockSelector = "p, li, h1, h2, h3, h4";
    // Only innermost blocks: editor HTML wraps list items as <li><p>…</p></li>,
    // and taking both the <li> and its <p> printed every bullet twice.
    const blocks = [...body.querySelectorAll(blockSelector)]
      .filter((node) => !node.querySelector(blockSelector))
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
            <div className="pdp-plate relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white">
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
                      className="px-1 text-center text-[var(--ink)]"
                    >
                      {/* One line each: values like "389 kcal" and labels never break or get cut. */}
                      <p className="whitespace-nowrap text-[13px] font-bold leading-tight sm:text-base">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-[10px] font-semibold leading-tight text-gray-500 sm:text-[11px]">
                        {translate(MACRO_LABELS[stat.key])}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Same red starburst as the product cards; counts the affiliate code price too. */}
              {badgePercent > 0 && (
                <div className="pointer-events-none absolute left-3 top-3 z-10">
                  <Starburst
                    color="#E3262F"
                    textColor="#ffffff"
                    rotate={-12}
                    className="h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl"
                  >
                    −{badgePercent}%
                  </Starburst>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                aria-pressed={isFavorite}
                aria-label={translate("favorite")}
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
                    aria-label={translate("previousImage")}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:scale-105"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepImage(1)}
                    aria-label={translate("nextImage")}
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
                      className={`pdp-plate h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition sm:h-20 sm:w-20 ${
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
              <span className="text-xs text-gray-500">{translate("zeroReviews")}</span>
            </div>

            {descriptionExcerpt && (
              <p className="mt-4 line-clamp-3 text-[15px] font-medium leading-relaxed text-gray-900 sm:text-base">
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
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              {[
                allFlavorNames.length > 0 && (
                  <span key="flavors">
                    {allFlavorNames.length}{" "}
                    {variantOptionType === "color"
                      ? translate("pdpColorsShort")
                      : translate("pdpFlavorsShort")}
                  </span>
                ),
                sortedPackagings.length > 0 && (
                  <span key="sizes">
                    {sortedPackagings.length}{" "}
                    {translate(isApparel ? "cardSizes" : "pdpSizesShort")}
                  </span>
                ),
                <span
                  key="stock"
                  className={`font-semibold ${
                    isOutOfStock ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {isOutOfStock ? translate("outOfStock") : translate("pdpInStock")}
                </span>,
                product.shortExpiry && (
                  <span key="expiry" className="text-amber-800">
                    {translate("shortExpiry")}
                    {product.expiryDate
                      ? ` · ${translate("bestBefore")} ${new Date(product.expiryDate).toLocaleDateString()}`
                      : ""}
                  </span>
                ),
              ]
                .filter(Boolean)
                .flatMap((item, index) =>
                  index === 0
                    ? [item]
                    : [
                        <span key={`sep-${index}`} aria-hidden="true" className="text-gray-300">
                          ·
                        </span>,
                        item,
                      ]
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
                  {translate("voucherMinimum")} <Price value={product.voucherMinAmount || 500} />
                </span>
                <span className="mt-2 block text-xs font-normal text-gray-600">
                  {translate("giftVoucherCardOnlyNotice")}
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
                  {translate(isApparel ? "size" : "packaging")}:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedPackagingName}
                  </span>
                </p>
                <div className={`grid gap-3 ${isApparel ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2"}`}>
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
                              ? "border-gray-200 bg-transparent hover:border-gray-400"
                              : "cursor-not-allowed border-dashed border-gray-300 bg-transparent"
                        }`}
                      >
                        <span
                          className={`mt-0.5 h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isApparel ? "hidden" : "flex"
                          } ${
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
                              ? <Price value={withCode(priceForVariant(variant)) ?? priceForVariant(variant)} />
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
              <p className={`text-4xl font-bold md:text-[34px] ${codePrice != null ? "text-[#E3262F]" : "text-[var(--ink)]"}`}>
                <Price value={displayPrice} />
              </p>
              {(hasDiscount || codePrice != null) && (
                <p className="pb-1 text-lg text-gray-400 line-through">
                  <Price value={originalPrice} />
                </p>
              )}
              {codePrice != null && (
                <p className="w-full text-xs font-semibold text-[#8a5a00]">
                  {translate("referralPriceWithCode")} · {referralOffer.code}
                </p>
              )}
              {hasDiscount && saleEndDate && (
                <p className="w-full text-xs font-semibold text-red-600">
                  {translate("saleEnds")} {saleEndDate}
                </p>
              )}
            </div>

            {showReferralCard && <ReferralOfferCard offer={referralOffer} compact className="mb-4" />}

            {/* Quantity + Add to cart */}
            <div ref={ctaRef} className="flex gap-3">
              {quantityStepper}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock}
                className="pdp-cta flex h-14 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-[15px] font-semibold sm:px-6 transition disabled:cursor-not-allowed disabled:opacity-50"
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
                    className={`flex-1 shrink-0 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-7 ${
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
              className="animate-fadeIn mt-6"
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

                    {localizedVariantIngredients && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">
                          {translate("ingredients1")}
                        </h4>
                        <p className="whitespace-pre-line">
                          {localizedVariantIngredients}
                        </p>
                      </div>
                    )}

                    {loadingNutrition ? (
                      <div className="text-center py-8 text-gray-500">
                        {translate("loadingNutritionData")}
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
                          {translate("additionalNutritionInfo")}
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

        <ProductRecommendations productId={product.product_Id} />
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
              className="pdp-plate h-12 w-12 shrink-0 rounded-xl border border-gray-200 bg-white object-contain p-0.5"
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
                <StickyOptionPicker
                  label={variantOptionLabel}
                  value={selectedFlavorName}
                  hidden={!showStickyBar}
                  onSelect={handleFlavorSelect}
                  className="flex-1 md:w-56 md:flex-none"
                  options={availableFlavors.map((flavor) => {
                    const sizeVariant = packageVariants.find((item) => item.flavor_Name === flavor.id);
                    const anyVariant = sizeVariant || variants.find((item) => item.flavor_Name === flavor.id);
                    const available = isVariantAvailable(sizeVariant);
                    return {
                      id: flavor.id,
                      name: flavor.name,
                      image: anyVariant?.variant_Image_Path ? getImageUrl(anyVariant.variant_Image_Path) : null,
                      meta: available ? null : translate("outOfStock"),
                      disabled: !available,
                    };
                  })}
                />
              )}
              {sortedPackagings.length > 0 && (
                <StickyOptionPicker
                  label={translate(isApparel ? "size" : "packaging")}
                  value={selectedPackagingName}
                  hidden={!showStickyBar}
                  onSelect={handlePackagingSelect}
                  align={availableFlavors.length > 0 ? "right" : "left"}
                  className={availableFlavors.length > 0 ? "w-[42%] shrink-0 md:w-44" : "flex-1 md:w-56 md:flex-none"}
                  options={sortedPackagings.map((packaging) => {
                    const variant = findBestMatchingVariant(selectedFlavorName, packaging.id);
                    const available = variants.some(
                      (v) => v.packaging_Name === packaging.id && isVariantAvailable(v),
                    );
                    const price = priceForVariant(variant);
                    return {
                      id: packaging.id,
                      name: packaging.name,
                      meta: available ? <Price value={withCode(price) ?? price} /> : translate("outOfStock"),
                      disabled: !available,
                    };
                  })}
                />
              )}
            </div>
          )}

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="min-w-0 flex-1 md:flex-none md:text-right">
              <p className="text-xl font-bold leading-tight text-[var(--ink)]">
                <Price value={displayPrice * quantity} />
              </p>
              {quantity > 1 && (
                <p className="text-[11px] text-gray-500">
                  {quantity} × <Price value={displayPrice} />
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              tabIndex={showStickyBar ? 0 : -1}
              className="pdp-cta flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm sm:px-6 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
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
        /* Product photos ship on white; in dark mode give them a light plate so they
           don't sit as a glaring white box or get multiplied into the dark card. */
        html[data-theme="dark"] .pdp-plate { background-color: #f1f1ee !important; }
        html[data-theme="dark"] .pdp-plate > * { --ink: #141409; }
        html[data-theme="dark"] .pdp-plate img { mix-blend-mode: multiply; }
        html[data-theme="dark"] .pdp-plate .bg-white { background-color: #ffffff !important; }
        html[data-theme="dark"] .pdp-plate .border-gray-200 { border-color: #e5e7eb !important; }
        html[data-theme="dark"] .pdp-plate .text-gray-500 { color: #6b7280 !important; }
        html[data-theme="dark"] .pdp-plate button { color: #141409; }
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
          // Available only in the selected size/packaging; other sizes still give the swatch image.
          const sizeVariant = packageVariants.find((item) => item.flavor_Name === flavor.id);
          const variant = sizeVariant || variants.find((item) => item.flavor_Name === flavor.id);
          const hasStock = Boolean(sizeVariant && sizeVariant.quantity > 0 && sizeVariant.isActive);
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
                    ? "border-gray-200 bg-transparent hover:border-gray-400"
                    : "cursor-not-allowed border-dashed border-gray-300 bg-transparent"
              }`}
            >
              <span className="pdp-plate flex h-24 w-full items-center justify-center rounded-xl sm:h-28">
                {variant?.variant_Image_Path ? (
                  <img
                    src={imageUrl(variant.variant_Image_Path)}
                    alt=""
                    className={`h-full w-full object-contain mix-blend-multiply transition-transform ${
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
                <span className="mt-1 text-xs text-gray-400">
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

// Short labels for the macro strip on the photo; the nutrition table's own row labels
// ("Енергетска вредност", ...) are too long for a quarter of the image width.
const MACRO_LABELS = {
  protein: "macroProtein",
  energy: "macroEnergy",
  carbs: "macroCarbs",
  fat: "macroFat",
};

// Headline badges read better rounded the way food labels do it:
// 26,48 g -> 26 g, 0,92 g -> <1 g, 0,19 g -> 0 g, 389,4 kcal -> 389 kcal.
function roundMacro(value) {
  const match = String(value).match(/^([<>~]?)\s*(\d[\d.,]*)\s*(.*)$/);
  if (!match) return value;
  const [, prefix, raw, unit] = match;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return value;
  const suffix = unit ? ` ${unit}` : "";
  if (prefix === "<") return `<${Math.max(1, Math.ceil(number))}${suffix}`;
  if (number < 0.5) return `0${suffix}`;
  if (number < 1) return `<1${suffix}`;
  return `${prefix}${Math.round(number)}${suffix}`;
}

function ProductQuestionForm({ productName }) {
  const { translate } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `${translate("productQuestionMailSubject")} ${productName}`;
    const body = [
      `${translate("productQuestionMailProduct")} ${productName}`,
      `${translate("productQuestionMailName")} ${form.get("name")}`,
      `${translate("productQuestionMailEmail")} ${form.get("email")}`,
      "",
      String(form.get("question") || ""),
    ].join("\n");
    const link = document.createElement("a");
    link.href = `mailto:info@proteini.mk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    setSubmitted(true);
  };

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 lg:p-8" aria-labelledby="product-question-title">
      <h2 id="product-question-title" className="mb-6 text-2xl font-bold">
        {translate("productQuestionTitle")}
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          {translate("productQuestionName")}
          <input
            name="name"
            required
            autoComplete="name"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {translate("productQuestionEmail")}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {translate("productQuestionAbout").replace("{product}", productName)}
          <textarea
            name="question"
            required
            rows="5"
            className="resize-y border border-gray-300 px-3 py-2 outline-none focus:border-[#141409] rounded-xl"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" required className="mt-0.5 accent-[#FDC700]" />
          {translate("productQuestionConsent")}
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[#FDC700] px-5 py-3 font-semibold text-[#141409] hover:bg-[#e7b700]"
        >
          {translate("productQuestionSend")}
        </button>
        {submitted && (
          <p className="text-sm text-gray-600">
            {translate("productQuestionOpened")}
          </p>
        )}
      </form>
    </section>
  );
}

function ProductDetailSkeleton() {
  const { translate } = useLanguage();
  return (
    <div
      className="w-full bg-[#f6f5f1]"
      aria-busy="true"
      aria-label={translate("loadingProduct")}
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
