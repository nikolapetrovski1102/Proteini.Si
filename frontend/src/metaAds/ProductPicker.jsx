import { useMemo, useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { sameOrigin } from "./cardRender";
import Select from "./Select";
import { Button } from "./ui";
import { dot, inputClass } from "./format";

export const MAX_CARDS = 10;
const PAGE = 48;

const discountOf = (p) => (p.salePrice && p.salePrice < p.price ? Math.floor((1 - p.salePrice / p.price) * 100) : 0);
const nowPrice = (p) => (discountOf(p) ? p.salePrice : p.price);
const productLine = (p) => dot(p.brand, p.size, p.flavor);

const SORTS = [
  ["discount", "Biggest discount"],
  ["priceAsc", "Price: low to high"],
  ["priceDesc", "Price: high to low"],
  ["name", "Name A–Z"],
  ["brand", "Brand A–Z"],
];

const DISCOUNTS = [
  { value: 0, label: "Any" },
  { value: 1, label: "On sale" },
  { value: 10, label: "10% or more" },
  { value: 20, label: "20% or more" },
  { value: 30, label: "30% or more" },
  { value: 50, label: "50% or more" },
];

const sorters = {
  discount: (a, b) => discountOf(b) - discountOf(a) || nowPrice(a) - nowPrice(b),
  priceAsc: (a, b) => nowPrice(a) - nowPrice(b),
  priceDesc: (a, b) => nowPrice(b) - nowPrice(a),
  name: (a, b) => a.title.localeCompare(b.title),
  brand: (a, b) => (a.brand || "").localeCompare(b.brand || "") || a.title.localeCompare(b.title),
};

const emptyFilters = { query: "", category: "", brand: "", minDiscount: 0, priceMin: "", priceMax: "", sort: "discount", onePerProduct: true, includeOutOfStock: false };

const FilterLabel = ({ children }) => <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b6b63] mb-1">{children}</span>;

