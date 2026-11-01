import { FaPhoneAlt } from "react-icons/fa";
import { IoIosStarOutline } from "react-icons/io";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import ProductActionModal from "../Components/ProductActionModal";
import { useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";

export default function Landing() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const { translate } = useLanguage();
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Check if user is logged in
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
      const data = await api.getProducts();
      const filteredProducts = data.filter(
        (product) => product.recommendedForYou === true,
      );
      setRecommendedProducts(filteredProducts);

      // Fetch favorites for all products if user is logged in
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  const renderSection = (section) => {
    switch (section.sectionType) {
      case "image":
        return (
          <div key={section.id} className="w-full flex justify-center mt-10">
            <img
              src={getImageUrl(section.imagePath)}
              alt={section.title || "Battery Nutrition"}
              className="w-full max-w-full h-auto"
              onError={(e) => {
                e.target.src = "/img/proteini-landing.jpg";
              }}
            />
          </div>
        );

      case "title":
        return (
          <p key={section.id} className="text-[24px] font-bold mt-10 mb-4">
            {section.title}
          </p>
        );

      case "subtitle":
        return (
          <p key={section.id} className="text-[20px] font-bold mt-8 mb-4">
            {section.title}
          </p>
        );

      case "paragraph":
        return (
          <p key={section.id} className="mt-4 leading-relaxed">
            {section.content}
          </p>
        );

      case "highlight":
        return (
          <p key={section.id} className="mt-4">
            <span className="font-bold">{section.title}:</span>{" "}
            {section.content}
          </p>
        );

      case "italic":
        return (
          <p key={section.id} className="mt-4 italic">
            {section.content}
          </p>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F497D]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center items-center overflow-y-hidden pb-48">
      {/* Top Help Bar */}
      <div className="w-full h-[40px] bg-[#282828] text-white flex justify-center">
        <div className="w-full max-w-[1210px] flex justify-end max-sm:justify-center items-center">
          <span>Need Help?</span>
          <a
            href="tel:+38971399036"
            className="py-[14px] px-[20px] mx-[7px] leading-[20px] flex items-center justify-center gap-2 max-h-[48px] text-white"
          >
            <FaPhoneAlt />
            <span className="max-md:text-[14px]">+389 71 399 036</span>
          </a>
        </div>
      </div>

      {/* Logo Bar */}
      <div className="w-full flex justify-center bg-[#0B0B0B]">
        <div className="w-full max-w-[1240px] flex justify-center py-3">
          <img
            src="/logos/proteinisi-white.svg"
            className="w-[155px] h-[41px] cursor-pointer"
            alt="ProteiniSi"
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      {/* Dynamic Content Sections */}
      <div className="w-full max-w-[1240px] flex flex-col justify-center items-start px-4">
        {sections.length === 0 ? (
          // Fallback to original content if no sections found
          <>
            <img
              src="/img/proteini-landing.jpg"
              className="mt-10"
              alt="Battery Nutrition"
            />
            <div className="w-full">
              <p className="text-[24px] font-bold mt-10 mb-4">
                {translate("aTrustedChoice")}
              </p>
              <span className="bg-[#1F497D] text-white font-semibold px-1">
                {translate("todaysOfferDesc")}
              </span>
              <p className="mt-4">
                Battery Nutrition is a sports nutrition brand that sets the
                standard for quality and effectiveness. We manufacture our
                products in the European Union, where we oversee every step of
                the production process; from sourcing raw materials to the
                finished product.
              </p>
              <p className="mt-4 font-bold">Why Battery Nutrition?</p>
              <p className="mt-4">
                <span className="font-bold">European quality.</span> Our
                products are made in state-of-the-art EU production facilities,
                where we ensure the highest quality control standards. Every
                product is the result of careful development and testing.
              </p>
              <p className="mt-4">
                <span className="font-bold">Proven effectiveness.</span> We
                don't promise miracles, but we do offer proven formulas with
                dosages based on scientific research. From Battery Complete Whey
                with a full 21g of protein per serving to Battery Creatine
                Reload+ which contains not just creatine, but also L-leucine and
                electrolytes. Every product we put on our virtual and physical
                shelves is designed to deliver concrete results.
              </p>
              <p className="mt-4">
                <span className="font-bold">Transparency.</span> On every label
                you'll find the complete composition, clear dosages and usage
                instructions. No secrets, completely transparent.
              </p>
              <p className="mt-4">
                <span className="font-bold">Complete range.</span> From
                proteins, creatine and amino acids to vitamins and minerals -
                Battery Nutrition covers all the needs of an active lifestyle.
                One brand, complete support!
              </p>
              <p className="mt-4">
                <span className="font-bold">Flavours that excite!</span> Fruity,
                sweet, tropical – we develop different flavour profiles because
                we want everyone to find something they love, and because
                sticking to your routine also means enjoying every serving.
              </p>
              <p className="mt-4 italic">
                Battery Nutrition is more than sports nutrition. It's a brand
                that understands your needs, respects your effort and supports
                every step of your journey toward your goals.
              </p>
            </div>
          </>
        ) : (
          sections.map((section) => renderSection(section))
        )}
      </div>

      {/* Recommended Products Section */}
      <div className="w-full max-w-[1240px] flex flex-col justify-center items-center px-4 mt-10 mb-10">
        <h2 className="text-2xl font-bold mb-6">
          {translate("recommendedForYou")}
        </h2>

        {productsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F497D]"></div>
          </div>
        ) : recommendedProducts.length === 0 ? (
          <p className="text-gray-500 py-10">
            {translate("noRecommendedProducts")}
          </p>
        ) : (
          <div className="grid w-full grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {recommendedProducts.map((product) => (
              <div
                key={product.product_Id}
                className="group relative bg-white"
              >
                <a
                  href={`/product/${product.product_Id}`}
                  className="flex flex-col p-[10px] pb-[18px] max-md:p-0 border border-transparent group-hover:border-gray-400 relative bg-white"
                  style={{ borderBottom: "none" }}
                >
                  {product.img ? (
                    <img
                      src={`${product.img}`}
                      className="w-full aspect-square object-cover"
                      alt={product.name}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                      {translate("noImage")}
                    </div>
                  )}
                  <span className="text-[10px] mt-[10px]">
                    {product.category || "Product"}
                  </span>
                  <span className="font-semibold text-[18px] leading-[22px] mb-[2px] break-words line-clamp-2">
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
                    <span className="text-xs">
                      {translate("moreAboutRatings")}
                    </span>
                  </div>
                  <span className="font-semibold text-lg mb-[2px]">
                    MKD {(product.price || 0).toFixed(2)}
                  </span>
                  <span className="text-[#2096D8] text-[11px] leading-3 font-bold mt-[10px]">
                    {translate("recommended")}
                  </span>
                </a>

                <div
                  className="absolute left-0 w-full bg-white border border-gray-400 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible max-lg:hidden"
                  style={{
                    top: "calc(100% - 22px)",
                    borderTop: "none",
                  }}
                >
                  <div className="p-4 flex flex-col justify-between h-[139px]">
                    {(Number(product.gPerServing) > 0 || Number(product.servings) > 0) && (
                      <span className="text-sm">
                        {Number(product.gPerServing) > 0 && `${product.gPerServing}g per serving`}
                        {Number(product.gPerServing) > 0 && Number(product.servings) > 0 && " | "}
                        {Number(product.servings) > 0 && `${product.servings} servings`}
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setModalQuantity(1);
                          setIsModalOpen(true);
                        }}
                        className="bg-[#E5E5E5] hover:bg-[#d8d8d8] font-bold py-[13px] px-[16px] cursor-pointer"
                      >
                        Quick purchase
                      </button>
                      <button
                        type="button"
                        onClick={(e) =>
                          handleToggleFavorite(product.product_Id, e)
                        }
                        className="cursor-pointer"
                      >
                        {favorites[product.product_Id] ? (
                          <FaHeart size={22} color="#1b88c5" />
                        ) : (
                          <FiHeart size={22} color="#1b88c5" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Action Modal */}
      <ProductActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalQuantity(1);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleNavigationToProductDetails}
        title="Quick Purchase"
        addButtonText="Add to Cart"
        addButtonColor="bg-[#F7C201]"
        addButtonHoverColor="hover:bg-[#e0b401]"
        addButtonTextColor="text-black"
        removeButtonText="View article"
        removeButtonColor="bg-[#dadada]"
        removeButtonTextColor="text-black"
        removeButtonHoverColor="hover:bg-[#c0c0c0]"
      />
    </div>
  );
}
