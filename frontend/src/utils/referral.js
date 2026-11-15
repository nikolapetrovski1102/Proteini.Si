/*
 * Affiliate / influencer code that came in through a link (?code=MARKO10 or /r/<slug>).
 * Kept for 30 days and applied automatically at checkout. Storage can be unavailable
 * (private mode, blocked site data), so every access is guarded.
 */
const KEY = "proteini_referral_code";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_PATTERN = /^[A-Z0-9_-]{2,50}$/;
/** Fired on window whenever the remembered code changes, so prices in the shop follow it. */
export const REFERRAL_EVENT = "proteini:referral-code";
const announce = () => {
  try {
    window.dispatchEvent(new Event(REFERRAL_EVENT));
  } catch {
    /* no window (tests) */
  }
};

export const normalizeReferralCode = (value) => {
  const code = String(value || "").trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
};

export function saveReferralCode(value) {
  const code = normalizeReferralCode(value);
  if (!code) return null;
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, savedAt: Date.now() }));
  } catch {
    /* storage unavailable */
  }
  announce();
  return code;
}

export function getReferralCode() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, savedAt } = JSON.parse(raw);
    if (!code || !savedAt || Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return normalizeReferralCode(code);
  } catch {
    return null;
  }
}

export function clearReferralCode() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
  announce();
}

/** Only same-site paths are followed ("/", "/product/12"), never "//host" or "https://…". */
export const isSafeSitePath = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");

export const REFERRAL_PARAMS = ["code", "ref", "promo"];
