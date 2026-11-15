import { createElement, useEffect, useState } from "react";
import { FiAlignLeft, FiArrowDown, FiArrowUp, FiEdit2, FiFeather, FiImage, FiLayout, FiPlus, FiStar, FiTrash2, FiType } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  ImagePicker,
  Loading,
  Modal,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

/** Block types, what fields each one uses, and how they look in the list. */
const TYPES = {
  title: { label: "Title", icon: FiType, tone: "ink", hint: "Large heading", fields: ["title"] },
  subtitle: { label: "Subtitle", icon: FiType, tone: "blue", hint: "Smaller heading", fields: ["title"] },
  paragraph: { label: "Paragraph", icon: FiAlignLeft, tone: "neutral", hint: "Normal text", fields: ["content"] },
  highlight: { label: "Highlight", icon: FiStar, tone: "yellow", hint: "Boxed heading + text", fields: ["title", "content"] },
  italic: { label: "Quote", icon: FiFeather, tone: "pink", hint: "Italic text", fields: ["content"] },
  image: { label: "Image", icon: FiImage, tone: "green", hint: "Full-width picture", fields: ["image"] },
};

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const emptyForm = { sectionType: "paragraph", title: "", content: "", displayOrder: 0 };

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${imagePath}`;
  return imagePath;
};

const adminName = () => {
  const user = api.getUser();
  return user?.fullName || user?.email || "Admin";
};

export default function AdminLandingPage() {
  const confirm = useConfirm();
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchSections = async () => {
    try {
      setSections(await api.getAllLandingPageSections());
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load landing page blocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const fields = TYPES[formData.sectionType]?.fields || [];

  const handleImageSelect = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF and WebP images are allowed.");
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
    setEditingSection(null);
    setSelectedImageFile(null);
    setImagePreview("");
  };

  const startNew = () => {
    setEditingSection(null);
    setFormData({ ...emptyForm, displayOrder: sections.length });
    setSelectedImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      title: section.title || "",
      content: section.content || "",
      displayOrder: section.displayOrder,
    });
    setImagePreview(section.imagePath ? getImageUrl(section.imagePath) : "");
    setSelectedImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (fields.includes("title") && !formData.title.trim()) return toast.error("Please enter a heading.");
    if (fields.includes("content") && !formData.content.trim()) return toast.error("Please enter some text.");
    if (fields.includes("image") && !selectedImageFile && !editingSection?.imagePath) return toast.error("Please choose an image.");

    setSaving(true);
    try {
      const base = {
        sectionType: formData.sectionType,
        title: formData.title || null,
        content: formData.content || null,
        displayOrder: formData.displayOrder,
      };
      if (selectedImageFile) base.image = selectedImageFile;

      if (editingSection) {
        await api.updateLandingPageSection({ ...base, id: editingSection.id, isActive: editingSection.isActive, updatedBy: adminName() });
        toast.success("Block updated.");
      } else {
        await api.createLandingPageSection({ ...base, createdBy: adminName() });
        toast.success("Block added.");
      }
      closeForm();
      await fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Failed to save the block.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section) => {
    const ok = await confirm({
      title: "Delete this block?",
      message: "It will be removed from the landing page. To hide it temporarily, use the visibility switch instead.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteLandingPageSection(section.id);
      toast.success("Block deleted.");
      await fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete the block.");
    }
  };

  const toggleActive = async (section) => {
    try {
      await api.updateLandingPageSection({
        id: section.id,
        sectionType: section.sectionType,
        title: section.title,
        content: section.content,
        displayOrder: section.displayOrder,
        isActive: !section.isActive,
        updatedBy: adminName(),
      });
      setSections((list) => list.map((s) => (s.id === section.id ? { ...s, isActive: !s.isActive } : s)));
    } catch (error) {
      console.error("Error toggling section:", error);
      toast.error("Failed to change visibility.");
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setReordering(true);
    try {
      await api.reorderLandingPageSections(next.map((item, idx) => ({ id: item.id, displayOrder: idx })));
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Couldn't save the new order.");
    } finally {
      await fetchSections();
      setReordering(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Homepage"
      title="Landing page"
      count={loading ? undefined : sections.length}
      description="The Battery Nutrition brand page, built from blocks of text and images. Blocks appear on the page top to bottom in this order."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Add block
        </Button>
      }
    >
      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading blocks…" />
        ) : sections.length === 0 ? (
          <EmptyState
            icon={FiLayout}
            title="The page is empty"
            text="Start with a Title block, then add paragraphs and images."
            action={<Button icon={FiPlus} onClick={startNew}>Add block</Button>}
          />
        ) : (
          <ol className={`divide-y divide-black/[0.06] ${reordering ? "pointer-events-none opacity-70" : ""}`}>
            {sections.map((section, index) => {
              const type = TYPES[section.sectionType] || { label: section.sectionType, icon: FiAlignLeft, tone: "neutral" };
              return (
                <li key={section.id} className={`flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 ${section.isActive ? "" : "bg-[#faf9f6]"}`}>
                  <div className="flex flex-col items-center">
                    <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0 || reordering} onClick={() => move(index, -1)} />
                    <IconButton icon={FiArrowDown} label="Move down" disabled={index === sections.length - 1 || reordering} onClick={() => move(index, 1)} />
                  </div>
                  <button type="button" onClick={() => handleEdit(section)} className={`flex min-w-0 flex-1 items-center gap-3 text-left ${section.isActive ? "" : "opacity-50"}`}>
                    {section.sectionType === "image" && section.imagePath ? (
                      <img src={getImageUrl(section.imagePath)} alt="" className="h-14 w-20 shrink-0 rounded-lg bg-[#f6f5f1] object-cover" />
                    ) : (
                      <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-[#f6f5f1] text-gray-500">
                        {createElement(type.icon, { size: 18, "aria-hidden": true })}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <Badge tone={type.tone}>{type.label}</Badge>
                      {section.title && <span className="mt-1 block truncate font-semibold text-gray-900">{section.title}</span>}
                      {section.content && <span className="mt-0.5 line-clamp-1 block text-sm text-gray-600">{section.content}</span>}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={section.isActive}
                    aria-label={section.isActive ? "Visible — click to hide" : "Hidden — click to show"}
                    title={section.isActive ? "Visible — click to hide" : "Hidden — click to show"}
                    onClick={() => toggleActive(section)}
                    className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition ${section.isActive ? "bg-[#141409]" : "bg-black/[0.15]"}`}
                  >
                    <span className={`absolute h-5 w-5 rounded-full shadow transition ${section.isActive ? "left-[18px] bg-[#FDC700]" : "left-0.5 bg-white"}`} />
                  </button>
                  <div className="flex gap-1">
                    <IconButton icon={FiEdit2} label="Edit block" onClick={() => handleEdit(section)} />
                    <IconButton icon={FiTrash2} tone="danger" label="Delete block" onClick={() => handleDelete(section)} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Modal
        open={showForm}
        onClose={closeForm}
        size="lg"
        title={editingSection ? "Edit block" : "Add block"}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingSection ? "Save changes" : "Add block"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Block type">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(TYPES).map(([key, t]) => {
                const active = formData.sectionType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setField("sectionType", key)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left ring-1 transition ${
                      active ? "bg-[#141409] text-white ring-[#141409]" : "bg-white text-gray-800 ring-black/[0.08] hover:ring-black/25"
                    }`}
                  >
                    {createElement(t.icon, { size: 16, "aria-hidden": true, className: active ? "text-[#FDC700]" : "text-gray-500" })}
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span className={`block truncate text-xs ${active ? "text-white/60" : "text-gray-500"}`}>{t.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {fields.includes("title") && (
            <Field label="Heading" required>
              <input className={inputClass} value={formData.title} onChange={(e) => setField("title", e.target.value)} />
            </Field>
          )}
          {fields.includes("content") && (
            <Field label="Text" required>
              <textarea rows={6} className={textareaClass} value={formData.content} onChange={(e) => setField("content", e.target.value)} />
            </Field>
          )}
          {fields.includes("image") && (
            <Field label="Image" required>
              <ImagePicker promptKey="landing"
                preview={imagePreview}
                aspect="aspect-[16/9]"
                fit="object-contain"
                accept={ALLOWED.join(",")}
                hint="JPG, PNG, GIF or WebP. Max 5 MB."
                onFile={handleImageSelect}
                onClear={
                  selectedImageFile
                    ? () => {
                        setSelectedImageFile(null);
                        setImagePreview(editingSection?.imagePath ? getImageUrl(editingSection.imagePath) : "");
                      }
                    : undefined
                }
              />
            </Field>
          )}
          <Field label="Position" hint="Lower numbers appear first. You can also reorder with the arrows in the list.">
            <input type="number" min="0" className={`${inputClass} max-w-[140px]`} value={formData.displayOrder} onChange={(e) => setField("displayOrder", parseInt(e.target.value) || 0)} />
          </Field>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
