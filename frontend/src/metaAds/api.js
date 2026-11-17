// Meta ads dashboard API client. Same origin as the page (nginx proxies /api/meta-ads to the shop API), so the
// HttpOnly session cookie travels automatically and nothing secret is ever readable from JavaScript.
const BASE = "/api/meta-ads";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

async function request(path, { method = "GET", body, form } = {}) {
  const init = { method, credentials: "same-origin", headers: { Accept: "application/json" } };
  if (form) init.body = form;
  else if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError("No connection to the server.", 0, null);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) onUnauthorized();
    const message =
      data?.message || data?.title || (response.status === 429 ? "Too many attempts. Wait a few minutes." : `Request failed (${response.status}).`);
    throw new ApiError(message, response.status, data);
  }
  return data;
}

export const api = {
  authOptions: () => request("/auth/options"),
  me: () => request("/auth/me"),
  startDuo: (email, turnstileToken) => request("/auth/duo", { method: "POST", body: { email, turnstileToken } }),
  sendCode: (email, turnstileToken) =>
    request("/auth/email-code", { method: "POST", body: { email, turnstileToken } }),
  verifyCode: (email, code) => request("/auth/email-code/verify", { method: "POST", body: { email, code } }),
  logout: () => request("/auth/logout", { method: "POST" }),

  status: () => request("/status"),
  products: () => request("/products"),
  adSets: () => request("/adsets"),
  ads: (limit = 25) => request(`/ads?limit=${limit}`),
  setAdStatus: (id, status) => request(`/ads/${encodeURIComponent(id)}/status`, { method: "POST", body: { status } }),
  uploadImage: (blob, name) => {
    const form = new FormData();
    form.append("file", blob, name);
    return request("/images", { method: "POST", form });
  },
  preview: (payload) => request("/preview", { method: "POST", body: payload }),
  publish: (payload) => request("/publish", { method: "POST", body: payload }),
};
