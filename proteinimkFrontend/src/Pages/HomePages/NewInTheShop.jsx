import { useRef, useState, useEffect } from "react";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import ProductActionModal from "../Components/ProductActionModal";
import { useCart } from "../Hooks/useCart";
import { LargeLoader } from "../Components/Loaders/LargeLoader";
import { isSaleActive } from "../../utils/salePricing";

export default function NewInTheShop() {
  const scrollContainerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const [, setAdding] = useState(false);
  const [favorites, setFavorites] = useState({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [, setModalQuantity] = useState(1);

  // Check if user is logged in
  const isAuthenticated = api.isAuthenticated();

  const handleAddToCart = async (product, quantity) => {
    setAdding(true);
    const success = await addToCart(product.product_Id, quantity, product);
    setAdding(false);

    if (success) {
      alert(`${quantity} x ${product.name} added to cart!`);
      setIsModalOpen(false);
    } else {
      alert("Failed to add to cart. Please login.");
    }
  };

  const handleNavigationToProductDetails = (product) => {
    const productId = product?.product_Id || product?.id || product?._id;

    if (productId) {
      navigate(`/product/${productId}`);
      setIsModalOpen(false);
      window.scrollTo(0, 0);
    } else {
      console.error("No product ID found", product);
    }
  };

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
      <section className="w-full flex justify-center py-12 px-[25px] max-sm:px-4">
        <div className="w-full max-w-[1240px] flex flex-col justify-center">
          <div className="mb-7 flex items-center justify-between">
            <h1 className="text-[18px] font-bold sm:text-2xl">
              {translate("newInTheShop")}
            </h1>
            <button
              onClick={handleShowAll}
              className="text-[13px] font-semibold leading-4 text-gray-500 hover:text-black sm:hidden"
            >
              {translate("showAll")}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll new products left"
              className="absolute -left-3 top-[42%] z-10 -translate-y-1/2 bg-white/90 p-2 shadow-sm transition hover:bg-gray-100 sm:-left-6 sm:p-3"
            >
              <img
                src="/logos/left-arrow.svg"
                alt="Scroll left"
                className="w-8 h-8"
              />
            </button>

            <div
              ref={scrollContainerRef}
              className="overflow-x-auto overflow-y-hidden scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "auto",
                scrollBehavior: "smooth",
              }}
            >
              <div className="flex gap-4 pb-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.product_Id}
                    product={product}
                    onQuickPurchase={() => {
                      setSelectedProduct(product);
                      setModalQuantity(1);
                      setIsModalOpen(true);
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites[product.product_Id] || false}
                    translate={translate}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll new products right"
              className="absolute -right-3 top-[42%] z-10 -translate-y-1/2 bg-white/90 p-2 shadow-sm transition hover:bg-gray-100 sm:-right-6 sm:p-3"
            >
              <img
                src="/logos/right-arrow.svg"
                alt="Scroll right"
                className="w-8 h-8"
              />
            </button>
          </div>

          <div className="mt-7 hidden justify-center sm:flex">
            <button
              type="button"
              onClick={handleShowAll}
              className="border border-gray-400 px-14 py-2.5 text-[13px] font-semibold leading-4 text-gray-600 transition hover:border-black hover:text-black"
            >
              {translate("showAll")}
            </button>
          </div>
        </div>
      </section>

      <ProductActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalQuantity(1);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleNavigationToProductDetails}
        title=""
        addButtonText={translate("addToCart")}
        addButtonColor="bg-[#F7C201]"
        addButtonHoverColor="hover:bg-[#e0b401]"
        addButtonTextColor="text-black"
        removeButtonText={translate("viewArticle")}
        removeButtonColor="bg-[#dadada]"
        removeButtonTextColor="text-black"
        removeButtonHoverColor="hover:bg-[#c0c0c0]"
      />
    </>
  );
}

// ProductCard component with FAVORITE functionality
function ProductCard({
  product,
  onQuickPurchase,
  onToggleFavorite,
  isFavorite,
  translate,
}) {
  const regularPrice = Number(product.price) || 0;
  const salePrice = isSaleActive(product)
    ? Number(product.compare_Price) || 0
    : 0;
  const hasDiscount = salePrice > 0 && salePrice < regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  return (
    <article className="group relative w-[156px] flex-shrink-0 bg-white sm:w-[292px]">
      <a
        href={"/product/" + product.product_Id}
        className="relative flex h-full flex-col"
      >
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-3">
          {discountPercentage > 0 && (
            <span className="absolute left-2 top-2 z-10 bg-red-600 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
              -{discountPercentage}%
            </span>
          )}
          {product.img ? (
            <img
              src={String(product.img)}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
              alt={product.name}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>
        <span className="mt-3 text-[10px] uppercase tracking-wide text-gray-500">
          {product.category || "Product"}
        </span>
        <span className="mb-1 min-h-[44px] max-h-[44px] overflow-hidden text-[13px] font-semibold leading-[20px] sm:text-[15px] sm:leading-[22px]">
          {product.name}
        </span>
        <div className="mb-1 flex items-center gap-2">
          <span className="flex text-yellow-400">
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
            <IoIosStarOutline />
          </span>
          <span className="hidden text-[10px] text-gray-500 sm:inline">
            {translate("moreAboutRatings")}
          </span>
        </div>
        {hasDiscount ? (
          <span className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
            <span className="font-bold text-red-600">
              MKD {salePrice.toFixed(2)}
            </span>
            <span className="text-[11px] text-gray-400 line-through">
              MKD {regularPrice.toFixed(2)}
            </span>
          </span>
        ) : (
          <span className="text-[15px] font-bold">
            MKD {regularPrice.toFixed(2)}
          </span>
        )}
        <span className="mt-1.5 text-[10px] font-bold leading-3 text-[#2096D8]">
          {translate("new")}
        </span>
      </a>

      <div className="mt-3 hidden items-center justify-between border-t border-gray-100 pt-3 sm:flex">
        <button
          type="button"
          onClick={onQuickPurchase}
          className="bg-gray-100 px-3 py-2 text-xs font-bold transition hover:bg-gray-200"
        >
          {translate("quickPurchase")}
        </button>
        <button
          type="button"
          onClick={(event) => onToggleFavorite(product.product_Id, event)}
          className="p-2"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (
            <FaHeart size={20} color="#1b88c5" />
          ) : (
            <FiHeart size={20} color="#1b88c5" strokeWidth={2} />
          )}
        </button>
      </div>
    </article>
  );
}
