import { useEffect, useState } from "react";
import { useInView } from "../HomePages/sections/useInView";

const rand = (min, max) => min + Math.random() * (max - min);

const f = (n) => n.toFixed(2);

const bezier = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

/*
 * The brand underline, as in the design references: one brush stroke under the text.
 *  - Arc: starts low just left of the first letter, rises in one smooth curve to a crest at
 *    about 60% of the width, then eases slightly downward to the end (a soft flick).
 *  - Pressure: thickens quickly at the start, holds through the crest, then thins gradually
 *    over the last third into a fine rounded tip.
 * Drawn in a 100x20 box (y grows downward); thickness is offset vertically so it stays even
 * however wide the box is stretched.
 *
 * Every draw uses this same shape; only small jitter is added so it reads as hand-drawn
 * without ever looking like a different line.
 */
const SAMPLES = 48;
function makeStroke(delay) {
  const j = (amount) => rand(-amount, amount);
  const x = [0, 22 + j(2), 58 + j(2), 100];
  const y = [15.5 + j(0.6), 3 + j(0.6), 0 + j(0.5), 9 + j(0.6)];
  const maxThick = 5 + j(0.3);

  const upper = [];
  const lower = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const cx = bezier(x[0], x[1], x[2], x[3], t);
    const cy = bezier(y[0], y[1], y[2], y[3], t);
    // Fast attack, long release: the peak sits at ~35% and the tail fades out over the rest.
    const pressure = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.85);
    const half = (0.35 + maxThick * pressure) / 2;
    upper.push(`${f(cx)} ${f(cy - half)}`);
    lower.push(`${f(cx)} ${f(cy + half)}`);
  }
  lower.reverse();

  return {
    d: `M${upper.join(" L")} L${lower.join(" L")} Z`,
    left: -6 + j(1),
    width: 100 + j(2),
    tilt: j(0.8),
    duration: 0.62 + j(0.05),
    delay,
  };
}

/**
 * Text with an animated hand-drawn underline. The line draws itself left to right when it
 * scrolls into view, and draws again (same brush shape, lightly jittered) each time the pointer
 * enters the surrounding link or button.
 *  color  – stroke colour (yellow on light/dark backgrounds, ink on yellow ones)
 *  active – optional: when given, the line shows only while it is true (e.g. a header item whose
 *           menu is open) and ignores scrolling; it still redraws on each hover or focus.
 */
export default function Scribble({ children, color = "#FDC700", className = "", active }) {
  const controlled = active !== undefined;
  const [ref, inView] = useInView({ threshold: 0.6, rootMargin: "0px 0px -6% 0px" });
  const [stroke, setStroke] = useState(() => makeStroke(rand(0.05, 0.2)));
  const [cycle, setCycle] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const host = ref.current?.closest("a, button") ?? ref.current;
    if (!host) return;
    const redraw = () => {
      setStroke(makeStroke(0));
      setCycle((c) => c + 1);
      setHovered(true);
    };
    host.addEventListener("mouseenter", redraw);
    host.addEventListener("focus", redraw);
    return () => {
      host.removeEventListener("mouseenter", redraw);
      host.removeEventListener("focus", redraw);
    };
  }, [ref]);

  return (
    <span ref={ref} className={`scribble ${className}`}>
      {children}
      <svg
        key={cycle}
        aria-hidden="true"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        overflow="visible"
        className={`scribble-line ${(controlled ? active : inView || hovered) ? "is-drawn" : ""}`}
        style={{
          left: `${stroke.left}%`,
          width: `${stroke.width}%`,
          transform: `rotate(${stroke.tilt}deg)`,
          "--sc-dur": `${stroke.duration}s`,
          "--sc-delay": `${stroke.delay}s`,
        }}
      >
        <path d={stroke.d} fill={color} stroke={color} strokeWidth="0.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
