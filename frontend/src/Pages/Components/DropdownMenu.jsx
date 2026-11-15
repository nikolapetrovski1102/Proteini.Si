import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { iconForLink } from "./shopIconMap";
import Scribble from "./Scribble";

const CLOSE_DELAY_MS = 140;

/**
 * Desktop navigation item with a hover/focus mega-menu panel.
 *
 * - `categories`: category trees (`{ key, title, link, columns }`) shown as a plain
 *   category list on the left and the hovered category's groups on the right.
 * - `children`: any other panel content (brand directory, offer tiles).
 *
 * The panel is positioned against the nearest `relative` ancestor (the header).
 * While a text field inside the panel has focus, moving the mouse away does not
 * close it; a click outside or Escape does.
 */
export default function DropdownMenu({
  title,
  link,
  categories,
  viewAllLabel,
  onOpen,
  highlight = false,
  children,
}) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  // The menu remembers the route it was opened on, so it closes by itself on navigation.
  const [openOnRoute, setOpenOnRoute] = useState(null);
  const isOpen = openOnRoute === routeKey;
  const setIsOpen = (value) => setOpenOnRoute(value ? routeKey : null);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);
  const [activeKey, setActiveKey] = useState(categories?.[0]?.key);
  const activeCategory = categories?.find((c) => c.key === activeKey) || categories?.[0];

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpenOnRoute(null);
    };
    const onKey = (event) => event.key === "Escape" && setOpenOnRoute(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const open = () => {
    clearTimeout(closeTimer.current);
    if (!isOpen) onOpen?.();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    const focused = document.activeElement;
    if (focused?.tagName === "INPUT" && rootRef.current?.contains(focused)) return;
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  const titleClass = `site-nav relative flex h-full items-center gap-1.5 px-1 text-[17px] font-bold transition-colors active:scale-[0.97] ${
    highlight
      ? "nav-highlight text-[#BF243E] hover:text-[#9E1C32]"
      : isOpen
        ? "text-black"
        : "text-gray-800 hover:text-black"
  }`;

  const chevron = (
    <FiChevronDown aria-hidden="true" className={`h-[18px] w-[18px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.4} />
  );

  return (
    <div
      ref={rootRef}
      className="h-full"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clearTimeout(closeTimer.current);
          closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
        }
      }}
    >
      {link ? (
        <Link to={link} className={titleClass} aria-expanded={isOpen} aria-haspopup="true">
          <Scribble active={isOpen}>{title}</Scribble>
          {chevron}
        </Link>
      ) : (
        <button type="button" className={titleClass} aria-expanded={isOpen} aria-haspopup="true" onClick={() => (isOpen ? setIsOpen(false) : open())}>
          <Scribble active={isOpen}>{title}</Scribble>
          {chevron}
        </button>
      )}

      <div
        className={`site-nav absolute left-0 right-0 top-full z-50 border-t border-black/[0.06] bg-white shadow-[0_16px_24px_-16px_rgba(20,20,9,0.2)] transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div key={isOpen ? "open" : "closed"} className={`mx-auto max-w-[1240px] px-6 py-7 ${isOpen ? "menu-fade-up" : ""}`}>
          {categories ? (
            <div className="grid grid-cols-[200px_1fr] gap-10">
              <ul className="menu-stagger border-r border-black/[0.06] pr-6">
                {categories.map((category, index) => {
                  const active = category.key === activeCategory?.key;
                  const Icon = category.icon;
                  return (
                    <li key={category.key} style={{ "--i": index }}>
                      <Link
                        to={category.link}
                        onMouseEnter={() => setActiveKey(category.key)}
                        onFocus={() => setActiveKey(category.key)}
                        className={`flex min-h-[46px] items-center justify-between gap-2 text-[14px] transition-all duration-200 active:scale-[0.97] ${
                          active ? "translate-x-1 font-bold text-gray-900" : "font-medium text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          {Icon && (
                            <Icon
                              className={`h-8 w-8 shrink-0 text-gray-900 transition-transform duration-200 ${
                                active ? "-rotate-6 scale-110" : ""
                              }`}
                            />
                          )}
                          <span className="truncate">{category.title}</span>
                        </span>
                        <FiChevronRight
                          aria-hidden="true"
                          className={`h-4 w-4 transition-all duration-200 ${active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {activeCategory && (
                <div key={activeCategory.key} className="menu-fade min-h-[280px]">
                  <div className="gap-x-8" style={{ columnCount: 4 }}>
                    {activeCategory.columns.flat().map((group) => {
                      const GroupIcon = iconForLink(group.link);
                      return (
                      <div key={group.link || group.label} className="mb-5 break-inside-avoid">
                        <Link to={group.link || "#"} className="inline-flex items-center gap-2 text-[14px] font-bold text-gray-900 transition hover:underline active:scale-[0.97]">
                          {GroupIcon && <GroupIcon className="h-7 w-7 shrink-0" />}
                          {group.label}
                        </Link>
                        {group.subItems?.length > 0 && (
                          <ul className={`mt-1.5 space-y-1 ${GroupIcon ? "pl-9" : ""}`}>
                            {group.subItems.map((subItem) => (
                              <li key={subItem.link}>
                                <Link to={subItem.link} className="inline-block text-[13px] font-medium text-gray-800 transition hover:translate-x-0.5 hover:text-black active:scale-[0.97]">
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  {viewAllLabel && (
                    <Link
                      to={activeCategory.link}
                      className="group mt-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4 transition active:scale-[0.97]"
                    >
                      {viewAllLabel}: {activeCategory.title}
                      <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
