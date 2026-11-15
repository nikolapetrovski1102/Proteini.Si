import { createElement, useEffect, useState } from "react";
import { FiAlignLeft, FiArrowDown, FiArrowUp, FiAward, FiBriefcase, FiEdit2, FiFileText, FiPlus, FiTrash2, FiType, FiVideo } from "react-icons/fi";
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

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

/** What each block type looks like and which fields it uses. */
const TYPES = {
  title: { label: "Title", icon: FiType, tone: "ink", hint: "A large heading that starts a new part of the page.", title: "required" },
  subtitle: { label: "Subtitle", icon: FiAlignLeft, tone: "blue", hint: "A smaller heading under a title.", title: "required" },
  paragraph: { label: "Paragraph", icon: FiFileText, tone: "neutral", hint: "A block of regular text.", content: true },
  video: { label: "Video", icon: FiVideo, tone: "pink", hint: "An embedded YouTube video with an optional thumbnail.", title: "optional", video: true, image: "Video thumbnail" },
  award: { label: "Award", icon: FiAward, tone: "yellow", hint: "An award or certificate with a short description.", title: "required", content: true },
  "business-cooperation": { label: "Business cooperation", icon: FiBriefcase, tone: "green", hint: "Image, heading and text shown on the Business cooperation page.", title: "required", content: true, image: "Image" },
};

const emptyForm = { sectionType: "paragraph", title: "", videoUrl: "", content: "", displayOrder: 0 };

