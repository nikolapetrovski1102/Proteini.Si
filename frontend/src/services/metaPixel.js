// Meta (Facebook/Instagram) Pixel for catalog ads and retargeting.
// Loaded only when VITE_META_PIXEL_ID is set AND the visitor accepted "Marketing" cookies.
// content_ids MUST match the product feed (/api/feed/products.xml): "v{Variant_Id}" for a
// variant, "p{Product_Id}" for a product without variants — otherwise Meta can't match the
// event to a catalog item. Nothing here may break the shop: every failure is swallowed.

import { hasMarketingConsent } from "./analytics";

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const CURRENCY = "MKD";

let loaded = false;

const isAdminPath = () => /^\/admin([-/]|$)/.test(window.location.pathname);

function load() {
  if (loaded || !PIXEL_ID || navigator.webdriver || !hasMarketingConsent()) return loaded;
  try {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    loaded = true;
  } catch {
    // ignore
  }
  return loaded;
}

function send(event, params, options) {
  if (isAdminPath() || !load()) return;
  try {
    if (options) window.fbq("track", event, params || {}, options);
    else window.fbq("track", event, params || {});
  } catch {
    // ignore
  }
}

export const contentId = (productId, variantId) =>
  variantId ? `v${variantId}` : productId ? `p${productId}` : null;

const amount = (value) => Math.max(0, Math.round(Number(value) || 0));

// Called on every route change (App.jsx). Also loads the pixel right after consent is given.
export function metaPageView() {
  send("PageView");
}

export function initMetaPixelOnConsent() {
  const onConsent = () => {
    if (!loaded && hasMarketingConsent()) metaPageView();
  };
  window.addEventListener("proteini:cookie-consent", onConsent);
  return () => window.removeEventListener("proteini:cookie-consent", onConsent);
}

export function metaViewContent({ productId, variantId, name, price }) {
  const id = contentId(productId, variantId);
  if (!id) return;
  send("ViewContent", {
    content_ids: [id],
    content_type: "product",
    content_name: name || undefined,
    value: amount(price),
    currency: CURRENCY,
  });
}

export function metaAddToCart({ productId, variantId, name, price, quantity = 1 }) {
  const id = contentId(productId, variantId);
  if (!id) return;
  send("AddToCart", {
    content_ids: [id],
    content_type: "product",
    content_name: name || undefined,
    contents: [{ id, quantity: Number(quantity) || 1 }],
    value: amount(price) * (Number(quantity) || 1),
    currency: CURRENCY,
  });
}

const cartContents = (items = []) =>
  items
    .map((item) => ({
      // Cart lines are camel-ish (product_Id), order confirmation lines are PascalCase.
      id: contentId(item.product_Id ?? item.Product_Id, item.variant_Id ?? item.Variant_Id),
      quantity: Number(item.quantity ?? item.Quantity) || 1,
    }))
    .filter((item) => item.id);

export function metaInitiateCheckout(items, total) {
  const contents = cartContents(items);
  if (!contents.length) return;
  send("InitiateCheckout", {
    content_ids: contents.map((c) => c.id),
    content_type: "product",
    contents,
    num_items: contents.reduce((sum, c) => sum + c.quantity, 0),
    value: amount(total),
    currency: CURRENCY,
  });
}

// Fired once per order (card payments land on PaymentSuccess, cash orders in Checkout).
export function metaPurchase(orderId, items, total) {
  const contents = cartContents(items);
  if (!contents.length) return;
  const key = orderId ? `meta-purchase-${orderId}` : null;
  try {
    if (key && sessionStorage.getItem(key)) return;
  } catch {
    // ignore
  }
  send(
    "Purchase",
    {
      content_ids: contents.map((c) => c.id),
      content_type: "product",
      contents,
      num_items: contents.reduce((sum, c) => sum + c.quantity, 0),
      value: amount(total),
      currency: CURRENCY,
    },
    orderId ? { eventID: `order-${orderId}` } : undefined,
  );
  try {
    if (key) sessionStorage.setItem(key, "1");
  } catch {
    // ignore
  }
}
