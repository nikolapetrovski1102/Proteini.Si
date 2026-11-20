import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { api } from "../../services/api";
import { track, hasMarketingConsent, readCookieConsent } from "../../services/analytics";
import { metaInitiateCheckout, metaPurchase } from "../../services/metaPixel";
import { clearGuestCart, useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import Toast from "../Toast";
import { getDeclaredDeliveryFees, getShippableSubtotal } from "../../utils/deliveryPricing";
import { CourierCodNote } from "../Components/CourierCodNote";
import { maxRedeemablePoints as redeemableFor, nextLoyaltyUnlock } from "../../utils/loyaltyRules";
import { clearReferralCode, getReferralCode } from "../../utils/referral";
import {
  CityPostCodeSelector,
  EmailTypoHint,
  LockedCountryInput,
  PhoneInputWithCountry,
  StreetAddressAutocomplete,
  findMatchingCity,
  useCheckoutLocations,
  validateEmailAddressClient,
  validatePhoneWithCountry,
} from "../Components/AddressFields";
import { formatMkd as formatPrice, roundMkd, roundingDifference } from "../../utils/formatPrice";
import Price from "../Components/Price";
import TurnstileCheck from "../Components/TurnstileCheck";
import { TURNSTILE_SITE_KEY } from "../../utils/turnstile";

const SHIPPING_COUNTRY = "North Macedonia";
const COUNTRIES = [SHIPPING_COUNTRY];
const DEFAULT_LOYALTY_PERCENTAGE = 2.0;
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTE_MAX_LENGTH = 500;

// Mirrors CheckoutFieldValidator on the API: we only ship inside North Macedonia.
const normalizeMacedonianPhone = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!/^\+?[0-9\s\-./()]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00389")) digits = `0${digits.slice(5)}`;
  else if (digits.startsWith("389") && digits.length === 11) digits = `0${digits.slice(3)}`;
  else if (digits.length === 8 && /^[2-7]/.test(digits)) digits = `0${digits}`;
  return /^0[2-7]\d{7}$/.test(digits) ? digits : null;
};
const isValidPostCode = (value) => /^[1-7]\d{3}$/.test(String(value ?? "").trim());


// Same type and surfaces as the redesigned cart page.
const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";
const cardClass =
  "rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-32px_rgba(20,20,9,0.25)] sm:p-6";
const darkButtonClass =
  "rounded-lg bg-[#141409] font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] disabled:cursor-not-allowed disabled:opacity-40";

const loyaltyKeyFor = (item) =>
  item.variant_Id ? `variant_${item.variant_Id}` : `product_${item.product_Id}`;

const isDiscountedItem = (item) =>
  Boolean(
    item.variant_Compare_Price &&
      item.variant_Original_Price &&
      item.variant_Compare_Price < item.variant_Original_Price,
  );

