import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FiArrowLeft, FiCopy, FiEdit2, FiImage, FiLayers, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  GeminiPromptButton,
  ImagePicker,
  Loading,
  Segmented,
  Toggle,
  inputClass,
  tableClass,
  tableWrapClass,
  tdClass,
  textareaClass,
  thClass,
  trClass,
} from "./AdminKit";
import { formatMoney } from "./adminUtils";
import { PriceWithVat, SalePriceFields } from "./AdminPriceFields";
import { fieldClass } from "./adminFieldClass";
import { useConfirm, useToast } from "./adminFeedback";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const variantImageUrl = (path) => {
  if (!path) return null;
  return path;
};

const galleryImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
};

const vatRate = (v) => v.ddv_Percentage || v.DDV_Percentage || v.ddV_Percentage || 0;

/** Field name → message for everything that blocks saving a variant. */
const validateVariant = (form) => {
  const errors = {};
  const isColor = form.option_Type === "color";
  if (!String(form.flavor_Name || "").trim()) errors.flavor_Name = isColor ? "Enter the colour." : "Enter the flavour.";
  if (!String(form.packaging_Name || "").trim()) errors.packaging_Name = "Enter the size or packaging.";
  const price = Number(form.price);
  if (!(price > 0)) errors.price = "Enter a price above 0.";
  if (form.compare_Price !== "" && form.compare_Price != null) {
    const sale = Number(form.compare_Price);
    if (!(sale > 0)) errors.compare_Price = "Sale price must be above 0.";
    else if (price > 0 && sale >= price) errors.compare_Price = "Sale price must be lower than the regular price.";
  }
  if (form.quantity !== "" && Number(form.quantity) < 0) errors.quantity = "Stock can't be negative.";
  const loyalty = form.loyaltyPercentage;
  if (loyalty !== "" && loyalty != null && (Number(loyalty) < 0 || Number(loyalty) > 100)) errors.loyaltyPercentage = "Use a value between 0 and 100.";
  return errors;
};

/* ============================================================ nutrition table */

