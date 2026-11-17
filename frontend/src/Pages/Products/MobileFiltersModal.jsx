// src/Pages/Products/MobileFiltersModal.jsx
import { useState, useEffect, useRef } from "react";
import { FiX, FiCheck, FiChevronDown } from "react-icons/fi";
import MobilePriceFilter from "./MobilePriceFilter";
import { InlineLoader } from "../Components/Loaders/BrandLoader";
import { useLanguage } from "../translation/LanguageContext";
import { filterLabel, filterText } from "../../utils/filterLabels";
import { FILTER_GROUP_ICONS, iconForFilterItem, iconForSlug } from "../Components/shopIconMap";
import {
  useFilterGroups,
  visibleGroups,
  isSelected,
  toggleFilter,
  selectedCount,
  activeFilterCount,
} from "./filterGroups";

const VISIBLE_LIMIT = 8;
const OPEN_BY_DEFAULT = new Set(["categoryIds", "priceRange", "status"]);

export default function MobileFiltersModal({
  isOpen,
  onClose,
  onFilterChange,
  selectedFilters = {},
  totalProducts = 0,
  fetchProductCount,
  navigate,
}) {
  useLanguage(); // re-render labels when the language changes
  const { groups: allGroups, parentIds, apparelIds, loading } = useFilterGroups();
  const [tempFilters, setTempFilters] = useState({});
  const groups = visibleGroups(allGroups, tempFilters, apparelIds);
  const [tempProductCount, setTempProductCount] = useState(totalProducts);
  const [updatingCount, setUpdatingCount] = useState(false);
  const [openOverrides, setOpenOverrides] = useState({});
  const countRequest = useRef(0);

  const updateProductCount = async (filters) => {
    const request = ++countRequest.current;
    setUpdatingCount(true);
    try {
      const count = await fetchProductCount(filters);
      if (request === countRequest.current) setTempProductCount(count);
    } catch (error) {
      console.error("Error updating product count:", error);
    } finally {
      if (request === countRequest.current) setUpdatingCount(false);
    }
  };

  // Start from the applied filters every time the sheet opens.
  useEffect(() => {
    if (isOpen) {
      setTempFilters({ ...selectedFilters });
      // The applied filters' count is already on the page; no request needed.
      countRequest.current += 1;
      setUpdatingCount(false);
      setTempProductCount(totalProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedFilters]);

  // Lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const change = (next) => {
    setTempFilters(next);
    updateProductCount(next);
  };

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleClear = () => {
    navigate("/all-products");
    onClose();
  };

  if (!isOpen) return null;

  const total = activeFilterCount(tempFilters, groups);

  return (
    <div className="fixed inset-x-0 top-0 bottom-[var(--bottom-nav-h,0px)] z-50 bg-white lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title">
      <div className="filter-sheet-in flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <h2
              id="mobile-filters-title"
              className="font-display text-[22px] font-semibold uppercase leading-none tracking-wide text-gray-900"
            >
              {filterText("filter")}
            </h2>
            {total > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FDC700] px-1.5 text-[11px] font-bold leading-none text-[#141409]">
                {total}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={filterText("close")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3ef] text-gray-900 transition-colors active:bg-[#e9e7e0]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <InlineLoader size={32} />
            </div>
          ) : (
            groups.map((group) => {
              const count = selectedCount(tempFilters, group);
              const open = openOverrides[group.key] ?? (OPEN_BY_DEFAULT.has(group.key) || count > 0);
              const GroupIcon = FILTER_GROUP_ICONS[group.key];
              return (
                <section key={group.key} className="border-b border-black/[0.06]">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenOverrides((o) => ({ ...o, [group.key]: !open }))}
                    className="flex w-full items-center justify-between gap-2 px-4 py-4 text-left"
                  >
                    <span className="flex items-center gap-3 text-[15px] font-bold text-gray-900">
                      {GroupIcon && <GroupIcon className="h-8 w-8 shrink-0" />}
                      {filterText(group.key)}
                      {count > 0 && (
                        <span className="rounded-full bg-[#141409] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                          {count}
                        </span>
                      )}
                    </span>
                    <FiChevronDown
                      aria-hidden
                      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="px-4 pb-5">
                      {group.isPrice ? (
                        <MobilePriceFilter
                          min={group.min}
                          max={group.max}
                          valueMin={tempFilters.minPrice}
                          valueMax={tempFilters.maxPrice}
                          onCommit={(minPrice, maxPrice) => {
                            const next = { ...tempFilters, minPrice, maxPrice };
                            if (minPrice === null) {
                              delete next.minPrice;
                              delete next.maxPrice;
                            }
                            change(next);
                          }}
                        />
                      ) : (
                        <ChipGroup
                          group={group}
                          filters={tempFilters}
                          onToggle={(id) => change(toggleFilter(tempFilters, group.key, id, parentIds))}
                        />
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        <div className="flex gap-3 border-t border-black/[0.06] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-gray-300 px-4 py-3.5 text-[14px] font-semibold text-gray-900 transition-colors active:bg-gray-100"
          >
            {filterText("clearShort")}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={updatingCount}
            className="flex-1 rounded-xl bg-[#FDC700] py-3.5 text-[15px] font-bold text-[#141409] transition-colors active:bg-[#e7b700] disabled:opacity-70"
          >
            {updatingCount
              ? filterText("loadingShort")
              : filterText("showProducts").replace("{n}", tempProductCount)}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipGroup({ group, filters, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const label = (item) => filterLabel(group.key, item.slug || item.id, item.name);

  const items = expanded
    ? group.items
    : group.items.filter((i, idx) => idx < VISIBLE_LIMIT || isSelected(filters, group.key, i.id));
  const hiddenCount = group.items.length - VISIBLE_LIMIT;

  // Subcategories of the selected parent category, shown as their own row.
  const activeParent =
    group.key === "categoryIds"
      ? group.items.find((i) => i.children?.length && isSelected(filters, group.key, i.id))
      : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip
            key={item.id}
            selected={isSelected(filters, group.key, item.id)}
            onClick={() => onToggle(item.id)}
            icon={iconForFilterItem(group.key, item)}
          >
            {label(item)}
          </Chip>
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full px-3 py-2 text-[13px] font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4"
          >
            {expanded ? filterText("showLess") : filterText("showAll").replace("{n}", group.items.length)}
          </button>
        )}
      </div>

      {activeParent && (
        <div className="mt-4 rounded-xl bg-[#f8f7f4] p-3">
          <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-gray-500">
            {filterText("subcategory")}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeParent.children.map((child) => (
              <Chip
                key={child.id}
                selected={isSelected(filters, group.key, child.id)}
                onClick={() => onToggle(child.id)}
                icon={iconForSlug(child.slug)}
              >
                {filterLabel("categoryIds", child.slug, child.name)}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ selected, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
        selected
          ? "border-[#141409] bg-[#141409] font-semibold text-white"
          : "border-gray-200 bg-white text-gray-800 active:bg-gray-100"
      }`}
    >
      {selected ? (
        <FiCheck className="h-3.5 w-3.5 text-[#FDC700]" strokeWidth={3} aria-hidden />
      ) : (
        Icon && <Icon className="-my-1 -ml-1 h-6 w-6" />
      )}
      {children}
    </button>
  );
}
