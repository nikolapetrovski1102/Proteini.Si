import { FiArrowRight } from "react-icons/fi";
import { Sparkle } from "../HomePages/sections/Decor";
import { BrandLoader } from "../Components/Loaders/BrandLoader";

export const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";

export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500";

export const cardClass = "rounded-2xl bg-white ring-1 ring-black/[0.06]";

export const pillButtonClass =
  "group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#141409] px-7 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostButtonClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-gray-900 ring-1 ring-black/[0.12] transition hover:bg-black/[0.04] hover:ring-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] disabled:cursor-not-allowed disabled:opacity-50";

/** Page title row used by every profile tab. */
export function ProfileHeader({ eyebrow, title, count, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h1 className={`${headingClass} mt-2 text-[34px] sm:text-5xl`}>
          {title}
          {typeof count === "number" && (
            <span className="ml-3 align-middle font-sans text-base font-bold tracking-normal text-gray-400 sm:text-lg">
              {count}
            </span>
          )}
        </h1>
      </div>
      {action}
    </div>
  );
}

export function ProfileLoading({ label }) {
  return (
    <div className={`${cardClass} flex flex-col items-center justify-center py-16`}>
      <BrandLoader variant="scoop" size={110} />
      {label && <p className="mt-4 text-sm text-gray-500">{label}</p>}
    </div>
  );
}

/** Yellow empty-state card with sparkles, matching the empty cart. */
export function ProfileEmpty({ icon, title, text, actionLabel, onAction }) {
  const Icon = icon;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#FDC700] px-6 py-12 text-center sm:py-16">
      <Sparkle color="#141409" className="absolute left-[8%] top-[16%] h-6 w-6 rotate-12" />
      <Sparkle color="#ffffff" className="absolute bottom-[18%] left-[16%] h-4 w-4" />
      <Sparkle color="#E3262F" className="absolute right-[10%] top-[22%] h-8 w-8" />
      <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#141409] text-[#FDC700] shadow-[4px_4px_0_rgba(20,20,9,0.18)]">
        <Icon size={28} />
      </div>
      <p className="relative font-display text-3xl font-bold uppercase leading-[0.95] tracking-tight text-[#141409]">
        {title}
      </p>
      {text && (
        <p className="relative mx-auto mt-3 max-w-[380px] text-sm leading-relaxed text-[#141409]/75">
          {text}
        </p>
      )}
      {actionLabel && (
        <button type="button" onClick={onAction} className={`${pillButtonClass} relative mt-7`}>
          {actionLabel}
          <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

export function Notice({ tone = "success", children }) {
  if (!children) return null;
  const tones = {
    error: "bg-[#E3262F]/[0.07] text-[#a3161d] ring-[#E3262F]/20",
    success: "bg-[#8DC658]/[0.12] text-[#2f5e14] ring-[#8DC658]/30",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ring-1 ${tones[tone]}`}>
      {children}
    </div>
  );
}
