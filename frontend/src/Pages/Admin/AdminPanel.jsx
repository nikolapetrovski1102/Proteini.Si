import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiExternalLink,
  FiImage,
  FiPackage,
  FiPlus,
  FiStar,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { api } from "../../services/api";
import FilterDropdown from "./FilterDropdown";
import VariantManager from "./VariantManager";
import ProductDescriptionEditor from "./ProductDescriptionEditor";
import { descriptionForStorage, descriptionFromLegacy } from "../Products/productDescription";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  GeminiPromptButton,
  ImagePicker,
  Loading,
  Modal,
  Notice,
  SearchInput,
  Segmented,
  Toggle,
  inputClass,
  selectClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
  trClass,
  textareaClass,
} from "./AdminKit";
import { formatMoney } from "./adminUtils";
import { useConfirm, useToast } from "./adminFeedback";
import { PriceWithVat, SalePriceFields } from "./AdminPriceFields";
import { fieldClass } from "./adminFieldClass";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const emptyFormData = {
  name: "",
  category: "",
  quantity: 0,
  servings: 0,
  gPerServing: 0,
  gNutrition: 0,
  price: 0,
  ddvPercentage: 18,
  descriptionHtml: "",
  otherDescriptionTitle: "",
  otherDescriptionText: "",
  nutritionValuesIngredients: "",
  nutritionValuesIngredientsDescription: "",
  nutritionInformation: "",
  instructionsForUse: "",
  instructionsForUseDescription: "",
  instructionsOnHowToUseIt: "",
  newInTheShop: false,
  productsOnSale: false,
  salePrice: "",
  saleEndDate: "",
  upcomingPromotion: false,
  shortExpiry: false,
  expiryDate: "",
  isGiftVoucher: false,
  voucherMinAmount: 500,
  voucherMaxAmount: "",
  nameAl: "",
  descriptionAl: "",
  nutritionValuesIngredientsAl: "",
  nutritionValuesIngredientsDescriptionAl: "",
  nutritionInformationAl: "",
  instructionsForUseAl: "",
  instructionsForUseDescriptionAl: "",
  instructionsOnHowToUseItAl: "",
  nameEn: "",
  descriptionEn: "",
  nutritionValuesIngredientsEn: "",
  nutritionValuesIngredientsDescriptionEn: "",
  nutritionInformationEn: "",
  instructionsForUseEn: "",
  instructionsForUseDescriptionEn: "",
  instructionsOnHowToUseItEn: "",
  recommendedForYou: false,
  productsInTheOutlet: false,
  justForMe: false,
  hasVariants: false,
  variant_Display_Type: "tabs",
  brandId: null,
  loyaltyPercentage: null,
};

const emptyFilters = {
  categoryIds: [],
  sportIds: [],
  goalIds: [],
  useTimingIds: [],
  tagIds: [],
  flavorIds: [],
  brandIds: [],
};

/** Shop labels: where the product appears and which badge it gets. */
const LABELS = [
  { key: "newInTheShop", label: "New in the shop", short: "New", tone: "green", description: "Listed under “New” and gets a New badge." },
  { key: "productsOnSale", label: "On sale", short: "Sale", tone: "red", description: "Shows a discounted price with the regular price crossed out." },
  { key: "upcomingPromotion", label: "Upcoming promotion", short: "Coming soon", tone: "yellow", description: "Listed under upcoming promotions." },
  { key: "shortExpiry", label: "Short expiry", short: "Short expiry", tone: "orange", description: "Marked as close to its expiry date." },
  { key: "recommendedForYou", label: "Recommended for you", short: "Recommended", tone: "blue", description: "Shown in the recommended products row." },
  { key: "productsInTheOutlet", label: "Outlet", short: "Outlet", tone: "orange", description: "Listed in the outlet section." },
  { key: "justForMe", label: "Just for me", short: "Just for me", tone: "pink", description: "Shown in the “Just for me” section." },
  { key: "isGiftVoucher", label: "Gift voucher", short: "Gift voucher", tone: "ink", description: "Customers choose the amount instead of buying a fixed price." },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
};

const priceParts = (price, ddv) => {
  const gross = Number(price) || 0;
  const rate = Number(ddv) || 0;
  const base = gross / (1 + rate / 100);
  return { base, vat: gross - base };
};

const shortDate = (value) => (value ? String(value).slice(0, 10) : "");
const todayIso = () => new Date().toISOString().slice(0, 10);

/** Which form tab each validated field lives on. */
const ERROR_TAB = {
  name: "basics",
  price: "basics",
  loyaltyPercentage: "basics",
  salePrice: "labels",
  saleEndDate: "labels",
  voucherMinAmount: "labels",
  voucherMaxAmount: "labels",
};

/** Product list sort options: key → value to compare. */
const PRODUCT_SORTS = {
  id: { label: "Date added", value: (p) => Number(p.product_Id) || 0 },
  name: { label: "Name", value: (p) => String(p.name || "").trim().toLocaleLowerCase("mk") },
  price: { label: "Price", value: (p) => Number(p.price) || 0 },
  stock: { label: "Stock", value: (p) => Number(p.quantity) || 0 },
};

const sortProducts = (list, key, dir) => {
  const sort = PRODUCT_SORTS[key];
  if (!sort) return list;
  const sign = dir === "desc" ? -1 : 1;
  return [...list].sort((a, b) => {
    const va = sort.value(a);
    const vb = sort.value(b);
    const cmp = typeof va === "string" ? va.localeCompare(vb, "mk") : va - vb;
    return cmp * sign || (Number(a.product_Id) - Number(b.product_Id)) * sign;
  });
};

/** Clickable table header that toggles asc/desc for one sort key. */
function SortHeader({ label, sortKey, sort, onSort, align = "left" }) {
  const active = sort.key === sortKey;
  const Icon = active && sort.dir === "desc" ? FiArrowDown : FiArrowUp;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}${active ? (sort.dir === "asc" ? ", ascending" : ", descending") : ""}`}
      className={`inline-flex items-center gap-1 uppercase hover:text-gray-900 ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-gray-900" : ""}`}
    >
      {label}
      <Icon size={12} aria-hidden="true" className={active ? "" : "opacity-0 group-hover/th:opacity-40"} />
    </button>
  );
}

/** Comparable snapshot of the form, used to detect unsaved changes. */
const snapshotOf = (form, filters) => {
  const { hasVariants, ...rest } = form;
  return JSON.stringify({
    ...rest,
    quantity: hasVariants ? null : String(rest.quantity ?? ""),
    descriptionHtml: descriptionForStorage(rest.descriptionHtml),
    descriptionAl: descriptionForStorage(rest.descriptionAl),
    descriptionEn: descriptionForStorage(rest.descriptionEn),
    filters,
  });
};

function validateProduct(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter the product name.";
  const price = Number(form.price);
  if (String(form.price) !== "" && price < 0) errors.price = "The price can't be negative.";
  else if (!form.isGiftVoucher && !form.hasVariants && !(price > 0)) errors.price = "Enter the price customers pay.";
  const loyalty = form.loyaltyPercentage;
  if (loyalty !== null && loyalty !== "" && (Number(loyalty) < 0 || Number(loyalty) > 100)) {
    errors.loyaltyPercentage = "Use a number from 0 to 100.";
  }
  if (form.productsOnSale) {
    const sale = Number(form.salePrice);
    if (!form.salePrice) errors.salePrice = "Enter the sale price, or turn off “On sale”.";
    else if (!(sale > 0)) errors.salePrice = "The sale price must be more than 0.";
    else if (price > 0 && sale >= price) errors.salePrice = `Must be lower than the regular price (${formatMoney(price)}).`;
    if (form.saleEndDate && form.saleEndDate < todayIso()) errors.saleEndDate = "This date has already passed.";
  }
  if (form.isGiftVoucher) {
    const min = Number(form.voucherMinAmount);
    if (!(min > 0)) errors.voucherMinAmount = "Enter the smallest amount customers can choose.";
    if (form.voucherMaxAmount && Number(form.voucherMaxAmount) < min) errors.voucherMaxAmount = "Must be at least the minimum amount.";
  }
  return errors;
}

