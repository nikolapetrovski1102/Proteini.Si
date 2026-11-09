import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import { isSaleActive } from "../../utils/salePricing";
import HomeProductCard from "./HomeProductCard";
import HomeProductRail from "./HomeProductRail";
import Reveal from "./sections/Reveal";
import { Starburst } from "./sections/Decor";

export default function ProductsOnSale({ mode = "sale" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const [favorites, setFavorites] = useState({});


  // Check if user is logged in
  const isAuthenticated = api.isAuthenticated();



  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      const filteredProducts = data.filter((product) =>
        mode === "upcoming"
          ? product.upcomingPromotion === true
          : isSaleActive(product),
      );
      setProducts(filteredProducts);
      setError(null);

      // Fetch favorites for all products if user is logged in
      if (isAuthenticated && filteredProducts.length > 0) {
        await fetchAllFavorites(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
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
    setFavorites(favoriteStatus);
  };

  const handleToggleFavorite = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Please login to add products to favorites");
      navigate("/login");
      return;
    }

    try {
      const response = await api.toggleFavorite(productId);
      if (response.success) {
        setFavorites((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites. Please try again.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [mode]);

  const handleShowAll = () => {
    window.scrollTo(0, 0);
    navigate("/all-products", {
      state: {
        preSelectedFilter: mode === "upcoming" ? "upcomingPromotions" : "onSale",
        filterValue: true,
      },
    });
  };

  if (loading) {
    return (
      <div
        className="w-full flex justify-center items-center px-[25px]"
        style={{ height: "400px" }}
      >
        <LargeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center pt-12 px-[25px]">
        <div className="w-full max-w-[1240px] text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div></div>;
  }

  const upcoming = mode === "upcoming";
  const maxDiscount = upcoming
    ? 0
    : products.reduce((max, product) => {
        const regular = Number(product.price) || 0;
        const sale = Number(product.compare_Price) || 0;
        return sale > 0 && sale < regular ? Math.max(max, Math.round(((regular - sale) / regular) * 100)) : max;
      }, 0);

  return (
    <>
      <div className="w-full flex justify-center px-[25px] pb-8 max-sm:px-4 sm:pb-12">
        <Reveal once={false} className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-7">
            <div className="min-w-0">
              <div className="flex items-center gap-3 sm:gap-5">
                <h2 className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-[#141409] [text-wrap:balance] sm:text-5xl">
                  {translate(upcoming ? "upcomingPromotions" : "productsOnSale")}
                </h2>
                {maxDiscount > 0 && (
                  <Starburst
                    color="#E3262F"
                    textColor="#ffffff"
                    spikes={16}
                    rotate={10}
                    className="hidden h-[84px] w-[84px] flex-shrink-0 sm:inline-flex"
                  >
                    <span className="block text-[11px] font-semibold">{translate("upTo")}</span>
                    <span className="block text-[22px]">−{maxDiscount}%</span>
                  </Starburst>
                )}
              </div>
              <p className="mt-2 text-[13px] font-semibold text-[#141409]/75 sm:text-sm">
                {products.length} {translate("homeProductsCount")}
                {maxDiscount > 0 && (
                  <>
                    {" · "}
                    {translate("upTo").toLowerCase()} −{maxDiscount}%
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleShowAll}
              className="group flex min-h-[40px] flex-shrink-0 items-center gap-1.5 rounded-full border border-[#141409]/25 bg-white/50 px-4 text-[12px] font-bold text-[#141409] transition hover:border-[#141409] hover:bg-[#141409] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
            >
              {translate("showAll")}
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <HomeProductRail label={upcoming ? "upcoming promotions" : "products on sale"}>
            {products.map((product) => (
              <HomeProductCard
                key={product.product_Id}
                product={product}
                tag={upcoming ? translate("soon") : null}
                showSaleEnd={!upcoming}
                onQuickPurchase={() => quickPurchase(product)}
                onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites[product.product_Id] || false}
                translate={translate}
              />
            ))}
          </HomeProductRail>
        </Reveal>
      </div>

      {quickPurchaseSheet}
    </>
  );
}
