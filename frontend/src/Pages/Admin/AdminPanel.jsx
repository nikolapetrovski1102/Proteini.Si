import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TfiClose } from "react-icons/tfi";
import { api } from "../../services/api";
import ResetCacheButton from "./ResetCacheButton";
import FilterDropdown from "./FilterDropdown";
import VariantManager from "./VariantManager";
import ProductDescriptionEditor from "./ProductDescriptionEditor";
import { descriptionForStorage, descriptionFromLegacy } from "../Products/productDescription";
import { useLanguage } from "../translation/LanguageContext";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const { translate, language } = useLanguage();

  // Bulk selection states
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Gallery states
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef(null);

  // Category selection states
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const productListRequestId = useRef(0);

  const fetchProducts = useCallback(async () => {
    const requestId = ++productListRequestId.current;
    const query = searchTerm.trim();
    setSearchLoading(true);
    try {
      const data = query
        ? (await api.searchProducts({
            searchTerm: query,
            page: 1,
            pageSize: 20,
            sortBy: "Name",
            sortOrder: "ASC",
          })).products
        : await api.getProducts();

      if (requestId === productListRequestId.current) {
        setProducts(data || []);
      }
    } catch (error) {
      if (requestId === productListRequestId.current) {
        console.error("Error fetching products:", error);
        alert("Failed to load products: " + error.message);
      }
    } finally {
      if (requestId === productListRequestId.current) {
        setSearchLoading(false);
        setLoading(false);
      }
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(fetchProducts, 500);
    return () => {
      clearTimeout(delayDebounce);
      // Ignore pending results when the query changes or the page unmounts.
      productListRequestId.current += 1;
    };
  }, [fetchProducts]);

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-image.jpg";
    if (path.startsWith("http")) return path;
    return `https://proteini.mk${path}`;
  };

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sports: [],
    goals: [],
    useTimings: [],
    tags: [],
    flavors: [],
    brands: [], // Add brands to filterOptions
  });

  const [openDropdowns, setOpenDropdowns] = useState({
    sports: false,
    goals: false,
    useTimings: false,
    tags: false,
    flavors: false,
    brands: false, // Add brands dropdown state
  });

  const [selectedFilters, setSelectedFilters] = useState({
    categoryIds: [],
    sportIds: [],
    goalIds: [],
    useTimingIds: [],
    tagIds: [],
    flavorIds: [],
    brandIds: [], // Add brandIds to selectedFilters
  });

  const [formData, setFormData] = useState({
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
    recommendedForYou: false,
    productsInTheOutlet: false,
    justForMe: false,
    hasVariants: false,
    variant_Display_Type: "tabs",
    brandId: null, // Add brandId to formData
    loyaltyPercentage: null,
  });

  const fetchGalleryImages = async (productId) => {
    if (!productId) return;
    try {
      const response = await api.getProductGallery(productId);
      if (response && Array.isArray(response)) {
        setGalleryImages(response);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
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
          brands: options.brands || [], // Fetch brands from API
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
      setShowBulkBar(false);
    } else {
      const allProductIds = products.map((p) => p.product_Id);
      setSelectedProducts(new Set(allProductIds));
      setSelectAll(true);
      setShowBulkBar(true);
    }
  };

  // Handle single product selection
  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length && products.length > 0);
    setShowBulkBar(newSelected.size > 0);
  };

  // Bulk action handlers
  const handleBulkOutOfStock = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product");
      return;
    }

    if (!confirm(`Set ${selectedProducts.size} product(s) to OUT OF STOCK?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const productIds = Array.from(selectedProducts);
      const result = await api.bulkUpdateProducts(productIds, "out-of-stock");
      alert(result.message);
      await fetchProducts();
      setSelectedProducts(new Set());
      setSelectAll(false);
      setShowBulkBar(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkInStock = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product");
      return;
    }

    if (!confirm(`Set ${selectedProducts.size} product(s) to IN STOCK?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const productIds = Array.from(selectedProducts);
      const result = await api.bulkUpdateProducts(productIds, "in-stock");
      alert(result.message);
      await fetchProducts();
      setSelectedProducts(new Set());
      setSelectAll(false);
      setShowBulkBar(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product");
      return;
    }

    if (
      !confirm(
        `⚠️ WARNING: This will permanently delete ${selectedProducts.size} product(s). Are you ABSOLUTELY sure?`,
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const productIds = Array.from(selectedProducts);
      let deletedCount = 0;
      let errorCount = 0;

      for (const productId of productIds) {
        try {
          await api.deleteProduct(productId);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete product ${productId}:`, error);
          errorCount++;
        }
      }

      alert(`Deleted ${deletedCount} product(s). Failed: ${errorCount}`);
      await fetchProducts();
      setSelectedProducts(new Set());
      setSelectAll(false);
      setShowBulkBar(false);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const updateCategorySelection = (mainCategoryIds, subcategoryIds) => {
    const uniqueMainIds = [...new Set(mainCategoryIds)];
    const uniqueSubcategoryIds = [...new Set(subcategoryIds)];
    const allCategoryIds = [
      ...uniqueMainIds,
      ...uniqueSubcategoryIds,
    ];

    setSelectedMainCategories(uniqueMainIds);
    setSelectedSubcategories(uniqueSubcategoryIds);
    setSelectedFilters((prev) => ({
      ...prev,
      categoryIds: allCategoryIds,
    }));
  };

  const addMainCategory = (mainCategoryId) => {
    if (!mainCategoryId || selectedMainCategories.includes(mainCategoryId)) {
      return;
    }

    updateCategorySelection(
      [...selectedMainCategories, mainCategoryId],
      selectedSubcategories,
    );
  };

  const addSubcategory = (subcategoryId) => {
    if (!subcategoryId || selectedSubcategories.includes(subcategoryId)) {
      return;
    }

    const subcategory = filterOptions.categories.find(
      (category) => category.category_Id === subcategoryId,
    );
    const parentId = subcategory?.parent_Category_Id;
    const mainCategoryIds =
      parentId && !selectedMainCategories.includes(parentId)
        ? [...selectedMainCategories, parentId]
        : selectedMainCategories;

    updateCategorySelection(mainCategoryIds, [
      ...selectedSubcategories,
      subcategoryId,
    ]);
  };

  const removeCategory = (categoryId) => {
    const category = filterOptions.categories.find(
      (item) => item.category_Id === categoryId,
    );
    if (!category) return;

    if (category.parent_Category_Id) {
      updateCategorySelection(
        selectedMainCategories,
        selectedSubcategories.filter((id) => id !== categoryId),
      );
      return;
    }

    const remainingMainCategories = selectedMainCategories.filter(
      (id) => id !== categoryId,
    );
    const remainingSubcategories = selectedSubcategories.filter((id) => {
      const subcategory = filterOptions.categories.find(
        (item) => item.category_Id === id,
      );
      return subcategory?.parent_Category_Id !== categoryId;
    });
    updateCategorySelection(
      remainingMainCategories,
      remainingSubcategories,
    );
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns((prev) => {
      if (prev[dropdownName]) {
        return { ...prev, [dropdownName]: false };
      }
      const newState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[dropdownName] = true;
      return newState;
    });
  };

  const handleFilterCheckboxChange = (filterType, itemId) => {
    setSelectedFilters((prev) => {
      const currentIds = prev[filterType];
      const newIds = currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId];
      return { ...prev, [filterType]: newIds };
    });
  };

  const handleBrandChange = (brandId) => {
    setFormData((prev) => ({ ...prev, brandId: brandId }));
    setSelectedFilters((prev) => ({
      ...prev,
      brandIds: brandId ? [brandId] : [],
    }));
  };

  const resetFilters = () => {
    setSelectedFilters({
      categoryIds: [],
      sportIds: [],
      goalIds: [],
      useTimingIds: [],
      tagIds: [],
      flavorIds: [],
      brandIds: [],
    });
    setSelectedMainCategories([]);
    setSelectedSubcategories([]);
    setFormData((prev) => ({ ...prev, brandId: null }));
    setOpenDropdowns({
      sports: false,
      goals: false,
      useTimings: false,
      tags: false,
      flavors: false,
      brands: false,
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Gallery image handlers
  const handleGalleryImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingGallery(true);
    try {
      const response = await api.uploadGalleryImage(
        editingProduct.product_Id,
        file,
      );
      if (response.status) {
        await fetchGalleryImages(editingProduct.product_Id);
        alert("Gallery image added successfully!");
      }
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      alert("Failed to upload gallery image: " + error.message);
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteGalleryImage = async (galleryId) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;

    try {
      const response = await api.deleteGalleryImage(galleryId);
      if (response.status) {
        await fetchGalleryImages(editingProduct.product_Id);
        alert("Gallery image deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      alert("Failed to delete gallery image");
    }
  };

  const handleSetMainImage = async (galleryId, imagePath) => {
    try {
      const response = await api.setMainGalleryImage(
        editingProduct.product_Id,
        galleryId,
      );
      if (response.status) {
        setImagePreview(imagePath);
        alert("Main image updated successfully!");
      }
    } catch (error) {
      console.error("Error setting main image:", error);
      alert("Failed to set main image");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === "") {
      alert("Product name is required");
      return;
    }

    setLoading(true);
    try {
      const descriptionHtml = descriptionForStorage(formData.descriptionHtml);

      const flavorId =
        selectedFilters.flavorIds.length > 0
          ? selectedFilters.flavorIds[0]
          : null;

      const priceToSend = formData.price;

      const productData = {
        name: formData.name.trim(),
        category: formData.category || "",

        categoryIds:
          selectedFilters.categoryIds.length > 0
            ? selectedFilters.categoryIds
            : null,
        sportIds:
          selectedFilters.sportIds.length > 0 ? selectedFilters.sportIds : null,
        goalIds:
          selectedFilters.goalIds.length > 0 ? selectedFilters.goalIds : null,
        useTimingIds:
          selectedFilters.useTimingIds.length > 0
            ? selectedFilters.useTimingIds
            : null,
        tagIds:
          selectedFilters.tagIds.length > 0 ? selectedFilters.tagIds : null,
        flavorIds:
          selectedFilters.flavorIds.length > 0
            ? selectedFilters.flavorIds
            : null,
        brandIds:
          selectedFilters.brandIds.length > 0 ? selectedFilters.brandIds : null,

        quantity: formData.hasVariants ? 0 : (parseInt(formData.quantity) || 0),
        servings: parseInt(formData.servings) || 0,
        gPerServing: parseFloat(formData.gPerServing) || 0,
        gNutrition: parseFloat(formData.gNutrition) || 0,
        price: priceToSend,
        ddvPercentage: parseFloat(formData.ddvPercentage) || 18,
        otherDescriptionTitle: "",
        otherDescriptionText: "",
        nutritionValuesIngredients: formData.nutritionValuesIngredients || "",
        nutritionValuesIngredientsDescription:
          formData.nutritionValuesIngredientsDescription || "",
        nutritionInformation: formData.nutritionInformation || "",
        instructionsForUse: formData.instructionsForUse || "",
        instructionsForUseDescription:
          formData.instructionsForUseDescription || "",
        instructionsOnHowToUseIt: formData.instructionsOnHowToUseIt || "",
        newInTheShop: formData.newInTheShop || false,
        productsOnSale: formData.productsOnSale || false,
        salePrice:
          formData.productsOnSale && formData.salePrice
            ? parseFloat(formData.salePrice)
            : null,
        saleEndDate:
          formData.productsOnSale && formData.saleEndDate
            ? formData.saleEndDate
            : null,
        upcomingPromotion: formData.upcomingPromotion || false,
        shortExpiry: formData.shortExpiry || false,
        expiryDate:
          formData.shortExpiry && formData.expiryDate
            ? formData.expiryDate
            : null,
        isGiftVoucher: formData.isGiftVoucher || false,
        voucherMinAmount: formData.isGiftVoucher
          ? parseFloat(formData.voucherMinAmount) || 500
          : null,
        voucherMaxAmount:
          formData.isGiftVoucher && formData.voucherMaxAmount
            ? parseFloat(formData.voucherMaxAmount)
            : null,
        nameAl: formData.nameAl || "",
        descriptionAl: descriptionForStorage(formData.descriptionAl),
        nutritionValuesIngredientsAl: formData.nutritionValuesIngredientsAl || "",
        nutritionValuesIngredientsDescriptionAl:
          formData.nutritionValuesIngredientsDescriptionAl || "",
        nutritionInformationAl: formData.nutritionInformationAl || "",
        instructionsForUseAl: formData.instructionsForUseAl || "",
        instructionsForUseDescriptionAl:
          formData.instructionsForUseDescriptionAl || "",
        instructionsOnHowToUseItAl: formData.instructionsOnHowToUseItAl || "",
        recommendedForYou: formData.recommendedForYou || false,
        productsInTheOutlet: formData.productsInTheOutlet || false,
        justForMe: formData.justForMe || false,
        hasVariants: formData.hasVariants,
        variant_Display_Type: formData.variant_Display_Type,
        loyaltyPercentage: formData.loyaltyPercentage
          ? parseFloat(formData.loyaltyPercentage)
          : null,
      };

      if (descriptionHtml) {
        productData.mainDescriptions = [descriptionHtml];
      }

      if (flavorId !== null) {
        productData.FlavorId = flavorId;
      }

      if (formData.brandId) {
        productData.BrandId = formData.brandId;
      }

      Object.keys(productData).forEach((key) => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });

      await api.addProduct(productData, imageFile);
      alert("Product added successfully!");
      resetForm();
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const descriptionHtml = descriptionForStorage(formData.descriptionHtml);
      const mainDescriptionJson = descriptionHtml
        ? JSON.stringify([descriptionHtml])
        : JSON.stringify([]);

      const flavorId =
        selectedFilters.flavorIds.length > 0
          ? selectedFilters.flavorIds[0]
          : null;

      const priceToSend = formData.price;

      const productData = {
        name: formData.name.trim(),
        category: formData.category || "",
        quantity: formData.hasVariants ? 0 : (parseInt(formData.quantity) || 0),
        servings: parseInt(formData.servings) || 0,
        gPerServing: parseFloat(formData.gPerServing) || 0,
        gNutrition: parseFloat(formData.gNutrition) || 0,
        price: priceToSend,
        ddvPercentage: parseFloat(formData.ddvPercentage) || 18,

        categoryIds:
          selectedFilters.categoryIds.length > 0
            ? JSON.stringify(selectedFilters.categoryIds)
            : null,
        sportIds:
          selectedFilters.sportIds.length > 0
            ? JSON.stringify(selectedFilters.sportIds)
            : null,
        goalIds:
          selectedFilters.goalIds.length > 0
            ? JSON.stringify(selectedFilters.goalIds)
            : null,
        useTimingIds:
          selectedFilters.useTimingIds.length > 0
            ? JSON.stringify(selectedFilters.useTimingIds)
            : null,
        tagIds:
          selectedFilters.tagIds.length > 0
            ? JSON.stringify(selectedFilters.tagIds)
            : null,
        flavorIds:
          selectedFilters.flavorIds.length > 0
            ? JSON.stringify(selectedFilters.flavorIds)
            : null,
        brandIds:
          selectedFilters.brandIds.length > 0
            ? JSON.stringify(selectedFilters.brandIds)
            : null,
        loyaltyPercentage: formData.loyaltyPercentage
          ? parseFloat(formData.loyaltyPercentage)
          : null,

        mainDescription: mainDescriptionJson,
        otherDescriptionTitle: "",
        otherDescriptionText: "",
        nutritionValuesIngredients: formData.nutritionValuesIngredients || "",
        nutritionValuesIngredientsDesc:
          formData.nutritionValuesIngredientsDescription || "",
        nutritionInformation: formData.nutritionInformation || "",
        instructionsForUse: formData.instructionsForUse || "",
        instructionsForUseDesc: formData.instructionsForUseDescription || "",
        instructionsOnHowToUseIt: formData.instructionsOnHowToUseIt || "",
        newInTheShop: formData.newInTheShop || false,
        productsOnSale: formData.productsOnSale || false,
        salePrice:
          formData.productsOnSale && formData.salePrice
            ? parseFloat(formData.salePrice)
            : null,
        saleEndDate:
          formData.productsOnSale && formData.saleEndDate
            ? formData.saleEndDate
            : null,
        upcomingPromotion: formData.upcomingPromotion || false,
        shortExpiry: formData.shortExpiry || false,
        expiryDate:
          formData.shortExpiry && formData.expiryDate
            ? formData.expiryDate
            : null,
        isGiftVoucher: formData.isGiftVoucher || false,
        voucherMinAmount: formData.isGiftVoucher
          ? parseFloat(formData.voucherMinAmount) || 500
          : null,
        voucherMaxAmount:
          formData.isGiftVoucher && formData.voucherMaxAmount
            ? parseFloat(formData.voucherMaxAmount)
            : null,
        nameAl: formData.nameAl || "",
        descriptionAl: descriptionForStorage(formData.descriptionAl),
        nutritionValuesIngredientsAl: formData.nutritionValuesIngredientsAl || "",
        nutritionValuesIngredientsDescriptionAl:
          formData.nutritionValuesIngredientsDescriptionAl || "",
        nutritionInformationAl: formData.nutritionInformationAl || "",
        instructionsForUseAl: formData.instructionsForUseAl || "",
        instructionsForUseDescriptionAl:
          formData.instructionsForUseDescriptionAl || "",
        instructionsOnHowToUseItAl: formData.instructionsOnHowToUseItAl || "",
        recommendedForYou: formData.recommendedForYou || false,
        productsInTheOutlet: formData.productsInTheOutlet || false,
        justForMe: formData.justForMe || false,
        hasVariants: formData.hasVariants,
        variant_Display_Type: formData.variant_Display_Type,
      };

      if (flavorId !== null) {
        productData.FlavorId = flavorId;
      }

      if (formData.brandId) {
        productData.BrandId = formData.brandId;
      }

      Object.keys(productData).forEach((key) => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });

      await api.updateProduct(
        editingProduct.product_Id,
        productData,
        imageFile,
        false,
      );
      alert("Product updated successfully!");
      resetForm();
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await api.deleteProduct(id);
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = async (product) => {
    resetForm();

    setLoading(true);
    try {
      const fullProductData = await api.getProductById(product.product_Id);

      const productData = fullProductData.product;
      const categories = fullProductData.categories || [];
      const sports = fullProductData.sports || [];
      const goals = fullProductData.goals || [];
      const useTimings = fullProductData.useTimings || [];
      const tags = fullProductData.tags || [];

      let mainDescriptionsArray = [];
      try {
        mainDescriptionsArray =
          typeof productData.mainDescriptions === "string"
            ? JSON.parse(productData.mainDescriptions)
            : productData.mainDescriptions || [""];
      } catch {
        mainDescriptionsArray = productData.mainDescriptions
          ? [productData.mainDescriptions]
          : [];
      }

      setEditingProduct(productData);

      if (productData.img) {
        setImagePreview(productData.img);
      } else {
        setImagePreview(null);
      }

      setImageFile(null);

      const displayPrice = productData.price || 0;

      setFormData({
        name: productData.name || "",
        category: productData.category || "",
        quantity: productData.quantity || 0,
        servings: productData.servings || 0,
        gPerServing: productData.gPerServing || 0,
        gNutrition: productData.gNutrition || 0,
        price: displayPrice,
        ddvPercentage:
          productData.ddvPercentage || productData.ddV_Percentage || 18,
        descriptionHtml: descriptionFromLegacy(
          mainDescriptionsArray,
          productData.otherDescriptionTitle,
          productData.otherDescriptionText,
        ),
        otherDescriptionTitle: productData.otherDescriptionTitle || "",
        otherDescriptionText: productData.otherDescriptionText || "",
        nutritionValuesIngredients:
          productData.nutritionValuesIngredients || "",
        nutritionValuesIngredientsDescription:
          productData.nutritionValuesIngredientsDescription || "",
        nutritionInformation: productData.nutritionInformation || "",
        instructionsForUse: productData.instructionsForUse || "",
        instructionsForUseDescription:
          productData.instructionsForUseDescription || "",
        instructionsOnHowToUseIt: productData.instructionsOnHowToUseIt || "",
        newInTheShop: productData.newInTheShop || false,
        productsOnSale: productData.productsOnSale || false,
        salePrice: productData.salePrice || "",
        saleEndDate: productData.saleEndDate
          ? String(productData.saleEndDate).slice(0, 10)
          : "",
        upcomingPromotion: productData.upcomingPromotion || false,
        shortExpiry: productData.shortExpiry || false,
        expiryDate: productData.expiryDate
          ? String(productData.expiryDate).slice(0, 10)
          : "",
        isGiftVoucher: productData.isGiftVoucher || false,
        voucherMinAmount: productData.voucherMinAmount || 500,
        voucherMaxAmount: productData.voucherMaxAmount || "",
        nameAl: productData.nameAl || "",
        descriptionAl: productData.descriptionAl || "",
        nutritionValuesIngredientsAl:
          productData.nutritionValuesIngredientsAl || "",
        nutritionValuesIngredientsDescriptionAl:
          productData.nutritionValuesIngredientsDescriptionAl || "",
        nutritionInformationAl: productData.nutritionInformationAl || "",
        instructionsForUseAl: productData.instructionsForUseAl || "",
        instructionsForUseDescriptionAl:
          productData.instructionsForUseDescriptionAl || "",
        instructionsOnHowToUseItAl:
          productData.instructionsOnHowToUseItAl || "",
        recommendedForYou: productData.recommendedForYou || false,
        productsInTheOutlet: productData.productsInTheOutlet || false,
        justForMe: productData.justForMe || false,
        hasVariants: productData.hasVariants || (fullProductData.variants?.length > 0),
        variant_Display_Type: productData.variant_Display_Type || "tabs",
        brandId: productData.brand_Id || null,
        loyaltyPercentage: productData.loyaltyPercentage ?? null,
      });

      const categoryIds = categories.map((cat) => cat.category_Id);

      if (categoryIds.length > 0 && filterOptions.categories.length > 0) {
        const mappedMainCategories = categoryIds.filter((id) => {
          const cat = filterOptions.categories.find(
            (c) => c.category_Id === id,
          );
          return cat && !cat.parent_Category_Id;
        });

        const subCats = categoryIds.filter((id) => {
          const cat = filterOptions.categories.find(
            (c) => c.category_Id === id,
          );
          return cat && cat.parent_Category_Id;
        });

        const inferredMainCategories = subCats
          .map((id) =>
            filterOptions.categories.find((cat) => cat.category_Id === id),
          )
          .map((cat) => cat?.parent_Category_Id)
          .filter(Boolean);
        const mainCategories = [
          ...new Set([
            ...mappedMainCategories,
            ...inferredMainCategories,
          ]),
        ];

        setSelectedMainCategories(mainCategories);
        setSelectedSubcategories(subCats);

        // Normalize older products that had only a child mapping so saving the
        // product preserves both its main and subcategory relationships.
        categoryIds.splice(
          0,
          categoryIds.length,
          ...new Set([...mainCategories, ...subCats]),
        );
      }

      setSelectedFilters({
        categoryIds: categoryIds,
        sportIds: sports.map((s) => s.sport_Id),
        goalIds: goals.map((g) => g.goal_Id),
        useTimingIds: useTimings.map((u) => u.useTiming_Id),
        tagIds: tags.map((t) => t.tag_Id),
        flavorIds: productData.flavor_Id ? [productData.flavor_Id] : [],
        brandIds: productData.brand_Id ? [productData.brand_Id] : [],
      });

      await fetchGalleryImages(productData.product_Id);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("Failed to load product details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setImageFile(null);
    setGalleryImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData({
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
      recommendedForYou: false,
      productsInTheOutlet: false,
      justForMe: false,
      hasVariants: false,
      variant_Display_Type: "tabs",
      brandId: null,
      loyaltyPercentage: null,
    });
    resetFilters();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      handleUpdateProduct(e);
    } else {
      handleAddProduct(e);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="w-full flex justify-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-[1400px] p-4 md:p-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50 py-4">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="text-2xl max-md:text-xl font-bold text-gray-800">
                {translate("productManagement")}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin-orders")}
                className="bg-[#FDC700] max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-black font-bold hover:bg-[#e6b600] transition-colors"
              >
                Admin Orders
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-promotions")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Promotions & Gifts
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-categories")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Categories
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-homepage-sections")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Homepage Sections
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-tips")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Tips & News
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-audience")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Customers & Newsletter
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-gallery")}
                className="bg-white max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-gray-800 font-bold border border-gray-300 hover:border-[#2096D8] transition-colors"
              >
                Homepage Banners
              </button>
              <ResetCacheButton />
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                disabled={loading}
                className="bg-[#2096D8] max-md:text-sm px-6 max-md:px-4 py-2 max-md:py-1.5 text-white font-bold hover:bg-[#1a7ab3] transition-colors disabled:opacity-50"
              >
                {translate("addNewProduct")}
              </button>
              </div>
            </div>

            {/* Keep search on its own row so navigation buttons cannot collapse it. */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block w-full max-w-2xl">
                <span className="mb-1 block text-sm font-semibold text-gray-700">
                  Search products
                </span>
                <div className="relative">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search by product name, ID, brand, or flavor..."
                    value={searchTerm}
                    onChange={(e) => {
                      productListRequestId.current += 1;
                      setSearchTerm(e.target.value);
                    }}
                    className="w-full border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#2096D8] focus:ring-1 focus:ring-[#2096D8]"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear product search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-gray-400 hover:text-gray-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </label>
              <p className="min-h-5 text-sm text-gray-500" aria-live="polite">
                {searchLoading
                  ? "Searching..."
                  : searchTerm.trim()
                    ? `${products.length} product${products.length === 1 ? "" : "s"} found`
                    : `${products.length} products loaded`}
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {showBulkBar && selectedProducts.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50">
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-medium text-gray-700">
                {selectedProducts.size} product(s) selected
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBulkOutOfStock}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Set Out of Stock
                </button>
                <button
                  onClick={handleBulkInStock}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  Set In Stock
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setSelectAll(false);
                    setShowBulkBar(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {bulkActionLoading && (
                <div className="text-sm text-blue-500">Processing...</div>
              )}
            </div>
          </div>
        )}

        {/* Products Table - Responsive */}
        <div className="bg-white shadow overflow-x-auto" aria-busy={searchLoading}>
          {loading && !products.length ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block min-w-[1200px]">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                        {translate("id")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">
                        {translate("image")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                        {translate("name")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                        {translate("grams")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        {translate("price")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                        {translate("basePriceWithoutDDV")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        {translate("ddvAmount")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                        {translate("quantity")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                        {translate("placement")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] w-28">
                        {translate("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.product_Id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.product_Id)}
                            onChange={() =>
                              handleSelectProduct(product.product_Id)
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.product_Id}
                        </td>
                        <td className="px-4 py-3">
                          {product.img ? (
                            <img
                              src={getImageUrl(product.img)}
                              alt={product.name}
                              className="h-16 w-16 border border-gray-100 bg-white p-1 object-contain"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {product.gPerServing}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-semibold whitespace-nowrap">
                          MKD {product.price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          MKD{" "}
                          {(() => {
                            const priceWithDDV = product.price || 0;
                            const ddvPercentage =
                              product.ddvPercentage ||
                              product.ddV_Percentage ||
                              0;
                            const basePrice =
                              priceWithDDV / (1 + ddvPercentage / 100);
                            return basePrice.toFixed(2);
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          MKD{" "}
                          {(() => {
                            const priceWithDDV = product.price || 0;
                            const ddvPercentage =
                              product.ddvPercentage ||
                              product.ddV_Percentage ||
                              0;
                            const basePrice =
                              priceWithDDV / (1 + ddvPercentage / 100);
                            const ddvAmount = priceWithDDV - basePrice;
                            return ddvAmount.toFixed(2);
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 min-w-[150px] flex-wrap">
                            {product.newInTheShop && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                                New
                              </span>
                            )}
                            {product.productsOnSale && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                                Sale{product.saleEndDate ? ` until ${String(product.saleEndDate).slice(0, 10)}` : ""}
                              </span>
                            )}
                            {product.shortExpiry && (
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">
                                Short expiry{" "}
                                {product.expiryDate
                                  ? String(product.expiryDate).slice(0, 10)
                                  : ""}
                              </span>
                            )}
                            {product.recommendedForYou && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                                Recommended
                              </span>
                            )}
                            {product.productsInTheOutlet && (
                              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">
                                Outlet
                              </span>
                            )}
                            {product.justForMe && (
                              <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700 whitespace-nowrap">
                                Just For Me
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              disabled={loading}
                              className="bg-[#2096D8] text-white hover:bg-[#1a7ab9] px-4 py-1 text-sm"
                            >
                              {translate("edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(product.product_Id)}
                              disabled={loading}
                              className="bg-red-500 text-white hover:bg-red-600 px-4 py-1 text-sm"
                            >
                              {translate("delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (visible only on mobile) */}
              <div className="block md:hidden divide-y divide-gray-200">
                {products.map((product) => (
                  <div
                    key={product.product_Id}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex gap-3">
                      {/* Checkbox for mobile */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.product_Id)}
                          onChange={() =>
                            handleSelectProduct(product.product_Id)
                          }
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {product.img ? (
                          <img
                            src={getImageUrl(product.img)}
                            alt={product.name}
                            className="h-16 w-16 rounded border border-gray-100 bg-white p-1 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">
                              ID: {product.product_Id}
                            </p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Category:</span>{" "}
                              {product.category || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Grams:</span>{" "}
                              {product.gPerServing}g
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Stock:</span>{" "}
                              {product.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#2096D8]">
                              MKD {product.price?.toFixed(2) || "0.00"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Base: MKD{" "}
                              {(() => {
                                const priceWithDDV = product.price || 0;
                                const ddvPercentage =
                                  product.ddvPercentage ||
                                  product.ddV_Percentage ||
                                  0;
                                const basePrice =
                                  priceWithDDV / (1 + ddvPercentage / 100);
                                return basePrice.toFixed(2);
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Placement Tags */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {product.newInTheShop && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              New
                            </span>
                          )}
                          {product.productsOnSale && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                              Sale{product.saleEndDate ? ` until ${String(product.saleEndDate).slice(0, 10)}` : ""}
                            </span>
                          )}
                          {product.shortExpiry && (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                              Short expiry{" "}
                              {product.expiryDate
                                ? String(product.expiryDate).slice(0, 10)
                                : ""}
                            </span>
                          )}
                          {product.recommendedForYou && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                              Recommended
                            </span>
                          )}
                          {product.productsInTheOutlet && (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                              Outlet
                            </span>
                          )}
                          {product.justForMe && (
                            <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700">
                              Just For Me
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEdit(product)}
                            disabled={loading}
                            className="flex-1 bg-[#2096D8] text-white hover:bg-[#1a7ab9] px-3 py-1.5 text-sm rounded"
                          >
                            {translate("edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(product.product_Id)}
                            disabled={loading}
                            className="flex-1 bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 text-sm rounded"
                          >
                            {translate("delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal - Responsive */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white shadow-xl max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingProduct
                    ? translate("editProduct")
                    : translate("createNewProduct")}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <TfiClose size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {translate("productName")}
                      </label>
                      <input
                        name="name"
                        placeholder={translate("enterProductName")}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        required
                      />
                    </div>

                    {/* Brand Dropdown - REPLACES the text input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {translate("brand")}
                      </label>
                      <select
                        value={formData.brandId || ""}
                        onChange={(e) =>
                          handleBrandChange(
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                      >
                        <option value="">Select a brand</option>
                        {filterOptions.brands.map((brand) => (
                          <option key={brand.brand_Id} value={brand.brand_Id}>
                            {brand.brand_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translate("price")} (MKD) -{" "}
                          {translate("priceWithDDV")}
                        </label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        />
                        <p className="text-xs text-green-600 mt-1 break-words">
                          {translate("basePriceWithoutDDV")}: MKD{" "}
                          {(
                            formData.price /
                            (1 + formData.ddvPercentage / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translate("ddvPercentage")}
                        </label>
                        <input
                          name="ddvPercentage"
                          type="number"
                          step="0.01"
                          placeholder="18"
                          value={formData.ddvPercentage}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1 break-words">
                          {translate("ddvAmount")}: MKD{" "}
                          {(
                            formData.price -
                            formData.price / (1 + formData.ddvPercentage / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.hasVariants ? "Вкупна залиха на варијанти" : translate("quantity")}
                        </label>
                        <input
                          name="quantity"
                          type="number"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          readOnly={formData.hasVariants}
                          className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        />
                        {formData.hasVariants && (
                          <p className="mt-1 text-xs text-gray-500">Залихата се менува во секоја варијанта.</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translate("servings")}
                        </label>
                        <input
                          name="servings"
                          type="number"
                          placeholder="0"
                          value={formData.servings}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    {/* Loyalty Percentage */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loyalty Points (%)
                        </label>
                        <input
                          name="loyaltyPercentage"
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          placeholder="2.0"
                          value={formData.loyaltyPercentage ?? ""}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty for default 2%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate("productImage")}
                    </label>
                    <div className="min-h-[200px] flex justify-center items-center relative border-2 border-dashed border-gray-300 text-center hover:border-black transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      {imagePreview && (
                        <TfiClose
                          onClick={removeImage}
                          color="red"
                          strokeWidth={2}
                          className="absolute -top-2 -right-2 cursor-pointer hover:scale-125 transition bg-white rounded-full"
                        />
                      )}
                      {imagePreview ? (
                        <div className="inline-block">
                          <img
                            src={getImageUrl(imagePreview)}
                            className="object-cover max-h-[200px]"
                            alt="Preview"
                          />
                        </div>
                      ) : (
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col justify-center items-center min-h-[200px] p-4"
                        >
                          <svg
                            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm text-gray-600 text-center mt-2">
                            {translate("clickToUploadImage")}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 text-center">
                            JPG, PNG, WEBP (Max 5MB)
                          </p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Variant Manager */}
                  {editingProduct && (
                    <div className="col-span-3 mt-6">
                      <VariantManager
                        productId={editingProduct.product_Id}
                        productName={editingProduct.name}
                        onVariantsChange={async () => {
                          fetchProducts();
                          const updated = await api.getProductById(editingProduct.product_Id);
                          setFormData((prev) => ({
                            ...prev,
                            quantity: updated.product?.quantity ?? prev.quantity,
                            hasVariants: updated.product?.hasVariants || (updated.variants?.length > 0),
                          }));
                        }}
                      />
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="mt-4 md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translate("categorySelection")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {translate("mainCategory")}
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            addMainCategory(parseInt(e.target.value));
                            e.target.value = "";
                          }}
                          className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-[#2096D8]"
                        >
                          <option value="">
                            {translate("selectMainCategory")}
                          </option>
                          {filterOptions.categories
                            .filter(
                              (cat) =>
                                !cat.parent_Category_Id &&
                                !selectedMainCategories.includes(
                                  cat.category_Id,
                                ),
                            )
                            .map((cat) => (
                              <option
                                key={cat.category_Id}
                                value={cat.category_Id}
                              >
                                {cat.category_Name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {translate("subcategory")}
                        </label>
                        <select
                          value=""
                          onChange={(e) => {
                            addSubcategory(parseInt(e.target.value));
                            e.target.value = "";
                          }}
                          disabled={selectedMainCategories.length === 0}
                          className="w-full border border-gray-300 p-2.5 text-sm outline-none focus:border-[#2096D8] disabled:bg-gray-100"
                        >
                          <option value="">
                            {selectedMainCategories.length === 0
                              ? translate("selectMainCategoryFirst")
                              : translate("selectSubcategory")}
                          </option>
                          {selectedMainCategories.length > 0 &&
                            filterOptions.categories
                              .filter(
                                (cat) =>
                                  selectedMainCategories.includes(
                                    cat.parent_Category_Id,
                                  ) &&
                                  !selectedSubcategories.includes(
                                    cat.category_Id,
                                  ),
                              )
                              .map((subcat) => (
                                <option
                                  key={subcat.category_Id}
                                  value={subcat.category_Id}
                                >
                                  {
                                    filterOptions.categories.find(
                                      (cat) =>
                                        cat.category_Id ===
                                        subcat.parent_Category_Id,
                                    )?.category_Name
                                  }
                                  {" - "}
                                  {subcat.category_Name}
                                </option>
                              ))}
                        </select>
                      </div>
                    </div>

                    {selectedFilters.categoryIds.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {translate("selectedCategories")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedFilters.categoryIds.map((id) => {
                            const cat = filterOptions.categories.find(
                              (c) => c.category_Id === id,
                            );
                            const parent = cat?.parent_Category_Id
                              ? filterOptions.categories.find(
                                  (c) =>
                                    c.category_Id === cat.parent_Category_Id,
                                )
                              : null;
                            return cat ? (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                              >
                                {parent ? `${parent.category_Name} - ` : ""}
                                {cat.category_Name}
                                <button
                                  type="button"
                                  onClick={() => removeCategory(id)}
                                  className="text-blue-500 hover:text-blue-700 ml-1"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 break-words">
                      {translate("categorySelectionInfo")}
                    </p>
                  </div>

                  {/* Other Filters */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translate("otherFilters")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <FilterDropdown
                        title="Sports"
                        items={filterOptions.sports}
                        selectedIds={selectedFilters.sportIds}
                        onCheckboxChange={(id) =>
                          handleFilterCheckboxChange("sportIds", id)
                        }
                        dropdownKey="sports"
                      />
                      <FilterDropdown
                        title="Goals"
                        items={filterOptions.goals}
                        selectedIds={selectedFilters.goalIds}
                        onCheckboxChange={(id) =>
                          handleFilterCheckboxChange("goalIds", id)
                        }
                        dropdownKey="goals"
                      />
                      <FilterDropdown
                        title="Use Timing"
                        items={filterOptions.useTimings}
                        selectedIds={selectedFilters.useTimingIds}
                        onCheckboxChange={(id) =>
                          handleFilterCheckboxChange("useTimingIds", id)
                        }
                        dropdownKey="useTimings"
                      />
                      <FilterDropdown
                        title="Tags"
                        items={filterOptions.tags}
                        selectedIds={selectedFilters.tagIds}
                        onCheckboxChange={(id) =>
                          handleFilterCheckboxChange("tagIds", id)
                        }
                        dropdownKey="tags"
                      />
                      <FilterDropdown
                        title="Flavors"
                        items={filterOptions.flavors}
                        selectedIds={selectedFilters.flavorIds}
                        onCheckboxChange={(id) =>
                          handleFilterCheckboxChange("flavorIds", id)
                        }
                        dropdownKey="flavors"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Placement Section */}
                <div className="mb-6 p-3 sm:p-4 bg-gray-50">
                  <label className="block text-md font-semibold text-gray-800 mb-3">
                    {translate("categoryPlacement")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="newInTheShop"
                        checked={formData.newInTheShop}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("newInTheShop")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="productsOnSale"
                        checked={formData.productsOnSale}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("productsOnSale")}
                      </span>
                    </label>
                    {formData.productsOnSale && (
                      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                        <label className="block text-sm text-gray-700">
                          Sale price (MKD)
                          <input
                            type="number"
                            name="salePrice"
                            min="0"
                            step="0.01"
                            value={formData.salePrice}
                            onChange={handleInputChange}
                            placeholder={formData.hasVariants ? "Set per variant below" : "Discounted price"}
                            className="mt-1 w-full border border-gray-300 bg-white px-3 py-2"
                          />
                          <span className="mt-1 block text-xs text-gray-500">
                            For products with variants, enter each sale price in Variant Manager.
                          </span>
                        </label>
                        <label className="block text-sm text-gray-700">
                          Sale end date
                          <input
                            type="date"
                            name="saleEndDate"
                            value={formData.saleEndDate}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 bg-white px-3 py-2"
                          />
                          <span className="mt-1 block text-xs text-gray-500">
                            The discount stops automatically after this date. Leave empty for no end date.
                          </span>
                        </label>
                      </div>
                    )}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="upcomingPromotion"
                        checked={formData.upcomingPromotion}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("upcomingPromotions")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="shortExpiry"
                        checked={formData.shortExpiry}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        Short expiration date
                      </span>
                    </label>
                    {formData.shortExpiry && (
                      <label className="block text-sm text-gray-700">
                        Expiration date
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 outline-none focus:border-[#2096D8]"
                        />
                        <span className="mt-1 block text-xs text-gray-500">
                          Optional. Leave empty when only the short-expiry label is needed.
                        </span>
                      </label>
                    )}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isGiftVoucher"
                        checked={formData.isGiftVoucher}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">Gift voucher product</span>
                    </label>
                    {formData.isGiftVoucher && (
                      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                        <label className="block text-sm text-gray-700">
                          Minimum voucher amount (MKD)
                          <input
                            type="number"
                            name="voucherMinAmount"
                            min="500"
                            step="100"
                            value={formData.voucherMinAmount}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 bg-white px-3 py-2"
                          />
                        </label>
                        <label className="block text-sm text-gray-700">
                          Maximum amount (optional)
                          <input
                            type="number"
                            name="voucherMaxAmount"
                            min={formData.voucherMinAmount || 500}
                            step="100"
                            value={formData.voucherMaxAmount}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 bg-white px-3 py-2"
                          />
                        </label>
                      </div>
                    )}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="recommendedForYou"
                        checked={formData.recommendedForYou}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("recommendedForYou")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="productsInTheOutlet"
                        checked={formData.productsInTheOutlet}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("productsInTheOutlet")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="justForMe"
                        checked={formData.justForMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#2096D8]"
                      />
                      <span className="text-sm text-gray-700">
                        {translate("justForMe")}
                      </span>
                    </label>
                  </div>
                </div>

                <ProductDescriptionEditor
                  value={formData.descriptionHtml}
                  onChange={(descriptionHtml) =>
                    setFormData((prev) => ({ ...prev, descriptionHtml }))
                  }
                  label={translate("description")}
                />
                <div className="mb-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Albanian product content</h3>
                  <label className="mb-5 block text-sm font-medium text-gray-700">
                    Product name in Albanian
                    <input
                      name="nameAl"
                      value={formData.nameAl}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <ProductDescriptionEditor
                    value={formData.descriptionAl}
                    onChange={(descriptionAl) =>
                      setFormData((prev) => ({ ...prev, descriptionAl }))
                    }
                    label="Description in Albanian"
                  />
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    Nutrition ingredients in Albanian
                    <textarea
                      name="nutritionValuesIngredientsAl"
                      value={formData.nutritionValuesIngredientsAl}
                      onChange={handleInputChange}
                      className="mt-1 h-24 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    Nutrition description in Albanian
                    <textarea
                      name="nutritionValuesIngredientsDescriptionAl"
                      value={formData.nutritionValuesIngredientsDescriptionAl}
                      onChange={handleInputChange}
                      className="mt-1 h-24 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    Nutrition information in Albanian
                    <textarea
                      name="nutritionInformationAl"
                      value={formData.nutritionInformationAl}
                      onChange={handleInputChange}
                      className="mt-1 h-24 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    Instructions title in Albanian
                    <input
                      name="instructionsForUseAl"
                      value={formData.instructionsForUseAl}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <label className="mb-4 block text-sm font-medium text-gray-700">
                    Instructions description in Albanian
                    <textarea
                      name="instructionsForUseDescriptionAl"
                      value={formData.instructionsForUseDescriptionAl}
                      onChange={handleInputChange}
                      className="mt-1 h-24 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Detailed instructions in Albanian
                    <textarea
                      name="instructionsOnHowToUseItAl"
                      value={formData.instructionsOnHowToUseItAl}
                      onChange={handleInputChange}
                      className="mt-1 h-24 w-full border border-gray-300 p-2.5"
                    />
                  </label>
                </div>
                {/* Nutrition Values */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("nutritionValuesIngredients")}
                  </label>
                  <textarea
                    name="nutritionValuesIngredients"
                    placeholder={translate("nutritionValuesIngredients")}
                    value={formData.nutritionValuesIngredients}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 h-24 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                    rows="2"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("nutritionValuesIngredientsDescription")}
                  </label>
                  <input
                    name="nutritionValuesIngredientsDescription"
                    placeholder={translate(
                      "nutritionValuesIngredientsDescription",
                    )}
                    value={formData.nutritionValuesIngredientsDescription}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("nutritionInformation")}
                  </label>
                  <textarea
                    name="nutritionInformation"
                    placeholder={translate("nutritionInformation")}
                    value={formData.nutritionInformation}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                    rows="2"
                  />
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("instructionsForUse")}
                  </label>
                  <textarea
                    name="instructionsForUse"
                    placeholder={translate("instructionsForUse")}
                    value={formData.instructionsForUse}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                    rows="2"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("instructionsForUseDescription")}
                  </label>
                  <textarea
                    name="instructionsForUseDescription"
                    placeholder={translate("instructionsForUseDescription")}
                    value={formData.instructionsForUseDescription}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 h-24 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                    rows="2"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate("detailedInstructions")}
                  </label>
                  <textarea
                    name="instructionsOnHowToUseIt"
                    placeholder={translate("detailedInstructions")}
                    value={formData.instructionsOnHowToUseIt}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2.5 outline-none focus:border-[#2096D8] text-sm sm:text-base"
                    rows="3"
                  />
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white py-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-[#c2c2c2] hover:bg-[#e3e3e3] text-sm sm:text-base"
                  >
                    {translate("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="px-4 sm:px-6 py-2 bg-[#2096D8] text-white font-semibold hover:bg-[#1a7ab3] disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading || uploadingImage
                      ? translate("processing")
                      : editingProduct
                        ? translate("updateProduct")
                        : translate("createProduct")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
