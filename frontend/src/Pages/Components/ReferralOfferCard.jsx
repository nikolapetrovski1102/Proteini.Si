import { useLanguage } from "../translation/LanguageContext";
import { formatMkd } from "../../utils/formatPrice";

/*
 * "Your personal discount": the visitor's affiliate code, shown as a coupon-style card before
 * checkout. Plain text only (no chips or buttons): the code is already applied, nothing to do.
 *
 *  offer   – from useReferralOffer(); renders nothing when null
 *  compact – smaller light card for the product page
 */


// Numeric (30.11.2026): browsers often lack Macedonian/Albanian month names and fall back to English.
const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

function useOfferText(offer) {
  const { translate } = useLanguage();
  if (!offer) return null;
  const fill = (key, values) =>
    Object.entries(values).reduce((text, [name, value]) => text.replace(`{${name}}`, value), translate(key));

  const value = Number(offer.discountValue) || 0;
  const headline =
    offer.discountType === "percentage"
      ? fill(offer.appliesTo === "all" ? "referralPercentAll" : "referralPercentSome", { value: `${value}%` })
      : fill(offer.appliesTo === "all" ? "referralFixedAll" : "referralFixedSome", { value: formatMkd(value) });

  const until = formatDate(offer.validUntil);
  const conditions = [
    Number(offer.minimumOrderAmount) > 0 && fill("referralMinOrder", { amount: formatMkd(offer.minimumOrderAmount) }),
    offer.discountType === "percentage" &&
      offer.maximumDiscountAmount != null &&
      fill("referralMaxDiscount", { amount: formatMkd(offer.maximumDiscountAmount) }),
    until && fill("referralValidUntil", { date: until }),
  ].filter(Boolean);

  return {
    eyebrow: translate("referralYourDiscount"),
    headline,
    code: offer.code,
    details: [translate("referralAutoApplied"), ...conditions].join(" · "),
    codeLabel: translate("referralCodeLabel"),
  };
}

export default function ReferralOfferCard({ offer, compact = false, className = "" }) {
  const text = useOfferText(offer);
  if (!text) return null;

  if (compact) {
    return (
      <section
        aria-label={text.eyebrow}
        className={`rounded-xl bg-[#FFF8DB] px-4 py-3 ring-1 ring-[#FDC700]/60 ${className}`}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a5a00]">
          {text.eyebrow} · {text.code}
        </p>
        <p className="mt-0.5 text-[15px] font-bold leading-snug text-[#141409]">{text.headline}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-[#5c5440]">{text.details}</p>
      </section>
    );
  }

  return (
    <section
      aria-label={text.eyebrow}
      className={`relative flex overflow-hidden rounded-2xl bg-[#141409] text-white shadow-[0_24px_48px_-32px_rgba(20,20,9,0.6)] ${className}`}
    >
      {/* yellow edge + soft glow: the "this one is yours" mark */}
      <span aria-hidden="true" className="w-1.5 shrink-0 bg-[#FDC700]" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[#FDC700]/15 blur-3xl"
      />

      <div className="relative min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#FDC700] sm:text-[12px]">
          {text.eyebrow}
        </p>
        <p className="mt-1 font-display text-[20px] font-semibold leading-tight sm:text-[26px]">{text.headline}</p>
        <p className="mt-1.5 text-[12px] leading-snug text-white/65 sm:text-[13px]">{text.details}</p>
        {/* phones: the code sits under the text */}
        <p className="mt-2 text-[12px] text-white/65 sm:hidden">
          {text.codeLabel} <span className="font-display text-[15px] font-semibold tracking-wide text-[#FDC700]">{text.code}</span>
        </p>
      </div>

      {/* wider screens: coupon stub behind a perforated line */}
      <div className="relative hidden shrink-0 flex-col items-center justify-center border-l border-dashed border-white/25 px-8 sm:flex">
        <span className="text-[11px] uppercase tracking-[0.1em] text-white/55">{text.codeLabel}</span>
        <span className="mt-0.5 font-display text-[24px] font-semibold tracking-wide text-[#FDC700]">{text.code}</span>
      </div>
    </section>
  );
}