const resolveImage = (src) => {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return `${IMAGE_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

const EMPTY_BILLING = {
  User_FullName: "",
  User_Address: "",
  User_PostCode: "",
  User_City: "",
  User_Country: SHIPPING_COUNTRY,
  User_Phone: "",
  Company_Name: "",
  Company_Address: "",
  Company_TaxNumber: "",
  Company_PostCode: "",
  Company_City: "",
  Company_Country: SHIPPING_COUNTRY,
  Company_Phone: "",
};

const EMPTY_DELIVERY = {
  Delivery_FullName: "",
  Delivery_Address: "",
  Delivery_PostCode: "",
  Delivery_City: "",
  Delivery_Country: SHIPPING_COUNTRY,
  Delivery_Phone: "",
};

/** Builds the delivery form from the billing details of the given account type. */
const deliveryFromBilling = (billing, type) =>
  type === "company"
    ? {
        Delivery_FullName: billing.Company_Name,
        Delivery_Address: billing.Company_Address,
        Delivery_PostCode: billing.Company_PostCode,
        Delivery_City: billing.Company_City,
        Delivery_Country: billing.Company_Country,
        Delivery_Phone: billing.Company_Phone,
      }
    : {
        Delivery_FullName: billing.User_FullName,
        Delivery_Address: billing.User_Address,
        Delivery_PostCode: billing.User_PostCode,
        Delivery_City: billing.User_City,
        Delivery_Country: billing.User_Country,
        Delivery_Phone: billing.User_Phone,
      };

/**
 * Loyalty percentage for one cart line: the variant's own value when it has one,
 * otherwise the parent product's value, otherwise the default.
 */
const resolveLoyaltyPercentage = async (item, getProduct) => {
  try {
    if (item.variant_Id) {
      try {
        const variantData = await api.getVariantWithParent(item.variant_Id);
        const lp =
          variantData?.data?.loyaltyPercentage ??
          variantData?.data?.LoyaltyPercentage;
        if (lp !== null && lp !== undefined && parseFloat(lp) > 0) {
          return parseFloat(lp);
        }
      } catch (variantError) {
        console.error(`Error fetching variant ${item.variant_Id}:`, variantError);
      }
    }
    const productData = await getProduct(item.product_Id);
    return productData?.product?.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE;
  } catch {
    return DEFAULT_LOYALTY_PERCENTAGE;
  }
};

const GIFT_MESSAGE_MAX_LENGTH = 500;

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-[#141409] focus:ring-[#FDC700]/50"
  }`;

function Field({ id, label, error, required, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function TextField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  className,
  ...inputProps
}) {
  return (
    <Field id={name} label={label} error={error} required={required} className={className}>
      <input
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={inputClass(error)}
        {...inputProps}
      />
    </Field>
  );
}

function CountryField({ name, label, value, onChange, translate }) {
  return (
    <Field id={name} label={label} required>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass(false)}
      >
        {COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country === SHIPPING_COUNTRY ? translate("northMacedonia") : country}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Section({ step, title, children, aside }) {
  return (
    <section className={cardClass}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={`${headingClass} flex items-center gap-3 text-xl sm:text-2xl`}>
          {step && (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FDC700] font-sans text-sm font-extrabold text-[#141409]">
              {step}
            </span>
          )}
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function CodeInput({
  label,
  hint,
  value,
  onChange,
  onApply,
  placeholder,
  applyLabel,
  applied,
  onRemove,
  removeLabel,
  error,
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}
      {applied ? (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
          <span className="font-semibold">{applied}</span>
          <button type="button" onClick={onRemove} className="font-bold underline">
            {removeLabel}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={onChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onApply();
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            className={`${inputClass(Boolean(error))} min-w-0 flex-1 py-2 uppercase`}
          />
          <button
            type="button"
            onClick={onApply}
            disabled={!value.trim()}
            className={`${darkButtonClass} px-4 text-sm`}
          >
            {applyLabel}
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function GuestCodeDialog({ email, state, onChange, onConfirm, onResend, onCancel, translate }) {
  const { code, error, sending, confirming, retryAfter } = state;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-code-title"
    >
      <form
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <h2 id="guest-code-title" className={`${headingClass} text-2xl`}>
          {translate("guestCodeTitle")}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {translate("guestCodeIntro")} <span className="font-semibold text-gray-900">{email}</span>
        </p>
        <label htmlFor="guest-code" className="mt-5 mb-1.5 block text-xs font-semibold text-gray-700">
          {translate("guestCodeLabel")}
        </label>
        <input
          id="guest-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          autoFocus
          value={code}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
          className={`${inputClass(Boolean(error))} text-center text-2xl font-bold tracking-[0.4em]`}
          placeholder="••••••"
        />
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={code.length !== 6 || confirming}
          className={`${darkButtonClass} mt-5 min-h-[48px] w-full text-sm`}
        >
          {confirming ? translate("guestCodeConfirming") : translate("guestCodeConfirm")}
        </button>
        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onResend}
            disabled={sending || retryAfter > 0}
            className="font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4 disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {retryAfter > 0
              ? `${translate("guestCodeResendIn")} ${retryAfter}s`
              : translate("guestCodeResend")}
          </button>
          <button type="button" onClick={onCancel} className="font-semibold text-gray-500 hover:underline">
            {translate("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentOption({ id, value, checked, disabled, onChange, title, description }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : checked
            ? "cursor-pointer border-[#141409] bg-[#FDC700]/15"
            : "cursor-pointer border-gray-200 hover:border-gray-400"
      }`}
    >
      <input
        type="radio"
        id={id}
        name="payment_method"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-[#141409]"
      />
      <span>
        <span className="block text-sm font-semibold text-gray-900">{title}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-gray-500">{description}</span>
        )}
      </span>
    </label>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="home-tint min-h-screen bg-[#f6f5f1]">
      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-5 h-11 w-44 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-8 h-12 w-72 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <div className="h-96 animate-pulse rounded-2xl bg-gray-200/70" />
            <div className="h-40 animate-pulse rounded-2xl bg-gray-200/70" />
          </div>
          <div className="h-[480px] animate-pulse rounded-2xl bg-gray-200/70" />
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { translate, language } = useLanguage();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { phoneCountries, cities } = useCheckoutLocations();

  const [accountType, setAccountType] = useState("natural");
  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [billingForm, setBillingForm] = useState(EMPTY_BILLING);
  const [deliveryForm, setDeliveryForm] = useState(EMPTY_DELIVERY);
  const [differentDelivery, setDifferentDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderNote, setOrderNote] = useState("");
  // Gift vouchers: who gets the code by email (blank email = the buyer keeps it).
  const [giftRecipient, setGiftRecipient] = useState({ name: "", email: "", message: "" });
  // Guests paying cash on delivery confirm their email with a code first.
  const [guestVerification, setGuestVerification] = useState(null);
  const [guestCode, setGuestCode] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [termsError, setTermsError] = useState("");
  const [saving, setSaving] = useState(false);
  const turnstileRef = useRef(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionError, setPromotionError] = useState("");
  const [giftVoucherCode, setGiftVoucherCode] = useState("");
  const [appliedGiftVoucher, setAppliedGiftVoucher] = useState(null);
  const [giftVoucherError, setGiftVoucherError] = useState("");

  const [shippingSettings, setShippingSettings] = useState(null);
  const [availableFreeGifts, setAvailableFreeGifts] = useState([]);
  const [selectedFreeGiftId, setSelectedFreeGiftId] = useState(null);

  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsInput, setPointsInput] = useState(0);
  const [pointsMessage, setPointsMessage] = useState("");
  const [loyaltyMap, setLoyaltyMap] = useState({});

  const cartTotal = cart?.total || 0;
  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  // Sent when checking a promo code: a code can be limited to some products or categories.
  const promotionLines = useMemo(
    () =>
      cartItems.map((item) => ({
        productId: item.product_Id,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      })),
    [cartItems],
  );
  const promotionLinesRef = useRef(promotionLines);
  promotionLinesRef.current = promotionLines;
  const promotionLinesKey = promotionLines.map((l) => `${l.productId}x${l.quantity}@${l.price}`).join(",");
  const promotionErrorText = (error) =>
    error?.message === "This code doesn't apply to the products in your cart."
      ? translate("promotionNotForTheseProducts")
      : error?.message;
  const isCartEmpty = cartItems.length === 0;
  // Gift vouchers can only be paid by card.
  const buysGiftVoucher = cartItems.some((item) => item.isGiftVoucher);
  // Vouchers are emailed, so a voucher-only cart has no delivery (no fee, no delivery address).
  const nothingToDeliver = !isCartEmpty && cartItems.every((item) => item.isGiftVoucher);
  const cardPaymentDisabled = shippingSettings?.cardPaymentEnabled === false;
  const giftVoucherBlocked = buysGiftVoucher && cardPaymentDisabled;

  const promoDiscount = Number(appliedPromotion?.discountAmount || 0);
  const giftVoucherDiscount = Number(appliedGiftVoucher?.applicableAmount || 0);
  const loyaltyOrderValue = Math.max(cartTotal - promoDiscount, 0);
  const maxRedeemablePoints = redeemableFor(shippingSettings, loyaltyOrderValue, availablePoints);
  const loyaltyUnlock = nextLoyaltyUnlock(shippingSettings, loyaltyOrderValue, availablePoints);
  const pointsDiscount = Math.max(Math.min(pointsInput || 0, maxRedeemablePoints), 0);

  const closeToast = useCallback(() => setToast(null), []);

  const guestRetryAfter = guestCode?.retryAfter ?? 0;
  useEffect(() => {
    if (guestRetryAfter <= 0) return undefined;
    const timer = setTimeout(
      () => setGuestCode((current) => current && { ...current, retryAfter: current.retryAfter - 1 }),
      1000,
    );
    return () => clearTimeout(timer);
  }, [guestRetryAfter]);

  useEffect(() => {
    if (buysGiftVoucher && paymentMethod !== "credit_card") setPaymentMethod("credit_card");
  }, [buysGiftVoucher, paymentMethod]);

  useEffect(() => {
    if (nothingToDeliver) setDifferentDelivery(false);
  }, [nothingToDeliver]);

  // ---- One-time loads -------------------------------------------------------

  useEffect(() => {
    track("checkout_start");
  }, []);

  // The cart loads asynchronously: report InitiateCheckout once, when its lines are known.
  const metaCheckoutSent = useRef(false);
  useEffect(() => {
    if (metaCheckoutSent.current || cartItems.length === 0) return;
    metaCheckoutSent.current = true;
    metaInitiateCheckout(cartItems, cartTotal);
  }, [cartItems, cartTotal]);

  useEffect(() => {
    let cancelled = false;
    api
      .getShippingSettings()
      .then((settings) => {
        if (cancelled) return;
        setShippingSettings(settings);
        if (settings.cardPaymentEnabled === false) setPaymentMethod("home_delivery");
      })
      .catch((settingsError) => {
        console.error("Error loading shipping settings:", settingsError);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .fetchCurrentUser()
      .then((user) => {
        if (cancelled || !user) return;
        setUserEmail(user.user_Email || "");

        if (user.user_IsCompany === true) {
          const company = user.company || {};
          setAccountType("company");
          setBillingForm((prev) => ({
            ...prev,
            Company_Name: company.company_Name || "",
            Company_Address: company.company_Address || "",
            Company_TaxNumber: company.company_TaxNumber || "",
            Company_PostCode: company.company_PostCode || "",
            Company_City: company.company_City || "",
            Company_Country: SHIPPING_COUNTRY,
            Company_Phone: company.company_Phone || "",
          }));
          setDeliveryForm({
            Delivery_FullName: company.company_Name || "",
            Delivery_Address: company.company_Address || "",
            Delivery_PostCode: company.company_PostCode || "",
            Delivery_City: company.company_City || "",
            Delivery_Country: SHIPPING_COUNTRY,
            Delivery_Phone: company.company_Phone || "",
          });
        } else {
          setAccountType("natural");
          setBillingForm((prev) => ({
            ...prev,
            User_FullName: user.user_FullName || "",
            User_Address: user.user_Address || "",
            User_PostCode: user.user_PostCode || "",
            User_City: user.user_City || "",
            User_Country: SHIPPING_COUNTRY,
            User_Phone: user.user_Phone || "",
          }));
          setDeliveryForm({
            Delivery_FullName: user.user_FullName || "",
            Delivery_Address: user.user_Address || "",
            Delivery_PostCode: user.user_PostCode || "",
            Delivery_City: user.user_City || "",
            Delivery_Country: SHIPPING_COUNTRY,
            Delivery_Phone: user.user_Phone || "",
          });
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching user data:", fetchError);
        if (!cancelled) setError(translate("failedToLoadUserData"));
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false);
      });

    if (api.isAuthenticated()) {
      api
        .getAvailableLoyaltyPoints()
        .then((response) => {
          if (!cancelled && response.status) {
            setAvailablePoints(response.availablePoints || 0);
          }
        })
        .catch((pointsError) => {
          console.error("Error fetching loyalty points:", pointsError);
        });
    }

    return () => {
      cancelled = true;
    };
    // Runs once on mount; translate only formats the error message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Loyalty percentages (only refetched when the set of products changes) -

  const loyaltySignature = useMemo(
    () => [...new Set(cartItems.map(loyaltyKeyFor))].sort().join(","),
    [cartItems],
  );

  useEffect(() => {
    if (!loyaltySignature) return;
    let cancelled = false;

    const productRequests = new Map();
    const getProduct = (productId) => {
      if (!productRequests.has(productId)) {
        productRequests.set(productId, api.getProductById(productId));
      }
      return productRequests.get(productId);
    };

    const uniqueItems = [];
    const seen = new Set();
    for (const item of cartItems) {
      const key = loyaltyKeyFor(item);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }

    Promise.all(
      uniqueItems.map(async (item) => [
        loyaltyKeyFor(item),
        await resolveLoyaltyPercentage(item, getProduct),
      ]),
    ).then((entries) => {
      if (!cancelled) setLoyaltyMap(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
    // cartItems is read for the current lines; the signature decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loyaltySignature]);

  // ---- Promotions, codes and vouchers ---------------------------------------

  useEffect(() => {
    let cancelled = false;
    api
      .getActivePromotions(cartTotal)
      .then((data) => {
        if (cancelled) return;
        const gifts = data.freeGifts || [];
        setAvailableFreeGifts(gifts);
        setSelectedFreeGiftId((current) =>
          current && !gifts.some((gift) => gift.freeGiftId === current)
            ? null
            : current,
        );
      })
      .catch((loadError) => {
        console.error("Error loading promotions:", loadError);
      });
    return () => {
      cancelled = true;
    };
  }, [cartTotal]);

  useEffect(() => {
    if (!appliedPromotion?.code) return;
    let cancelled = false;
    // Debounced: userEmail changes on every keystroke while the customer types it.
    const timer = setTimeout(() => {
      api
        .validatePromotionCode(appliedPromotion.code, cartTotal, userEmail || null, promotionLines)
        .then((promotion) => {
          if (cancelled) return;
          setAppliedPromotion(promotion);
          setPromotionError("");
        })
        .catch(() => {
          if (cancelled) return;
          setAppliedPromotion(null);
          setPromotionError(translate("promotionNoLongerApplies"));
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedPromotion?.code, cartTotal, userEmail, promotionLinesKey]);

  // A code that came in through an affiliate link (?code= or /r/<slug>) is applied on its own.
  // Tried again when the cart total changes (minimum order), never after the customer removed it.
  // The email is read through a ref: it is prefilled late and changes on every keystroke, and
  // re-running here would cancel the request in flight. A total only counts as tried once settled.
  const referralRef = useRef({ dismissed: false, triedTotal: null });
  const referralEmailRef = useRef(userEmail);
  referralEmailRef.current = userEmail;
  useEffect(() => {
    const referral = referralRef.current;
    if (appliedPromotion || referral.dismissed || cartTotal <= 0 || referral.triedTotal === cartTotal) return;
    const code = getReferralCode();
    if (!code) return;
    let cancelled = false;
    const settle = () => {
      if (!cancelled) referral.triedTotal = cartTotal;
    };
    api
      .validatePromotionCode(code, cartTotal, referralEmailRef.current || null, promotionLinesRef.current)
      .then((promotion) => {
        settle();
        if (cancelled || referral.dismissed) return;
        setAppliedPromotion((current) => current || promotion);
        setPromotionCode((current) => current || promotion.code || code);
        setPromotionError("");
      })
      .catch(() => {
        settle();
        /* not valid for this cart (yet); the customer can still enter a code by hand */
      });
    return () => {
      cancelled = true;
    };
  }, [appliedPromotion, cartTotal]);

  const voucherOrderAmount = () => {
    const { totalDeliveryFee } = getDeclaredDeliveryFees(
      getShippableSubtotal(cartTotal, cartItems),
      paymentMethod,
      shippingSettings || {},
    );
    return Math.max(cartTotal + totalDeliveryFee - promoDiscount - pointsDiscount, 0);
  };

  useEffect(() => {
    if (!appliedGiftVoucher?.code) return;
    let cancelled = false;
    // Debounced: the amount moves with points/quantity changes in quick succession.
    const timer = setTimeout(() => {
      api
        .validateGiftVoucher(appliedGiftVoucher.code, voucherOrderAmount())
        .then((voucher) => {
          if (!cancelled) setAppliedGiftVoucher(voucher);
        })
        .catch(() => {
          if (cancelled) return;
          setAppliedGiftVoucher(null);
          setGiftVoucherError(translate("voucherNoLongerApplies"));
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    appliedGiftVoucher?.code,
    cartTotal,
    paymentMethod,
    pointsDiscount,
    promoDiscount,
    shippingSettings,
  ]);

  const handleApplyPromotion = async () => {
    const code = promotionCode.trim().toUpperCase();
    if (!code) return;
    setPromotionError("");
    try {
      const promotion = await api.validatePromotionCode(code, cartTotal, userEmail || null, promotionLines);
      setAppliedPromotion(promotion);
      setPromotionCode(promotion.code || code);
    } catch (promotionApplyError) {
      setAppliedPromotion(null);
      setPromotionError(promotionErrorText(promotionApplyError));
    }
  };

  const handleApplyGiftVoucher = async () => {
    const code = giftVoucherCode.trim();
    if (!code) return;
    setGiftVoucherError("");
    try {
      const result = await api.validateGiftVoucher(code, voucherOrderAmount());
      setAppliedGiftVoucher(result);
      setGiftVoucherCode(result.code);
    } catch (voucherApplyError) {
      setAppliedGiftVoucher(null);
      setGiftVoucherError(voucherApplyError.message);
    }
  };

  const handleApplyPoints = () => {
    if (pointsInput > maxRedeemablePoints) {
      setPointsInput(maxRedeemablePoints);
      setPointsMessage(`${translate("maxRedeemablePoints")}: ${maxRedeemablePoints}`);
    } else if (pointsInput < 0) {
      setPointsInput(0);
      setPointsMessage("");
    } else {
      setPointsMessage(`${translate("discountApplied")}: ${formatPrice(pointsInput)}`);
    }
  };

  const handleNewsletterSubscribe = async () => {
    const email = newsletterEmail.trim();
    if (!email) return;
    if (!EMAIL_PATTERN.test(email)) {
      setNewsletterStatus({ type: "error", text: translate("invalidEmail") });
      return;
    }
    try {
      await api.subscribeNewsletter(email, "checkout");
      setNewsletterStatus({ type: "success", text: translate("subscribedToNewsletter") });
      setNewsletterEmail("");
    } catch (subscribeError) {
      setNewsletterStatus({
        type: "error",
        text: subscribeError.message || translate("subscribeFailed"),
      });
    }
  };

  // ---- Form handlers ---------------------------------------------------------

  const clearFieldError = (name) => {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleBillingChange = (event) => {
    const { name, value } = event.target;
    setBillingForm((current) => ({ ...current, [name]: value }));
    clearFieldError(name);
  };

  const handleDeliveryChange = (event) => {
    const { name, value } = event.target;
    setDeliveryForm((current) => ({ ...current, [name]: value }));
    clearFieldError(name);
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setFieldErrors({});
    if (!differentDelivery) setDeliveryForm(deliveryFromBilling(billingForm, type));
  };

  const handleDifferentDeliveryToggle = (event) => {
    const isChecked = event.target.checked;
    setDifferentDelivery(isChecked);
    if (!isChecked) setDeliveryForm(deliveryFromBilling(billingForm, accountType));
  };

  const validate = () => {
    const required = translate("fieldRequired");
    const errors = {};
    const requireField = (name, value) => {
      if (!String(value ?? "").trim()) errors[name] = required;
    };

    const billingFields =
      accountType === "company"
        ? [
            "Company_Name",
            "Company_TaxNumber",
            "Company_Address",
            "Company_PostCode",
            "Company_City",
            "Company_Country",
            "Company_Phone",
          ]
        : [
            "User_FullName",
            "User_Address",
            "User_PostCode",
            "User_City",
            "User_Country",
            "User_Phone",
          ];
    billingFields.forEach((name) => requireField(name, billingForm[name]));

    const prefix = accountType === "company" ? "Company" : "User";
    const checkPhone = (name, value) => {
      if (!errors[name] && !validatePhoneWithCountry(value, phoneCountries).valid) {
        errors[name] = translate("invalidPhoneFormat") || translate("invalidPhone");
      }
    };
    const checkCityAndPostCode = (cityField, postCodeField, cityVal, postCodeVal) => {
      if (!errors[postCodeField] && !isValidPostCode(postCodeVal)) {
        errors[postCodeField] = translate("invalidPostCode");
        return;
      }
      if (!errors[cityField] && !errors[postCodeField]) {
        const matched = findMatchingCity(cityVal, postCodeVal, cities);
        if (!matched) {
          errors[cityField] = translate("invalidCityOrPostCode");
        } else if (
          matched.postCodes?.length &&
          !matched.postCodes.some((p) => p.postCode === String(postCodeVal ?? "").trim())
        ) {
          errors[postCodeField] = translate("invalidCityOrPostCode");
        }
      }
    };

    checkPhone(`${prefix}_Phone`, billingForm[`${prefix}_Phone`]);
    checkCityAndPostCode(
      `${prefix}_City`,
      `${prefix}_PostCode`,
      billingForm[`${prefix}_City`],
      billingForm[`${prefix}_PostCode`],
    );

    const emailCheck = validateEmailAddressClient(userEmail);
    if (!userEmail.trim()) {
      errors.email = required;
    } else if (!emailCheck.valid) {
      errors.email =
        emailCheck.reason === "typo" && emailCheck.suggestion
          ? `${translate("invalidEmail")} (${translate("emailDidYouMean")} ${emailCheck.suggestion}?)`
          : translate("invalidEmail");
    }

    if (differentDelivery) {
      [
        "Delivery_FullName",
        "Delivery_Address",
        "Delivery_PostCode",
        "Delivery_City",
        "Delivery_Phone",
      ].forEach((name) => requireField(name, deliveryForm[name]));
      checkPhone("Delivery_Phone", deliveryForm.Delivery_Phone);
      checkCityAndPostCode(
        "Delivery_City",
        "Delivery_PostCode",
        deliveryForm.Delivery_City,
        deliveryForm.Delivery_PostCode,
      );
    }

    if (orderNote.length > NOTE_MAX_LENGTH) errors["order-note"] = translate("orderNoteTooLong");

    if (buysGiftVoucher) {
      const recipientEmail = giftRecipient.email.trim();
      if (recipientEmail && !validateEmailAddressClient(recipientEmail).valid) {
        errors["gift-recipient-email"] = translate("invalidEmail");
      }
      if (giftRecipient.message.length > GIFT_MESSAGE_MAX_LENGTH) {
        errors["gift-message"] = translate("giftMessageTooLong");
      }
    }

    if (createAccount) {
      if (!password) errors.password = required;
      else if (password.length < 8) errors.password = translate("passwordMin8");
      if (password && password !== confirmPassword) {
        errors.confirmPassword = translate("passwordsDoNotMatch");
      }
    }

    return errors;
  };

  // ---- Submit ------------------------------------------------------------------

  const handleSubmitOrder = async () => {
    setError("");
    setSuccess("");
    setTermsError("");

    if (giftVoucherBlocked) {
      setError(translate("giftVoucherCardUnavailable"));
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      setError(translate("pleaseFillRequiredFields"));
      const element = document.getElementById(firstInvalid);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus({ preventScroll: true });
      return;
    }

    if (!termsAccepted) {
      setTermsError(translate("mustAcceptTerms"));
      return;
    }

    if (needsGuestVerification()) {
      const email = userEmail.trim().toLowerCase();
      if (guestVerification?.email === email) {
        await placeOrder(guestVerification.token);
      } else {
        await requestGuestCode();
      }
      return;
    }

    await placeOrder(null);
  };

  // A fresh "not a robot" token for one request; null when the check is off.
  const takeTurnstileToken = async () => {
    if (!TURNSTILE_SITE_KEY) return { ok: true, token: null };
    const token = await turnstileRef.current?.takeToken();
    if (!token) setError(translate("robotCheckRequired"));
    return { ok: !!token, token };
  };

  const needsGuestVerification = () =>
    !api.isAuthenticated() && paymentMethod === "home_delivery";

  const requestGuestCode = async () => {
    const email = userEmail.trim();
    const turnstileCheck = await takeTurnstileToken();
    if (!turnstileCheck.ok) {
      setGuestCode(null);
      return;
    }
    setGuestCode((current) => ({
      code: "",
      error: "",
      confirming: false,
      retryAfter: 0,
      ...current,
      sending: true,
    }));
    try {
      const name = accountType === "company" ? billingForm.Company_Name : billingForm.User_FullName;
      const result = await api.sendGuestCheckoutCode({
        email,
        name,
        language,
        marketingConsent: hasMarketingConsent(),
        turnstileToken: turnstileCheck.token,
      });
      setGuestCode((current) => ({
        ...current,
        sending: false,
        error: "",
        retryAfter: result.retryAfterSeconds ?? 60,
      }));
    } catch (sendError) {
      setGuestCode(null);
      setError(
        sendError.data?.field === "turnstile"
          ? translate("robotCheckRequired")
          : sendError.message || translate("guestCodeSendFailed"),
      );
    }
  };

  const confirmGuestCode = async () => {
    if (!guestCode) return;
    const email = userEmail.trim();
    setGuestCode((current) => ({ ...current, confirming: true, error: "" }));
    try {
      const result = await api.confirmGuestCheckoutCode({ email, code: guestCode.code });
      const verification = { email: email.toLowerCase(), token: result.verificationToken };
      setGuestVerification(verification);
      setGuestCode(null);
      await placeOrder(verification.token);
    } catch (confirmError) {
      setGuestCode((current) =>
        current && { ...current, confirming: false, code: "", error: confirmError.message },
      );
    }
  };

  // Maps a field named by the API to the input that shows it.
  const formFieldFor = (apiField) => {
    const prefix = accountType === "company" ? "Company" : "User";
    return (
      {
        Billing_Email: "email",
        Billing_Phone: `${prefix}_Phone`,
        Billing_City: `${prefix}_City`,
        Billing_PostCode: `${prefix}_PostCode`,
        Billing_Country: `${prefix}_Country`,
        Delivery_Phone: "Delivery_Phone",
        Delivery_City: "Delivery_City",
        Delivery_PostCode: "Delivery_PostCode",
        Delivery_Country: "Delivery_Country",
        Order_Note: "order-note",
        Gift_Recipient_Name: "gift-recipient-name",
        Gift_Recipient_Email: "gift-recipient-email",
        Gift_Message: "gift-message",
      }[apiField] || null
    );
  };

  const placeOrder = async (guestVerificationToken) => {
    setSaving(true);
    try {
      const turnstileCheck = await takeTurnstileToken();
      if (!turnstileCheck.ok) return;

      const isCompany = accountType === "company";
      const rawBillingPhone = isCompany ? billingForm.Company_Phone : billingForm.User_Phone;
      const normalizedBillingPhone =
        validatePhoneWithCountry(rawBillingPhone, phoneCountries).e164 || rawBillingPhone;
      const normalizedDeliveryPhone = differentDelivery
        ? validatePhoneWithCountry(deliveryForm.Delivery_Phone, phoneCountries).e164 ||
          deliveryForm.Delivery_Phone
        : null;

      const orderData = {
        billing_Type: accountType,
        billing_FullName: isCompany ? billingForm.Company_Name : billingForm.User_FullName,
        billing_Address: isCompany ? billingForm.Company_Address : billingForm.User_Address,
        billing_PostCode: isCompany ? billingForm.Company_PostCode : billingForm.User_PostCode,
        billing_City: isCompany ? billingForm.Company_City : billingForm.User_City,
        billing_Country: SHIPPING_COUNTRY,
        billing_Phone: normalizedBillingPhone,
        billing_Email: userEmail.trim(),
        billing_TaxNumber: isCompany ? billingForm.Company_TaxNumber : null,
        billing_CompanyName: isCompany ? billingForm.Company_Name : null,
        delivery_IsDifferent: differentDelivery,
        delivery_FullName: differentDelivery ? deliveryForm.Delivery_FullName : null,
        delivery_Address: differentDelivery ? deliveryForm.Delivery_Address : null,
        delivery_PostCode: differentDelivery ? deliveryForm.Delivery_PostCode : null,
        delivery_City: differentDelivery ? deliveryForm.Delivery_City : null,
        delivery_Country: differentDelivery ? SHIPPING_COUNTRY : null,
        delivery_Phone: normalizedDeliveryPhone,
        order_Note: orderNote,
        gift_Recipient_Name: buysGiftVoucher ? giftRecipient.name.trim() || null : null,
        gift_Recipient_Email: buysGiftVoucher ? giftRecipient.email.trim() || null : null,
        gift_Message: buysGiftVoucher ? giftRecipient.message.trim() || null : null,
        gift_Voucher_Code: appliedGiftVoucher?.code || null,
        promo_Code: appliedPromotion?.code || null,
        selected_Free_Gift_Id: selectedFreeGiftId,
        payment_Method: paymentMethod,
        pointsToRedeem: pointsDiscount,
        createAccount,
        password: createAccount ? password : null,
        guest_Verification_Token: guestVerificationToken,
        turnstileToken: turnstileCheck.token,
        marketingConsent: hasMarketingConsent(),
        marketingConsentGivenAt: readCookieConsent()?.savedAt || null,
        cartItems: cartItems.map((item) => ({
          product_Id: item.product_Id,
          quantity: item.quantity,
          price: item.price,
          variant_Id: item.variant_Id || null,
          variant_Name: item.variant_Name || null,
          variant_Packaging: item.variant_Packaging || null,
          variant_Weight_Grams: item.variant_Weight_Grams || item.weight_Grams || null,
        })),
      };

      const response = await api.createOrder(orderData);

      if (response?.requiresEmailVerification) {
        setGuestVerification(null);
        await requestGuestCode();
        return;
      }

      if (response?.giftVoucherCardOnly) {
        setPaymentMethod("credit_card");
        setError(translate("giftVoucherCardOnlyNotice"));
        return;
      }

      if (response?.status === false && response.field === "turnstile") {
        setError(translate("robotCheckRequired"));
        return;
      }

      if (response?.status === false && response.field) {
        const field = formFieldFor(response.field);
        if (field) {
          setFieldErrors((current) => ({ ...current, [field]: response.message }));
          const element = document.getElementById(field);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setError(response.message);
        return;
      }

      if (response?.status === true) track("order_created", { orderId: response.orderId ?? null });

      // The payment provider can answer with a ready HTML form.
      if (typeof response === "string" && response.trim().startsWith("<!DOCTYPE")) {
        track("order_created");
        document.write(response);
        document.close();
        return;
      }

      const clearCartAfterOrder = () => {
        clearReferralCode();
        if (api.isAuthenticated()) refreshCart();
        else clearGuestCart();
      };

      const showSuccess = (message, orderNumber) => {
        const text = orderNumber ? `${message} #${orderNumber}` : message;
        setToast({ message: text, type: "success" });
        setSuccess(text);
      };

      if (paymentMethod === "home_delivery") {
        if (response?.status === true) {
          metaPurchase(response.orderId, cartItems, cartTotal);
          clearCartAfterOrder();
          showSuccess(response.message || translate("orderCreatedSuccessfully"), response.orderNumber);
          setTimeout(() => navigate("/all-products"), 3000);
        } else {
          setError(response?.message || translate("failedToCreateOrder"));
        }
        return;
      }

      if (response && response.status === true) {
        if (response.paymentUrl) {
          // The cart is kept until the payment succeeds (PaymentSuccess clears it),
          // so a failed or cancelled payment can be retried.
          setToast({ message: translate("redirectingToPayment"), type: "info" });
          setTimeout(() => {
            window.location.href = response.paymentUrl;
          }, 1000);
        } else {
          // Fully covered by a voucher: the order is already paid.
          metaPurchase(response.orderId, cartItems, cartTotal);
          clearCartAfterOrder();
          showSuccess(translate("orderCreatedRedirecting"), response.orderNumber);
          setTimeout(() => {
            navigate(
              `/order-confirmation/${response.orderId}${response.guestAccessToken ? `?token=${encodeURIComponent(response.guestAccessToken)}` : ""}`,
            );
          }, 3000);
        }
      } else {
        setError(response?.message || translate("failedToCreateOrder"));
      }
    } catch (submitError) {
      console.error("Order creation error:", submitError);
      if (
        submitError.response &&
        typeof submitError.response.data === "string" &&
        submitError.response.data.trim().startsWith("<!DOCTYPE")
      ) {
        document.write(submitError.response.data);
        document.close();
        return;
      }
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          translate("failedToCreateOrder"),
      );
    } finally {
      setSaving(false);
    }
  };

  // ---- Derived totals ----------------------------------------------------------

  const { deliveryFee, cashOnDeliveryFee } = getDeclaredDeliveryFees(
    getShippableSubtotal(cartTotal, cartItems),
    paymentMethod,
    shippingSettings || {},
  );
  // Charged in whole denars (cPay only takes whole amounts), so the total is rounded and any difference
  // from the rounded rows above it is listed as its own row, so the shown numbers always add up.
  const finalAmount = roundMkd(
    Math.max(cartTotal + deliveryFee + cashOnDeliveryFee - promoDiscount - giftVoucherDiscount - pointsDiscount, 0),
  );
  const rounding = roundingDifference(
    [cartTotal, deliveryFee, cashOnDeliveryFee, -promoDiscount, -giftVoucherDiscount, -pointsDiscount],
    finalAmount,
  );

  const pointsForItem = (item) => {
    if (isDiscountedItem(item)) return 0;
    const percentage =
      loyaltyMap[loyaltyKeyFor(item)] ?? item.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE;
    return Math.floor((item.price || 0) * (item.quantity || 1) * (percentage / 100));
  };
  const estimatedPoints = cartItems.reduce((sum, item) => sum + pointsForItem(item), 0);
  const hasDiscountedItems = cartItems.some(isDiscountedItem);

  // Only the first load shows a skeleton; later cart refreshes keep the page.
  if (loadingUser || (cartLoading && !cart)) return <CheckoutSkeleton />;

  const billingField = (name, labelKey, props = {}) => (
    <TextField
      name={name}
      label={translate(labelKey)}
      value={billingForm[name]}
      onChange={handleBillingChange}
      error={fieldErrors[name]}
      required
      {...props}
    />
  );

  const deliveryField = (name, labelKey, props = {}) => (
    <TextField
      name={name}
      label={translate(labelKey)}
      value={deliveryForm[name]}
      onChange={handleDeliveryChange}
      error={fieldErrors[name]}
      required
      {...props}
    />
  );

  const emailField = (
    <div>
      <TextField
        name="email"
        type="email"
        maxLength={45}
        autoComplete="email"
        label={translate("email")}
        value={userEmail}
        onChange={(event) => {
          setUserEmail(event.target.value);
          clearFieldError("email");
        }}
        placeholder={translate("enterYourEmailAddress")}
        error={fieldErrors.email}
        required
      />
      <EmailTypoHint
        email={userEmail}
        onAcceptSuggestion={(fixed) => {
          setUserEmail(fixed);
          clearFieldError("email");
        }}
      />
    </div>
  );

  const accountTabClass = (type) =>
    `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
      accountType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <div className="home-tint min-h-screen bg-[#f6f5f1]">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={4000} />
      )}

      {guestCode && (
        <GuestCodeDialog
          email={userEmail.trim()}
          state={guestCode}
          onChange={(code) => setGuestCode((current) => ({ ...current, code, error: "" }))}
          onConfirm={confirmGuestCode}
          onResend={requestGuestCode}
          onCancel={() => setGuestCode(null)}
          translate={translate}
        />
      )}

      <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        {/* Way out first: the mobile tab bar is hidden on this page. */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <Link
            to="/cart"
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-bold text-gray-900 transition hover:border-[#141409] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
            {translate("backToCart")}
          </Link>

          <ol className="hidden items-center gap-2 text-xs font-semibold text-gray-500 sm:flex">
            <li>
              <Link to="/cart" className="inline-flex items-center gap-1.5 hover:text-gray-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141409] text-[#FDC700]">
                  <FiCheck size={12} strokeWidth={3} />
                </span>
                {translate("shoppingCart")}
              </Link>
            </li>
            <li aria-hidden="true" className="h-px w-6 bg-gray-300" />
            <li aria-current="step" className="inline-flex items-center gap-1.5 text-gray-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FDC700] text-[11px] font-extrabold text-[#141409]">
                2
              </span>
              {translate("checkoutStepDetails")}
            </li>
            <li aria-hidden="true" className="h-px w-6 bg-gray-300" />
            <li className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[11px] font-bold">
                3
              </span>
              {translate("checkoutStepConfirm")}
            </li>
          </ol>
        </div>

        <h1 className={`${headingClass} mb-6 text-[34px] sm:mb-10 sm:text-5xl`}>
          {translate("quicklyCompleteYourPurchase")}
        </h1>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          {/* Left column */}
          <div className="min-w-0 space-y-6">
            {(error || success) && (
              <div
                role="alert"
                className={`rounded-xl px-4 py-3 text-sm ${
                  success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {success || error}
              </div>
            )}

            <Section step={1} title={translate("billingInformation")}>
              <div className="mb-5 flex max-w-sm rounded-lg bg-[#f6f5f1] p-1 ring-1 ring-black/[0.06]">
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("natural")}
                  className={accountTabClass("natural")}
                >
                  {translate("naturalPerson")}
                </button>
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("company")}
                  className={accountTabClass("company")}
                >
                  {translate("company")}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {accountType === "natural" ? (
                  <>
                    {billingField("User_FullName", "nameAndSurname", {
                      placeholder: translate("enterFullName"),
                      autoComplete: "name",
                      maxLength: 45,
                      className: "sm:col-span-2",
                    })}
                    <div className="sm:col-span-2" id="User_City">
                      <CityPostCodeSelector
                        city={billingForm.User_City}
                        postCode={billingForm.User_PostCode}
                        onSelectCityAndPostCode={(nextCity, nextZip) => {
                          setBillingForm((curr) => ({
                            ...curr,
                            User_City: nextCity,
                            User_PostCode: nextZip,
                          }));
                          clearFieldError("User_City");
                          clearFieldError("User_PostCode");
                        }}
                        cities={cities}
                        required
                        cityError={fieldErrors.User_City}
                        postCodeError={fieldErrors.User_PostCode}
                        variant="outlined"
                      />
                    </div>
                    <Field
                      id="User_Address"
                      label={translate("address")}
                      error={fieldErrors.User_Address}
                      required
                      className="sm:col-span-2"
                    >
                      <StreetAddressAutocomplete
                        value={billingForm.User_Address}
                        onChange={(val) => {
                          setBillingForm((curr) => ({ ...curr, User_Address: val }));
                          clearFieldError("User_Address");
                        }}
                        city={billingForm.User_City}
                        required
                        placeholder={translate("enterAddress")}
                        hasError={Boolean(fieldErrors.User_Address)}
                        variant="outlined"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <LockedCountryInput label={translate("country")} variant="outlined" />
                    </div>
                    <Field
                      id="User_Phone"
                      label={translate("phone")}
                      error={fieldErrors.User_Phone}
                      required
                      className="sm:col-span-2"
                    >
                      <PhoneInputWithCountry
                        value={billingForm.User_Phone}
                        onChange={(val) => {
                          setBillingForm((curr) => ({ ...curr, User_Phone: val }));
                          clearFieldError("User_Phone");
                        }}
                        phoneCountries={phoneCountries}
                        required
                        hasError={Boolean(fieldErrors.User_Phone)}
                        variant="outlined"
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    {billingField("Company_Name", "companyName", {
                      autoComplete: "organization",
                    })}
                    {billingField("Company_TaxNumber", "taxNumber", {
                      placeholder: "123456789",
                    })}
                    <div className="sm:col-span-2" id="Company_City">
                      <CityPostCodeSelector
                        city={billingForm.Company_City}
                        postCode={billingForm.Company_PostCode}
                        onSelectCityAndPostCode={(nextCity, nextZip) => {
                          setBillingForm((curr) => ({
                            ...curr,
                            Company_City: nextCity,
                            Company_PostCode: nextZip,
                          }));
                          clearFieldError("Company_City");
                          clearFieldError("Company_PostCode");
                        }}
                        cities={cities}
                        required
                        cityError={fieldErrors.Company_City}
                        postCodeError={fieldErrors.Company_PostCode}
                        variant="outlined"
                      />
                    </div>
                    <Field
                      id="Company_Address"
                      label={translate("companyAddress")}
                      error={fieldErrors.Company_Address}
                      required
                      className="sm:col-span-2"
                    >
                      <StreetAddressAutocomplete
                        value={billingForm.Company_Address}
                        onChange={(val) => {
                          setBillingForm((curr) => ({ ...curr, Company_Address: val }));
                          clearFieldError("Company_Address");
                        }}
                        city={billingForm.Company_City}
                        required
                        placeholder={translate("enterAddress")}
                        hasError={Boolean(fieldErrors.Company_Address)}
                        variant="outlined"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <LockedCountryInput label={translate("country")} variant="outlined" />
                    </div>
                    <Field
                      id="Company_Phone"
                      label={translate("phone")}
                      error={fieldErrors.Company_Phone}
                      required
                      className="sm:col-span-2"
                    >
                      <PhoneInputWithCountry
                        value={billingForm.Company_Phone}
                        onChange={(val) => {
                          setBillingForm((curr) => ({ ...curr, Company_Phone: val }));
                          clearFieldError("Company_Phone");
                        }}
                        phoneCountries={phoneCountries}
                        required
                        hasError={Boolean(fieldErrors.Company_Phone)}
                        variant="outlined"
                      />
                    </Field>
                  </>
                )}
                <div className="sm:col-span-2">{emailField}</div>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                {!api.isAuthenticated() && (
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(event) => setCreateAccount(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#141409]"
                    />
                    <span>
                      {translate("createAUserDesc1")}{" "}
                      <strong>{translate("createAUserDesc2")}</strong>
                    </span>
                  </label>
                )}

                {createAccount && (
                  <div className="grid gap-4 rounded-xl bg-[#f6f5f1] p-4 sm:grid-cols-2">
                    <p className="text-sm font-semibold sm:col-span-2">
                      {translate("createYourAccountPassword")}
                    </p>
                    <TextField
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      label={translate("password")}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError("password");
                      }}
                      placeholder={translate("passwordPlaceholder")}
                      error={fieldErrors.password}
                      required
                    />
                    <TextField
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      label={translate("confirmPassword")}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        clearFieldError("confirmPassword");
                      }}
                      placeholder={translate("passwordPlaceholder2")}
                      error={fieldErrors.confirmPassword}
                      required
                    />
                  </div>
                )}

                {!nothingToDeliver && (
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={differentDelivery}
                      onChange={handleDifferentDeliveryToggle}
                      className="mt-0.5 h-4 w-4 accent-[#141409]"
                    />
                    <span>{translate("deliveryAddressIsDifferentFromInvoiceAddress")}</span>
                  </label>
                )}
              </div>
            </Section>

            {differentDelivery && (
              <Section title={translate("deliveryAddress")}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {deliveryField("Delivery_FullName", "fullName", {
                    placeholder: translate("enterFullName"),
                    autoComplete: "shipping name",
                    className: "sm:col-span-2",
                  })}
                  <div className="sm:col-span-2" id="Delivery_City">
                    <CityPostCodeSelector
                      city={deliveryForm.Delivery_City}
                      postCode={deliveryForm.Delivery_PostCode}
                      onSelectCityAndPostCode={(nextCity, nextZip) => {
                        setDeliveryForm((curr) => ({
                          ...curr,
                          Delivery_City: nextCity,
                          Delivery_PostCode: nextZip,
                        }));
                        clearFieldError("Delivery_City");
                        clearFieldError("Delivery_PostCode");
                      }}
                      cities={cities}
                      required
                      cityError={fieldErrors.Delivery_City}
                      postCodeError={fieldErrors.Delivery_PostCode}
                      variant="outlined"
                    />
                  </div>
                  <Field
                    id="Delivery_Address"
                    label={translate("address")}
                    error={fieldErrors.Delivery_Address}
                    required
                    className="sm:col-span-2"
                  >
                    <StreetAddressAutocomplete
                      value={deliveryForm.Delivery_Address}
                      onChange={(val) => {
                        setDeliveryForm((curr) => ({ ...curr, Delivery_Address: val }));
                        clearFieldError("Delivery_Address");
                      }}
                      city={deliveryForm.Delivery_City}
                      required
                      placeholder={translate("enterAddress")}
                      hasError={Boolean(fieldErrors.Delivery_Address)}
                      variant="outlined"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <LockedCountryInput label={translate("country")} variant="outlined" />
                  </div>
                  <Field
                    id="Delivery_Phone"
                    label={translate("phone")}
                    error={fieldErrors.Delivery_Phone}
                    required
                    className="sm:col-span-2"
                  >
                    <PhoneInputWithCountry
                      value={deliveryForm.Delivery_Phone}
                      onChange={(val) => {
                        setDeliveryForm((curr) => ({ ...curr, Delivery_Phone: val }));
                        clearFieldError("Delivery_Phone");
                      }}
                      phoneCountries={phoneCountries}
                      required
                      hasError={Boolean(fieldErrors.Delivery_Phone)}
                      variant="outlined"
                    />
                  </Field>
                </div>
              </Section>
            )}

            <Section step={2} title={translate("paymentMethod")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <PaymentOption
                  id="credit-card"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  disabled={shippingSettings?.cardPaymentEnabled === false}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  title={translate("creditCard")}
                  description={translate("mastercardVisa")}
                />
                <PaymentOption
                  id="home-delivery"
                  value="home_delivery"
                  checked={paymentMethod === "home_delivery"}
                  disabled={shippingSettings?.homeDeliveryEnabled === false || buysGiftVoucher}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  title={translate("homeDelivery")}
                  description={translate("deliveryCourierNotice")}
                />
              </div>
              {buysGiftVoucher && (
                <p
                  role="note"
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    giftVoucherBlocked
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-[#FDC700]/60 bg-[#FDC700]/10 text-gray-800"
                  }`}
                >
                  {translate(giftVoucherBlocked ? "giftVoucherCardUnavailable" : "giftVoucherCardOnlyNotice")}
                </p>
              )}
            </Section>

            {buysGiftVoucher && (
              <Section title={translate("giftRecipientTitle")}>
                <p className="mb-4 text-sm text-gray-600">{translate("giftRecipientHint")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    name="gift-recipient-name"
                    label={translate("giftRecipientName")}
                    value={giftRecipient.name}
                    maxLength={200}
                    autoComplete="off"
                    error={fieldErrors["gift-recipient-name"]}
                    onChange={(event) => {
                      setGiftRecipient((current) => ({ ...current, name: event.target.value }));
                      clearFieldError("gift-recipient-name");
                    }}
                  />
                  <TextField
                    name="gift-recipient-email"
                    type="email"
                    label={translate("giftRecipientEmail")}
                    value={giftRecipient.email}
                    maxLength={255}
                    autoComplete="off"
                    error={fieldErrors["gift-recipient-email"]}
                    onChange={(event) => {
                      setGiftRecipient((current) => ({ ...current, email: event.target.value }));
                      clearFieldError("gift-recipient-email");
                    }}
                  />
                  <EmailTypoHint
                    email={giftRecipient.email}
                    className="-mt-1 sm:col-span-2"
                    onAcceptSuggestion={(fixed) => {
                      setGiftRecipient((current) => ({ ...current, email: fixed }));
                      clearFieldError("gift-recipient-email");
                    }}
                  />
                  <Field
                    id="gift-message"
                    label={translate("giftMessage")}
                    error={fieldErrors["gift-message"]}
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="gift-message"
                      value={giftRecipient.message}
                      rows={3}
                      maxLength={GIFT_MESSAGE_MAX_LENGTH}
                      aria-invalid={Boolean(fieldErrors["gift-message"])}
                      className={`${inputClass(Boolean(fieldErrors["gift-message"]))} resize-none`}
                      placeholder={translate("giftMessagePlaceholder")}
                      onChange={(event) => {
                        setGiftRecipient((current) => ({ ...current, message: event.target.value }));
                        clearFieldError("gift-message");
                      }}
                    />
                  </Field>
                </div>
              </Section>
            )}

            <Section step={3} title={translate("orderNote")}>
              <textarea
                id="order-note"
                value={orderNote}
                onChange={(event) => {
                  setOrderNote(event.target.value);
                  clearFieldError("order-note");
                }}
                rows={3}
                maxLength={NOTE_MAX_LENGTH}
                aria-invalid={Boolean(fieldErrors["order-note"])}
                className={`${inputClass(Boolean(fieldErrors["order-note"]))} resize-none`}
                placeholder={translate("orderNoteDesc")}
              />
              {fieldErrors["order-note"] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors["order-note"]}</p>
              )}

              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="mb-2 text-sm text-gray-700">{translate("subscribeNote")}</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(event) => {
                      setNewsletterEmail(event.target.value);
                      setNewsletterStatus(null);
                    }}
                    className={`${inputClass(newsletterStatus?.type === "error")} min-w-0 flex-1 py-2`}
                    placeholder={translate("enterYourEmailAddress")}
                  />
                  <button
                    type="button"
                    onClick={handleNewsletterSubscribe}
                    disabled={!newsletterEmail.trim()}
                    className={`${darkButtonClass} whitespace-nowrap px-4 text-sm`}
                  >
                    {translate("subscribe")}
                  </button>
                </div>
                <EmailTypoHint
                  email={newsletterEmail}
                  className="mt-1.5"
                  onAcceptSuggestion={(fixed) => {
                    setNewsletterEmail(fixed);
                    setNewsletterStatus(null);
                  }}
                />
                {newsletterStatus && (
                  <p
                    className={`mt-1.5 text-xs ${
                      newsletterStatus.type === "success" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {newsletterStatus.text}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {translate("byCompletingThisForm")}{" "}
                  <Link to="/terms-of-services" className="underline hover:text-gray-900">
                    {translate("termsOfService")}
                  </Link>
                </p>
              </div>
            </Section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-[calc(var(--header-h,80px)+24px)] lg:max-h-[calc(100vh-var(--header-h,80px)-48px)] lg:overflow-y-auto lg:rounded-2xl">
            <div className={`${cardClass} space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className={`${headingClass} text-2xl`}>
                  {translate("orderSummary")}
                </h2>
                <Link
                  to="/cart"
                  className="shrink-0 text-xs font-bold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4"
                >
                  {translate("productsInCart")} ({cart?.totalItems || 0})
                </Link>
              </div>

              {isCartEmpty ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {translate("cartEmptyCheckout")}
                </p>
              ) : (
                <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const itemPoints = pointsForItem(item);
                    return (
                      <li key={item.cartItem_Id} className="flex items-center gap-3 py-3">
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-lg bg-[#f6f5f1]">
                          {item.product_Img && (
                            <img
                              src={item.product_Img}
                              alt={item.product_Name}
                              loading="lazy"
                              className="h-full w-full object-contain p-1 mix-blend-multiply"
                            />
                          )}
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141409] px-1 text-[11px] font-bold text-[#FDC700]">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-gray-900">
                            {item.product_Name}
                          </p>
                          <p className="text-xs">
                            {itemPoints > 0 ? (
                              <span className="text-green-600">
                                +{itemPoints} {translate("points")}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                {translate("discountedNoPoints")}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right tabular-nums">
                          {Number(item.variant_Original_Price) > Number(item.price) && (
                            <p className="whitespace-nowrap text-xs text-gray-400 line-through">
                              <Price value={item.variant_Original_Price * item.quantity} />
                            </p>
                          )}
                          <p
                            className={`whitespace-nowrap text-sm font-semibold ${
                              Number(item.variant_Original_Price) > Number(item.price) ? "text-[#E3262F]" : ""
                            }`}
                          >
                            <Price value={item.price * item.quantity} />
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="space-y-4 border-t border-gray-100 pt-5">
                <CodeInput
                  label={translate("promotionCode")}
                  value={promotionCode}
                  onChange={(event) => {
                    setPromotionCode(event.target.value.toUpperCase());
                    setPromotionError("");
                  }}
                  onApply={handleApplyPromotion}
                  placeholder={translate("enterPromotionCode")}
                  applyLabel={translate("apply")}
                  applied={
                    appliedPromotion &&
                    `${appliedPromotion.code}: − ${formatPrice(promoDiscount)}`
                  }
                  onRemove={() => {
                    referralRef.current.dismissed = true;
                    setAppliedPromotion(null);
                    setPromotionCode("");
                    setPromotionError("");
                  }}
                  removeLabel={translate("remove")}
                  error={promotionError}
                />

                <CodeInput
                  label={translate("giftVoucher")}
                  value={giftVoucherCode}
                  onChange={(event) => {
                    setGiftVoucherCode(event.target.value.toUpperCase());
                    setGiftVoucherError("");
                  }}
                  onApply={handleApplyGiftVoucher}
                  placeholder={translate("enterGiftVoucherCode")}
                  applyLabel={translate("apply")}
                  applied={
                    appliedGiftVoucher &&
                    `${appliedGiftVoucher.code}: − ${formatPrice(giftVoucherDiscount)}`
                  }
                  onRemove={() => {
                    setAppliedGiftVoucher(null);
                    setGiftVoucherCode("");
                  }}
                  removeLabel={translate("remove")}
                  error={giftVoucherError}
                />
              </div>

              {availableFreeGifts.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="mb-3 text-sm font-semibold">{translate("chooseFreeGift")}</p>
                  <div className="grid gap-2">
                    {availableFreeGifts.map((gift) => {
                      const selected = selectedFreeGiftId === gift.freeGiftId;
                      const name =
                        gift.displayName || gift.productName || gift.variantName || "Free gift";
                      return (
                        <label
                          key={gift.freeGiftId}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-2.5 transition-colors ${
                            selected ? "border-[#141409] bg-[#FDC700]/15" : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="free-gift"
                            checked={selected}
                            onChange={() => setSelectedFreeGiftId(gift.freeGiftId)}
                            className="h-4 w-4 accent-[#141409]"
                          />
                          {gift.image && (
                            <img
                              src={resolveImage(gift.image)}
                              alt={name}
                              loading="lazy"
                              className="h-10 w-10 object-contain"
                            />
                          )}
                          <span className="text-xs font-semibold">{name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {availablePoints > 0 && (
                <div className="rounded-xl bg-[#FDC700] p-4 text-[#141409]">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {translate("yourLoyaltyPoints")}
                    </p>
                    <p className="text-base font-extrabold tabular-nums">
                      {Math.floor(availablePoints)} {translate("points")}
                    </p>
                  </div>
                  <p className="mb-3 text-xs text-[#141409]/70">
                    {translate("onepointonemkd")}
                    {maxRedeemablePoints > 0 &&
                      ` · ${translate("loyaltyUsableNow").replace("{points}", maxRedeemablePoints)}`}
                  </p>
                  {maxRedeemablePoints === 0 ? (
                    <p className="text-xs font-semibold">
                      {loyaltyUnlock
                        ? translate("loyaltyUnlockHint")
                            .replace("{amount}", formatPrice(loyaltyUnlock.remaining))
                            .replace("{points}", loyaltyUnlock.points)
                        : translate("loyaltyNotUsable")}
                    </p>
                  ) : (
                  <>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max={maxRedeemablePoints}
                      value={pointsInput}
                      onChange={(event) => {
                        setPointsInput(Math.min(Number(event.target.value), maxRedeemablePoints));
                        setPointsMessage("");
                      }}
                      className={`${inputClass(false)} min-w-0 flex-1 py-2`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPoints}
                      className={`${darkButtonClass} px-4 text-sm`}
                    >
                      {translate("apply")}
                    </button>
                  </div>
                  {pointsMessage && (
                    <p className="mt-2 text-xs font-semibold">{pointsMessage}</p>
                  )}
                  {loyaltyUnlock && (
                    <p className="mt-2 text-xs text-[#141409]/75">
                      {translate("loyaltyUnlockHint")
                        .replace("{amount}", formatPrice(loyaltyUnlock.remaining))
                        .replace("{points}", loyaltyUnlock.points)}
                    </p>
                  )}
                  </>
                  )}
                </div>
              )}

              <dl className="space-y-2.5 border-t border-gray-100 pt-5 text-sm tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-gray-600">{translate("subtotal")}</dt>
                  <dd className="font-semibold"><Price value={cartTotal} /></dd>
                </div>
                {!nothingToDeliver && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">{translate("delivery")}</dt>
                    <dd className="font-semibold"><Price value={deliveryFee} /></dd>
                  </div>
                )}
                {cashOnDeliveryFee > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">{translate("cashOnDeliveryFee")}</dt>
                    <dd className="font-semibold"><Price value={cashOnDeliveryFee} /></dd>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("promotionDiscount")}</dt>
                    <dd className="font-semibold">− <Price value={promoDiscount} /></dd>
                  </div>
                )}
                {giftVoucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("giftVoucher")}</dt>
                    <dd className="font-semibold">− <Price value={giftVoucherDiscount} /></dd>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("pointsDiscount")}</dt>
                    <dd className="font-semibold">− <Price value={pointsDiscount} /></dd>
                  </div>
                )}
                {rounding !== 0 && (
                  <div className="flex justify-between text-gray-600" title={translate("priceRoundingHint")}>
                    <dt>{translate("priceRounding")}</dt>
                    <dd className="font-semibold">
                      {rounding > 0 ? "+" : "−"} <Price value={Math.abs(rounding)} />
                    </dd>
                  </div>
                )}
                {/* Only accounts collect points; guests are told how many they would get by signing in. */}
                {api.isAuthenticated() ? (
                  <div className="flex justify-between text-gray-600">
                    <dt>{translate("pointEarned")}</dt>
                    <dd>+{estimatedPoints}</dd>
                  </div>
                ) : (
                  estimatedPoints > 0 && (
                    <p className="text-xs text-gray-500">
                      {translate("loyaltyGuestEarnHint").replace("{points}", estimatedPoints)}
                    </p>
                  )
                )}
                {api.isAuthenticated() && hasDiscountedItems && (
                  <p className="text-xs text-orange-600">{translate("discountedItemsEarnNoPoints")}</p>
                )}
              </dl>

              <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-gray-300 pt-4">
                <p className="font-display text-lg font-bold uppercase tracking-tight text-gray-900">
                  {translate("amountForPayment")}
                </p>
                <p className="text-2xl font-extrabold tabular-nums text-gray-900"><Price value={finalAmount} /></p>
              </div>

              {paymentMethod === "home_delivery" && (
                <CourierCodNote amount={finalAmount} settings={shippingSettings} translate={translate} />
              )}

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      if (termsError) setTermsError("");
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#141409]"
                  />
                  <span>
                    {translate("agreeToTheTerms")}{" "}
                    <Link to="/terms-of-services" className="font-bold text-black underline">
                      {translate("termsOfService")}
                    </Link>{" "}
                    {translate("and")}{" "}
                    <Link to="/privacy-policy" className="font-bold text-black underline">
                      {translate("privacyPolicy")}
                    </Link>
                  </span>
                </label>
                {termsError && <p className="mt-1.5 text-xs text-red-600">{termsError}</p>}
              </div>

              <TurnstileCheck ref={turnstileRef} language={language} />

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={saving || isCartEmpty || giftVoucherBlocked}
                className={`${darkButtonClass} group flex min-h-[52px] w-full items-center justify-center gap-2 text-[15px] hover:shadow-[0_12px_24px_-12px_rgba(20,20,9,0.6)] active:scale-[0.98]`}
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {saving ? translate("processing") : translate("placeOrder")}
                {!saving && (
                  <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-1" />
                )}
              </button>
              <Link
                to="/cart"
                className="-mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {translate("backToCart")}
              </Link>
              <p className="-mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <FiLock size={12} />
                {translate("securePaymentNote")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
