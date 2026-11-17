import { useMemo, useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { sameOrigin } from "./cardRender";
import { Button } from "./ui";
import { dot, inputClass } from "./format";

const MAX = 10;

const productLine = (p) => dot(p.brand, p.size, p.flavor);

export default function ProductPicker({ products, loading, error, selectedIds, onToggle, onAddMany, onClear }) {
  const [query, setQuery] = useState("");
  const [onlySale, setOnlySale] = useState(false);
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const matches = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (!p.inStock) return false;
      if (onlySale && !(p.salePrice && p.salePrice < p.price)) return false;
      if (category && p.category !== category) return false;
      const hay = `${p.title} ${p.brand} ${p.category} ${p.size} ${p.flavor}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [products, query, onlySale, category]);

  const saleIds = useMemo(
    () =>
      products
        .filter((p) => p.inStock && p.salePrice && p.salePrice < p.price)
        .sort((a, b) => b.price - b.salePrice - (a.price - a.salePrice))
        .map((p) => p.id),
    [products],
  );

  const shown = matches.slice(0, 60);
  const full = selectedIds.length >= MAX;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <input
          className={`${inputClass} md:flex-1`}
          placeholder="Search products, brands, flavors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={`${inputClass} md:w-56`} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm px-1 whitespace-nowrap">
          <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} />
          On sale only
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Button variant="yellow" disabled={!saleIds.length} onClick={() => onAddMany(saleIds.slice(0, MAX))}>
          Top {Math.min(MAX, saleIds.length)} biggest discounts
        </Button>
        <Button variant="ghost" disabled={!matches.length || full} onClick={() => onAddMany(matches.map((p) => p.id))}>
          Add first matches
        </Button>
        {selectedIds.length > 0 && (
          <Button variant="link" onClick={onClear}>
            Clear selection
          </Button>
        )}
        <span className="text-[#6b6b63]">{dot(`${selectedIds.length} of ${MAX} cards`, `${matches.length} in stock match`)}</span>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-[#6b6b63]">Loading products…</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[440px] overflow-y-auto pr-1">
        {shown.map((p) => {
          const selected = selectedIds.includes(p.id);
          const onSale = p.salePrice && p.salePrice < p.price;
          return (
            <button
              type="button"
              key={p.id}
              disabled={!selected && full}
              onClick={() => onToggle(p.id)}
              className={`text-left rounded-xl border bg-white p-2 transition disabled:opacity-40 ${
                selected ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"
              }`}
            >
              <div className="relative aspect-square rounded-lg bg-[#f6f5f1] overflow-hidden">
                {p.image && (
                  <img src={sameOrigin(p.image)} alt="" loading="lazy" className="w-full h-full object-contain" />
                )}
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#141409] text-[#FDC700] text-xs font-bold grid place-items-center">
                    {selectedIds.indexOf(p.id) + 1}
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs font-semibold leading-snug line-clamp-2">{p.title}</div>
              <div className="text-[11px] text-[#6b6b63] line-clamp-1">{productLine(p)}</div>
              <div className="text-xs mt-0.5">
                {onSale ? (
                  <>
                    <span className="font-bold text-[#E1251B]">{formatMkd(p.salePrice)}</span>{" "}
                    <span className="line-through text-[#6b6b63]">{formatMkd(p.price)}</span>
                  </>
                ) : (
                  <span className="font-bold">{formatMkd(p.price)}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {matches.length > shown.length && (
        <div className="text-xs text-[#6b6b63]">Showing 60 of {matches.length}. Search to narrow down.</div>
      )}
    </div>
  );
}
