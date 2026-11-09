import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../services/api";
import { useLanguage } from "./translation/LanguageContext";
import Reveal from "./HomePages/sections/Reveal";

/** Tips list. `variant="home"` is the compact homepage teaser: title row + swipeable rail on phones. */
export default function Tips({ variant = "page" }) {
  const isHome = variant === "home";
  const { translate } = useLanguage();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.getTipArticles().then((response) => {
      setArticles(response?.data || []);
    });
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `https://proteini.mk${path}`;
    return path;
  };

  const fallbackArticles = [
    {
      id: "fallback-1",
      category: translate("news"),
      title: translate("womensEnergyStarts"),
      subtitle: translate("whenTheBodyFunctions"),
      imagePath: "/img/tips/tips-1.jpg",
    },
    {
      id: "fallback-2",
      category: translate("news"),
      title: translate("liverAndDetoxification"),
      subtitle: translate("didYouKnowThat"),
      imagePath: "/img/tips/tips-2.jpg",
    },
    {
      id: "fallback-3",
      category: translate("news"),
      title: translate("noBakeProteinCheescake"),
      subtitle: translate("doYouEverCrave"),
      imagePath: "/img/tips/tips-3.jpg",
    },
  ];

  const visibleArticles = articles.length > 0 ? articles : fallbackArticles;
  // The homepage rail scrolls sideways, so its cards skip the scroll-in reveal.
  const Card = isHome ? "div" : Reveal;

  return (
    <div className={`w-full flex justify-center ${isHome ? "py-10 sm:pt-[72px] sm:pb-[80px]" : "pt-[72px] pb-[80px]"}`}>
      <div className="w-full max-w-[1240px] flex flex-col items-center">
        {isHome ? (
          <div className="mb-4 flex w-full items-center justify-between gap-4 px-4 sm:mb-7 sm:px-[25px]">
            <h2 className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-gray-900 sm:text-5xl">
              {translate("tips")}
            </h2>
            <Link
              to="/tips"
              className="group flex min-h-[40px] flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white/70 px-4 text-[12px] font-bold text-gray-800 transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
            >
              {translate("showAll")}
              <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : (
          <>
        <span className="mb-[45px] text-[24px] leading-[29px] font-bold w-full text-center">
          {translate("tips")}
        </span>
        <div className="mb-[33px] w-full flex flex-wrap justify-center gap-2 px-4 text-[12px]">
          <button className="rounded-full border border-[#2096D8] bg-[#2096D8] text-white leading-[15px] py-[9px] px-[14px] font-semibold">
            {translate("allTips")}
          </button>
          <button className="rounded-full border border-[#E5E5E5] bg-white leading-[15px] py-[9px] px-[14px] transition hover:border-[#2096D8]">
            {translate("events")}
          </button>
          <button className="rounded-full border border-[#E5E5E5] bg-white leading-[15px] py-[9px] px-[14px] transition hover:border-[#2096D8]">
            {translate("newProducts")}
          </button>
          <button className="rounded-full border border-[#E5E5E5] bg-white leading-[15px] py-[9px] px-[14px] transition hover:border-[#2096D8]">
            {translate("news")}
          </button>
        </div>
          </>
        )}

        <div
          className={
            isHome
              ? "flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-[25px] md:pb-0"
              : "grid w-full grid-cols-3 gap-6 px-4 max-md:grid-cols-1"
          }
        >
          {visibleArticles.map((article, i) => (
            <Card
              key={article.id}
              {...(isHome
                ? { className: "w-[78%] max-w-[320px] flex-shrink-0 snap-start md:w-auto md:max-w-none" }
                : { delay: i * 120 })}
            >
              <Link
                to={article.slug ? `/tips/${article.slug}` : "/tips"}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(article.imagePath)}
                    className={`${isHome ? "aspect-[4/3] h-auto md:h-[240px] md:aspect-auto" : "h-[240px]"} w-full object-cover transition duration-700 ease-out group-hover:scale-105`}
                    alt={article.title}
                    loading="lazy"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700 backdrop-blur">
                    {article.category || translate("news")}
                  </span>
                </div>
                <div className={`flex flex-1 flex-col ${isHome ? "p-4 sm:p-5" : "p-5"}`}>
                  <span className="mb-2 text-[16px] font-bold leading-[22px] transition group-hover:text-[#2096D8]">
                    {article.title}
                  </span>
                  <p className="line-clamp-3 text-[14px] leading-[20px] text-[#828282]">
                    {article.subtitle || article.content}
                  </p>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-[12px] font-bold uppercase tracking-wider text-[#2096D8]">
                    {translate("readMore")}
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>

        {!isHome && (
        <Link
          to="/tips"
          className="mt-[40px] text-center text-[13px] leading-[25px] text-[#828282] font-extrabold hover:text-black transition"
        >
          {translate("showAll")} {" >"}
        </Link>
        )}
      </div>
    </div>
  );
}
