// FilterDropdown.jsx
import { useState, memo, useEffect, useRef } from "react";

const FilterDropdown = memo(
  ({ title, items, selectedIds, onCheckboxChange, dropdownKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    if (!items || items.length === 0) return null;

    const getItemId = (item) => {
      return (
        item.id ||
        item.category_Id ||
        item.sport_Id ||
        item.goal_Id ||
        item.useTiming_Id ||
        item.flavor_Id ||
        item.tag_Id ||
        item.brand_Id
      );
    };

    const getItemName = (item) => {
      return (
        item.name ||
        item.category_Name ||
        item.sport_Name ||
        item.goal_Name ||
        item.useTiming_Name ||
        item.flavor_Name ||
        item.tag_Name ||
        item.brand_Name
      );
    };

    // Build hierarchical structure for categories only
    const buildHierarchy = (itemsList) => {
      if (title !== "Categories")
        return itemsList.map((item) => ({ ...item, level: 0 }));

      const itemMap = {};
      itemsList.forEach((item) => {
        const id = getItemId(item);
        itemMap[id] = { ...item, children: [], level: 0 };
      });

      const rootItems = [];
      itemsList.forEach((item) => {
        const id = getItemId(item);
        const parentId = item.parent_Category_Id;

        if (parentId && itemMap[parentId]) {
          itemMap[parentId].children.push(itemMap[id]);
        } else if (!parentId) {
          rootItems.push(itemMap[id]);
        }
      });

      const flatList = [];
      const flatten = (item, level) => {
        flatList.push({ ...item, level });
        item.children.forEach((child) => flatten(child, level + 1));
      };

      rootItems.forEach((item) => flatten(item, 0));
      return flatList;
    };

    const hierarchicalItems = buildHierarchy(items);

    const getDisplayName = (item) => {
      const name = getItemName(item);
      const level = item.level || 0;
      if (level === 0) return name;
      return "  " + "—".repeat(level) + " " + name;
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-[#2096D8] transition-colors"
        >
          <span className="text-sm text-gray-700">
            {title}{" "}
            {selectedIds.length > 0 && `(${selectedIds.length} selected)`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              {(title === "Categories" ? hierarchicalItems : items).map(
                (item) => {
                  const itemId = getItemId(item);
                  const itemName =
                    title === "Categories"
                      ? getDisplayName(item)
                      : getItemName(item);

                  return (
                    <label
                      key={itemId}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(itemId)}
                        onChange={() => onCheckboxChange(itemId)}
                        className="w-4 h-4 text-[#2096D8] focus:ring-[#2096D8] rounded"
                      />
                      <span
                        className={`text-sm text-gray-700 ${item.level > 0 ? "font-normal" : "font-medium"}`}
                      >
                        {itemName}
                      </span>
                    </label>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default FilterDropdown;
