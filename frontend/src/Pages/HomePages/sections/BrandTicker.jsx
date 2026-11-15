import { Fragment } from "react";
import { useLanguage } from "../../translation/LanguageContext";

const WAVE_PATH =
  "M0 0H1440V20C1380 34 1320 40 1240 30S1080 6 1000 14 860 42 760 36 600 8 520 12 380 40 280 36 120 14 0 24Z";

/** Wavy edge in the band's own colour, sticking out above or below the band. */
function BandWave({ position, fill }) {
  const isTop = position === "top";
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-4 w-full sm:h-6 ${
        isTop ? "bottom-full -mb-px rotate-180" : "top-full -mt-px"
      }`}
    >
      <path d={WAVE_PATH} fill={fill} />
    </svg>
  );
}

/**
 * Static band of shop facts (delivery, payment) separated by dots, with wavy edges.
 *  variant – "ink" (dark band, yellow text) or "yellow" (yellow band, dark text)
 */
export default function BrandTicker({ variant = "ink", className = "" }) {
  const { translate } = useLanguage();
  const words = String(translate("tickerWords") || "")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return null;

  const ink = variant === "ink";
  const color = ink ? "#141409" : "#FDC700";
  const bg = ink ? "bg-[#141409]" : "bg-[#FDC700]";
  const text = ink ? "text-[#FDC700]" : "text-[#141409]";
  const dot = ink ? "bg-[#FDC700]" : "bg-[#141409]";

  return (
    <div className={`relative z-[2] w-full ${bg} py-3 sm:py-4 ${className}`}>
      <BandWave position="top" fill={color} />
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 sm:gap-x-8">
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && <li aria-hidden="true" className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />}
            <li className={`whitespace-nowrap text-center font-display text-sm font-semibold uppercase tracking-wide sm:text-xl ${text}`}>
              {word}
            </li>
          </Fragment>
        ))}
      </ul>
      <BandWave position="bottom" fill={color} />
    </div>
  );
}
