import { memo, useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

const getItemId = (item) =>
  item.id || item.category_Id || item.sport_Id || item.goal_Id || item.useTiming_Id || item.flavor_Id || item.tag_Id || item.brand_Id;

const getItemName = (item) =>
  item.name || item.category_Name || item.sport_Name || item.goal_Name || item.useTiming_Name || item.flavor_Name || item.tag_Name || item.brand_Name;

/** Multi-select dropdown with checkboxes; shows the chosen names on the button. */
const FilterDropdown = memo(({ title, items, selectedIds, onCheckboxChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [isOpen]);

  if (!items || items.length === 0) return null;

  const selectedNames = items.filter((item) => selectedIds.includes(getItemId(item))).map(getItemName);
  const filtered = query ? items.filter((item) => getItemName(item)?.toLowerCase().includes(query.toLowerCase())) : items;

  return (
    <div className="relative" ref={dropdownRef}>
      <p className="mb-1.5 text-[13px] font-semibold text-gray-800">{title}</p>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm transition ${
          isOpen ? "border-[#141409] ring-2 ring-[#141409]/10" : "border-black/[0.12] hover:border-black/30"
        }`}
      >
        <span className={`truncate ${selectedNames.length ? "text-gray-900" : "text-gray-400"}`}>
          {selectedNames.length ? selectedNames.join(", ") : "None"}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {selectedNames.length > 0 && (
            <span className="rounded-full bg-[#141409] px-1.5 text-[11px] font-bold tabular-nums text-[#FDC700]">{selectedNames.length}</span>
          )}
          <FiChevronDown className={`text-gray-500 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl bg-white shadow-[0_16px_40px_-12px_rgba(20,20,9,0.35)] ring-1 ring-black/[0.08]">
          {items.length > 8 && (
            <div className="border-b border-black/[0.06] p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}…`}
                className="w-full rounded-lg bg-[#f6f5f1] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#141409]/15"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1.5">
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No matches</p>}
            {filtered.map((item) => {
              const itemId = getItemId(item);
              const checked = selectedIds.includes(itemId);
              return (
                <label key={itemId} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-[#f6f5f1]">
                  <input type="checkbox" checked={checked} onChange={() => onCheckboxChange(itemId)} className="peer sr-only" />
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#141409]/30 ${
                      checked ? "border-[#141409] bg-[#141409] text-[#FDC700]" : "border-black/25 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {checked && <FiCheck size={12} strokeWidth={3} />}
                  </span>
                  {getItemName(item)}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

FilterDropdown.displayName = "FilterDropdown";

export default FilterDropdown;
