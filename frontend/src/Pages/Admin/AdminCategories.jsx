import { useEffect, useMemo, useState } from "react";
import { FiCornerDownRight, FiEdit2, FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Loading,
  Modal,
  Notice,
  inputClass,
  selectClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const emptyForm = { name: "", slug: "", parentId: "", displayOrder: 0 };

/** "Whey Protein Isolate" → "whey-protein-isolate" (Cyrillic is transliterated). */
const CYR = { а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh", з: "z", ѕ: "dz", и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ќ: "kj", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dzh", ш: "sh" };
const slugify = (text) =>
  text
    .toLowerCase()
    .split("")
    .map((c) => CYR[c] ?? c)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminCategories() {
  const confirm = useConfirm();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Subcategories whose parent no longer exists are shown as top-level rows so they stay editable.
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parent_Category_Id || !categories.some((p) => p.category_Id === c.parent_Category_Id)),
    [categories],
  );
  const childrenOf = (id) => categories.filter((c) => c.parent_Category_Id === id);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await api.getAdminCategories());
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

  const startNew = (parentId = "") => {
    setForm({ ...emptyForm, parentId });
    setEditingId(null);
    setSlugTouched(false);
    setOpen(true);
  };

  const edit = (category) => {
    setEditingId(category.category_Id);
    setForm({
      name: category.category_Name || "",
      slug: category.category_Slug || "",
      parentId: category.parent_Category_Id || "",
      displayOrder: category.display_Order || 0,
    });
    setSlugTouched(true);
    setOpen(true);
  };

  const submit = async (event) => {
    event?.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and URL are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      displayOrder: Number(form.displayOrder) || 0,
    };
    try {
      if (editingId) await api.updateAdminCategory(editingId, payload);
      else await api.createAdminCategory(payload);
      toast.success(editingId ? "Category updated." : "Category added.");
      setOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    const subs = childrenOf(category.category_Id).length;
    const ok = await confirm({
      title: `Delete “${category.category_Name}”?`,
      message: subs
        ? `It has ${subs} subcategor${subs === 1 ? "y" : "ies"}. Products using it will no longer appear under this filter.`
        : "Products using it will no longer appear under this filter.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAdminCategory(category.category_Id);
      toast.success("Category deleted.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const renderRow = (category, child = false) => (
    <div className={`flex items-center gap-3 px-5 py-3 ${child ? "pl-10 sm:pl-14" : ""}`}>
      {child && <FiCornerDownRight className="shrink-0 text-gray-300" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <p className={`truncate ${child ? "text-sm font-semibold text-gray-800" : "font-bold text-gray-900"}`}>{category.category_Name}</p>
        <p className="truncate font-mono text-xs text-gray-500">/{category.category_Slug}</p>
      </div>
      <Badge className="hidden sm:inline-flex">Order {category.display_Order}</Badge>
      {!child && (
        <Button size="sm" variant="ghost" icon={FiPlus} onClick={() => startNew(category.category_Id)} className="hidden sm:inline-flex">
          Subcategory
        </Button>
      )}
      <IconButton icon={FiEdit2} label={`Edit ${category.category_Name}`} onClick={() => edit(category)} />
      <IconButton icon={FiTrash2} tone="danger" label={`Delete ${category.category_Name}`} onClick={() => remove(category)} />
    </div>
  );

  return (
    <AdminPage
      eyebrow="Shop"
      title="Categories"
      count={loading ? undefined : categories.length}
      description="Categories become the filters customers use in the shop. Create a main category, then add subcategories under it."
      actions={
        <Button icon={FiPlus} onClick={() => startNew()}>
          New category
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}

      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading categories…" />
        ) : categories.length === 0 ? (
          <EmptyState icon={FiLayers} title="No categories yet" text="Add your first main category, e.g. “Proteins”." action={<Button icon={FiPlus} onClick={() => startNew()}>New category</Button>} />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {mainCategories.map((main) => (
              <li key={main.category_Id}>
                {renderRow(main)}
                {childrenOf(main.category_Id).length > 0 && (
                  <ul className="divide-y divide-black/[0.04] bg-[#faf9f6]">
                    {childrenOf(main.category_Id).map((sub) => (
                      <li key={sub.category_Id}>
                        {renderRow(sub, true)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title={editingId ? "Edit category" : form.parentId ? "New subcategory" : "New category"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editingId ? "Save changes" : "Add category"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name" required>
            <input
              required
              className={inputClass}
              value={form.name}
              placeholder="e.g. Egg white protein"
              onChange={(e) => {
                const name = e.target.value;
                setForm((c) => ({ ...c, name, slug: slugTouched ? c.slug : slugify(name) }));
              }}
            />
          </Field>
          <Field label="URL" required hint="Used in the shop address and filters. Filled in from the name — change only if needed.">
            <div className="flex items-center rounded-xl bg-[#f6f5f1] ring-1 ring-black/[0.08] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#141409]">
              <span className="pl-3.5 font-mono text-sm text-gray-400">/</span>
              <input
                required
                className="min-h-[44px] w-full bg-transparent px-1 font-mono text-sm text-gray-900 outline-none"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", e.target.value);
                }}
                placeholder="egg-white-protein"
              />
            </div>
          </Field>
          <Field label="Belongs to" hint="Leave as “Main category” for a top-level category.">
            <select value={form.parentId} onChange={(e) => setField("parentId", e.target.value)} className={selectClass}>
              <option value="">Main category (top level)</option>
              {mainCategories
                .filter((c) => c.category_Id !== editingId)
                .map((c) => (
                  <option key={c.category_Id} value={c.category_Id}>
                    Under: {c.category_Name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Position" hint="Lower numbers are shown first.">
            <input type="number" min="0" value={form.displayOrder} onChange={(e) => setField("displayOrder", e.target.value)} className={`${inputClass} max-w-[140px]`} />
          </Field>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
