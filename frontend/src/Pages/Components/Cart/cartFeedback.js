// Add-to-cart feedback: the product image flies in an arc from the clicked button to the
// header cart icon, then a toast slides in (<CartToaster />).
//
// Triggered from useCart().addToCart on success, so every "add to cart" button gets it.

const FLY_MS = 780;
const POINTER_TTL_MS = 8000; // how long a click position stays valid while the request runs

// ── where the user last clicked (rect captured at click time, before modals close) ──
let lastPointer = null;
if (typeof document !== "undefined") {
  document.addEventListener(
    "pointerdown",
    (event) => {
      const el = event.target instanceof Element ? event.target.closest("button, a") || event.target : null;
      if (!el) return;
      lastPointer = { rect: el.getBoundingClientRect(), at: Date.now() };
    },
    true,
  );
}

// ── toast store (read by CartToaster) ──
let toast = null;
const listeners = new Set();
export const subscribeToast = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getToast = () => toast;
const showToast = (next) => {
  toast = next;
  listeners.forEach((listener) => listener());
};
export const dismissToast = () => showToast(null);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const center = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

const findCartTarget = () => {
  const targets = [...document.querySelectorAll("[data-cart-target]")];
  // The visible one (desktop/mobile headers may both exist).
  return targets.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
};

const fly = (image, from, target) =>
  new Promise((resolve) => {
    const to = center(target.getBoundingClientRect());
    const size = 72;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lift = Math.min(140, Math.max(60, Math.abs(dx) * 0.25)); // arc height

    // Outer element moves horizontally, inner vertically: different easings make a smooth arc.
    const outer = document.createElement("div");
    Object.assign(outer.style, {
      position: "fixed",
      left: `${from.x - size / 2}px`,
      top: `${from.y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      pointerEvents: "none",
      zIndex: 80,
      willChange: "transform",
    });
    const inner = document.createElement("div");
    Object.assign(inner.style, {
      width: "100%",
      height: "100%",
      borderRadius: "16px",
      background: image ? "#fff" : "#FDC700",
      boxShadow: "0 12px 30px -8px rgba(0,0,0,.35)",
      overflow: "hidden",
      willChange: "transform, opacity",
    });
    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "";
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "contain", padding: "6px" });
      inner.appendChild(img);
    }
    outer.appendChild(inner);
    document.body.appendChild(outer);

    outer.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], {
      duration: FLY_MS,
      easing: "cubic-bezier(.45,.05,.55,.95)",
      fill: "forwards",
    });
    const vertical = inner.animate(
      [
        { transform: "translateY(0) scale(.6) rotate(0deg)", opacity: 0, easing: "cubic-bezier(.2,.8,.4,1)" },
        { transform: `translateY(${-lift}px) scale(1) rotate(-6deg)`, opacity: 1, offset: 0.32, easing: "cubic-bezier(.55,0,.85,.4)" },
        { transform: `translateY(${dy}px) scale(.22) rotate(8deg)`, opacity: 0.85 },
      ],
      { duration: FLY_MS, fill: "forwards" },
    );
    vertical.finished.finally(() => {
      outer.remove();
      resolve();
    });
  });

/**
 * Called as soon as an add starts. The fly animation runs right away; `outcome` (a promise
 * resolving to true/false) decides whether the "added" or the "failed" toast follows.
 */
export async function celebrateAddToCart({ product, quantity = 1, outcome = Promise.resolve(true) } = {}) {
  if (typeof document === "undefined") return;
  const image = product?.img || product?.product_Img || product?.image || "";
  const name = product?.name || product?.product_Name || "";
  const id = Date.now();
  const settled = Promise.resolve(outcome).catch(() => false);

  const target = findCartTarget();
  const pointer = lastPointer && Date.now() - lastPointer.at < POINTER_TTL_MS ? lastPointer.rect : null;
  lastPointer = null;

  if (target && !prefersReducedMotion()) {
    const from = pointer
      ? center(pointer)
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    await Promise.all([fly(image, from, target), settled]);
  }

  const ok = await settled;
  showToast(ok ? { id, kind: "added", image, name, quantity } : { id, kind: "error", image, name });
}

/** "Removed" toast with an Undo button. */
export function showRemovedToast({ item, onUndo }) {
  showToast({
    id: Date.now(),
    kind: "removed",
    image: item?.product_Img || "",
    name: item?.product_Name || "",
    quantity: item?.quantity || 1,
    onUndo,
  });
}

export function showCartError() {
  showToast({ id: Date.now(), kind: "error" });
}
