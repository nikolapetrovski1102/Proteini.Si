import { useEffect } from "react";
import { TfiClose } from "react-icons/tfi";
import { useLanguage } from "../translation/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function LanguageModal({ isOpen, setIsOpen }) {
  const { translate, changeLanguage, language } = useLanguage();
  const navigate = useNavigate();

  const handleExternalNavigation = (url) => {
    window.location.href = url;
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal content */}
      <div
        className="flex flex-col gap-20 fixed top-0 right-0 h-screen bg-white w-[505px] z-50 overflow-y-auto py-8 px-[52px] max-sm:p-8 max-sm:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="text-[20px] font-[600] text-black">
            {translate("selectLanguage")}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-black hover:text-gray-500 text-xl"
          >
            <TfiClose />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              handleExternalNavigation("https://www.proteini.si/sl/")
            }
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/sl.svg"
              width={20}
              height={16}
              alt="Slovenia flag"
            />
            <span>{translate("slovenia")}</span>
          </button>

          <button
            onClick={() =>
              handleExternalNavigation("https://www.proteini.si/en/")
            }
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/eu.svg"
              width={20}
              height={16}
              alt="EU flag"
            />
            <span>{translate("europeanUnion")}</span>
          </button>

          <button
            onClick={() =>
              handleExternalNavigation("https://www.proteini.si/hr/")
            }
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/hr.svg"
              width={20}
              height={16}
              alt="Croatia flag"
            />
            <span>{translate("croatia")}</span>
          </button>

          <button
            onClick={() => handleExternalNavigation("https://proteinisi.rs/")}
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/serbia.svg"
              width={20}
              height={16}
              alt="Serbia flag"
            />
            <span>{translate("serbia")}</span>
          </button>

          <button
            onClick={() => handleExternalNavigation("https://ba.proteini.si/")}
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/bosnia.svg"
              width={20}
              height={16}
              alt="Bosnia flag"
            />
            <span>{translate("bosnia")}</span>
          </button>

          <button
            onClick={() => handleExternalNavigation("https://www.proteini.me/")}
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/montenegro.svg"
              width={20}
              height={16}
              alt="Montenegro flag"
            />
            <span>{translate("montenegro")}</span>
          </button>

          <button
            onClick={() => handleLanguageSelect("mk")}
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/mk.svg"
              width={20}
              height={16}
              alt="Macedonia flag"
            />
            <span>{translate("macedonia")}</span>
          </button>
          <button
            onClick={() => handleLanguageSelect("al")}
            className="flex gap-2 items-center hover:bg-gray-50 p-2 rounded transition-colors text-left"
          >
            <img
              src="/logos/flags/al.svg"
              width={20}
              height={16}
              alt="Albanian flag"
            />
            <span>{translate("albania")}</span>
          </button>
        </div>
      </div>
    </>
  );
}
