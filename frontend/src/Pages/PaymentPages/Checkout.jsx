import { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";
import { useCart } from "../Hooks/useCart";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";
import Toast from "../Toast";
import { getDeclaredDeliveryFees } from "../../utils/deliveryPricing";

const SHIPPING_COUNTRY = "North Macedonia";

export default function Checkout() {
  const [accountType, setAccountType] = useState("natural");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [differentDelivery, setDifferentDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [submitButtonText, setSubmitButtonText] = useState("Continue Shopping");
  const [orderNote, setOrderNote] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionError, setPromotionError] = useState("");
  const [giftVoucherCode, setGiftVoucherCode] = useState("");
  const [appliedGiftVoucher, setAppliedGiftVoucher] = useState(null);
  const [giftVoucherError, setGiftVoucherError] = useState("");
  const [shippingSettings, setShippingSettings] = useState(null);
  const [availableFreeGifts, setAvailableFreeGifts] = useState([]);
  const [selectedFreeGiftId, setSelectedFreeGiftId] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { translate } = useLanguage();
  const [toast, setToast] = useState(null);

  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  const [loyaltyMap, setLoyaltyMap] = useState({});
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  const navigate = useNavigate();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const sidebarRef = useRef(null);
  const stopRef = useRef(null);

  const promoDiscount = Number(appliedPromotion?.discountAmount || 0);
  const giftVoucherDiscount = Number(appliedGiftVoucher?.applicableAmount || 0);
  const maxRedeemablePoints = Math.min(
    availablePoints,
    Math.floor(Math.max((cart?.total || 0) - promoDiscount, 0) * 0.5),
  );

  useEffect(() => {
    if (paymentMethod === "home_delivery") {
      setSubmitButtonText("Continue Shopping");
    } else {
      setSubmitButtonText(saving ? "Processing..." : "Submit order");
    }
  }, [paymentMethod, saving]);

  useEffect(() => {
    const discount = Math.min(pointsToRedeem, maxRedeemablePoints);
    setPointsDiscount(discount);
  }, [pointsToRedeem, maxRedeemablePoints]);

  useEffect(() => {
    let cancelled = false;
    api
      .getShippingSettings()
      .then((settings) => {
        if (!cancelled) {
          setShippingSettings(settings);
          if (settings.cardPaymentEnabled === false) setPaymentMethod("home_delivery");
        }
      })
      .catch((settingsError) => {
        console.error("Error loading shipping settings:", settingsError);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchAvailablePoints = async () => {
    if (!api.isAuthenticated()) return;
    setLoadingPoints(true);
    try {
      const response = await api.getAvailableLoyaltyPoints();
      if (response.status) {
        setAvailablePoints(response.availablePoints || 0);
      }
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
      setAvailablePoints(0);
    } finally {
      setLoadingPoints(false);
    }
  };

  const fetchLoyalty = async () => {
    if (!cart?.items || cart.items.length === 0) {
      setLoyaltyMap({});
      return;
    }

    setLoadingLoyalty(true);
    try {
      const map = {};

      for (const item of cart.items) {
        try {
          let loyaltyPercentage = 2.0;

          if (item.variant_Id) {
            try {
              const variantData = await api.getVariantWithParent(
                item.variant_Id,
              );

              if (variantData && variantData.data) {
                const lp =
                  variantData.data.loyaltyPercentage ??
                  variantData.data.LoyaltyPercentage;

                if (lp !== null && lp !== undefined && parseFloat(lp) > 0) {
                  loyaltyPercentage = parseFloat(lp);
                } else {
                  const productData = await api.getProductById(item.product_Id);
                  if (productData && productData.product) {
                    loyaltyPercentage =
                      productData.product.loyaltyPercentage ?? 2.0;
                  }
                }
              } else {
                const productData = await api.getProductById(item.product_Id);
                if (productData && productData.product) {
                  loyaltyPercentage =
                    productData.product.loyaltyPercentage ?? 2.0;
                }
              }
            } catch (variantError) {
              console.error(
                `❌ ERROR fetching variant ${item.variant_Id}:`,
                variantError,
              );
              const productData = await api.getProductById(item.product_Id);
              if (productData && productData.product) {
                loyaltyPercentage =
                  productData.product.loyaltyPercentage ?? 2.0;
              }
            }
          } else {
            const productData = await api.getProductById(item.product_Id);
            if (productData && productData.product) {
              loyaltyPercentage = productData.product.loyaltyPercentage ?? 2.0;
            }
          }

          const key = item.variant_Id
            ? `variant_${item.variant_Id}`
            : `product_${item.product_Id}`;
          map[key] = loyaltyPercentage;
        } catch (error) {
          const key = item.variant_Id
            ? `variant_${item.variant_Id}`
            : `product_${item.product_Id}`;
          map[key] = 2.0;
        }
      }

      setLoyaltyMap(map);
    } catch (error) {
      console.error("Error fetching loyalty:", error);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      fetchLoyalty();
    }
  }, [cart]);

  useEffect(() => {
    let cancelled = false;
    const subtotal = cart?.total || 0;

    const loadPromotions = async () => {
      try {
        const data = await api.getActivePromotions(subtotal);
        if (cancelled) return;
        setAvailableFreeGifts(data.freeGifts || []);
        if (
          selectedFreeGiftId &&
          !(data.freeGifts || []).some(
            (gift) => gift.freeGiftId === selectedFreeGiftId,
          )
        ) {
          setSelectedFreeGiftId(null);
        }

      } catch (loadError) {
        console.error("Error loading promotions:", loadError);
      }
    };

    loadPromotions();
    return () => {
      cancelled = true;
    };
  }, [
    cart?.total,
    selectedFreeGiftId,
  ]);

  useEffect(() => {
    if (!appliedPromotion?.code) return;
    api
      .validatePromotionCode(
        appliedPromotion.code,
        cart?.total || 0,
        userEmail || null,
      )
      .then((promotion) => {
        setAppliedPromotion(promotion);
        setPromotionError("");
      })
      .catch(() => {
        setAppliedPromotion(null);
        setPromotionError("The promotion code no longer applies to this order.");
      });
  }, [appliedPromotion?.code, cart?.total, userEmail]);

  useEffect(() => {
    if (!appliedGiftVoucher?.code) return;
    const { totalDeliveryFee } = getDeclaredDeliveryFees(
      cart?.total || 0,
      paymentMethod,
      shippingSettings || {},
    );
    const orderAmount = Math.max(
      (cart?.total || 0) + totalDeliveryFee - promoDiscount - pointsDiscount,
      0,
    );
    api
      .validateGiftVoucher(appliedGiftVoucher.code, orderAmount)
      .then(setAppliedGiftVoucher)
      .catch(() => {
        setAppliedGiftVoucher(null);
        setGiftVoucherError("The gift voucher no longer applies to this order.");
      });
  }, [appliedGiftVoucher?.code, cart?.total, paymentMethod, pointsDiscount, promoDiscount, shippingSettings]);

  const [billingForm, setBillingForm] = useState({
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
  });

  const [deliveryForm, setDeliveryForm] = useState({
    Delivery_FullName: "",
    Delivery_Address: "",
    Delivery_PostCode: "",
    Delivery_City: "",
    Delivery_Country: SHIPPING_COUNTRY,
    Delivery_Phone: "",
  });

  const countries = [SHIPPING_COUNTRY];

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = await api.fetchCurrentUser();
      if (user) {
        setUserData(user);
        setUserEmail(user.user_Email || "");
        setUserName(user.user_FullName || "");

        if (user.user_IsCompany === true) {
          setAccountType("company");
          const companyData = user.company || {};
          setBillingForm({
            ...billingForm,
            Company_Name: companyData.company_Name || "",
            Company_Address: companyData.company_Address || "",
            Company_TaxNumber: companyData.company_TaxNumber || "",
            Company_PostCode: companyData.company_PostCode || "",
            Company_City: companyData.company_City || "",
            Company_Country: SHIPPING_COUNTRY,
            Company_Phone: companyData.company_Phone || "",
          });
          setDeliveryForm({
            Delivery_FullName: companyData.company_Name || "",
            Delivery_Address: companyData.company_Address || "",
            Delivery_PostCode: companyData.company_PostCode || "",
            Delivery_City: companyData.company_City || "",
            Delivery_Country: SHIPPING_COUNTRY,
            Delivery_Phone: companyData.company_Phone || "",
          });
        } else {
          setAccountType("natural");
          setBillingForm({
            ...billingForm,
            User_FullName: user.user_FullName || "",
            User_Address: user.user_Address || "",
            User_PostCode: user.user_PostCode || "",
            User_City: user.user_City || "",
            User_Country: SHIPPING_COUNTRY,
            User_Phone: user.user_Phone || "",
          });
          setDeliveryForm({
            Delivery_FullName: user.user_FullName || "",
            Delivery_Address: user.user_Address || "",
            Delivery_PostCode: user.user_PostCode || "",
            Delivery_City: user.user_City || "",
            Delivery_Country: SHIPPING_COUNTRY,
            Delivery_Phone: user.user_Phone || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAvailablePoints();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      const sidebar = sidebarRef.current;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const startSticky = 210;
      const stopAt = documentHeight - windowHeight - 900;

      if (scrollY > startSticky && scrollY < stopAt) {
        sidebar.classList.add("fixed-sidebar");
        sidebar.classList.remove("absolute-sidebar");
        sidebar.style.top = "";
      } else if (scrollY >= stopAt && stopAt > startSticky) {
        sidebar.classList.add("absolute-sidebar");
        sidebar.classList.remove("fixed-sidebar");
        sidebar.style.top = `${stopAt - startSticky}px`;
      } else {
        sidebar.classList.remove("fixed-sidebar");
        sidebar.classList.remove("absolute-sidebar");
        sidebar.style.top = "";
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleBillingChange = (e) => {
    setBillingForm({ ...billingForm, [e.target.name]: e.target.value });
  };

  const handleDeliveryChange = (e) => {
    setDeliveryForm({ ...deliveryForm, [e.target.name]: e.target.value });
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    if (!differentDelivery) {
      if (type === "company") {
        setDeliveryForm({
          Delivery_FullName: billingForm.Company_Name,
          Delivery_Address: billingForm.Company_Address,
          Delivery_PostCode: billingForm.Company_PostCode,
          Delivery_City: billingForm.Company_City,
          Delivery_Country: billingForm.Company_Country,
          Delivery_Phone: billingForm.Company_Phone,
        });
      } else {
        setDeliveryForm({
          Delivery_FullName: billingForm.User_FullName,
          Delivery_Address: billingForm.User_Address,
          Delivery_PostCode: billingForm.User_PostCode,
          Delivery_City: billingForm.User_City,
          Delivery_Country: billingForm.User_Country,
          Delivery_Phone: billingForm.User_Phone,
        });
      }
    }
  };

  const handleDifferentDeliveryToggle = (e) => {
    const isChecked = e.target.checked;
    setDifferentDelivery(isChecked);
    if (!isChecked) {
      if (accountType === "company") {
        setDeliveryForm({
          Delivery_FullName: billingForm.Company_Name,
          Delivery_Address: billingForm.Company_Address,
          Delivery_PostCode: billingForm.Company_PostCode,
          Delivery_City: billingForm.Company_City,
          Delivery_Country: billingForm.Company_Country,
          Delivery_Phone: billingForm.Company_Phone,
        });
      } else {
        setDeliveryForm({
          Delivery_FullName: billingForm.User_FullName,
          Delivery_Address: billingForm.User_Address,
          Delivery_PostCode: billingForm.User_PostCode,
          Delivery_City: billingForm.User_City,
          Delivery_Country: billingForm.User_Country,
          Delivery_Phone: billingForm.User_Phone,
        });
      }
    }
  };

  const handleApplyGiftVoucher = async () => {
    if (!giftVoucherCode.trim()) return;
    setGiftVoucherError("");
    try {
      const { totalDeliveryFee } = getDeclaredDeliveryFees(
        cart?.total || 0,
        paymentMethod,
        shippingSettings || {},
      );
      const result = await api.validateGiftVoucher(
        giftVoucherCode.trim(),
        Math.max(
          (cart?.total || 0) +
            totalDeliveryFee -
            promoDiscount -
            pointsDiscount,
          0,
        ),
      );
      setAppliedGiftVoucher(result);
      setGiftVoucherCode(result.code);
    } catch (voucherApplyError) {
      setAppliedGiftVoucher(null);
      setGiftVoucherError(voucherApplyError.message);
    }
  };

  const handleApplyPromotion = async () => {
    const code = promotionCode.trim().toUpperCase();
    if (!code) return;

    setPromotionError("");
    try {
      const promotion = await api.validatePromotionCode(
        code,
        cart?.total || 0,
        userEmail || null,
      );
      setAppliedPromotion(promotion);
      setPromotionCode(promotion.code || code);
    } catch (promotionApplyError) {
      setAppliedPromotion(null);
      setPromotionError(promotionApplyError.message);
    }
  };

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail.trim()) return;
    try {
      await api.subscribeNewsletter(newsletterEmail.trim(), "checkout");
      alert("Successfully subscribed to newsletter!");
      setNewsletterEmail("");
    } catch (error) {
      alert(error.message || "Failed to subscribe. Please try again.");
    }
  };

  const handleApplyPoints = () => {
    if (pointsToRedeem > maxRedeemablePoints) {
      alert(`You can only redeem up to ${maxRedeemablePoints} points`);
      setPointsToRedeem(maxRedeemablePoints);
    } else if (pointsToRedeem < 0) {
      setPointsToRedeem(0);
    } else {
      alert(
        `${pointsToRedeem} points applied! Discount: MKD ${pointsToRedeem.toFixed(2)}`,
      );
    }
  };

  const calculatePointsForProduct = (item) => {
    let key;
    if (item.variant_Id) {
      key = `variant_${item.variant_Id}`;
    } else {
      key = `product_${item.product_Id}`;
    }

    const loyaltyPercentage = loyaltyMap[key] ?? 2.0;
    const itemTotal = (item.price || 0) * (item.quantity || 1);

    let hasDiscount = false;
    if (
      item.variant_Compare_Price &&
      item.variant_Original_Price &&
      item.variant_Compare_Price < item.variant_Original_Price
    ) {
      hasDiscount = true;
    }

    if (hasDiscount) {
      return 0;
    }

    return Math.floor(itemTotal * (loyaltyPercentage / 100));
  };

  const calculateTotalEstimatedPoints = () => {
    if (!cart?.items) return 0;

    let totalPoints = 0;
    for (const item of cart.items) {
      totalPoints += calculatePointsForProduct(item);
    }
    return totalPoints;
  };

  // ✅ COMPLETE UPDATED handleSubmitOrder with success popup
  const handleSubmitOrder = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    setTermsError("");

    if (!termsAccepted) {
      setTermsError(
        "You must agree to the Terms of Service and Privacy Policy to place your order.",
      );
      setSaving(false);
      return;
    }

    if (accountType === "company") {
      if (!billingForm.Company_Name) {
        setError("Company name is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_Address) {
        setError("Company address is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_TaxNumber) {
        setError("Tax number is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_PostCode) {
        setError("Post code is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_City) {
        setError("City is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_Country) {
        setError("Country is required");
        setSaving(false);
        return;
      }
      if (!billingForm.Company_Phone) {
        setError("Phone number is required");
        setSaving(false);
        return;
      }
    } else {
      if (!billingForm.User_FullName) {
        setError("Full name is required");
        setSaving(false);
        return;
      }
      if (!billingForm.User_Address) {
        setError("Address is required");
        setSaving(false);
        return;
      }
      if (!billingForm.User_PostCode) {
        setError("Post code is required");
        setSaving(false);
        return;
      }
      if (!billingForm.User_City) {
        setError("City is required");
        setSaving(false);
        return;
      }
      if (!billingForm.User_Country) {
        setError("Country is required");
        setSaving(false);
        return;
      }
      if (!billingForm.User_Phone) {
        setError("Phone number is required");
        setSaving(false);
        return;
      }
    }

    if (createAccount) {
      if (!password) {
        setError("Please enter a password to create your account");
        setSaving(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setSaving(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setSaving(false);
        return;
      }
    }

    try {
      const cartItemsForOrder =
        cart?.items?.map((item) => ({
          product_Id: item.product_Id,
          quantity: item.quantity,
          price: item.price,
          variant_Id: item.variant_Id || null,
          variant_Name: item.variant_Name || null,
          variant_Packaging: item.variant_Packaging || null,
          variant_Weight_Grams:
            item.variant_Weight_Grams || item.weight_Grams || null,
        })) || [];

      const orderData = {
        billing_Type: accountType,
        billing_FullName:
          accountType === "company"
            ? billingForm.Company_Name
            : billingForm.User_FullName,
        billing_Address:
          accountType === "company"
            ? billingForm.Company_Address
            : billingForm.User_Address,
        billing_PostCode:
          accountType === "company"
            ? billingForm.Company_PostCode
            : billingForm.User_PostCode,
        billing_City:
          accountType === "company"
            ? billingForm.Company_City
            : billingForm.User_City,
        billing_Country:
          accountType === "company"
            ? billingForm.Company_Country
            : billingForm.User_Country,
        billing_Phone:
          accountType === "company"
            ? billingForm.Company_Phone
            : billingForm.User_Phone,
        billing_Email: userEmail,
        billing_TaxNumber:
          accountType === "company" ? billingForm.Company_TaxNumber : null,
        billing_CompanyName:
          accountType === "company" ? billingForm.Company_Name : null,
        delivery_IsDifferent: differentDelivery,
        delivery_FullName: differentDelivery
          ? deliveryForm.Delivery_FullName
          : null,
        delivery_Address: differentDelivery
          ? deliveryForm.Delivery_Address
          : null,
        delivery_PostCode: differentDelivery
          ? deliveryForm.Delivery_PostCode
          : null,
        delivery_City: differentDelivery ? deliveryForm.Delivery_City : null,
        delivery_Country: differentDelivery
          ? deliveryForm.Delivery_Country
          : null,
        delivery_Phone: differentDelivery ? deliveryForm.Delivery_Phone : null,
        order_Note: orderNote,
        gift_Voucher_Code: appliedGiftVoucher?.code || null,
        promo_Code: appliedPromotion?.code || null,
        selected_Free_Gift_Id: selectedFreeGiftId,
        payment_Method: paymentMethod,
        pointsToRedeem: pointsDiscount,
        createAccount: createAccount,
        password: createAccount ? password : null,
        cartItems: cartItemsForOrder,
      };

      const response = await api.createOrder(orderData);

      // Check if response is HTML (cPay form)
      if (
        typeof response === "string" &&
        response.trim().startsWith("<!DOCTYPE")
      ) {
        document.write(response);
        document.close();
        return;
      }

      // ✅ Helper function to clear guest cart
      const clearGuestCart = () => {
        if (!api.isAuthenticated()) {
          localStorage.removeItem("guestCart");
          if (refreshCart) {
            refreshCart();
          } else {
            window.location.reload();
          }
        }
      };

      // ✅ Helper function to show success popup
      const showSuccessPopup = (message, orderNumber) => {
        const successMessage = orderNumber
          ? `${message}\nOrder #: ${orderNumber}`
          : message;

        // Show toast notification
        setToast({
          message: successMessage,
          type: "success",
        });

        // Also set success state for the green message
        setSuccess(successMessage);
      };

      // Handle home_delivery response (pay after delivery)
      if (paymentMethod === "home_delivery") {
        if (response && (response.status === true || response.message)) {
          // ✅ Clear guest cart
          clearGuestCart();

          // ✅ Show success popup
          const popupMessage =
            response.message ||
            "✅ Order created successfully! Thank you for your purchase.";
          showSuccessPopup(popupMessage, response.orderNumber);

          // ✅ Wait 3 seconds before navigating
          setTimeout(() => {
            navigate("/all-products");
          }, 3000);
        } else {
          setError(response?.message || "Failed to create order");
        }
        setSaving(false);
        return;
      }

      // Handle credit_card response
      if (response && response.status === true) {
        // ✅ Clear guest cart
        clearGuestCart();

        if (response.paymentUrl) {
          // For credit card, show redirecting message
          setToast({
            message: "Redirecting to payment...",
            type: "info",
          });
          setTimeout(() => {
            window.location.href = response.paymentUrl;
          }, 1000);
        } else {
          // ✅ Show success popup
          const popupMessage =
            "✅ Order created successfully! Redirecting to confirmation...";
          showSuccessPopup(popupMessage, response.orderNumber);

          setTimeout(() => {
            navigate(`/order-confirmation/${response.orderId}`);
          }, 3000);
        }
      } else {
        setError(response?.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      if (
        error.response &&
        typeof error.response.data === "string" &&
        error.response.data.trim().startsWith("<!DOCTYPE")
      ) {
        document.write(error.response.data);
        document.close();
        return;
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit order",
      );
    } finally {
      setSaving(false);
    }
  };

  const { deliveryFee, cashOnDeliveryFee } = getDeclaredDeliveryFees(
    cart?.total || 0,
    paymentMethod,
    shippingSettings || {},
  );
  const finalAmount =
    Math.max(
      (cart?.total || 0) +
        deliveryFee +
        cashOnDeliveryFee -
        promoDiscount -
        giftVoucherDiscount -
        pointsDiscount,
      0,
    );

  const estimatedPoints = calculateTotalEstimatedPoints();

  const hasDiscountedItems =
    cart?.items?.some((item) => {
      if (
        item.variant_Compare_Price &&
        item.variant_Original_Price &&
        item.variant_Compare_Price < item.variant_Original_Price
      ) {
        return true;
      }
      return false;
    }) || false;

  if (loading || cartLoading || loadingLoyalty) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  const style = document.createElement("style");
  style.textContent = `
    .fixed-sidebar {
      position: fixed !important;
      top: 70px !important;
      width: 350px !important;
      z-index: 100 !important;
    }
    .absolute-sidebar {
      position: absolute !important;
      width: 350px !important;
      z-index: 100 !important;
    }
    @media (max-width: 1024px) {
      .fixed-sidebar, .absolute-sidebar {
        position: relative !important;
        top: auto !important;
        width: 100% !important;
      }
    }
  `;
  if (!document.querySelector("#checkout-styles")) {
    style.id = "checkout-styles";
    document.head.appendChild(style);
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {toast && (
        <Toast
          message={"Order Successful! Redirecting..."}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
      <div className="max-w-[1240px] mx-auto px-4 py-[70px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8">
            <p className="text-2xl font-bold mb-8">
              {translate("quicklyCompleteYourPurchase")}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}
            {termsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {termsError}
              </div>
            )}

            {/* Billing Information */}
            <div className="w-full">
              <p className="text-lg font-bold mb-5">
                {translate("billingInformation")}
              </p>
              <div className="max-w-[643px] w-full">
                <div className="flex flex-col mb-6">
                  <div className="flex gap-6 mb-8">
                    <button
                      onClick={() => handleAccountTypeChange("natural")}
                      className={`px-8 py-1.5 border transition-all ${accountType === "natural" ? "border-[#2096D8] bg-[#2096D8]/5" : "border-gray-300 hover:border-[#2096D8]"}`}
                    >
                      <span className="text-xs">
                        {translate("naturalPerson")}
                      </span>
                    </button>
                    <button
                      onClick={() => handleAccountTypeChange("company")}
                      className={`px-8 py-1.5 border transition-all ${accountType === "company" ? "border-[#2096D8] bg-[#2096D8]/5" : "border-gray-300 hover:border-[#2096D8]"}`}
                    >
                      <span className="text-xs">{translate("company")}</span>
                    </button>
                  </div>

                  {accountType === "natural" ? (
                    // ... natural person form fields (keep existing) ...
                    <>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("nameAndSurname")}
                        </span>
                        <input
                          type="text"
                          name="User_FullName"
                          value={billingForm.User_FullName}
                          onChange={handleBillingChange}
                          placeholder={translate("enterFullName")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("address")}
                        </span>
                        <input
                          type="text"
                          name="User_Address"
                          value={billingForm.User_Address}
                          onChange={handleBillingChange}
                          placeholder={translate("enterAddress")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("postCode")}
                        </span>
                        <input
                          type="text"
                          name="User_PostCode"
                          value={billingForm.User_PostCode}
                          onChange={handleBillingChange}
                          placeholder={translate("enterPostCode")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("city")}
                        </span>
                        <input
                          type="text"
                          name="User_City"
                          value={billingForm.User_City}
                          onChange={handleBillingChange}
                          placeholder={translate("enterCity")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("country")}
                        </span>
                        <select
                          name="User_Country"
                          value={billingForm.User_Country}
                          onChange={handleBillingChange}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8] bg-white"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>
                              {c === SHIPPING_COUNTRY ? translate("northMacedonia") : c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("phone")}
                        </span>
                        <input
                          type="text"
                          name="User_Phone"
                          value={billingForm.User_Phone}
                          onChange={handleBillingChange}
                          placeholder={translate("enterPhoneNumber")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("email")}
                        </span>
                        <input
                          type="text"
                          value={userEmail || ""}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full p-3 border border-gray-300 bg-gray-50"
                          placeholder={translate("enterYourEmailAddress")}
                        />
                      </div>
                    </>
                  ) : (
                    // ... company form fields (keep existing) ...
                    <>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("companyName")}
                        </span>
                        <input
                          type="text"
                          name="Company_Name"
                          value={billingForm.Company_Name}
                          onChange={handleBillingChange}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("companyAddress")}
                        </span>
                        <input
                          type="text"
                          name="Company_Address"
                          value={billingForm.Company_Address}
                          onChange={handleBillingChange}
                          placeholder={translate("enterAddress")}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("taxNumber")}
                        </span>
                        <input
                          type="text"
                          name="Company_TaxNumber"
                          value={billingForm.Company_TaxNumber}
                          onChange={handleBillingChange}
                          placeholder="123456789"
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("postCode")}
                        </span>
                        <input
                          type="text"
                          name="Company_PostCode"
                          value={billingForm.Company_PostCode}
                          onChange={handleBillingChange}
                          placeholder="1000"
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("city")}
                        </span>
                        <input
                          type="text"
                          name="Company_City"
                          value={billingForm.Company_City}
                          onChange={handleBillingChange}
                          placeholder="Skopje"
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("country")}
                        </span>
                        <select
                          name="Company_Country"
                          value={billingForm.Company_Country}
                          onChange={handleBillingChange}
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8] bg-white"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>
                              {c === SHIPPING_COUNTRY ? translate("northMacedonia") : c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("phone")}
                        </span>
                        <input
                          type="tel"
                          name="Company_Phone"
                          value={billingForm.Company_Phone}
                          onChange={handleBillingChange}
                          placeholder="+1234567890"
                          className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                        />
                      </div>
                      <div className="mb-3">
                        <span className="text-xs block mb-1">
                          {translate("email")}
                        </span>
                        <input
                          type="text"
                          value={userEmail}
                          className="w-full p-3 border border-gray-300 bg-gray-50"
                          placeholder={translate("enterYourEmailAddress")}
                        />
                      </div>
                    </>
                  )}

                  <div className="py-6 px-5 bg-gray-100 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id="create-account"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                      />
                      <label htmlFor="create-account" className="text-xs">
                        {translate("createAUserDesc1")}{" "}
                        <strong>{translate("createAUserDesc2")}</strong>
                      </label>
                    </div>
                    {createAccount && (
                      <div className="border-t border-gray-300 pt-4 mt-2">
                        <p className="text-sm font-bold mb-3">
                          {translate("createYourAccountPassword")}
                        </p>
                        <div className="mb-3">
                          <span className="text-xs block mb-1">
                            {translate("password")}
                          </span>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={translate("passwordPlaceholder")}
                            className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                          />
                        </div>
                        <div>
                          <span className="text-xs block mb-1">
                            {translate("confirmPassword")}
                          </span>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={translate("passwordPlaceholder2")}
                            className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Different Delivery */}
            <div className="py-6 px-5 flex items-center gap-4">
              <input
                type="checkbox"
                id="delivery-address"
                checked={differentDelivery}
                onChange={handleDifferentDeliveryToggle}
              />
              <label htmlFor="delivery-address" className="text-xs">
                {translate("deliveryAddressIsDifferentFromInvoiceAddress")}
              </label>
            </div>

            {/* Delivery Address */}
            {differentDelivery && (
              <div className="w-full mt-4">
                <p className="text-lg font-bold mb-5">
                  {translate("deliveryAddress")}
                </p>
                <div className="max-w-[643px] w-full">
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("fullName")}
                    </span>
                    <input
                      type="text"
                      name="Delivery_FullName"
                      value={deliveryForm.Delivery_FullName}
                      onChange={handleDeliveryChange}
                      placeholder={translate("enterFullName")}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                    />
                  </div>
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("address")}
                    </span>
                    <input
                      type="text"
                      name="Delivery_Address"
                      value={deliveryForm.Delivery_Address}
                      onChange={handleDeliveryChange}
                      placeholder={translate("enterAddress")}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                    />
                  </div>
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("postCode")}
                    </span>
                    <input
                      type="text"
                      name="Delivery_PostCode"
                      value={deliveryForm.Delivery_PostCode}
                      onChange={handleDeliveryChange}
                      placeholder={translate("enterPostCode")}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                    />
                  </div>
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("city")}
                    </span>
                    <input
                      type="text"
                      name="Delivery_City"
                      value={deliveryForm.Delivery_City}
                      onChange={handleDeliveryChange}
                      placeholder={translate("enterCity")}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                    />
                  </div>
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("country")}
                    </span>
                    <select
                      name="Delivery_Country"
                      value={deliveryForm.Delivery_Country}
                      onChange={handleDeliveryChange}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8] bg-white"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                            {c === SHIPPING_COUNTRY ? translate("northMacedonia") : c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs block mb-1">
                      {translate("phone")}
                    </span>
                    <input
                      type="text"
                      name="Delivery_Phone"
                      value={deliveryForm.Delivery_Phone}
                      onChange={handleDeliveryChange}
                      placeholder={translate("enterPhoneNumber")}
                      className="w-full p-3 border border-gray-300 outline-none focus:border-[#2096D8]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="pr-15 max-sm:pr-0">
              <p className="font-bold text-lg mb-5 pb-3 border-b border-gray-200">
                {translate("paymentMethod")}
              </p>
              <div className="flex items-center gap-4 py-5  pl-5">
                <input
                  type="radio"
                  id="credit-card"
                  name="payment_method"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={shippingSettings?.cardPaymentEnabled === false}
                />
                <label htmlFor="credit-card" className="text-sm font-bold">
                  {translate("creditCard")}
                </label>
              </div>
            </div>
            <div className="pb-10 pl-5">
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  id="home-delivery"
                  name="payment_method"
                  value="home_delivery"
                  checked={paymentMethod === "home_delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={shippingSettings?.homeDeliveryEnabled === false}
                />
                <label htmlFor="home-delivery" className="text-sm font-bold">
                  {translate("homeDelivery")}
                </label>
              </div>
              <p className="mt-2 pl-8 text-xs text-gray-500">
                {translate("deliveryCourierNotice")}
              </p>
            </div>

            {/* Order Note */}
            <div className="pr-15 max-sm:pr-0">
              <div className="flex justify-between w-full pt-7 pb-6">
                <p className="text-base font-bold">{translate("orderNote")}</p>
                <img src="/logos/arrow-up.svg" width={22} alt="arrow" />
              </div>
              <div className="flex flex-col gap-1 items-start">
                <p className="text-xs">{translate("orderNote")}</p>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full outline-none border border-gray-300 p-3 h-24 resize-none"
                  placeholder={translate("orderNoteDesc")}
                />
              </div>
              <div className="py-5 px-3">
                <p className="text-sm my-2 mx-1">
                  {translate("subscribeNote")}
                </p>
                <div className="flex gap-4 my-2 mx-1">
                  <input
                    type="text"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full outline-none border border-gray-300 py-2 px-4"
                    placeholder={translate("enterYourEmailAddress")}
                  />
                  <button
                    onClick={handleNewsletterSubscribe}
                    className="bg-[#8DC658] px-2.5 text-white font-bold text-nowrap"
                  >
                    {translate("subscribe")}
                  </button>
                </div>
                <p className="text-xs my-2 mx-1">
                  {translate("byCompletingThisForm")}{" "}
                  <a
                    href="terms-of-services"
                    className="text-blue-600 underline"
                  >
                    {translate("termsOfService")}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - SIDEBAR (STICKY) */}
          <div className="lg:col-span-4 relative">
            <div
              ref={sidebarRef}
              className="bg-white shadow-lg p-6 w-full lg:min-w-[500px]"
            >
              <div className="flex justify-between mb-8">
                <p className="text-base text-[#2096D8] font-bold">
                  {translate("productsInCart")} ({cart?.totalItems || 0})
                </p>
                <Link
                  to="/cart"
                  className="text-gray-500 text-xs font-bold hover:underline"
                >
                  {translate("showAll")}
                </Link>
              </div>

              {!isCartEmpty && (
                <div className="max-h-[300px] overflow-y-auto mb-4">
                  {cart.items.slice(0, 3).map((item) => {
                    const itemPoints = calculatePointsForProduct(item);
                    return (
                      <div
                        key={item.cartItem_Id}
                        className="flex justify-between py-2 border-b"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.product_Name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Кол.: {item.quantity}
                            {itemPoints > 0 && (
                              <span className="ml-2 text-green-600">
                                +{itemPoints} поени
                              </span>
                            )}
                            {itemPoints === 0 && (
                              <span className="ml-2 text-gray-400">
                                (0 поени - со попуст)
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="text-sm font-bold">
                          MKD {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                  {cart.items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      + {cart.items.length - 3} more items
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6 border border-gray-200 p-4">
                <p className="mb-1 text-sm font-bold">
                  {translate("promotionCode")}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  {translate("enterPromotionCode")}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promotionCode}
                    onChange={(event) => {
                      const nextCode = event.target.value.toUpperCase();
                      setPromotionCode(nextCode);
                      setPromotionError("");
                      if (
                        appliedPromotion?.code &&
                        nextCode !== appliedPromotion.code.toUpperCase()
                      ) {
                        setAppliedPromotion(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleApplyPromotion();
                      }
                    }}
                    placeholder={translate("enterPromotionCode")}
                    autoComplete="off"
                    className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2096D8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromotion}
                    className="bg-[#2096D8] px-4 py-2 text-sm font-bold text-white"
                  >
                    {translate("apply")}
                  </button>
                </div>
                {appliedPromotion && (
                  <div className="mt-3 flex items-center justify-between bg-green-50 px-3 py-2 text-xs text-green-700">
                    <span>
                      {appliedPromotion.code}: - MKD {promoDiscount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromotion(null);
                        setPromotionCode("");
                        setPromotionError("");
                      }}
                      className="font-bold underline"
                    >
                      {translate("remove")}
                    </button>
                  </div>
                )}
                {promotionError && (
                  <p className="mt-2 text-xs text-red-600">{promotionError}</p>
                )}
              </div>

              <div className="mb-6 border border-gray-200 p-4">
                <p className="mb-1 text-sm font-bold">Gift voucher</p>
                <p className="mb-3 text-xs text-gray-500">
                  Enter a purchased Proteini.mk gift voucher.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftVoucherCode}
                    onChange={(event) => {
                      setGiftVoucherCode(event.target.value.toUpperCase());
                      if (
                        appliedGiftVoucher?.code &&
                        event.target.value.toUpperCase() !==
                          appliedGiftVoucher.code.toUpperCase()
                      ) {
                        setAppliedGiftVoucher(null);
                      }
                    }}
                    placeholder="Enter gift voucher code"
                    className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2096D8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyGiftVoucher}
                    className="bg-[#2096D8] px-4 py-2 text-sm font-bold text-white"
                  >
                    {translate("apply")}
                  </button>
                </div>
                {appliedGiftVoucher && (
                  <div className="mt-3 flex items-center justify-between bg-green-50 px-3 py-2 text-xs text-green-700">
                    <span>
                      {appliedGiftVoucher.code}: - MKD{" "}
                      {giftVoucherDiscount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedGiftVoucher(null);
                        setGiftVoucherCode("");
                      }}
                      className="font-bold underline"
                    >
                      {translate("remove")}
                    </button>
                  </div>
                )}
                {giftVoucherError && (
                  <p className="mt-2 text-xs text-red-600">{giftVoucherError}</p>
                )}
              </div>

              {availableFreeGifts.length > 0 && (
                <div className="mb-6 border border-gray-200 p-4">
                  <p className="mb-3 text-sm font-bold">
                    {translate("chooseFreeGift")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableFreeGifts.map((gift) => (
                      <label
                        key={gift.freeGiftId}
                        className={`flex cursor-pointer items-center gap-3 border p-2 ${selectedFreeGiftId === gift.freeGiftId ? "border-[#FDC700] bg-yellow-50" : "border-gray-200"}`}
                      >
                        <input
                          type="radio"
                          name="free-gift"
                          checked={selectedFreeGiftId === gift.freeGiftId}
                          onChange={() =>
                            setSelectedFreeGiftId(gift.freeGiftId)
                          }
                        />
                        {gift.image && (
                          <img
                            src={gift.image.startsWith("http") ? gift.image : `https://proteini.mk${gift.image.startsWith("/") ? "" : "/"}${gift.image}`}
                            alt={gift.displayName || gift.productName || "Free gift"}
                            className="h-12 w-12 object-contain"
                          />
                        )}
                        <span className="text-xs font-semibold">
                          {gift.displayName || gift.productName || gift.variantName || "Free gift"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {availablePoints > 0 && !loadingPoints && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-yellow-800">
                      {translate("yourLoyaltyPoints")}
                    </p>
                    <p className="text-lg font-bold text-yellow-600">
                      {Math.floor(availablePoints)} поени
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {translate("onepointonemkd")}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pointsToRedeem}
                      onChange={(e) =>
                        setPointsToRedeem(
                          Math.min(Number(e.target.value), maxRedeemablePoints),
                        )
                      }
                      placeholder="Points to redeem"
                      className="w-full p-2 border rounded text-sm"
                      min="0"
                      max={maxRedeemablePoints}
                    />
                    <button
                      onClick={handleApplyPoints}
                      className="bg-[#2096D8] text-white px-4 py-2 rounded text-sm hover:bg-[#1a7ab3]"
                    >
                      {translate("apply")}
                    </button>
                  </div>
                  {pointsDiscount > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      {translate("discountApplied")}: MKD{" "}
                      {pointsDiscount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {translate("youWillEarn1")} {estimatedPoints}{" "}
                    {translate("youWillEarn2")} {translate("youWillEarn3")}
                    {hasDiscountedItems && (
                      <span className="block text-xs text-orange-600 mt-1">
                        * Discounted items earn 0 points.
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <p className="text-sm">{translate("pointEarned")}</p>
                  <p className="text-sm">{estimatedPoints}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">{translate("delivery")}</p>
                  <p className="text-sm font-bold">
                    MKD {deliveryFee.toFixed(2)}
                  </p>
                </div>
                {cashOnDeliveryFee > 0 && (
                  <div className="flex justify-between">
                    <p className="text-sm">Cash on delivery fee</p>
                    <p className="text-sm font-bold">
                      MKD {cashOnDeliveryFee.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <p className="text-sm">{translate("subtotal")}</p>
                  <p className="text-sm font-bold">
                    MKD {(cart?.total || 0).toFixed(2)}
                  </p>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p className="text-sm">{translate("pointsDiscount")}</p>
                    <p className="text-sm font-bold">
                      - MKD {pointsDiscount.toFixed(2)}
                    </p>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p className="text-sm">{translate("promotionDiscount")}</p>
                    <p className="text-sm font-bold">
                      - MKD {promoDiscount.toFixed(2)}
                    </p>
                  </div>
                )}
                {giftVoucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p className="text-sm">Gift voucher</p>
                    <p className="text-sm font-bold">
                      - MKD {giftVoucherDiscount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold my-8 py-5 border-t border-b border-gray-200">
                <p>{translate("amountForPayment")}</p>
                <p>MKD {finalAmount.toFixed(2)}</p>
              </div>

              <div className="mb-9 flex gap-2 items-start">
                <input
                  type="checkbox"
                  id="order-terms-conditions"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (termsError) setTermsError("");
                  }}
                />
                <label htmlFor="order-terms-conditions" className="text-xs">
                  {translate("agreeToTheTerms")}{" "}
                  <a
                    href="/terms-of-services"
                    className="text-xs text-black font-bold underline"
                  >
                    {translate("termsOfService")}
                  </a>{" "}
                  {translate("and")}{" "}
                  <a
                    href="/privacy-policy"
                    className="text-xs text-black font-bold underline"
                  >
                    {translate("privacyPolicy")}
                  </a>
                </label>
              </div>

              {termsError && (
                <p className="text-red-500 text-xs mb-2">{termsError}</p>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={saving || isCartEmpty}
                className="bg-[#8DC658] text-white text-base font-bold p-3.5 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? `${translate("processing")}`
                  : `${translate("placeOrder")}`}
              </button>
              {isCartEmpty && (
                <p className="text-center text-red-500 text-sm mt-2">
                  Your cart is empty. Please add products before checking out.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