function NutritionTableEditor({ variantId, onSave }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const result = await api.getVariantNutritionTable(variantId);
      let transformed = null;
      if (result?.status && result.data) {
        const raw = result.data;
        if (Array.isArray(raw.columns)) {
          const columns = raw.columns.length > 0 && Array.isArray(raw.columns[0]) ? raw.columns[0] : raw.columns;
          const rows = Array.isArray(raw.rows)
            ? raw.rows.map((row, index) =>
                Array.isArray(row)
                  ? {
                      rowLabel: row[0]?.[0] || `Row ${index + 1}`,
                      cells: row.slice(1).map((cell) => (Array.isArray(cell) ? cell[0] : cell)),
                      indentLevel: 0,
                    }
                  : row,
              )
            : [];
          transformed = { columns, rows };
        } else if (raw.columns && raw.rows) {
          transformed = raw;
        }
      }
      setTableData(transformed?.columns?.length > 0 ? transformed : null);
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) loadNutritionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  const tableAsText = () => {
    if (!tableData?.columns || !tableData?.rows) return "";
    let text = "\t" + tableData.columns.join("\t") + "\n";
    tableData.rows.forEach((row) => {
      text += "  ".repeat(row.indentLevel || 0) + row.rowLabel + "\t" + (row.cells || []).join("\t") + "\n";
    });
    return text;
  };

  const handlePasteAndSave = async () => {
    if (!pasteText.trim()) {
      toast.error("Paste the table first.");
      return;
    }
    setSaving(true);
    try {
      const result = await api.pasteVariantNutritionTable(variantId, pasteText);
      if (result.status) {
        await loadNutritionData();
        setPasteMode(false);
        setPasteText("");
        toast.success("Nutrition table saved.");
        onSave?.();
      } else {
        toast.error(result.error || "Couldn't read that table. Check that columns are separated by tabs.");
      }
    } catch (error) {
      console.error("Error saving nutrition table:", error);
      toast.error("Couldn't save the table: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: "Remove the nutrition table?", message: "The table will disappear from this variant's product page.", confirmLabel: "Remove", tone: "danger" });
    if (!ok) return;
    setSaving(true);
    try {
      await api.deleteVariantNutritionTable(variantId);
      setTableData(null);
      toast.success("Nutrition table removed.");
      onSave?.();
    } catch (error) {
      console.error("Error deleting nutrition table:", error);
      toast.error("Couldn't remove the table.");
    } finally {
      setSaving(false);
    }
  };

  const copyTable = async () => {
    try {
      await navigator.clipboard.writeText(tableAsText());
      toast.success("Table copied. You can paste it into Excel or another variant.");
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  };

  if (loading) return <p className="py-3 text-sm text-gray-500">Loading nutrition table…</p>;

  const hasRows = tableData?.rows?.length > 0;

  return (
    <div>
      {pasteMode ? (
        <div className="space-y-3 rounded-xl bg-[#f6f5f1] p-4">
          <p className="text-sm text-gray-700">
            Select the table in Excel or Google Sheets (including the header row), copy it, and paste it below.
          </p>
          <textarea
            autoFocus
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={"\t100 g\t1 serving (30 g)\nEnergy\t1570 kJ\t471 kJ\nProtein\t78 g\t23 g"}
            className={`${textareaClass} font-mono text-[13px]`}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handlePasteAndSave} loading={saving}>
              Save table
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setPasteMode(false);
                setPasteText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : hasRows ? (
        <>
          <div className="overflow-x-auto rounded-xl ring-1 ring-black/[0.08]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f6f5f1]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Nutrient</th>
                  {tableData.columns.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-semibold text-gray-700">
                      {typeof col === "string" ? col : col[0] || "Column"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, idx) => (
                  <tr key={idx} className="border-t border-black/[0.05]">
                    <td className="px-3 py-1.5 font-medium text-gray-900" style={{ paddingLeft: `${12 + (row.indentLevel || 0) * 16}px` }}>
                      {row.rowLabel || row[0] || "Row"}
                    </td>
                    {(row.cells || row.slice?.(1) || []).map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-1.5 tabular-nums text-gray-700">
                        {typeof cell === "string" ? cell : cell?.[0] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={FiEdit2}
              onClick={() => {
                setPasteText(tableAsText());
                setPasteMode(true);
              }}
            >
              Replace
            </Button>
            <Button size="sm" variant="secondary" icon={FiCopy} onClick={copyTable}>
              Copy
            </Button>
            <Button size="sm" variant="ghost" icon={FiTrash2} onClick={handleDelete} disabled={saving}>
              Remove
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-black/[0.1] px-4 py-4">
          <p className="text-sm text-gray-500">No nutrition table yet.</p>
          <Button size="sm" variant="secondary" icon={FiPlus} onClick={() => setPasteMode(true)}>
            Paste from Excel
          </Button>
        </div>
      )}
    </div>
  );
}

/* ============================================================ variant gallery */

function VariantGalleryManager({ variantId }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGallery = async () => {
    try {
      const data = await api.getVariantGallery(variantId);
      setImages(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  const upload = async (file) => {
    if (!IMAGE_TYPES.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Please choose a JPG, PNG or WebP image up to 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("Image", file);
      formData.append("Variant_Id", variantId);
      const response = await api.uploadVariantGalleryImage(formData);
      if (response.status) {
        await loadGallery();
        toast.success("Photo added.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  };

  const setMain = async (galleryId) => {
    try {
      await api.setMainVariantGalleryImage(variantId, galleryId);
      await loadGallery();
      toast.success("Main photo updated.");
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Couldn't change the main photo.");
    }
  };

  const remove = async (galleryId) => {
    const ok = await confirm({ title: "Remove this photo?", confirmLabel: "Remove", tone: "danger" });
    if (!ok) return;
    try {
      await api.deleteVariantGalleryImage(galleryId);
      await loadGallery();
      toast.success("Photo removed.");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Couldn't remove the photo.");
    }
  };

  if (loading) return <p className="py-3 text-sm text-gray-500">Loading photos…</p>;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {images.map((img) => (
        <div key={img.gallery_Id} className="group relative aspect-square overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.06]">
          <img src={galleryImageUrl(img.image_Path)} alt="" className="h-full w-full object-contain p-1" />
          {img.isMain && <span className="absolute left-1 top-1 rounded bg-[#141409] px-1.5 py-0.5 text-[10px] font-bold text-[#FDC700]">Main</span>}
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            {!img.isMain && (
              <button
                type="button"
                onClick={() => setMain(img.gallery_Id)}
                aria-label="Use as main photo"
                title="Use as main photo"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-gray-800 hover:bg-white"
              >
                <FiStar size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(img.gallery_Id)}
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
        onFile={upload}
        aspect="aspect-square"
        accept={IMAGE_TYPES.join(",")}
        label={uploading ? "Uploading…" : "Add"}
        className={uploading ? "pointer-events-none opacity-60" : ""}
      />
      <GeminiPromptButton promptKey="productGallery" className="col-span-full" />
    </div>
  );
}

/* ============================================================ variant manager */

const emptyVariantForm = {
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
  ingredientsAl: "",
  ingredientsEn: "",
  description: "",
  variant_Image_Path: "",
  loyaltyPercentage: "",
};

/**
 * Variant list + editor. The parent hosts the Save/Cancel buttons (the product modal's sticky footer) through the ref:
 *  ref.save()          – validate and save the open variant
 *  ref.requestClose()  – close the editor, asking first if there are unsaved changes; resolves true when closed
 * onEditorChange({ open, dirty, saving, isNew }) reports the editor state so the parent can swap its footer.
 */
const VariantManager = forwardRef(function VariantManager({ productId, productName, onVariantsChange, onEditorChange }, ref) {
  const toast = useToast();
  const confirm = useConfirm();
  const [variants, setVariants] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productVat, setProductVat] = useState(18);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyVariantForm);
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? validateVariant(formData) : {};
  const savedSnapshot = useRef(JSON.stringify(emptyVariantForm));
  const closePromptOpen = useRef(false);
  const isDirty = showForm && (Boolean(imageFile) || JSON.stringify(formData) !== savedSnapshot.current);

  const getPackagingWeightValue = (packaging) => {
    const weight = packaging?.weight_Grams ?? packaging?.Weight_Grams ?? packaging?.weight_grams;
    const n = Number(weight);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const formatWeightGrams = (weight) => {
    const n = Number(weight);
    return Number.isFinite(n) && n > 0 ? `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} g` : null;
  };

  const findPackagingOptionByName = (packagingName) => {
    const normalized = String(packagingName || "").trim().toLowerCase();
    if (!normalized) return null;
    return packagingOptions.find((pkg) => String(pkg.packaging_Name || pkg.Packaging_Name || "").trim().toLowerCase() === normalized) || null;
  };

  const getVariantWeight = (variant) =>
    getPackagingWeightValue(variant) || getPackagingWeightValue(findPackagingOptionByName(variant?.packaging_Name));

  const fetchData = async () => {
    try {
      const [variantsRes, packagingRes, productData] = await Promise.all([
        api.getProductVariants(productId),
        api.getPackaging(),
        api.getProductById(productId),
      ]);
      setVariants(variantsRes.data || []);
      setPackagingOptions(packagingRes.data || []);
      setProductVat(productData?.product?.ddV_Percentage || 18);
    } catch (error) {
      console.error("Error fetching variant data:", error);
      toast.error("Couldn't load variants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "packaging_Name") {
      const selected = findPackagingOptionByName(value);
      setFormData((prev) => ({
        ...prev,
        packaging_Name: value,
        packaging_Id: selected?.packaging_Id || selected?.Packaging_Id || "",
        weight_Grams: selected ? getPackagingWeightValue(selected) || "" : prev.weight_Grams,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleVariantImageSelect = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadVariantImage = async (file, variantId) => {
    try {
      const fd = new FormData();
      fd.append("Image", file);
      if (variantId) fd.append("Variant_Id", variantId);
      const response = await api.uploadVariantImage(fd);
      return response.imagePath;
    } catch (error) {
      console.error("Error uploading variant image:", error);
      toast.error("The photo couldn't be uploaded; the variant was saved without it.");
      return null;
    }
  };

  const closeForm = () => {
    setShowErrors(false);
    setShowForm(false);
    setEditingVariant(null);
    setFormData({ ...emptyVariantForm, ddv_Percentage: productVat });
    setImagePreview(null);
    setImageFile(null);
  };

  const openForm = (variant, nextForm) => {
    savedSnapshot.current = JSON.stringify(nextForm);
    setShowErrors(false);
    setEditingVariant(variant);
    setFormData(nextForm);
  };

  /** Close the editor; if something was changed, ask first. Resolves true when the editor closed. */
  const requestClose = async () => {
    if (!showForm) return true;
    if (closePromptOpen.current) return false;
    if (isDirty) {
      closePromptOpen.current = true;
      const discard = await confirm({
        title: "Discard unsaved variant changes?",
        message: "You changed this variant but didn't save. Leaving now throws those changes away.",
        confirmLabel: "Discard changes",
        cancelLabel: "Keep editing",
        tone: "danger",
      });
      setTimeout(() => {
        closePromptOpen.current = false;
      }, 0);
      if (!discard) return false;
    }
    closeForm();
    return true;
  };

  const startNew = () => {
    openForm(null, { ...emptyVariantForm, ddv_Percentage: productVat, isDefault: variants.length === 0 });
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (variant) => {
    openForm(variant, {
      option_Type: variant.option_Type === "color" ? "color" : "flavor",
      flavor_Name: variant.flavor_Name || "",
      packaging_Id: variant.packaging_Id || variant.Packaging_Id || "",
      packaging_Name: variant.packaging_Name || "",
      weight_Grams: variant.weight_Grams || variant.Weight_Grams || variant.weight_grams || "",
      price: variant.price || 0,
      ddv_Percentage: vatRate(variant) || 18,
      compare_Price: variant.compare_Price || "",
      quantity: variant.quantity || 0,
      variant_Name: variant.variant_Name || "",
      sku: variant.sku || "",
      isDefault: variant.isDefault || false,
      ingredients: variant.ingredients || "",
      ingredientsAl: variant.ingredientsAl || "",
      ingredientsEn: variant.ingredientsEn || "",
      description: variant.description || "",
      variant_Image_Path: variant.variant_Image_Path || "",
      loyaltyPercentage: variant.loyaltyPercentage || variant.LoyaltyPercentage || "",
    });
    setImagePreview(variant.variant_Image_Path ? variantImageUrl(variant.variant_Image_Path) : null);
    setImageFile(null);
    setShowForm(true);
  };

  const buildPayload = (imagePath) => {
    const selected = findPackagingOptionByName(formData.packaging_Name);
    return {
      option_Type: formData.option_Type,
      flavor_Name: formData.flavor_Name,
      packaging_Id: selected?.packaging_Id || selected?.Packaging_Id || formData.packaging_Id || null,
      packaging_Name: formData.packaging_Name,
      weight_Grams: formData.weight_Grams ? parseFloat(formData.weight_Grams) : null,
      price: parseFloat(formData.price),
      ddv_Percentage: parseFloat(formData.ddv_Percentage) || 18,
      compare_Price: formData.compare_Price ? parseFloat(formData.compare_Price) : null,
      variant_Name: formData.variant_Name || null,
      sku: formData.sku || null,
      isDefault: formData.isDefault,
      ingredients: formData.ingredients || null,
      ingredientsAl: formData.ingredientsAl || null,
      ingredientsEn: formData.ingredientsEn || null,
      description: formData.description || null,
      variant_Image_Path: imagePath,
      loyaltyPercentage: formData.loyaltyPercentage ? parseFloat(formData.loyaltyPercentage) : null,
    };
  };

  const handleSave = async () => {
    if (saving) return;
    const found = validateVariant(formData);
    if (Object.keys(found).length > 0) {
      setShowErrors(true);
      toast.error("Please fix the fields marked in red.");
      const first = document.querySelector(`[name="${Object.keys(found)[0]}"]`);
      first?.focus?.();
      return;
    }
    setSaving(true);
    try {
      if (editingVariant) {
        const imagePath = imageFile ? await uploadVariantImage(imageFile, editingVariant.variant_Id) : formData.variant_Image_Path;
        await api.updateVariant({
          ...buildPayload(imagePath),
          variant_Id: editingVariant.variant_Id,
          quantity: parseInt(formData.quantity),
          isActive: true,
        });
        toast.success("Variant saved.");
      } else {
        const imagePath = imageFile ? await uploadVariantImage(imageFile, null) : null;
        await api.createVariant({
          ...buildPayload(imagePath),
          product_Id: productId,
          quantity: parseInt(formData.quantity) || 0,
          display_Order: variants.length,
        });
        toast.success("Variant added.");
      }
      await fetchData();
      closeForm();
      onVariantsChange?.();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Couldn't save the variant: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variant) => {
    const ok = await confirm({
      title: `Delete “${variant.variant_Name || `${variant.flavor_Name} ${variant.packaging_Name}`}”?`,
      message: "Customers will no longer be able to choose this option. This can't be undone.",
      confirmLabel: "Delete variant",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteVariant(variant.variant_Id);
      await fetchData();
      onVariantsChange?.();
      toast.success("Variant deleted.");
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Couldn't delete the variant: " + (error.message || "Unknown error"));
    }
  };

  const handleSetDefault = async (variantId) => {
    try {
      for (const variant of variants) {
        if (variant.isDefault) await api.updateVariant({ ...variant, isDefault: false });
      }
      const target = variants.find((v) => v.variant_Id === variantId);
      if (target) await api.updateVariant({ ...target, isDefault: true });
      await fetchData();
      onVariantsChange?.();
      toast.success("Default variant changed.");
    } catch (error) {
      console.error("Error setting default variant:", error);
      toast.error("Couldn't change the default variant.");
    }
  };

  useImperativeHandle(ref, () => ({ save: handleSave, requestClose }));

  // Tell the parent what the editor is doing so it can show the right footer buttons.
  const onEditorChangeRef = useRef(onEditorChange);
  onEditorChangeRef.current = onEditorChange;
  const isNew = !editingVariant;
  useEffect(() => {
    onEditorChangeRef.current?.({ open: showForm, dirty: isDirty, saving, isNew });
  }, [showForm, isDirty, saving, isNew]);
  useEffect(() => () => onEditorChangeRef.current?.({ open: false, dirty: false, saving: false, isNew: false }), []);

  if (loading) return <Loading label="Loading variants…" />;

  /* --------------------------------------------------------- form view */
  if (showForm) {
    const isColor = formData.option_Type === "color";
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={requestClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <FiArrowLeft size={15} aria-hidden="true" /> All variants
          </button>
          <p className="font-display text-lg font-bold uppercase tracking-tight text-gray-900">
            {editingVariant ? "Edit variant" : "New variant"}
            {isDirty && <span className="ml-2 align-middle font-sans text-xs font-semibold normal-case tracking-normal text-[#b3191f]">Unsaved</span>}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-6">
            <FormSection title="Option" description="What the customer picks on the product page.">
              <div className="space-y-4">
                <Segmented
                  value={formData.option_Type}
                  onChange={(v) => setFormData((p) => ({ ...p, option_Type: v }))}
                  options={[
                    { value: "flavor", label: "Flavour" },
                    { value: "color", label: "Colour" },
                  ]}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={isColor ? "Colour" : "Flavour"} required error={errors.flavor_Name}>
                    <input
                      name="flavor_Name"
                      data-autofocus
                      value={formData.flavor_Name}
                      onChange={handleInputChange}
                      placeholder={isColor ? "e.g. Black" : "e.g. Chocolate"}
                      aria-invalid={Boolean(errors.flavor_Name) || undefined}
                      className={fieldClass(errors.flavor_Name)}
                    />
                  </Field>
                  <Field label="Size / packaging" required hint="Pick a saved size or type a new one." error={errors.packaging_Name}>
                    <input
                      list="variant-packaging-options"
                      name="packaging_Name"
                      value={formData.packaging_Name}
                      onChange={handleInputChange}
                      placeholder="e.g. 2 kg"
                      aria-invalid={Boolean(errors.packaging_Name) || undefined}
                      className={fieldClass(errors.packaging_Name)}
                    />
                    <datalist id="variant-packaging-options">
                      {packagingOptions.map((pkg) => (
                        <option key={pkg.packaging_Id || pkg.Packaging_Id} value={pkg.packaging_Name || pkg.Packaging_Name} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Weight for delivery (g)" hint="Used to calculate the delivery fee.">
                    <input name="weight_Grams" type="number" min="0" step="0.01" value={formData.weight_Grams} onChange={handleInputChange} placeholder="e.g. 2000" className={inputClass} />
                  </Field>
                  <Field label="Display name" hint="Optional. Defaults to flavour + size.">
                    <input
                      name="variant_Name"
                      value={formData.variant_Name}
                      onChange={handleInputChange}
                      placeholder={[formData.flavor_Name, formData.packaging_Name].filter(Boolean).join(" ") || "e.g. Chocolate 2 kg"}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection title="Price & stock">
              <div className="space-y-5">
                <PriceWithVat
                  price={formData.price}
                  vat={formData.ddv_Percentage}
                  onPriceChange={(value) => setFormData((p) => ({ ...p, price: value }))}
                  onVatChange={(value) => setFormData((p) => ({ ...p, ddv_Percentage: value }))}
                  error={errors.price}
                />
                <SalePriceFields
                  price={formData.price}
                  salePrice={formData.compare_Price}
                  onSalePriceChange={(value) => setFormData((p) => ({ ...p, compare_Price: value }))}
                  error={errors.compare_Price}
                  label="Sale price"
                  hint="Optional. Shown when “On sale” is turned on in the product's Labels tab."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="In stock" hint="0 = out of stock." error={errors.quantity}>
                    <input
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors.quantity) || undefined}
                      className={fieldClass(errors.quantity, "tabular-nums")}
                    />
                  </Field>
                  <Field label="Loyalty points (%)" hint="Empty = default 2%." error={errors.loyaltyPercentage}>
                    <input
                      name="loyaltyPercentage"
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="2"
                      value={formData.loyaltyPercentage}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors.loyaltyPercentage) || undefined}
                      className={fieldClass(errors.loyaltyPercentage, "tabular-nums")}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <Toggle
              checked={formData.isDefault}
              onChange={(v) => setFormData((p) => ({ ...p, isDefault: v }))}
              label="Default choice"
              description="Pre-selected when a customer opens the product."
              className="-mx-3"
            />

            <FormSection title="Details">
              <div className="space-y-4">
                <Field label="Ingredients">
                  <textarea name="ingredients" rows={3} value={formData.ingredients} onChange={handleInputChange} className={textareaClass} />
                </Field>
                <Field label="Ingredients (Albanian)" hint="Shown when the shop is in Albanian. Empty shows the Macedonian text.">
                  <textarea name="ingredientsAl" rows={3} value={formData.ingredientsAl} onChange={handleInputChange} className={textareaClass} lang="sq" />
                </Field>
                <Field label="Ingredients (English)" hint="Shown when the shop is in English. Empty shows the Macedonian text.">
                  <textarea name="ingredientsEn" rows={3} value={formData.ingredientsEn} onChange={handleInputChange} className={textareaClass} lang="en" />
                </Field>
                <Field label="Description" hint="Optional. Extra text for this variant only.">
                  <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className={textareaClass} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Nutrition table" description="Shown on the product page when this variant is selected.">
              {editingVariant ? (
                <NutritionTableEditor variantId={editingVariant.variant_Id} />
              ) : (
                <p className="rounded-xl bg-[#f6f5f1] px-4 py-3 text-sm text-gray-500">Save the variant first, then you can paste its nutrition table.</p>
              )}
            </FormSection>
          </div>

          <div className="space-y-5">
            <Field label="Variant photo">
              <ImagePicker promptKey="productPhoto"
                preview={imagePreview}
                onFile={handleVariantImageSelect}
                onClear={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setFormData((p) => ({ ...p, variant_Image_Path: "" }));
                }}
                aspect="aspect-square"
                fit="object-contain"
                accept={IMAGE_TYPES.join(",")}
                hint="Shown when this variant is selected."
              />
            </Field>
            {editingVariant && (
              <div>
                <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Extra photos</p>
                <VariantGalleryManager variantId={editingVariant.variant_Id} />
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  /* --------------------------------------------------------- list view */
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {variants.length === 0 ? "No variants yet." : `${variants.length} variant${variants.length === 1 ? "" : "s"} of ${productName || "this product"}.`}
        </p>
        <Button size="sm" icon={FiPlus} onClick={startNew}>
          Add variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-2xl bg-[#f6f5f1]">
          <EmptyState
            icon={FiLayers}
            title="This product has one version"
            text="Add variants if customers should choose a flavour, colour or size. Each one gets its own price and stock."
            action={<Button icon={FiPlus} onClick={startNew}>Add first variant</Button>}
          />
        </div>
      ) : (
        <div className={`${tableWrapClass} rounded-2xl ring-1 ring-black/[0.06]`}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Variant</th>
                <th className={thClass}>Size</th>
                <th className={`${thClass} text-right`}>Price</th>
                <th className={`${thClass} text-right`}>Stock</th>
                <th className={thClass}>Default</th>
                <th className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => {
                const gross = variant.price || 0;
                const base = gross / (1 + vatRate(variant) / 100);
                const weight = formatWeightGrams(getVariantWeight(variant));
                const loyalty = variant.loyaltyPercentage || variant.LoyaltyPercentage;
                return (
                  <tr key={variant.variant_Id} className={trClass}>
                    <td className={tdClass}>
                      <button type="button" onClick={() => openEdit(variant)} className="group flex items-center gap-3 text-left">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.05]">
                          {variant.variant_Image_Path ? (
                            <img src={variantImageUrl(variant.variant_Image_Path)} alt="" className="h-full w-full object-contain p-0.5" />
                          ) : (
                            <FiImage className="text-gray-300" aria-hidden="true" />
                          )}
                        </span>
                        <span>
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {variant.option_Type === "color" ? "Colour" : "Flavour"}
                          </span>
                          <span className="block font-semibold text-gray-900 group-hover:underline">{variant.flavor_Name}</span>
                        </span>
                      </button>
                    </td>
                    <td className={tdClass}>
                      <span className="block">{variant.packaging_Name}</span>
                      <span className={`block text-xs ${weight ? "text-gray-500" : "text-[#b3191f]"}`}>{weight || "No weight set"}</span>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap text-right`}>
                      <span className="block font-semibold tabular-nums">{formatMoney(gross)}</span>
                      <span className="block text-xs tabular-nums text-gray-500">
                        excl. VAT {formatMoney(base)}
                        {loyalty > 0 ? ` · ${loyalty}% pts` : ""}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {Number(variant.quantity) > 0 ? <span className="font-semibold tabular-nums">{variant.quantity}</span> : <Badge tone="red">Out</Badge>}
                    </td>
                    <td className={tdClass}>
                      {variant.isDefault ? (
                        <Badge tone="ink">Default</Badge>
                      ) : (
                        <button type="button" onClick={() => handleSetDefault(variant.variant_Id)} className="text-xs font-semibold text-gray-500 hover:text-gray-900 hover:underline">
                          Make default
                        </button>
                      )}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex justify-end">
                        <IconButton icon={FiEdit2} label={`Edit ${variant.flavor_Name}`} onClick={() => openEdit(variant)} />
                        <IconButton icon={FiTrash2} tone="danger" label={`Delete ${variant.flavor_Name}`} onClick={() => handleDeleteVariant(variant)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default VariantManager;
