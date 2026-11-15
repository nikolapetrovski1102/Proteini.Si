import { useEffect, useState } from "react";
import { FiBookOpen, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  ImagePicker,
  Loading,
  Modal,
  Segmented,
  Toggle,
  VisibilityBadge,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const emptyForm = {
  id: 0,
  category: "news",
  title: "",
  titleAl: "",
  subtitle: "",
  subtitleAl: "",
  content: "",
  contentAl: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  displayOrder: 0,
  isActive: true,
  image: null,
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
  return path;
};

export default function AdminTips() {
  const confirm = useConfirm();
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("mk");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  const fetchArticles = async () => {
    try {
      const response = await api.getAllTipArticles();
      setArticles(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  const startNew = () => {
    setEditing(null);
    setPreview("");
    setFormData({ ...emptyForm, displayOrder: articles.length });
    setLang("mk");
    setOpen(true);
  };

  const handleEdit = (article) => {
    setEditing(article);
    setPreview(getImageUrl(article.imagePath));
    setFormData({
      id: article.id,
      category: article.category || "news",
      title: article.title || "",
      titleAl: article.titleAl || "",
      subtitle: article.subtitle || "",
      subtitleAl: article.subtitleAl || "",
      content: article.content || "",
      contentAl: article.contentAl || "",
      slug: article.slug || "",
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
      displayOrder: article.displayOrder || 0,
      isActive: article.isActive !== false,
      image: null,
    });
    setLang("mk");
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!formData.title.trim()) {
      setLang("mk");
      toast.error("The Macedonian title is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateTipArticle(formData);
      else await api.createTipArticle(formData);
      toast.success(editing ? "Article updated." : "Article published.");
      setOpen(false);
      await fetchArticles();
    } catch (error) {
      toast.error(error.message || "Failed to save tip");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    const ok = await confirm({
      title: `Delete “${article.title}”?`,
      message: "The article and its page will be removed from the website. This can't be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteTipArticle(article.id);
      toast.success("Article deleted.");
      await fetchArticles();
    } catch (error) {
      toast.error(error.message || "Failed to delete tip");
    }
  };

  const al = lang === "al";

  return (
    <AdminPage
      eyebrow="Content"
      title="Tips & news"
      count={loading ? undefined : articles.length}
      description="Articles shown in the Tips row on the homepage, each with its own page."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          New article
        </Button>
      }
    >
      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading articles…" />
        ) : articles.length === 0 ? (
          <EmptyState
            icon={FiBookOpen}
            title="No articles yet"
            text="Write your first tip — e.g. how to choose a protein."
            action={<Button icon={FiPlus} onClick={startNew}>New article</Button>}
          />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {articles.map((article) => (
              <li key={article.id} className={`flex items-center gap-4 px-4 py-3 sm:px-5 ${article.isActive ? "" : "opacity-60"}`}>
                <button type="button" onClick={() => handleEdit(article)} className="shrink-0" aria-label={`Edit ${article.title}`}>
                  {article.imagePath ? (
                    <img src={getImageUrl(article.imagePath)} alt="" className="h-16 w-24 rounded-lg bg-[#f6f5f1] object-cover" />
                  ) : (
                    <span className="flex h-16 w-24 items-center justify-center rounded-lg bg-[#f6f5f1] text-gray-400">
                      <FiBookOpen aria-hidden="true" />
                    </span>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-gray-900">{article.title}</h3>
                    <VisibilityBadge active={article.isActive} />
                    {article.category && <Badge className="capitalize">{article.category}</Badge>}
                  </div>
                  {article.subtitle && <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">{article.subtitle}</p>}
                  {!article.titleAl && <p className="mt-0.5 text-xs text-[#a86a00]">Albanian translation missing</p>}
                </div>
                <div className="flex gap-1">
                  <IconButton icon={FiEdit2} label={`Edit ${article.title}`} onClick={() => handleEdit(article)} />
                  <IconButton icon={FiTrash2} tone="danger" label={`Delete ${article.title}`} onClick={() => handleDelete(article)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="xl"
        title={editing ? "Edit article" : "New article"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save changes" : "Publish article"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-gray-900">Article text</p>
              <Segmented
                value={lang}
                onChange={setLang}
                options={[
                  { value: "mk", label: "Macedonian" },
                  { value: "al", label: "Albanian" },
                ]}
              />
            </div>
            <Field label="Title" required={!al}>
              <input
                data-autofocus
                className={inputClass}
                value={al ? formData.titleAl : formData.title}
                onChange={(e) => setField(al ? "titleAl" : "title", e.target.value)}
              />
            </Field>
            <Field label="Subtitle" hint="One short sentence shown under the title on the card.">
              <input className={inputClass} value={al ? formData.subtitleAl : formData.subtitle} onChange={(e) => setField(al ? "subtitleAl" : "subtitle", e.target.value)} />
            </Field>
            <Field label="Text" hint="Paragraphs, headings, bold/italic and lists are supported.">
              <textarea
                rows={14}
                className={textareaClass}
                value={al ? formData.contentAl : formData.content}
                onChange={(e) => setField(al ? "contentAl" : "content", e.target.value)}
              />
            </Field>
            {al && <p className="text-xs text-gray-500">Empty Albanian fields fall back to the Macedonian text.</p>}
          </div>

          <div className="space-y-6">
            <FormSection title="Cover image">
              <ImagePicker promptKey="tipCover"
                preview={preview}
                aspect="aspect-[16/10]"
                accept="image/jpeg,image/png,image/gif,image/webp"
                hint={editing ? "Leave as is to keep the current image." : "JPG, PNG, GIF or WebP."}
                onFile={(file) => {
                  setField("image", file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </FormSection>
            <FormSection title="Settings">
              <div className="space-y-4">
                <Field label="Category">
                  <input className={inputClass} value={formData.category} onChange={(e) => setField("category", e.target.value)} placeholder="news" />
                </Field>
                <Field label="Position" hint="Lower numbers are shown first.">
                  <input type="number" min="0" className={`${inputClass} max-w-[140px]`} value={formData.displayOrder} onChange={(e) => setField("displayOrder", Number(e.target.value))} />
                </Field>
                <Toggle checked={formData.isActive} onChange={(v) => setField("isActive", v)} label="Published" description="Turn off to keep it as a hidden draft." />
              </div>
            </FormSection>
            <FormSection title="Search engines" description="Optional. How the article appears on Google.">
              <div className="space-y-4">
                <Field label="URL" hint="Filled in from the title when empty.">
                  <input className={`${inputClass} font-mono`} value={formData.slug} onChange={(e) => setField("slug", e.target.value)} />
                </Field>
                <Field label="SEO title">
                  <input className={inputClass} value={formData.seoTitle} onChange={(e) => setField("seoTitle", e.target.value)} />
                </Field>
                <Field label="SEO description" hint={`${formData.seoDescription.length}/500`}>
                  <textarea rows={3} maxLength={500} className={textareaClass} value={formData.seoDescription} onChange={(e) => setField("seoDescription", e.target.value)} />
                </Field>
              </div>
            </FormSection>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