export default function ProductPicker({ products, loading, error, selectedIds, onToggle, onAddMany, onClear, maxPicked = MAX_CARDS }) {
  const [f, setF] = useState(emptyFilters);
  const [limit, setLimit] = useState(PAGE);
  const set = (patch) => {
    setF((old) => ({ ...old, ...patch }));
    setLimit(PAGE);
  };

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [products]);
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [products]);

  const matches = useMemo(() => {
    const words = f.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const min = Number(f.priceMin) || 0;
    const max = Number(f.priceMax) || Infinity;
    let list = products.filter((p) => {
      if (!f.includeOutOfStock && !p.inStock) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.brand && p.brand !== f.brand) return false;
      if (f.minDiscount && discountOf(p) < f.minDiscount) return false;
      const price = nowPrice(p);
      if (price < min || price > max) return false;
      const hay = `${p.title} ${p.brand} ${p.category} ${p.size} ${p.flavor}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    list = [...list].sort(sorters[f.sort]);
    if (f.onePerProduct) {
      // Keep the first (best by the chosen sort) variant of each product; selected variants always stay visible.
      const seen = new Set();
      list = list.filter((p) => {
        if (selectedIds.includes(p.id)) return true;
        if (seen.has(p.productId)) return false;
        seen.add(p.productId);
        return true;
      });
    }
    return list;
  }, [products, f, selectedIds]);

  const topDiscountIds = useMemo(() => {
    const seen = new Set();
    return products
      .filter((p) => p.inStock && discountOf(p) > 0)
      .sort(sorters.discount)
      .filter((p) => (seen.has(p.productId) ? false : seen.add(p.productId)))
      .map((p) => p.id);
  }, [products]);

  const shown = matches.slice(0, limit);
  const full = selectedIds.length >= maxPicked;
  const filtered = JSON.stringify({ ...f, sort: "" }) !== JSON.stringify({ ...emptyFilters, sort: "" });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <label className="col-span-2 lg:col-span-2">
          <FilterLabel>Search</FilterLabel>
          <input className={inputClass} placeholder="Name, brand, flavour, size…" value={f.query} onChange={(e) => set({ query: e.target.value })} />
        </label>
        <div>
          <FilterLabel>Category</FilterLabel>
          <Select label="Category" value={f.category} onChange={(v) => set({ category: v })} options={[{ value: "", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))]} />
        </div>
        <div>
          <FilterLabel>Brand</FilterLabel>
          <Select label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} options={[{ value: "", label: "All" }, ...brands.map((b) => ({ value: b, label: b }))]} />
        </div>
        <div>
          <FilterLabel>Discount</FilterLabel>
          <Select label="Discount" value={f.minDiscount} onChange={(v) => set({ minDiscount: Number(v) })} options={DISCOUNTS} />
        </div>
        <div>
          <FilterLabel>Sort</FilterLabel>
          <Select label="Sort" value={f.sort} onChange={(v) => set({ sort: v })} options={SORTS.map(([value, label]) => ({ value, label }))} />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div>
          <FilterLabel>Price (MKD)</FilterLabel>
          <div className="flex items-center gap-2">
            <input className={`${inputClass} !w-28`} type="number" min="0" placeholder="from" value={f.priceMin} onChange={(e) => set({ priceMin: e.target.value })} />
            <span className="text-[#6b6b63]">–</span>
            <input className={`${inputClass} !w-28`} type="number" min="0" placeholder="to" value={f.priceMax} onChange={(e) => set({ priceMax: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm pb-2.5">
          <input type="checkbox" checked={f.onePerProduct} onChange={(e) => set({ onePerProduct: e.target.checked })} />
          One card per product (hide other flavours/sizes)
        </label>
        <label className="flex items-center gap-2 text-sm pb-2.5">
          <input type="checkbox" checked={f.includeOutOfStock} onChange={(e) => set({ includeOutOfStock: e.target.checked })} />
          Show out of stock
        </label>
        {filtered && (
          <Button variant="link" className="pb-2.5" onClick={() => set(emptyFilters)}>
            Reset filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-[#e7e4da] py-3 text-sm">
        <Button variant="yellow" disabled={!topDiscountIds.length || full} onClick={() => onAddMany(topDiscountIds)}>
          Add top {Math.min(maxPicked - selectedIds.length, topDiscountIds.length) || ""} discounts
        </Button>
        <Button variant="ghost" disabled={!matches.length || full} onClick={() => onAddMany(matches.map((p) => p.id))}>
          Add first {Math.min(maxPicked - selectedIds.length, matches.length) || ""} shown
        </Button>
        {selectedIds.length > 0 && (
          <Button variant="link" onClick={onClear}>
            Clear selection
          </Button>
        )}
        <span className="ml-auto text-[#6b6b63]">{dot(`${matches.length} match`, `${selectedIds.length} of ${maxPicked} picked`)}</span>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-[#6b6b63]">Loading products…</div>}
      {!loading && !matches.length && <div className="text-sm text-[#6b6b63]">Nothing matches these filters.</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-[58vh] overflow-y-auto pr-1">
        {shown.map((p) => {
          const selected = selectedIds.includes(p.id);
          const pct = discountOf(p);
          return (
            <button
              type="button"
              key={p.id}
              disabled={!selected && full}
              onClick={() => onToggle(p.id)}
              className={`text-left rounded-xl border bg-white p-2 transition disabled:opacity-40 ${
                selected ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"
              } ${p.inStock ? "" : "opacity-60"}`}
            >
              <div className="relative aspect-square rounded-lg bg-[#f6f5f1] overflow-hidden">
                {p.image && <img src={sameOrigin(p.image)} alt="" loading="lazy" className="w-full h-full object-contain mix-blend-multiply" />}
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-[#141409] text-[#FDC700] text-sm font-bold grid place-items-center">
                    {selectedIds.indexOf(p.id) + 1}
                  </span>
                )}
                {pct > 0 && <span className="absolute bottom-1.5 left-1.5 font-display text-lg leading-none text-[#E1251B]">-{pct}%</span>}
              </div>
              <div className="mt-2 text-sm font-semibold leading-snug line-clamp-2">{p.title}</div>
              <div className="text-xs text-[#6b6b63] line-clamp-1">{productLine(p)}</div>
              <div className="text-sm mt-0.5">
                {pct > 0 ? (
                  <>
                    <span className="font-bold text-[#E1251B]">{formatMkd(p.salePrice)}</span>{" "}
                    <span className="text-xs line-through text-[#6b6b63]">{formatMkd(p.price)}</span>
                  </>
                ) : (
                  <span className="font-bold">{formatMkd(p.price)}</span>
                )}
              </div>
              {!p.inStock && <div className="text-xs text-red-700">Out of stock</div>}
            </button>
          );
        })}
        {matches.length > shown.length && (
          <div className="col-span-full flex justify-center py-2">
            <Button variant="ghost" onClick={() => setLimit((l) => l + PAGE)}>
              Show more ({matches.length - shown.length} left)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
