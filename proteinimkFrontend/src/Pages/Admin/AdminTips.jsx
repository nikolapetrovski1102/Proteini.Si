import { useEffect, useState } from "react";
import { api } from "../../services/api";

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

export default function AdminTips() {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.getAllTipArticles();
      setArticles(response.data || []);
    } catch (error) {
      alert(error.message || "Failed to load tips");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `https://proteini.mk${path}`;
    return path;
  };

  const resetForm = () => {
    setEditing(null);
    setPreview("");
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === "file") {
      const file = files?.[0] || null;
      setFormData((current) => ({ ...current, image: file }));
      setPreview(file ? URL.createObjectURL(file) : "");
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "displayOrder"
            ? Number(value)
            : value,
    }));
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateTipArticle(formData);
      } else {
        await api.createTipArticle(formData);
      }
      resetForm();
      await fetchArticles();
    } catch (error) {
      alert(error.message || "Failed to save tip");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Delete ${article.title}?`)) return;

    setSaving(true);
    try {
      await api.deleteTipArticle(article.id);
      await fetchArticles();
    } catch (error) {
      alert(error.message || "Failed to delete tip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tips and News</h1>
            <p className="text-sm text-gray-500">
              Edit image, title, subtitle, and article text.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            New Tip
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? "Edit tip" : "Add tip"}
            </h2>
            <div className="space-y-3">
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Title"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="titleAl"
                value={formData.titleAl}
                onChange={handleChange}
                placeholder="Title (Albanian)"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="URL slug (generated from title when empty)"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Subtitle"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="subtitleAl"
                value={formData.subtitleAl}
                onChange={handleChange}
                placeholder="Subtitle (Albanian)"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="7"
                placeholder="Text"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <p className="text-xs text-gray-500">
                Rich text supports safe paragraphs, headings, emphasis and lists.
              </p>
              <textarea
                name="contentAl"
                value={formData.contentAl}
                onChange={handleChange}
                rows="7"
                placeholder="Article content (Albanian)"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="SEO title"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                rows="3"
                maxLength="500"
                placeholder="SEO description"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2"
              />
              {preview && (
                <img
                  src={preview}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              )}
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>
            <button
              disabled={saving}
              className="mt-4 w-full bg-[#2096D8] px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Tip"}
            </button>
          </form>

          <div className="bg-white shadow-sm">
            {loading ? (
              <div className="p-6 text-gray-500">Loading...</div>
            ) : articles.length === 0 ? (
              <div className="p-6 text-gray-500">No tips yet.</div>
            ) : (
              <div className="divide-y">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-wrap items-start gap-4 p-5"
                  >
                    {article.imagePath && (
                      <img
                        src={getImageUrl(article.imagePath)}
                        alt=""
                        className="h-24 w-36 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="text-sm text-gray-600">
                        {article.subtitle}
                      </p>
                      {!article.isActive && (
                        <span className="mt-2 inline-block bg-gray-100 px-2 py-1 text-xs uppercase text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article)}
                        className="border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
