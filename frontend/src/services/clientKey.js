const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENT_KEY = import.meta.env.VITE_API_CLIENT_KEY;

const isApiRequest = (input) => {
  const url = input instanceof Request ? input.url : String(input);
  return Boolean(API_BASE_URL) && url.startsWith(API_BASE_URL);
};

// Identical GET requests that are already on the way share one network call.
// This removes duplicates caused by several components (or StrictMode) asking
// for the same data at the same time. Nothing is cached after the response arrives.
const inflightGets = new Map();

const getDedupeKey = (input, init, headers) => {
  if (input instanceof Request) return null;
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" || init.signal || init.body) return null;
  return `${String(input)}|${headers.get("Authorization") || ""}`;
};

export function installClientKey() {
  if (!API_BASE_URL || window.__proteiniFetchInstalled) return;
  window.__proteiniFetchInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    if (!isApiRequest(input)) return originalFetch(input, init);

    const headers = new Headers(
      init.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    if (CLIENT_KEY) headers.set("X-Api-Key", CLIENT_KEY);

    const key = getDedupeKey(input, init, headers);
    if (!key) return originalFetch(input, { ...init, headers });

    let shared = inflightGets.get(key);
    if (!shared) {
      shared = originalFetch(input, { ...init, headers }).finally(() => {
        inflightGets.delete(key);
      });
      inflightGets.set(key, shared);
    }

    // Each caller gets its own copy of the body.
    return shared.then((response) => response.clone());
  };
}
