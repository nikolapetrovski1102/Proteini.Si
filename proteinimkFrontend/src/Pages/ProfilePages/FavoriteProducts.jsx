import { useState, useEffect } from "react";
import { TfiClose } from "react-icons/tfi";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

export default function FavoriteProducts() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { translate } = useLanguage();
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.getFavorites();
      if (response.success) {
        setFavorites(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      const response = await api.removeFromFavorites(productId);
      if (response.success) {
        setFavorites(favorites.filter((fav) => fav.productId !== productId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites. Please try again.");
    }
  };

  const handleKeepShopping = () => {
    navigate("/all-products");
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
        <p className="text-[24px] font-bold mb-[20px] pt-[70px] pr-[50px]">
          {translate("favouriteProducts")}
        </p>
        <div className="bg-white rounded-lg py-6 text-center">
          <p className="text-gray-500">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[740px] pr-[50px] max-lg:pr-0 pb-[70px]">
      <p className="text-[24px] font-bold mb-[20px] pt-[70px] max-sm:pt-0 pr-[50px]">
        {translate("favouriteProducts")} ({favorites.length})
      </p>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg py-12 text-start">
          <p className="text-gray-500 mb-4">
            {translate("noFavoriteProductsYet")}{" "}
          </p>
          <button
            onClick={handleKeepShopping}
            className="w-full bg-[#E5E5E5] font-bold p-[14px] hover:bg-[#D8D8D8] transition-all duration-300 ease-in-out"
          >
            {translate("keepShopping")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.favoriteId}
              className="bg-white rounded-lg py-6 px-4 border border-gray-100"
            >
              <div className="flex justify-between gap-4">
                <div
                  className="w-1/3 cursor-pointer"
                  onClick={() => handleProductClick(favorite.productId)}
                >
                  <img
                    src={favorite.productImage || "/img/placeholder.jpg"}
                    className="w-full object-contain"
                    alt={favorite.productName}
                  />
                </div>
                <div className="w-full flex flex-col items-end">
                  <button
                    onClick={() => handleRemoveFavorite(favorite.productId)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <TfiClose strokeWidth={0.5} color="#828282" size={12} />
                  </button>
                  <div className="w-full text-start mt-2">
                    <p className="text-[12px] mb-[2px] text-[#828282]">
                      {/* Extract brand from product name or add to API */}
                      {favorite.productName?.split(" ")[0] || "Product"}
                    </p>
                    <p
                      className="text-[16px] mb-[2px] font-semibold cursor-pointer hover:text-[#2096D8] transition-colors"
                      onClick={() => handleProductClick(favorite.productId)}
                    >
                      {favorite.productName}
                    </p>
                    <p className="text-[14px] font-bold mt-2">
                      MKD {(favorite.productPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleKeepShopping}
            className="w-full bg-[#E5E5E5] font-bold p-[14px] hover:bg-[#D8D8D8] transition-all duration-300 ease-in-out"
          >
            {translate("keepShopping")}
          </button>
        </div>
      )}
    </div>
  );
}
