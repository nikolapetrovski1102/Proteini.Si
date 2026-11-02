export const FREE_DELIVERY_THRESHOLD = 3000;
export const DECLARED_DELIVERY_FEE = 165;
export const DECLARED_CASH_ON_DELIVERY_FEE = 30;

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

  if (normalizedSubtotal >= freeDeliveryThreshold) {
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
