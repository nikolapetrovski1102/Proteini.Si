import { useEffect, useMemo, useState } from "react";
import { FiArrowDown, FiArrowUp, FiImage, FiPlus, FiSave, FiX } from "react-icons/fi";
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
  selectClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

/*
 * Pinned in shop: products the admin lifts to the top of a category listing, a brand listing or the whole shop.
 * They lead the default "Recommended" order; a sort the shopper picks and search results ignore them.
 */

const MAX_PINS = 12;

const SCOPES = [
  { value: "category", label: "Category" },
  { value: "brand", label: "Brand" },
  { value: "all", label: "Whole shop" },
];

const SCOPE_HINTS = {
  category: "Pinned products open the category page (Recommended order). A main category's pins show on the main category page; a subcategory has its own.",
  brand: "Pinned products open the brand page (Recommended order).",
  all: "Pinned products open the shop when no category or brand is selected (Recommended order).",
};

const imageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
};

const keyOf = (scope, targetId) => `${scope}:${scope === "all" ? 0 : Number(targetId) || 0}`;
const sameIds = (a, b) => a.length === b.length && a.every((id, i) => id === b[i]);

function Thumb({ src }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f6f5f1] ring-1 ring-black/[0.05]">
      {src ? <img src={src} alt="" className="h-full w-full object-contain p-1" loading="lazy" /> : <FiImage className="text-gray-300" aria-hidden="true" />}
    </span>
  );
}

