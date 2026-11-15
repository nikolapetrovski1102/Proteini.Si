import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiAward, FiEdit2, FiExternalLink, FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
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
  Segmented,
  VisibilityBadge,
  inputClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const TABS = {
  partner: { label: "Partners", singular: "partner", icon: FiUsers, placeholder: "e.g. Mol, OMV, DM" },
  award: { label: "Awards & certificates", singular: "award", icon: FiAward, placeholder: "e.g. ISO 22000" },
};
const emptyForm = { type: "partner", name: "", url: "", displayOrder: 0 };

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
  if (imagePath.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${imagePath}`;
  return imagePath;
};

const adminName = () => {
  const user = api.getUser();
  return user?.fullName || user?.email || "Admin";
};

export default function AdminPartners() {
  const confirm = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [activeTab, setActiveTab] = useState("partner");
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchAllItems = async () => {
    try {
      const data = await api.getAllPartners();
      setItems([...data].sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load partners and awards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items.filter((item) => item.type === activeTab);
  const tab = TABS[activeTab];
  const formTab = TABS[formData.type] || tab;

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleImageSelect = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, WebP and SVG images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setSelectedImageFile(null);
    setImagePreview("");
  };

  const startNew = () => {
    setEditingItem(null);
    setFormData({ ...emptyForm, type: activeTab, displayOrder: current.length });
    setSelectedImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ type: item.type, name: item.name, url: item.url || "", displayOrder: item.displayOrder });
    setImagePreview(getImageUrl(item.imagePath));
    setSelectedImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a name.");
      return;
    }
    if (!editingItem && !selectedImageFile) {
      toast.error("Please choose a logo or image.");
      return;
    }
    setSaving(true);
    try {
      const base = {
        type: formData.type,
        name: formData.name.trim(),
        url: formData.url.trim() || null,
        displayOrder: formData.displayOrder,
      };
      if (editingItem) {
        const payload = { ...base, id: editingItem.id, isActive: editingItem.isActive, updatedBy: adminName() };
        if (selectedImageFile) payload.image = selectedImageFile;
        await api.updatePartner(payload);
        toast.success("Saved.");
      } else {
        await api.createPartner({ ...base, image: selectedImageFile, createdBy: adminName() });
        toast.success(`${formTab.singular === "award" ? "Award" : "Partner"} added.`);
      }
      closeForm();
      await fetchAllItems();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: `Remove “${item.name}”?`,
      message: "It will no longer show on the site. This can't be undone.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deletePartner(item.id);
      toast.success("Removed.");
      await fetchAllItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to remove.");
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    setReordering(true);
    setItems((prev) => [...prev.filter((i) => i.type !== activeTab), ...next]);
    try {
      await api.reorderPartners(next.map((item, idx) => ({ id: item.id, displayOrder: idx })));
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Couldn't save the new order.");
    } finally {
      await fetchAllItems();
      setReordering(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Content"
      title="Partners & awards"
      description="Logos shown on the About pages. Partners and awards are kept in separate lists; arrows change the order they appear in."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Add {tab.singular}
        </Button>
      }
    >
      <Segmented
        value={activeTab}
        onChange={setActiveTab}
        options={Object.entries(TABS).map(([value, t]) => ({
          value,
          label: t.label,
          count: loading ? undefined : items.filter((i) => i.type === value).length,
        }))}
      />

      {loading ? (
        <Card>
          <Loading label="Loading…" />
        </Card>
      ) : current.length === 0 ? (
        <Card>
          <EmptyState
            icon={tab.icon}
            title={`No ${tab.label.toLowerCase()} yet`}
            text="Upload a logo to add the first one."
            action={<Button icon={FiPlus} onClick={startNew}>Add {tab.singular}</Button>}
          />
        </Card>
      ) : (
        <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${reordering ? "pointer-events-none opacity-70" : ""}`}>
          {current.map((item, index) => (
            <article key={item.id} className={`overflow-hidden rounded-2xl ring-1 ring-black/[0.06] ${item.isActive === false ? "bg-[#faf9f6]" : "bg-white"}`}>
              <button
                type="button"
                onClick={() => handleEdit(item)}
                aria-label={`Edit ${item.name}`}
                className="flex h-32 w-full items-center justify-center bg-[#f6f5f1] p-5 transition hover:bg-[#efede6]"
              >
                <img src={getImageUrl(item.imagePath)} alt="" className={`max-h-full max-w-full object-contain ${item.isActive === false ? "opacity-50 grayscale" : ""}`} />
              </button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold tabular-nums text-gray-400">{index + 1}</span>
                  <h3 className="truncate text-sm font-semibold text-gray-900">{item.name}</h3>
                </div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500 hover:text-gray-900">
                    <FiExternalLink size={11} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </a>
                ) : (
                  <p className="mt-0.5 text-xs italic text-gray-400">No link</p>
                )}
                {item.isActive === false && <div className="mt-1.5"><VisibilityBadge active={false} /></div>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex">
                    <IconButton icon={FiArrowLeft} label="Move earlier" disabled={index === 0 || reordering} onClick={() => move(index, -1)} />
                    <IconButton icon={FiArrowRight} label="Move later" disabled={index === current.length - 1 || reordering} onClick={() => move(index, 1)} />
                  </div>
                  <div className="flex">
                    <IconButton icon={FiEdit2} label={`Edit ${item.name}`} onClick={() => handleEdit(item)} />
                    <IconButton icon={FiTrash2} tone="danger" label={`Remove ${item.name}`} onClick={() => handleDelete(item)} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        size="md"
        title={editingItem ? `Edit ${formTab.singular}` : `Add ${formTab.singular}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingItem ? "Save changes" : `Add ${formTab.singular}`}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingItem && (
            <Segmented
              value={formData.type}
              onChange={(v) => setField("type", v)}
              options={Object.entries(TABS).map(([value, t]) => ({ value, label: t.label }))}
            />
          )}
          <Field label="Logo or image" required={!editingItem}>
            <ImagePicker promptKey="partnerLogo"
              preview={imagePreview}
              aspect="aspect-[2/1]"
              fit="object-contain"
              accept={ALLOWED.join(",")}
              hint={editingItem ? "Leave as is to keep the current image." : "PNG or SVG with a transparent background works best. Max 5 MB."}
              onFile={handleImageSelect}
            />
          </Field>
          <Field label="Name" required>
            <input data-autofocus className={inputClass} value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder={formTab.placeholder} />
          </Field>
          <Field label="Website" hint="Optional. Visitors who click the logo go here.">
            <input type="url" className={inputClass} value={formData.url} onChange={(e) => setField("url", e.target.value)} placeholder="https://example.com" />
          </Field>
          <Field label="Position" hint="1 = first. You can also use the arrows on the list.">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={formData.displayOrder + 1}
              onChange={(e) => setField("displayOrder", Math.max(0, (parseInt(e.target.value) || 1) - 1))}
            />
          </Field>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
