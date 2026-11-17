const read = (product, camelKey, pascalKey) =>
  product?.[camelKey] ?? product?.[pascalKey];

export const getSaleEndDate = (product) =>
  read(product, "saleEndDate", "SaleEndDate") || null;

export const isSaleActive = (product, now = new Date()) => {
  const enabled = Boolean(read(product, "productsOnSale", "ProductsOnSale"));
  if (!enabled) return false;

  const rawEndDate = getSaleEndDate(product);
  if (!rawEndDate) return true;

  const [year, month, day] = String(rawEndDate)
    .slice(0, 10)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return false;

  const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  return endDate >= now;
};

export const formatSaleEndDate = (product, locale = "mk-MK") => {
  const rawEndDate = getSaleEndDate(product);
  if (!rawEndDate) return "";

  const [year, month, day] = String(rawEndDate)
    .slice(0, 10)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day).toLocaleDateString(locale);
};

/**
 * The shop filter returns one row per packaging. Keep one card per product, in the order products first
 * appear, using the row with the biggest active sale (so a partly discounted product shows its sale).
 */
export const onePerProduct = (rows = []) => {
  const saving = (row) => {
    const regular = Number(row.price) || 0;
    const sale = isSaleActive(row) ? Number(row.compare_Price) || 0 : 0;
    return sale > 0 && sale < regular ? (regular - sale) / regular : 0;
  };
  const best = new Map();
  rows.forEach((row) => {
    const current = best.get(row.product_Id);
    if (!current || saving(row) > saving(current)) best.set(row.product_Id, row);
  });
  return [...best.values()];
};

/**
 * Products the admin marked "recommended for you", one card per product. Filtered on the server, so the page
 * no longer downloads the whole catalogue (with descriptions) just to pick these out.
 */
export const fetchRecommendedCards = async (api) => {
  // The API returns at most 100 rows (one per packaging) per page; read the remaining pages too.
  const query = { recommendedForYou: true, sortBy: "priority", sortOrder: "ASC", pageSize: 100 };
  const first = await api.getFilteredProducts({ ...query, page: 1 });
  const pages = Math.min(Number(first.totalPages) || 1, 5);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => api.getFilteredProducts({ ...query, page: i + 2 })),
  );
  return onePerProduct([first, ...rest].flatMap((data) => data.products || []));
};

/**
 * Whole-number "% off" for a sale price. Rounded like usual, but never higher than the real discount: the
 * percentage is lowered until the regular price minus that % (rounded up to whole denars) is not below the sale
 * price. 1690 → 1352 shows 20%, 1690 → 1360 shows 19% (not 20%).
 */
export const discountPercent = (regular, sale) => {
  const r = Number(regular);
  const s = Number(sale);
  if (!(r > 0 && s > 0 && s < r)) return 0;
  const shown = Math.ceil(s - 1e-6);
  let pct = Math.round(((r - s) / r) * 100);
  while (pct > 0 && Math.ceil((r * (100 - pct)) / 100 - 1e-6) < shown) pct -= 1;
  return pct;
};
