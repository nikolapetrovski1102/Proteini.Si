import Tips from "../Tips";
import Video from "../Video";
import NewInTheShop from "./NewInTheShop";
import ProductsOnSale from "./ProductsOnSale";
import ProductsInTheOutlet from "./ProductsInTheOutlet";
import RecommendedForYou from "./RecommendedForYou";
import { useLanguage } from "../translation/LanguageContext";
import ChooseYourGoal from "./ChooseYourGoal";
import WhatSportsAreYouInterestedIn from "./WhatSportsAreYouInterestedIn";
import OutletBranches from "./OutletBranches";

export default function Body() {
  const { translate } = useLanguage();

  return (
    <div className="w-full flex-1">
      {/* New in the shop */}
      <NewInTheShop />

      {/* Products on sale */}
      <ProductsOnSale />

      {/* Upcoming promotions managed from each product in the admin panel */}
      <ProductsOnSale mode="upcoming" />

      {/* Recommended for you */}
      <RecommendedForYou />
      {/* Recommended for you */}

      {/* Products in the outlet */}
      <ProductsInTheOutlet />
      {/* space div */}
      <div className="w-full sm:py-[40px]"></div>
      {/* space div */}

      {/* Choose your goal */}
      <ChooseYourGoal />
      {/* Choose your goal */}

      {/* What sports are you interested in? */}
      <WhatSportsAreYouInterestedIn />
      {/* What sports are you interested in? */}

      {/* Tips */}
      <Tips />
      {/* Tips */}

      {/* Video */}
      <Video />
      {/* Video */}

      {/* outlet  branches purchase process new */}
      <OutletBranches />
      {/* outlet  branches purchase process new */}
    </div>
  );
}
