import { useRef, useState, useEffect } from "react";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { api } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { LargeLoader } from "../Components/Loaders/LargeLoader";

export default function ProductsInTheOutlet() {
  const scrollContainerRef = useRef(null);
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
        (product) => product.productsInTheOutlet === true,
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

  const handleShowAll = () => {
    window.scrollTo(0, 0);
    navigate("/all-products", {
      state: {
        preSelectedFilter: "outlet",
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

  return (
    <>
      <div className="w-full flex justify-center sm:pt-12 px-[25px] mb-12">
        <div className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="max-sm:flex max-sm:justify-between max-sm:items-center max-sm:mb-10">
            <h1 className="sm:text-2xl text-[18px] font-bold sm:mb-10 sm:ml-2.5">
              {translate("productsInTheOutlet")}
            </h1>
            <button
              onClick={handleShowAll}
              className="text-gray-500 text-[13px] font-semibold leading-4 sm:hidden"
            >
              {translate("showAll")}
            </button>
          </div>

          <div className="relative">
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

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scroll-smooth sm:h-[700px] h-[400px]"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "auto",
                scrollBehavior: "smooth",
              }}
            >
              <div className="flex my-[18px] gap-2">
                {products.map((product) => (
                  <ProductCard
                    key={product.product_Id}
                    product={product}
                    onQuickPurchase={() => quickPurchase(product)}
                    onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites[product.product_Id] || false}
                    translate={translate}
                  />
                ))}
              </div>
              <div className="absolute bottom-1/5 left-0 w-full flex justify-center mt-4 max-sm:hidden">
                <button
                  onClick={handleShowAll}
                  className="border border-gray-400 text-gray-500 text-[13px] font-semibold py-[10px] px-[60px] leading-4 hover:border-black hover:text-black transition-all duration-300 ease-in-out"
                >
                  {translate("showAll")}
                </button>
              </div>
            </div>

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
          </div>
        </div>
      </div>

      {quickPurchaseSheet}
    </>
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
        className="flex flex-col p-[10px] pb-[18px] max-md:p-0 md:border md:border-transparent md:group-hover:border-gray-400 relative bg-white sm:h-[480px]"
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
        <span className="font-semibold mb-[2px] text-[16px]">
          MKD {(product.price || 0).toFixed(2)}
        </span>
        <span className="text-[#2096D8] text-[11px] leading-3 font-bold mt-[10px]">
          OUTLET
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
