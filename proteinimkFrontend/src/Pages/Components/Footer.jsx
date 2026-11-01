import { CgDarkMode } from "react-icons/cg";
import { useLanguage } from "../translation/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Footer() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("siteTheme") || "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("siteTheme", theme);
  }, [theme]);

  const handleNavigation = (route) => {
    window.scrollTo(0, 0);
    navigate(route);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="w-full flex justify-center bg-[#383839] pt-[24px] pb-[34px]">
      <div className="w-full max-w-[1240px] flex flex-col px-[15px]">
        {/* payment methods */}
        <div className="mb-[50px] w-full flex justify-center flex-wrap">
          <img
            src="/logos/mastercardsecurecode.svg"
            width={90}
            height={68}
            className="mx-[13px] mb-[13px]"
            alt="Mastercard SecureCode"
          />
          <img
            src="/logos/verified-by-visa.svg"
            width={60}
            height={46}
            className="mx-[13px] mb-[13px]"
            alt="Verified by Visa"
          />{" "}
          <img
            src="/logos/diners-club-international.svg"
            width={90}
            height={50}
            className="mx-[13px] mb-[13px]"
            alt="Diners Club International"
          />{" "}
          <img
            src="/logos/mastercard.svg"
            width={43}
            height={40}
            className="mx-[13px] mb-[13px]"
            alt="Mastercard"
          />{" "}
          <img
            src="/logos/maestro.svg"
            width={43}
            height={40}
            className="mx-[13px] mb-[13px]"
            alt="Maestro"
          />
          <img
            src="/logos/visa.svg"
            width={45}
            height={40}
            className="mx-[13px] mb-[13px]"
            alt="Visa"
          />
          <img
            src="/logos/visa-electron.svg"
            width={45}
            height={40}
            className="mx-[13px] mb-[13px]"
            alt="Visa Electron"
          />
        </div>
        {/* payment methods */}

        {/* About us navigation part */}
        <div className="w-full flex justify-between text-white max-md:flex-col max-md:gap-4">
          {/* About Proteini.si Dropdown */}
          <div className="flex flex-col max-md:w-full">
            <div
              className="flex justify-between items-center cursor-pointer md:mb-[23px] max-md:p-3 max-md:bg-[#2a2a2b] max-md:rounded"
              onClick={() => toggleDropdown("about")}
            >
              <p className="font-medium">{translate("aboutProteiniSi")}</p>
              <span className="md:hidden text-xl">
                {openDropdown === "about" ? "−" : "+"}
              </span>
            </div>

            <div
              className={`flex gap-8 transition-all duration-300 overflow-hidden ${
                openDropdown === "about"
                  ? "max-md:max-h-[500px] max-md:mt-4"
                  : "max-md:max-h-0"
              } md:block`}
            >
              <div className="flex gap-8 max-md:flex-col max-md:gap-0 max-md:w-full">
                <div className="max-md:w-full">
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() =>
                      handleNavigation(
                        "/about-us/about-the-company-proteini-si",
                      )
                    }
                  >
                    {translate("aboutTheCompanyProteiniSi")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() =>
                      handleNavigation("/about-us/business-cooperation")
                    }
                  >
                    {translate("businessCooperation")}
                  </p>
                </div>
                <div className="max-md:w-full">
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/about-us/contact")}
                  >
                    {translate("contact")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Service Dropdown */}
          <div className="flex flex-col max-md:w-full">
            <div
              className="flex justify-between items-center cursor-pointer md:mb-[23px] max-md:p-3 max-md:bg-[#2a2a2b] max-md:rounded"
              onClick={() => toggleDropdown("service")}
            >
              <p className="font-medium">{translate("customerService")}</p>
              <span className="md:hidden text-xl">
                {openDropdown === "service" ? "−" : "+"}
              </span>
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                openDropdown === "service"
                  ? "max-md:max-h-[500px] max-md:mt-4"
                  : "max-md:max-h-0"
              } md:block`}
            >
              <div className="flex gap-8 max-md:flex-col max-md:gap-0">
                <div className="pr-[34px] max-md:w-full max-md:pr-0">
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/shipping")}
                  >
                    {translate("shipping")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/payment-methods")}
                  >
                    {translate("paymentMethods")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/free-gift")}
                  >
                    {translate("freeGift")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/purchase-process")}
                  >
                    {translate("purchaseProcess")}
                  </p>
                </div>
                <div className="max-md:w-full">
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/loyalty-points")}
                  >
                    {translate("loyaltyPoints1")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/help/faq")}
                  >
                    FAQ
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] cursor-pointer max-md:pl-3"
                    onClick={() => handleNavigation("terms-of-services")}
                  >
                    {translate("termsOfService")}
                  </p>
                  <p
                    className="text-xs mb-[18px] decoration-1 hover:underline leading-[25px] max-md:pl-3 cursor-pointer"
                    onClick={() => handleNavigation("/general-provisions")}
                  >
                    {translate("generalProvisions")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo and Info - Hidden on tablet/mobile */}
          <div className="flex flex-col items-end h-[220px] max-md:hidden">
            <a
              href="https://www.proteini.si/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/logos/proteini_si.svg"
                width={116}
                height={31}
                alt="Proteini.si"
              />
            </a>
            <p className="text-sm text-right">
              {translate("footerInfo1")} <br />
              {translate("footerInfo2")}
              <br />
              {translate("footerInfo3")}
            </p>
          </div>
        </div>

        {/* About us navigation part */}

        {/* Theme */}
        <div className="mb-[13px] max-md:hidden">
          <span className="text-white mb-[15px] block">
            {translate("theme")}
          </span>{" "}
          <div>
            <button
              onClick={() => setTheme("light")}
              className={`font-bold text-[14px] mr-[10px] p-[10px] min-w-[170px] leading-[17px] transition ${
                theme === "light"
                  ? "bg-white text-black"
                  : "bg-[#FFFFFF69] text-black hover:bg-white hover:opacity-80"
              }`}
            >
              {translate("bright")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`font-bold text-[14px] p-[10px] min-w-[170px] leading-[17px] transition ${
                theme === "dark"
                  ? "bg-[#FDC700] text-black"
                  : "bg-[#131313] text-white opacity-85 hover:opacity-100"
              }`}
            >
              {translate("dark")}
            </button>
          </div>
        </div>
        {/* Theme */}

        {/* All rights reserved */}
        <p className="text-white text-xs leading-[15px] text-center mt-4">
          © Proteini.si | {translate("allRightsReserved")}
        </p>
        {/* All rights reserved */}
      </div>
    </div>
  );
}
