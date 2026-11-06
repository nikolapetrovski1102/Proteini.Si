import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const CLOSE_DELAY_MS = 120;

/**
 * Desktop navigation item with a hover mega-menu.
 *
 * - `columns`: array of columns, each an array of `{ label, link, subItems? }` groups.
 * - `items`: a flat list of `{ label, link }` rendered as a compact multi-column list
 *   (used for brands and offers).
 *
 * The panel is positioned against the nearest `relative` ancestor (the nav bar).
 */
export default function DropdownMenu({
  title,
  link,
  columns,
  items,
  listColumns = 4,
  viewAllLabel,
  onOpen,
  highlight = false,
}) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  // The menu remembers the route it was opened on, so it closes by itself on navigation.
  const [openOnRoute, setOpenOnRoute] = useState(null);
  const isOpen = openOnRoute === routeKey;
  const setIsOpen = (value) => setOpenOnRoute(value ? routeKey : null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const open = () => {
    clearTimeout(closeTimer.current);
    if (!isOpen) onOpen?.();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  const titleClass = `flex h-full items-center gap-1 border-b-2 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
    isOpen ? "border-[#FDC700] text-black" : "border-transparent"
  } ${highlight ? "text-[#BF243E]" : "text-gray-800 hover:text-black"}`;

  const chevron = (
    <svg
      className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      className="h-full"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
      }}
    >
      {link ? (
        <Link to={link} className={titleClass} aria-expanded={isOpen}>
          {title}
          {chevron}
        </Link>
      ) : (
        <button type="button" className={titleClass} aria-expanded={isOpen}>
          {title}
          {chevron}
        </button>
      )}

      <div
        className={`absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg transition duration-150 ${
          isOpen
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-[1240px] px-6 py-8">
          {columns ? (
            <div className="grid grid-cols-4 gap-x-10 gap-y-6">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-6">
                  {column.map((group) => (
                    <div key={group.link || group.label}>
                      <Link
                        to={group.link || "#"}
                        className="text-[13px] font-bold uppercase text-black hover:text-[#2096D8]"
                      >
                        {group.label}
                      </Link>
                      {group.subItems?.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {group.subItems.map((subItem) => (
                            <li key={subItem.link}>
                              <Link
                                to={subItem.link}
                                className="text-[13px] text-gray-600 hover:text-black"
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <ul
              className="gap-x-10 space-y-1.5"
              style={{ columnCount: listColumns }}
            >
              {items?.map((item) => (
                <li key={item.link} className="break-inside-avoid">
                  <Link
                    to={item.link}
                    className="text-[13px] text-gray-700 hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {link && viewAllLabel && (
            <div className="mt-8 border-t border-gray-100 pt-4">
              <Link
                to={link}
                className="text-[13px] font-semibold text-[#2096D8] hover:underline"
              >
                {viewAllLabel} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
