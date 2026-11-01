import test from "node:test";
import assert from "node:assert/strict";
import { formatSaleEndDate, isSaleActive } from "../src/utils/salePricing.js";

test("sale remains active through the configured end date", () => {
  const product = { productsOnSale: true, saleEndDate: "2026-10-02" };
  assert.equal(isSaleActive(product, new Date(2026, 9, 2, 23, 59, 59)), true);
});

test("sale is inactive after the configured end date", () => {
  const product = { productsOnSale: true, saleEndDate: "2026-10-02" };
  assert.equal(isSaleActive(product, new Date(2026, 9, 3, 0, 0, 0)), false);
});

test("sale without an end date stays active while enabled", () => {
  assert.equal(isSaleActive({ ProductsOnSale: true }), true);
  assert.equal(isSaleActive({ ProductsOnSale: false }), false);
});

test("sale date formatting accepts API date-time values", () => {
  assert.ok(
    formatSaleEndDate({ SaleEndDate: "2026-10-15T00:00:00" }, "en-GB").includes("15"),
  );
});
