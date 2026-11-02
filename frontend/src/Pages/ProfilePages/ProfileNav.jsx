import { FaAngleRight } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../translation/LanguageContext";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function ProfileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { translate, language } = useLanguage();
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Check if user is SuperAdmin - checking both camelCase and PascalCase
  const isSuperAdmin =
    user?.superAdmin === true ||
    user?.superAdmin === 1 ||
    user?.SuperAdmin === true ||
    user?.SuperAdmin === 1;

  // Get current path to apply active styles
  const currentPath = location.pathname;

  // Fetch favorite count
  const fetchFavoriteCount = async () => {
    if (!api.isAuthenticated()) return;

    try {
      const response = await api.getFavorites();
      if (response.success) {
        setFavoriteCount(response.totalCount || response.data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
      setFavoriteCount(0);
    }
  };

  // Fetch order count
  const fetchOrderCount = async () => {
    if (!api.isAuthenticated()) return;

    try {
      const response = await api.getOrderHistory();
      // Check the response structure from your API
      if (response.status && response.orders) {
        setOrderCount(response.orders.length);
      } else if (response.orders) {
        setOrderCount(response.orders.length);
      } else if (response.data && Array.isArray(response.data)) {
        setOrderCount(response.data.length);
      } else if (Array.isArray(response)) {
        setOrderCount(response.length);
      } else {
        setOrderCount(0);
      }
    } catch (error) {
      console.error("Error fetching order count:", error);
      setOrderCount(0);
    }
  };

  // Fetch loyalty points using the real API
  const fetchLoyaltyPoints = async () => {
    if (!api.isAuthenticated()) return;

    try {
      const response = await api.getLoyaltySummary();
      if (response.status && response.data) {
        // Use availablePoints (not expired or redeemed)
        setLoyaltyPoints(Math.floor(response.data.availablePoints || 0));
      } else {
        setLoyaltyPoints(0);
      }
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
      setLoyaltyPoints(0);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin && api.isAuthenticated()) {
      fetchFavoriteCount();
      fetchOrderCount();
      fetchLoyaltyPoints();
    }
  }, [isSuperAdmin, user?.user_Id]);

  return (
    <div className="max-w-[215px] w-full pt-[80px] max-sm:pt-8">
      <div className="w-full">
        <p className="text-[14px] leading-[17px] font-bold border-b border-[#E5E5E5] pb-[12px] pl-[10px]">
          {user?.user_FullName || user?.User_FullName || "User"}
        </p>

        {isSuperAdmin ? (
          // SuperAdmin View - Show only Admin Panel
          <div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-categories" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-categories")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                Categories & filters
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-promotions" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-promotions")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                Promotions & coupons
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-gallery" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-panel")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminPanel")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-orders" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-orders")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                Admin Orders
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-panel" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-gallery")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminGallery")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-instagram-gallery"
                  ? "bg-[#2096D8]/10"
                  : ""
              }`}
              onClick={() => handleNavigation("/admin-instagram-gallery")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminInstagramGallery")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-youtube" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-youtube")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminYoutube")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-partners" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-partners")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminPartners")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-about-company" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-about-company")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminAboutCompany")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin-landing-page" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/admin-landing-page")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                {translate("adminLanding")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/admin/dynamic-content"
                  ? "bg-[#2096D8]/10"
                  : ""
              }`}
              onClick={() => handleNavigation("/admin/dynamic-content")}
            >
              <span className="text-[12px] group-hover:text-[#828282] font-bold uppercase">
                Admin TOS & General Provisions
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
          </div>
        ) : (
          // Regular User View - Show profile options
          <>
            <div
              className={`flex w-full justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/profile" ? "bg-[#2096D8]/10" : ""
              }`}
              onClick={() => handleNavigation("/profile")}
            >
              <span
                className={`text-[12px] group-hover:text-[#828282] uppercase ${
                  currentPath === "/profile" ? "font-bold text-[#2096D8]" : ""
                }`}
              >
                {translate("myProfile")}
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full max-w-[215px] justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/profile/loyalty-points"
                  ? "bg-[#2096D8]/10"
                  : ""
              }`}
              onClick={() => handleNavigation("/profile/loyalty-points")}
            >
              <span
                className={`text-[12px] text-black group-hover:text-[#828282] uppercase ${
                  currentPath === "/profile/loyalty-points"
                    ? "font-bold text-[#2096D8]"
                    : ""
                }`}
              >
                {translate("loyaltyPoints")}({loyaltyPoints})
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full max-w-[215px] justify-between py-[19px] px-[10px] cursor-pointer group ${
                currentPath === "/profile/order-history"
                  ? "bg-[#2096D8]/10"
                  : ""
              }`}
              onClick={() => handleNavigation("/profile/order-history")}
            >
              <span
                className={`text-[12px] text-black group-hover:text-[#828282] uppercase ${
                  currentPath === "/profile/order-history"
                    ? "font-bold text-[#2096D8]"
                    : ""
                }`}
              >
                {translate("orderHistory")} ({orderCount})
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
            <div
              className={`flex w-full max-w-[215px] justify-between py-[19px] px-[10px] mb-[20px] cursor-pointer group ${
                currentPath === "/profile/favorite-products"
                  ? "bg-[#2096D8]/10"
                  : ""
              }`}
              onClick={() => handleNavigation("/profile/favorite-products")}
            >
              <span
                className={`text-[12px] text-black group-hover:text-[#828282] uppercase ${
                  currentPath === "/profile/favorite-products"
                    ? "font-bold text-[#2096D8]"
                    : ""
                }`}
              >
                {translate("favouriteProducts")} ({favoriteCount})
              </span>
              <FaAngleRight color="#828282" size={12} />
            </div>
          </>
        )}

        <button
          onClick={handleLogout}
          className="bg-[#828282] text-[16px] p-[14px] text-white w-full font-bold hover:bg-[#666666] transition-colors"
        >
          {translate("logout")}
        </button>
      </div>
    </div>
  );
}
