import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
import { getHomepageCardImageUrl } from "../../utils/homepageCardImage";

const fallbackCards = [
  { id: "goal-1", titleKey: "loseWeight", slug: "weight-loss", filterValue: "Weight Loss", imagePath: "/img/homepage-cards/lose-weight.webp" },
  { id: "goal-2", titleKey: "gainMuscleMass", slug: "gain-muscle-mass", filterValue: "Muscle Mass", imagePath: "/img/homepage-cards/gain-muscle-mass.webp" },
  { id: "goal-3", titleKey: "improveYourForm", slug: "improve-your-form-and-endurance", filterValue: "Endurance and Recovery", imagePath: "/img/homepage-cards/improve-form-endurance.webp" },
  { id: "goal-4", titleKey: "vitalityAsALifestyle", slug: "vitality-as-a-lifestyle", filterValue: "Active Lifestyle", imagePath: "/img/homepage-cards/vitality-lifestyle.webp" },
];

export default function ChooseYourGoal() {
  const { translate, language } = useLanguage();
  const navigate = useNavigate();
  const [cards, setCards] = useState(fallbackCards);

  useEffect(() => {
    api.getHomepageCards("goal").then((rows) => {
      if (rows.length > 0) setCards(rows);
    }).catch(() => {});
  }, []);

  const handleGoalClick = (goalSlug, goalName, filterValue, destinationUrl) => {
    window.scrollTo(0, 0);
    if (destinationUrl) {
      if (destinationUrl.startsWith("https://")) window.location.assign(destinationUrl);
      else navigate(destinationUrl);
      return;
    }
    navigate("/products", {
      // Changed from "/products/goals/${goalSlug}"
      state: {
        preSelectedFilter: "goalIds",
        filterValue: filterValue,
        goalName: goalName,
      },
    });
  };

  const handleShowAllGoals = () => {
    window.scrollTo(0, 0);
    navigate("/goals");
  };

  return (
    <div className="bg-[#141409] w-full py-[60px] sm:py-[90px]">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1240px] flex flex-col justify-center items-center px-[15px]">
          <span className="text-white text-xl sm:text-2xl font-semibold mb-[40px] sm:mb-[68px] text-center">
            {translate("chooseYourGoal")}
          </span>

          <div className="w-full grid grid-cols-2 gap-4 sm:flex sm:gap-0">
            {cards.slice(0, 4).map((card) => {
              const title = card.titleKey
                ? translate(card.titleKey)
                : language === "al" && card.titleAl
                  ? card.titleAl
                  : card.titleMk;
              return (
                <div key={card.id} className="relative cursor-pointer mx-0 sm:mx-[7px] group flex-1" onClick={() => handleGoalClick(card.slug, title, card.filterValue, card.destinationUrl)}>
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
            className="text-white text-[13px] font-extrabold flex items-center mt-[25px] sm:mt-[35px] cursor-pointer"
            onClick={handleShowAllGoals}
          >
            <p>{translate("showAll")}</p>
            <img width={18} src="/logos/right-arrow.svg" alt="Show all" />
          </div>
        </div>
      </div>
    </div>
  );
}
