// src/Pages/Products/MobileFiltersModal.jsx
import { useState, useEffect } from "react";
import { FiX, FiFilter, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import PriceRangeFilter from "./PriceRangeFilter";
import { BrandLoader } from "../Components/Loaders/BrandLoader";

export default function MobileFiltersModal({
  isOpen,
  onClose,
  onFilterChange,
  selectedFilters = {},
  totalProducts = 0,
  fetchProductCount,
  navigate,
}) {
  const [filterGroups, setFilterGroups] = useState([]);
  const [tempFilters, setTempFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [tempProductCount, setTempProductCount] = useState(totalProducts);
  const [updatingCount, setUpdatingCount] = useState(false);

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await api.getFilterOptions();

        // Transform API data into button-based filter structure
        const transformedFilters = [
          {
            title: "Product category",
            key: "categoryIds",
            items: data.categories.map((cat) => ({
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
            title: "Price Range",
            key: "priceRange",
            isPriceRange: true,
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Initialize temp filters when modal opens or selectedFilters change
  useEffect(() => {
    if (isOpen) {
      setTempFilters({ ...selectedFilters });
      updateProductCount({ ...selectedFilters });
    }
  }, [isOpen, selectedFilters]);

  const updateProductCount = async (filters) => {
    setUpdatingCount(true);
    try {
      const count = await fetchProductCount(filters);
      setTempProductCount(count);
    } catch (error) {
      console.error("Error updating product count:", error);
    } finally {
      setUpdatingCount(false);
    }
  };

  const handleFilterClick = async (
    filterKey,
    itemId,
    isPriceRange = false,
    item = null,
  ) => {
    const newFilters = { ...tempFilters };

    if (isPriceRange) {
      // Handle price range (single selection)
      if (
        tempFilters.minPrice === item.min &&
        tempFilters.maxPrice === item.max
      ) {
        // If same price range is selected, deselect it
        delete newFilters.minPrice;
        delete newFilters.maxPrice;
      } else {
        newFilters.minPrice = item.min;
        newFilters.maxPrice = item.max;
      }
    } else if (filterKey === "status") {
      // Handle status (checkbox style)
      if (newFilters[itemId]) {
        delete newFilters[itemId];
      } else {
        newFilters[itemId] = true;
      }
    } else {
      // Handle array-based filters (multiple selection)
      if (!newFilters[filterKey]) {
        newFilters[filterKey] = [];
      }

      const currentArray = newFilters[filterKey];
      if (currentArray.includes(itemId)) {
        newFilters[filterKey] = currentArray.filter((id) => id !== itemId);
        if (newFilters[filterKey].length === 0) {
          delete newFilters[filterKey];
        }
      } else {
        newFilters[filterKey] = [...currentArray, itemId];
      }
    }

    setTempFilters(newFilters);

    // Update product count based on new filters in real-time
    await updateProductCount(newFilters);
  };

  const isFilterSelected = (
    filterKey,
    itemId,
    isPriceRange = false,
    item = null,
  ) => {
    if (isPriceRange) {
      return (
        tempFilters.minPrice === item.min && tempFilters.maxPrice === item.max
      );
    } else if (filterKey === "status") {
      return tempFilters[itemId] === true;
    } else {
      const filterArray = tempFilters[filterKey];
      return Array.isArray(filterArray) && filterArray.includes(itemId);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handlePriceCommit = async (minPrice, maxPrice) => {
    const newFilters = { ...tempFilters, minPrice, maxPrice };
    setTempFilters(newFilters);
    await updateProductCount(newFilters);
  };

  const handleCancelFilters = () => {
    // Navigate to all-products page
    navigate("/all-products");
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(tempFilters).forEach((key) => {
      if (Array.isArray(tempFilters[key])) {
        count += tempFilters[key].length;
      } else if (key === "minPrice" && tempFilters.minPrice !== undefined) {
        count += 1;
      } else if (
        key !== "minPrice" &&
        key !== "maxPrice" &&
        tempFilters[key] === true
      ) {
        count += 1;
      }
    });
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal Content - Full width and height */}
      <div className="fixed inset-0 bg-white flex flex-col">
        {/* Header with Cancel Filters (top left) and Close (top right) */}
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <button
            onClick={handleCancelFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiTrash2 size={16} />
            Cancel filters
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Filter Groups - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <BrandLoader variant="scoop" size={80} />
            </div>
          ) : (
            filterGroups.map((group, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.key === "priceRange" ? (
                    <PriceRangeFilter
                      min={group.min}
                      max={group.max}
                      valueMin={tempFilters.minPrice}
                      valueMax={tempFilters.maxPrice}
                      onCommit={handlePriceCommit}
                      compact
                    />
                  ) : group.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() =>
                        handleFilterClick(
                          group.key,
                          item.id,
                          group.isPriceRange,
                          item,
                        )
                      }
                      className={`px-3 py-2 text-sm rounded-md border transition-all duration-200 ${
                        isFilterSelected(
                          group.key,
                          item.id,
                          group.isPriceRange,
                          item,
                        )
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Sticky Yellow Button */}
        <div className="border-t bg-white sticky bottom-0">
          {/* Apply Filters Button */}
          <button
            onClick={handleApplyFilters}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg transition-colors duration-200"
            disabled={updatingCount}
          >
            {updatingCount ? "Loading..." : `Show ${tempProductCount} products`}
          </button>
        </div>
      </div>
    </div>
  );
}
