import test from "node:test";
import assert from "node:assert/strict";

import { getDeclaredDeliveryFees } from "../src/utils/deliveryPricing.js";

test("card orders under 3000 MKD use only the declared 165 MKD delivery fee", () => {
  assert.deepEqual(getDeclaredDeliveryFees(830, "credit_card"), {
    deliveryFee: 165,
    cashOnDeliveryFee: 0,
    totalDeliveryFee: 165,
  });
});

test("cash-on-delivery orders under 3000 MKD add the declared 30 MKD fee", () => {
  assert.deepEqual(getDeclaredDeliveryFees(830, "home_delivery"), {
    deliveryFee: 165,
    cashOnDeliveryFee: 30,
    totalDeliveryFee: 195,
  });
});

test("orders from 3000 MKD have no delivery or cash-on-delivery fee", () => {
  assert.deepEqual(getDeclaredDeliveryFees(3000, "home_delivery"), {
    deliveryFee: 0,
    cashOnDeliveryFee: 0,
    totalDeliveryFee: 0,
  });
});

test("admin-configured delivery values are used consistently", () => {
  const settings = {
    flatDeliveryFee: 200,
    cashOnDeliveryFee: 40,
    freeDeliveryThreshold: 4000,
  };
  assert.deepEqual(getDeclaredDeliveryFees(3500, "home_delivery", settings), {
    deliveryFee: 200,
    cashOnDeliveryFee: 40,
    totalDeliveryFee: 240,
  });
  assert.deepEqual(getDeclaredDeliveryFees(4000, "home_delivery", settings), {
    deliveryFee: 0,
    cashOnDeliveryFee: 0,
    totalDeliveryFee: 0,
  });
});