export default function AdminProductPlacements() {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  // Saved pins per listing key ("category:5") → product ids in order.
  const [saved, setSaved] = useState({});

  const [scope, setScope] = useState("category");
  const [targetId, setTargetId] = useState("");
  const [pinned, setPinned] = useState([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [options, data] = await Promise.all([api.getFilterOptions(), api.getProductPlacements()]);
        if (cancelled) return;
        setCategories(options?.categories || []);
        setBrands(options?.brands || []);
        setProducts(data?.products || []);
        const byKey = {};
        for (const row of data?.placements || []) {
          const key = keyOf(row.scope, row.target_Id);
          (byKey[key] ||= []).push(row.product_Id);
        }
        setSaved(byKey);
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

  /* Categories as "Main" then "Main › Sub", in display order. */
  const categoryOptions = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_Category_Id);
    return parents.flatMap((parent) => [
      { id: parent.category_Id, label: parent.category_Name },
      ...categories
        .filter((c) => c.parent_Category_Id === parent.category_Id)
        .map((child) => ({ id: child.category_Id, label: `${parent.category_Name} › ${child.category_Name}` })),
    ]);
  }, [categories]);

  const sortedBrands = useMemo(
    () => [...brands].sort((a, b) => (a.brand_Name || "").localeCompare(b.brand_Name || "")),
    [brands],
  );

  /* A category listing includes its subcategories, just like the shop. */
  const categoryWithChildren = useMemo(() => {
    const map = new Map();
    for (const c of categories) {
      const ids = new Set([c.category_Id]);
      for (const child of categories) if (child.parent_Category_Id === c.category_Id) ids.add(child.category_Id);
      map.set(c.category_Id, ids);
    }
    return map;
  }, [categories]);

  const inCategory = (product, categoryId) => {
    const ids = categoryWithChildren.get(Number(categoryId));
    return !!ids && (product.categoryIds || []).some((id) => ids.has(id));
  };

  const listingKey = scope === "all" || targetId ? keyOf(scope, targetId) : null;
  const savedIds = useMemo(() => (listingKey ? saved[listingKey] || [] : []), [saved, listingKey]);
  const dirty = !!listingKey && !sameIds(pinned, savedIds);

  // Load the saved pins whenever another listing is opened.
  useEffect(() => {
    setPinned(savedIds);
    setSearch("");
    setBrandFilter("");
    setCategoryFilter("");
  }, [listingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchListing = async (nextScope, nextTarget) => {
    if (dirty) {
      const ok = await confirm({
        title: "Discard unsaved changes?",
        message: "The pinned products of this listing have not been saved.",
        confirmLabel: "Discard",
        tone: "danger",
      });
      if (!ok) return;
    }
    setScope(nextScope);
    setTargetId(nextTarget);
  };

  const byId = useMemo(() => new Map(products.map((p) => [p.product_Id, p])), [products]);
  const pinnedRows = pinned.map((id) => byId.get(id) || { product_Id: id, name: `#${id}`, quantity: 0 });

  const candidates = useMemo(() => {
    if (!listingKey) return [];
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (pinned.includes(p.product_Id)) return false;
      if (scope === "category" && !inCategory(p, targetId)) return false;
      if (scope === "brand" && p.brand_Id !== Number(targetId)) return false;
      if (brandFilter && p.brand_Id !== Number(brandFilter)) return false;
      if (categoryFilter && !inCategory(p, categoryFilter)) return false;
      if (term && !(p.name || "").toLowerCase().includes(term) && String(p.product_Id) !== term) return false;
      return true;
    });
  }, [products, pinned, scope, targetId, brandFilter, categoryFilter, search, listingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Brands / categories that actually have products in this listing, for the picker filters. */
  const filterBrands = useMemo(() => {
    if (scope === "brand") return [];
    const ids = new Set(products.filter((p) => scope === "all" || inCategory(p, targetId)).map((p) => p.brand_Id));
    return sortedBrands.filter((b) => ids.has(b.brand_Id));
  }, [products, sortedBrands, scope, targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterCategories = useMemo(() => {
    if (scope === "category") return [];
    const listed = products.filter((p) => scope === "all" || p.brand_Id === Number(targetId));
    return categoryOptions.filter((c) => listed.some((p) => inCategory(p, c.id)));
  }, [products, categoryOptions, scope, targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (id) => setPinned((ids) => (ids.length >= MAX_PINS || ids.includes(id) ? ids : [...ids, id]));
  const remove = (id) => setPinned((ids) => ids.filter((x) => x !== id));
  const move = (index, delta) =>
    setPinned((current) => {
      const ids = [...current];
      const target = index + delta;
      if (target < 0 || target >= ids.length) return current;
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return ids;
    });

  const save = async () => {
    if (!listingKey) return;
    setBusy(true);
    try {
      await api.saveProductPlacements({ scope, targetId: scope === "all" ? 0 : Number(targetId), productIds: pinned });
      setSaved((current) => ({ ...current, [listingKey]: pinned }));
      toast.success(pinned.length ? "Pinned products saved." : "Pins removed from this listing.");
    } catch (saveError) {
      toast.error(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const countFor = (s, id) => (saved[keyOf(s, id)] || []).length;
  const pinLabel = (n) => (n ? ` · ${n} pinned` : "");
  const listingName =
    scope === "all"
      ? "the whole shop"
      : scope === "brand"
        ? sortedBrands.find((b) => b.brand_Id === Number(targetId))?.brand_Name
        : categoryOptions.find((c) => c.id === Number(targetId))?.label;

  return (
    <AdminPage
      eyebrow="Shop"
      title="Pinned in shop"
      description="Pick a category or brand page and choose which products it shows first. Pins apply to the default “Recommended” order; sold-out products stay in their usual place until they are back in stock."
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : (
        <div className="space-y-6">
          <Card>
            <FormSection title="Listing">
              <Segmented value={scope} onChange={(v) => switchListing(v, "")} options={SCOPES} />
              <p className="mt-2 text-xs text-gray-500">{SCOPE_HINTS[scope]}</p>

              {scope !== "all" && (
                <div className="mt-4 max-w-[420px]">
                  <Field label={scope === "brand" ? "Brand" : "Category"}>
                    <select className={selectClass} value={targetId} onChange={(e) => switchListing(scope, e.target.value)}>
                      <option value="">{scope === "brand" ? "Choose a brand…" : "Choose a category…"}</option>
                      {scope === "brand"
                        ? sortedBrands.map((b) => (
                            <option key={b.brand_Id} value={b.brand_Id}>
                              {b.brand_Name}
                              {pinLabel(countFor("brand", b.brand_Id))}
                            </option>
                          ))
                        : categoryOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                              {pinLabel(countFor("category", c.id))}
                            </option>
                          ))}
                    </select>
                  </Field>
                </div>
              )}
            </FormSection>
          </Card>

          {listingKey && (
            <Card>
              <div className="space-y-6">
                <FormSection title={`Pinned first in ${listingName || "this listing"} (${pinned.length}/${MAX_PINS})`}>
                  {pinnedRows.length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing pinned. The listing uses the normal Recommended order.</p>
                  ) : (
                    <ol className="space-y-2">
                      {pinnedRows.map((product, index) => (
                        <li key={product.product_Id} className="flex items-center gap-3 rounded-xl bg-[#f6f5f1] p-2 pr-1.5 ring-1 ring-black/[0.05]">
                          <span className="w-5 text-center text-xs font-bold tabular-nums text-gray-500">{index + 1}</span>
                          <Thumb src={imageUrl(product.img)} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-900">{product.name}</span>
                            {!(product.quantity > 0) && <span className="block text-xs text-[#B4231F]">Sold out, not lifted until back in stock</span>}
                          </span>
                          <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0} onClick={() => move(index, -1)} />
                          <IconButton icon={FiArrowDown} label="Move down" disabled={index === pinnedRows.length - 1} onClick={() => move(index, 1)} />
                          <IconButton icon={FiX} tone="danger" label={`Unpin ${product.name}`} onClick={() => remove(product.product_Id)} />
                        </li>
                      ))}
                    </ol>
                  )}
                </FormSection>

                {pinned.length < MAX_PINS && (
                  <FormSection title="Add products">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
                      <SearchInput value={search} onChange={setSearch} placeholder="Search by name…" label="Search products" />
                      {scope !== "brand" && (
                        <select className={selectClass} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} aria-label="Filter by brand">
                          <option value="">All brands</option>
                          {filterBrands.map((b) => (
                            <option key={b.brand_Id} value={b.brand_Id}>{b.brand_Name}</option>
                          ))}
                        </select>
                      )}
                      {scope !== "category" && (
                        <select className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
                          <option value="">All categories</option>
                          {filterCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <ul className="mt-3 max-h-[420px] overflow-y-auto rounded-xl ring-1 ring-black/[0.06]">
                      {candidates.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-gray-500">No matching products in this listing.</li>
                      ) : (
                        candidates.slice(0, 100).map((product) => (
                          <li key={product.product_Id}>
                            <button type="button" onClick={() => add(product.product_Id)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-black/[0.03]">
                              <Thumb src={imageUrl(product.img)} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate">{product.name}</span>
                                <span className="block truncate text-xs text-gray-500">
                                  {[brands.find((b) => b.brand_Id === product.brand_Id)?.brand_Name, product.quantity > 0 ? null : "Sold out"]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </span>
                              <FiPlus className="shrink-0 text-gray-500" aria-hidden="true" />
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                    {candidates.length > 100 && (
                      <p className="mt-2 text-xs text-gray-500">Showing 100 of {candidates.length}. Search or filter to narrow the list.</p>
                    )}
                  </FormSection>
                )}

                <div className="flex items-center justify-end gap-3">
                  {dirty && <span className="text-xs text-gray-500">Unsaved changes</span>}
                  <Button type="button" icon={FiSave} loading={busy} disabled={!dirty} onClick={save}>
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </AdminPage>
  );
}
