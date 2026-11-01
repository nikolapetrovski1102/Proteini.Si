import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "./translation/LanguageContext";

export default function Tips() {
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

  return (
    <div className="w-full flex justify-center pt-[88px] pb-[90px]">
      <div className="w-full max-w-[1240px] flex flex-col items-center">
        <span className="mb-[45px] text-[24px] leading-[29px] font-bold w-full text-center">
          {translate("tips")}
        </span>
        <div className="mb-[33px] w-full flex justify-center text-[12px]">
          <button className="border border-[#2096D8] mx-[2px] mb-[7px] leading-[15px] py-[9px] px-[12px]">
            {translate("allTips")}
          </button>
          <button className="border border-[#E5E5E5] mx-[2px] mb-[7px] leading-[15px] py-[9px] px-[12px]">
            {translate("events")}
          </button>
          <button className="border border-[#E5E5E5] mx-[2px] mb-[7px] leading-[15px] py-[9px] px-[12px]">
            {translate("newProducts")}
          </button>
          <button className="border border-[#E5E5E5] mx-[2px] mb-[7px] leading-[15px] py-[9px] px-[12px]">
            {translate("news")}
          </button>
        </div>

        <div className="grid w-full grid-cols-3 gap-4 max-md:grid-cols-1">
          {visibleArticles.map((article) => (
            <Link
              key={article.id}
              to={article.slug ? `/tips/${article.slug}` : "/tips"}
              className="flex flex-col px-[6px]"
            >
              <div className="min-h-[270px] mb-[14px] overflow-hidden">
                <img
                  src={getImageUrl(article.imagePath)}
                  className="h-[240px] w-full object-cover"
                  alt={article.title}
                />
              </div>
              <span className="text-[10px] text-[#828282] mb-[9px] leading-[12px] w-full uppercase">
                {article.category || translate("news")}
              </span>
              <span className="text-[16px] mb-[7px] leading-[20px] font-bold">
                {article.title}
              </span>
              <p className="text-[14px] text-[#828282] leading-[18px]">
                {article.subtitle || article.content}
              </p>
            </Link>
          ))}
        </div>

        <span className="mt-[40px] w-full text-center text-[13px] leading-[25px] text-[#828282] font-extrabold">
          {translate("showAll")} {" >"}
        </span>
      </div>
    </div>
  );
}
