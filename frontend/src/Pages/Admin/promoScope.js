/* "Applies to" helpers for promo codes and affiliate codes: all products, specific products or categories. */

export const emptyScope = { appliesTo: "all", productIds: [], categoryIds: [] };

export const scopeFromCode = (code) => ({
  appliesTo: code?.appliesTo || "all",
  productIds: code?.productIds || [],
  categoryIds: code?.categoryIds || [],
});

/** The scope part of a save request. */
export const scopePayload = (scope) => ({
  appliesTo: scope.appliesTo || "all",
  productIds: scope.appliesTo === "products" ? scope.productIds : [],
  categoryIds: scope.appliesTo === "categories" ? scope.categoryIds : [],
});

/** Returns an error message, or null when the scope can be saved. */
export const scopeError = (scope) => {
  if (scope.appliesTo === "products" && !scope.productIds.length) return "Choose at least one product, or make the code apply to all products.";
  if (scope.appliesTo === "categories" && !scope.categoryIds.length) return "Choose at least one category, or make the code apply to all products.";
  return null;
};

export const productName = (products, id) => products.find((p) => p.product_Id === id)?.name || `Product #${id}`;
export const categoryName = (categories, id) => categories.find((c) => c.category_Id === id)?.category_Name || `Category #${id}`;

/** Short text for code lists, e.g. "2 products: Whey, Creatine". */
export function scopeSummary(code, products = [], categories = []) {
  const { appliesTo, productIds, categoryIds } = scopeFromCode(code);
  const list = (names) => (names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", "));
  if (appliesTo === "products") {
    const names = productIds.map((id) => productName(products, id));
    return `${names.length} product${names.length === 1 ? "" : "s"}: ${list(names)}`;
  }
  if (appliesTo === "categories") return `Categories: ${list(categoryIds.map((id) => categoryName(categories, id)))}`;
  return "All products";
}
