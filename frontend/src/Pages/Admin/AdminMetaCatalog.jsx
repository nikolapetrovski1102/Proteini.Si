import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiChevronDown, FiChevronRight, FiCopy, FiDownload, FiFacebook, FiPackage } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  EmptyState,
  Notice,
  SearchInput,
  Segmented,
  Toggle,
  tableClass,
  tdClass,
  thClass,
  trClass,
} from "./AdminKit";
import { useToast } from "./adminFeedback";

const STORAGE_KEY = "admin-meta-catalog-selection";
const PREVIEW_STEP = 100;
const LONG_URL = 1800;
const EMPTY_SELECTION = { mode: "all", onSale: false, brands: [], categories: [], items: [] };

/** Columns of the CSV, in Meta Commerce Manager's names, mapped to the catalog row fields. */
const CSV_COLUMNS = [
  ["id", "id"],
  ["item_group_id", "itemGroupId"],
  ["title", "title"],
  ["description", "description"],
  ["availability", "availability"],
  ["condition", "condition"],
  ["price", "price"],
  ["sale_price", "salePrice"],
  ["sale_price_effective_date", "salePriceEffectiveDate"],
  ["link", "link"],
  ["image_link", "imageLink"],
  ["brand", "brand"],
  ["google_product_category", "googleProductCategory"],
  ["product_type", "productType"],
  ["size", "size"],
  ["color", "color"],
  ["custom_label_0", "customLabel0"],
  ["custom_label_1", "customLabel1"],
  ["custom_label_2", "customLabel2"],
];

const loadSelection = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...EMPTY_SELECTION, ...saved } : EMPTY_SELECTION;
  } catch {
    return EMPTY_SELECTION;
  }
};

const saveSelection = (selection) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Private window or blocked storage: the selection just isn't remembered.
  }
};

const csvCell = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadFile = (content, fileName, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/** Absolute public feed URL (the API base may be relative, e.g. "/api" behind a dev proxy). */
const feedBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "/api";
  const absolute = /^https?:\/\//i.test(base) ? base : `${window.location.origin}${base.startsWith("/") ? "" : "/"}${base}`;
  return `${absolute.replace(/\/$/, "")}/feed/products.xml`;
};

const includes = (selection, item) => {
  if (selection.mode === "all") return true;
  return (
    selection.items.includes(item.id) ||
    selection.items.includes(`p${item.productId}`) ||
    (item.brandId != null && selection.brands.includes(item.brandId)) ||
    (item.categoryIds || []).some((id) => selection.categories.includes(id)) ||
    (selection.onSale && item.onSale)
  );
};

const variantLabel = (item) => [item.size, item.color || item.flavor].filter(Boolean).join(" · ") || "No weight or flavour";

/** Plain checkbox row used by every picker. */
function CheckRow({ checked, onChange, label, detail, indent = 0, partial = false }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-black/[0.03]" style={{ paddingLeft: 8 + indent * 20 }}>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => el && (el.indeterminate = partial && !checked)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer accent-[#141409]"
      />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-900">{label}</span>
      {detail != null && <span className="shrink-0 text-xs tabular-nums text-gray-500">{detail}</span>}
    </label>
  );
}

