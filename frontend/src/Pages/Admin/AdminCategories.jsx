import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const emptyForm = {
  name: "",
  slug: "",
  parentId: "",
  displayOrder: 0,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mainCategories = useMemo(
    () => categories.filter((category) => !category.parent_Category_Id),
    [categories],
  );

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

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      displayOrder: Number(form.displayOrder) || 0,
    };
    try {
      if (editingId) await api.updateAdminCategory(editingId, payload);
      else await api.createAdminCategory(payload);
      reset();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (category) => {
    setEditingId(category.category_Id);
    setForm({
      name: category.category_Name || "",
      slug: category.category_Slug || "",
      parentId: category.parent_Category_Id || "",
      displayOrder: category.display_Order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete category "${category.category_Name}"?`)) return;
    try {
      await api.deleteAdminCategory(category.category_Id);
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">Category management</h1>
        <p className="mb-8 text-sm text-gray-600">
          Add main categories or choose a parent to create a subcategory. The URL
          slug is the address used by the shop filters, for example
          <strong> egg-white-protein</strong>.
        </p>

        <form onSubmit={submit} className="mb-8 grid gap-4 bg-white p-6 shadow-sm md:grid-cols-2">
          <label className="text-sm font-medium">
            Category name
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-1 w-full border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            URL slug
            <input
              required
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="egg-white-protein"
              className="mt-1 w-full border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Parent category
            <select
              value={form.parentId}
              onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value }))}
              className="mt-1 w-full border border-gray-300 px-3 py-2"
            >
              <option value="">None — main category</option>
              {mainCategories
                .filter((category) => category.category_Id !== editingId)
                .map((category) => (
                  <option key={category.category_Id} value={category.category_Id}>
                    {category.category_Name}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Display order
            <input
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))}
              className="mt-1 w-full border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button disabled={saving} className="bg-[#2096D8] px-5 py-2 font-semibold text-white disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update category" : "Add category"}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="border border-gray-300 px-5 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="mb-4 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => {
                  const parent = categories.find((item) => item.category_Id === category.parent_Category_Id);
                  return (
                    <tr key={category.category_Id}>
                      <td className="px-4 py-3 font-medium">
                        {category.parent_Category_Id ? "↳ " : ""}{category.category_Name}
                      </td>
                      <td className="px-4 py-3">{category.category_Slug}</td>
                      <td className="px-4 py-3">{parent?.category_Name || "Main category"}</td>
                      <td className="px-4 py-3">{category.display_Order}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => edit(category)} className="mr-3 text-[#2096D8]">Edit</button>
                        <button onClick={() => remove(category)} className="text-red-600">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
