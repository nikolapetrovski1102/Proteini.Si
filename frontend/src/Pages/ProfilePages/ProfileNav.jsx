import { createElement, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiGrid,
  FiHeart,
  FiImage,
  FiInfo,
  FiInstagram,
  FiLayout,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
  FiSliders,
  FiStar,
  FiTag,
  FiUser,
  FiUsers,
  FiYoutube,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

const ADMIN_LINKS = [
  ["/admin-panel", FiGrid, "adminPanel"],
  ["/admin-orders", FiShoppingBag, "adminNavOrders"],
  ["/admin-categories", FiSliders, "adminNavCategories"],
  ["/admin-promotions", FiTag, "adminNavPromotions"],
  ["/admin-landing-page", FiLayout, "adminLanding"],
  ["/admin-gallery", FiImage, "adminGallery"],
  ["/admin-instagram-gallery", FiInstagram, "adminInstagramGallery"],
  ["/admin-youtube", FiYoutube, "adminYoutube"],
  ["/admin-partners", FiUsers, "adminPartners"],
  ["/admin-about-company", FiInfo, "adminAboutCompany"],
  ["/admin/dynamic-content", FiFileText, "adminNavDynamic"],
];

export default function ProfileNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const [counts, setCounts] = useState({ points: null, orders: null, favorites: null });

  const isSuperAdmin =
    user?.superAdmin === true ||
    user?.superAdmin === 1 ||
    user?.SuperAdmin === true ||
    user?.SuperAdmin === 1;

  const name = user?.user_FullName || user?.User_FullName || "";
  const email = user?.user_Email || user?.User_Email || "";

  useEffect(() => {
    if (isSuperAdmin || !api.isAuthenticated()) return undefined;
    let cancelled = false;
    const set = (key, value) => !cancelled && setCounts((c) => ({ ...c, [key]: value }));

    api
      .getLoyaltySummary()
      .then((r) => set("points", Math.floor(r?.data?.availablePoints || 0)))
      .catch(() => set("points", 0));
    api
      .getOrderHistory()
      .then((r) => set("orders", (r?.orders || r?.data || (Array.isArray(r) ? r : [])).length))
      .catch(() => set("orders", 0));
    api
      .getFavorites()
      .then((r) => set("favorites", r?.totalCount ?? r?.data?.length ?? 0))
      .catch(() => set("favorites", 0));

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, user?.user_Id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userLinks = [
    ["/profile", FiUser, "myProfile", null],
    ["/profile/loyalty-points", FiStar, "loyaltyPoints", counts.points],
    ["/profile/order-history", FiPackage, "orderHistory", counts.orders],
    ["/profile/favorite-products", FiHeart, "favouriteProducts", counts.favorites],
  ];
  const links = isSuperAdmin
    ? ADMIN_LINKS.map(([to, Icon, key]) => [to, Icon, key, null])
    : userLinks;

  const stats = [
    ["/profile/loyalty-points", "profileStatPoints", counts.points],
    ["/profile/order-history", "profileStatOrders", counts.orders],
    ["/profile/favorite-products", "profileStatFavs", counts.favorites],
  ];

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[290px]">
      {/* identity card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#141409] p-5 text-white sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#FDC700]/[0.14] blur-xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FDC700] font-display text-xl font-bold text-[#141409]">
            {initialsOf(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
              {translate(isSuperAdmin ? "profileAdminArea" : "profileMemberArea")}
            </p>
            <p className="truncate font-display text-xl font-bold uppercase leading-tight tracking-tight">
              {name || translate("myProfile")}
            </p>
            {email && <p className="truncate text-xs text-white/60">{email}</p>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/[0.16] lg:hidden"
            aria-label={translate("logout")}
          >
            <FiLogOut size={17} />
          </button>
        </div>

        {!isSuperAdmin && (
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {stats.map(([to, key, value]) => (
              <NavLink
                key={key}
                to={to}
                className="rounded-xl bg-white/[0.07] px-2 py-2.5 text-center transition hover:bg-white/[0.12]"
              >
                <span className="block font-display text-2xl font-bold leading-none tabular-nums text-[#FDC700]">
                  {value ?? "–"}
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-white/60">
                  {translate(key)}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* navigation: horizontal pills on mobile, list on desktop */}
      <nav aria-label={translate("profileMemberArea")} className="mt-4">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:rounded-2xl lg:bg-white lg:p-2 lg:ring-1 lg:ring-black/[0.06] [&::-webkit-scrollbar]:hidden">
          {links.map(([to, icon, key, count]) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `group flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition lg:rounded-xl ${
                    isActive
                      ? "bg-[#141409] text-white"
                      : "bg-white text-gray-700 ring-1 ring-black/[0.06] hover:text-gray-900 lg:bg-transparent lg:ring-0 lg:hover:bg-black/[0.04]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {createElement(icon, { size: 17, className: isActive ? "text-[#FDC700]" : "text-gray-500 group-hover:text-gray-900" })}
                    <span className="lg:flex-1">{translate(key)}</span>
                    {typeof count === "number" && (
                      <span
                        className={`min-w-[24px] rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums ${
                          isActive ? "bg-[#FDC700] text-[#141409]" : "bg-black/[0.06] text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 hidden min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-gray-700 ring-1 ring-black/[0.12] transition hover:bg-white hover:text-gray-900 lg:flex"
      >
        <FiLogOut size={16} />
        {translate("logout")}
      </button>
    </aside>
  );
}
