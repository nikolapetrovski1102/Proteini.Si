import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useLanguage } from "./translation/LanguageContext";
import Reveal from "./HomePages/sections/Reveal";
import TipCard from "./tips/TipCard";
import { useTips } from "./tips/useTips";
import { categoryLabel, normalizeCategory } from "./tips/tipsData";
import Scribble from "./Components/Scribble";

function TipsSkeleton({ count = 3 }) {
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          <div className="aspect-[3/2] animate-pulse bg-gray-100" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Homepage teaser: one featured tip with two more beside it; a swipeable rail on phones. */
function HomeTips() {
  const { translate } = useLanguage();
  const { tips, loading } = useTips();
  const [featured, ...rest] = tips;
  const side = rest.slice(0, 2);

  return (
    <div className="flex w-full justify-center py-10 sm:pt-[72px] sm:pb-[80px]">
      <div className="flex w-full max-w-[1240px] flex-col">
        <div className="mb-5 flex w-full items-end justify-between gap-4 px-4 sm:mb-8 sm:px-[25px]">
          <div>
            <h2 className="font-display text-[30px] font-bold uppercase leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
              {translate("tips")}
            </h2>
            <p className="mt-2 hidden max-w-[52ch] text-[14px] text-gray-500 sm:block">{translate("tipsIntro")}</p>
          </div>
          <Link
            to="/tips"
            className="group flex flex-shrink-0 items-center gap-1.5 pb-2 text-[12px] font-bold text-gray-800 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
          >
            <Scribble>{translate("showAll")}</Scribble>
            <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="px-4 sm:px-[25px]">
            <TipsSkeleton />
          </div>
        ) : (
          <>
            {/* Phones: swipeable rail */}
            <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
              {tips.slice(0, 6).map((tip) => (
                <div key={tip.id} className="w-[80%] max-w-[320px] flex-shrink-0 snap-start">
                  <TipCard tip={tip} />
                </div>
              ))}
            </div>

            {/* Tablet and up: feature + side list */}
            {featured && (
              <div className="hidden gap-6 px-[25px] md:grid md:grid-cols-12">
                <Reveal className={side.length ? "md:col-span-7" : "md:col-span-12"}>
                  <TipCard tip={featured} layout="feature" className="h-full" />
                </Reveal>
                {side.length > 0 && (
                  <div className="flex flex-col gap-6 md:col-span-5">
                    {side.map((tip, i) => (
                      <Reveal key={tip.id} delay={120 * (i + 1)} className="flex-1">
                        <TipCard tip={tip} layout="row" className="h-full" />
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Full /tips page: hero, working category filter, featured tip and grid. */
function TipsPage() {
  const { translate } = useLanguage();
  const { tips, loading } = useTips();
  const [category, setCategory] = useState("all");

  useEffect(() => {
    document.title = `${translate("tips")} | Proteini.mk`;
  }, [translate]);

  const categories = useMemo(() => {
    const seen = new Map();
    tips.forEach((tip) => {
      const key = normalizeCategory(tip.category);
      if (!seen.has(key)) seen.set(key, categoryLabel(tip.category, translate));
    });
    return [...seen.entries()];
  }, [tips, translate]);

  const visible = category === "all" ? tips : tips.filter((tip) => normalizeCategory(tip.category) === category);
  const [featured, ...rest] = visible;

  return (
    <main className="w-full font-montserrat text-gray-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#3a3a32]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FDC700]/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-[1240px] flex-col gap-4 px-4 pb-14 pt-12 sm:px-[25px] sm:pb-20 sm:pt-20">
          <span className="h-1 w-12 bg-[#FDC700]" aria-hidden="true" />
          <h1 className="font-display text-[44px] font-bold uppercase leading-[0.9] tracking-tight text-white sm:text-7xl">
            {translate("tips")}
          </h1>
          <p className="max-w-[54ch] text-[15px] leading-6 text-white/75 sm:text-[17px]">{translate("tipsIntro")}</p>
        </div>
      </section>

      <div className="home-tint bg-[#f3f6f8]">
        <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-[25px]">
          {/* Category filter (only categories that actually have tips) */}
          {categories.length > 1 && (
            <div
              role="tablist"
              aria-label={translate("tips")}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-8 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {[["all", translate("allTips")], ...categories].map(([key, label]) => {
                const active = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(key)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] ${
                      active
                        ? "bg-[#141409] text-white"
                        : "bg-white text-gray-700 ring-1 ring-black/10 hover:ring-black/30"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="pt-8">
            {loading ? (
              <TipsSkeleton />
            ) : (
              <>
                {featured && (
                  <Reveal className="mb-8">
                    <TipCard tip={featured} layout="feature" headingLevel="h2" />
                  </Reveal>
                )}
                {rest.length > 0 && (
                  <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${rest.length >= 3 ? "lg:grid-cols-3" : ""}`}>
                    {rest.map((tip, i) => (
                      <Reveal key={tip.id} delay={(i % 3) * 110}>
                        <TipCard tip={tip} headingLevel="h2" />
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Tips({ variant = "page" }) {
  return variant === "home" ? <HomeTips /> : <TipsPage />;
}
