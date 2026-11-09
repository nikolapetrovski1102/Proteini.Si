/*
 * Playful decorative shapes used across the home page: starburst stickers,
 * four-point sparkles and wavy section edges.
 */

// Builds a starburst polygon (alternating outer/inner radius) in a 100x100 box.
function starburstPoints(spikes, inner) {
  const points = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return points.join(" ");
}

const BURST_12 = starburstPoints(12, 0.8);
const BURST_16 = starburstPoints(16, 0.84);

/**
 * Round "sticker" badge with a spiky edge and centred text.
 *  color / textColor – fill and text colours
 *  rotate            – tilt in degrees
 *  spikes            – 12 (chunky) or 16 (finer)
 */
export function Starburst({
  children,
  color = "#FDC700",
  textColor = "#141409",
  rotate = -12,
  spikes = 12,
  className = "",
  ...rest
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      {...rest}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full drop-shadow-[0_2px_0_rgba(20,20,9,0.18)]">
        <polygon points={spikes === 16 ? BURST_16 : BURST_12} fill={color} />
      </svg>
      <span
        className="relative text-center font-display font-bold uppercase leading-[0.95] tracking-tight"
        style={{ color: textColor }}
      >
        {children}
      </span>
    </span>
  );
}

/** Four-point sparkle (decorative only). */
export function Sparkle({ color = "currentColor", className = "", style }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z" fill={color} />
    </svg>
  );
}

/**
 * Wavy band that sits on the top or bottom edge of a section, filled with the
 * neighbouring section's colour so the two melt together.
 */
export function WaveEdge({ position = "top", fill, className = "" }) {
  const isTop = position === "top";
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-[1] h-6 w-full sm:h-10 ${isTop ? "top-0" : "bottom-0 rotate-180"} ${className}`}
    >
      <path
        d="M0 0H1440V20C1380 34 1320 40 1240 30S1080 6 1000 14 860 42 760 36 600 8 520 12 380 40 280 36 120 14 0 24Z"
        fill={fill}
      />
    </svg>
  );
}
