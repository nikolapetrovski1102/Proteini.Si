import { formatAmount, roundMkd } from "../../utils/formatPrice";

/**
 * A price as the shop shows it: the whole-denar amount, then a smaller "MKD" ("2.290 MKD").
 * Size, weight and color come from the parent, so it fits a card, a cart row or the product page;
 * the currency is half the amount's size and keeps a regular weight.
 */
export default function Price({ value, className = "", currencyClassName = "" }) {
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap tabular-nums ${className}`}>
      {roundMkd(value) < 0 && "− "}
      {formatAmount(value)}
      <small className={`ml-[0.3em] text-[0.5em] font-medium tracking-normal ${currencyClassName}`}>MKD</small>
    </span>
  );
}
