import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
import { getHomepageCardImageUrl } from "../../utils/homepageCardImage";

const fallbackCards = [
  { id: "sport-1", titleKey: "cycling", slug: "road-cycling", filterValue: "Road Cycling", imagePath: "/img/gym-5.jpg" },
  { id: "sport-2", titleKey: "running", slug: "running", filterValue: "Running", imagePath: "/img/homepage-cards/running.webp" },
  { id: "sport-3", titleKey: "teamSports", slug: "swimming", filterValue: "Swimming", imagePath: "/img/homepage-cards/team-sports.webp" },
  { id: "sport-4", titleKey: "fitnessAndBodybuilding", slug: "fitness-bodybuilding", filterValue: "Fitness and Bodybuilding", imagePath: "/img/homepage-cards/fitness-bodybuilding.webp" },
];

export default function WhatSportsAreYouInterestedIn() {
  const { translate, language } = useLanguage();
  const navigate = useNavigate();
  const [cards, setCards] = useState(fallbackCards);

  useEffect(() => {
    api.getHomepageCards("sport").then((rows) => {
      if (rows.length > 0) setCards(rows);
    }).catch(() => {});
  }, []);

  const handleSportsNavigation = () => {
    window.scrollTo(0, 0);
    navigate("/sports");
  };

  const handleSportClick = (sportSlug, sportName, filterValue, destinationUrl) => {
    window.scrollTo(0, 0);
    if (destinationUrl) {
      if (destinationUrl.startsWith("https://")) window.location.assign(destinationUrl);
      else navigate(destinationUrl);
      return;
    }
    navigate(`/sports/${sportSlug}`, {
      state: {
        preSelectedFilter: "sportIds",
        filterValue: filterValue,
        sportName: sportName,
      },
    });
  };

  return (
    <div className="bg-[#E5E5E5] w-full py-[30px] sm:py-[90px]">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1240px] flex flex-col justify-center items-center px-[15px]">
          <span className="text-xl sm:text-2xl font-semibold mb-[40px] sm:mb-[68px] text-center">
            {translate("whatSportsAreYou")}
          </span>

          <div className="w-full grid grid-cols-2 gap-4 sm:flex sm:gap-0">
            {cards.slice(0, 4).map((card) => {
              const title = card.titleKey
                ? translate(card.titleKey)
                : language === "al" && card.titleAl
                  ? card.titleAl
                  : card.titleMk;
              return (
                <div key={card.id} className="relative cursor-pointer mx-0 sm:mx-[7px] group flex-1" onClick={() => handleSportClick(card.slug, title, card.filterValue, card.destinationUrl)}>
                  <img src={getHomepageCardImageUrl(card.imagePath)} alt={title} className="w-full object-cover aspect-square sm:h-[230px]" />
                  <div className="absolute inset-0 group-hover:bg-black/30 transition duration-300"></div>
                  <span className="absolute bottom-0 left-0 w-full px-1 py-3 sm:py-6 text-center font-semibold text-white bg-black/60 text-[12px] md:text-base leading-tight">
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className="text-[13px] font-extrabold mt-[25px] sm:mt-[35px] cursor-pointer"
            onClick={handleSportsNavigation}
          >
            {translate("showAll")} {"  >"}
          </div>
        </div>
      </div>
    </div>
  );
}
