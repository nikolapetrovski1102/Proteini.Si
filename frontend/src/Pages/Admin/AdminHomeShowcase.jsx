import { useEffect, useMemo, useState } from "react";
import { FiArrowDown, FiArrowUp, FiImage, FiPlus, FiSave, FiX } from "react-icons/fi";
import { searchText } from "../../utils/searchText";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  Field,
  FormSection,
  IconButton,
  Loading,
  Notice,
  SearchInput,
  Segmented,
  Toggle,
  inputClass,
} from "./AdminKit";
import { useToast } from "./adminFeedback";

/* Home page "Ново во продавница" section: the admin picks what it shows. */

const MAX_ITEMS = 12;

const SOURCES = [
  { value: "new", label: "Newest", hint: "Products marked “New in the shop”, newest first. Falls back to best sellers when none are marked." },
  { value: "bestsellers", label: "Best sellers", hint: "The most sold products." },
  { value: "sale", label: "On sale", hint: "Products with an active sale price." },
  { value: "manual", label: "Hand-picked", hint: "Exactly the products you choose below, in this order." },
];

const imageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
};

function Thumb({ src }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.05]">
      {src ? <img src={src} alt="" className="h-full w-full object-contain p-1" loading="lazy" /> : <FiImage className="text-gray-300" aria-hidden="true" />}
    </span>
  );
}

const emptyForm = { titleMk: "", titleAl: "", source: "new", itemCount: 3, isActive: true, productIds: [] };

export default function AdminHomeShowcase() {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [showcase, productRows] = await Promise.all([api.getHomeShowcase(), api.getProducts()]);
        if (cancelled) return;
        setForm({
          titleMk: showcase?.title_Mk || "",
          titleAl: showcase?.title_Al || "",
          source: showcase?.source || "new",
          itemCount: showcase?.item_Count || 3,
          isActive: showcase?.is_Active !== false,
          productIds: showcase?.productIds || [],
        });
        setProducts(Array.isArray(productRows) ? productRows : productRows?.data || []);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p.product_Id, p])), [products]);
  const picked = form.productIds.map((id) => byId.get(id) || { product_Id: id, name: `#${id}` });

  const matches = useMemo(() => {
    const term = searchText(search.trim());
    if (!term) return [];
    return products
      .filter((p) => !form.productIds.includes(p.product_Id))
      .filter((p) => searchText(p.name).includes(term) || String(p.product_Id) === term)
      .slice(0, 20);
  }, [products, search, form.productIds]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const add = (id) => {
    set({ productIds: [...form.productIds, id].slice(0, MAX_ITEMS) });
    setSearch("");
  };
  const remove = (id) => set({ productIds: form.productIds.filter((x) => x !== id) });
  const move = (index, delta) => {
    const ids = [...form.productIds];
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    set({ productIds: ids });
  };

  const manual = form.source === "manual";
  const save = async (event) => {
    event.preventDefault();
    if (manual && form.productIds.length === 0) {
      toast.error("Pick at least one product.");
      return;
    }
    setBusy(true);
    try {
      await api.updateHomeShowcase({
        ...form,
        itemCount: manual ? Math.max(form.productIds.length, 1) : Number(form.itemCount),
      });
      toast.success("Home page section saved.");
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Homepage"
      title="New in the shop"
      description="The product section under the banners on the homepage (“Ново во продавница”). Choose its title, what it shows and how many products."
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : (
        <Card>
          <form onSubmit={save} className="space-y-6">
            <Toggle
              checked={form.isActive}
              onChange={(v) => set({ isActive: v })}
              label="Show on the homepage"
              description="Turn off to hide the whole section."
            />

            <FormSection title="Title">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Macedonian" hint="Empty uses the default for the chosen source (e.g. “Ново во продавница”).">
                  <input className={inputClass} maxLength={120} value={form.titleMk} onChange={(e) => set({ titleMk: e.target.value })} placeholder="Ново во продавница" />
                </Field>
                <Field label="Albanian" hint="Empty uses the Macedonian title, or the default.">
                  <input className={inputClass} maxLength={120} value={form.titleAl} onChange={(e) => set({ titleAl: e.target.value })} placeholder="E re në dyqan" />
                </Field>
              </div>
            </FormSection>

            <FormSection title="What to show">
              <Segmented value={form.source} onChange={(v) => set({ source: v })} options={SOURCES} className="flex-wrap" />
              <p className="mt-2 text-xs text-gray-500">{SOURCES.find((s) => s.value === form.source)?.hint}</p>

              {!manual && (
                <div className="mt-4 max-w-[220px]">
                  <Field label="Number of products" hint="3 or 6 fill whole rows on desktop; 4 or 8 show four per row.">
                    <input type="number" min="1" max={MAX_ITEMS} required className={inputClass} value={form.itemCount}
                      onChange={(e) => set({ itemCount: e.target.value })} />
                  </Field>
                </div>
              )}
            </FormSection>

            {manual && (
              <FormSection title={`Products (${form.productIds.length}/${MAX_ITEMS})`}>
                <p className="-mt-1 mb-3 text-xs text-gray-500">
                  Shown in this order. Out-of-stock or deleted products are skipped on the homepage.
                </p>
                {picked.length > 0 && (
                  <ol className="mb-4 space-y-2">
                    {picked.map((product, index) => (
                      <li key={product.product_Id} className="flex items-center gap-3 rounded-xl bg-[#f6f5f1] p-2 pr-1.5 ring-1 ring-black/[0.05]">
                        <span className="w-5 text-center text-xs font-bold tabular-nums text-gray-500">{index + 1}</span>
                        <Thumb src={imageUrl(product.img)} />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{product.name}</span>
                        <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
                        <IconButton icon={FiArrowDown} label="Move down" disabled={index === picked.length - 1} onClick={() => move(index, 1)} />
                        <IconButton icon={FiX} tone="danger" label={`Remove ${product.name}`} onClick={() => remove(product.product_Id)} />
                      </li>
                    ))}
                  </ol>
                )}
                {form.productIds.length < MAX_ITEMS && (
                  <>
                    <SearchInput value={search} onChange={setSearch} placeholder="Search products to add…" label="Search products" />
                    {search.trim() && (
                      <ul className="mt-2 max-h-[320px] overflow-y-auto rounded-xl ring-1 ring-black/[0.06]">
                        {matches.length === 0 ? (
                          <li className="px-4 py-3 text-sm text-gray-500">No matching products.</li>
                        ) : (
                          matches.map((product) => (
                            <li key={product.product_Id}>
                              <button type="button" onClick={() => add(product.product_Id)}
                                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-black/[0.03]">
                                <Thumb src={imageUrl(product.img)} />
                                <span className="min-w-0 flex-1 truncate">{product.name}</span>
                                <FiPlus className="shrink-0 text-gray-500" aria-hidden="true" />
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </>
                )}
              </FormSection>
            )}

            <div className="flex justify-end">
              <Button type="submit" icon={FiSave} loading={busy}>
                Save
              </Button>
            </div>
          </form>
        </Card>
      )}
    </AdminPage>
  );
}
