import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiHome, FiShoppingBag, FiTag, FiUser } from "react-icons/fi";

// Pages that own the bottom of the screen themselves (checkout, payment, admin).
const HIDDEN_ON = [/^\/checkout/, /^\/mock-payment/, /^\/payment\//, /^\/admin/];

const OFFER_QUERY = /[?&](onSale|upcomingPromotions|outlet)=true/;
const SHOP_PATHS = /^\/(all-products|products?|goals|sports)(\/|$)/;

function Tab({ to, onClick, active, label, icon, badge, iconProps }) {
  const Icon = icon;
  const content = (
    <>
      <span
        {...iconProps}
        className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 ${
          active ? "bg-[#FDC700] text-[#141409]" : "text-gray-500"
        }`}
      >
        <Icon aria-hidden="true" className="h-[21px] w-[21px]" strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && (
          <span className="absolute right-1.5 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#141409] px-1 text-[10px] font-bold leading-none text-[#FDC700] ring-2 ring-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span
        className={`max-w-full truncate text-[11px] leading-none ${
          active ? "font-bold text-gray-900" : "font-medium text-gray-500"
        }`}
      >
        {label}
      </span>
    </>
  );

  const className =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:bg-gray-100";

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} aria-expanded={active}>
      {content}
    </button>
  );
}

/** Phone and tablet navigation: five tabs pinned to the bottom, above the home indicator. */
export default function MobileTabBar({
  cartCount,
  loggedIn,
  isMenuOpen,
  menuSegment,
  onOpenMenu,
  onCloseMenu,
  translate,
}) {
  const { pathname, search } = useLocation();
  const hidden = HIDDEN_ON.some((pattern) => pattern.test(pathname));

  // Reserve room at the bottom of the page (and for other fixed UI) while the bar is shown.
  useEffect(() => {
    if (hidden) return undefined;
    const root = document.documentElement;
    root.classList.add("has-bottom-nav");
    return () => root.classList.remove("has-bottom-nav");
  }, [hidden]);

  if (hidden) return null;

  const onOffers = pathname === "/all-products" && OFFER_QUERY.test(search);
  const tabs = {
    home: !isMenuOpen && pathname === "/",
    shop: isMenuOpen ? menuSegment !== "offers" : !onOffers && SHOP_PATHS.test(pathname),
    offers: isMenuOpen ? menuSegment === "offers" : onOffers,
    cart: !isMenuOpen && pathname === "/cart",
    account: !isMenuOpen && (pathname.startsWith("/profile") || pathname === "/login"),
  };

  // On the tab you are already on, tapping it again goes back to the top.
  const scrollTopIfCurrent = (active) => (event) => {
    if (active) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (isMenuOpen) {
      onCloseMenu();
    }
  };

  // Shop and Offers open the menu sheet on their segment; tapping the open one closes it.
  const toggleSegment = (segment, active) => () => {
    if (isMenuOpen && active) onCloseMenu();
    else onOpenMenu(segment);
  };

  return (
    <nav
      aria-label={translate("mainNavigation")}
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white lg:hidden"
    >
      <div className="mx-auto flex max-w-[640px] items-stretch px-1">
        <Tab to="/" active={tabs.home} onClick={scrollTopIfCurrent(tabs.home)} label={translate("home")} icon={FiHome} />
        <Tab onClick={toggleSegment("products", isMenuOpen && tabs.shop)} active={tabs.shop} label={translate("headerShop")} icon={FiGrid} />
        <Tab
          onClick={toggleSegment("offers", isMenuOpen && tabs.offers)}
          active={tabs.offers}
          label={translate("offers")}
          icon={FiTag}
        />
        <Tab
          to="/cart"
          active={tabs.cart}
          onClick={scrollTopIfCurrent(tabs.cart)}
          label={translate("navCart")}
          icon={FiShoppingBag}
          badge={cartCount}
          iconProps={{ "data-cart-target": true }}
        />
        <Tab
          to={loggedIn ? "/profile" : "/login"}
          active={tabs.account}
          onClick={scrollTopIfCurrent(tabs.account)}
          label={translate("navAccount")}
          icon={FiUser}
        />
      </div>
    </nav>
  );
}
