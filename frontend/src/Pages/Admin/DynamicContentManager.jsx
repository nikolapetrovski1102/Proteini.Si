import { createElement, useEffect, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiArrowDown,
  FiArrowUp,
  FiAward,
  FiBold,
  FiChevronDown,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiItalic,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiType,
  FiUnderline,
} from "react-icons/fi";
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
  Segmented,
  Toggle,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const PAGES = {
  "terms-of-service": { label: "Terms of service", path: "/terms-of-services" },
  "general-provisions": { label: "General provisions", path: "/general-provisions" },
};

const TYPES = {
  title: { label: "Title", icon: FiType, tone: "ink", hint: "A large heading.", title: true },
  subtitle: { label: "Subtitle", icon: FiAlignLeft, tone: "blue", hint: "A smaller heading.", title: true },
  paragraph: { label: "Paragraph", icon: FiFileText, tone: "neutral", hint: "A block of regular text.", content: true },
  award: { label: "Highlighted", icon: FiAward, tone: "yellow", hint: "A heading with text underneath, styled to stand out.", title: true, content: true },
  spacer: { label: "Empty space", icon: FiMinus, tone: "orange", hint: "Adds vertical space between blocks.", spacer: true },
};

const SIZES = [
  { value: "small", label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra large" },
];

const ALIGNS = [
  { value: "left", icon: FiAlignLeft, label: "Left" },
  { value: "center", icon: FiAlignCenter, label: "Center" },
  { value: "right", icon: FiAlignRight, label: "Right" },
];

const blankForm = (pageType, order = 0) => ({
  page_Type: pageType,
  section_Type: "paragraph",
  title_Text: "",
  content_Text: "",
  display_Order: order,
  isActive: true,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  text_Align: "left",
  font_Size: "normal",
  text_Color: "",
  margin_Top: 0,
  margin_Bottom: 15,
  padding_Top: 0,
  padding_Bottom: 0,
  custom_CSS_Class: "",
});

function FormatButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] ${
        active ? "bg-[#141409] text-[#FDC700]" : "bg-[#f6f5f1] text-gray-700 hover:bg-[#efede6]"
      }`}
    >
      {createElement(icon, { size: 15, "aria-hidden": true })}
    </button>
  );
}

export default function DynamicContentManager() {
  const confirm = useConfirm();
  const toast = useToast();
  const [activePage, setActivePage] = useState("terms-of-service");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState(blankForm("terms-of-service"));

  const fetchSections = async (pageType = activePage) => {
    try {
      const data = await api.getAllDynamicSectionsForAdmin(pageType);
      setSections([...data].sort((a, b) => a.display_Order - b.display_Order));
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load the page content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections(activePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  const switchPage = (page) => {
    if (page === activePage) return;
    setLoading(true);
    setSections([]);
    setActivePage(page);
  };

  const type = TYPES[formData.section_Type] || TYPES.paragraph;
  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const setNumber = (key) => (e) => setField(key, parseInt(e.target.value) || 0);

  const openNew = () => {
    setEditingSection(null);
    setFormData(blankForm(activePage, sections.length));
    setShowAdvanced(false);
    setIsModalOpen(true);
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setFormData({
      page_Type: section.page_Type,
      section_Type: section.section_Type,
      title_Text: section.title_Text || "",
      content_Text: section.content_Text || "",
      display_Order: section.display_Order,
      isActive: section.isActive,
      isBold: section.isBold,
      isItalic: section.isItalic,
      isUnderline: section.isUnderline,
      text_Align: section.text_Align || "left",
      font_Size: section.font_Size || "normal",
      text_Color: section.text_Color || "",
      margin_Top: section.margin_Top || 0,
      margin_Bottom: section.margin_Bottom ?? 15,
      padding_Top: section.padding_Top || 0,
      padding_Bottom: section.padding_Bottom || 0,
      custom_CSS_Class: section.custom_CSS_Class || "",
    });
    setShowAdvanced(Boolean(section.text_Color || section.custom_CSS_Class || section.margin_Top || (section.margin_Bottom ?? 15) !== 15));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (type.title && !type.content && !formData.title_Text.trim()) {
      toast.error("Please enter the heading text.");
      return;
    }
    if (type.content && !formData.content_Text.trim()) {
      toast.error("Please enter the text.");
      return;
    }
    setSaving(true);
    try {
      if (editingSection) {
        await api.updateDynamicSection({ section_Id: editingSection.section_Id, ...formData });
        toast.success("Block updated.");
      } else {
        await api.createDynamicSection(formData);
        toast.success("Block added.");
      }
      closeModal();
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
      message: "It will be removed from the page. To hide it for now, edit it and turn off “Show on website”.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteDynamicSection(section.section_Id);
      toast.success("Block deleted.");
      await fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete the block.");
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
      await api.reorderDynamicSections(next.map((s, idx) => ({ section_Id: s.section_Id, display_Order: idx })));
    } catch (error) {
      console.error("Error reordering sections:", error);
      toast.error("Couldn't save the new order.");
    } finally {
      await fetchSections();
      setReordering(false);
    }
  };

  const page = PAGES[activePage];

  return (
    <AdminPage
      eyebrow="Content"
      title="Legal pages"
      description="Each legal page is built from text blocks, top to bottom. Pick a page, then add, edit or reorder its blocks."
      actions={
        <>
          <Button variant="secondary" icon={FiExternalLink} onClick={() => window.open(page.path, "_blank", "noopener")}>
            View page
          </Button>
          <Button icon={FiPlus} onClick={openNew} disabled={reordering}>
            Add block
          </Button>
        </>
      }
    >
      <Segmented value={activePage} onChange={switchPage} options={Object.entries(PAGES).map(([value, p]) => ({ value, label: p.label }))} />

      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading page content…" />
        ) : sections.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title={`${page.label} is empty`}
            text="Add a title and a few paragraphs to fill this page."
            action={<Button icon={FiPlus} onClick={openNew}>Add block</Button>}
          />
        ) : (
          <ol className={`divide-y divide-black/[0.06] ${reordering ? "pointer-events-none opacity-70" : ""}`}>
            {sections.map((section, index) => {
              const t = TYPES[section.section_Type] || { label: section.section_Type, icon: FiFileText, tone: "neutral" };
              return (
                <li key={section.section_Id} className={`flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 ${section.isActive ? "" : "bg-[#faf9f6]"}`}>
                  <div className="flex flex-col items-center">
                    <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0 || reordering} onClick={() => move(index, -1)} className="h-8 w-8" />
                    <span className="font-display text-sm font-bold tabular-nums text-gray-400">{index + 1}</span>
                    <IconButton icon={FiArrowDown} label="Move down" disabled={index === sections.length - 1 || reordering} onClick={() => move(index, 1)} className="h-8 w-8" />
                  </div>
                  <button type="button" onClick={() => openEditModal(section)} className={`min-w-0 flex-1 text-left ${section.isActive ? "" : "opacity-60"}`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={t.tone}>
                        {createElement(t.icon, { size: 11, "aria-hidden": true })}
                        {t.label}
                      </Badge>
                      {!section.isActive && <Badge tone="neutral" dot>Hidden</Badge>}
                    </div>
                    {section.title_Text && (
                      <p
                        className={`mt-1 truncate text-gray-900 ${section.section_Type === "title" ? "font-display text-lg font-bold" : "font-semibold"}`}
                        style={{ fontStyle: section.isItalic ? "italic" : undefined, textDecoration: section.isUnderline ? "underline" : undefined }}
                      >
                        {section.title_Text}
                      </p>
                    )}
                    {section.content_Text && (
                      <p className={`mt-0.5 line-clamp-2 text-sm text-gray-600 ${section.isBold ? "font-semibold" : ""} ${section.isItalic ? "italic" : ""}`}>{section.content_Text}</p>
                    )}
                    {section.section_Type === "spacer" && <p className="mt-1 text-xs text-gray-500">{section.margin_Top || 20}px of space</p>}
                  </button>
                  <div className="flex gap-1">
                    <IconButton icon={FiEdit2} label="Edit block" onClick={() => openEditModal(section)} />
                    <IconButton icon={FiTrash2} tone="danger" label="Delete block" onClick={() => handleDelete(section)} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        size="lg"
        title={editingSection ? "Edit block" : `Add block to ${page.label}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingSection ? "Save changes" : "Add block"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-gray-800">What kind of block?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(TYPES).map(([value, t]) => {
                const selected = formData.section_Type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField("section_Type", value)}
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
            <Field label="Heading" required={!type.content}>
              <input className={inputClass} value={formData.title_Text} onChange={(e) => setField("title_Text", e.target.value)} />
            </Field>
          )}

          {type.content && (
            <Field label="Text" required>
              <textarea rows={7} className={textareaClass} value={formData.content_Text} onChange={(e) => setField("content_Text", e.target.value)} />
            </Field>
          )}

          {type.spacer ? (
            <Field label="Height" hint="In pixels. 20–40 is a typical gap." className="max-w-[12rem]">
              <input type="number" min="0" className={inputClass} value={formData.margin_Top} onChange={setNumber("margin_Top")} />
            </Field>
          ) : (
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <div>
                <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Style</p>
                <div className="flex gap-1">
                  <FormatButton icon={FiBold} label="Bold" active={formData.isBold} onClick={() => setField("isBold", !formData.isBold)} />
                  <FormatButton icon={FiItalic} label="Italic" active={formData.isItalic} onClick={() => setField("isItalic", !formData.isItalic)} />
                  <FormatButton icon={FiUnderline} label="Underline" active={formData.isUnderline} onClick={() => setField("isUnderline", !formData.isUnderline)} />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Alignment</p>
                <div className="flex gap-1">
                  {ALIGNS.map((a) => (
                    <FormatButton key={a.value} icon={a.icon} label={a.label} active={formData.text_Align === a.value} onClick={() => setField("text_Align", a.value)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[13px] font-semibold text-gray-800">Size</p>
                <Segmented value={formData.font_Size} onChange={(v) => setField("font_Size", v)} options={SIZES} />
              </div>
            </div>
          )}

          <Toggle checked={formData.isActive} onChange={(v) => setField("isActive", v)} label="Show on website" description="Turn off to hide the block without deleting it." />

          {!type.spacer && (
            <div className="rounded-xl bg-[#f6f5f1]">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800"
              >
                Spacing & advanced
                <FiChevronDown className={`transition ${showAdvanced ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {showAdvanced && (
                <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
                  <Field label="Space above" hint="Pixels.">
                    <input type="number" min="0" className={inputClass} value={formData.margin_Top} onChange={setNumber("margin_Top")} />
                  </Field>
                  <Field label="Space below" hint="Pixels. Default 15.">
                    <input type="number" min="0" className={inputClass} value={formData.margin_Bottom} onChange={setNumber("margin_Bottom")} />
                  </Field>
                  <Field label="Text colour" hint="Optional, e.g. #E3262F. Leave empty for default.">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        aria-label="Pick colour"
                        value={/^#[0-9a-f]{6}$/i.test(formData.text_Color) ? formData.text_Color : "#141409"}
                        onChange={(e) => setField("text_Color", e.target.value)}
                        className="h-[42px] w-12 shrink-0 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                      />
                      <input className={inputClass} value={formData.text_Color} onChange={(e) => setField("text_Color", e.target.value)} placeholder="Default" />
                    </div>
                  </Field>
                  <Field label="CSS class" hint="For developers only.">
                    <input className={inputClass} value={formData.custom_CSS_Class} onChange={(e) => setField("custom_CSS_Class", e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
