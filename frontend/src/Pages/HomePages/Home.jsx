import { useEffect } from "react";
import Slider from "../Slider";
import Tips from "../Tips";
import Partners from "../Partners";
import ShareYourExperience from "../ShareYourExperience";
import NewInTheShop from "./NewInTheShop";
import ProductsOnSale from "./ProductsOnSale";
import BecauseYouOrdered from "./BecauseYouOrdered";
import ChooseYourGoal from "./ChooseYourGoal";
import HomeSection from "./sections/HomeSection";
import BrandTicker from "./sections/BrandTicker";
import { WaveEdge } from "./sections/Decor";
// Hidden from the home page for now (kept for re-use):
// import Video from "../Video";
// import OutletBranches from "./OutletBranches"; // sale points now live on /sales-points
// import RecommendedForYou from "./RecommendedForYou";
// import ProductsInTheOutlet from "./ProductsInTheOutlet";
// import WhatSportsAreYouInterestedIn from "./WhatSportsAreYouInterestedIn";

// While the home page is mounted, publishes the sticky header's real height (--header-h) plus the space above the hero
// (--hero-top: promo bar + header) so the hero fills exactly the rest of the screen.
function useHeroHeight() {
  useEffect(() => {
    const root = document.documentElement;

    const header = document.querySelector("header");
    const measure = () => {
      if (!header) return;
      root.style.setProperty("--header-h", `${header.offsetHeight}px`);
      // The promo bar right above the sticky header scrolls away; count it for the first screen.
      const promo = header.previousElementSibling;
      const top = header.offsetHeight + (promo?.offsetHeight || 0);
      root.style.setProperty("--hero-top", `${top}px`);
      // Mobile tab bar fixed to the bottom of the screen: the hero leaves room above it too.
      const tabBar = document.querySelector(".mobile-tab-bar");
      const tabH = tabBar && getComputedStyle(tabBar).display !== "none" ? tabBar.offsetHeight : 0;
      root.style.setProperty("--tabbar-h", `${tabH}px`);
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" && header ? new ResizeObserver(measure) : null;
    observer?.observe(header);
    window.addEventListener("resize", measure);

    return () => {
      root.style.removeProperty("--header-h");
      root.style.removeProperty("--hero-top");
      root.style.removeProperty("--tabbar-h");
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
}

export default function Home() {
  useHeroHeight();

  return (
    <main className="w-full flex-1 text-gray-800 font-montserrat">
      {/* 1. Hero banner carousel (sized to the banner, never cropped) */}
      <Slider />

      {/* 2. What's new */}
      <HomeSection
        id="whats-new"
        tint="bg-[#f6f5f1]"
        image="/img/gym-12.jpg"
        imageOpacity={0.35}
        overlay="home-wash bg-gradient-to-b from-white/70 via-white/40 to-[#f6f5f1]"
        className="sm:py-10"
        reveal={false}
      >
        <NewInTheShop />
      </HomeSection>

      {/* 3. Because you ordered — only for logged-in users with orders */}
      <BecauseYouOrdered />

      {/* Yellow wave that rises over the bottom of whichever section sits above the sale section */}
      <div aria-hidden="true" className="relative z-[2] h-0">
        <WaveEdge position="bottom" fill="#FDC700" className="translate-y-px" />
      </div>

      {/* 4. Products on sale */}
      <HomeSection
        id="on-sale"
        tint="bg-[#FDC700]"
        waveBottom="#3a3a32"
        decor={
          <>
          </>
        }
        className="home-tint-keep pt-5 pb-6 sm:pt-24 sm:pb-32"
        reveal={false}
      >
        <ProductsOnSale />
      </HomeSection>

      {/* 5. Choose your goal (own dark, animated section) */}
      <ChooseYourGoal />

      {/* 6. Tips */}
      <HomeSection id="tips" tint="bg-[#f3f6f8]" reveal={false}>
        <Tips variant="home" />
      </HomeSection>

      {/* Removed for now */}
      {/* <Video /> */}
      {/* <OutletBranches /> */}

      <BrandTicker variant="yellow" />

      {/* 7. Partners & certificates */}
      <Partners />

      {/* 8. Social media */}
      <ShareYourExperience />
    </main>
  );
}
