import { useLanguage } from "../translation/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Subscribe from "../Subscribe";
import { WaveEdge } from "../HomePages/sections/Decor";

const FOOTER_BG = "#3a3a32";

const PAYMENT_LOGOS = [
  { src: "/logos/mastercardsecurecode.svg", w: 90, h: 68, alt: "Mastercard SecureCode" },
  { src: "/logos/verified-by-visa.svg", w: 60, h: 46, alt: "Verified by Visa" },
  { src: "/logos/diners-club-international.svg", w: 90, h: 50, alt: "Diners Club International" },
  { src: "/logos/mastercard.svg", w: 43, h: 40, alt: "Mastercard" },
  { src: "/logos/maestro.svg", w: 43, h: 40, alt: "Maestro" },
  { src: "/logos/visa.svg", w: 45, h: 40, alt: "Visa" },
  { src: "/logos/visa-electron.svg", w: 45, h: 40, alt: "Visa Electron" },
];

export default function Footer() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleNavigation = (route) => {
    window.scrollTo(0, 0);
    navigate(route);
  };

  const groups = [
    {
      id: "about",
      title: translate("aboutProteiniSi"),
      links: [
        { to: "/about-us/about-the-company-proteini-si", label: translate("aboutTheCompanyProteiniSi") },
        { to: "/about-us/business-cooperation", label: translate("businessCooperation") },
        { to: "/about-us/contact", label: translate("contact") },
        { to: "/sales-points", label: translate("seeSalesPoints") },
      ],
    },
    {
      id: "service",
      title: translate("customerService"),
      links: [
        { to: "/support", label: translate("supportPageTitle") },
        { to: "/help/shipping", label: translate("shipping") },
        { to: "/help/payment-methods", label: translate("paymentMethods") },
        { to: "/help/free-gift", label: translate("freeGift") },
        { to: "/help/purchase-process", label: translate("purchaseProcess") },
      ],
    },
    {
      id: "info",
      title: translate("usefulInfo"),
      links: [
        { to: "/help/loyalty-points", label: translate("loyaltyPoints1") },
        { to: "/help/faq", label: "FAQ" },
        { to: "/terms-of-services", label: translate("termsOfService") },
        { to: "/general-provisions", label: translate("generalProvisions") },
      ],
    },
  ];

  return (
    <footer className="relative w-full text-white" style={{ backgroundColor: FOOTER_BG }}>
      {/* Wave rising over the bottom of the page, same edge as the home sections */}
      <div aria-hidden="true" className="relative z-[2] h-0">
        <WaveEdge position="bottom" fill={FOOTER_BG} className="translate-y-px" />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-4 pt-10 sm:px-[25px] sm:pt-14">
        {/* Need help strip → dedicated support page (skipped on the support page itself) */}
        {pathname !== "/support" && (
        <Link
          to="/support"
          onClick={() => window.scrollTo(0, 0)}
          className="group flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#FDC700] p-5 text-[#141409] sm:flex-row sm:items-center sm:px-8 sm:py-6"
        >
          <span>
            <span className="block font-display text-2xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {translate("needHelp")}?
            </span>
            <span className="mt-2 block text-sm text-[#141409]/75">{translate("supportHeroSubtitle")}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#141409] px-5 py-3 text-sm font-bold text-white">
            {translate("contactSupport")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1">
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
        )}

        <Subscribe />

        {/* Navigation */}
        <div className="grid gap-x-8 border-t border-white/10 pt-10 md:grid-cols-[1fr_1fr_1fr_1.2fr] max-md:gap-y-2">
          {groups.map((group) => {
            const open = openDropdown === group.id;
            return (
              <div key={group.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left md:pointer-events-none md:mb-5 max-md:rounded-xl max-md:bg-white/5 max-md:p-3"
                  onClick={() => setOpenDropdown(open ? null : group.id)}
                  aria-expanded={open}
                >
                  <span className="font-display text-lg font-bold uppercase tracking-wide text-[#FDC700]">{group.title}</span>
                  <span className="text-xl md:hidden">{open ? "−" : "+"}</span>
                </button>
                <ul className={`overflow-hidden transition-all duration-300 md:max-h-none ${open ? "max-md:max-h-[400px] max-md:pt-3" : "max-md:max-h-0"}`}>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <button
                        type="button"
                        onClick={() => handleNavigation(link.to)}
                        className="mb-3 text-left text-sm text-white/75 transition-colors hover:text-white max-md:pl-3"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Brand blurb */}
          <div className="flex flex-col md:items-end md:text-right max-md:mt-6">
            <a href="https://www.proteini.si/" target="_blank" rel="noopener noreferrer">
              <img src="/logos/proteini_si.svg" width={116} height={31} alt="Proteini.si" />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {translate("footerInfo1")} {translate("footerInfo2")} {translate("footerInfo3")}
            </p>
          </div>
        </div>

        {/* Payment methods + copyright */}
        <div className="mt-8 flex flex-col items-center gap-5 border-t border-white/10 py-8 lg:flex-row lg:justify-between">
          <div className="flex flex-col items-center gap-1.5 lg:items-start">
            <p className="text-xs text-white/60">
              © Proteini.si | {translate("allRightsReserved")}
            </p>
            {/* CC BY 2.0 attribution for the homepage goal photos (see public/img/homepage-cards/CREDITS.md) */}
            <p className="text-center text-[10px] text-white/40 lg:text-left">
              {translate("photoCredits")}: Shixart1985, Nenad Stojkovic / Wikimedia Commons,{" "}
              <a
                href="https://creativecommons.org/licenses/by/2.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/70"
              >
                CC BY 2.0
              </a>{" "}
              ({translate("photosModified")})
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            {PAYMENT_LOGOS.map((logo) => (
              <img
                key={logo.alt}
                src={logo.src}
                width={Math.round(logo.w * 0.7)}
                height={Math.round(logo.h * 0.7)}
                alt={logo.alt}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
