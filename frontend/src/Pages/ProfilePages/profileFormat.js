export { formatMkd as formatPrice } from "../../utils/formatPrice";

const LOCALES = { mk: "mk-MK", al: "sq-AL" };

export const formatDate = (value, language, withTime = false) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(LOCALES[language] || "mk-MK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};
