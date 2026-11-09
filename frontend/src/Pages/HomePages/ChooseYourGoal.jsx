import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
import { getHomepageCardImageUrl } from "../../utils/homepageCardImage";
import Reveal from "./sections/Reveal";

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
  const [activeIndex, setActiveIndex] = useState(0);

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

  const visibleCards = cards.slice(0, 4);
  const titleOf = (card) =>
    card.titleKey
      ? translate(card.titleKey)
      : language === "al" && card.titleAl
        ? card.titleAl
        : card.titleMk;
  const activeCard = visibleCards[activeIndex] || visibleCards[0];

  return (
    <section
      id="choose-your-goal"
      className="home-section relative flex w-full items-center overflow-hidden bg-[#3a3a32] py-12 sm:py-24 lg:min-h-[calc(100svh-var(--header-h))]"
    >
      {/* Background follows the hovered goal */}
      {visibleCards.map((card) => (
        <img
          key={card.id}
          src={getHomepageCardImageUrl(card.imagePath)}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-md transition-opacity duration-700 ${
            activeCard?.id === card.id ? "opacity-40" : "opacity-0"
          }`}
        />
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#3a3a32] via-[#3a3a32]/50 to-[#3a3a32]/85" />

      <div className="relative w-full flex justify-center">
        <div className="w-full max-w-[1240px] flex flex-col items-center px-4 sm:px-[25px]">
          <Reveal className="mb-6 w-full sm:mb-12 sm:text-center">
            <h2 className="font-display font-bold uppercase tracking-tight text-[32px] leading-[0.95] text-white [text-wrap:balance] sm:text-6xl">
              {translate("chooseYourGoal")}
            </h2>
          </Reveal>

          <div className="w-full grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {visibleCards.map((card, i) => {
              const title = titleOf(card);
              return (
                <Reveal key={card.id} variant="scale" delay={i * 110}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onClick={() => handleGoalClick(card.slug, title, card.filterValue, card.destinationUrl)}
                    className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-lg ring-1 ring-white/10 transition duration-500 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] [@media(hover:hover)]:hover:-translate-y-2 [@media(hover:hover)]:hover:shadow-2xl [@media(hover:hover)]:hover:ring-[#FDC700]/70"
                  >
                    <img
                      src={getHomepageCardImageUrl(card.imagePath)}
                      alt={title}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition duration-500 group-hover:from-black/80" />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                      <span className="block text-[13px] font-bold leading-tight text-white sm:text-lg">
                        {title}
                      </span>
                      <span className="mt-3 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#FDC700] transition-all duration-500 sm:flex sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        {translate("showAll")}
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                    <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#FDC700] transition-transform duration-500 group-hover:scale-x-100" />
                  </button>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={450}>
            <button
              type="button"
              onClick={handleShowAllGoals}
              className="group mt-8 sm:mt-14 inline-flex items-center gap-3 rounded-full border border-white/30 px-7 py-3 text-[13px] font-extrabold text-white transition hover:border-[#FDC700] hover:bg-[#FDC700] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
            >
              {translate("showAll")}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
