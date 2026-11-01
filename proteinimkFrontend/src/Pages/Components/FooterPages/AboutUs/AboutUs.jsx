import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import Breadcrumb from "../../Breadcrumb";
import { useLanguage } from "../../../translation/LanguageContext";

export default function AboutUs() {
  const location = useLocation();
  const { translate } = useLanguage();

  // Function to format the breadcrumb text
  const getBreadcrumbText = (pathname) => {
    switch (pathname) {
      case "/about-us/about-the-company-proteini-si":
        return "About the company Proteini.si";
      case "/about-us/business-cooperation":
        return "Business cooperation";
      case "/about-us/contact":
        return "Contact";
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
      <div className="flex gap-4 border-b mb-8">
        <NavLink
          to="/about-us/about-the-company-proteini-si"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("aboutTheCompanyProteiniSi")}
        </NavLink>
        <NavLink
          to="/about-us/business-cooperation"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("businessCooperation")}
        </NavLink>
        <NavLink
          to="/about-us/contact"
          className={({ isActive }) =>
            `pb-2 px-1 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-[#2096D8] text-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          {translate("contact")}
        </NavLink>
      </div>

      {/* Child routes will render here */}
      <Outlet />
    </div>
  );
}
