import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import Scribble from "../Components/Scribble";

/**
 * The sticky bar's flavour / size picker, in the shop's dropdown style (see AddressFields): a two-line trigger
 * (small label, chosen value) that opens a panel upward, options with a thumbnail, a hand-drawn underline on the
 * active one and a price or "sold out" on the right. Sold-out options stay visible but can't be picked.
 *
 * options: [{ id, name, image?, meta?, disabled? }]
 */
export default function StickyOptionPicker({
  label,
  value,
  options,
  onSelect,
  hidden = false,
  align = "left",
  className = "",
}) {
  const [panelOpen, setOpen] = useState(false);
  // The panel never stays open while the bar is slid away.
  const open = panelOpen && !hidden;
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const selected = options.find((option) => option.id === value);

  // Close on outside tap.
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    // Scroll only the list (scrollIntoView could also nudge the page under the fixed bar).
    const list = listRef.current;
    const row = list?.children[active];
    if (!list || !row) return;
    if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
    else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
  }, [open, active]);

  const openPanel = () => {
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
    setOpen(true);
  };

  const choose = (option) => {
    if (!option || option.disabled) return;
    onSelect(option.id);
    setOpen(false);
  };

  const step = (direction) => {
    if (!options.some((option) => !option.disabled)) return;
    let next = active;
    do {
      next = (next + direction + options.length) % options.length;
    } while (options[next].disabled);
    setActive(next);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openPanel();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      step(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(options[active]);
    }
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={onKeyDown}
        tabIndex={hidden ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`group flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white pl-2 pr-3 text-left transition ${
          open ? "border-[var(--ink)]" : "border-gray-300 hover:border-gray-500"
        }`}
      >
        {selected?.image ? (
          <img
            src={selected.image}
            alt=""
            className="pdp-plate h-8 w-8 shrink-0 rounded-lg bg-white object-contain mix-blend-multiply"
          />
        ) : (
          <span className="w-0.5 shrink-0" />
        )}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">{label}</span>
          <span className="block truncate text-[13px] font-semibold text-gray-900">{selected?.name || value || "—"}</span>
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`menu-fade-up absolute bottom-full z-50 mb-3 w-[min(20rem,calc(100vw-2rem))] min-w-full rounded-2xl bg-white px-4 py-2 ring-1 ring-black/[0.08] shadow-[0_-20px_40px_-16px_rgba(20,20,9,0.3)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="border-b border-black/[0.06] pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
            {label}
          </p>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className="relative max-h-[min(20rem,50vh)] divide-y divide-black/[0.05] overflow-y-auto overflow-x-hidden overscroll-contain pr-1"
          >
            {options.map((option, index) => {
              const isSelected = option.id === value;
              const isActive = index === active;
              return (
                <li
                  key={option.id}
                  // Fade only: rows that also moved would overflow the list mid-animation and flash a scrollbar.
                  style={{ animation: "menu-fade 180ms ease-out both", animationDelay: `${Math.min(index, 8) * 18}ms` }}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => !option.disabled && setActive(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(option);
                  }}
                  className={`flex min-h-[52px] items-center gap-3 py-2 transition-all duration-200 ${
                    option.disabled
                      ? "cursor-not-allowed"
                      : `cursor-pointer active:scale-[0.98] ${isSelected || isActive ? "translate-x-1" : ""}`
                  }`}
                >
                  {option.image !== undefined && (
                    <span className="pdp-plate flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      {option.image ? (
                        <img
                          src={option.image}
                          alt=""
                          className={`h-full w-full object-contain mix-blend-multiply ${option.disabled ? "opacity-40 grayscale" : ""}`}
                        />
                      ) : (
                        <span className={`h-5 w-5 rounded-full ${option.disabled ? "bg-gray-300" : "bg-[#FDC700]"}`} />
                      )}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    {option.disabled ? (
                      <span className="block break-words text-sm font-medium leading-snug text-gray-400 line-through">
                        {option.name}
                      </span>
                    ) : (
                      <Scribble active={isSelected || isActive}>
                        <span className={`text-sm leading-snug text-gray-900 ${isSelected ? "font-bold" : "font-medium"}`}>
                          {option.name}
                        </span>
                      </Scribble>
                    )}
                  </span>
                  {option.meta && (
                    <span
                      className={`shrink-0 whitespace-nowrap text-xs tabular-nums ${
                        option.disabled ? "text-gray-400" : "font-semibold text-gray-900"
                      }`}
                    >
                      {option.meta}
                    </span>
                  )}
                  <FiCheck
                    aria-hidden="true"
                    className={`shrink-0 text-gray-900 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                    size={15}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
