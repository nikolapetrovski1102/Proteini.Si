import { useEffect, useId, useRef, useState } from "react";

const rand = (min, max) => min + Math.random() * (max - min);

// A smooth wave across a 1000x100 box: random length, height, phase, ripple and slope.
function makeWave() {
  const periods = rand(1.5, 2.6);
  const phase = rand(0, Math.PI * 2);
  const amp = rand(28, 42);
  const ripple = rand(0, 9);
  const rippleFreq = rand(2.5, 4.2);
  const ripplePhase = rand(0, Math.PI * 2);
  const mid = 50 + rand(-6, 6);
  const slope = rand(-12, 12);
  const points = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const y =
      mid +
      slope * (t - 0.5) +
      amp * Math.sin(phase + t * periods * Math.PI * 2) +
      ripple * Math.sin(ripplePhase + t * rippleFreq * Math.PI * 2);
    points.push(
      `${(-20 + t * 1040).toFixed(1)} ${Math.min(96, Math.max(4, y)).toFixed(1)}`,
    );
  }
  return {
    d: `M${points.join(" L")}`,
    duration: rand(1.6, 2.8),
    // Starts the moment the section is triggered (first scroll), no waiting for the cards.
    delay: 0,
  };
}

/**
 * Yellow ribbon that draws itself left to right behind a row of cards once `active` turns true.
 * Place it inside a `relative` section; it lines up with the first element matching
 * `anchorSelector` (the card tile) and spans the section's full width. Give the card's tile
 * background no z-index and the product image z-index 2, so the ribbon runs over the
 * translucent tile but under the product.
 *
 * When the cards sit in a horizontally scrolling row (`scrollerSelector`, the mobile swipe row),
 * the ribbon spans the row's whole scroll width and moves with it, so it keeps the desktop
 * proportions instead of being squeezed into the phone width, and stays put under the cards.
 */
export default function DrawnWave({
  active,
  anchorSelector = ".nis-tile",
  scrollerSelector = ".nis-row",
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const gradientId = useId();
  const [wave] = useState(makeWave);
  const [band, setBand] = useState(null);

  useEffect(() => {
    const section = wrapRef.current?.parentElement;
    if (!section) return;
    // offsetTop/offsetLeft ignore transforms, so the entrance animation doesn't skew the measurement.
    const offsetIn = (el) => {
      let top = 0;
      let left = 0;
      let node = el;
      while (node && node !== section) {
        top += node.offsetTop;
        left += node.offsetLeft;
        node = node.offsetParent;
      }
      return node === section ? { top, left } : null;
    };
    const scroller = section.querySelector(scrollerSelector);
    const syncScroll = () => {
      if (svgRef.current)
        svgRef.current.style.transform = `translate3d(${-(scroller?.scrollLeft || 0)}px, 0, 0)`;
    };
    const measure = () => {
      const tile = section.querySelector(anchorSelector);
      const tilePos = tile && offsetIn(tile);
      if (!tilePos) return;
      const h = tile.offsetHeight;
      let left = 0;
      let width = section.clientWidth;
      if (scroller && scroller.scrollWidth > scroller.clientWidth + 1) {
        const scrollerPos = offsetIn(scroller);
        if (scrollerPos) {
          left = scrollerPos.left;
          width = scroller.scrollWidth;
        }
      }
      setBand({ top: tilePos.top + h * 0.15, height: h * 0.7, left, width });
      syncScroll();
    };
    measure();
    scroller?.addEventListener("scroll", syncScroll, { passive: true });
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(section);
      if (scroller) observer.observe(scroller);
    }
    return () => {
      scroller?.removeEventListener("scroll", syncScroll);
      observer?.disconnect();
    };
  }, [anchorSelector, scrollerSelector]);

  return (
    // Clips the ribbon to the section horizontally, so a scroll-wide ribbon never widens the page.
    <div ref={wrapRef} aria-hidden="true" className="drawn-wave-clip">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        overflow="visible"
        className={`drawn-wave ${active && band ? "is-drawn" : ""}`}
        style={{
          top: band ? `${band.top}px` : 0,
          left: band ? `${band.left}px` : 0,
          width: band ? `${band.width}px` : "100%",
          height: band ? `${band.height}px` : 0,
          "--wave-dur": `${wave.duration}s`,
          "--wave-delay": `${wave.delay}s`,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFD84D" />
            <stop offset="0.45" stopColor="#FDC700" />
            <stop offset="1" stopColor="#F5B400" />
          </linearGradient>
        </defs>
        <path
          d={wave.d}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
