import { useState, useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import HomeProductCard from "./HomeProductCard";
import HomeProductRail from "./HomeProductRail";

export default function NewInTheShop() {
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
      const filteredProducts = data.filter(
        (product) => product.newInTheShop === true,
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
  }, []);

  const handleShowAll = () => {
    window.scrollTo(0, 0);
    navigate("/all-products", {
      state: {
        preSelectedFilter: "newProducts",
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
      <div className="w-full flex justify-center pt-12 px-[25px] max-sm:px-4">
        <div className="w-full max-w-[1240px] text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div></div>;
  }

  return (
    <>
      <section className="w-full flex justify-center px-[25px] pt-8 pb-2 max-sm:px-4 sm:py-12">
        <div className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-7">
            <h2 className="font-display font-bold uppercase tracking-tight text-[30px] leading-[0.95] text-gray-900 [text-wrap:balance] sm:text-5xl">
              {translate("newInTheShop")}
            </h2>
            <button
              type="button"
              onClick={handleShowAll}
              className="group flex min-h-[40px] flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white/70 px-4 text-[12px] font-bold text-gray-800 transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
            >
              {translate("showAll")}
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <HomeProductRail label="new products">
            {products.map((product) => (
              <HomeProductCard
                key={product.product_Id}
                product={product}
                tag={translate("new")}
                onQuickPurchase={() => quickPurchase(product)}
                onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites[product.product_Id] || false}
                translate={translate}
              />
            ))}
          </HomeProductRail>
        </div>
      </section>

      {quickPurchaseSheet}
    </>
  );
}