/** Macedonian, Albanian, and English versions of one text field, side by side on wide screens. */
function BilingualField({ label, hint, name, nameAl, nameEn, form, onChange, rows, placeholder }) {
  const control = (fieldName, lang) =>
    rows ? (
      <textarea name={fieldName} rows={rows} value={form[fieldName]} onChange={onChange} className={textareaClass} placeholder={lang !== "mk" ? "Empty = Macedonian text is shown" : placeholder} />
    ) : (
      <input name={fieldName} value={form[fieldName]} onChange={onChange} className={inputClass} placeholder={lang !== "mk" ? form[name] || "" : placeholder} />
    );
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-gray-800">{label}</p>
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">Macedonian</span>
          {control(name, "mk")}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">Albanian</span>
          {control(nameAl, "al")}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">English</span>
          {control(nameEn, "en")}
        </label>
      </div>
      {hint && <p className="mt-1.5 text-xs leading-snug text-gray-500">{hint}</p>}
    </div>
  );
}

function LabelBadges({ product }) {
  const active = LABELS.filter((l) => product[l.key]);
  if (active.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {active.map((l) => (
        <Badge key={l.key} tone={l.tone} className="whitespace-nowrap">
          {l.short}
          {l.key === "productsOnSale" && product.saleEndDate ? ` · until ${shortDate(product.saleEndDate)}` : ""}
          {l.key === "shortExpiry" && product.expiryDate ? ` · ${shortDate(product.expiryDate)}` : ""}
        </Badge>
      ))}
    </div>
  );
}

function Thumb({ src, className = "h-12 w-12" }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.05] ${className}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-contain p-1" loading="lazy" /> : <FiImage className="text-gray-300" aria-hidden="true" />}
    </span>
  );
}

