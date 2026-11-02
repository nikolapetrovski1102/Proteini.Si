import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

export default function Goals() {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const handleGoalClick = (goalSlug, goalName, filterValue) => {
    window.scrollTo(0, 0);
    navigate(`/goals/${goalSlug}`, {
      state: {
        preSelectedFilter: "goalIds",
        filterValue: filterValue,
        goalName: goalName,
      },
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1240px] flex flex-col justify-center">
        <span className="text-[20px] text-[#828282] h-[84px] flex items-center px-[15px] my-12 max-md:my-4">
          {translate("goals")}
        </span>
        <div className="flex flex-col gap-4 px-[15px] mb-[16px]">
          <p>{translate("goalsDesc")}</p>
          <p>{translate("weAreHereForYou")}</p>
        </div>
        <div className="flex flex-col justify-center items-center mt-32">
          <span className="mb-[60px] text-[20px] font-bold text-center">
            {translate("goalsQuestion")}
          </span>
          <div className="flex flex-wrap gap-6 max-lg:justify-center py-4">
            {/* Goal 1: Gain muscle mass -> Muscle Mass */}
            <div
              className="flex flex-col gap-6 items-center mx-8 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleGoalClick(
                  "gain-muscle-mass", // FIXED: matches App.jsx route
                  "Gain muscle mass",
                  "Muscle Mass",
                )
              }
            >
              <img
                src="/img/gym-1.jpg"
                alt="Gain muscle mass"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("gainMuscleMass")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Goal 2: Lose weight -> Weight Loss */}
            <div
              className="flex flex-col gap-8 items-center mx-8 max-lg:mx-8 cursor-pointer group"
              onClick={
                () =>
                  handleGoalClick("weight-loss", "Lose weight", "Weight Loss") // FIXED: changed from "weight-loss" to "lose-weight"
              }
            >
              <img
                src="/img/gym-2.jpg"
                alt="Lose weight"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("loseWeight")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Goal 3: Improve your form and endurance -> Endurance and Recovery */}
            <div
              className="flex flex-col gap-6 items-center mx-8 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleGoalClick(
                  "improve-your-form-and-endurance", // FIXED: matches App.jsx route
                  "Improve your form and endurance",
                  "Endurance and Recovery",
                )
              }
            >
              <img
                src="/img/gym-4.jpg"
                alt="Improve your form and endurance"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("improveYourFormAndEndurance")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Goal 4: Vitality as a lifestyle -> Active Lifestyle */}
            <div
              className="flex flex-col gap-6 items-center mx-8 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleGoalClick(
                  "vitality-as-a-lifestyle", // FIXED: matches App.jsx route
                  "Vitality as a lifestyle",
                  "Active Lifestyle",
                )
              }
            >
              <img
                src="/img/gym-3.jpg"
                alt="Vitality as a lifestyle"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("vitalityAsALifestyle")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
