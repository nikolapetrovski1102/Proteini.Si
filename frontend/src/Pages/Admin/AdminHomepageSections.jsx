import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import { getHomepageCardImageUrl } from "../../utils/homepageCardImage";
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
  Segmented,
  Toggle,
  VisibilityBadge,
  inputClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const emptyForm = {
  section: "goal",
  titleMk: "",
  titleAl: "",
  slug: "",
  filterValue: "",
  destinationUrl: "",
  displayOrder: 0,
  isActive: true,
  image: null,
};

const SECTIONS = [
  { key: "goal", title: "Choose your goal", text: "The first row on the homepage, e.g. “Weight loss” or “Muscle gain”." },
  { key: "sport", title: "Sports", text: "The second row, e.g. “Running” or “Fitness”." },
];

export default function AdminHomepageSections() {
  const confirm = useConfirm();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const grouped = useMemo(
    () => ({
      goal: cards.filter((item) => item.section === "goal"),
      sport: cards.filter((item) => item.section === "sport"),
    }),
    [cards],
  );

  const load = async () => {
    try {
      setCards(await api.getAdminHomepageCards());
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

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const startNew = (section = "goal") => {
    setForm({ ...emptyForm, section, displayOrder: grouped[section]?.length || 0 });
    setEditingId(null);
    setPreview("");
    setOpen(true);
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      section: item.section,
      titleMk: item.titleMk || "",
      titleAl: item.titleAl || "",
      slug: item.slug || "",
      filterValue: item.filterValue || "",
      destinationUrl: item.destinationUrl || "",
      displayOrder: item.displayOrder || 0,
      isActive: item.isActive !== false,
      image: null,
    });
    setPreview(getHomepageCardImageUrl(item.imagePath));
    setOpen(true);
  };

  const submit = async (event) => {
    event?.preventDefault();
    if (!form.titleMk.trim() || !form.slug.trim() || !form.filterValue.trim()) {
      toast.error("Macedonian title, URL and product filter are required.");
      return;
    }
    if (!editingId && !form.image) {
      toast.error("Please choose an image for the new card.");
      return;
    }
    setSaving(true);
    try {
      await api.saveAdminHomepageCard(form, editingId);
      toast.success(editingId ? "Card updated." : "Card added to the homepage.");
      setOpen(false);
      await load();
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: `Remove “${item.titleMk}”?`,
      message: "The card disappears from the homepage. To hide it temporarily, edit it and turn off “Show on homepage” instead.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAdminHomepageCard(item.id);
      toast.success("Card deleted.");
      await load();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  return (
    <AdminPage
      eyebrow="Homepage"
      title="Goals & sports"
      description="The picture cards at the top of the homepage. Each card opens the shop filtered to matching products."
      actions={
        <Button icon={FiPlus} onClick={() => startNew()}>
          New card
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}

      {loading ? (
        <Card>
          <Loading label="Loading cards…" />
        </Card>
      ) : (
        SECTIONS.map((section) => (
          <Card
            key={section.key}
            title={section.title}
            description={section.text}
            actions={
              <Button size="sm" variant="secondary" icon={FiPlus} onClick={() => startNew(section.key)}>
                Add
              </Button>
            }
          >
            {grouped[section.key].length === 0 ? (
              <EmptyState icon={FiTarget} title="No cards yet" text="Add the first card for this row." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped[section.key].map((item) => (
                  <article key={item.id} className={`overflow-hidden rounded-xl ring-1 ring-black/[0.06] ${item.isActive ? "" : "opacity-60"}`}>
                    <button type="button" onClick={() => edit(item)} className="block w-full" aria-label={`Edit ${item.titleMk}`}>
                      <img src={getHomepageCardImageUrl(item.imagePath)} alt="" className="aspect-[4/3] w-full bg-[#f6f5f1] object-cover" />
                    </button>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-gray-900">{item.titleMk}</h3>
                          <p className="truncate text-xs text-gray-500">{item.titleAl || "No Albanian title"}</p>
                        </div>
                        <VisibilityBadge active={item.isActive} />
                      </div>
                      <p className="mt-2 truncate text-xs text-gray-500">
                        Shows: <span className="font-semibold text-gray-700">{item.filterValue}</span> · Position {item.displayOrder}
                      </p>
                      <div className="mt-2 flex justify-end gap-1">
                        <IconButton icon={FiEdit2} label={`Edit ${item.titleMk}`} onClick={() => edit(item)} />
                        <IconButton icon={FiTrash2} tone="danger" label={`Delete ${item.titleMk}`} onClick={() => remove(item)} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        ))
      )}

      <Notice tone="info">The third homepage row, Tips & news, is managed on its own page.</Notice>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={editingId ? "Edit card" : "New homepage card"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={saving}>
              {editingId ? "Save changes" : "Add card"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <Field label="Row">
              <Segmented
                value={form.section}
                onChange={(v) => setField("section", v)}
                options={SECTIONS.map((s) => ({ value: s.key, label: s.title }))}
              />
            </Field>
            <ImagePicker promptKey="homeCard"
              preview={preview}
              aspect="aspect-[4/3]"
              accept="image/jpeg,image/png,image/gif,image/webp"
              label={editingId ? "Replace image" : "Choose image"}
              hint={editingId ? "Leave as is to keep the current image." : "Required. JPG, PNG, GIF or WebP."}
              onFile={(file) => {
                setField("image", file);
                setPreview(URL.createObjectURL(file));
              }}
            />
            <Toggle checked={form.isActive} onChange={(v) => setField("isActive", v)} label="Show on homepage" description="Turn off to hide the card without deleting it." />
          </div>
          <div className="space-y-4">
            <Field label="Title (Macedonian)" required>
              <input data-autofocus className={inputClass} value={form.titleMk} onChange={(e) => setField("titleMk", e.target.value)} placeholder="Слабеење" />
            </Field>
            <Field label="Title (Albanian)">
              <input className={inputClass} value={form.titleAl} onChange={(e) => setField("titleAl", e.target.value)} />
            </Field>
            <Field label="URL" required hint="Short name used in the address, e.g. weight-loss.">
              <input className={`${inputClass} font-mono`} placeholder="weight-loss" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
            </Field>
            <Field label="Product filter" required hint="Products tagged with this goal or sport are shown when the card is clicked.">
              <input className={inputClass} placeholder="Weight Loss" value={form.filterValue} onChange={(e) => setField("filterValue", e.target.value)} />
            </Field>
            <Field label="Custom link" hint="Optional. Overrides the filter, e.g. /products?search=whey.">
              <input className={inputClass} placeholder="/products?search=whey" value={form.destinationUrl} onChange={(e) => setField("destinationUrl", e.target.value)} />
            </Field>
            <Field label="Position" hint="Lower numbers are shown first.">
              <input type="number" min="0" className={`${inputClass} max-w-[140px]`} value={form.displayOrder} onChange={(e) => setField("displayOrder", Number(e.target.value))} />
            </Field>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
