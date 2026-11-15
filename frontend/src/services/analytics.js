// First-party storefront analytics for the daily report (POST /api/Analytics/event).
// A random visitor id is kept in localStorage so a returning browser counts once per day.
// Nothing here may break the shop: every failure is swallowed.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENT_KEY = import.meta.env.VITE_API_CLIENT_KEY;
const VISITOR_KEY = "visitorId";

let firstPageView = true;
let lastPath = null;

const randomId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const visitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id)) {
      id = randomId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

export function track(type, extra = {}) {
  if (!API_BASE_URL || navigator.webdriver) return;
  try {
    const id = visitorId();
    if (!id) return;

    const headers = { "Content-Type": "application/json" };
    if (CLIENT_KEY) headers["X-Api-Key"] = CLIENT_KEY;
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/Analytics/event`, {
      method: "POST",
      headers,
      keepalive: true,
      body: JSON.stringify({
        visitorId: id,
        type,
        path: window.location.pathname,
        ...extra,
      }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

// Called on every route change; the referrer is only meaningful on the first load.
export function trackPageView(pathname) {
  if (pathname === lastPath) return;
  lastPath = pathname;
  if (/^\/admin([-/]|$)/.test(pathname)) return;
  const referrer = firstPageView ? document.referrer || null : null;
  firstPageView = false;
  track("page_view", { path: pathname, referrer });
}

// ---- Marketing consent ----------------------------------------------------------------------
// The cookie banner's "Marketing" choice also decides whether we may email offers. For signed-in
// visitors it is sent to the API (once per choice) so it is tied to the account email.

const COOKIE_CONSENT_KEY = "proteini-cookie-consent-v1";
const CONSENT_SYNC_KEY = "proteini-marketing-consent-synced";

export function readCookieConsent() {
  try {
    return JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) || "null");
  } catch {
    return null;
  }
}

export const hasMarketingConsent = () => Boolean(readCookieConsent()?.marketing);

export function syncMarketingConsent(userKey) {
  if (!API_BASE_URL || !userKey) return;
  try {
    const token = localStorage.getItem("token");
    const consent = readCookieConsent();
    if (!token || !consent) return;

    const stamp = `${userKey}|${consent.savedAt || ""}|${consent.marketing ? 1 : 0}`;
    if (localStorage.getItem(CONSENT_SYNC_KEY) === stamp) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (CLIENT_KEY) headers["X-Api-Key"] = CLIENT_KEY;

    fetch(`${API_BASE_URL}/Marketing/consent`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        marketing: Boolean(consent.marketing),
        consentGivenAt: consent.savedAt || null,
      }),
    })
      .then((response) => {
        if (response.ok) localStorage.setItem(CONSENT_SYNC_KEY, stamp);
      })
      .catch(() => {});
  } catch {
    // ignore
  }
}
