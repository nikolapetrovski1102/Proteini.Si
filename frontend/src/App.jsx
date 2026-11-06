// App.jsx - Update the Routes section
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { LanguageProvider } from "./Pages/translation/LanguageContext";
import Footer from "./Pages/Components/Footer";
import Header from "./Pages/Components/Header";
import LanguageModal from "./Pages/Components/LanguageModal";
import ProtectedRoute from "./contexts/ProtectedRoute";
import AdminRoute from "./contexts/AdminRoute";
import ScrollToTopButton from "./Pages/Components/ScrollToTopButton";
import CookieConsent from "./Pages/Components/CookieConsent";

// Import your page components
import Home from "./Pages/HomePages/Home";
import NotFound from "./Pages/Components/NotFound";
import Slider from "./Pages/Slider";
import NeedHelp from "./Pages/NeedHelp";
import Subscribe from "./Pages/Subscribe";
import ShareYourExperience from "./Pages/ShareYourExperience";
import Partners from "./Pages/Partners";
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
import { AuthProvider } from "./contexts/AuthContext";
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
import AdminTips from "./Pages/Admin/AdminTips";
import AdminCategories from "./Pages/Admin/AdminCategories";
import AdminHomepageSections from "./Pages/Admin/AdminHomepageSections";
import AdminAudience from "./Pages/Admin/AdminAudience";

import DynamicContentManager from "./Pages/Admin/DynamicContentManager";
import DynamicContentPage from "./Pages/Admin/DynamicContentPage";

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Check if current page is landing page or auth pages
  const isLandingPage = location.pathname === "/landing";

  // Don't show Header/Footer/NeedHelp/Subscribe on landing page or auth pages
  const showLayout = !isLandingPage;

  return (
    <>
      {showLayout && <Header setIsModalOpen={setIsModalOpen} />}

      <Routes>
        {/* PUBLIC ROUTES - No token required */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          element={
            <>
              <div className="w-full text-gray-800 font-montserrat">
                <Slider />
              </div>
              <Home />
              <Partners />
              <ShareYourExperience />
            </>
          }
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

        {/* ADMIN ONLY ROUTES */}
        <Route
          path="/admin-panel"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-instagram-gallery"
          element={
            <AdminRoute>
              <AdminInstagramGallery />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-youtube"
          element={
            <AdminRoute>
              <AdminYoutube />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-gallery"
          element={
            <AdminRoute>
              <AdminGallery />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-partners"
          element={
            <AdminRoute>
              <AdminParters />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-about-company"
          element={
            <AdminRoute>
              <AdminAboutCompany />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-landing-page"
          element={
            <AdminRoute>
              <AdminLandingPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-promotions"
          element={
            <AdminRoute>
              <AdminPromotions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-locations"
          element={
            <AdminRoute>
              <AdminBranchLocations />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-tips"
          element={
            <AdminRoute>
              <AdminTips />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-homepage-sections"
          element={
            <AdminRoute>
              <AdminHomepageSections />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-audience"
          element={
            <AdminRoute>
              <AdminAudience />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dynamic-content"
          element={
            <AdminRoute>
              <DynamicContentManager />
            </AdminRoute>
          }
        />

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

      {showLayout && (
        <>
          <NeedHelp />
          <Subscribe />
          <Footer />
        </>
      )}

      <ScrollToTopButton />
      {showLayout && <CookieConsent />}
      <LanguageModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
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