export default function AdminMetaCatalog() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState(loadSelection);
  const [pickerTab, setPickerTab] = useState("products");
  const [productSearch, setProductSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewLimit, setPreviewLimit] = useState(PREVIEW_STEP);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rows, brandRows, categoryRows] = await Promise.all([
          api.getAdminMetaCatalog(),
          api.getAdminBrands().catch(() => []),
          api.getAdminCategories().catch(() => []),
        ]);
        setItems(rows || []);
        setBrands(brandRows || []);
        setCategories(categoryRows || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => saveSelection(selection), [selection]);

  const update = (patch) => setSelection((current) => ({ ...current, mode: "selected", ...patch }));
  const toggleIn = (key, value, on) =>
    setSelection((current) => {
      const list = current[key].filter((v) => v !== value);
      return { ...current, mode: "selected", [key]: on ? [...list, value] : list };
    });

  // ---- derived data

  const included = useMemo(() => items.filter((item) => includes(selection, item)), [items, selection]);

  const counts = useMemo(() => {
    const byBrand = {};
    const byCategory = {};
    let onSale = 0;
    for (const item of items) {
      if (item.brandId != null) byBrand[item.brandId] = (byBrand[item.brandId] || 0) + 1;
      for (const id of item.categoryIds || []) byCategory[id] = (byCategory[id] || 0) + 1;
      if (item.onSale) onSale += 1;
    }
    return { byBrand, byCategory, onSale };
  }, [items]);

  const products = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.productId)) map.set(item.productId, { productId: item.productId, brand: item.brand, imageLink: item.imageLink, rows: [] });
      map.get(item.productId).rows.push(item);
    }
    return [...map.values()].map((p) => ({
      ...p,
      // Product name = the title before the ", weight · flavour" part the feed adds.
      name: p.rows[0].itemGroupId ? p.rows[0].title.split(", ")[0] : p.rows[0].title,
    }));
  }, [items]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const list = q ? products.filter((p) => `${p.name} ${p.brand} ${p.rows.map((r) => r.title).join(" ")}`.toLowerCase().includes(q)) : products;
    return list.slice(0, 150);
  }, [products, productSearch]);

  const categoryTree = useMemo(() => {
    const known = new Set(categories.map((c) => c.category_Id));
    const order = (a, b) => (a.display_Order || 0) - (b.display_Order || 0) || (a.category_Name || "").localeCompare(b.category_Name || "");
    const rows = [];
    const visit = (parentId, depth) => {
      categories
        .filter((c) => (parentId == null ? !c.parent_Category_Id || !known.has(c.parent_Category_Id) : c.parent_Category_Id === parentId))
        .sort(order)
        .forEach((c) => {
          rows.push({ id: c.category_Id, name: c.category_Name, depth });
          if (depth < 6) visit(c.category_Id, depth + 1);
        });
    };
    visit(null, 0);
    return rows.filter((r) => counts.byCategory[r.id]);
  }, [categories, counts]);

  const sortedBrands = useMemo(
    () => brands.filter((b) => counts.byBrand[b.brand_Id]).sort((a, b) => (a.brand_Name || "").localeCompare(b.brand_Name || "")),
    [brands, counts],
  );

  const feedUrl = useMemo(() => {
    const base = feedBaseUrl();
    if (selection.mode === "all") return base;
    const params = [];
    if (selection.items.length) params.push(`items=${selection.items.join(",")}`);
    if (selection.brands.length) params.push(`brands=${selection.brands.join(",")}`);
    if (selection.categories.length) params.push(`categories=${selection.categories.join(",")}`);
    if (selection.onSale) params.push("onSale=1");
    return params.length ? `${base}?${params.join("&")}` : base;
  }, [selection]);

  const nothingPicked =
    selection.mode === "selected" && !selection.onSale && !selection.brands.length && !selection.categories.length && !selection.items.length;

  const stats = useMemo(
    () => ({
      inStock: included.filter((i) => i.availability === "in stock").length,
      onSale: included.filter((i) => i.onSale).length,
      noImage: included.filter((i) => !i.imageLink).length,
      products: new Set(included.map((i) => i.productId)).size,
    }),
    [included],
  );

  const preview = useMemo(() => {
    const q = previewSearch.trim().toLowerCase();
    return q ? included.filter((i) => `${i.id} ${i.title} ${i.brand}`.toLowerCase().includes(q)) : included;
  }, [included, previewSearch]);

  // ---- actions

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Select the link and copy it by hand.");
    }
  };

  const exportCsv = () => {
    if (!included.length) return toast.error("Nothing selected to export.");
    const lines = [CSV_COLUMNS.map(([name]) => name).join(",")];
    for (const item of included) lines.push(CSV_COLUMNS.map(([, key]) => csvCell(item[key])).join(","));
    downloadFile(`\uFEFF${lines.join("\r\n")}`, `meta-catalog-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
    toast.success(`Downloaded ${included.length} items.`);
  };

  const exportXml = async () => {
    if (!included.length) return toast.error("Nothing selected to export.");
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) throw new Error("Failed to build the XML feed");
      downloadFile(await response.text(), `meta-catalog-${new Date().toISOString().slice(0, 10)}.xml`, "application/xml");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ---- pickers

  const productPicker = (
    <div className="space-y-3">
      <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Search product, brand, weight or flavour" />
      <div className="max-h-[420px] overflow-y-auto rounded-xl ring-1 ring-black/[0.06]">
        {filteredProducts.map((p) => {
          const wholeProduct = selection.items.includes(`p${p.productId}`);
          const pickedVariants = p.rows.filter((r) => selection.items.includes(r.id)).length;
          const hasVariants = p.rows.length > 1 || p.rows[0].itemGroupId;
          const open = expanded[p.productId] ?? Boolean(productSearch.trim() && hasVariants);
          return (
            <div key={p.productId} className="border-b border-black/[0.05] p-1 last:border-0">
              <div className="flex items-center">
                {hasVariants ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((c) => ({ ...c, [p.productId]: !open }))}
                    aria-label={open ? "Hide weights and flavours" : "Show weights and flavours"}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-black/[0.06]"
                  >
                    {open ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
                  </button>
                ) : (
                  <span className="w-7 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <CheckRow
                    checked={wholeProduct}
                    partial={pickedVariants > 0}
                    onChange={(on) => {
                      // Picking the whole product replaces any single variants of it.
                      const ids = new Set(p.rows.map((r) => r.id));
                      setSelection((current) => {
                        const rest = current.items.filter((id) => !ids.has(id) && id !== `p${p.productId}`);
                        return { ...current, mode: "selected", items: on ? [...rest, `p${p.productId}`] : rest };
                      });
                    }}
                    label={p.name}
                    detail={[p.brand, hasVariants ? `${p.rows.length} variants` : null, pickedVariants && !wholeProduct ? `${pickedVariants} picked` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </div>
              </div>
              {open &&
                hasVariants &&
                p.rows.map((r) => (
                  <CheckRow
                    key={r.id}
                    indent={1.4}
                    checked={wholeProduct || selection.items.includes(r.id)}
                    onChange={(on) => {
                      if (wholeProduct) {
                        // Un-ticking one variant of a whole product: keep the others as single picks.
                        setSelection((current) => ({
                          ...current,
                          mode: "selected",
                          items: [...current.items.filter((id) => id !== `p${p.productId}`), ...p.rows.filter((x) => x.id !== r.id).map((x) => x.id)],
                        }));
                      } else toggleIn("items", r.id, on);
                    }}
                    label={variantLabel(r)}
                    detail={[r.salePrice || r.price, r.availability === "in stock" ? null : "out of stock"].filter(Boolean).join(" · ")}
                  />
                ))}
            </div>
          );
        })}
        {!filteredProducts.length && <p className="p-4 text-sm text-gray-500">No products match.</p>}
      </div>
      {products.length > filteredProducts.length && !productSearch && (
        <p className="text-xs text-gray-500">Showing the first 150 products. Search to find the others.</p>
      )}
    </div>
  );

  const brandPicker = (
    <div className="max-h-[420px] overflow-y-auto rounded-xl p-1 ring-1 ring-black/[0.06]">
      {sortedBrands.map((b) => (
        <CheckRow
          key={b.brand_Id}
          checked={selection.brands.includes(b.brand_Id)}
          onChange={(on) => toggleIn("brands", b.brand_Id, on)}
          label={b.brand_Name}
          detail={`${counts.byBrand[b.brand_Id]} items`}
        />
      ))}
      {!sortedBrands.length && <p className="p-4 text-sm text-gray-500">No brands with products.</p>}
    </div>
  );

  const categoryPicker = (
    <div className="max-h-[420px] overflow-y-auto rounded-xl p-1 ring-1 ring-black/[0.06]">
      {categoryTree.map((c) => (
        <CheckRow
          key={c.id}
          indent={c.depth}
          checked={selection.categories.includes(c.id)}
          onChange={(on) => toggleIn("categories", c.id, on)}
          label={c.name}
          detail={`${counts.byCategory[c.id]} items`}
        />
      ))}
      {!categoryTree.length && <p className="p-4 text-sm text-gray-500">No categories with products.</p>}
    </div>
  );

  const pickedSummary = [
    selection.onSale ? "everything on discount" : null,
    selection.categories.length ? `${selection.categories.length} ${selection.categories.length === 1 ? "category" : "categories"}` : null,
    selection.brands.length ? `${selection.brands.length} ${selection.brands.length === 1 ? "brand" : "brands"}` : null,
    selection.items.length ? `${selection.items.length} single ${selection.items.length === 1 ? "pick" : "picks"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AdminPage
      eyebrow="Shop"
      title="Meta catalog"
      description="Choose which products go into the Facebook / Instagram catalog for ads, then copy the feed link into Meta Commerce Manager or download a file."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={FiDownload} onClick={exportXml} disabled={loading || !included.length}>
            XML
          </Button>
          <Button icon={FiDownload} onClick={exportCsv} disabled={loading || !included.length}>
            Download CSV
          </Button>
        </div>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}

      <Card title="What goes into the catalog" bodyClassName="p-4 sm:p-5 space-y-4">
        <Segmented
          value={selection.mode}
          onChange={(mode) => setSelection((current) => ({ ...current, mode }))}
          options={[
            { value: "all", label: "All products", count: loading ? undefined : items.length },
            { value: "selected", label: "Only what I pick" },
          ]}
        />

        {selection.mode === "selected" && (
          <>
            <Toggle
              checked={selection.onSale}
              onChange={(on) => update({ onSale: on })}
              label="Everything on discount"
              description={`Every item with a sale price right now (${counts.onSale} today). Items join and leave the catalog on their own as discounts start and end.`}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Segmented
                value={pickerTab}
                onChange={setPickerTab}
                options={[
                  { value: "products", label: "Products", count: selection.items.length || undefined },
                  { value: "categories", label: "Categories", count: selection.categories.length || undefined },
                  { value: "brands", label: "Brands", count: selection.brands.length || undefined },
                ]}
              />
              {pickedSummary && (
                <button type="button" onClick={() => setSelection({ ...EMPTY_SELECTION, mode: "selected" })} className="text-sm font-semibold text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline sm:ml-auto">
                  Clear all picks
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {pickerTab === "products"
                ? "Tick a product for all its weights and flavours, or open it and tick single variants."
                : pickerTab === "categories"
                  ? "A category includes its subcategories. New products in it are added to the catalog automatically."
                  : "A brand includes all of its products. New products of the brand are added automatically."}
            </p>

            {loading ? <div className="h-64 animate-pulse rounded-xl bg-black/[0.04]" /> : pickerTab === "products" ? productPicker : pickerTab === "categories" ? categoryPicker : brandPicker}
          </>
        )}
      </Card>

      <Card title="Feed link for Meta" description="In Commerce Manager: Catalog → Data sources → Add items → Data feed → Scheduled feed, and paste this link. Meta re-reads it on the schedule you set, so prices, stock and discounts stay current.">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input readOnly value={feedUrl} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg bg-[#f6f5f1] px-3 py-2.5 font-mono text-xs text-gray-800 ring-1 ring-black/[0.06]" />
          <Button variant="secondary" icon={copied ? FiCheck : FiCopy} onClick={copyFeedUrl} disabled={nothingPicked}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        {feedUrl.length > LONG_URL && (
          <Notice tone="warning" className="mt-3">
            This link is very long because of many single picks. If Meta rejects it, pick whole categories or brands instead, or upload the CSV.
          </Notice>
        )}
        <p className="mt-3 text-xs text-gray-500">Changing the picks changes the link: paste the new link in Meta after every change.</p>
      </Card>

      <Card
        title={nothingPicked ? "Nothing picked yet" : `${included.length} items in the catalog`}
        description={
          nothingPicked
            ? "Turn on discounts or pick products, categories or brands above."
            : [
                `${stats.products} products`,
                `${stats.inStock} in stock`,
                `${stats.onSale} on discount`,
                stats.noImage ? `${stats.noImage} without image (Meta will reject them)` : null,
                selection.mode === "selected" && pickedSummary ? `from ${pickedSummary}` : null,
              ]
                .filter(Boolean)
                .join(" · ")
        }
        bodyClassName=""
      >
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-black/[0.04]" />
            ))}
          </div>
        ) : !included.length ? (
          <EmptyState icon={FiFacebook} title="The catalog is empty" text="Nothing matches the current picks." />
        ) : (
          <>
            <div className="border-b border-black/[0.05] p-4">
              <SearchInput value={previewSearch} onChange={(v) => { setPreviewSearch(v); setPreviewLimit(PREVIEW_STEP); }} placeholder="Search the catalog" className="sm:w-80" />
            </div>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Item</th>
                    <th className={thClass}>Category</th>
                    <th className={`${thClass} text-right`}>Price</th>
                    <th className={thClass}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, previewLimit).map((item) => (
                    <tr key={item.id} className={trClass}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          {item.imageLink ? (
                            <img src={item.imageLink} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain ring-1 ring-black/[0.06]" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3262F]/10 text-[#a3161d]" title="No image">
                              <FiPackage size={16} />
                            </span>
                          )}
                          <span className="min-w-0">
                            <a href={item.link} target="_blank" rel="noreferrer" className="block font-semibold text-gray-900 hover:underline">
                              {item.title}
                            </a>
                            <span className="block text-xs text-gray-500">{[item.brand, item.id, item.imageLink ? null : "no image"].filter(Boolean).join(" · ")}</span>
                          </span>
                        </div>
                      </td>
                      <td className={`${tdClass} text-gray-600`}>{item.productType || "—"}</td>
                      <td className={`${tdClass} whitespace-nowrap text-right tabular-nums`}>
                        {item.salePrice ? (
                          <>
                            <span className="block font-semibold text-[#a3161d]">{item.salePrice}</span>
                            <span className="block text-xs text-gray-400 line-through">{item.price}</span>
                          </>
                        ) : (
                          <span className="font-semibold">{item.price}</span>
                        )}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap ${item.availability === "in stock" ? "text-gray-600" : "text-[#a3161d]"}`}>
                        {item.availability === "in stock" ? `In stock (${item.quantity})` : "Out of stock"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > previewLimit && (
              <div className="flex items-center justify-between gap-3 border-t border-black/[0.05] p-4">
                <p className="text-sm text-gray-500">
                  Showing {previewLimit} of {preview.length}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setPreviewLimit((c) => c + PREVIEW_STEP)}>
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </AdminPage>
  );
}
