export const FREE_DELIVERY_THRESHOLD = 3000;
export const DECLARED_DELIVERY_FEE = 165;
export const DECLARED_CASH_ON_DELIVERY_FEE = 30;

/**
 * Value of the cart items that are actually delivered. Gift vouchers are sent by email, so they never
 * cost delivery and do not count towards free delivery. Mirrors the shippable subtotal in OrderService.
 */
export const getShippableSubtotal = (total, items = []) => {
  const voucherTotal = items
    .filter((item) => item?.isGiftVoucher)
    .reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  return Math.max((Number(total) || 0) - voucherTotal, 0);
};

/** Delivery fees for the shippable subtotal (see getShippableSubtotal); nothing to deliver means no fee. */
export const getDeclaredDeliveryFees = (subtotal, paymentMethod, settings = {}) => {
  const normalizedSubtotal = Number(subtotal) || 0;
  const freeDeliveryThreshold = Number(
    settings.freeDeliveryThreshold ?? settings.FreeDeliveryThreshold ?? FREE_DELIVERY_THRESHOLD,
  );
  const flatDeliveryFee = Number(
    settings.flatDeliveryFee ?? settings.FlatDeliveryFee ?? DECLARED_DELIVERY_FEE,
  );
  const declaredCashOnDeliveryFee = Number(
    settings.cashOnDeliveryFee ??
      settings.CashOnDeliveryFee ??
      DECLARED_CASH_ON_DELIVERY_FEE,
  );

  if (normalizedSubtotal <= 0 || normalizedSubtotal >= freeDeliveryThreshold) {
    return {
      deliveryFee: 0,
      cashOnDeliveryFee: 0,
      totalDeliveryFee: 0,
    };
  }

  const cashOnDeliveryFee =
    paymentMethod === "home_delivery"
      ? declaredCashOnDeliveryFee
      : 0;

  return {
    deliveryFee: flatDeliveryFee,
    cashOnDeliveryFee,
    totalDeliveryFee: flatDeliveryFee + cashOnDeliveryFee,
  };
};

export const COURIER_COD_DEFAULTS = { threshold: 3000, fixedFee: 30, percent: 1.6 };

// Commission the courier charges the buyer directly for collecting cash on delivery
// (not part of our order total): a fixed fee up to the threshold, a percentage above it.
// Mirrors ShippingSettings.CourierCodCommission on the backend.
export const getCourierCodCommission = (amount, settings = {}) => {
  const pick = (camel, pascal, fallback) => {
    const value = Number(settings[camel] ?? settings[pascal]);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  const threshold = pick("courierCodThreshold", "CourierCodThreshold", COURIER_COD_DEFAULTS.threshold);
  const fixedFee = pick("courierCodFixedFee", "CourierCodFixedFee", COURIER_COD_DEFAULTS.fixedFee);
  const percent = pick("courierCodPercent", "CourierCodPercent", COURIER_COD_DEFAULTS.percent);
  const normalizedAmount = Number(amount) || 0;
  const commission =
    normalizedAmount <= threshold
      ? fixedFee
      : Math.round(normalizedAmount * percent) / 100;
  return { threshold, fixedFee, percent, commission };
};
