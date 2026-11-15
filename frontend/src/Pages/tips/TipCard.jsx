import { Link } from "react-router-dom";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { useLanguage } from "../translation/LanguageContext";
import Scribble from "../Components/Scribble";
import { categoryLabel, getTipImageUrl, readingMinutes } from "./tipsData";

export function TipMeta({ tip, className = "", light = false }) {
  const { translate } = useLanguage();
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-wider ${className}`}>
      {light ? (
        <span className="text-[#FDC700]">{categoryLabel(tip.category, translate)}</span>
      ) : (
        <span className="rounded-full bg-[#FDC700] px-2.5 py-1 text-[#141409]">{categoryLabel(tip.category, translate)}</span>
      )}
      {light && <span aria-hidden="true" className="h-3 w-px bg-white/40" />}
      <span className={`inline-flex items-center gap-1 ${light ? "text-white/80" : "text-gray-500"}`}>
        <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
        {readingMinutes(tip)} {translate("minRead")}
      </span>
    </div>
  );
}

/**
 * Tip card. Layouts:
 *  - "stack": image on top, text below (grids and rails)
 *  - "feature": large image with the title over it
 *  - "row": small image left, text right (side list next to a feature)
 */
export default function TipCard({ tip, layout = "stack", className = "", headingLevel = "h3" }) {
  const Heading = headingLevel;
  const { translate } = useLanguage();
  const image = getTipImageUrl(tip.imagePath);
  const to = `/tips/${tip.slug}`;

  if (layout === "feature") {
    return (
      <Link
        to={to}
        className={`group relative flex min-h-[340px] overflow-hidden rounded-3xl bg-[#141409] shadow-sm ring-1 ring-black/5 transition duration-500 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] sm:min-h-[460px] ${className}`}
      >
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0" />
        <div className="relative mt-auto flex flex-col gap-3 p-6 sm:p-9">
          <TipMeta tip={tip} light />
          <Heading className="font-display text-[26px] font-bold leading-[1.05] text-white [text-wrap:balance] sm:text-[38px]">
            {tip.title}
          </Heading>
          {tip.subtitle && <p className="line-clamp-2 max-w-[56ch] text-[15px] leading-6 text-white/80">{tip.subtitle}</p>}
          <span className="mt-1 inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-[#FDC700]">
            <Scribble>{translate("readMore")}</Scribble>
            <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  if (layout === "row") {
    return (
      <Link
        to={to}
        className={`group flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] ${className}`}
      >
        <div className="relative w-[38%] flex-shrink-0 overflow-hidden rounded-xl">
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-2 pr-2">
          <TipMeta tip={tip} />
          <Heading className="text-[17px] font-bold leading-snug text-gray-900 [text-wrap:balance]">{tip.title}</Heading>
          {tip.subtitle && <p className="line-clamp-2 text-[13px] leading-5 text-gray-500">{tip.subtitle}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-900">
            <Scribble>{translate("readMore")}</Scribble>
            <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] ${className}`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <TipMeta tip={tip} />
        <Heading className="text-[17px] font-bold leading-snug text-gray-900 [text-wrap:balance]">{tip.title}</Heading>
        {tip.subtitle && <p className="line-clamp-3 text-[14px] leading-[21px] text-gray-500">{tip.subtitle}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pb-2 pt-2 text-[12px] font-extrabold uppercase tracking-wider text-gray-900">
          <Scribble>{translate("readMore")}</Scribble>
          <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
