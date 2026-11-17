import { useEffect } from "react";
import { TfiClose } from "react-icons/tfi";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { useLanguage } from "../translation/LanguageContext";
import { CountryFlag } from "./AddressFields";

// Languages this shop serves; picking one switches the site in place.
const SHOP_LANGUAGES = [
  { code: "mk", iso2: "MK", countryKey: "macedonia", languageKey: "languageMacedonian" },
  { code: "al", iso2: "AL", countryKey: "albania", languageKey: "languageAlbanian" },
  { code: "en", iso2: "GB", countryKey: "unitedKingdom", languageKey: "languageEnglish" },
];

// Sister Proteini shops; picking one leaves for that shop's site.
const OTHER_SHOPS = [
  { iso2: "SI", countryKey: "slovenia", url: "https://www.proteini.si/sl/", host: "proteini.si" },
  { iso2: "HR", countryKey: "croatia", url: "https://www.proteini.si/hr/", host: "proteini.si/hr" },
  { iso2: "RS", countryKey: "serbia", url: "https://proteinisi.rs/", host: "proteinisi.rs" },
  { iso2: "BA", countryKey: "bosnia", url: "https://ba.proteini.si/", host: "ba.proteini.si" },
  { iso2: "ME", countryKey: "montenegro", url: "https://www.proteini.me/", host: "proteini.me" },
  { iso2: "EU", countryKey: "europeanUnion", url: "https://www.proteini.si/en/", host: "proteini.si/en" },
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Rows rise into place one after another while the panel slides in.
const rowMotion = (isOpen, index) => ({
  className: `transition-[opacity,transform] duration-500 ${EASE} motion-reduce:transition-none ${
    isOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
  }`,
  style: { transitionDelay: isOpen ? `${120 + index * 45}ms` : "0ms" },
});

export default function LanguageModal({ isOpen, setIsOpen }) {
  const { translate, changeLanguage, language } = useLanguage();

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setIsOpen]);

  const handleLanguageSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    // Stays mounted so it can animate out; `invisible` (delayed until the slide ends) keeps it
    // out of the tab order and screen readers while closed.
    <div
      className={`fixed inset-x-0 top-0 bottom-[var(--bottom-nav-h,0px)] z-50 transition-[visibility] duration-0 ${
        isOpen ? "visible" : "invisible delay-500 motion-reduce:delay-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-labelledby="language-modal-title"
    >
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[460px] overflow-y-auto bg-white px-6 pb-10 pt-16 shadow-2xl transition-transform duration-500 ${EASE} motion-reduce:transition-none sm:px-8 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-gray-100"
          aria-label={translate("close")}
        >
          <TfiClose size={18} />
        </button>

        <h2 id="language-modal-title" className="text-2xl font-bold text-gray-900">
          {translate("selectLanguage")}
        </h2>
        <div className="mt-3 h-1 w-16 bg-[#FDC700]" />

        {/* This shop */}
        <p className="mt-9 text-[12px] font-bold uppercase tracking-[0.08em] text-gray-500">
          {translate("languageThisShop")}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {SHOP_LANGUAGES.map((item, index) => {
            const active = language === item.code;
            const motion = rowMotion(isOpen, index);
            return (
              <div key={item.code} className={motion.className} style={motion.style}>
              <button
                type="button"
                onClick={() => handleLanguageSelect(item.code)}
                aria-current={active ? "true" : undefined}
                className={`group flex min-h-[64px] w-full items-center gap-4 rounded-xl px-4 text-left ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] ${
                  active
                    ? "bg-[#FDC700]/15 ring-[#FDC700]"
                    : "ring-black/[0.08] hover:bg-gray-50 hover:ring-black/20"
                }`}
              >
                <CountryFlag iso2={item.iso2} alt="" size="xl" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-gray-900">
                    {translate(item.languageKey)}
                  </span>
                  <span className="block text-[13px] text-gray-500">{translate(item.countryKey)}</span>
                </span>
                {active && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141409] text-white">
                    <FiCheck aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </button>
              </div>
            );
          })}
        </div>

        {/* Sister shops */}
        <p className="mt-10 text-[12px] font-bold uppercase tracking-[0.08em] text-gray-500">
          {translate("languageOtherShops")}
        </p>
        <div className="mt-2 divide-y divide-black/[0.06]">
          {OTHER_SHOPS.map((shop, index) => (
            <a
              key={shop.url}
              href={shop.url}
              style={rowMotion(isOpen, SHOP_LANGUAGES.length + index).style}
              className={`${rowMotion(isOpen, SHOP_LANGUAGES.length + index).className} group flex min-h-[60px] items-center gap-4 rounded-lg px-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409]`}
            >
              <CountryFlag iso2={shop.iso2} alt="" size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-gray-900">{translate(shop.countryKey)}</span>
                <span className="block text-[12px] text-gray-400">{shop.host}</span>
              </span>
              <FiArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-900"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
