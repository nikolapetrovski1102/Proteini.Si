import {
  FiAward,
  FiBookOpen,
  FiFacebook,
  FiFileText,
  FiGift,
  FiGlobe,
  FiGrid,
  FiImage,
  FiInfo,
  FiInstagram,
  FiLayers,
  FiLink,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPercent,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiYoutube,
} from "react-icons/fi";

/**
 * Single source of truth for the admin navigation. Each entry's `description`
 * is shown on the overview page so it is obvious what each screen controls.
 */
export const ADMIN_NAV = [
  {
    group: "Shop",
    items: [
      { to: "/admin-orders", icon: FiShoppingBag, label: "Orders", description: "New orders, payment status, shipping and refunds." },
      { to: "/admin-panel", icon: FiPackage, label: "Products", description: "Add and edit products, prices, stock, flavours and labels." },
      { to: "/admin-categories", icon: FiLayers, label: "Categories", description: "Main categories and subcategories used by the shop filters." },
      { to: "/admin-product-placements", icon: FiTrendingUp, label: "Pinned in shop", description: "Products shown first on a category page, a brand page or the whole shop." },
      { to: "/admin-brands", icon: FiAward, label: "Brands", description: "Brand names, logos and the 4 brands with photos in the header's Brands menu." },
      { to: "/admin-discounts", icon: FiPercent, label: "Попусти", description: "Автоматски попуст во % или нова цена на избрани производи, брендови или категории, без код, со почетен и краен датум по избор." },
      { to: "/admin-promotions", icon: FiTag, label: "Promotions & gifts", description: "Discount codes, free gifts and issued gift vouchers." },
      { to: "/admin-affiliates", icon: FiLink, label: "Affiliates & links", description: "Influencer codes, short links that apply the code automatically, clicks, sales and commission." },
      { to: "/admin-audience", icon: FiUsers, label: "Customers", description: "Registered accounts and newsletter subscribers, with export." },
      { to: "/admin-nutrition-labels", icon: FiGlobe, label: "Nutrition labels", description: "Albanian and English names for the words in the nutrition tables (rows, column headers, text). Untranslated words show in Macedonian." },
      { to: "/admin-meta-catalog", icon: FiFacebook, label: "Meta catalog", description: "Products for Facebook / Instagram catalog ads: pick single weights and flavours, categories, brands or everything on discount, then copy the feed link or download a CSV." },
      { to: "/admin-marketing-emails", icon: FiMail, label: "Marketing emails", description: "Automatic welcome, abandoned checkout and reorder emails (Macedonian), send times and preview." },
    ],
  },
  {
    group: "Homepage",
    items: [
      { to: "/admin-gallery", icon: FiImage, label: "Banners", description: "The big rotating banners at the top of the homepage." },
      { to: "/admin-home-showcase", icon: FiStar, label: "New in the shop", description: "The “Ново во продавница” product section: title, newest / best sellers / on sale / hand-picked products, and how many." },
      { to: "/admin-homepage-sections", icon: FiGrid, label: "Goals & sports", description: "The “Choose your goal” and sport tiles on the homepage." },
      { to: "/admin-landing-page", icon: FiStar, label: "Landing page", description: "Sections of the Battery Nutrition landing page." },
    ],
  },
  {
    group: "Content",
    items: [
      { to: "/admin-tips", icon: FiBookOpen, label: "Tips & news", description: "Articles shown on the Tips page." },
      { to: "/admin-instagram-gallery", icon: FiInstagram, label: "Instagram", description: "Posts shown in the Instagram strip." },
      { to: "/admin-youtube", icon: FiYoutube, label: "YouTube", description: "Videos shown in the video section." },
      { to: "/admin-partners", icon: FiGift, label: "Partners", description: "Partner and brand logos." },
      { to: "/admin-about-company", icon: FiInfo, label: "About us", description: "Text and image sections on the About the company page." },
      { to: "/admin-locations", icon: FiMapPin, label: "Stores", description: "Store addresses, phone numbers and opening hours." },
      { to: "/admin-delivery-locations", icon: FiMapPin, label: "Delivery & phones", description: "Macedonian delivery cities, post codes and allowed country phone prefixes." },
      { to: "/admin/dynamic-content", icon: FiFileText, label: "Legal pages", description: "Terms of service, privacy policy and similar pages." },
    ],
  },
];

