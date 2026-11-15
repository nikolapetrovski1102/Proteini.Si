import { roundMkd } from "./formatPrice.js";

/* Price math for the visitor's referral code (no React, no network), shared by cards, product page and tests. */

/** True when the offer is a percentage off with no minimum, so each product's own price can show it. */
export const showsPerProductPrice = (offer) =>
  Boolean(offer) && offer.discountType === "percentage" && !(Number(offer.minimumOrderAmount) > 0);

export const offerAppliesTo = (offer, productId) =>
  Boolean(offer) &&
  (offer.appliesTo === "all" || (offer.productIds || []).includes(Number(productId)));

/**
 * The price with the visitor's code, or null when the code doesn't change this product's price
 * (another product, a fixed-amount code, a minimum order, or a gift voucher). Same math as checkout:
 * a percentage of the price already shown (sale price included), capped by the code's maximum.
 */
export function referralPrice(offer, { productId, price, isGiftVoucher = false }) {
  const base = Number(price) || 0;
  if (isGiftVoucher || base <= 0 || !showsPerProductPrice(offer) || !offerAppliesTo(offer, productId)) return null;
  let discount = (base * Number(offer.discountValue)) / 100;
  const cap = Number(offer.maximumDiscountAmount);
  if (offer.maximumDiscountAmount != null && cap >= 0) discount = Math.min(discount, cap);
  // Whole denars, rounded up like every price in the shop.
  const final = roundMkd(Math.max(base - discount, 0));
  return final < base ? final : null;
}
