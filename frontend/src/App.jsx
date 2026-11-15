// App.jsx - Update the Routes section
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { trackPageView, syncMarketingConsent } from "./services/analytics";
import { metaPageView, initMetaPixelOnConsent } from "./services/metaPixel";
import { useEffect, useState } from "react";
import { LanguageProvider } from "./Pages/translation/LanguageContext";
import Footer from "./Pages/Components/Footer";
import Header from "./Pages/Components/Header";
import LanguageModal from "./Pages/Components/LanguageModal";
import ProtectedRoute from "./contexts/ProtectedRoute";
import AdminRoute from "./contexts/AdminRoute";
import ScrollToTopButton from "./Pages/Components/ScrollToTopButton";
import CookieConsent from "./Pages/Components/CookieConsent";
import { BrandLoaderOverlay } from "./Pages/Components/Loaders/BrandLoader";
import CartToaster from "./Pages/Components/Cart/CartToaster";
import SiteFeedbackHost from "./Pages/Components/Feedback/SiteFeedbackHost";
import ScrollToTopOnNavigate from "./Pages/Components/ScrollToTopOnNavigate";

// Import your page components
import Home from "./Pages/HomePages/Home";
import NotFound from "./Pages/Components/NotFound";
import Support from "./Pages/Support";
import Tips from "./Pages/Tips";
import TipArticle from "./Pages/TipArticle";
import ProductsPage from "./Pages/Products/ProductsPage";
import Login from "./Pages/LoginPages/Login";
import Profile from "./Pages/ProfilePages/Profile";
import ProfileDefault from "./Pages/ProfilePages/ProfileDefault";
import LoyaltyPoints from "./Pages/ProfilePages/LoyaltyPoints";
import OrderHistory from "./Pages/ProfilePages/OrderHistory";
import FavoriteProducts from "./Pages/ProfilePages/FavoriteProducts";
import AdminPanel from "./Pages/Admin/AdminPanel";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProductDetail from "./Pages/Products/ProductDetail";
import Checkout from "./Pages/PaymentPages/Checkout";
import Cart from "./Pages/PaymentPages/Cart";
import OrderConfirmation from "./Pages/PaymentPages/OrderConfirmation";
import MockPayment from "./Pages/PaymentPages/MockPayment";
import ResetPassword from "./Pages/LoginPages/ResetPassword";
import PrivacyPolicy from "./privacy-policy/PrivacyPolicy";
import TestPage from "./Pages/Components/TestPage";
import AdminGallery from "./Pages/Admin/AdminGallery";
import Goals from "./Pages/Products/Goals";
import Sports from "./Pages/Products/Sports/Sports";
import Cycling from "./Pages/Products/Sports/Cycling";
import PaymentCancel from "./Pages/PaymentPages/PaymentCancel";
import PaymentSuccess from "./Pages/PaymentPages/PaymentSuccess";
import PaymentFailure from "./Pages/PaymentPages/PaymentFailure";
import Landing from "./Pages/HomePages/Landing";
import AboutUs from "./Pages/Components/FooterPages/AboutUs/AboutUs";
import AboutTheCompanyProteiniSi from "./Pages/Components/FooterPages/AboutUs/AboutTheCompanyProteiniSi";
import BusinessCooperation from "./Pages/Components/FooterPages/AboutUs/BusinessCooperation";
import Contact from "./Pages/Components/FooterPages/AboutUs/Contact";
import Help from "./Pages/Components/FooterPages/Help/Help";
import Shipping from "./Pages/Components/FooterPages/Help/Shipping";
import PaymentMethods from "./Pages/Components/FooterPages/Help/PaymentMethods";
import FreeGift from "./Pages/Components/FooterPages/Help/FreeGift";
import PurchaseProcess from "./Pages/Components/FooterPages/Help/PurchaseProcess";
import FAQ from "./Pages/Components/FooterPages/Help/FAQ";
import AdminInstagramGallery from "./Pages/Admin/AdminInstagramGallery";
import AdminYoutube from "./Pages/Admin/AdminYoutube";
import Branches from "./Pages/HomePages/Branches";
import AdminParters from "./Pages/Admin/AdminPartners";
import AdminAboutCompany from "./Pages/Admin/AdminAboutCompany";
import AdminLandingPage from "./Pages/Admin/AdminLandingPage";
import AdminOrders from "./Pages/Admin/AdminOrders";
import AdminPromotions from "./Pages/Admin/AdminPromotions";
import AdminBranchLocations from "./Pages/Admin/AdminBranchLocations";
import AdminDeliveryLocations from "./Pages/Admin/AdminDeliveryLocations";
import AdminTips from "./Pages/Admin/AdminTips";
import AdminCategories from "./Pages/Admin/AdminCategories";
import AdminBrands from "./Pages/Admin/AdminBrands";
import AdminDiscounts from "./Pages/Admin/AdminDiscounts";
import AdminProductPlacements from "./Pages/Admin/AdminProductPlacements";
import AdminHomepageSections from "./Pages/Admin/AdminHomepageSections";
import AdminHomeShowcase from "./Pages/Admin/AdminHomeShowcase";
import AdminAudience from "./Pages/Admin/AdminAudience";
import AdminMarketingEmails from "./Pages/Admin/AdminMarketingEmails";
import Unsubscribe from "./Pages/Unsubscribe";
import ShortLinkRedirect from "./Pages/ShortLinkRedirect";
import AdminAffiliates from "./Pages/Admin/AdminAffiliates";
import { REFERRAL_PARAMS, saveReferralCode } from "./utils/referral";

