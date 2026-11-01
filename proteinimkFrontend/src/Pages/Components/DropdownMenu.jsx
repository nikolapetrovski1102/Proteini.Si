import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Keep omitted lists stable so the products effect cannot trigger a render loop.
const EMPTY_ITEMS = [];

export default function DropdownMenu({
  title,
  items,
  columns,
  gridClass,
  helper,
  products = EMPTY_ITEMS,
  featuredBrands = EMPTY_ITEMS,
  showItemImages = true,
  uppercaseItems = true,
  titleClassName = "",
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(() =>
    pickRandomItems(products),
  );

  const location = useLocation();

  useEffect(() => {
    setIsHovered(false);
  }, [location]);

  useEffect(() => {
    setVisibleProducts(pickRandomItems(products));
  }, [products]);

  function getItemKey(item) {
    return item.link || item.secondSpan || item.label || item.img;
  }

  function pickRandomItems(sourceItems, count = 2, previousItems = []) {
    if (!sourceItems?.length) return EMPTY_ITEMS;
    if (sourceItems.length <= count) return sourceItems;

    const previousKeys = new Set(previousItems.map(getItemKey));
    let fallbackItems = sourceItems.slice(0, count);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const shuffled = [...sourceItems];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[index],
        ];
      }

      const selectedItems = shuffled.slice(0, count);
      fallbackItems = selectedItems;

      const isSameSelection =
        previousItems.length === count &&
        selectedItems.every((item) => previousKeys.has(getItemKey(item)));

      if (!isSameSelection) {
        return selectedItems;
      }
    }

    return fallbackItems;
  }

  const handleOpenDropdown = () => {
    setIsHovered(true);
    setVisibleProducts((previousItems) =>
      pickRandomItems(products, 2, previousItems),
    );
  };

  const itemTextCase = uppercaseItems ? "uppercase" : "";

  const renderColumn = (columnItems, colIndex) => (
    <div key={`col-${colIndex}`} className="flex flex-col gap-4 items-start">
      {columnItems.map((item, index) => (
        <div
          key={`item-${item.label}-${index}`}
          className="flex flex-col gap-2 items-start"
        >
          <a
            href={item.link || "#"}
            className={`inline-flex items-center gap-2 text-[14px] font-bold border-b border-transparent hover:border-[#FDC700] ${itemTextCase}`}
          >
            {showItemImages && item.image && (
              <img
                src={item.image}
                alt=""
                className="h-7 w-14 object-contain"
                loading="lazy"
              />
            )}
            {item.label}
          </a>

          {item.subItems?.map((subItem, subIndex) => (
            <a
              key={`subitem-${subItem.label}-${subIndex}`}
              href={subItem.link || "#"}
              className={`hover-bold inline-block text-[13px] border-b border-transparent hover:border-[#FDC700] text-nowrap ${itemTextCase}`}
              data-text={subItem.label}
            >
              {subItem.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );

  const hasProducts = products.length > 0;
  const hasFeaturedBrands = featuredBrands.length > 0;
  const productsToRender = visibleProducts.length
    ? visibleProducts
    : products.slice(0, 2);

  const renderProductPromos = () => {
    if (!hasProducts) return null;

    return (
      <div className="grid w-[34vw] min-w-[320px] max-w-[440px] grid-cols-2 gap-10">
        {productsToRender.map((product, index) => (
          <a
            key={`product-${product.secondSpan}-${index}`}
            href={product.link || "#"}
            className="group flex min-h-[300px] flex-col justify-between"
          >
            <div className="flex h-[150px] items-center justify-center">
              <img
                src={product.img}
                alt={product.secondSpan}
                className="max-h-[150px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-[#9B9B9B]">
                {product.firstSpan}
              </p>
              <p className="mt-1 min-h-[42px] text-[13px] font-extrabold uppercase leading-[16px] text-black">
                {product.secondSpan}
              </p>
              <span className="mt-5 flex h-[30px] w-full items-center justify-center bg-[#2096D8] text-[13px] font-extrabold text-white transition-colors group-hover:bg-[#187fba]">
                {product.thirdSpan}
              </span>
            </div>
          </a>
        ))}
      </div>
    );
  };

  const renderFeaturedBrands = () => {
    if (!hasFeaturedBrands) return null;

    return (
      <div className="grid w-[42vw] min-w-[420px] max-w-[620px] grid-cols-3 gap-x-10 gap-y-14">
        {featuredBrands.map((brand, index) => (
          <a
            key={`featured-brand-${brand.label}-${index}`}
            href={brand.link || "#"}
            className="group flex h-[150px] flex-col items-center justify-between text-center"
          >
            <div className="flex h-[92px] w-full items-center justify-center">
              <img
                src={brand.image}
                alt={brand.label}
                className="max-h-[70px] max-w-[130px] object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <span className="text-[13px] font-semibold uppercase text-black">
              {brand.label}
            </span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .hover-bold {
            font-weight: 400;
            position: relative;
          }
          
          .hover-bold::before {
            content: attr(data-text);
            content: attr(data-text) / "";
            display: block;
            font-weight: 600;
            height: 0;
            overflow: hidden;
            visibility: hidden;
            pointer-events: none;
          }
          
          .hover-bold:hover {
            font-weight: 600;
          }
        `}
      </style>

      <div
        className="cursor-pointer"
        onMouseEnter={handleOpenDropdown}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navbar item */}
        <div
          className="flex gap-1 items-center border-b-2 border-transparent hover:border-[#FDC700] pb-1"
          onClick={onClick}
        >
          <span className={titleClassName}>{title}</span>
          <img
            src={isHovered ? "/logos/arrow-up.svg" : "/logos/arrow-down.svg"}
            className="w-6 h-6"
            alt="arrow"
          />
        </div>

        {/* Dropdown */}
        <div
          className={`absolute top-42 pt-[37px] pb-[80px] left-0 w-full flex justify-center bg-white shadow-lg z-50 transition-all duration-300 ease-in-out
            ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
          `}
        >
          <div className="w-[min(1560px,calc(100vw-48px))] flex items-start justify-center">
            <div className="w-full flex flex-col items-start">
              <div className="flex w-full items-start justify-between gap-10 px-[15px]">
                <div className={`grid ${gridClass} flex-1`}>
                  {columns
                    ? columns.map((col, i) => renderColumn(col, i))
                    : items.map((item, index) => renderColumn([item], index))}
                </div>
                {(hasProducts || hasFeaturedBrands) && (
                  <div className="shrink-0">
                    {hasFeaturedBrands
                      ? renderFeaturedBrands()
                      : renderProductPromos()}
                  </div>
                )}
              </div>
              <div className="flex gap-4 flex-wrap items-center mt-[16px] pt-[12px] px-[15px]">
                {helper?.map((helperItem, index) => (
                  <React.Fragment key={`helper-${helperItem.label}-${index}`}>
                    <a
                      href={helperItem.link || "#"}
                      className={`inline-block text-[13px] font-bold ${
                        helperItem.color || "text-[#828282]"
                      } ${helperItem.hoverColor || "hover:text-black"}`}
                    >
                      {helperItem.label}
                    </a>
                    {index !== helper.length - 1 && (
                      <span key={`sep-${index}`} className="text-gray-400">
                        |
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
