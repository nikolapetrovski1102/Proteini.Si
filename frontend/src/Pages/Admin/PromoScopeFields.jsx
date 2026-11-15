import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { Badge, SearchInput, Segmented } from "./AdminKit";
import { categoryName, productName, scopeFromCode, scopeSummary } from "./promoScope";

/* "Applies to" for promo codes and affiliate codes: all products, specific products or categories. */

export function ScopeBadge({ code, products, categories, className = "" }) {
  if (!code?.appliesTo || code.appliesTo === "all") return null;
  return (
    <Badge tone="yellow" className={`max-w-[260px] truncate ${className}`}>
      {scopeSummary(code, products, categories)}
    </Badge>
  );
}

const toggleId = (ids, id) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

function Chips({ ids, nameOf, onRemove }) {
  if (!ids.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#141409] py-1 pl-3 pr-1.5 text-xs font-bold text-white">
          <span className="truncate">{nameOf(id)}</span>
          <button type="button" onClick={() => onRemove(id)} aria-label={`Remove ${nameOf(id)}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-white/20">
            <FiX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}

function CheckRow({ checked, onChange, children, depth = 0 }) {
  return (
    <label
      className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-gray-800 hover:bg-black/[0.03]"
      style={{ paddingLeft: 12 + depth * 20 }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-[#141409]" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </label>
  );
}

/**
 * value: { appliesTo, productIds, categoryIds }; onChange receives the next value.
 * products: rows from api.getProducts(); categories: rows from api.getAdminCategories().
 */
export default function PromoScopeFields({ value, onChange, products = [], categories = [] }) {
  const [search, setSearch] = useState("");
  const scope = scopeFromCode(value);
  const set = (patch) => onChange({ ...scope, ...patch });

  const matchingProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = term ? products.filter((p) => (p.name || "").toLowerCase().includes(term) || String(p.product_Id) === term) : products;
    return rows.slice(0, 200);
  }, [products, search]);

  // Parents first, each followed by its subcategories.
  const categoryTree = useMemo(() => {
    const known = new Set(categories.map((c) => c.category_Id));
    const byOrder = (a, b) => (a.display_Order || 0) - (b.display_Order || 0) || (a.category_Name || "").localeCompare(b.category_Name || "");
    const rows = [];
    const visit = (parentId, depth) => {
      categories
        .filter((c) => (parentId == null ? !c.parent_Category_Id || !known.has(c.parent_Category_Id) : c.parent_Category_Id === parentId))
        .sort(byOrder)
        .forEach((c) => {
          rows.push({ ...c, depth });
          if (depth < 6) visit(c.category_Id, depth + 1);
        });
    };
    visit(null, 0);
    return rows;
  }, [categories]);

  return (
    <div className="space-y-3">
      <Segmented
        value={scope.appliesTo}
        onChange={(appliesTo) => {
          setSearch("");
          set({ appliesTo });
        }}
        options={[
          { value: "all", label: "All products" },
          { value: "products", label: "Products" },
          { value: "categories", label: "Categories" },
        ]}
      />

      {scope.appliesTo === "all" && <p className="text-sm text-gray-500">The discount applies to everything in the cart.</p>}

      {scope.appliesTo === "products" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Only these products get the discount. Other items in the cart stay full price.</p>
          <Chips ids={scope.productIds} nameOf={(id) => productName(products, id)} onRemove={(id) => set({ productIds: toggleId(scope.productIds, id) })} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search products…" label="Search products" />
          <div className="max-h-60 overflow-y-auto rounded-xl ring-1 ring-black/[0.08]">
            {matchingProducts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No products found.</p>
            ) : (
              matchingProducts.map((p) => (
                <CheckRow key={p.product_Id} checked={scope.productIds.includes(p.product_Id)} onChange={() => set({ productIds: toggleId(scope.productIds, p.product_Id) })}>
                  {p.name}
                </CheckRow>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500">{scope.productIds.length} selected</p>
        </div>
      )}

      {scope.appliesTo === "categories" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Products in these categories (and their subcategories) get the discount. Other items stay full price.</p>
          <Chips ids={scope.categoryIds} nameOf={(id) => categoryName(categories, id)} onRemove={(id) => set({ categoryIds: toggleId(scope.categoryIds, id) })} />
          <div className="max-h-60 overflow-y-auto rounded-xl ring-1 ring-black/[0.08]">
            {categoryTree.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No categories yet.</p>
            ) : (
              categoryTree.map((c) => (
                <CheckRow key={c.category_Id} depth={c.depth} checked={scope.categoryIds.includes(c.category_Id)} onChange={() => set({ categoryIds: toggleId(scope.categoryIds, c.category_Id) })}>
                  {c.category_Name}
                </CheckRow>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
