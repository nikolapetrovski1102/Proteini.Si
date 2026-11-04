const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CLIENT_KEY = import.meta.env.VITE_API_CLIENT_KEY;

const isApiRequest = (input) => {
  const url = input instanceof Request ? input.url : String(input);
  return url.startsWith(API_BASE_URL);
};

export function installClientKey() {
  if (!CLIENT_KEY || !API_BASE_URL) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    if (!isApiRequest(input)) return originalFetch(input, init);

    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set("X-Api-Key", CLIENT_KEY);
    return originalFetch(input, { ...init, headers });
  };
}
