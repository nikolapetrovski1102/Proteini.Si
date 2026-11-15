import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiImage, FiPlus, FiStar, FiTag, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  ImagePicker,
  Loading,
  Modal,
  Notice,
  SearchInput,
  Toggle,
  inputClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const HEADER_SLOTS = 4;
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

const emptyForm = {
  name: "",
  slug: "",
  isFeatured: false,
  displayOrder: 0,
  logo: null,
  headerImage: null,
  logoPreview: null,
  headerPreview: null,
  removeLogo: false,
  removeHeaderImage: false,
};

const brandImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path.startsWith("/") ? "" : "/"}${path}`;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productsLabel = (count) => `${count} product${count === 1 ? "" : "s"}`;

export default function AdminBrands() {
  const confirm = useConfirm();
  const toast = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const featured = useMemo(
    () => brands.filter((b) => b.is_Featured).sort((a, b) => a.display_Order - b.display_Order || a.brand_Name.localeCompare(b.brand_Name)),
    [brands],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? brands.filter((b) => b.brand_Name.toLowerCase().includes(q) || b.brand_Slug.includes(q)) : brands;
    return [...list].sort((a, b) => a.brand_Name.localeCompare(b.brand_Name, undefined, { sensitivity: "base" }));
  }, [brands, query]);

  const load = async () => {
    setLoading(true);
    try {
      setBrands((await api.getAdminBrands()) || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setOpen(true);
  };

  const edit = (brand) => {
    setEditing(brand);
    setForm({
      ...emptyForm,
      name: brand.brand_Name || "",
      slug: brand.brand_Slug || "",
      isFeatured: !!brand.is_Featured,
      displayOrder: brand.display_Order || 0,
      logoPreview: brandImageUrl(brand.logo_Url),
      headerPreview: brandImageUrl(brand.header_Image_Url),
    });
    setSlugTouched(true);
    setOpen(true);
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = (kind) => (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Use a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setForm((current) =>
      kind === "logo"
        ? { ...current, logo: file, logoPreview: preview, removeLogo: false }
        : { ...current, headerImage: file, headerPreview: preview, removeHeaderImage: false },
    );
  };

  const clearImage = (kind) => () =>
    setForm((current) =>
      kind === "logo"
        ? { ...current, logo: null, logoPreview: null, removeLogo: true }
        : { ...current, headerImage: null, headerPreview: null, removeHeaderImage: true },
    );

  // Featuring an extra brand is blocked once four are already in the header.
  const featuredFull = featured.filter((b) => b.brand_Id !== editing?.brand_Id).length >= HEADER_SLOTS;

  const submit = async (event) => {
    event?.preventDefault();
    if (!form.name.trim()) {
      toast.error("Brand name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), slug: form.slug.trim() || slugify(form.name) };
      if (editing) await api.updateAdminBrand(editing.brand_Id, payload);
      else await api.createAdminBrand(payload);
      toast.success(editing ? "Brand updated." : "Brand added.");
      setOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  // Quick add/remove from the header without opening the form.
  const toggleFeatured = async (brand) => {
    if (!brand.is_Featured && featured.length >= HEADER_SLOTS) {
      toast.error("The header already shows 4 brands. Remove one first.");
      return;
    }
    setBusyId(brand.brand_Id);
    try {
      await api.updateAdminBrand(brand.brand_Id, {
        name: brand.brand_Name,
        slug: brand.brand_Slug,
        isFeatured: !brand.is_Featured,
        displayOrder: brand.display_Order,
      });
      toast.success(brand.is_Featured ? `${brand.brand_Name} removed from the header.` : `${brand.brand_Name} added to the header.`);
      await load();
    } catch (toggleError) {
      toast.error(toggleError.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (brand) => {
    if (brand.product_Count > 0) {
      toast.error(`${brand.brand_Name} is used by ${productsLabel(brand.product_Count)}. Move them to another brand first.`);
      return;
    }
    const ok = await confirm({
      title: `Delete “${brand.brand_Name}”?`,
      message: "The brand and its images are removed. No products use it.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAdminBrand(brand.brand_Id);
      toast.success("Brand deleted.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const thumb = (brand, size = "h-11 w-11") => {
    const src = brandImageUrl(brand.logo_Url) || brandImageUrl(brand.header_Image_Url);
    return (
      <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.06]`}>
        {src ? (
          <img src={src} alt="" className={brand.logo_Url ? "max-h-full max-w-full object-contain p-1" : "h-full w-full object-cover"} />
        ) : (
          <span className="text-sm font-bold text-gray-400">{brand.brand_Name.charAt(0).toUpperCase()}</span>
        )}
      </span>
    );
  };

  const slots = Array.from({ length: HEADER_SLOTS }, (_, i) => featured[i] || null);

  return (
    <AdminPage
      eyebrow="Shop"
      title="Brands"
      count={loading ? undefined : brands.length}
      description="Brands shown in the shop filters and the header's Brands menu. Up to 4 brands are featured with a photo on the left of that menu."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          New brand
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}

      <Card
        title="In the header"
        description="These 4 brands appear with their photo on the left of the Brands menu, in this order (lowest position first). The picture is shown whole, exactly as uploaded, on white. Best size: 800 × 600 px, landscape."
      >
        {loading ? (
          <Loading label="Loading brands…" />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {slots.map((brand, index) =>
              brand ? (
                <button
                  key={brand.brand_Id}
                  type="button"
                  onClick={() => edit(brand)}
                  className="group block overflow-hidden rounded-xl bg-white text-left ring-1 ring-black/[0.08] transition hover:ring-black/20 active:scale-[0.98]"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-white">
                    {brand.header_Image_Url ? (
                      <img src={brandImageUrl(brand.header_Image_Url)} alt="" className="absolute inset-0 h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-gray-400">
                        <FiImage size={20} aria-hidden="true" />
                        No photo yet
                      </span>
                    )}
                  </span>
                  <span className="block border-t border-black/[0.06] px-3 py-2">
                    <span className="block truncate text-sm font-bold text-gray-900">{brand.brand_Name}</span>
                    <span className="block text-[11px] text-gray-500">Position {brand.display_Order} · Click to edit</span>
                  </span>
                </button>
              ) : (
                <div
                  key={`empty-${index}`}
                  className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-black/[0.12] px-4 text-center text-xs text-gray-500"
                >
                  Empty. Click the star next to a brand below to show it here.
                </div>
              ),
            )}
          </div>
        )}
      </Card>

      <Card
        title="All brands"
        actions={<SearchInput value={query} onChange={setQuery} placeholder="Search brands…" className="w-full sm:w-64" />}
        bodyClassName=""
      >
        {loading ? (
          <Loading label="Loading brands…" />
        ) : brands.length === 0 ? (
          <EmptyState icon={FiTag} title="No brands yet" text="Add your first brand." action={<Button icon={FiPlus} onClick={startNew}>New brand</Button>} />
        ) : filtered.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No brands match „{query.trim()}“.</p>
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {filtered.map((brand) => (
              <li key={brand.brand_Id} className="flex items-center gap-3 px-5 py-3">
                {thumb(brand)}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-gray-900">{brand.brand_Name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {[
                      `/${brand.brand_Slug}`,
                      productsLabel(brand.product_Count),
                      brand.is_Featured ? "In the header" : null,
                      brand.is_Featured && !brand.header_Image_Url ? "needs a photo" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(brand)}
                  disabled={busyId === brand.brand_Id}
                  aria-pressed={!!brand.is_Featured}
                  aria-label={brand.is_Featured ? `Remove ${brand.brand_Name} from the header` : `Show ${brand.brand_Name} in the header`}
                  title={brand.is_Featured ? "Shown in the header. Click to remove." : "Show in the header"}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/[0.05] active:scale-90 disabled:opacity-40 ${
                    brand.is_Featured ? "text-[#E0A800]" : "text-gray-300 hover:text-gray-500"
                  }`}
                >
                  <FiStar size={18} fill={brand.is_Featured ? "currentColor" : "none"} />
                </button>
                <IconButton icon={FiEdit2} label={`Edit ${brand.brand_Name}`} onClick={() => edit(brand)} />
                <IconButton icon={FiTrash2} tone="danger" label={`Delete ${brand.brand_Name}`} onClick={() => remove(brand)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.brand_Name}` : "New brand"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editing ? "Save changes" : "Add brand"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name" required>
            <input
              required
              maxLength={100}
              className={inputClass}
              value={form.name}
              placeholder="e.g. Optimum Nutrition"
              onChange={(e) => {
                const name = e.target.value;
                setForm((c) => ({ ...c, name, slug: slugTouched ? c.slug : slugify(name) }));
              }}
            />
          </Field>
          <Field label="URL" hint="Used in the shop filter link (/all-products?brand=…). Filled in from the name.">
            <input
              maxLength={100}
              className={`${inputClass} font-mono text-sm`}
              value={form.slug}
              placeholder="optimum-nutrition"
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
            />
          </Field>
          {editing && editing.brand_Slug !== form.slug.trim() && form.slug.trim() && (
            <Notice tone="warning">Changing the URL breaks old links to this brand's filter that were shared elsewhere.</Notice>
          )}

          <Toggle
            checked={form.isFeatured}
            onChange={(value) => setField("isFeatured", value)}
            disabled={!form.isFeatured && featuredFull}
            label="Show in the header"
            description={
              !form.isFeatured && featuredFull
                ? "The header already shows 4 brands. Remove one of them first."
                : "Shown with its photo on the left of the Brands menu (max 4)."
            }
          />

          <Field label="Position" hint="Lower numbers are shown first in the header.">
            <input
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(e) => setField("displayOrder", e.target.value)}
              className={`${inputClass} max-w-[140px]`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
            <Field label="Header photo" hint="Landscape, about 800 × 600 px. JPG, PNG or WEBP, max 8 MB.">
              <ImagePicker promptKey="brandHeader"
                preview={form.headerPreview}
                onFile={pickImage("header")}
                onClear={clearImage("header")}
                label="Choose header photo"
                aspect="aspect-[4/3]"
                fit="object-contain bg-white"
                accept={ALLOWED.join(",")}
              />
            </Field>
            <Field label="Logo" hint="Optional. Shown small next to the brand name.">
              <ImagePicker promptKey="brandLogo"
                preview={form.logoPreview}
                onFile={pickImage("logo")}
                onClear={clearImage("logo")}
                label="Choose logo"
                aspect="aspect-square"
                fit="object-contain p-2"
                accept={ALLOWED.join(",")}
              />
            </Field>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
