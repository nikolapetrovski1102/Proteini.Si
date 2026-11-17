import { FiPhone } from "react-icons/fi";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { fetchRecommendedCards } from "../../utils/salePricing";
import { Link, useNavigate } from "react-router-dom";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { useLanguage } from "../translation/LanguageContext";
import { BrandLoader, InlineLoader } from "../Components/Loaders/BrandLoader";
import HomeProductCard from "./HomeProductCard";
import Reveal from "./sections/Reveal";
import { notify } from "../Components/Feedback/siteFeedback";

const FALLBACK_IMAGE = "/img/proteini-landing.jpg";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${imagePath}`;
  return imagePath;
};

// Content shown when the admin has not set up any landing sections yet.
const FALLBACK_SECTIONS = [
  { id: "f-img", sectionType: "image", imagePath: FALLBACK_IMAGE, title: "Battery Nutrition" },
  { id: "f-title", sectionType: "title", titleKey: "aTrustedChoice" },
  { id: "f-offer", sectionType: "offer", contentKey: "todaysOfferDesc" },
  {
    id: "f-intro",
    sectionType: "paragraph",
    content:
      "Battery Nutrition is a sports nutrition brand that sets the standard for quality and effectiveness. We manufacture our products in the European Union, where we oversee every step of the production process; from sourcing raw materials to the finished product.",
  },
  { id: "f-why", sectionType: "subtitle", title: "Why Battery Nutrition?" },
  {
    id: "f-h1",
    sectionType: "highlight",
    title: "European quality",
    content:
      "Our products are made in state-of-the-art EU production facilities, where we ensure the highest quality control standards. Every product is the result of careful development and testing.",
  },
  {
    id: "f-h2",
    sectionType: "highlight",
    title: "Proven effectiveness",
    content:
      "We don't promise miracles, but we do offer proven formulas with dosages based on scientific research. From Battery Complete Whey with a full 21g of protein per serving to Battery Creatine Reload+ which contains not just creatine, but also L-leucine and electrolytes. Every product we put on our virtual and physical shelves is designed to deliver concrete results.",
  },
  {
    id: "f-h3",
    sectionType: "highlight",
    title: "Transparency",
    content:
      "On every label you'll find the complete composition, clear dosages and usage instructions. No secrets, completely transparent.",
  },
  {
    id: "f-h4",
    sectionType: "highlight",
    title: "Complete range",
    content:
      "From proteins, creatine and amino acids to vitamins and minerals - Battery Nutrition covers all the needs of an active lifestyle. One brand, complete support!",
  },
  {
    id: "f-h5",
    sectionType: "highlight",
    title: "Flavours that excite!",
    content:
      "Fruity, sweet, tropical – we develop different flavour profiles because we want everyone to find something they love, and because sticking to your routine also means enjoying every serving.",
  },
  {
    id: "f-quote",
    sectionType: "italic",
    content:
      "Battery Nutrition is more than sports nutrition. It's a brand that understands your needs, respects your effort and supports every step of your journey toward your goals.",
  },
];

/** Consecutive "highlight" sections are merged into one group so they can render as a card grid. */
const groupSections = (sections) =>
  sections.reduce((groups, section) => {
    const last = groups[groups.length - 1];
    if (section.sectionType === "highlight" && last?.sectionType === "highlights") {
      last.items.push(section);
    } else if (section.sectionType === "highlight") {
      groups.push({ id: `hl-${section.id}`, sectionType: "highlights", items: [section] });
    } else {
      groups.push(section);
    }
    return groups;
  }, []);

function LandingBlock({ section, translate }) {
  const title = section.titleKey ? translate(section.titleKey) : section.title;
  const content = section.contentKey ? translate(section.contentKey) : section.content;

  switch (section.sectionType) {
    case "image":
      return (
        <div className="overflow-hidden rounded-2xl bg-[#f6f5f1] ring-1 ring-black/[0.06]">
          <img
            src={getImageUrl(section.imagePath)}
            alt={section.title || "Battery Nutrition"}
            className="h-auto w-full"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>
      );

    case "title":
      return (
        <h1 className="font-display text-[32px] font-bold uppercase leading-[0.95] tracking-tight text-gray-900 [text-wrap:balance] sm:text-5xl">
          {title}
        </h1>
      );

    case "subtitle":
      return (
        <h2 className="flex items-center gap-3 pt-4 font-display text-[22px] font-bold uppercase leading-tight tracking-tight text-gray-900 sm:text-[28px]">
          <span aria-hidden="true" className="h-[3px] w-8 flex-shrink-0 rounded-full bg-[#FDC700]" />
          {title}
        </h2>
      );

    case "offer":
      return (
        <p className="inline-block -rotate-1 rounded-md bg-[#141409] px-3 py-2 text-[14px] font-semibold leading-snug text-[#FDC700] sm:text-[15px]">
          {content}
        </p>
      );

    case "paragraph":
      return <p className="text-[15px] leading-[1.75] text-gray-700 sm:text-base">{content}</p>;

    case "highlights":
      return (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {section.items.map((item, i) => (
            <Reveal key={item.id} delay={80 * i} className={section.items.length % 2 && i === section.items.length - 1 ? "sm:col-span-2" : ""}>
              <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] sm:p-6">
                <span className="font-display text-[13px] font-semibold tracking-wide text-[#b38c00]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-[16px] font-bold leading-snug text-gray-900 sm:text-[17px]">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.content}</p>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#FDC700] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
              </div>
            </Reveal>
          ))}
        </div>
      );

    case "italic":
      return (
        <blockquote className="relative rounded-2xl bg-[#141409] px-6 pb-7 pt-10 text-white sm:px-10 sm:pb-9 sm:pt-12">
          <span aria-hidden="true" className="absolute left-5 top-1 font-display text-[72px] leading-none text-[#FDC700] sm:left-8 sm:text-[88px]">
            “
          </span>
          <p className="text-[16px] font-medium italic leading-relaxed sm:text-[19px]">{content}</p>
        </blockquote>
      );

    default:
      return null;
  }
}

export default function Landing() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const { translate, language } = useLanguage();

  const isAuthenticated = api.isAuthenticated();

  useEffect(() => {
    fetchSections();
    fetchRecommendedProducts();
  }, []);

  const fetchSections = async () => {
    try {
      const data = await api.getLandingPageSections();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    setProductsLoading(true);
    try {
      // Only the recommended products, through the shop filter so each card carries its packaging's own sale price.
      const filteredProducts = await fetchRecommendedCards(api);
      setRecommendedProducts(filteredProducts);

      if (isAuthenticated && filteredProducts.length > 0) {
        await fetchAllFavorites(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAllFavorites = async (productsList) => {
    const favoriteStatus = {};
    for (const product of productsList) {
      try {
        const response = await api.isFavorite(product.product_Id);
        favoriteStatus[product.product_Id] = response.isFavorite;
      } catch (error) {
        console.error("Error checking favorite:", error);
        favoriteStatus[product.product_Id] = false;
      }
    }
    setFavorites((prev) => ({ ...prev, ...favoriteStatus }));
  };

  const handleToggleFavorite = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notify(translate("favoritesLoginRequired"));
      navigate("/login");
      return;
    }

    try {
      const response = await api.toggleFavorite(productId);
      if (response.success) {
        setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notify(translate("favoritesUpdateFailed"), { tone: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <BrandLoader variant="shaker" size={120} />
      </div>
    );
  }

  const blocks = groupSections(sections.length === 0 ? FALLBACK_SECTIONS : sections);
  // A leading image becomes the hero; the rest of the content sits in a reading column.
  const [hero, ...body] = blocks[0]?.sectionType === "image" ? blocks : [null, ...blocks];

  return (
    <main className="landing-page w-full font-montserrat text-gray-800">
      {/* Top bar: logo + help line */}
      <div className="w-full bg-[#141409] text-white">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-[25px]">
          <Link
            to="/"
            aria-label="Proteini.si"
            className="flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-4 focus-visible:ring-offset-[#141409]"
          >
            <img src="/logos/proteinisi-white.svg" className="h-auto w-[118px] sm:w-[150px]" alt="Proteini.si" />
          </Link>
          <a
            href="tel:+38971399036"
            className="group flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12px] font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] sm:pr-4 sm:text-[13px]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
              <FiPhone className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="hidden text-[11px] font-medium text-white/60 sm:block">{translate("needHelp")}?</span>
              <span className="whitespace-nowrap">+389 71 399 036</span>
            </span>
          </a>
        </div>
      </div>

      {/* Hero image */}
      {hero && (
        <div className="w-full bg-gradient-to-b from-[#141409] from-40% to-transparent to-40% px-4 pt-4 sm:px-[25px] sm:pt-6">
          <Reveal className="mx-auto max-w-[1240px]">
            <LandingBlock section={hero} translate={translate} />
          </Reveal>
        </div>
      )}

      {/* Article */}
      <article className="mx-auto flex w-full max-w-[820px] flex-col gap-5 px-4 py-10 sm:gap-6 sm:px-[25px] sm:py-16">
        {body.map((section) => (
          <Reveal key={section.id}>
            <LandingBlock section={section} translate={translate} />
          </Reveal>
        ))}
      </article>

      {/* Recommended products */}
      <section className="w-full bg-[#f6f5f1] px-4 py-10 sm:px-[25px] sm:py-16">
        <div className="mx-auto max-w-[1240px]">
          <h2 className="mb-5 font-display text-[30px] font-bold uppercase leading-[0.95] tracking-tight text-gray-900 sm:mb-8 sm:text-5xl">
            {translate("recommendedForYou")}
          </h2>

          {productsLoading ? (
            <div className="flex items-center justify-center py-10">
              <InlineLoader size={36} />
            </div>
          ) : recommendedProducts.length === 0 ? (
            <p className="py-10 text-gray-500">{translate("noRecommendedProducts")}</p>
          ) : (
            <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <HomeProductCard
                  key={product.product_Id}
                  product={product}
                  fluid
                  language={language}
                  onQuickPurchase={() => quickPurchase(product)}
                  onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites[product.product_Id] || false}
                  translate={translate}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {quickPurchaseSheet}
    </main>
  );
}
