// src/Pages/Products/FiltersForProducts.jsx
import { useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import PriceRangeFilter from "./PriceRangeFilter";
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

const VISIBLE_LIMIT = 6;
const SEARCH_THRESHOLD = 10;
const OPEN_BY_DEFAULT = new Set(["categoryIds", "priceRange", "status", "brandIds"]);

export default function FiltersForProducts({ onFilterChange, selectedFilters = {} }) {
  useLanguage(); // re-render labels when the language changes
  const { groups: allGroups, parentIds, apparelIds, loading } = useFilterGroups();
  const [openOverrides, setOpenOverrides] = useState({});

  const filters = selectedFilters || {};
  const groups = visibleGroups(allGroups, filters, apparelIds);
  const total = activeFilterCount(filters, groups);

  const toggle = (key, id) => onFilterChange(toggleFilter(filters, key, id, parentIds));

  const clearAll = () => {
    const next = { ...filters };
    groups.forEach((g) => {
      if (g.isPrice) {
        delete next.minPrice;
        delete next.maxPrice;
      } else if (g.key === "status") g.items.forEach((i) => delete next[i.id]);
      else delete next[g.key];
    });
    onFilterChange(next);
  };

  return (
    <aside className="sticky top-[96px] w-[264px] shrink-0 self-start">
      <div className="flex max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <FiSliders className="h-4 w-4 text-gray-900" aria-hidden />
            <h2 className="font-display text-[18px] font-semibold uppercase leading-none tracking-wide text-gray-900">
              {filterText("filter")}
            </h2>
            {total > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FDC700] px-1.5 text-[11px] font-bold leading-none text-[#141409]">
                {total}
              </span>
            )}
          </div>
          {total > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] font-semibold text-gray-500 underline-offset-2 transition-colors hover:text-gray-900 hover:underline"
            >
              {filterText("clearShort")}
            </button>
          )}
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {loading ? (
            <FilterSkeleton />
          ) : (
            groups.map((group) => {
              const count = selectedCount(filters, group);
              const open = openOverrides[group.key] ?? (OPEN_BY_DEFAULT.has(group.key) || count > 0);
              const GroupIcon = FILTER_GROUP_ICONS[group.key];
              return (
                <section key={group.key} className="border-b border-black/[0.06] last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenOverrides((o) => ({ ...o, [group.key]: !open }))}
                    className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition-colors hover:bg-[#f8f7f4]"
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-bold text-gray-900">
                      {GroupIcon && <GroupIcon className="h-7 w-7 shrink-0" />}
                      {filterText(group.key)}
                      {count > 0 && (
                        <span className="rounded-full bg-[#141409] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                          {count}
                        </span>
                      )}
                    </span>
                    <FiChevronDown
                      aria-hidden
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden" inert={!open}>
                      <div className="px-5 pb-4 pt-0.5">
                        {group.isPrice ? (
                          <PriceRangeFilter
                            min={group.min}
                            max={group.max}
                            valueMin={filters.minPrice}
                            valueMax={filters.maxPrice}
                            onCommit={(minPrice, maxPrice) =>
                              onFilterChange({ ...filters, minPrice, maxPrice })
                            }
                          />
                        ) : (
                          <OptionList group={group} filters={filters} onToggle={toggle} />
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

function OptionList({ group, filters, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const label = (item) => filterLabel(group.key, item.slug || item.id, item.name);
  const searchable = group.items.length > SEARCH_THRESHOLD;
  const q = query.trim().toLowerCase();

  let items = group.items;
  if (q) {
    items = items.filter((i) => label(i).toLowerCase().includes(q));
  } else if (!expanded) {
    // Keep selected options visible even when the list is collapsed.
    items = items.filter((i, idx) => idx < VISIBLE_LIMIT || isSelected(filters, group.key, i.id));
  }
  const hiddenCount = group.items.length - VISIBLE_LIMIT;

  return (
    <div>
      {searchable && (
        <label className="mb-2 flex items-center gap-2 rounded-lg bg-[#f4f3ef] px-3 py-2 focus-within:ring-1 focus-within:ring-[#141409]">
          <FiSearch className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterText("searchIn")}
            className="w-full min-w-0 bg-transparent text-[12px] text-gray-900 outline-none placeholder:text-gray-400"
          />
        </label>
      )}

      <ul className={`-mx-2 ${expanded || q ? "scrollbar-thin max-h-[280px] overflow-y-auto" : ""}`}>
        {items.map((item) => {
          const checked = isSelected(filters, group.key, item.id);
          const children = item.children || [];
          return (
            <li key={item.id}>
              <CheckRow
                id={`f-${group.key}-${item.id}`}
                checked={checked}
                onChange={() => onToggle(group.key, item.id)}
                icon={iconForFilterItem(group.key, item)}
              >
                {label(item)}
              </CheckRow>
              {checked && children.length > 0 && (
                <ul className="mb-1 ml-[17px] border-l-2 border-[#FDC700] pl-2">
                  {children.map((child) => (
                    <li key={child.id}>
                      <CheckRow
                        id={`f-${group.key}-${child.id}`}
                        checked={isSelected(filters, group.key, child.id)}
                        onChange={() => onToggle(group.key, child.id)}
                        icon={iconForSlug(child.slug)}
                        small
                      >
                        {filterLabel("categoryIds", child.slug, child.name)}
                      </CheckRow>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {q && items.length === 0 && (
          <li className="px-2 py-1.5 text-[12px] text-gray-400">{filterText("noMatches")}</li>
        )}
      </ul>

      {!q && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[12px] font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4 transition-colors hover:decoration-[#141409]"
        >
          {expanded ? filterText("showLess") : filterText("showAll").replace("{n}", group.items.length)}
        </button>
      )}
    </div>
  );
}

function CheckRow({ id, checked, onChange, small = false, icon: Icon, children }) {
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-[5px] transition-colors hover:bg-[#f8f7f4]"
    >
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#FDC700] peer-focus-visible:ring-offset-1 ${
          checked ? "border-[#141409] bg-[#141409]" : "border-gray-300 bg-white group-hover:border-gray-500"
        }`}
      >
        {checked && <FiCheck className="h-3 w-3 text-[#FDC700]" strokeWidth={3.5} />}
      </span>
      {Icon && <Icon className={`shrink-0 text-gray-900 ${small ? "h-5 w-5" : "h-6 w-6"}`} />}
      <span
        className={`min-w-0 truncate leading-[18px] ${small ? "text-[12px]" : "text-[13px]"} ${
          checked ? "font-semibold text-gray-900" : "text-gray-700 group-hover:text-gray-900"
        }`}
      >
        {children}
      </span>
    </label>
  );
}

function FilterSkeleton() {
  return (
    <div className="space-y-5 px-5 py-5" aria-busy="true" aria-label={filterText("loading")}>
      {[0, 1, 2].map((g) => (
        <div key={g} className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-gray-100" />
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex items-center gap-2.5">
              <div className="h-[18px] w-[18px] rounded-[5px] bg-gray-100" />
              <div className="h-2.5 rounded-full bg-gray-100" style={{ width: `${50 + ((r * 17) % 40)}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
