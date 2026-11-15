/**
 * Prices are whole denars, always rounded up: no decimals, and a dot between thousands from 1.000 up
 * ("899 MKD", "1.299 MKD", "12.450 MKD"). A price after a discount is rounded up too, so 1.169,10 → 1.170.
 */
export const roundMkd = (value) => {
  const number = Number(value) || 0;
  // The tiny margin keeps float noise (1169.0000000002) from adding a whole denar.
  return Math.sign(number) * Math.ceil(Math.abs(number) - 1e-6);
};

export const formatAmount = (value) =>
  String(Math.abs(roundMkd(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Plain-text price for sentences and attributes: "2.290 MKD". In layouts use the <Price> component. */
export const formatMkd = (value) => `${roundMkd(value) < 0 ? "− " : ""}${formatAmount(value)} MKD`;

/**
 * Rounding row for an order summary: each shown row is rounded on its own, so the difference
 * between the rounded total and the sum of the shown rows is listed instead of hidden.
 * `rows` are signed amounts (discounts negative). Returns 0 when the shown rows already add up.
 */
export const roundingDifference = (rows, total) =>
  roundMkd(total) - rows.reduce((sum, row) => sum + roundMkd(row), 0);
