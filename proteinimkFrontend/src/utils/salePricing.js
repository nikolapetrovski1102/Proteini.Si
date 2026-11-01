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
