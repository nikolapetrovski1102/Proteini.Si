import test from "node:test";
import assert from "node:assert/strict";
import { referralPrice, showsPerProductPrice } from "../src/utils/referralPricing.js";

const offer = (extra = {}) => ({
  code: "MARKO10",
  discountType: "percentage",
  discountValue: 10,
  minimumOrderAmount: 0,
  maximumDiscountAmount: null,
  appliesTo: "all",
  productIds: [],
  ...extra,
});

test("percentage code takes its share off the shown price", () => {
  assert.equal(referralPrice(offer(), { productId: 1, price: 1990 }), 1791);
});

test("maximum discount caps the price drop", () => {
  assert.equal(referralPrice(offer({ maximumDiscountAmount: 100 }), { productId: 1, price: 1990 }), 1890);
});

test("scoped code only changes its own products", () => {
  const scoped = offer({ appliesTo: "products", productIds: [7] });
  assert.equal(referralPrice(scoped, { productId: 7, price: 1000 }), 900);
  assert.equal(referralPrice(scoped, { productId: 8, price: 1000 }), null);
});

test("fixed, minimum-order and voucher cases keep the normal price", () => {
  assert.equal(showsPerProductPrice(offer({ discountType: "fixed" })), false);
  assert.equal(referralPrice(offer({ minimumOrderAmount: 2000 }), { productId: 1, price: 1000 }), null);
  assert.equal(referralPrice(offer(), { productId: 1, price: 1000, isGiftVoucher: true }), null);
  assert.equal(referralPrice(null, { productId: 1, price: 1000 }), null);
});
