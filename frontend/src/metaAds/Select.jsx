import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

/**
 * Dropdown in the proteini.mk shop style (the "Sort by" menu): white button, floating rounded list,
 * chosen item in bold. options = [{ value, label }]. Long lists get a search box.
 */
export default function Select({ value, onChange, options, placeholder = "Choose…", label, size = "md", className = "" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(-1);
  const root = useRef(null);
  const list = useRef(null);
  const id = useId();

  const selected = options.find((o) => String(o.value) === String(value));
  const searchable = options.length > 10;
  const shown = query ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options;

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  useEffect(() => {
    if (cursor < 0) return;
    list.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const toggle = () => {
    setQuery("");
    setCursor(Math.max(0, options.findIndex((o) => String(o.value) === String(value))));
    setOpen((o) => !o);
  };

  const pick = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(shown.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && shown[cursor]) {
      e.preventDefault();
      pick(shown[cursor]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const big = size === "lg";

  return (
    <div className={`relative ${className}`} ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        className={`flex w-full items-center justify-between gap-2 rounded-full border bg-white px-4 text-left font-semibold transition-colors ${
          big ? "py-3 text-base" : "py-2.5 text-[13px]"
        } ${open ? "border-[#141409]" : "border-gray-300 hover:border-[#141409]"}`}
      >
        <span className={`truncate ${selected ? "text-gray-900" : "font-normal text-gray-400"}`}>{selected ? selected.label : placeholder}</span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-700 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-full w-max max-w-[min(90vw,420px)] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/[0.06]">
          {searchable && (
            <div className="border-b border-black/[0.06] p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                placeholder="Search…"
                className="w-full rounded-lg bg-[#f6f5f1] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#141409]/15"
              />
            </div>
          )}
          <ul id={id} role="listbox" ref={list} className="max-h-72 overflow-y-auto py-2">
            {shown.length === 0 && <li className="px-4 py-2.5 text-[12px] text-gray-500">No matches</li>}
            {shown.map((o, i) => {
              const isSelected = String(o.value) === String(value);
              return (
                <li key={String(o.value)} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    data-index={i}
                    onClick={() => pick(o)}
                    onMouseEnter={() => setCursor(i)}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-[13px] transition-colors ${
                      i === cursor ? "bg-[#f8f7f4]" : ""
                    } ${isSelected ? "font-bold text-gray-900" : "text-gray-700"}`}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && <FiCheck className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
