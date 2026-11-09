// Data helpers shared by useQuickPurchase and QuickPurchaseSheet.
import { api } from "../../../services/api";

export const parentIdOf = (product) => product?.parent_Product_Id || product?.product_Id;
export const needsVariantChoice = (product) =>
  Boolean(product?.hasVariants || product?.isVariant || product?.variant_Id);

// ── product details cache: opening the sheet twice (or after a hover prefetch) is instant ──
// Entries expire so stock shown in the sheet stays reasonably fresh.
const CACHE_TTL_MS = 2 * 60 * 1000;
const detailsCache = new Map(); // parentId -> { at, promise }
export const loadDetails = (parentId) => {
  const cached = detailsCache.get(parentId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.promise;

  const promise = api.getProductById(parentId).catch((error) => {
    detailsCache.delete(parentId);
    throw error;
  });
  detailsCache.set(parentId, { at: Date.now(), promise });
  return promise;
};

export const effectivePrice = (item, saleActive) =>
  saleActive && item?.compare_Price > 0 && item.compare_Price < item.price
    ? item.compare_Price
    : Number(item?.price) || 0;
