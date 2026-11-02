// Components/Breadcrumb.jsx
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

export default function Breadcrumb() {
  const { translate } = useLanguage();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Define breadcrumb names inside the component where translate is available
  const getBreadcrumbName = (routePath, name) => {
    const breadcrumbMap = {
      "/about-us/about-the-company-proteini-si": translate(
        "aboutTheCompanyProteiniSi",
      ),
      "/about-us/business-cooperation": translate("businessCooperation"),
      "/about-us/contact": translate("contact"),
      "/terms-of-services": translate("termsOfService"),
      "/privacy-policy": translate("privacyPolicy"),
      "/all-products": translate("allProducts"),
      "/cart": translate("shoppingCart"),
      "/checkout": translate("checkout"),
      "/profile": translate("myProfile"),
      "/profile/loyalty-points": translate("loyaltyPoints"),
      "/profile/order-history": translate("orderHistory"),
      "/profile/favorite-products": translate("favoriteProducts"),
    };

    if (breadcrumbMap[routePath]) {
      return breadcrumbMap[routePath];
    }

    // Format the name if no mapping exists
    let displayName = name.replace(/-/g, " ");
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    return displayName;
  };

  // Don't show breadcrumb on home page
  if (location.pathname === "/") return null;

  return (
    <div className="w-full bg-gray-50 py-3">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {translate("home") || "Home"}
          </Link>
          {pathnames.map((name, index) => {
            const routePath = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const displayName = getBreadcrumbName(routePath, name);

            return (
              <div key={routePath} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                {isLast ? (
                  <span className="font-bold text-gray-800">{displayName}</span>
                ) : (
                  <Link
                    to={routePath}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {displayName}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
