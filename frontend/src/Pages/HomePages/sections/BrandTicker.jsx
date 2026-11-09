import { useLanguage } from "../../translation/LanguageContext";
import { Sparkle } from "./Decor";

/**
 * Endless scrolling band of brand slogans separated by sparkles.
 *  variant – "ink" (dark band, yellow text) or "yellow" (yellow band, dark text)
 *  reverse – scroll the other way
 */
export default function BrandTicker({ variant = "ink", reverse = false, className = "" }) {
  const { translate } = useLanguage();
  const words = String(translate("tickerWords") || "")
    .split("|")
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return null;

  const ink = variant === "ink";
  const bg = ink ? "bg-[#141409]" : "bg-[#FDC700]";
  const text = ink ? "text-[#FDC700]" : "text-[#141409]";
  const star = ink ? "#FDC700" : "#141409";

  // The track moves by -50%, so it holds two identical halves wide enough to fill the screen.
  const half = [...words, ...words];
  const items = [...half, ...half];

  return (
    <div className={`marquee relative z-[2] w-full overflow-hidden ${bg} py-3 sm:py-4 ${className}`} aria-hidden="true">
      <div className={`flex w-max items-center ${reverse ? "marquee-track marquee-reverse" : "marquee-track"}`}>
        {items.map((word, i) => (
          <span key={i} className="flex flex-shrink-0 items-center">
            <span className={`whitespace-nowrap px-5 font-display text-lg font-semibold uppercase tracking-wide sm:px-8 sm:text-2xl ${text}`}>
              {word}
            </span>
            <Sparkle color={star} className={`h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 ${i % 2 ? "rotate-45" : ""}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
