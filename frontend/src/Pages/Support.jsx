import { Link } from "react-router-dom";
import { useLanguage } from "./translation/LanguageContext";
import HomeSection from "./HomePages/sections/HomeSection";
import { Starburst } from "./HomePages/sections/Decor";

const PHONE_DISPLAY = "+389 71 399 036";
const PHONE_HREF = "tel:+38971399036";
const EMAIL = "info@proteini.mk";

// Help topics shown as cards; each points at an existing /help or /about-us page.
const TOPICS = [
  { to: "/help/shipping", labelKey: "shipping", icon: "truck" },
  { to: "/help/payment-methods", labelKey: "paymentMethods", icon: "card" },
  { to: "/help/purchase-process", labelKey: "purchaseProcess", icon: "bag" },
  { to: "/help/free-gift", labelKey: "freeGift", icon: "gift" },
  { to: "/help/loyalty-points", labelKey: "loyaltyPoints1", icon: "star" },
  { to: "/help/faq", label: "FAQ", icon: "question" },
];

const ICON_PATHS = {
  phone:
    "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z",
  mail:
    "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  truck:
    "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  card:
    "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
  bag:
    "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z",
  gift:
    "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
  star:
    "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z",
  question:
    "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  pin:
    "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  arrow: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
};

function Icon({ name, className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export default function Support() {
  const { translate } = useLanguage();

  const channels = [
    { icon: "phone", title: translate("callUs"), value: PHONE_DISPLAY, href: PHONE_HREF },
    { icon: "mail", title: translate("writeToUs"), value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: "clock", title: translate("availability"), value: translate("weAreAvailableForYou") },
  ];

  return (
    <main className="w-full flex-1 font-montserrat text-gray-800">
      {/* Hero */}
      <HomeSection
        id="support-hero"
        tint="bg-[#FDC700]"
        waveBottom="#f6f5f1"
        className="home-tint-keep pt-14 pb-20 sm:pt-20 sm:pb-28"
        decor={
          <div className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block">
            <Starburst rotate={10} className="h-40 w-40 text-2xl" color="#141409" textColor="#FDC700">
              {translate("supportStickerText")}
            </Starburst>
          </div>
        }
      >
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#141409]/70">{translate("supportPageTitle")}</p>
          <h1 className="max-w-[760px] font-display text-[40px] font-bold uppercase leading-[0.95] tracking-tight text-[#141409] [text-wrap:balance] sm:text-7xl">
            {translate("needHelp")}?
          </h1>
          <p className="mt-5 max-w-[560px] text-base text-[#141409]/80 sm:text-lg">{translate("supportHeroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={PHONE_HREF} className="inline-flex items-center gap-2 rounded-lg bg-[#141409] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
              <Icon name="phone" className="h-5 w-5" />
              {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#141409] px-6 py-3 text-sm font-bold text-[#141409] transition-transform hover:-translate-y-0.5">
              <Icon name="mail" className="h-5 w-5" />
              {EMAIL}
            </a>
          </div>
        </div>
      </HomeSection>

      {/* Contact channels + help topics */}
      <HomeSection id="support-topics" tint="bg-[#f6f5f1]" className="py-12 sm:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-[25px]">
          <div className="grid gap-4 sm:grid-cols-3">
            {channels.map((channel) => {
              const content = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
                    <Icon name={channel.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500">{channel.title}</span>
                    <span className="mt-1 block break-words font-semibold text-gray-900">{channel.value}</span>
                  </span>
                </>
              );
              const cls = "flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,20,9,0.06)]";
              return channel.href ? (
                <a key={channel.icon} href={channel.href} className={`${cls} transition-shadow hover:shadow-[0_18px_36px_-20px_rgba(20,20,9,0.35)]`}>
                  {content}
                </a>
              ) : (
                <div key={channel.icon} className={cls}>
                  {content}
                </div>
              );
            })}
          </div>

          <h2 className="mt-14 mb-6 font-display text-[28px] font-bold uppercase leading-none tracking-tight text-gray-900 sm:text-5xl">
            {translate("helpTopics")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <Link
                key={topic.to}
                to={topic.to}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(20,20,9,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-20px_rgba(20,20,9,0.35)] sm:p-6"
              >
                <span className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <Icon name={topic.icon} className="h-6 w-6 shrink-0 text-[#c79c00] sm:h-8 sm:w-8" />
                  <span className="text-sm font-bold text-gray-900 sm:text-base">{topic.label || translate(topic.labelKey)}</span>
                </span>
                <Icon name="arrow" className="hidden h-5 w-5 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 sm:block" />
              </Link>
            ))}
          </div>

          {/* Sales points */}
          <Link
            to="/sales-points"
            className="group mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#3a3a32] p-6 text-white sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
                <Icon name="pin" />
              </span>
              <span>
                <span className="block font-display text-2xl font-bold uppercase tracking-tight">{translate("visitUsInStore")}</span>
                <span className="mt-1 block text-sm text-white/75">{translate("visitUsInStoreText")}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FDC700] px-5 py-3 text-sm font-bold text-[#141409]">
              {translate("seeSalesPoints")}
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </HomeSection>
    </main>
  );
}
