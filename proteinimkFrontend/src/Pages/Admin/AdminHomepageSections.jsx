import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { getHomepageCardImageUrl } from "../../utils/homepageCardImage";

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

export default function AdminHomepageSections() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const grouped = useMemo(
    () => ({
      goals: cards.filter((item) => item.section === "goal"),
      sports: cards.filter((item) => item.section === "sport"),
    }),
    [cards],
  );

  const load = async () => {
    setBusy(true);
    try {
      setCards(await api.getAdminHomepageCards());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setPreview("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.saveAdminHomepageCard(form, editingId);
      setMessage(editingId ? "Homepage card updated." : "Homepage card created.");
      reset();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.titleMk}" from the homepage?`)) return;
    setBusy(true);
    try {
      await api.deleteAdminHomepageCard(item.id);
      if (editingId === item.id) reset();
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass = "mt-1 w-full border border-gray-300 bg-white px-3 py-2";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Homepage goals and sports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage the first two homepage sections here. The third section, Tips, has its own admin page.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin-tips")} className="border bg-white px-4 py-2 font-semibold">
              Manage Tips
            </button>
            <button onClick={() => navigate("/admin-panel")} className="border bg-white px-4 py-2 font-semibold">
              Back to products
            </button>
          </div>
        </div>

        {message && <p className="mb-4 bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-4 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="mb-8 grid gap-4 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium">
            Section
            <select className={inputClass} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
              <option value="goal">Choose your goal</option>
              <option value="sport">Sports</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Macedonian title
            <input required className={inputClass} value={form.titleMk} onChange={(e) => setForm({ ...form, titleMk: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Albanian title
            <input className={inputClass} value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            URL slug
            <input required className={inputClass} placeholder="weight-loss" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Product filter value
            <input required className={inputClass} placeholder="Weight Loss" value={form.filterValue} onChange={(e) => setForm({ ...form, filterValue: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Destination URL (optional)
            <input className={inputClass} placeholder="/products?search=whey" value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Display order
            <input type="number" min="0" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </label>
          <label className="text-sm font-medium">
            Image {editingId ? "(leave empty to keep current)" : ""}
            <input required={!editingId} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className={inputClass} onChange={(e) => {
              const image = e.target.files?.[0] || null;
              setForm({ ...form, image });
              if (image) setPreview(URL.createObjectURL(image));
            }} />
          </label>
          <label className="flex items-center gap-2 self-end py-2 text-sm font-medium">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>
          {preview && <img src={preview} alt="Preview" className="h-28 w-full object-cover md:col-span-2" />}
          <div className="flex gap-2 md:col-span-2 lg:col-span-4">
            <button disabled={busy} className="bg-[#2096D8] px-5 py-2 font-semibold text-white disabled:opacity-50">
              {editingId ? "Update card" : "Add card"}
            </button>
            {editingId && <button type="button" onClick={reset} className="border px-5 py-2">Cancel</button>}
          </div>
        </form>

        {[['goals', 'Choose your goal'], ['sports', 'Sports']].map(([key, title]) => (
          <section key={key} className="mb-8">
            <h2 className="mb-3 text-xl font-bold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {grouped[key].map((item) => (
                <article key={item.id} className="bg-white p-3 shadow-sm">
                  <img src={getHomepageCardImageUrl(item.imagePath)} alt="" className="h-36 w-full object-cover" />
                  <h3 className="mt-3 font-bold">{item.titleMk}</h3>
                  <p className="text-sm text-gray-500">{item.titleAl || "No Albanian title"}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.filterValue} · order {item.displayOrder}</p>
                  {item.destinationUrl && <p className="truncate text-xs text-gray-500">{item.destinationUrl}</p>}
                  <p className={`mt-1 text-xs font-semibold ${item.isActive ? "text-green-700" : "text-gray-500"}`}>{item.isActive ? "Active" : "Hidden"}</p>
                  <div className="mt-3 flex gap-3 text-sm">
                    <button onClick={() => edit(item)} className="text-[#2096D8]">Edit</button>
                    <button onClick={() => remove(item)} className="text-red-600">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
