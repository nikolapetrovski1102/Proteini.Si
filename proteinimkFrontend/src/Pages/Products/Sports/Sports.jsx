import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../translation/LanguageContext";

export default function Sports() {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const handleSportClick = (sportSlug, sportName, filterValue) => {
    window.scrollTo(0, 0);
    navigate(`/sports/${sportSlug}`, {
      state: {
        preSelectedFilter: "sportIds",
        filterValue: filterValue,
        sportName: sportName,
      },
    });
  };

  return (
    <div className="w-full flex justify-center my-16">
      <div className="w-full max-w-[1240px] flex flex-col justify-center">
        <span className="text-[20px] text-[#828282] h-[84px] flex items-center px-[15px] mt-4 max-md:my-4">
          {translate("sports")}
        </span>
        <div className="flex flex-col justify-center items-center mt-4">
          <span className="mb-[60px] text-[20px] font-bold text-center">
            {translate("whatSportsAreYou")}
          </span>
          <div className="flex flex-wrap gap-6 max-lg:justify-center">
            {/* Sport 1: Road Cycling */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleSportClick("road-cycling", "Road Cycling", "Road Cycling")
              }
            >
              <img
                src="/img/gym-5.jpg"
                alt="Road Cycling"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("cycling")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Sport 2: Running */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() => handleSportClick("running", "Running", "Running")}
            >
              <img
                src="/img/gym-6.jpg"
                alt="Running"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("running")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Sport 3: Swimming */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleSportClick("swimming", "Swimming", "Swimming")
              }
            >
              <img
                src="/img/gym-7.jpg"
                alt="Swimming"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("teamSports")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>

            {/* Sport 4: Fitness */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleSportClick(
                  "fitness-bodybuilding",
                  "Fitness and Bodybuilding",
                  "Fitness and Bodybuilding",
                )
              }
            >
              <img
                src="/img/gym-8.jpg"
                alt="Fitness"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("fitnessAndBodybuilding")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>
            {/* Sport 5: Functional Training */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleSportClick(
                  "functional-training",
                  "Functional Training",
                  "Functional Training",
                )
              }
            >
              <img
                src="/img/gym-9.jpg"
                alt="Functional Training"
                className="transition-transform duration-300 group-hover:scale-105 max-w-[292px] max-h-[219px]"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("functionalTraining")}
              </span>
              <button className="bg-[#FDC700] font-bold py-1.5 px-3.5 transition-all duration-300 group-hover:bg-[#e0b000]">
                {translate("more")}
              </button>
            </div>
            {/* Sport 5: Functional Training */}
            <div
              className="flex flex-col gap-6 items-center mx-12 max-lg:mx-8 cursor-pointer group"
              onClick={() =>
                handleSportClick("climbing", "Climbing", "Climbing")
              }
            >
              <img
                src="/img/gym-10.jpg"
                alt="Functional Training"
                className="transition-transform duration-300 group-hover:scale-105 max-w-[292px] max-h-[219px]"
              />
              <span className="text-[16px] font-bold text-center">
                {translate("recreationAndOutdoor")}
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
