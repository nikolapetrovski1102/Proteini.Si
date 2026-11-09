// Weight helpers for product variants (shipping uses the cart line weight).

export const parsePackagingWeightGrams = (name) => {
  if (!name) return Number.MAX_SAFE_INTEGER;
  const match = String(name).match(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;

  return match[2].toLowerCase() === "kg" ? value * 1000 : value;
};

export const getVariantWeightGrams = (variant) => {
  const configuredWeight = variant?.weight_Grams ?? variant?.weight_grams;
  if (configuredWeight && Number(configuredWeight) > 0) {
    return Number(configuredWeight);
  }

  return parsePackagingWeightGrams(variant?.packaging_Name);
};

export const getCartWeightGrams = (variant) => {
  const weight = getVariantWeightGrams(variant);
  return Number.isFinite(weight) && weight > 0 && weight < Number.MAX_SAFE_INTEGER
    ? weight
    : null;
};
