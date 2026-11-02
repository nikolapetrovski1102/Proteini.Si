import { Outlet, NavLink, useLocation } from "react-router-dom";
import Breadcrumb from "../../Breadcrumb";
import { useLanguage } from "../../../translation/LanguageContext";

export default function Help() {
  const location = useLocation();
  const { translate } = useLanguage();
  // Function to format the breadcrumb text
  const getBreadcrumbText = (pathname) => {
    switch (pathname) {
      case "/help/shipping":
        return "Shipping";
      case "/help/payment-methods":
        return "Payment Methods";
      case "/help/free-gift":
        return "Free Gift";
      case "/help/purchase-process":
        return "Purchase Process";
      case "/help/loyalty-points":
        return "Loyalty Points";
      case "/help/faq":
        return "FAQ";
      default:
        return "";
    }
  };

  // Get the current page title
  const currentPageText = getBreadcrumbText(location.pathname);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Breadcrumb />
      </div>

      {/* Navigation for subpages */}
      <div className="flex flex-wrap gap-4 border-b mb-8">
        <NavLink
          to="/help/shipping"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("shipping")}
        </NavLink>
        <NavLink
          to="/help/payment-methods"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("paymentMethods")}
        </NavLink>
        <NavLink
          to="/help/free-gift"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("freeGift")}
        </NavLink>
        <NavLink
          to="/help/purchase-process"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("purchaseProcess")}
        </NavLink>
        <NavLink
          to="/help/loyalty-points"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("loyaltyPoints")}
        </NavLink>
        <NavLink
          to="/help/faq"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("FAQ")}
        </NavLink>
      </div>

      {/* Child routes will render here */}
      <Outlet />
    </div>
  );
}
