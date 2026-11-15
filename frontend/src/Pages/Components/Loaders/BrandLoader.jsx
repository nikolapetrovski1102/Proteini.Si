import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * Full-screen brand loader.
 *
 * Use it only for page-level loads (route guards, whole pages, payment verification). For a
 * section, modal or refetch inside an already-visible page use <InlineLoader /> instead.
 *
 * Any component can render <BrandLoader /> (or <PageLoader />) while it loads. It does not draw
 * a loader itself: it registers with one global <BrandLoaderOverlay /> (mounted once in App),
 * which shows a full-screen pale-yellow overlay with a randomly picked animation (shaker or
 * creatine scoop) for as long as at least one loader is registered.
 *
 *  - appears only after a short delay, so fast loads don't flash it
 *  - once shown, stays until one full shake / pour has played, then fades out smoothly
 *  - several loaders at once (e.g. the home page sections) share the same overlay
 */

// minVisibleMs: long enough for the key moment of each animation to play once
// (shaker: two shakes, back upright at ~0.9s; scoop: the full pour, done at ~1.1s).
// Bump when the SVGs change: Cloudflare caches /loaders/*.svg for hours.
const LOADER_VERSION = "3";
const SOURCES = {
  shaker: { src: `/loaders/shaker.svg?v=${LOADER_VERSION}`, ratio: 200 / 260, minVisibleMs: 950 },
  scoop: { src: `/loaders/scoop.svg?v=${LOADER_VERSION}`, ratio: 262 / 270, minVisibleMs: 1150 },
};
const VARIANTS = Object.keys(SOURCES);

const SHOW_DELAY_MS = 120; // don't show at all for loads faster than this
const FADE_MS = 150; // keep in sync with .brand-overlay transition in index.css

// Preload both as text. Each time the overlay appears it gets a fresh blob URL, so the SVG is a
// new image and its animation starts from frame 0 (a cached <img> can resume mid-cycle).
const svgText = {};
if (typeof window !== "undefined" && typeof fetch === "function") {
  Object.entries(SOURCES).forEach(([variant, { src }]) => {
    fetch(src)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        if (text) svgText[variant] = text;
      })
      .catch(() => {});
  });
}

function freshSrc(variant) {
  const text = svgText[variant];
  if (!text || typeof URL === "undefined" || !URL.createObjectURL) return SOURCES[variant].src;
  return URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
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
  const [imgSrc, setImgSrc] = useState(null);
  const variantRef = useRef(variant);
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
          const next = pickVariant(variantRef.current);
          variantRef.current = next;
          setVariant(next);
          setImgSrc(freshSrc(next));
          mountedRef.current = true;
          setMounted(true);
          shownAt.current = Date.now();
          // Next frame, so the opacity transition starts from 0.
          requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        }, SHOW_DELAY_MS);
      }
    } else if (mountedRef.current) {
      const minVisible = SOURCES[variantRef.current].minVisibleMs;
      const remaining = Math.max(0, minVisible - (Date.now() - shownAt.current));
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

  // Free the blob URL once it is replaced or the overlay unmounts.
  useEffect(() => {
    if (!imgSrc || !imgSrc.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(imgSrc);
  }, [imgSrc]);

  if (!mounted) return null;

  const { src, ratio } = SOURCES[variant];
  // Big and centred: 240px on desktop, scales down to ~55% of the viewport width on phones.
  const size = 240;

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
        key={imgSrc || src}
        src={imgSrc || src}
        alt="Loading"
        width={Math.round(size * ratio)}
        height={size}
        draggable={false}
        decoding="async"
        className="brand-overlay-img select-none"
        style={{ height: `min(${size}px, 55vw)`, width: "auto" }}
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

/**
 * Small inline spinner for sections, modals and refetches. Does not touch the full-screen overlay.
 */
export function InlineLoader({ size = 32, className = "" }) {
  return (
    <div role="status" aria-label="Loading" className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full border-[3px] border-black/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#FDC700] border-r-[#FDC700]" />
      </div>
    </div>
  );
}

export default BrandLoader;