import DynamicContentManager from "./Pages/Admin/DynamicContentManager";
import AdminLayout from "./Pages/Admin/AdminLayout";
import AdminHome from "./Pages/Admin/AdminHome";
import DynamicContentPage from "./Pages/Admin/DynamicContentPage";

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
    metaPageView();
  }, [location.pathname]);

  useEffect(() => initMetaPixelOnConsent(), []);

  // Affiliate links like /?code=MARKO10 (also ref= / promo=): remember the code for checkout
  // and drop it from the address bar so it isn't shared further by copy-paste.
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const key = REFERRAL_PARAMS.find((name) => params.has(name));
    if (!key || /^\/admin([-/]|$)/.test(location.pathname)) return;
    saveReferralCode(params.get(key));
    REFERRAL_PARAMS.forEach((name) => params.delete(name));
    const query = params.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  // Cookie-banner "Marketing" choice → account (offers by email), on sign-in and whenever it changes.
  const { user } = useAuth();
  const userKey = user
    ? user.User_Id ?? user.user_Id ?? user.id ?? user.User_Email ?? user.email ?? null
    : null;
  useEffect(() => {
    if (!userKey) return undefined;
    syncMarketingConsent(userKey);
    const onConsent = () => syncMarketingConsent(userKey);
    window.addEventListener("proteini:cookie-consent", onConsent);
    return () => window.removeEventListener("proteini:cookie-consent", onConsent);
  }, [userKey]);

  // Check if current page is landing page or auth pages
  const isLandingPage = location.pathname === "/landing";

  // Don't show Header/Footer on landing page or auth pages
  const showLayout = !isLandingPage;
  // The admin shell has its own navigation; the shop footer only adds noise there.
  const isAdmin = /^\/admin([-/]|$)/.test(location.pathname);

  return (
    <>
      {showLayout && <Header setIsModalOpen={setIsModalOpen} />}

      <Routes>
        {/* PUBLIC ROUTES - No token required */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/r/:slug" element={<ShortLinkRedirect />} />

        {/* LANDING PAGE - No layout */}
        <Route path="/landing" element={<Landing />} />

        {/* PUBLIC DYNAMIC CONTENT ROUTES - FIXED: Removed AdminRoute, these should be public */}
        <Route
          path="/terms-of-services"
          element={<DynamicContentPage pageType="terms-of-service" />}
        />
        <Route
          path="/general-provisions"
          element={<DynamicContentPage pageType="general-provisions" />}
        />

        {/* PUBLIC ROUTES - Accessible without login */}
        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/cycling" element={<Cycling />} />

        <Route path="/goals/gain-muscle-mass" element={<ProductsPage />} />
        <Route path="/goals/lose-weight" element={<ProductsPage />} />
        <Route
          path="/goals/improve-your-form-and-endurance"
          element={<ProductsPage />}
        />
        <Route
          path="/goals/vitality-as-a-lifestyle"
          element={<ProductsPage />}
        />

        {/* Products Routes - SPECIFIC PATHS FIRST (more specific before generic) */}
        <Route path="/all-products" element={<ProductsPage />} />
        <Route path="/all-products/gift-voucher" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Category routes - MOVED DOWN so they don't catch everything */}
        <Route path="/:category" element={<ProductsPage />} />
        <Route path="/:category/:subcategory" element={<ProductsPage />} />
        <Route
          path="/:category/:subcategory/:subsubcategory"
          element={<ProductsPage />}
        />
        <Route path="/test-page" element={<TestPage />} />
        <Route path="/sales-points" element={<Branches />} />
        <Route path="/support" element={<Support />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/tips/:slug" element={<TipArticle />} />

        {/* PROTECTED PROFILE ROUTES - Nested routes under /profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfileDefault />} />
          <Route path="loyalty-points" element={<LoyaltyPoints />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="favorite-products" element={<FavoriteProducts />} />
        </Route>

        {/* OTHER PROTECTED ROUTES */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/mock-payment"
          element={<MockPayment />}
        />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route
          path="/payment/success"
          element={<PaymentSuccess />}
        />
        <Route
          path="/payment/cancel"
          element={<PaymentCancel />}
        />
        <Route
          path="/payment/failure"
          element={<PaymentFailure />}
        />

        {/* ADMIN ONLY ROUTES — one shared shell (sidebar, toasts, dialogs) */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="/admin-categories" element={<AdminCategories />} />
          <Route path="/admin-brands" element={<AdminBrands />} />
          <Route path="/admin-discounts" element={<AdminDiscounts />} />
          <Route path="/admin-product-placements" element={<AdminProductPlacements />} />
          <Route path="/admin-promotions" element={<AdminPromotions />} />
          <Route path="/admin-affiliates" element={<AdminAffiliates />} />
          <Route path="/admin-audience" element={<AdminAudience />} />
          <Route path="/admin-marketing-emails" element={<AdminMarketingEmails />} />
          <Route path="/admin-gallery" element={<AdminGallery />} />
          <Route path="/admin-homepage-sections" element={<AdminHomepageSections />} />
          <Route path="/admin-home-showcase" element={<AdminHomeShowcase />} />
          <Route path="/admin-landing-page" element={<AdminLandingPage />} />
          <Route path="/admin-tips" element={<AdminTips />} />
          <Route path="/admin-instagram-gallery" element={<AdminInstagramGallery />} />
          <Route path="/admin-youtube" element={<AdminYoutube />} />
          <Route path="/admin-partners" element={<AdminParters />} />
          <Route path="/admin-about-company" element={<AdminAboutCompany />} />
          <Route path="/admin-locations" element={<AdminBranchLocations />} />
          <Route path="/admin-delivery-locations" element={<AdminDeliveryLocations />} />
          <Route path="/admin/dynamic-content" element={<DynamicContentManager />} />
        </Route>

        {/* 404 - Not Found - MUST BE LAST */}
        <Route path="/about-us" element={<AboutUs />}>
          <Route index element={<AboutTheCompanyProteiniSi />} />
          <Route
            path="about-the-company-proteini-si"
            element={<AboutTheCompanyProteiniSi />}
          />
          <Route
            path="business-cooperation"
            element={<BusinessCooperation />}
          />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="/help" element={<Help />}>
          <Route index element={<Shipping />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route path="free-gift" element={<FreeGift />} />
          <Route path="purchase-process" element={<PurchaseProcess />} />
          <Route path="loyalty-points" element={<LoyaltyPoints />} />
          <Route path="faq" element={<FAQ />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showLayout && !isAdmin && <Footer />}

      <ScrollToTopButton />
      {showLayout && <CookieConsent />}
      <LanguageModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      <ScrollToTopOnNavigate />
      <BrandLoaderOverlay />
      <CartToaster />
      <SiteFeedbackHost />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="w-full min-h-screen flex flex-col font-montserrat">
          <AppContent />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
