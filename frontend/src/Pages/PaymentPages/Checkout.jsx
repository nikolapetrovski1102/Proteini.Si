import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { clearGuestCart, useCart } from "../Hooks/useCart";
import { useLanguage } from "../translation/LanguageContext";
import Toast from "../Toast";
import { getDeclaredDeliveryFees } from "../../utils/deliveryPricing";

const SHIPPING_COUNTRY = "North Macedonia";
const COUNTRIES = [SHIPPING_COUNTRY];
const DEFAULT_LOYALTY_PERCENTAGE = 2.0;
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPrice = (value) => `MKD ${Number(value || 0).toFixed(2)}`;

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

const inputClass = (hasError) =>
  `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-300 focus:border-[#2096D8] focus:ring-[#2096D8]/15"
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

function Section({ title, children, aside }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
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
        <div className="mt-2 flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
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
            className="rounded-md bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {applyLabel}
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PaymentOption({ id, value, checked, disabled, onChange, title, description }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : checked
            ? "cursor-pointer border-[#2096D8] bg-[#2096D8]/5"
            : "cursor-pointer border-gray-200 hover:border-gray-300"
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
        className="mt-0.5 h-4 w-4 accent-[#2096D8]"
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1240px] px-4 pt-[70px] pb-16 sm:px-6">
        <div className="mb-8 h-7 w-64 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <div className="h-96 animate-pulse rounded-xl bg-gray-200/70" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-200/70" />
          </div>
          <div className="h-[480px] animate-pulse rounded-xl bg-gray-200/70" />
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [accountType, setAccountType] = useState("natural");
  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [billingForm, setBillingForm] = useState(EMPTY_BILLING);
  const [deliveryForm, setDeliveryForm] = useState(EMPTY_DELIVERY);
  const [differentDelivery, setDifferentDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderNote, setOrderNote] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [termsError, setTermsError] = useState("");
  const [saving, setSaving] = useState(false);
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
  const isCartEmpty = cartItems.length === 0;

  const promoDiscount = Number(appliedPromotion?.discountAmount || 0);
  const giftVoucherDiscount = Number(appliedGiftVoucher?.applicableAmount || 0);
  const maxRedeemablePoints = Math.min(
    availablePoints,
    Math.floor(Math.max(cartTotal - promoDiscount, 0) * 0.5),
  );
  const pointsDiscount = Math.max(Math.min(pointsInput || 0, maxRedeemablePoints), 0);

  const closeToast = useCallback(() => setToast(null), []);

  // ---- One-time loads -------------------------------------------------------

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
    api
      .validatePromotionCode(appliedPromotion.code, cartTotal, userEmail || null)
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
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedPromotion?.code, cartTotal, userEmail]);

  const voucherOrderAmount = () => {
    const { totalDeliveryFee } = getDeclaredDeliveryFees(
      cartTotal,
      paymentMethod,
      shippingSettings || {},
    );
    return Math.max(cartTotal + totalDeliveryFee - promoDiscount - pointsDiscount, 0);
  };

  useEffect(() => {
    if (!appliedGiftVoucher?.code) return;
    let cancelled = false;
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
    return () => {
      cancelled = true;
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
      const promotion = await api.validatePromotionCode(code, cartTotal, userEmail || null);
      setAppliedPromotion(promotion);
      setPromotionCode(promotion.code || code);
    } catch (promotionApplyError) {
      setAppliedPromotion(null);
      setPromotionError(promotionApplyError.message);
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

    if (!userEmail.trim()) errors.email = required;
    else if (!EMAIL_PATTERN.test(userEmail.trim())) errors.email = translate("invalidEmail");

    if (differentDelivery) {
      [
        "Delivery_FullName",
        "Delivery_Address",
        "Delivery_PostCode",
        "Delivery_City",
        "Delivery_Phone",
      ].forEach((name) => requireField(name, deliveryForm[name]));
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

    setSaving(true);
    try {
      const isCompany = accountType === "company";
      const orderData = {
        billing_Type: accountType,
        billing_FullName: isCompany ? billingForm.Company_Name : billingForm.User_FullName,
        billing_Address: isCompany ? billingForm.Company_Address : billingForm.User_Address,
        billing_PostCode: isCompany ? billingForm.Company_PostCode : billingForm.User_PostCode,
        billing_City: isCompany ? billingForm.Company_City : billingForm.User_City,
        billing_Country: isCompany ? billingForm.Company_Country : billingForm.User_Country,
        billing_Phone: isCompany ? billingForm.Company_Phone : billingForm.User_Phone,
        billing_Email: userEmail.trim(),
        billing_TaxNumber: isCompany ? billingForm.Company_TaxNumber : null,
        billing_CompanyName: isCompany ? billingForm.Company_Name : null,
        delivery_IsDifferent: differentDelivery,
        delivery_FullName: differentDelivery ? deliveryForm.Delivery_FullName : null,
        delivery_Address: differentDelivery ? deliveryForm.Delivery_Address : null,
        delivery_PostCode: differentDelivery ? deliveryForm.Delivery_PostCode : null,
        delivery_City: differentDelivery ? deliveryForm.Delivery_City : null,
        delivery_Country: differentDelivery ? deliveryForm.Delivery_Country : null,
        delivery_Phone: differentDelivery ? deliveryForm.Delivery_Phone : null,
        order_Note: orderNote,
        gift_Voucher_Code: appliedGiftVoucher?.code || null,
        promo_Code: appliedPromotion?.code || null,
        selected_Free_Gift_Id: selectedFreeGiftId,
        payment_Method: paymentMethod,
        pointsToRedeem: pointsDiscount,
        createAccount,
        password: createAccount ? password : null,
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

      // The payment provider can answer with a ready HTML form.
      if (typeof response === "string" && response.trim().startsWith("<!DOCTYPE")) {
        document.write(response);
        document.close();
        return;
      }

      const clearCartAfterOrder = () => {
        if (api.isAuthenticated()) refreshCart();
        else clearGuestCart();
      };

      const showSuccess = (message, orderNumber) => {
        const text = orderNumber ? `${message} #${orderNumber}` : message;
        setToast({ message: text, type: "success" });
        setSuccess(text);
      };

      if (paymentMethod === "home_delivery") {
        if (response && (response.status === true || response.message)) {
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
    cartTotal,
    paymentMethod,
    shippingSettings || {},
  );
  const finalAmount = Math.max(
    cartTotal + deliveryFee + cashOnDeliveryFee - promoDiscount - giftVoucherDiscount - pointsDiscount,
    0,
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
    <TextField
      name="email"
      type="email"
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
  );

  const accountTabClass = (type) =>
    `flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
      accountType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={4000} />
      )}

      <div className="mx-auto max-w-[1240px] px-4 pt-[70px] pb-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {translate("quicklyCompleteYourPurchase")}
          </h1>
          <Link to="/cart" className="text-sm font-semibold text-[#2096D8] hover:underline">
            ← {translate("shoppingCart")}
          </Link>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          {/* Left column */}
          <div className="min-w-0 space-y-6">
            {(error || success) && (
              <div
                role="alert"
                className={`rounded-lg px-4 py-3 text-sm ${
                  success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {success || error}
              </div>
            )}

            <Section title={translate("billingInformation")}>
              <div className="mb-5 flex max-w-sm rounded-lg bg-gray-100 p-1">
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
                      className: "sm:col-span-2",
                    })}
                    {billingField("User_Address", "address", {
                      placeholder: translate("enterAddress"),
                      autoComplete: "street-address",
                      className: "sm:col-span-2",
                    })}
                    {billingField("User_City", "city", {
                      placeholder: translate("enterCity"),
                      autoComplete: "address-level2",
                    })}
                    {billingField("User_PostCode", "postCode", {
                      placeholder: translate("enterPostCode"),
                      autoComplete: "postal-code",
                      inputMode: "numeric",
                    })}
                    <CountryField
                      name="User_Country"
                      label={translate("country")}
                      value={billingForm.User_Country}
                      onChange={handleBillingChange}
                      translate={translate}
                    />
                    {billingField("User_Phone", "phone", {
                      type: "tel",
                      placeholder: translate("enterPhoneNumber"),
                      autoComplete: "tel",
                    })}
                  </>
                ) : (
                  <>
                    {billingField("Company_Name", "companyName", {
                      autoComplete: "organization",
                    })}
                    {billingField("Company_TaxNumber", "taxNumber", {
                      placeholder: "123456789",
                    })}
                    {billingField("Company_Address", "companyAddress", {
                      placeholder: translate("enterAddress"),
                      autoComplete: "street-address",
                      className: "sm:col-span-2",
                    })}
                    {billingField("Company_City", "city", {
                      placeholder: translate("enterCity"),
                      autoComplete: "address-level2",
                    })}
                    {billingField("Company_PostCode", "postCode", {
                      placeholder: translate("enterPostCode"),
                      autoComplete: "postal-code",
                      inputMode: "numeric",
                    })}
                    <CountryField
                      name="Company_Country"
                      label={translate("country")}
                      value={billingForm.Company_Country}
                      onChange={handleBillingChange}
                      translate={translate}
                    />
                    {billingField("Company_Phone", "phone", {
                      type: "tel",
                      placeholder: translate("enterPhoneNumber"),
                      autoComplete: "tel",
                    })}
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
                      className="mt-0.5 h-4 w-4 accent-[#2096D8]"
                    />
                    <span>
                      {translate("createAUserDesc1")}{" "}
                      <strong>{translate("createAUserDesc2")}</strong>
                    </span>
                  </label>
                )}

                {createAccount && (
                  <div className="grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
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

                <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={differentDelivery}
                    onChange={handleDifferentDeliveryToggle}
                    className="mt-0.5 h-4 w-4 accent-[#2096D8]"
                  />
                  <span>{translate("deliveryAddressIsDifferentFromInvoiceAddress")}</span>
                </label>
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
                  {deliveryField("Delivery_Address", "address", {
                    placeholder: translate("enterAddress"),
                    autoComplete: "shipping street-address",
                    className: "sm:col-span-2",
                  })}
                  {deliveryField("Delivery_City", "city", {
                    placeholder: translate("enterCity"),
                    autoComplete: "shipping address-level2",
                  })}
                  {deliveryField("Delivery_PostCode", "postCode", {
                    placeholder: translate("enterPostCode"),
                    autoComplete: "shipping postal-code",
                    inputMode: "numeric",
                  })}
                  <CountryField
                    name="Delivery_Country"
                    label={translate("country")}
                    value={deliveryForm.Delivery_Country}
                    onChange={handleDeliveryChange}
                    translate={translate}
                  />
                  {deliveryField("Delivery_Phone", "phone", {
                    type: "tel",
                    placeholder: translate("enterPhoneNumber"),
                    autoComplete: "shipping tel",
                  })}
                </div>
              </Section>
            )}

            <Section title={translate("paymentMethod")}>
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
                  disabled={shippingSettings?.homeDeliveryEnabled === false}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  title={translate("homeDelivery")}
                  description={translate("deliveryCourierNotice")}
                />
              </div>
            </Section>

            <Section title={translate("orderNote")}>
              <textarea
                id="order-note"
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
                rows={3}
                className={`${inputClass(false)} resize-none`}
                placeholder={translate("orderNoteDesc")}
              />

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
                    className="whitespace-nowrap rounded-md bg-[#8DC658] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7fb64c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {translate("subscribe")}
                  </button>
                </div>
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
          <aside className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  {translate("productsInCart")} ({cart?.totalItems || 0})
                </h2>
                <Link to="/cart" className="text-xs font-semibold text-gray-500 hover:text-gray-900 hover:underline">
                  {translate("showAll")}
                </Link>
              </div>

              {isCartEmpty ? (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {translate("cartEmptyCheckout")}
                </p>
              ) : (
                <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const itemPoints = pointsForItem(item);
                    return (
                      <li key={item.cartItem_Id} className="flex items-center gap-3 py-3">
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-md border border-gray-100 bg-white">
                          {item.product_Img && (
                            <img
                              src={item.product_Img}
                              alt={item.product_Name}
                              loading="lazy"
                              className="h-full w-full object-contain p-1"
                            />
                          )}
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-800 px-1 text-[11px] font-semibold text-white">
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
                        <p className="whitespace-nowrap text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
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
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                            selected ? "border-[#FDC700] bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="free-gift"
                            checked={selected}
                            onChange={() => setSelectedFreeGiftId(gift.freeGiftId)}
                            className="h-4 w-4 accent-[#FDC700]"
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
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-yellow-900">
                      {translate("yourLoyaltyPoints")}
                    </p>
                    <p className="text-base font-bold text-yellow-700">
                      {Math.floor(availablePoints)} {translate("points")}
                    </p>
                  </div>
                  <p className="mb-3 text-xs text-gray-600">{translate("onepointonemkd")}</p>
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
                      className="rounded-md bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-black"
                    >
                      {translate("apply")}
                    </button>
                  </div>
                  {pointsMessage && (
                    <p className="mt-2 text-xs text-green-700">{pointsMessage}</p>
                  )}
                </div>
              )}

              <dl className="space-y-2 border-t border-gray-100 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">{translate("subtotal")}</dt>
                  <dd className="font-semibold">{formatPrice(cartTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">{translate("delivery")}</dt>
                  <dd className="font-semibold">{formatPrice(deliveryFee)}</dd>
                </div>
                {cashOnDeliveryFee > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">{translate("cashOnDeliveryFee")}</dt>
                    <dd className="font-semibold">{formatPrice(cashOnDeliveryFee)}</dd>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("promotionDiscount")}</dt>
                    <dd className="font-semibold">− {formatPrice(promoDiscount)}</dd>
                  </div>
                )}
                {giftVoucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("giftVoucher")}</dt>
                    <dd className="font-semibold">− {formatPrice(giftVoucherDiscount)}</dd>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>{translate("pointsDiscount")}</dt>
                    <dd className="font-semibold">− {formatPrice(pointsDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <dt>{translate("pointEarned")}</dt>
                  <dd>+{estimatedPoints}</dd>
                </div>
                {hasDiscountedItems && (
                  <p className="text-xs text-orange-600">{translate("discountedItemsEarnNoPoints")}</p>
                )}
              </dl>

              <div className="flex items-baseline justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-bold">{translate("amountForPayment")}</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(finalAmount)}</p>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      if (termsError) setTermsError("");
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#2096D8]"
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

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={saving || isCartEmpty}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#8DC658] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#7fb64c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {saving ? translate("processing") : translate("placeOrder")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
