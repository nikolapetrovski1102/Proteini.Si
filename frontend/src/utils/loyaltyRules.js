// Loyalty redemption rules set by the admin (Delivery & payment settings). Mirrors OrderService on the API:
//  * the user needs at least `loyaltyMinBalance` points before any can be used;
//  * the order value after the promo code picks the highest tier reached, which caps the points usable;
//  * never more than half the order value.
// The API is the source of truth and clamps whatever is sent.

export const DEFAULT_LOYALTY_TIERS = [
  { minOrder: 1500, maxPoints: 100 },
  { minOrder: 3000, maxPoints: 300 },
  { minOrder: 5000, maxPoints: 500 },
];
export const DEFAULT_LOYALTY_MIN_BALANCE = 100;

export function loyaltyTiers(settings) {
  let tiers = settings?.redeemTiers;
  if (!Array.isArray(tiers) && typeof settings?.loyaltyRedeemTiers === "string") {
    try {
      tiers = JSON.parse(settings.loyaltyRedeemTiers);
    } catch {
      tiers = null;
    }
  }
  if (!Array.isArray(tiers)) return DEFAULT_LOYALTY_TIERS;
  return tiers
    .map((t) => ({ minOrder: Number(t.minOrder) || 0, maxPoints: Number(t.maxPoints) || 0 }))
    .filter((t) => t.minOrder >= 0 && t.maxPoints > 0)
    .sort((a, b) => a.minOrder - b.minOrder);
}

export function loyaltyMinBalance(settings) {
  const value = Number(settings?.loyaltyMinBalance);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_LOYALTY_MIN_BALANCE;
}

/** Most points usable on an order worth `orderValue` (after promo code) with `available` points. */
export function maxRedeemablePoints(settings, orderValue, available) {
  const points = Math.floor(Number(available) || 0);
  const value = Math.max(Number(orderValue) || 0, 0);
  if (points <= 0 || points < loyaltyMinBalance(settings)) return 0;
  const tierCap = loyaltyTiers(settings)
    .filter((t) => value >= t.minOrder)
    .reduce((max, t) => Math.max(max, t.maxPoints), 0);
  return Math.max(Math.min(points, tierCap, Math.floor(value * 0.5)), 0);
}

/**
 * The next tier that would let the user use more points than now, or null.
 * Returns { remaining, points }: spend `remaining` more to be able to use `points`.
 */
export function nextLoyaltyUnlock(settings, orderValue, available) {
  const points = Math.floor(Number(available) || 0);
  if (points <= 0 || points < loyaltyMinBalance(settings)) return null;
  const value = Math.max(Number(orderValue) || 0, 0);
  const now = maxRedeemablePoints(settings, value, points);
  const next = loyaltyTiers(settings).find(
    (t) => t.minOrder > value && Math.min(points, t.maxPoints, Math.floor(t.minOrder * 0.5)) > now,
  );
  if (!next) return null;
  return {
    remaining: Math.ceil(next.minOrder - value),
    points: Math.min(points, next.maxPoints, Math.floor(next.minOrder * 0.5)),
  };
}
