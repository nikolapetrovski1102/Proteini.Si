// src/Pages/Products/FiltersForProducts.jsx
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import PriceRangeFilter from "./PriceRangeFilter";

export default function FiltersForProducts({
  onFilterChange,
  selectedFilters = {},
}) {
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState({});
  const [parentCategoriesWithChildren, setParentCategoriesWithChildren] =
    useState({});

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await api.getFilterOptions();

        // Build parent-child relationships
        const categoriesWithChildren = {};

        const parentCategories = data.categories.filter(
          (cat) => cat.parent_Category_Id === null,
        );

        parentCategories.forEach((parent) => {
          categoriesWithChildren[parent.category_Id] = {
            parent: parent,
            children: data.categories.filter(
              (cat) => cat.parent_Category_Id === parent.category_Id,
            ),
          };
        });

        setParentCategoriesWithChildren(categoriesWithChildren);

        const filterOnlyParents = (items) => {
          if (!items || items.length === 0) return [];
          return items.filter((item) => item.parent_Category_Id === null);
        };

        const transformedFilters = [
          {
            title: "Product category",
            key: "categoryIds",
            items: filterOnlyParents(data.categories).map((cat) => ({
              id: cat.category_Id,
              name: cat.category_Name,
              slug: cat.category_Slug,
            })),
          },
          {
            title: "Sport",
            key: "sportIds",
            items: data.sports.map((sport) => ({
              id: sport.sport_Id,
              name: sport.sport_Name,
              slug: sport.sport_Slug,
            })),
          },
          {
            title: "Goals",
            key: "goalIds",
            items: data.goals.map((goal) => ({
              id: goal.goal_Id,
              name: goal.goal_Name,
              slug: goal.goal_Slug,
            })),
          },
          {
            title: "Use",
            key: "useTimingIds",
            items: data.useTimings.map((timing) => ({
              id: timing.useTiming_Id,
              name: timing.useTiming_Name,
              slug: timing.useTiming_Slug,
            })),
          },
          {
            title: "Product flavour",
            key: "flavorIds",
            items: data.flavors.map((flavor) => ({
              id: flavor.flavor_Id,
              name: flavor.flavor_Name,
              slug: flavor.flavor_Slug,
            })),
          },
          {
            title: "Brands",
            key: "brandIds",
            items: data.brands.map((brand) => ({
              id: brand.brand_Id,
              name: brand.brand_Name,
              slug: brand.brand_Slug,
            })),
          },
          {
            title: "Price",
            key: "priceRange",
            items: [],
            min: Number(data.priceBounds?.min ?? 0),
            max: Math.max(Number(data.priceBounds?.max ?? 10000), 1000),
          },
          {
            title: "Product status",
            key: "status",
            items: [
              { id: "inStock", name: "Products in stock" },
              { id: "onSale", name: "Products on sale" },
              { id: "newProducts", name: "New products" },
              { id: "outlet", name: "Outlet products" },
              { id: "upcomingPromotions", name: "Upcoming promotions" },
            ],
          },
          {
            title: "Other",
            key: "tagIds",
            items: data.tags.map((tag) => ({
              id: tag.tag_Id,
              name: tag.tag_Name,
              slug: tag.tag_Slug,
            })),
          },
        ];

        setFilterGroups(transformedFilters);

        const initialOpenState = {};
        transformedFilters.forEach((_, index) => {
          initialOpenState[index] = true;
        });
        setOpenCategories(initialOpenState);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const toggleCategory = (index) => {
    setOpenCategories((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFilterChange = (filterKey, itemId, isChecked, item = null) => {
    if (typeof onFilterChange !== "function") {
      console.warn("onFilterChange prop is not a function");
      return;
    }

    let newFilters = { ...(selectedFilters || {}) };

    // Special handling for categoryIds
    if (filterKey === "categoryIds") {
      // Check if this is a PARENT category (has children) or a child
      const hasChildren =
        parentCategoriesWithChildren[itemId]?.children?.length > 0;

      if (hasChildren) {
        // PARENT category - only allow one parent at a time
        if (isChecked) {
          // When checking a parent, replace all existing with just this parent
          newFilters.categoryIds = [itemId];
        } else {
          // When unchecking a parent, remove it AND all its children
          newFilters.categoryIds = [];
        }
        onFilterChange(newFilters);
        return;
      } else {
        // CHILD category (subcategory)
        if (!newFilters.categoryIds) {
          newFilters.categoryIds = [];
        }

        // Find the parent of this child
        let parentId = null;
        for (const [pId, data] of Object.entries(
          parentCategoriesWithChildren,
        )) {
          if (data.children.some((child) => child.category_Id === itemId)) {
            parentId = parseInt(pId);
            break;
          }
        }

        if (isChecked) {
          // When checking a child, ONLY add the child (not the parent)
          if (!newFilters.categoryIds.includes(itemId)) {
            newFilters.categoryIds.push(itemId);
          }
        } else {
          // When unchecking a child, just remove the child
          newFilters.categoryIds = newFilters.categoryIds.filter(
            (id) => id !== itemId,
          );
        }
        onFilterChange(newFilters);
        return;
      }
    }

    // Rest of the function for other filter types...
    if (filterKey === "priceRange") {
      if (isChecked) {
        newFilters.minPrice = item.min;
        newFilters.maxPrice = item.max;
      } else {
        newFilters.minPrice = null;
        newFilters.maxPrice = null;
      }
    } else if (filterKey === "status") {
      newFilters[itemId] = isChecked;
    } else {
      if (!newFilters[filterKey]) {
        newFilters[filterKey] = [];
      }

      if (isChecked) {
        newFilters[filterKey].push(itemId);
      } else {
        newFilters[filterKey] = newFilters[filterKey].filter(
          (id) => id !== itemId,
        );
      }
    }

    onFilterChange(newFilters);
  };

  const isChecked = (filterKey, itemId, item = null) => {
    if (!selectedFilters) return false;

    if (filterKey === "priceRange") {
      return (
        selectedFilters.minPrice === item.min &&
        selectedFilters.maxPrice === item.max
      );
    } else if (filterKey === "status") {
      return selectedFilters[itemId] === true;
    } else {
      const filterArray = selectedFilters[filterKey];
      if (Array.isArray(filterArray)) {
        return filterArray.includes(itemId);
      }
      return false;
    }
  };

  const handlePriceCommit = (minPrice, maxPrice) => {
    onFilterChange({
      ...(selectedFilters || {}),
      minPrice,
      maxPrice,
    });
  };

  if (loading) {
    return (
      <div className="max-w-[220px] w-full flex flex-col">
        <div className="flex justify-between mb-[30px] pr-[20px] pb-[10px] pl-[10px] border-b border-[#E5E5E5]">
          <p className="text-[14px]">FILTER</p>
        </div>
        <div className="pl-[10px]">Loading filters...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[220px] w-full flex flex-col">
      <div className="flex justify-between mb-[30px] pr-[20px] pb-[10px] pl-[10px] border-b border-[#E5E5E5]">
        <p className="text-[14px]">FILTER</p>
        <img src="/logos/filter.svg" alt="Filter" width={16} height={16} />
      </div>

      {filterGroups.map((group, index) => (
        <div key={index}>
          <div className="pl-[10px] pb-[20px] mb-[20px] border-b border-[#E5E5E5]">
            <div
              className="flex justify-between cursor-pointer"
              onClick={() => toggleCategory(index)}
            >
              <p className="text-[12px] font-bold">{group.title}</p>
              <img
                src={
                  openCategories[index]
                    ? "/logos/arrow-up-2.svg"
                    : "/logos/arrow-down-2.svg"
                }
                alt={openCategories[index] ? "Arrow Up" : "Arrow Down"}
                width={18}
                height={18}
                className="mr-[14px]"
              />
            </div>

            <div
              className={`flex flex-col max-w-[190px] mr-[18px] transition-all duration-300 ease-in-out pr-2.5 ${
                openCategories[index]
                  ? "opacity-100 max-h-[140px] mt-[18px]"
                  : "opacity-0 max-h-0 pt-0 overflow-hidden"
              } ${
                openCategories[index]
                  ? "hover:overflow-y-auto overflow-y-hidden scrollbar-thin"
                  : ""
              }`}
            >
              {group.key === "priceRange" ? (
                <PriceRangeFilter
                  min={group.min}
                  max={group.max}
                  valueMin={selectedFilters.minPrice}
                  valueMax={selectedFilters.maxPrice}
                  onCommit={handlePriceCommit}
                />
              ) : group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center gap-1 mb-[13px]"
                >
                  <input
                    type="checkbox"
                    id={`${group.key}-${item.id || itemIndex}`}
                    name={item.name}
                    checked={isChecked(group.key, item.id, item)}
                    onChange={(e) =>
                      handleFilterChange(
                        group.key,
                        item.id,
                        e.target.checked,
                        item,
                      )
                    }
                  />
                  <label
                    htmlFor={`${group.key}-${item.id || itemIndex}`}
                    className="ml-[10px] text-[12px] leading-[15px] text-nowrap"
                  >
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories dropdown - SEPARATE section UNDER each parent */}
          {group.key === "categoryIds" &&
            group.items.map((item) => {
              const children = parentCategoriesWithChildren[item.id]?.children;
              const isParentChecked = isChecked(group.key, item.id, item);

              if (!children || children.length === 0) return null;

              return (
                <div
                  key={`sub-${item.id}`}
                  className={`transition-all duration-300 ease-in-out ${
                    isParentChecked
                      ? "opacity-100 max-h-[200px] mb-[20px]"
                      : "opacity-0 max-h-0 overflow-hidden p-0 m-0"
                  }`}
                >
                  <div className="pl-[10px] pb-[20px] border-b border-[#E5E5E5]">
                    <div className="flex justify-between mb-[18px]">
                      <p className="text-[12px] font-bold">
                        Product subcategory
                      </p>
                    </div>

                    <div className="flex flex-col max-w-[190px] mr-[18px] pr-2.5 max-h-[140px] hover:overflow-y-auto overflow-y-hidden scrollbar-thin">
                      {children.map((child) => (
                        <div
                          key={child.category_Id}
                          className="flex items-center gap-1 mb-[13px]"
                        >
                          <input
                            type="checkbox"
                            id={`sub-${group.key}-${child.category_Id}`}
                            name={child.category_Name}
                            checked={isChecked(
                              group.key,
                              child.category_Id,
                              child,
                            )}
                            onChange={(e) =>
                              handleFilterChange(
                                group.key,
                                child.category_Id,
                                e.target.checked,
                                child,
                              )
                            }
                          />
                          <label
                            htmlFor={`sub-${group.key}-${child.category_Id}`}
                            className="ml-[10px] text-[12px] leading-[15px] text-nowrap cursor-pointer"
                          >
                            {child.category_Name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