function Checkbox({ checked, onChange, label, indeterminate = false }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded border-black/30 accent-[#141409]"
    />
  );
}

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(() => Boolean(location.state?.openNew));
  const [activeTab, setActiveTab] = useState("basics");
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Categories
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("admin-products-sort") || "null");
      if (saved && (saved.key === "default" || PRODUCT_SORTS[saved.key]) && (saved.dir === "asc" || saved.dir === "desc")) return saved;
    } catch {
      /* storage unavailable */
    }
    return { key: "default", dir: "asc" };
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const productListRequestId = useRef(0);

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sports: [],
    goals: [],
    useTimings: [],
    tags: [],
    flavors: [],
    brands: [],
  });
  const [selectedFilters, setSelectedFilters] = useState(emptyFilters);
  const [formData, setFormData] = useState(emptyFormData);
  const [showErrors, setShowErrors] = useState(false);
  const [variantPrices, setVariantPrices] = useState([]);
  const savedSnapshot = useRef(snapshotOf(emptyFormData, emptyFilters));
  const closePromptOpen = useRef(false);
  // The variant editor (Variants tab) borrows the modal footer for its own Save button.
  const variantManagerRef = useRef(null);
  const [variantEditor, setVariantEditor] = useState({ open: false, dirty: false, saving: false, isNew: false });

  const isDirty = isModalOpen && (Boolean(imageFile) || snapshotOf(formData, selectedFilters) !== savedSnapshot.current);
  const variantEditorOpen = isModalOpen && activeTab === "variants" && variantEditor.open;
  const variantDirty = variantEditorOpen && variantEditor.dirty;
  const errors = showErrors ? validateProduct(formData) : {};

  // Warn before a reload or tab close throws away unsaved product edits.
  useEffect(() => {
    if (!isDirty && !variantDirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, variantDirty]);

  // Opened from the dashboard's "Add product" shortcut: clear the router state so a refresh doesn't reopen it.
  useEffect(() => {
    if (location.state?.openNew) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const fetchProducts = useCallback(async () => {
    const requestId = ++productListRequestId.current;
    const query = searchTerm.trim();
    setSearchLoading(true);
    try {
      const data = query
        ? (await api.searchProducts({ searchTerm: query, page: 1, pageSize: 20, sortBy: "Name", sortOrder: "ASC" })).products
        : await api.getProducts();
      if (requestId === productListRequestId.current) setProducts(data || []);
    } catch (error) {
      if (requestId === productListRequestId.current) {
        console.error("Error fetching products:", error);
        toast.error("Couldn't load products: " + error.message);
      }
    } finally {
      if (requestId === productListRequestId.current) {
        setSearchLoading(false);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchProducts, searchTerm ? 400 : 0);
    return () => {
      clearTimeout(delayDebounce);
      productListRequestId.current += 1;
    };
  }, [fetchProducts, searchTerm]);

  useEffect(() => {
    api
      .getFilterOptions()
      .then((options) =>
        setFilterOptions({
          categories: options.categories || [],
          sports: options.sports || [],
          goals: options.goals || [],
          useTimings: options.useTimings || [],
          tags: options.tags || [],
          flavors: options.flavors || [],
          brands: options.brands || [],
        }),
      )
      .catch((error) => console.error("Error fetching filter options:", error));
  }, []);

  const fetchGalleryImages = async (productId) => {
    if (!productId) return;
    try {
      const response = await api.getProductGallery(productId);
      if (Array.isArray(response)) setGalleryImages(response);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  /* ---------------------------------------------------------- selection */

  useEffect(() => {
    try {
      localStorage.setItem("admin-products-sort", JSON.stringify(sort));
    } catch {
      /* storage unavailable */
    }
  }, [sort]);

  /** Header click: same column flips direction; a new column starts ascending (date added starts newest first). */
  const toggleSort = (key) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "id" ? "desc" : "asc" }));

  const sortedProducts = sort.key === "default" ? products : sortProducts(products, sort.key, sort.dir);

  const allSelected = products.length > 0 && products.every((p) => selectedProducts.has(p.product_Id));
  const someSelected = selectedProducts.size > 0 && !allSelected;

  const handleSelectAll = () => {
    setSelectedProducts(allSelected ? new Set() : new Set(products.map((p) => p.product_Id)));
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const clearSelection = () => setSelectedProducts(new Set());

  const runBulkStock = async (mode) => {
    const count = selectedProducts.size;
    const inStock = mode === "in-stock";
    const ok = await confirm({
      title: inStock ? `Mark ${count} product${count === 1 ? "" : "s"} in stock?` : `Mark ${count} product${count === 1 ? "" : "s"} out of stock?`,
      message: inStock
        ? "Customers will be able to order them again."
        : "They stay on the site but customers can't add them to the cart.",
      confirmLabel: inStock ? "Mark in stock" : "Mark out of stock",
    });
    if (!ok) return;
    setBulkActionLoading(true);
    try {
      const result = await api.bulkUpdateProducts(Array.from(selectedProducts), mode);
      toast.success(result?.message || "Updated.");
      clearSelection();
      await fetchProducts();
    } catch (error) {
      toast.error("Couldn't update: " + error.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedProducts.size;
    const ok = await confirm({
      title: `Delete ${count} product${count === 1 ? "" : "s"}?`,
      message: "They will be removed from the shop permanently, including their variants. This can't be undone.",
      confirmLabel: `Delete ${count}`,
      tone: "danger",
    });
    if (!ok) return;
    setBulkActionLoading(true);
    let deletedCount = 0;
    let errorCount = 0;
    for (const productId of selectedProducts) {
      try {
        await api.deleteProduct(productId);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete product ${productId}:`, error);
        errorCount++;
      }
    }
    if (errorCount) toast.error(`Deleted ${deletedCount}, ${errorCount} couldn't be deleted.`);
    else toast.success(`Deleted ${deletedCount} product${deletedCount === 1 ? "" : "s"}.`);
    clearSelection();
    await fetchProducts();
    setBulkActionLoading(false);
  };

  /* --------------------------------------------------------- categories */

  const updateCategorySelection = (mainCategoryIds, subcategoryIds) => {
    const uniqueMainIds = [...new Set(mainCategoryIds)];
    const uniqueSubcategoryIds = [...new Set(subcategoryIds)];
    setSelectedMainCategories(uniqueMainIds);
    setSelectedSubcategories(uniqueSubcategoryIds);
    setSelectedFilters((prev) => ({ ...prev, categoryIds: [...uniqueMainIds, ...uniqueSubcategoryIds] }));
  };

  const addMainCategory = (mainCategoryId) => {
    if (!mainCategoryId || selectedMainCategories.includes(mainCategoryId)) return;
    updateCategorySelection([...selectedMainCategories, mainCategoryId], selectedSubcategories);
  };

  const addSubcategory = (subcategoryId) => {
    if (!subcategoryId || selectedSubcategories.includes(subcategoryId)) return;
    const subcategory = filterOptions.categories.find((c) => c.category_Id === subcategoryId);
    const parentId = subcategory?.parent_Category_Id;
    const mainCategoryIds =
      parentId && !selectedMainCategories.includes(parentId) ? [...selectedMainCategories, parentId] : selectedMainCategories;
    updateCategorySelection(mainCategoryIds, [...selectedSubcategories, subcategoryId]);
  };

  const removeCategory = (categoryId) => {
    const category = filterOptions.categories.find((item) => item.category_Id === categoryId);
    if (!category) return;
    if (category.parent_Category_Id) {
      updateCategorySelection(selectedMainCategories, selectedSubcategories.filter((id) => id !== categoryId));
      return;
    }
    updateCategorySelection(
      selectedMainCategories.filter((id) => id !== categoryId),
      selectedSubcategories.filter((id) => {
        const sub = filterOptions.categories.find((item) => item.category_Id === id);
        return sub?.parent_Category_Id !== categoryId;
      }),
    );
  };

  const handleFilterCheckboxChange = (filterType, itemId) => {
    setSelectedFilters((prev) => {
      const currentIds = prev[filterType];
      const newIds = currentIds.includes(itemId) ? currentIds.filter((id) => id !== itemId) : [...currentIds, itemId];
      return { ...prev, [filterType]: newIds };
    });
  };

  const handleBrandChange = (brandId) => {
    setFormData((prev) => ({ ...prev, brandId }));
    setSelectedFilters((prev) => ({ ...prev, brandIds: brandId ? [brandId] : [] }));
  };

  /* ------------------------------------------------------------- images */

  const validateImage = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return false;
    }
    return true;
  };

  const handleImageSelect = (file) => {
    if (!validateImage(file)) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGalleryImageSelect = async (file) => {
    if (!validateImage(file)) return;
    setUploadingGallery(true);
    try {
      const response = await api.uploadGalleryImage(editingProduct.product_Id, file);
      if (response.status) {
        await fetchGalleryImages(editingProduct.product_Id);
        toast.success("Photo added to the gallery.");
      }
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      toast.error("Couldn't upload the photo: " + error.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (galleryId) => {
    const ok = await confirm({ title: "Remove this photo?", message: "It will be removed from the product gallery.", confirmLabel: "Remove", tone: "danger" });
    if (!ok) return;
    try {
      const response = await api.deleteGalleryImage(galleryId);
      if (response.status) {
        await fetchGalleryImages(editingProduct.product_Id);
        toast.success("Photo removed.");
      }
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast.error("Couldn't remove the photo.");
    }
  };

  const handleSetMainImage = async (galleryId, imagePath) => {
    try {
      const response = await api.setMainGalleryImage(editingProduct.product_Id, galleryId);
      if (response.status) {
        setImagePreview(imagePath);
        await fetchGalleryImages(editingProduct.product_Id);
        toast.success("Main photo updated.");
      }
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Couldn't change the main photo.");
    }
  };

  /* --------------------------------------------------------------- form */

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const resetForm = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setImageFile(null);
    setGalleryImages([]);
    setFormData(emptyFormData);
    setSelectedFilters(emptyFilters);
    setSelectedMainCategories([]);
    setSelectedSubcategories([]);
    setActiveTab("basics");
    setShowErrors(false);
    setVariantPrices([]);
    savedSnapshot.current = snapshotOf(emptyFormData, emptyFilters);
  };

  const sharedFields = () => ({
    nutritionValuesIngredients: formData.nutritionValuesIngredients || "",
    nutritionInformation: formData.nutritionInformation || "",
    instructionsForUse: formData.instructionsForUse || "",
    instructionsOnHowToUseIt: formData.instructionsOnHowToUseIt || "",
    newInTheShop: formData.newInTheShop || false,
    productsOnSale: formData.productsOnSale || false,
    salePrice: formData.productsOnSale && formData.salePrice ? parseFloat(formData.salePrice) : null,
    saleEndDate: formData.productsOnSale && formData.saleEndDate ? formData.saleEndDate : null,
    upcomingPromotion: formData.upcomingPromotion || false,
    shortExpiry: formData.shortExpiry || false,
    expiryDate: formData.shortExpiry && formData.expiryDate ? formData.expiryDate : null,
    isGiftVoucher: formData.isGiftVoucher || false,
    voucherMinAmount: formData.isGiftVoucher ? parseFloat(formData.voucherMinAmount) || 500 : null,
    voucherMaxAmount: formData.isGiftVoucher && formData.voucherMaxAmount ? parseFloat(formData.voucherMaxAmount) : null,
    nameAl: formData.nameAl || "",
    descriptionAl: descriptionForStorage(formData.descriptionAl),
    nutritionValuesIngredientsAl: formData.nutritionValuesIngredientsAl || "",
    nutritionValuesIngredientsDescriptionAl: formData.nutritionValuesIngredientsDescriptionAl || "",
    nutritionInformationAl: formData.nutritionInformationAl || "",
    instructionsForUseAl: formData.instructionsForUseAl || "",
    instructionsForUseDescriptionAl: formData.instructionsForUseDescriptionAl || "",
    instructionsOnHowToUseItAl: formData.instructionsOnHowToUseItAl || "",
    nameEn: formData.nameEn || "",
    descriptionEn: descriptionForStorage(formData.descriptionEn),
    nutritionValuesIngredientsEn: formData.nutritionValuesIngredientsEn || "",
    nutritionValuesIngredientsDescriptionEn: formData.nutritionValuesIngredientsDescriptionEn || "",
    nutritionInformationEn: formData.nutritionInformationEn || "",
    instructionsForUseEn: formData.instructionsForUseEn || "",
    instructionsForUseDescriptionEn: formData.instructionsForUseDescriptionEn || "",
    instructionsOnHowToUseItEn: formData.instructionsOnHowToUseItEn || "",
    recommendedForYou: formData.recommendedForYou || false,
    productsInTheOutlet: formData.productsInTheOutlet || false,
    justForMe: formData.justForMe || false,
    hasVariants: formData.hasVariants,
    variant_Display_Type: formData.variant_Display_Type,
    loyaltyPercentage: formData.loyaltyPercentage ? parseFloat(formData.loyaltyPercentage) : null,
    name: formData.name.trim(),
    category: formData.category || "",
    quantity: formData.hasVariants ? 0 : parseInt(formData.quantity) || 0,
    servings: parseInt(formData.servings) || 0,
    gPerServing: parseFloat(formData.gPerServing) || 0,
    gNutrition: parseFloat(formData.gNutrition) || 0,
    // With variants the shop charges the variant price, so the product row mirrors the cheapest variant.
    price: variantPrices.length > 0 && !formData.isGiftVoucher ? String(Math.min(...variantPrices)) : formData.price,
    ddvPercentage: parseFloat(formData.ddvPercentage) || 18,
    otherDescriptionTitle: "",
    otherDescriptionText: "",
  });

  const finishPayload = (productData) => {
    const flavorId = selectedFilters.flavorIds.length > 0 ? selectedFilters.flavorIds[0] : null;
    if (flavorId !== null) productData.FlavorId = flavorId;
    if (formData.brandId) productData.BrandId = formData.brandId;
    Object.keys(productData).forEach((key) => productData[key] === undefined && delete productData[key]);
    return productData;
  };

  const idList = (key, stringify) => {
    const ids = selectedFilters[key];
    if (ids.length === 0) return null;
    return stringify ? JSON.stringify(ids) : ids;
  };

  const handleAddProduct = async () => {
    const descriptionHtml = descriptionForStorage(formData.descriptionHtml);
    const productData = {
      ...sharedFields(),
      categoryIds: idList("categoryIds"),
      sportIds: idList("sportIds"),
      goalIds: idList("goalIds"),
      useTimingIds: idList("useTimingIds"),
      tagIds: idList("tagIds"),
      flavorIds: idList("flavorIds"),
      brandIds: idList("brandIds"),
      nutritionValuesIngredientsDescription: formData.nutritionValuesIngredientsDescription || "",
      instructionsForUseDescription: formData.instructionsForUseDescription || "",
    };
    if (descriptionHtml) productData.mainDescriptions = [descriptionHtml];
    return api.addProduct(finishPayload(productData), imageFile);
  };

  const handleUpdateProduct = async () => {
    const descriptionHtml = descriptionForStorage(formData.descriptionHtml);
    const productData = {
      ...sharedFields(),
      categoryIds: idList("categoryIds", true),
      sportIds: idList("sportIds", true),
      goalIds: idList("goalIds", true),
      useTimingIds: idList("useTimingIds", true),
      tagIds: idList("tagIds", true),
      flavorIds: idList("flavorIds", true),
      brandIds: idList("brandIds", true),
      mainDescription: JSON.stringify(descriptionHtml ? [descriptionHtml] : []),
      nutritionValuesIngredientsDesc: formData.nutritionValuesIngredientsDescription || "",
      instructionsForUseDesc: formData.instructionsForUseDescription || "",
    };
    await api.updateProduct(editingProduct.product_Id, finishPayload(productData), imageFile, false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    // Enter inside the variant editor saves the variant, not the product.
    if (variantEditorOpen) {
      variantManagerRef.current?.save();
      return;
    }
    if (saving) return;
    const found = validateProduct(formData);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      setShowErrors(true);
      setActiveTab(ERROR_TAB[firstError] || "basics");
      toast.error(Object.keys(found).length === 1 ? found[firstError] : "Some fields need fixing. They're marked in red.");
      return;
    }
    if (selectedFilters.categoryIds.length === 0) {
      const ok = await confirm({
        title: "Save without a category?",
        message: "The product won't appear in any shop menu. Customers will only find it by searching.",
        confirmLabel: "Save anyway",
        cancelLabel: "Choose a category",
      });
      if (!ok) {
        setActiveTab("organise");
        return;
      }
    }
    setSaving(true);
    try {
      if (editingProduct) {
        await handleUpdateProduct();
        toast.success("Product saved.");
        setIsModalOpen(false);
        resetForm();
        fetchProducts();
      } else {
        const result = await handleAddProduct();
        fetchProducts();
        if (result?.productId) {
          // Keep going on the new product: variants, extra photos and nutrition need it to exist first.
          const opened = await openProduct(result.productId, "variants");
          toast.success(opened ? "Product added. Now add its variants and extra photos." : "Product added.");
          if (!opened) {
            setIsModalOpen(false);
            resetForm();
          }
        } else {
          toast.success("Product added.");
          setIsModalOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Couldn't save the product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      message: "It will be removed from the shop permanently, including its variants. This can't be undone.",
      confirmLabel: "Delete product",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteProduct(product.product_Id);
      toast.success("Product deleted.");
      setSelectedProducts((prev) => {
        const next = new Set(prev);
        next.delete(product.product_Id);
        return next;
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Couldn't delete the product.");
    }
  };

  /** Loads a product into the form. Returns false when it couldn't be loaded. */
  const openProduct = async (productId, tab = "basics") => {
    try {
      const fullProductData = await api.getProductById(productId);
      const productData = fullProductData.product;
      const categories = fullProductData.categories || [];
      const sports = fullProductData.sports || [];
      const goals = fullProductData.goals || [];
      const useTimings = fullProductData.useTimings || [];
      const tags = fullProductData.tags || [];
      const variants = fullProductData.variants || [];

      let mainDescriptionsArray = [];
      try {
        mainDescriptionsArray =
          typeof productData.mainDescriptions === "string"
            ? JSON.parse(productData.mainDescriptions)
            : productData.mainDescriptions || [""];
      } catch {
        mainDescriptionsArray = productData.mainDescriptions ? [productData.mainDescriptions] : [];
      }

      const nextForm = {
        name: productData.name || "",
        category: productData.category || "",
        quantity: productData.quantity || 0,
        servings: productData.servings || 0,
        gPerServing: productData.gPerServing || 0,
        gNutrition: productData.gNutrition || 0,
        price: productData.price || 0,
        ddvPercentage: productData.ddvPercentage || productData.ddV_Percentage || 18,
        descriptionHtml: descriptionFromLegacy(mainDescriptionsArray, productData.otherDescriptionTitle, productData.otherDescriptionText),
        otherDescriptionTitle: productData.otherDescriptionTitle || "",
        otherDescriptionText: productData.otherDescriptionText || "",
        nutritionValuesIngredients: productData.nutritionValuesIngredients || "",
        nutritionValuesIngredientsDescription: productData.nutritionValuesIngredientsDescription || "",
        nutritionInformation: productData.nutritionInformation || "",
        instructionsForUse: productData.instructionsForUse || "",
        instructionsForUseDescription: productData.instructionsForUseDescription || "",
        instructionsOnHowToUseIt: productData.instructionsOnHowToUseIt || "",
        newInTheShop: productData.newInTheShop || false,
        productsOnSale: productData.productsOnSale || false,
        salePrice: productData.salePrice || "",
        saleEndDate: shortDate(productData.saleEndDate),
        upcomingPromotion: productData.upcomingPromotion || false,
        shortExpiry: productData.shortExpiry || false,
        expiryDate: shortDate(productData.expiryDate),
        isGiftVoucher: productData.isGiftVoucher || false,
        voucherMinAmount: productData.voucherMinAmount || 500,
        voucherMaxAmount: productData.voucherMaxAmount || "",
        nameAl: productData.nameAl || "",
        descriptionAl: productData.descriptionAl || "",
        nutritionValuesIngredientsAl: productData.nutritionValuesIngredientsAl || "",
        nutritionValuesIngredientsDescriptionAl: productData.nutritionValuesIngredientsDescriptionAl || "",
        nutritionInformationAl: productData.nutritionInformationAl || "",
        instructionsForUseAl: productData.instructionsForUseAl || "",
        instructionsForUseDescriptionAl: productData.instructionsForUseDescriptionAl || "",
        instructionsOnHowToUseItAl: productData.instructionsOnHowToUseItAl || "",
        nameEn: productData.nameEn || "",
        descriptionEn: productData.descriptionEn || "",
        nutritionValuesIngredientsEn: productData.nutritionValuesIngredientsEn || "",
        nutritionValuesIngredientsDescriptionEn: productData.nutritionValuesIngredientsDescriptionEn || "",
        nutritionInformationEn: productData.nutritionInformationEn || "",
        instructionsForUseEn: productData.instructionsForUseEn || "",
        instructionsForUseDescriptionEn: productData.instructionsForUseDescriptionEn || "",
        instructionsOnHowToUseItEn: productData.instructionsOnHowToUseItEn || "",
        recommendedForYou: productData.recommendedForYou || false,
        productsInTheOutlet: productData.productsInTheOutlet || false,
        justForMe: productData.justForMe || false,
        hasVariants: productData.hasVariants || variants.length > 0,
        variant_Display_Type: productData.variant_Display_Type || "tabs",
        brandId: productData.brand_Id || null,
        loyaltyPercentage: productData.loyaltyPercentage ?? null,
      };

      let categoryIds = categories.map((cat) => cat.category_Id);
      let mainCategories = [];
      let subCats = [];
      if (categoryIds.length > 0 && filterOptions.categories.length > 0) {
        const find = (id) => filterOptions.categories.find((c) => c.category_Id === id);
        const mappedMain = categoryIds.filter((id) => find(id) && !find(id).parent_Category_Id);
        subCats = categoryIds.filter((id) => find(id)?.parent_Category_Id);
        const inferredMain = subCats.map((id) => find(id)?.parent_Category_Id).filter(Boolean);
        mainCategories = [...new Set([...mappedMain, ...inferredMain])];
        // Older products may only map the subcategory; keep both when saving.
        categoryIds = [...new Set([...mainCategories, ...subCats])];
      }

      const nextFilters = {
        categoryIds,
        sportIds: sports.map((s) => s.sport_Id),
        goalIds: goals.map((g) => g.goal_Id),
        useTimingIds: useTimings.map((u) => u.useTiming_Id),
        tagIds: tags.map((t) => t.tag_Id),
        flavorIds: productData.flavor_Id ? [productData.flavor_Id] : [],
        brandIds: productData.brand_Id ? [productData.brand_Id] : [],
      };

      setEditingProduct(productData);
      setImagePreview(productData.img || null);
      setImageFile(null);
      setFormData(nextForm);
      setSelectedFilters(nextFilters);
      setSelectedMainCategories(mainCategories);
      setSelectedSubcategories(subCats);
      setVariantPrices(variants.map((v) => Number(v.price)).filter((n) => n > 0));
      setShowErrors(false);
      setActiveTab(tab);
      savedSnapshot.current = snapshotOf(nextForm, nextFilters);
      setGalleryImages([]);
      await fetchGalleryImages(productData.product_Id);
      setIsModalOpen(true);
      return true;
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Couldn't open the product: " + error.message);
      return false;
    }
  };

  const handleEdit = async (product) => {
    setOpeningId(product.product_Id);
    await openProduct(product.product_Id);
    setOpeningId(null);
  };

  const startNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  /** Switch tabs; leaving the Variants tab with an unsaved variant asks first (the editor is unmounted). */
  const changeTab = async (tab) => {
    if (tab === activeTab) return;
    if (variantEditorOpen) {
      const closed = await variantManagerRef.current?.requestClose();
      if (closed === false) return;
    }
    setActiveTab(tab);
  };

  const handleCloseModal = async () => {
    if (closePromptOpen.current) return;
    if (isDirty || variantDirty) {
      closePromptOpen.current = true;
      const discard = await confirm({
        title: "Discard unsaved changes?",
        message: variantDirty
          ? isDirty
            ? "You changed this product and one of its variants but didn't save. Closing now throws those changes away."
            : "You changed this variant but didn't save. Closing now throws those changes away."
          : "You changed this product but didn't save. Closing now throws those changes away.",
        confirmLabel: "Discard changes",
        cancelLabel: "Keep editing",
        tone: "danger",
      });
      // Let the Escape key that closed the dialog finish before listening again.
      setTimeout(() => {
        closePromptOpen.current = false;
      }, 0);
      if (!discard) return;
    }
    setIsModalOpen(false);
    resetForm();
  };

  /* ------------------------------------------------------------- render */

  const mainCategories = filterOptions.categories.filter((c) => !c.parent_Category_Id);
  const availableSubcategories = filterOptions.categories.filter(
    (c) => c.parent_Category_Id && selectedMainCategories.includes(c.parent_Category_Id),
  );
  const categoryName = (id) => filterOptions.categories.find((c) => c.category_Id === id)?.category_Name || `#${id}`;
  const labelCount = LABELS.filter((l) => formData[l.key]).length;
  const organiseCount =
    selectedFilters.categoryIds.length +
    selectedFilters.sportIds.length +
    selectedFilters.goalIds.length +
    selectedFilters.useTimingIds.length +
    selectedFilters.tagIds.length +
    selectedFilters.flavorIds.length;

  const tabHasError = (tab) => Object.keys(errors).some((key) => (ERROR_TAB[key] || "basics") === tab);
  const tabs = [
    { value: "basics", label: "Basics", alert: tabHasError("basics") },
    { value: "variants", label: "Variants", count: editingProduct && variantPrices.length ? variantPrices.length : undefined },
    { value: "organise", label: "Categories", count: organiseCount || undefined },
    { value: "labels", label: "Labels", count: labelCount || undefined, alert: tabHasError("labels") },
    { value: "description", label: "Description & translation" },
  ];

  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
  const maxVariantPrice = variantPrices.length ? Math.max(...variantPrices) : 0;
  const checklist = [
    { key: "name", label: "Name", done: Boolean(formData.name.trim()), tab: "basics" },
    {
      key: "price",
      label: "Price",
      done: Number(formData.price) > 0 || formData.isGiftVoucher || variantPrices.length > 0,
      tab: "basics",
    },
    { key: "photo", label: "Photo", done: Boolean(imagePreview), tab: "basics" },
    { key: "category", label: "Category", done: selectedFilters.categoryIds.length > 0, tab: "organise" },
    { key: "description", label: "Description", done: Boolean(descriptionForStorage(formData.descriptionHtml)), tab: "description" },
    { key: "albanian", label: "Albanian name", done: Boolean(formData.nameAl.trim()), tab: "basics" },
    { key: "english", label: "English name", done: Boolean(formData.nameEn.trim()), tab: "basics" },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  const filterGroups = [
    { key: "sportIds", title: "Sports", items: filterOptions.sports },
    { key: "goalIds", title: "Goals", items: filterOptions.goals },
    { key: "useTimingIds", title: "When to take it", items: filterOptions.useTimings },
    { key: "tagIds", title: "Tags", items: filterOptions.tags },
    { key: "flavorIds", title: "Flavours", items: filterOptions.flavors },
  ];

  return (
    <AdminPage
      eyebrow="Shop"
      title="Products"
      count={loading ? undefined : products.length}
      description="Everything for sale in the shop. Click a product to change its price, photos, variants, categories or labels."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Add product
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name…"
          label="Search products"
          className="w-full max-w-md"
        />
        {searchTerm && !searchLoading && (
          <span className="text-sm text-gray-500">
            {products.length} found{products.length === 20 ? " (showing first 20)" : ""}
          </span>
        )}
        {searchLoading && !loading && <span className="text-sm text-gray-500">Searching…</span>}
        <div className="ml-auto flex items-center gap-1.5">
          <label htmlFor="product-sort" className="text-sm text-gray-500">
            Sort
          </label>
          <select
            id="product-sort"
            value={sort.key}
            onChange={(e) => {
              const key = e.target.value;
              setSort((prev) => ({ key, dir: key === prev.key ? prev.dir : key === "id" ? "desc" : "asc" }));
            }}
            className={`${selectClass} w-auto py-2 text-sm`}
          >
            <option value="default">Default</option>
            {Object.entries(PRODUCT_SORTS).map(([key, opt]) => (
              <option key={key} value={key}>
                {opt.label}
              </option>
            ))}
          </select>
          <IconButton
            icon={sort.dir === "desc" ? FiArrowDown : FiArrowUp}
            label={sort.dir === "desc" ? "Descending — switch to ascending" : "Ascending — switch to descending"}
            onClick={() => setSort((prev) => ({ ...prev, dir: prev.dir === "asc" ? "desc" : "asc" }))}
            disabled={sort.key === "default"}
          />
        </div>
      </div>

      {selectedProducts.size > 0 && (
        <div className="admin-ink-panel sticky top-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl bg-[#141409] px-4 py-3 text-white shadow-[0_16px_40px_-16px_rgba(20,20,9,0.6)]">
          <span className="mr-auto text-sm font-semibold">
            <span className="font-display text-lg text-[#FDC700]">{selectedProducts.size}</span> selected
          </span>
          <button
            type="button"
            disabled={bulkActionLoading}
            onClick={() => runBulkStock("in-stock")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[13px] font-semibold transition hover:bg-white/20 disabled:opacity-50"
          >
            <FiCheckCircle size={14} aria-hidden="true" /> In stock
          </button>
          <button
            type="button"
            disabled={bulkActionLoading}
            onClick={() => runBulkStock("out-of-stock")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[13px] font-semibold transition hover:bg-white/20 disabled:opacity-50"
          >
            <FiXCircle size={14} aria-hidden="true" /> Out of stock
          </button>
          <button
            type="button"
            disabled={bulkActionLoading}
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E3262F] px-3 py-2 text-[13px] font-semibold transition hover:bg-[#c81f27] disabled:opacity-50"
          >
            <FiTrash2 size={14} aria-hidden="true" /> Delete
          </button>
          <button
            type="button"
            onClick={clearSelection}
            aria-label="Clear selection"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <Card>
          <Loading label="Loading products…" />
        </Card>
      ) : products.length === 0 ? (
        <Card>
          {searchTerm ? (
            <EmptyState
              icon={FiPackage}
              title="No products match"
              text={`Nothing found for “${searchTerm}”. Check the spelling or try a shorter word.`}
              action={<Button variant="secondary" onClick={() => setSearchTerm("")}>Clear search</Button>}
            />
          ) : (
            <EmptyState
              icon={FiPackage}
              title="No products yet"
              text="Add your first product to start selling."
              action={<Button icon={FiPlus} onClick={startNew}>Add product</Button>}
            />
          )}
        </Card>
      ) : (
        <Card bodyClassName="p-0" className={searchLoading ? "opacity-70 transition" : "transition"}>
          {/* Desktop table */}
          <div className={`${tableWrapClass} hidden md:block`}>
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={`${thClass} w-10`}>
                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} label="Select all products" />
                  </th>
                  <th className={`${thClass} group/th`}>
                    <SortHeader label="Product" sortKey="name" sort={sort} onSort={toggleSort} />
                    <span className="mx-1.5 text-gray-300" aria-hidden="true">·</span>
                    <SortHeader label="#" sortKey="id" sort={sort} onSort={toggleSort} />
                  </th>
                  <th className={`${thClass} group/th text-right`}>
                    <SortHeader label="Price" sortKey="price" sort={sort} onSort={toggleSort} align="right" />
                  </th>
                  <th className={`${thClass} group/th text-right`}>
                    <SortHeader label="Stock" sortKey="stock" sort={sort} onSort={toggleSort} align="right" />
                  </th>
                  <th className={thClass}>Labels</th>
                  <th className={`${thClass} w-24`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => {
                  const { base, vat } = priceParts(product.price, product.ddvPercentage || product.ddV_Percentage);
                  const selected = selectedProducts.has(product.product_Id);
                  return (
                    <tr key={product.product_Id} className={`${trClass} ${selected ? "bg-[#FDC700]/[0.08]" : ""}`}>
                      <td className={tdClass}>
                        <Checkbox checked={selected} onChange={() => handleSelectProduct(product.product_Id)} label={`Select ${product.name}`} />
                      </td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="group flex items-center gap-3 text-left"
                          disabled={openingId === product.product_Id}
                        >
                          <Thumb src={getImageUrl(product.img)} />
                          <span className="min-w-0">
                            <span className="block font-semibold text-gray-900 group-hover:underline">{product.name}</span>
                            <span className="block text-xs text-gray-500">
                              #{product.product_Id}
                              {product.gPerServing ? ` · ${product.gPerServing} g` : ""}
                              {openingId === product.product_Id ? " · Opening…" : ""}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right`}>
                        <span className="block font-semibold tabular-nums text-gray-900">{formatMoney(product.price)}</span>
                        <span className="block text-xs tabular-nums text-gray-500">
                          {formatMoney(base)} + VAT {formatMoney(vat)}
                        </span>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap text-right`}>
                        {Number(product.quantity) > 0 ? (
                          <span className="font-semibold tabular-nums">{product.quantity}</span>
                        ) : (
                          <Badge tone="red">Out of stock</Badge>
                        )}
                      </td>
                      <td className={tdClass}>
                        <LabelBadges product={product} />
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="flex justify-end">
                          <IconButton icon={FiEdit2} label={`Edit ${product.name}`} onClick={() => handleEdit(product)} disabled={openingId === product.product_Id} />
                          <IconButton icon={FiTrash2} tone="danger" label={`Delete ${product.name}`} onClick={() => handleDelete(product)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            <label className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 text-sm font-semibold text-gray-700">
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={handleSelectAll} label="Select all products" />
              Select all
            </label>
            <ul className="divide-y divide-black/[0.06]">
              {sortedProducts.map((product) => {
                const selected = selectedProducts.has(product.product_Id);
                return (
                  <li key={product.product_Id} className={`flex gap-3 px-4 py-3 ${selected ? "bg-[#FDC700]/[0.08]" : ""}`}>
                    <div className="pt-4">
                      <Checkbox checked={selected} onChange={() => handleSelectProduct(product.product_Id)} label={`Select ${product.name}`} />
                    </div>
                    <button type="button" onClick={() => handleEdit(product)} className="flex min-w-0 flex-1 gap-3 text-left">
                      <Thumb src={getImageUrl(product.img)} className="h-14 w-14" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-gray-900">{product.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-sm">
                          <span className="font-semibold tabular-nums">{formatMoney(product.price)}</span>
                          {Number(product.quantity) > 0 ? (
                            <span className="text-xs text-gray-500">{product.quantity} in stock</span>
                          ) : (
                            <Badge tone="red">Out of stock</Badge>
                          )}
                        </span>
                        <span className="mt-1.5 block">
                          <LabelBadges product={product} />
                        </span>
                      </span>
                    </button>
                    <IconButton icon={FiTrash2} tone="danger" label={`Delete ${product.name}`} onClick={() => handleDelete(product)} />
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        size="xl"
        title={editingProduct ? editingProduct.name || "Edit product" : "Add product"}
        description={
          editingProduct ? (
            <>
              Product #{editingProduct.product_Id} ·{" "}
              <a
                href={`/product/${editingProduct.product_Id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4"
              >
                View on site <FiExternalLink size={12} aria-hidden="true" />
              </a>
            </>
          ) : (
            "Start with the basics. After you add the product you continue straight to its variants and photos."
          )
        }
        footer={
          <>
            {variantEditorOpen ? (
              <>
                <span className="mr-auto hidden text-xs text-gray-500 sm:block" aria-live="polite">
                  {variantEditor.dirty ? "Unsaved variant changes" : variantEditor.isNew ? "New variant" : "No variant changes"}
                </span>
                <Button variant="secondary" onClick={() => variantManagerRef.current?.requestClose()}>
                  Cancel
                </Button>
                <Button onClick={() => variantManagerRef.current?.save()} loading={variantEditor.saving}>
                  {variantEditor.isNew ? "Add variant" : "Save variant"}
                </Button>
              </>
            ) : (
              <>
                <span className="mr-auto hidden text-xs text-gray-500 sm:block" aria-live="polite">
                  {isDirty ? "Unsaved changes" : editingProduct ? "All changes saved" : ""}
                </span>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} loading={saving}>
                  {editingProduct ? "Save changes" : "Add product & continue"}
                </Button>
              </>
            )}
          </>
        }
      >
        <div className="-mx-1 mb-3 overflow-x-auto px-1 pb-1">
          <Segmented value={activeTab} onChange={changeTab} options={tabs} className="min-w-max" />
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-black/[0.06] pb-4 text-xs">
          <span className="font-semibold tabular-nums text-gray-900">
            {doneCount === checklist.length ? "Ready for the shop" : `${doneCount} of ${checklist.length} ready`}
          </span>
          {checklist.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => changeTab(item.tab)}
              className={`inline-flex min-h-[28px] items-center gap-1.5 transition hover:text-gray-900 hover:underline ${item.done ? "text-gray-600" : "font-semibold text-gray-900"}`}
            >
              {item.done ? (
                <FiCheck size={13} className="text-[#1f8a4c]" aria-hidden="true" />
              ) : (
                <FiCircle size={12} className="text-gray-400" aria-hidden="true" />
              )}
              {item.label}
              <span className="sr-only">{item.done ? " (done)" : " (missing)"}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "basics" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Product name" required error={errors.name}>
                    <input
                      name="name"
                      data-autofocus
                      value={formData.name}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors.name) || undefined}
                      className={fieldClass(errors.name)}
                      placeholder="e.g. Whey Protein 2 kg"
                    />
                  </Field>
                  <Field label="Name in Albanian" hint="Empty = the Macedonian name is shown.">
                    <input name="nameAl" value={formData.nameAl} onChange={handleInputChange} className={inputClass} placeholder={formData.name} />
                  </Field>
                  <Field label="Name in English" hint="Empty = the Macedonian name is shown.">
                    <input name="nameEn" value={formData.nameEn} onChange={handleInputChange} className={inputClass} placeholder={formData.name} />
                  </Field>
                </div>

                <Field label="Brand">
                  <select
                    className={selectClass}
                    value={formData.brandId || ""}
                    onChange={(e) => handleBrandChange(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">No brand</option>
                    {filterOptions.brands.map((b) => (
                      <option key={b.brand_Id} value={b.brand_Id}>
                        {b.brand_Name}
                      </option>
                    ))}
                  </select>
                </Field>

                <FormSection
                  title="Price"
                  description={
                    formData.isGiftVoucher
                      ? "Gift vouchers: customers choose the amount (set the limits in Labels)."
                      : variantPrices.length > 0
                        ? `Each variant has its own price (${
                            minVariantPrice === maxVariantPrice
                              ? formatMoney(minVariantPrice)
                              : `${formatMoney(minVariantPrice)} – ${formatMoney(maxVariantPrice)}`
                          }). Change those in the Variants tab.`
                        : "What customers pay. Sale prices are set in Labels."
                  }
                >
                  {variantPrices.length > 0 && !formData.isGiftVoucher ? (
                    <Field label="Price customers pay (incl. VAT)" hint="Set by the variants. Open the Variants tab to change it.">
                      <p className="flex min-h-[44px] items-center rounded-xl bg-[#f6f5f1] px-3.5 text-base font-semibold tabular-nums text-gray-700 ring-1 ring-black/[0.08]">
                        {minVariantPrice === maxVariantPrice
                          ? formatMoney(minVariantPrice)
                          : `${formatMoney(minVariantPrice)} – ${formatMoney(maxVariantPrice)}`}
                      </p>
                    </Field>
                  ) : (
                  <PriceWithVat
                    key={editingProduct?.product_Id ?? "new"}
                    price={formData.price}
                    vat={formData.ddvPercentage}
                    onPriceChange={(value) => setField("price", value)}
                    onVatChange={(value) => setField("ddvPercentage", value)}
                    error={errors.price}
                    required={!formData.isGiftVoucher && !formData.hasVariants}
                  />
                  )}
                </FormSection>

                <FormSection title="Stock & size">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label={formData.hasVariants ? "Stock (all variants)" : "In stock"}
                      hint={formData.hasVariants ? "Set per variant in the Variants tab." : "0 = out of stock."}
                    >
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        readOnly={formData.hasVariants}
                        className={`${inputClass} ${formData.hasVariants ? "cursor-not-allowed bg-[#f6f5f1] text-gray-500" : ""}`}
                      />
                    </Field>
                    <Field label="Servings" hint="Per package.">
                      <input name="servings" type="number" min="0" value={formData.servings} onChange={handleInputChange} className={inputClass} />
                    </Field>
                    <Field label="Grams per serving">
                      <input name="gPerServing" type="number" min="0" step="0.1" value={formData.gPerServing} onChange={handleInputChange} className={inputClass} />
                    </Field>
                  </div>
                </FormSection>

                <Field
                  label="Loyalty points (%)"
                  hint="Share of the price returned as points. Leave empty for the default 2%."
                  error={errors.loyaltyPercentage}
                  className="sm:max-w-[260px]"
                >
                  <input
                    name="loyaltyPercentage"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="2"
                    value={formData.loyaltyPercentage ?? ""}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(errors.loyaltyPercentage) || undefined}
                    className={fieldClass(errors.loyaltyPercentage)}
                  />
                </Field>
              </div>

              <div className="space-y-5">
                <Field label="Main photo">
                  <ImagePicker promptKey="productPhoto"
                    preview={getImageUrl(imagePreview)}
                    onFile={handleImageSelect}
                    onClear={imageFile ? removeImage : undefined}
                    aspect="aspect-square"
                    fit="object-contain"
                    accept={IMAGE_TYPES.join(",")}
                    label="Upload product photo"
                    hint="Square photo on a white or transparent background. JPG, PNG or WebP, max 5 MB."
                  />
                </Field>

                {editingProduct && (
                  <div>
                    <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Extra photos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {galleryImages.map((img) => (
                        <div key={img.gallery_Id} className="group relative aspect-square overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.06]">
                          <img src={getImageUrl(img.image_Path)} alt="" className="h-full w-full object-contain p-1" />
                          {img.isMain && (
                            <span className="absolute left-1 top-1 rounded bg-[#141409] px-1.5 py-0.5 text-[10px] font-bold text-[#FDC700]">Main</span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                            {!img.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(img.gallery_Id, img.image_Path)}
                                aria-label="Use as main photo"
                                title="Use as main photo"
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-800 hover:bg-white"
                              >
                                <FiStar size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryImage(img.gallery_Id)}
                              aria-label="Remove photo"
                              title="Remove photo"
                              className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-[#b3191f] hover:bg-white"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <ImagePicker
                        onFile={handleGalleryImageSelect}
                        aspect="aspect-square"
                        accept={IMAGE_TYPES.join(",")}
                        label={uploadingGallery ? "Uploading…" : "Add"}
                        className={uploadingGallery ? "pointer-events-none opacity-60" : ""}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">Shown in the product page gallery. Hover a photo to make it the main one.</p>
                    <GeminiPromptButton promptKey="productGallery" className="mt-2" />
                  </div>
                )}
                {!editingProduct && (
                  <p className="rounded-xl bg-[#f6f5f1] px-4 py-3 text-xs leading-snug text-gray-600">
                    Extra photos, variants and nutrition tables can be added right after you add the product.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "variants" && !editingProduct && (
            <div className="rounded-2xl bg-[#f6f5f1]">
              <EmptyState
                icon={FiPackage}
                title="Add the product first"
                text="Variants (flavours, colours, sizes) each get their own price, stock, photos and nutrition table. Add the product and this tab opens next."
                action={
                  <Button onClick={handleSubmit} loading={saving}>
                    Add product & continue
                  </Button>
                }
              />
            </div>
          )}

          {activeTab === "variants" && editingProduct && (
            <div className="space-y-4">
              <Notice>
                Variants are versions of this product customers choose between, such as sizes or flavours. Each variant has its own price,
                stock and photos. While a variant is open, the button at the bottom saves that variant.
              </Notice>
              <VariantManager
                ref={variantManagerRef}
                onEditorChange={setVariantEditor}
                productId={editingProduct.product_Id}
                productName={editingProduct.name}
                onVariantsChange={async () => {
                  fetchProducts();
                  const updated = await api.getProductById(editingProduct.product_Id);
                  setFormData((prev) => ({
                    ...prev,
                    quantity: updated.product?.quantity ?? prev.quantity,
                    hasVariants: updated.product?.hasVariants || updated.variants?.length > 0,
                  }));
                  setVariantPrices((updated.variants || []).map((v) => Number(v.price)).filter((n) => n > 0));
                }}
              />
            </div>
          )}

          {activeTab === "organise" && (
            <div className="space-y-8">
              <FormSection title="Categories" description="Where the product appears in the shop menu. Choosing a subcategory adds its main category automatically.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Add a main category">
                    <select className={selectClass} value="" onChange={(e) => addMainCategory(parseInt(e.target.value))}>
                      <option value="">Choose…</option>
                      {mainCategories
                        .filter((c) => !selectedMainCategories.includes(c.category_Id))
                        .map((c) => (
                          <option key={c.category_Id} value={c.category_Id}>
                            {c.category_Name}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Add a subcategory" hint={selectedMainCategories.length === 0 ? "Pick a main category first." : undefined}>
                    <select
                      className={selectClass}
                      value=""
                      disabled={selectedMainCategories.length === 0}
                      onChange={(e) => addSubcategory(parseInt(e.target.value))}
                    >
                      <option value="">Choose…</option>
                      {availableSubcategories
                        .filter((c) => !selectedSubcategories.includes(c.category_Id))
                        .map((c) => (
                          <option key={c.category_Id} value={c.category_Id}>
                            {categoryName(c.parent_Category_Id)} › {c.category_Name}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-4 rounded-xl bg-[#f6f5f1] p-3">
                  {selectedMainCategories.length === 0 ? (
                    <p className="px-1 text-sm text-gray-500">No categories yet. Customers will only find this product by searching.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedMainCategories.map((mainId) => {
                        const subs = selectedSubcategories.filter(
                          (id) => filterOptions.categories.find((c) => c.category_Id === id)?.parent_Category_Id === mainId,
                        );
                        return (
                          <li key={mainId} className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#141409] py-1 pl-3 pr-1 text-[13px] font-semibold text-white">
                              {categoryName(mainId)}
                              <button
                                type="button"
                                onClick={() => removeCategory(mainId)}
                                aria-label={`Remove ${categoryName(mainId)}`}
                                className="flex h-5 w-5 items-center justify-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                            {subs.map((subId) => (
                              <span key={subId} className="inline-flex items-center gap-1 rounded-full bg-white py-1 pl-3 pr-1 text-[13px] font-medium text-gray-800 ring-1 ring-black/[0.08]">
                                {categoryName(subId)}
                                <button
                                  type="button"
                                  onClick={() => removeCategory(subId)}
                                  aria-label={`Remove ${categoryName(subId)}`}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-black/[0.06] hover:text-gray-800"
                                >
                                  <FiX size={12} />
                                </button>
                              </span>
                            ))}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </FormSection>

              <FormSection title="Shop filters" description="Customers use these to narrow down products. Pick everything that applies.">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filterGroups.map((g) => (
                    <FilterDropdown
                      key={g.key}
                      title={g.title}
                      items={g.items}
                      selectedIds={selectedFilters[g.key]}
                      onCheckboxChange={(id) => handleFilterCheckboxChange(g.key, id)}
                    />
                  ))}
                </div>
              </FormSection>
            </div>
          )}

          {activeTab === "labels" && (
            <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
              {LABELS.map((l) => (
                <div key={l.key} className={`rounded-xl ${formData[l.key] && ["productsOnSale", "shortExpiry", "isGiftVoucher"].includes(l.key) ? "bg-[#f6f5f1] pb-3" : ""}`}>
                  <Toggle checked={formData[l.key]} onChange={(v) => setField(l.key, v)} label={l.label} description={l.description} />

                  {l.key === "productsOnSale" && formData.productsOnSale && (
                    <div className="space-y-3 px-3">
                      <SalePriceFields
                        price={formData.price}
                        salePrice={formData.salePrice}
                        onSalePriceChange={(value) => setField("salePrice", value)}
                        error={errors.salePrice}
                        required
                        hint={variantPrices.length > 0 ? "Variants use their own sale price, set in the Variants tab." : undefined}
                      />
                      <Field label="Sale ends" hint="Optional. Leave empty to keep the sale on until you turn it off." error={errors.saleEndDate} className="sm:max-w-[260px]">
                        <input
                          name="saleEndDate"
                          type="date"
                          min={todayIso()}
                          value={formData.saleEndDate}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.saleEndDate) || undefined}
                          className={fieldClass(errors.saleEndDate)}
                        />
                      </Field>
                    </div>
                  )}

                  {l.key === "shortExpiry" && formData.shortExpiry && (
                    <div className="px-3">
                      <Field label="Expiry date" hint="Optional. Leave empty to show only the label.">
                        <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} className={inputClass} />
                      </Field>
                    </div>
                  )}

                  {l.key === "isGiftVoucher" && formData.isGiftVoucher && (
                    <div className="grid gap-3 px-3 sm:grid-cols-2">
                      <Field label="Minimum amount (MKD)" error={errors.voucherMinAmount}>
                        <input
                          name="voucherMinAmount"
                          type="number"
                          min="500"
                          step="100"
                          value={formData.voucherMinAmount}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.voucherMinAmount) || undefined}
                          className={fieldClass(errors.voucherMinAmount)}
                        />
                      </Field>
                      <Field label="Maximum amount (MKD)" hint="Optional." error={errors.voucherMaxAmount}>
                        <input
                          name="voucherMaxAmount"
                          type="number"
                          min={formData.voucherMinAmount || 500}
                          step="100"
                          value={formData.voucherMaxAmount}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.voucherMaxAmount) || undefined}
                          className={fieldClass(errors.voucherMaxAmount)}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "description" && (
            <div className="space-y-8">
              <Notice>
                Albanian and English text is shown to visitors who switch the site to that language. Any empty translation field shows the Macedonian text instead.
              </Notice>

              <FormSection title="Description" description="The main text on the product page. Use headings and bullet lists to keep it easy to scan.">
                <div className="space-y-5">
                  <ProductDescriptionEditor
                    value={formData.descriptionHtml}
                    onChange={(descriptionHtml) => setField("descriptionHtml", descriptionHtml)}
                    label="Macedonian"
                  />
                  <ProductDescriptionEditor
                    value={formData.descriptionAl}
                    onChange={(descriptionAl) => setField("descriptionAl", descriptionAl)}
                    label="Albanian"
                  />
                  <ProductDescriptionEditor
                    value={formData.descriptionEn}
                    onChange={(descriptionEn) => setField("descriptionEn", descriptionEn)}
                    label="English"
                  />
                </div>
              </FormSection>

              <FormSection title="Nutrition" description="Shown in the Nutrition tab on the product page. Nutrition tables are set per variant.">
                <div className="space-y-5">
                  <BilingualField label="Ingredients" name="nutritionValuesIngredients" nameAl="nutritionValuesIngredientsAl" nameEn="nutritionValuesIngredientsEn" form={formData} onChange={handleInputChange} rows={3} />
                  <BilingualField
                    label="Short note"
                    hint="One line under the ingredients, e.g. allergens."
                    name="nutritionValuesIngredientsDescription"
                    nameAl="nutritionValuesIngredientsDescriptionAl"
                    nameEn="nutritionValuesIngredientsDescriptionEn"
                    form={formData}
                    onChange={handleInputChange}
                  />
                  <BilingualField label="Nutrition information" name="nutritionInformation" nameAl="nutritionInformationAl" nameEn="nutritionInformationEn" form={formData} onChange={handleInputChange} rows={3} />
                </div>
              </FormSection>

              <FormSection title="How to use" description="Shown in the Instructions tab on the product page.">
                <div className="space-y-5">
                  <BilingualField
                    label="Title"
                    name="instructionsForUse"
                    nameAl="instructionsForUseAl"
                    nameEn="instructionsForUseEn"
                    form={formData}
                    onChange={handleInputChange}
                    placeholder="e.g. Recommended use"
                  />
                  <BilingualField
                    label="Short description"
                    name="instructionsForUseDescription"
                    nameAl="instructionsForUseDescriptionAl"
                    nameEn="instructionsForUseDescriptionEn"
                    form={formData}
                    onChange={handleInputChange}
                    rows={2}
                  />
                  <BilingualField
                    label="Detailed instructions"
                    name="instructionsOnHowToUseIt"
                    nameAl="instructionsOnHowToUseItAl"
                    nameEn="instructionsOnHowToUseItEn"
                    form={formData}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </FormSection>
            </div>
          )}

          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
