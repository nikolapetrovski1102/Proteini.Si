import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Full-screen brand loader.
 *
 * Any component can render <BrandLoader /> (or <PageLoader />) while it loads. It does not draw
 * a loader itself: it registers with one global <BrandLoaderOverlay /> (mounted once in App),
 * which shows a full-screen pale-yellow overlay with a randomly picked animation (shaker or
 * creatine scoop) for as long as at least one loader is registered.
 *
 *  - appears only after a short delay, so fast loads don't flash it
 *  - once shown, stays for a minimum time, then fades out smoothly
 *  - several loaders at once (e.g. the home page sections) share the same overlay
 */

const SOURCES = {
  shaker: { src: "/loaders/shaker.svg", ratio: 200 / 260 },
  scoop: { src: "/loaders/scoop.svg", ratio: 262 / 270 },
};
const VARIANTS = Object.keys(SOURCES);

const SHOW_DELAY_MS = 120; // don't show at all for loads faster than this
const MIN_VISIBLE_MS = 200; // once visible, stay at least this long
const FADE_MS = 150; // keep in sync with .brand-overlay transition in index.css

// Preload both so the animation is ready the moment the overlay appears.
if (typeof window !== "undefined") {
  Object.values(SOURCES).forEach(({ src }) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}

// ── tiny global store: number of active loaders ──
let activeCount = 0;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getCount = () => activeCount;

function useRegisterLoader() {
  useEffect(() => {
    activeCount += 1;
    emit();
    return () => {
      activeCount -= 1;
      emit();
    };
  }, []);
}

const pickVariant = (previous) => {
  const options = VARIANTS.filter((variant) => variant !== previous);
  return options[Math.floor(Math.random() * options.length)] || VARIANTS[0];
};

/** Mount once near the app root. */
export function BrandLoaderOverlay() {
  const active = useSyncExternalStore(subscribe, getCount, getCount) > 0;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState(() => pickVariant());
  const shownAt = useRef(0);
  const timers = useRef([]);
  const mountedRef = useRef(false);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    clear();

    if (active) {
      if (mountedRef.current) {
        // Came back while fading out: just fade in again with the same animation.
        later(() => setVisible(true), 0);
      } else {
        later(() => {
          setVariant((previous) => pickVariant(previous));
          mountedRef.current = true;
          setMounted(true);
          shownAt.current = Date.now();
          // Next frame, so the opacity transition starts from 0.
          requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        }, SHOW_DELAY_MS);
      }
    } else if (mountedRef.current) {
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
      later(() => {
        setVisible(false);
        later(() => {
          mountedRef.current = false;
          setMounted(false);
        }, FADE_MS);
      }, remaining);
    }

    return clear;
  }, [active]);

  if (!mounted) return null;

  const { src, ratio } = SOURCES[variant];
  const size = 150;

  return (
    <div
      className={`brand-overlay fixed inset-0 z-[70] flex items-center justify-center ${
        visible ? "is-visible" : "pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
      aria-busy={visible}
    >
      <img
        src={src}
        alt="Loading"
        width={Math.round(size * ratio)}
        height={size}
        draggable={false}
        decoding="async"
        className="brand-overlay-img select-none"
        style={{ height: size, width: "auto" }}
      />
    </div>
  );
}

/**
 * Registers a full-screen loader while mounted. Renders an empty spacer of `size` height so the
 * surrounding layout keeps its shape underneath the overlay. `variant` is ignored (random).
 */
// eslint-disable-next-line no-unused-vars
export function BrandLoader({ variant, size = 120, className = "" }) {
  useRegisterLoader();
  return <div aria-hidden="true" className={className} style={{ minHeight: size }} />;
}

// Full-area loader for pages and route guards.
export function PageLoader({ minHeight = "60vh" }) {
  useRegisterLoader();
  return <div aria-hidden="true" className="w-full" style={{ minHeight }} />;
}

export default BrandLoader;
