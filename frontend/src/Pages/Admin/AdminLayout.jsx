import { createElement, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiFileText,
  FiGift,
  FiGrid,
  FiHome,
  FiImage,
  FiInfo,
  FiInstagram,
  FiLayers,
  FiMapPin,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiUsers,
  FiX,
  FiYoutube,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { AdminFeedbackProvider } from "./AdminKit";
import ResetCacheButton from "./ResetCacheButton";
import { ADMIN_NAV } from "./adminNav";

const ALL_ITEMS = ADMIN_NAV.flatMap((g) => g.items);

function NavList({ onNavigate }) {
  return (
    <nav aria-label="Admin" className="space-y-5">
      <NavItem item={{ to: "/admin", icon: FiHome, label: "Overview" }} onNavigate={onNavigate} />
      {ADMIN_NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{group.group}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavItem item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex min-h-[40px] items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
          isActive ? "bg-[#141409] text-white" : "text-gray-700 hover:bg-black/[0.05] hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {createElement(item.icon, {
            size: 16,
            "aria-hidden": true,
            className: isActive ? "text-[#FDC700]" : "text-gray-400 group-hover:text-gray-700",
          })}
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const current =
    location.pathname === "/admin"
      ? { label: "Overview", icon: FiHome }
      : ALL_ITEMS.find((i) => location.pathname.startsWith(i.to)) || { label: "Admin", icon: FiHome };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const name = user?.user_FullName || user?.User_FullName || "Admin";

  return (
    <AdminFeedbackProvider>
      <div className="admin-shell home-tint min-h-screen bg-[#f6f5f1]">
        {/* mobile / tablet: current page + menu button */}
        <div className="sticky top-[var(--header-h)] z-30 border-b border-black/[0.06] bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="ink-btn inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#141409] px-3.5 text-sm font-bold text-white"
              aria-expanded={menuOpen}
            >
              <FiMenu size={16} aria-hidden="true" />
              Admin menu
            </button>
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-700">
              {createElement(current.icon, { size: 15, className: "shrink-0 text-gray-400", "aria-hidden": true })}
              <span className="truncate">{current.label}</span>
            </span>
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <div className="menu-backdrop-in absolute inset-0 bg-[#141409]/50" onClick={() => setMenuOpen(false)} />
            <div className="menu-from-left absolute inset-y-0 left-0 flex w-[min(320px,86vw)] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                <p className="font-display text-xl font-bold uppercase tracking-tight text-gray-900">Admin</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-black/[0.05]"
                  aria-label="Close menu"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <NavList onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="space-y-2 border-t border-black/[0.06] p-3">
                <ResetCacheButton block size="md" />
                <Link to="/" className="flex min-h-[40px] items-center justify-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
                  View shop <FiArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-[1520px] gap-8 px-4 py-6 sm:px-6 lg:py-8">
          {/* desktop sidebar */}
          <aside className="hidden w-[240px] shrink-0 lg:block">
            <div className="sticky top-[calc(var(--header-h)+24px)] flex max-h-[calc(100vh-var(--header-h)-48px)] flex-col rounded-2xl bg-white ring-1 ring-black/[0.06]">
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141409] font-display text-base font-bold text-[#FDC700]">
                  {name.trim().charAt(0).toUpperCase() || "A"}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">Admin</p>
                  <p className="truncate text-sm font-bold text-gray-900">{name}</p>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2.5 [scrollbar-width:thin]">
                <NavList />
              </div>
              <div className="space-y-1.5 border-t border-black/[0.06] p-2.5">
                <ResetCacheButton block size="sm" />
                <Link
                  to="/"
                  className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-gray-500 transition hover:bg-black/[0.04] hover:text-gray-900"
                >
                  View shop <FiArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 pb-24">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminFeedbackProvider>
  );
}
