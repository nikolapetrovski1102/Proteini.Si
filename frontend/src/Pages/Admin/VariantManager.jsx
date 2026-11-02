import { useState, useEffect } from "react";
import { TfiClose } from "react-icons/tfi";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";

// ============= SIMPLIFIED NUTRITION TABLE EDITOR (JSON BASED) =============
const NutritionTableEditor = ({ variantId, variantName, onSave }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const { translate } = useLanguage();

  useEffect(() => {
    if (variantId) {
      loadNutritionData();
    }
  }, [variantId]);

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const result = await api.getVariantNutritionTable(variantId);

      if (result && result.status && result.data) {
        const rawData = result.data;
        let transformedData = null;

        if (rawData.columns && Array.isArray(rawData.columns)) {
          let flatColumns = [];
          if (rawData.columns.length > 0 && Array.isArray(rawData.columns[0])) {
            flatColumns = rawData.columns[0];
          } else {
            flatColumns = rawData.columns;
          }

          let transformedRows = [];
          if (rawData.rows && Array.isArray(rawData.rows)) {
            transformedRows = rawData.rows.map((row, index) => {
              if (Array.isArray(row)) {
                return {
                  rowLabel: row[0]?.[0] || `Row ${index + 1}`,
                  cells: row
                    .slice(1)
                    .map((cell) => (Array.isArray(cell) ? cell[0] : cell)),
                  indentLevel: 0,
                };
              }
              return row;
            });
          }

          transformedData = {
            columns: flatColumns,
            rows: transformedRows,
          };
        } else if (rawData.columns && rawData.rows) {
          transformedData = rawData;
        }

        if (
          transformedData &&
          transformedData.columns &&
          transformedData.columns.length > 0
        ) {
          setTableData(transformedData);
        } else {
          setTableData(null);
        }
      } else {
        setTableData(null);
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAndSave = async () => {
    if (!pasteText.trim()) {
      alert("Please paste table data first");
      return;
    }

    setSaving(true);
    try {
      const result = await api.pasteVariantNutritionTable(variantId, pasteText);
      if (result.status) {
        await loadNutritionData();
        setPasteMode(false);
        setPasteText("");
        alert("Nutrition table saved successfully!");
        if (onSave) onSave();
      } else {
        alert(result.error || "Failed to save nutrition table");
      }
    } catch (error) {
      console.error("Error saving nutrition table:", error);
      alert(
        "Failed to save nutrition table: " + (error.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete nutrition table for this variant?")) return;

    setSaving(true);
    try {
      await api.deleteVariantNutritionTable(variantId);
      setTableData(null);
      alert("Nutrition table deleted successfully!");
      if (onSave) onSave();
    } catch (error) {
      console.error("Error deleting nutrition table:", error);
      alert("Failed to delete nutrition table");
    } finally {
      setSaving(false);
    }
  };

  const copyTableToClipboard = () => {
    if (!tableData || !tableData.columns || !tableData.rows) return;

    let text = "\t" + tableData.columns.join("\t") + "\n";
    tableData.rows.forEach((row) => {
      const indent = "  ".repeat(row.indentLevel || 0);
      text +=
        indent + row.rowLabel + "\t" + (row.cells || []).join("\t") + "\n";
    });

    navigator.clipboard.writeText(text);
    alert("Table copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Loading nutrition data...
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h4 className="text-md font-semibold text-gray-800">
          📊 {translate("dynamicNutritionTable")} - {variantName}
        </h4>
        <div className="flex gap-2 flex-wrap">
          {!tableData && !pasteMode && (
            <button
              type="button"
              onClick={() => setPasteMode(true)}
              className="bg-green-500 text-white px-3 py-1.5 hover:bg-green-600"
            >
              + Add Nutrition Table
            </button>
          )}
          {tableData &&
            tableData.columns &&
            tableData.rows &&
            tableData.rows.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={copyTableToClipboard}
                  className="bg-blue-500 text-white px-3 py-1 text-sm hover:bg-blue-600"
                >
                  📋 Copy Table
                </button>
                <button
                  type="button"
                  onClick={() => setPasteMode(true)}
                  className="bg-yellow-500 text-white px-3 py-1 text-sm hover:bg-yellow-600"
                >
                  ✏️ Edit Table
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-red-500 text-white px-3 py-1 text-sm hover:bg-red-600"
                >
                  🗑️ Delete
                </button>
              </>
            )}
        </div>
      </div>
      {/* Display existing table */}
      {tableData &&
        tableData.columns &&
        Array.isArray(tableData.columns) &&
        tableData.columns.length > 0 &&
        tableData.rows &&
        Array.isArray(tableData.rows) &&
        tableData.rows.length > 0 &&
        !pasteMode && (
          <div className="overflow-x-auto border">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                    Nutrients
                  </th>
                  {tableData.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-3 py-2 text-left font-semibold"
                    >
                      {typeof col === "string" ? col : col[0] || "Column"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      <div
                        style={{
                          paddingLeft: `${(row.indentLevel || 0) * 20}px`,
                        }}
                      >
                        {row.rowLabel || row[0] || "Row"}
                      </div>
                    </td>
                    {(row.cells || row.slice?.(1) || []).map(
                      (cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="border border-gray-300 px-3 py-2"
                        >
                          {typeof cell === "string" ? cell : cell[0] || "—"}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {/* Show message when no data */}
      {!tableData && !pasteMode && (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No nutrition table added yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Click "Add Nutrition Table" to paste from Excel
          </p>
        </div>
      )}
      {/* Paste new/edited table */}
      {pasteMode && (
        <div className="bg-gray-50 p-4 border">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h5 className="font-semibold text-gray-800">
                📋 Paste Nutrition Table
              </h5>
              <p className="text-xs text-gray-500 mt-1">
                Copy from Excel/Google Sheets (including headers) and paste
                below
              </p>
            </div>
            <button
              onClick={() => {
                setPasteMode(false);
                setPasteText("");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <TfiClose size={16} />
            </button>
          </div>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Example:
          100g    1 serving (30g)    2 servings (60g)
energy    1570 kJ  471 kJ  942 kJ

Or your supplement format:
Recommended daily dose (2 capsules)	Value
Ginseng extract (Panax ginseng)	234 mg
of which ginsenosides	4,68 mg
Zinc	9,6 mg (96%*)`}
            className="w-full h-40 p-3 border font-mono text-sm bg-white"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handlePasteAndSave}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Table"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasteMode(false);
                setPasteText("");
              }}
              className="bg-gray-500 text-white px-4 py-2 hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============= MULTI-IMAGE GALLERY MANAGER =============
const VariantGalleryManager = ({ variantId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { translate } = useLanguage();

  useEffect(() => {
    if (variantId) {
      loadGallery();
    }
  }, [variantId]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getVariantGallery(variantId);
      setImages(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("Image", file);
        formData.append("Variant_Id", variantId);

        const response = await api.uploadVariantGalleryImage(formData);
        if (response.status) {
          await loadGallery();
          if (onImagesChange) onImagesChange();
        }
      }
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSetMainImage = async (galleryId) => {
    try {
      await api.setMainVariantGalleryImage(variantId, galleryId);
      await loadGallery();
      if (onImagesChange) onImagesChange();
      alert("Main image updated!");
    } catch (error) {
      console.error("Error setting main image:", error);
      alert("Failed to set main image");
    }
  };

  const handleDeleteImage = async (galleryId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await api.deleteVariantGalleryImage(galleryId);
      await loadGallery();
      if (onImagesChange) onImagesChange();
      alert("Image deleted!");
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-image.jpg";
    if (path.startsWith("http")) return path;
    return `https://proteini.mk${path}`;
  };

  if (loading) {
    return (
      <div className="text-center py-2 text-gray-500">Loading gallery...</div>
    );
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">
        {translate("variantImagesGallery")}
      </label>

      <div className="mb-4">
        <label className="cursor-pointer bg-[#2096D8] text-white px-4 py-2 hover:bg-[#1a7ab9] inline-block">
          {uploading ? translate("uploading") : translate("addImages")}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300">
          <p className="text-gray-500">{translate("noVariantImages")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.gallery_Id}
              className="relative group border p-2 bg-gray-50"
            >
              <img
                src={getImageUrl(img.image_Path)}
                alt={`Variant image ${idx + 1}`}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(img.gallery_Id)}
                    className="text-white text-xs bg-blue-500 px-2 py-1 hover:bg-blue-600"
                  >
                    {translate("setAsMain")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.gallery_Id)}
                  className="text-white text-xs bg-red-500 px-2 py-1 hover:bg-red-600"
                >
                  {translate("delete")}
                </button>
              </div>
              {img.isMain && (
                <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1">
                  {translate("main")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function VariantManager({
  productId,
  productName,
  onVariantsChange,
}) {
  const [variants, setVariants] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { translate } = useLanguage();
  const [formData, setFormData] = useState({
    option_Type: "flavor",
    flavor_Name: "",
    packaging_Id: "",
    packaging_Name: "",
    weight_Grams: "",
    price: "",
    ddv_Percentage: 18,
    compare_Price: "",
    quantity: 0,
    variant_Name: "",
    sku: "",
    isDefault: false,
    ingredients: "",
    description: "",
    variant_Image_Path: "",
    loyaltyPercentage: "", // ✅ ADDED: Loyalty percentage for variant
  });

  const [bulkForm, setBulkForm] = useState({
    selectedFlavors: [],
    selectedPackagings: [],
    basePrice: "",
    ddv_Percentage: 18,
    comparePrice: "",
    quantity: 0,
    loyaltyPercentage: "", // ✅ ADDED: Loyalty percentage for bulk create
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return path;
  };

  const getPackagingWeightValue = (packaging) => {
    const weight =
      packaging?.weight_Grams ??
      packaging?.Weight_Grams ??
      packaging?.weight_grams;
    const numericWeight = Number(weight);
    return Number.isFinite(numericWeight) && numericWeight > 0
      ? numericWeight
      : null;
  };

  const formatWeightGrams = (weight) => {
    const numericWeight = Number(weight);
    return Number.isFinite(numericWeight) && numericWeight > 0
      ? `${numericWeight.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })} g`
      : "No grams set";
  };

  const findPackagingOptionByName = (packagingName) => {
    const normalizedName = String(packagingName || "")
      .trim()
      .toLowerCase();
    if (!normalizedName) return null;

    return (
      packagingOptions.find(
        (pkg) =>
          String(pkg.packaging_Name || pkg.Packaging_Name || "")
            .trim()
            .toLowerCase() === normalizedName,
      ) || null
    );
  };

  const getVariantWeight = (variant) =>
    getPackagingWeightValue(variant) ||
    getPackagingWeightValue(findPackagingOptionByName(variant?.packaging_Name));

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [variantsRes, packagingRes, productData] = await Promise.all([
        api.getProductVariants(productId),
        api.getPackaging(),
        api.getProductById(productId),
      ]);

      const productDdvPercentage = productData?.product?.ddV_Percentage || 18;

      setVariants(variantsRes.data || []);
      setPackagingOptions(packagingRes.data || []);

      setFormData((prev) => ({
        ...prev,
        ddv_Percentage: productDdvPercentage,
      }));

      setBulkForm((prev) => ({
        ...prev,
        ddv_Percentage: productDdvPercentage,
      }));

      const filterOptions = await api.getFilterOptions();
      setFlavors(filterOptions.flavors || []);
    } catch (error) {
      console.error("Error fetching variant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadVariantImage = async (file, variantId) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("Image", file);
      if (variantId) {
        formData.append("Variant_Id", variantId);
      }
      const response = await api.uploadVariantImage(formData);
      return response.imagePath;
    } catch (error) {
      console.error("Error uploading variant image:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVariantImageSelect = (e) => {
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "packaging_Name") {
      const selectedPackaging = findPackagingOptionByName(value);
      setFormData((prev) => ({
        ...prev,
        packaging_Name: value,
        packaging_Id:
          selectedPackaging?.packaging_Id ||
          selectedPackaging?.Packaging_Id ||
          "",
        weight_Grams: selectedPackaging
          ? getPackagingWeightValue(selectedPackaging) || ""
          : prev.weight_Grams,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBulkFlavorChange = (flavorId) => {
    setBulkForm((prev) => {
      const selected = prev.selectedFlavors.includes(flavorId)
        ? prev.selectedFlavors.filter((id) => id !== flavorId)
        : [...prev.selectedFlavors, flavorId];
      return { ...prev, selectedFlavors: selected };
    });
  };

  const handleBulkPackagingChange = (packagingId) => {
    setBulkForm((prev) => {
      const selected = prev.selectedPackagings.includes(packagingId)
        ? prev.selectedPackagings.filter((id) => id !== packagingId)
        : [...prev.selectedPackagings, packagingId];
      return { ...prev, selectedPackagings: selected };
    });
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateVariant = async () => {
    if (!formData.flavor_Name || !formData.packaging_Name || !formData.price) {
      alert("Please fill in all required fields (Option, Packaging, Price)");
      return;
    }

    setUploadingImage(true);
    let uploadedImagePath = null;

    if (imageFile) {
      uploadedImagePath = await uploadVariantImage(imageFile, null);
    }

    try {
      const selectedPackaging = findPackagingOptionByName(
        formData.packaging_Name,
      );
      const variantData = {
        product_Id: productId,
        option_Type: formData.option_Type,
        flavor_Name: formData.flavor_Name,
        packaging_Id:
          selectedPackaging?.packaging_Id ||
          selectedPackaging?.Packaging_Id ||
          formData.packaging_Id ||
          null,
        packaging_Name: formData.packaging_Name,
        weight_Grams: formData.weight_Grams
          ? parseFloat(formData.weight_Grams)
          : null,
        price: parseFloat(formData.price),
        ddv_Percentage: parseFloat(formData.ddv_Percentage) || 18,
        compare_Price: formData.compare_Price
          ? parseFloat(formData.compare_Price)
          : null,
        quantity: parseInt(formData.quantity) || 0,
        variant_Name: formData.variant_Name || null,
        sku: formData.sku || null,
        isDefault: formData.isDefault,
        ingredients: formData.ingredients || null,
        description: formData.description || null,
        variant_Image_Path: uploadedImagePath,
        display_Order: variants.length,
        loyaltyPercentage: formData.loyaltyPercentage
          ? parseFloat(formData.loyaltyPercentage)
          : null, // ✅ ADDED
      };

      await api.createVariant(variantData);
      await fetchData();
      setShowAddModal(false);
      resetForm();
      if (onVariantsChange) onVariantsChange();
      alert("Variant added successfully!");
    } catch (error) {
      console.error("Error creating variant:", error);
      alert("Failed to create variant: " + (error.message || "Unknown error"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBulkCreate = async () => {
    if (
      bulkForm.selectedFlavors.length === 0 ||
      bulkForm.selectedPackagings.length === 0
    ) {
      alert("Please select at least one flavor and one packaging option");
      return;
    }
    if (!bulkForm.basePrice) {
      alert("Please enter a base price");
      return;
    }
    try {
      await api.bulkCreateVariants({
        product_Id: productId,
        flavorIds: bulkForm.selectedFlavors,
        packagingIds: bulkForm.selectedPackagings,
        basePrice: parseFloat(bulkForm.basePrice),
        ddv_Percentage: parseFloat(bulkForm.ddv_Percentage) || 18,
        comparePrice: bulkForm.comparePrice
          ? parseFloat(bulkForm.comparePrice)
          : null,
        quantity: parseInt(bulkForm.quantity) || 0,
        loyaltyPercentage: bulkForm.loyaltyPercentage
          ? parseFloat(bulkForm.loyaltyPercentage)
          : null, // ✅ ADDED
      });
      await fetchData();
      setShowBulkModal(false);
      setBulkForm({
        selectedFlavors: [],
        selectedPackagings: [],
        basePrice: "",
        ddv_Percentage: 18,
        comparePrice: "",
        quantity: 0,
        loyaltyPercentage: "",
      });
      if (onVariantsChange) onVariantsChange();
      alert("Variants created successfully!");
    } catch (error) {
      console.error("Error bulk creating variants:", error);
      alert("Failed to create variants: " + (error.message || "Unknown error"));
    }
  };

  const handleUpdateVariant = async () => {
    let uploadedImagePath = formData.variant_Image_Path;

    if (imageFile) {
      setUploadingImage(true);
      uploadedImagePath = await uploadVariantImage(
        imageFile,
        editingVariant.variant_Id,
      );
      setUploadingImage(false);
    }

    try {
      const selectedPackaging = findPackagingOptionByName(
        formData.packaging_Name,
      );
      const updateData = {
        variant_Id: editingVariant.variant_Id,
        option_Type: formData.option_Type,
        flavor_Name: formData.flavor_Name,
        packaging_Id:
          selectedPackaging?.packaging_Id ||
          selectedPackaging?.Packaging_Id ||
          formData.packaging_Id ||
          null,
        packaging_Name: formData.packaging_Name,
        weight_Grams: formData.weight_Grams
          ? parseFloat(formData.weight_Grams)
          : null,
        price: parseFloat(formData.price),
        ddv_Percentage: parseFloat(formData.ddv_Percentage) || 18,
        compare_Price: formData.compare_Price
          ? parseFloat(formData.compare_Price)
          : null,
        quantity: parseInt(formData.quantity),
        variant_Name: formData.variant_Name || null,
        sku: formData.sku || null,
        isDefault: formData.isDefault,
        isActive: true,
        ingredients: formData.ingredients || null,
        description: formData.description || null,
        variant_Image_Path: uploadedImagePath,
        loyaltyPercentage: formData.loyaltyPercentage
          ? parseFloat(formData.loyaltyPercentage)
          : null, // ✅ ADDED
      };

      await api.updateVariant(updateData);
      await fetchData();
      setEditingVariant(null);
      setShowAddModal(false);
      resetForm();
      if (onVariantsChange) onVariantsChange();
      alert("Variant updated successfully!");
    } catch (error) {
      console.error("Error updating variant:", error);
      alert("Failed to update variant: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;
    try {
      await api.deleteVariant(variantId);
      await fetchData();
      if (onVariantsChange) onVariantsChange();
      alert("Variant deleted successfully!");
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert("Failed to delete variant: " + (error.message || "Unknown error"));
    }
  };

  const handleSetDefault = async (variantId) => {
    try {
      for (const variant of variants) {
        if (variant.isDefault) {
          await api.updateVariant({ ...variant, isDefault: false });
        }
      }
      const variantToUpdate = variants.find((v) => v.variant_Id === variantId);
      if (variantToUpdate) {
        await api.updateVariant({ ...variantToUpdate, isDefault: true });
      }
      await fetchData();
      if (onVariantsChange) onVariantsChange();
      alert("Default variant set successfully!");
    } catch (error) {
      console.error("Error setting default variant:", error);
      alert("Failed to set default variant");
    }
  };

  const resetForm = () => {
    setFormData({
      option_Type: "flavor",
      flavor_Name: "",
      packaging_Id: "",
      packaging_Name: "",
      weight_Grams: "",
      price: "",
      ddv_Percentage: 18,
      compare_Price: "",
      quantity: 0,
      variant_Name: "",
      sku: "",
      isDefault: false,
      ingredients: "",
      description: "",
      variant_Image_Path: "",
      loyaltyPercentage: "",
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const openEditModal = (variant) => {
    setEditingVariant(variant);
    setFormData({
      option_Type: variant.option_Type === "color" ? "color" : "flavor",
      flavor_Name: variant.flavor_Name || "",
      packaging_Id: variant.packaging_Id || variant.Packaging_Id || "",
      packaging_Name: variant.packaging_Name || "",
      weight_Grams:
        variant.weight_Grams || variant.Weight_Grams || variant.weight_grams || "",
      price: variant.price || 0,
      ddv_Percentage:
        variant.ddv_Percentage ||
        variant.DDV_Percentage ||
        variant.ddV_Percentage ||
        18,
      compare_Price: variant.compare_Price || "",
      quantity: variant.quantity || 0,
      variant_Name: variant.variant_Name || "",
      sku: variant.sku || "",
      isDefault: variant.isDefault || false,
      ingredients: variant.ingredients || "",
      description: variant.description || "",
      variant_Image_Path: variant.variant_Image_Path || "",
      loyaltyPercentage:
        variant.loyaltyPercentage || variant.LoyaltyPercentage || "", // ✅ ADDED
    });
    setImagePreview(
      variant.variant_Image_Path
        ? getImageUrl(variant.variant_Image_Path)
        : null,
    );
    setImageFile(null);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">Loading variants...</div>
    );
  }

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {translate("productVariants")}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditingVariant(null);
              setShowAddModal(true);
            }}
            className="bg-green-500 text-white px-4 py-2 text-sm hover:bg-green-600"
          >
            {translate("addVariant")}
          </button>
        </div>
      </div>

      {/* Variants Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">{translate("image")}</th>
              <th className="px-3 py-2 text-left">
                {translate("variantOption")}
              </th>
              <th className="px-3 py-2 text-left">{translate("packaging")}</th>
              <th className="px-3 py-2 text-left">Grams</th>
              <th className="px-3 py-2 text-left">{translate("price")}</th>
              <th className="px-3 py-2 text-left">
                {translate("basePriceWithoutDDV")}
              </th>
              <th className="px-3 py-2 text-left">{translate("ddvAmount")}</th>
              <th className="px-3 py-2 text-left">{translate("quantity")}</th>
              <th className="px-3 py-2 text-left">
                {translate("loyaltyPoints")} (%)
              </th>
              <th className="px-3 py-2 text-left">{translate("isDefault")}</th>
              <th className="px-3 py-2 text-left">{translate("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-500">
                  {translate("noVariantsYet")}
                </td>
              </tr>
            ) : (
              variants.map((variant) => (
                <tr key={variant.variant_Id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {variant.variant_Image_Path ? (
                      <img
                        src={getImageUrl(variant.variant_Image_Path)}
                        alt="Variant"
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {translate(
                        variant.option_Type === "color" ? "color" : "flavor",
                      )}
                    </span>
                    <span>{variant.flavor_Name}</span>
                  </td>
                  <td className="px-3 py-2">{variant.packaging_Name}</td>
                  <td className="px-3 py-2">
                    {formatWeightGrams(getVariantWeight(variant))}
                  </td>

                  {/* Price (with DDV already included) */}
                  <td className="px-3 py-2 font-semibold text-[#2096D8]">
                    MKD {(variant.price || 0).toFixed(2)}
                  </td>

                  {/* Base price without DDV */}
                  <td className="px-3 py-2">
                    MKD{" "}
                    {(() => {
                      const priceWithDDV = variant.price || 0;
                      const ddvPercentage =
                        variant.ddv_Percentage ||
                        variant.DDV_Percentage ||
                        variant.ddV_Percentage ||
                        0;
                      const basePrice =
                        priceWithDDV / (1 + ddvPercentage / 100);
                      return basePrice.toFixed(2);
                    })()}
                  </td>

                  {/* DDV Amount */}
                  <td className="px-3 py-2">
                    MKD{" "}
                    {(() => {
                      const priceWithDDV = variant.price || 0;
                      const ddvPercentage =
                        variant.ddv_Percentage ||
                        variant.DDV_Percentage ||
                        variant.ddV_Percentage ||
                        0;
                      const basePrice =
                        priceWithDDV / (1 + ddvPercentage / 100);
                      const ddvAmount = priceWithDDV - basePrice;
                      return ddvAmount.toFixed(2);
                    })()}
                  </td>

                  <td className="px-3 py-2">{variant.quantity}</td>

                  {/* Loyalty Percentage */}
                  <td className="px-3 py-2">
                    {(variant.loyaltyPercentage ||
                      variant.LoyaltyPercentage) !== null &&
                    (variant.loyaltyPercentage || variant.LoyaltyPercentage) >
                      0 ? (
                      <span className="font-semibold text-green-600">
                        {variant.loyaltyPercentage || variant.LoyaltyPercentage}
                        %
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        2% (default)
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {variant.isDefault ? (
                      <span className="text-green-600 font-semibold">
                        ✓ {translate("default")}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(variant.variant_Id)}
                        className="text-blue-500 hover:underline text-xs font-bold"
                      >
                        {translate("setDefault")}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(variant)}
                        className="bg-[#2096D8] text-white hover:bg-[#1a7ab9] px-4 py-1"
                      >
                        {translate("edit")}
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant.variant_Id)}
                        className="bg-red-500 text-white hover:bg-red-600 px-4 py-1"
                      >
                        {translate("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingVariant
                  ? translate("editVariant")
                  : translate("addNewVariant")}{" "}
                - {productName}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVariant(null);
                  resetForm();
                }}
              >
                <TfiClose size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("optionType")}
                  </label>
                  <select
                    name="option_Type"
                    value={formData.option_Type}
                    onChange={handleInputChange}
                    className="w-full border border-[#C8C8C8] bg-white py-2 px-4 outline-none"
                  >
                    <option value="flavor">{translate("flavor")}</option>
                    <option value="color">{translate("color")}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {translate("optionTypeHint")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate(
                      formData.option_Type === "color" ? "color" : "flavor",
                    )}
                  </label>
                  <input
                    type="text"
                    name="flavor_Name"
                    value={formData.flavor_Name}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      formData.option_Type === "color"
                        ? translate("colorHint")
                        : translate("flavorHint")
                    }
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("packaging")}
                  </label>
                  <input
                    type="text"
                    list="variant-packaging-options"
                    name="packaging_Name"
                    value={formData.packaging_Name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 500g, 2kg"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <datalist id="variant-packaging-options">
                    {packagingOptions.map((pkg) => (
                      <option
                        key={pkg.packaging_Id || pkg.Packaging_Id}
                        value={pkg.packaging_Name || pkg.Packaging_Name}
                      />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">
                    Saved weight: {formatWeightGrams(formData.weight_Grams)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grams for delivery
                  </label>
                  <input
                    type="number"
                    name="weight_Grams"
                    value={formData.weight_Grams}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 500"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for cart delivery fee calculation.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("price")} (MKD) - {translate("priceWithDDV")}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    {translate("basePriceWithoutDDV")}: MKD{" "}
                    {(
                      formData.price /
                      (1 + formData.ddv_Percentage / 100)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("ddvPercentage")}
                  </label>
                  <input
                    type="number"
                    name="ddv_Percentage"
                    value={formData.ddv_Percentage}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="18"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {translate("ddvAmount")}: MKD{" "}
                    {(
                      formData.price -
                      formData.price / (1 + formData.ddv_Percentage / 100)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("stockQuantity")}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sale price (MKD)
                  </label>
                  <input
                    type="number"
                    name="compare_Price"
                    value={formData.compare_Price}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a price lower than the regular price. Enable Products on sale and set the end date in the product form.
                  </p>
                </div>

                {/* ✅ ADDED: Loyalty Percentage Field */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("loyaltyPoints")} (%)
                  </label>
                  <input
                    type="number"
                    name="loyaltyPercentage"
                    value={formData.loyaltyPercentage}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="2.0"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for default 2%
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {translate("mainVariantImage")}
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          className="w-20 h-20 object-cover border"
                          alt="Preview"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-gray-100 px-4 py-2 hover:bg-gray-200">
                        {uploadingImage
                          ? translate("uploading")
                          : translate("uploadImage")}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleVariantImageSelect}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Variant Gallery Manager */}
                {editingVariant && editingVariant.variant_Id && (
                  <div className="col-span-2">
                    <VariantGalleryManager
                      variantId={editingVariant.variant_Id}
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">
                      {translate("setAsDefaultVariant")}
                    </span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {translate("variantName")}
                  </label>
                  <input
                    type="text"
                    name="variant_Name"
                    value={formData.variant_Name}
                    onChange={handleInputChange}
                    placeholder="e.g., Chocolate 500g"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {translate("ingredients")}
                  </label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>

                {/* Dynamic Nutrition Table Editor */}
                {editingVariant && editingVariant.variant_Id && (
                  <div className="col-span-2">
                    <NutritionTableEditor
                      variantId={editingVariant.variant_Id}
                      variantName={
                        formData.variant_Name ||
                        `Variant ${editingVariant.variant_Id}`
                      }
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    {translate("descriptionOptional")}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white flex justify-end gap-3 mt-6 py-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVariant(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-[#c2c2c2] hover:bg-[#e3e3e3]"
                >
                  {translate("cancel")}
                </button>
                <button
                  type="button"
                  onClick={
                    editingVariant ? handleUpdateVariant : handleCreateVariant
                  }
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-[#2096D8] hover:bg-[#1a7ab9] text-white disabled:opacity-50"
                >
                  {uploadingImage
                    ? translate("uploadingImage")
                    : editingVariant
                      ? translate("update")
                      : translate("create")}{" "}
                  {translate("variant")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Bulk Create Variants - {productName}
              </h3>
              <button onClick={() => setShowBulkModal(false)}>
                <TfiClose size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Flavors *
                  </label>
                  <div className="max-h-40 overflow-y-auto border p-2">
                    {flavors.map((flavor) => (
                      <label
                        key={flavor.flavor_Id || flavor.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={bulkForm.selectedFlavors.includes(
                            flavor.flavor_Id || flavor.id,
                          )}
                          onChange={() =>
                            handleBulkFlavorChange(
                              flavor.flavor_Id || flavor.id,
                            )
                          }
                        />
                        <span>{flavor.flavor_Name || flavor.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Packaging *
                  </label>
                  <div className="max-h-40 overflow-y-auto border p-2">
                    {packagingOptions.map((pkg) => (
                      <label
                        key={pkg.packaging_Id || pkg.Packaging_Id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={bulkForm.selectedPackagings.includes(
                            pkg.packaging_Id || pkg.Packaging_Id,
                          )}
                          onChange={() =>
                            handleBulkPackagingChange(
                              pkg.packaging_Id || pkg.Packaging_Id,
                            )
                          }
                        />
                        <span>
                          {pkg.packaging_Name || pkg.Packaging_Name} (
                          {formatWeightGrams(getPackagingWeightValue(pkg))})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Base Price (MKD) * - {translate("priceWithDDV")}
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={bulkForm.basePrice}
                    onChange={handleBulkInputChange}
                    required
                    step="0.01"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    {translate("basePriceWithoutDDV")}: MKD{" "}
                    {(
                      bulkForm.basePrice /
                      (1 + bulkForm.ddv_Percentage / 100)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    DDV Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="ddv_Percentage"
                    value={bulkForm.ddv_Percentage}
                    onChange={handleBulkInputChange}
                    step="0.01"
                    placeholder="18"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {translate("ddvAmount")}: MKD{" "}
                    {(
                      bulkForm.basePrice -
                      bulkForm.basePrice / (1 + bulkForm.ddv_Percentage / 100)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={bulkForm.quantity}
                    onChange={handleBulkInputChange}
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                </div>

                {/* ✅ ADDED: Loyalty Percentage for Bulk Create */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {translate("loyaltyPoints")} (%)
                  </label>
                  <input
                    type="number"
                    name="loyaltyPercentage"
                    value={bulkForm.loyaltyPercentage}
                    onChange={handleBulkInputChange}
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="2.0"
                    className="w-full border border-[#C8C8C8] py-2 px-4 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for default 2%
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkCreate}
                  className="px-4 py-2 bg-[#2096D8] hover:bg-[#1a7ab9] text-white"
                >
                  Create{" "}
                  {bulkForm.selectedFlavors.length *
                    bulkForm.selectedPackagings.length}{" "}
                  Variants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
