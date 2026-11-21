// Pieces per pack for capsule/tablet products ("90 капсули"), stored on the variant as Unit_Count + Unit_Form.
// The form is a fixed key so every language gets its own word (translation keys unit_<form>).

export const UNIT_FORMS = [
  { value: "capsules", label: "Capsules" },
  { value: "softgels", label: "Softgels" },
  { value: "tablets", label: "Tablets" },
  { value: "chewables", label: "Chewable tablets" },
  { value: "effervescent", label: "Effervescent tablets" },
  { value: "gummies", label: "Gummies" },
];

const FORM_KEYS = new Set(UNIT_FORMS.map((form) => form.value));

/** Reads the count/form from a variant (unit_Count) or a listing card (variantUnitCount). */
export const getUnitCount = (source) => {
  const count = Number(source?.unit_Count ?? source?.Unit_Count ?? source?.variantUnitCount);
  if (!Number.isInteger(count) || count <= 0) return null;
  const rawForm = String(source?.unit_Form ?? source?.Unit_Form ?? source?.variantUnitForm ?? "").toLowerCase();
  return { count, form: FORM_KEYS.has(rawForm) ? rawForm : "capsules" };
};

/** "90 капсули" in the shopper's language, or "" when the variant has no pill count. */
export const formatUnitCount = (source, translate) => {
  const units = getUnitCount(source);
  return units ? `${units.count} ${translate(`unit_${units.form}`)}` : "";
};

/** Admin text (English, no translate): "90 capsules". */
export const formatUnitCountAdmin = (source) => {
  const units = getUnitCount(source);
  if (!units) return "";
  const label = UNIT_FORMS.find((form) => form.value === units.form)?.label || "Capsules";
  return `${units.count} ${label.toLowerCase()}`;
};

// "90 капсули", "120 caps", "100 меки капсули": a pill count typed into the flavour. Most specific words first.
const PILL_WORDS = [
  ["меки капсули", "softgels"],
  ["таблети за џвакање", "chewables"],
  ["шумливи таблети", "effervescent"],
  ["гумени бонбони", "gummies"],
  ["капсули|капсула|kapsula|kapsul[eë]|capsules?|caps", "capsules"],
  ["softgels?", "softgels"],
  ["таблети|таблета|tableta|tablets?|tabs", "tablets"],
  ["gummies", "gummies"],
].map(([words, form]) => [new RegExp(`^\\s*(\\d{1,5})\\s*(?:${words})\\s*\\.?\\s*$`, "i"), form]);

/** Reads "60 капсули" as { count: 60, form: "capsules" }; null for a real flavour. */
export const parsePillCount = (text) => {
  const value = String(text || "");
  for (const [pattern, form] of PILL_WORDS) {
    const match = value.match(pattern);
    if (match && Number(match[1]) > 0) return { count: Number(match[1]), form };
  }
  return null;
};

/**
 * The pill count is never a flavour (2026-11-21, user): a variant whose flavour is only "60 капсули" loses the
 * flavour, and the number becomes its pill count when it has none. Applied to the product payload as it loads.
 */
export const movePillCountOutOfFlavor = (variant) => {
  const pills = parsePillCount(variant?.flavor_Name);
  if (!pills) return variant;
  return {
    ...variant,
    flavor_Name: null,
    flavor_Id: null,
    unit_Count: getUnitCount(variant) ? variant.unit_Count : pills.count,
    unit_Form: getUnitCount(variant) ? variant.unit_Form : pills.form,
  };
};

/** Same, for a whole product payload ({ product, variants }). */
export const withPillCountsOutOfFlavor = (data) =>
  data && Array.isArray(data.variants) ? { ...data, variants: data.variants.map(movePillCountOutOfFlavor) } : data;

/**
 * Size label shoppers see. Pill products show only the count ("90 капсули"): the pack weight means nothing to
 * someone buying capsules (2026-11-21, user). Everything else keeps its size; a bare decimal like "115.29" is a
 * weight typed without a unit, so it gets "g".
 */
export const formatPackagingLabel = (packagingName, source, translate) => {
  const units = getUnitCount(source);
  if (units) return formatUnitCount(source, translate);
  const raw = String(packagingName || "").trim();
  return /^\d+[.,]\d+$/.test(raw) ? `${raw}g` : raw;
};
