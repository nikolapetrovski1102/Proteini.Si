import { useRef, useState, useEffect } from "react";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { LargeLoader } from "../Components/Loaders/LargeLoader";

export default function RecommendedForYou() {
  const scrollContainerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const [favorites, setFavorites] = useState({});


  // Check if user is logged in
  const isAuthenticated = api.isAuthenticated();



  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      const filteredProducts = data.filter(
        (product) => product.recommendedForYou === true,
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

  const handleRegisterNavigation = () => {
    navigate("/login");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 1240;

      let newScrollPosition;
      if (direction === "left") {
        newScrollPosition = container.scrollLeft - scrollAmount;
      } else {
        newScrollPosition = container.scrollLeft + scrollAmount;
      }

      const maxScroll = container.scrollWidth - container.clientWidth;
      newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll));

      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div
        className="w-full flex justify-center items-center py-12 px-[25px]"
        style={{ height: "400px" }}
      >
        <LargeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-12 px-[25px]">
        <div className="w-full max-w-[1240px] text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex justify-center py-12 px-[25px] max-sm:py-0 max-sm:px-4">
        <div className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="flex flex-col gap-2 text-center">
            <span className="sm:text-2xl text-[18px] font-bold max-sm:text-start">
              {translate("recomendedForYou")}
            </span>
            <p className="max-sm:hidden">
              {translate("rfydesc1")} <br />
              {translate("rfydesc2")}
              <Link to="/login" className="text-[#1b88c5] font-bold">
                {translate("rfydesc3")}
              </Link>
            </p>
          </div>

          <div className="relative">
            {products.length > 0 && (
              <button
                onClick={() => scroll("left")}
                className="absolute -left-8 top-1/4 -translate-y-1/2 z-10 bg-[#FFFFFF99] hover:bg-gray-100 p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/logos/left-arrow.svg"
                  alt="Scroll left"
                  className="w-8 h-8"
                />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scroll-smooth sm:h-[700px] h-[400px] max-sm:overflow-y-hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "auto",
                scrollBehavior: "smooth",
              }}
            >
              <div className="flex sm:m-[18px] gap-[18px]">
                <a className="block flex-shrink-0">
                  <div className="relative flex flex-col p-[10px] pb-[18px] group w-[180px] sm:w-[303px]">
                    <div className="flex flex-col items-start transition-opacity duration-300 group-hover:opacity-0 max-sm:group-hover:opacity-100">
                      <img
                        src="/img/rfy-girl.jpg"
                        className="mx-[5.5px]"
                        alt="Register"
                      />
                      <span className="block sm:text-lg text-[13px] font-semibold my-4 leading-[22px]">
                        {translate("registerForABetterExperience")}
                      </span>
                    </div>

                    <div className="absolute top-0 left-0 w-full flex flex-col items-start justify-start p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gray-100 z-20 max-sm:hidden">
                      <span className="text-lg font-semibold mb-[22px]">
                        {translate("registeredUsersHave")}
                      </span>
                      <ul className="space-y-4">
                        <li className="relative pl-4 text-[17px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['•']">
                          {translate("goalOrientedProducts")}
                        </li>
                        <li className="relative pl-4 text-[17px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['•']">
                          {translate("exclusiveBenefits")}
                        </li>
                        <li className="relative pl-4 text-[17px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['•']">
                          {translate("loyaltyPoints")}
                        </li>
                        <li className="relative pl-4 text-[17px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['•']">
                          {translate("fastOrdering")}
                        </li>
                        <li className="relative pl-4 text-[17px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:content-['•']">
                          {translate("listOfFavourites")}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    className="mt-auto bg-[#2096D8] max-w-[160px] text-white font-semibold leading-5 p-[14px] max-sm:p-[9px] max-sm:text-[12px] text-nowrap"
                    onClick={handleRegisterNavigation}
                  >
                    {translate("register")}
                  </button>
                </a>

                {products.length === 0 ? (
                  <div className="text-center text-gray-500">
                    {translate("noRecommendedProducts")}
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard
                      key={product.product_Id}
                      product={product}
                      onQuickPurchase={() => quickPurchase(product)}
                      onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites[product.product_Id] || false}
                      translate={translate}
                    />
                  ))
                )}
              </div>
            </div>

            {products.length > 0 && (
              <button
                onClick={() => scroll("right")}
                className="absolute -right-8 top-1/4 -translate-y-1/2 z-10 bg-[#FFFFFF99] hover:bg-gray-100 p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/logos/right-arrow.svg"
                  alt="Scroll right"
                  className="w-8 h-8"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {quickPurchaseSheet}
    </div>
  );
}

// ProductCard component with FAVORITE functionality
function ProductCard({
  product,
  onQuickPurchase,
  onQuickPurchaseIntent,
  onToggleFavorite,
  isFavorite,
  translate,
}) {
  return (
    <div className="group relative inline-block bg-white flex-shrink-0 w-[161px] sm:w-[350px]">
      <Link
        to={`/product/${product.product_Id}`}
        className="flex flex-col p-[10px] pb-[18px]  md:border md:border-transparent md:group-hover:border-gray-400 relative bg-white sm:h-[480px]"
        style={{ borderBottom: "none" }}
      >
        {product.img ? (
          <img src={`${product.img}`} className="w-full" alt={product.name} />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        <span className="text-[10px] mt-[10px]">
          {product.category || "Product"}
        </span>
        <span className="mb-[2px] min-h-[44px] max-h-[44px] overflow-hidden font-semibold sm:text-[18px] text-[13px] leading-[22px]">
          {product.name}
        </span>
        <div className="flex flex-col">
          <span className="flex text-yellow-400 mb-1">
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
          </span>
          <span className="text-xs">{translate("moreAboutRatings")}</span>
        </div>
        <span className="font-semibold sm:text-lg text-[16px] mb-[2px]">
          MKD {(product.price || 0).toFixed(2)}
        </span>
        <span className="text-[#2096D8] text-[11px] leading-3 font-bold mt-[10px]">
          {translate("recommended")}
        </span>
      </Link>

      <div
        className="absolute left-0 w-full bg-white border border-gray-400 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible max-md:hidden"
        style={{
          top: "calc(100% - 1px)",
          borderTop: "none",
        }}
      >
        <div className="p-4 flex flex-col justify-between h-[139px]">
          {(Number(product.gPerServing) > 0 || Number(product.servings) > 0) && (
            <span className="text-sm">
              {Number(product.gPerServing) > 0 && `${product.gPerServing}g ${translate("perServing")}`}
              {Number(product.gPerServing) > 0 && Number(product.servings) > 0 && " | "}
              {Number(product.servings) > 0 && `${product.servings} ${translate("servings")}`}
            </span>
          )}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickPurchase();
              }}
              onPointerEnter={onQuickPurchaseIntent}
              onFocus={onQuickPurchaseIntent}
              className="bg-[#E5E5E5] hover:bg-[#d8d8d8] font-bold py-[13px] px-[16px] cursor-pointer"
            >
              {translate("quickPurchase")}
            </button>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product.product_Id, e)}
              className="cursor-pointer"
            >
              {isFavorite ? (
                <FaHeart size={22} color="#1b88c5" />
              ) : (
                <FiHeart size={22} color="#1b88c5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