const toEmbedUrl = (url) => {
  const value = (url || "").trim();
  const match = value.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : value;
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  if (path.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
  return path;
};

const adminName = () => {
  const user = api.getUser();
  return user?.fullName || user?.email || "Admin";
};

export default function AdminAboutCompany() {
  const confirm = useConfirm();
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const fetchSections = async () => {
    try {
      const data = await api.getAllAboutCompanySections();
      setSections([...data].sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load the About page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const type = TYPES[formData.sectionType] || TYPES.paragraph;
  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleThumbnailSelect = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }
    setSelectedThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSection(null);
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
  };

  const startNew = () => {
    setEditingSection(null);
    setFormData({ ...emptyForm, displayOrder: sections.length });
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
    setShowForm(true);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      title: section.title || "",
      videoUrl: section.videoUrl || "",
      content: section.content || "",
      displayOrder: section.displayOrder,
    });
    setThumbnailPreview(getImageUrl(section.videoThumbnailPath) || "");
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (type.title === "required" && !formData.title.trim()) {
      toast.error("Please enter a heading.");
      return;
    }
    if (type.content && !formData.content.trim()) {
      toast.error("Please enter the text.");
      return;
    }
    setSaving(true);
    try {
      const sectionData = {
        sectionType: formData.sectionType,
        title: type.title ? formData.title || null : null,
        videoUrl: type.video ? toEmbedUrl(formData.videoUrl) || null : null,
        content: type.content ? formData.content || null : null,
        displayOrder: formData.displayOrder,
      };
      if (type.image && selectedThumbnailFile) sectionData.videoThumbnail = selectedThumbnailFile;

      if (editingSection) {
        await api.updateAboutCompanySection({ ...sectionData, id: editingSection.id, isActive: editingSection.isActive, updatedBy: adminName() });
        toast.success("Block updated.");
      } else {
        await api.createAboutCompanySection({ ...sectionData, createdBy: adminName() });
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
      message: "It will be removed from the page. To hide it for now, turn off its switch instead.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteAboutCompanySection(section.id);
      toast.success("Block deleted.");
      await fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete the block.");
    }
  };

  const toggleActive = async (section) => {
    const isActive = !section.isActive;
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, isActive } : s)));
    try {
      await api.updateAboutCompanySection({
        id: section.id,
        sectionType: section.sectionType,
        title: section.title,
        videoUrl: section.videoUrl,
        content: section.content,
        displayOrder: section.displayOrder,
        isActive,
        updatedBy: adminName(),
      });
      toast.success(isActive ? "Block is now visible." : "Block hidden.");
    } catch (error) {
      console.error("Error toggling section:", error);
      toast.error("Couldn't change visibility.");
      await fetchSections();
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
      await api.reorderAboutCompanySections(next.map((item, idx) => ({ id: item.id, displayOrder: idx })));
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Couldn't save the new order.");
    } finally {
      await fetchSections();
      setReordering(false);
    }
  };

  const embed = toEmbedUrl(formData.videoUrl);
  const recognised = /youtube\.com\/embed\/[A-Za-z0-9_-]{11}/.test(embed);

  return (
    <AdminPage
      eyebrow="Content"
      title="About us"
      count={loading ? undefined : sections.length}
      description="The About us page is built from these blocks, top to bottom. Use the arrows to reorder and the switch to hide a block without deleting it."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Add block
        </Button>
      }
    >
      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading page blocks…" />
        ) : sections.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title="The page is empty"
            text="Start with a title, then add paragraphs, videos or awards below it."
            action={<Button icon={FiPlus} onClick={startNew}>Add block</Button>}
          />
        ) : (
          <ol className={`divide-y divide-black/[0.06] ${reordering ? "pointer-events-none opacity-70" : ""}`}>
            {sections.map((section, index) => {
              const t = TYPES[section.sectionType] || { label: section.sectionType, icon: FiFileText, tone: "neutral" };
              const thumb = getImageUrl(section.videoThumbnailPath);
              return (
                <li key={section.id} className={`flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 ${section.isActive ? "" : "bg-[#faf9f6]"}`}>
                  <div className="flex flex-col items-center">
                    <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0 || reordering} onClick={() => move(index, -1)} className="h-8 w-8" />
                    <span className="font-display text-sm font-bold tabular-nums text-gray-400">{index + 1}</span>
                    <IconButton icon={FiArrowDown} label="Move down" disabled={index === sections.length - 1 || reordering} onClick={() => move(index, 1)} className="h-8 w-8" />
                  </div>
                  {thumb && (
                    <img src={thumb} alt="" className={`hidden aspect-video w-24 shrink-0 rounded-lg bg-[#f6f5f1] object-cover sm:block ${section.isActive ? "" : "opacity-50 grayscale"}`} />
                  )}
                  <button type="button" onClick={() => handleEdit(section)} className={`min-w-0 flex-1 text-left ${section.isActive ? "" : "opacity-60"}`}>
                    <Badge tone={t.tone}>
                      {createElement(t.icon, { size: 11, "aria-hidden": true })}
                      {t.label}
                    </Badge>
                    {section.title && <p className="mt-1 truncate font-bold text-gray-900">{section.title}</p>}
                    {section.content && <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{section.content}</p>}
                    {section.videoUrl && <p className="mt-0.5 truncate text-xs text-gray-500">{section.videoUrl}</p>}
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={section.isActive}
                    aria-label={section.isActive ? "Visible — click to hide" : "Hidden — click to show"}
                    title={section.isActive ? "Visible" : "Hidden"}
                    onClick={() => toggleActive(section)}
                    className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] focus-visible:ring-offset-2 ${section.isActive ? "bg-[#141409]" : "bg-black/[0.15]"}`}
                  >
                    <span className={`absolute h-5 w-5 rounded-full shadow transition-all ${section.isActive ? "left-[18px] bg-[#FDC700]" : "left-0.5 bg-white"}`} />
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
          <div>
            <p className="mb-2 text-[13px] font-semibold text-gray-800">What kind of block?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(TYPES).map(([value, t]) => {
                const selected = formData.sectionType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField("sectionType", value)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      selected ? "bg-[#141409] text-white" : "bg-[#f6f5f1] text-gray-800 hover:bg-[#efede6]"
                    }`}
                  >
                    {createElement(t.icon, { size: 15, className: selected ? "text-[#FDC700]" : "text-gray-500", "aria-hidden": true })}
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500">{type.hint}</p>
          </div>

          {type.title && (
            <Field label="Heading" required={type.title === "required"} hint={type.title === "optional" ? "Optional." : undefined}>
              <input className={inputClass} value={formData.title} onChange={(e) => setField("title", e.target.value)} />
            </Field>
          )}

          {type.video && (
            <Field
              label="YouTube link"
              hint="Paste any YouTube link — it's converted automatically."
              error={formData.videoUrl && !recognised ? "This doesn't look like a YouTube link." : undefined}
            >
              <input className={inputClass} value={formData.videoUrl} onChange={(e) => setField("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
          )}

          {type.image && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={type.image} hint={type.video ? "Optional. Shown before the video plays." : undefined}>
                <ImagePicker promptKey="about"
                  preview={thumbnailPreview}
                  aspect="aspect-video"
                  accept={ALLOWED.join(",")}
                  hint="JPG, PNG or WebP. Max 5 MB."
                  onFile={handleThumbnailSelect}
                  onClear={() => {
                    setSelectedThumbnailFile(null);
                    setThumbnailPreview("");
                  }}
                />
              </Field>
              {type.video && recognised && (
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Preview</p>
                  <iframe title="Video preview" src={embed} className="aspect-video w-full rounded-xl bg-black" allow="encrypted-media; picture-in-picture" allowFullScreen />
                </div>
              )}
            </div>
          )}

          {type.content && (
            <Field label="Text" required>
              <textarea rows={6} className={textareaClass} value={formData.content} onChange={(e) => setField("content", e.target.value)} />
            </Field>
          )}

          <Field label="Position" hint="1 = top of the page. You can also use the arrows on the list." className="max-w-[12rem]">
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
