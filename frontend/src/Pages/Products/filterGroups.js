// Shared filter data + selection logic for the desktop sidebar and the mobile sheet.
import { useEffect, useState } from "react";
import { api } from "../../services/api";

const STATUS_ITEMS = ["inStock", "onSale", "newProducts", "bestSellers", "outlet", "upcomingPromotions"].map(
  (id) => ({ id, name: id }),
);

// Both filter components and the header share one request.
const loadFilterOptions = () => api.getShopFilterOptions();

// Categories without listed products are hidden (product_Count comes from usp_Product_GetFilterOptions;
// when it is missing, e.g. an older API, everything shows).
const hasProducts = (cat) => cat.product_Count == null || cat.product_Count > 0;

const toItems = (list = [], prefix) =>
  list.map((row) => ({
    id: row[`${prefix}_Id`],
    name: row[`${prefix}_Name`],
    slug: row[`${prefix}_Slug`],
  }));

function buildGroups(data) {
  const categories = (data.categories || []).filter(hasProducts);
  const childrenByParent = {};
  categories.forEach((cat) => {
    if (cat.parent_Category_Id !== null) {
      (childrenByParent[cat.parent_Category_Id] ||= []).push({
        id: cat.category_Id,
        name: cat.category_Name,
        slug: cat.category_Slug,
      });
    }
  });

  const groups = [
    {
      key: "categoryIds",
      items: categories
        .filter((cat) => cat.parent_Category_Id === null)
        .map((cat) => ({
          id: cat.category_Id,
          name: cat.category_Name,
          slug: cat.category_Slug,
          children: childrenByParent[cat.category_Id] || [],
        })),
    },
    { key: "priceRange", isPrice: true, items: [],
      min: Number(data.priceBounds?.min ?? 0),
      max: Math.max(Number(data.priceBounds?.max ?? 10000), 1000) },
    { key: "status", items: STATUS_ITEMS },
    { key: "brandIds", items: toItems(data.brands, "brand") },
    { key: "goalIds", items: toItems(data.goals, "goal") },
    { key: "sportIds", items: toItems(data.sports, "sport") },
    { key: "useTimingIds", items: toItems(data.useTimings, "useTiming") },
    { key: "flavorIds", items: toItems(data.flavors, "flavor") },
    // Clothing sizes: only offered while a clothing category is picked (see visibleGroups).
    { key: "sizes", apparelOnly: true, items: (data.sizes || []).map((size) => ({ id: size, name: size })) },
    { key: "tagIds", items: toItems(data.tags, "tag") },
  ];

  return {
    groups: groups.filter((g) => g.isPrice || g.items.length > 0),
    parentIds: new Set(
      Object.keys(childrenByParent).map(Number),
    ),
    apparelIds: new Set(categories.filter((cat) => cat.is_Apparel).map((cat) => cat.category_Id)),
  };
}

/** Drops the clothing-size group unless a clothing category (or a size) is selected. */
export function visibleGroups(groups, filters, apparelIds) {
  const apparelPicked =
    (filters?.categoryIds || []).some((id) => apparelIds?.has(id)) || (filters?.sizes || []).length > 0;
  return apparelPicked ? groups : groups.filter((g) => !g.apparelOnly);
}

export function useFilterGroups() {
  const [state, setState] = useState({ groups: [], parentIds: new Set(), apparelIds: new Set(), loading: true });

  useEffect(() => {
    let alive = true;
    loadFilterOptions()
      .then((data) => alive && setState({ ...buildGroups(data), loading: false }))
      .catch((error) => {
        console.error("Error fetching filter options:", error);
        if (alive) setState((s) => ({ ...s, loading: false }));
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function isSelected(filters, key, id) {
  if (!filters) return false;
  if (key === "status") return filters[id] === true;
  return Array.isArray(filters[key]) && filters[key].includes(id);
}

/** Returns a new filters object with `id` toggled in group `key`. Never mutates. */
export function toggleFilter(filters, key, id, parentIds) {
  const next = { ...(filters || {}) };
  const on = !isSelected(filters, key, id);

  if (key === "status") {
    if (on) next[id] = true;
    else delete next[id];
    return next;
  }

  const current = Array.isArray(next[key]) ? next[key] : [];

  // A parent category with subcategories is exclusive: picking it replaces the
  // category selection, and un-picking it drops its subcategories too.
  if (key === "categoryIds" && parentIds?.has(id)) {
    next.categoryIds = on ? [id] : [];
  } else {
    next[key] = on ? [...current, id] : current.filter((v) => v !== id);
  }

  if (next[key].length === 0) delete next[key];
  return next;
}

export function selectedCount(filters, group) {
  if (!filters) return 0;
  if (group.isPrice) return filters.minPrice != null || filters.maxPrice != null ? 1 : 0;
  if (group.key === "status") return group.items.filter((i) => filters[i.id] === true).length;
  return Array.isArray(filters[group.key]) ? filters[group.key].length : 0;
}

export function activeFilterCount(filters, groups) {
  return groups.reduce((sum, g) => sum + selectedCount(filters, g), 0);
}
