import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { Starburst } from "./sections/Decor";

const formatMkd = (value) => `MKD ${(Number(value) || 0).toFixed(2)}`;

export const productHref = (product) =>
  product.isVariant && product.variant_Id
    ? `/product/${product.parent_Product_Id || product.product_Id}?variant=${product.variant_Id}`
    : `/product/${product.product_Id}`;

/**
 * Product card used by the home page rails and the products listing.
 *
 *  tag         – small label shown top-left (e.g. "NEW")
 *  showSaleEnd – show the "sale ends" chip under the price
 *  fluid       – fill the grid cell instead of the fixed rail width
 *  language    – "al" shows the Albanian name when there is one
 */
export default function HomeProductCard({
  product,
  onQuickPurchase,
  onQuickPurchaseIntent,
  onToggleFavorite,
  isFavorite,
  translate,
  tag,
  showSaleEnd = false,
  fluid = false,
  language,
  saleEndLocale,
}) {
  const saleActive = isSaleActive(product);
  const regularPrice = Number(product.price) || 0;
  const salePrice = saleActive ? Number(product.compare_Price) || 0 : 0;
  const hasDiscount = salePrice > 0 && salePrice < regularPrice;
  const discount = hasDiscount ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
  const saleEndDate = showSaleEnd && saleActive ? formatSaleEndDate(product, saleEndLocale) : null;
  const href = productHref(product);
  const name = language === "al" && product.nameAl ? product.nameAl : product.name;
  const label = product.brandName || product.category || "Proteini.si";

  const details = product.hasVariants
    ? [
        `${product.packagingCount || 1} ${translate(product.packagingCount === 1 ? "packing" : "packings")}`,
        Number(product.flavorCount) > 0 &&
          `${product.flavorCount} ${translate(product.flavorCount === 1 ? "taste" : "tastes")}`,
      ]
    : [
        Number(product.gPerServing) > 0 && `${product.gPerServing}g ${translate("perServing")}`,
        Number(product.servings) > 0 && `${product.servings} ${translate("servings")}`,
      ];
  const detailsText = details.filter(Boolean).join(" · ");

  const quick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickPurchase();
  };
  // Warm the variant details on mouse hover (or a finger landing on the button), so the sheet opens filled.
  const intent = () => onQuickPurchaseIntent?.();
  const hoverIntent = (event) => event.pointerType === "mouse" && intent();

  return (
    <article
      onPointerEnter={hoverIntent}
      className={`home-card group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] ${
        fluid ? "w-full min-w-0" : "w-[164px] flex-shrink-0 snap-start sm:w-[268px]"
      }`}
    >
      {/* Image */}
      <Link to={href} className="relative block aspect-square overflow-hidden bg-gradient-to-b from-[#f8f7f4] to-[#efede7]">
        {/* soft yellow glow that blooms behind the product on hover */}
        <span aria-hidden="true" className="home-card-glow pointer-events-none absolute inset-0" />
        {product.img ? (
          <img
            src={String(product.img)}
            alt={name}
            loading="lazy"
            decoding="async"
            className="home-card-img relative h-full w-full object-contain p-4 mix-blend-multiply sm:p-6"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            {translate("noImage")}
          </div>
        )}

        {/* Badges: "new"/"soon" and the discount always show */}
        <div className="absolute left-2.5 right-12 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:right-14 sm:top-3">
          {discount > 0 && (
            <Starburst
              color="#E3262F"
              textColor="#ffffff"
              rotate={-12}
              className="-ml-1 -mt-1 h-12 w-12 text-[15px] sm:h-14 sm:w-14 sm:text-lg"
            >
              −{discount}%
            </Starburst>
          )}
          {tag && (
            <span className="-rotate-3 rounded-md bg-[#141409] px-2 py-1 font-display text-[11px] font-semibold uppercase leading-none tracking-wide text-[#FDC700] shadow-[2px_2px_0_rgba(20,20,9,0.18)] sm:text-[13px]">
              {tag}
            </span>
          )}
          {/* Touch devices have no hover details, so short expiry stays on the image there */}
          {product.shortExpiry && (
            <span className="card-touch max-w-full truncate rounded-full bg-[#141409] px-2.5 py-1 text-[10px] font-bold leading-none text-white">
              {translate("shortExpiry")}
            </span>
          )}
        </div>
      </Link>

      {/* Favourite */}
      <button
        type="button"
        onClick={(event) => onToggleFavorite(product.product_Id, event)}
        aria-label="Toggle favorite"
        aria-pressed={isFavorite}
        className={`${isFavorite ? "" : "card-extra"} absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:scale-110 active:scale-95 sm:right-3 sm:top-3 sm:h-9 sm:w-9`}
      >
        {isFavorite ? (
          <FaHeart size={16} className="text-[#E3262F]" />
        ) : (
          <FiHeart size={16} className="text-gray-700" strokeWidth={2.2} />
        )}
      </button>

      {/*
        Name + price is all that shows at first sight. On mouse devices the details block is
        lifted out of the flow and grows upward over the image on hover, revealing brand and
        details under the title and the sale end + quick purchase by the price. An invisible
        copy of the name/price keeps the card's resting height, so the row never jumps.
      */}
      <div aria-hidden="true" className="card-info-space invisible flex-1 p-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-gray-900 sm:min-h-[42px] sm:text-[15px] sm:leading-[21px]">{name}</h3>
        <div className="pt-2.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <>
                <span className="whitespace-nowrap text-[15px] font-extrabold leading-tight text-[#E3262F] sm:text-lg">{formatMkd(salePrice)}</span>
                <span className="whitespace-nowrap text-[11px] text-gray-400 line-through sm:text-xs">{formatMkd(regularPrice)}</span>
              </>
            ) : (
              <span className="whitespace-nowrap text-[15px] font-extrabold leading-tight text-gray-900 sm:text-lg">{formatMkd(regularPrice)}</span>
            )}
          </div>
        </div>
      </div>

      <Link to={href} className="card-info flex flex-1 flex-col bg-white p-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-gray-900 sm:min-h-[42px] sm:text-[15px] sm:leading-[21px]">{name}</h3>

        <div className="card-more">
          <div>
            <span className="mt-1 block truncate text-[12px] text-gray-500">
              <span className="font-semibold uppercase tracking-[0.06em] text-gray-700">{label}</span>
              {detailsText && <> · {detailsText}</>}
            </span>
            {product.shortExpiry && (
              <span className="mt-1 block truncate text-[11px] font-semibold text-[#8a5a00]">
                {translate("shortExpiry")}
                {product.expiryDate ? ` · ${String(product.expiryDate).slice(0, 10)}` : ""}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <>
                <span className="whitespace-nowrap text-[15px] font-extrabold leading-tight text-[#E3262F] sm:text-lg">{formatMkd(salePrice)}</span>
                <span className="whitespace-nowrap text-[11px] text-gray-400 line-through sm:text-xs">{formatMkd(regularPrice)}</span>
              </>
            ) : (
              <span className="whitespace-nowrap text-[15px] font-extrabold leading-tight text-gray-900 sm:text-lg">{formatMkd(regularPrice)}</span>
            )}
          </div>

          {/* Touch devices: compact quick purchase next to the price */}
          <button
            type="button"
            onClick={quick}
            onPointerDown={intent}
            aria-label={translate("quickPurchase")}
            className="card-touch flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FDC700] text-black transition-transform duration-200 active:scale-90"
          >
            <FiShoppingBag size={15} />
          </button>
        </div>

        {saleEndDate && (
          <span className="card-touch mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#C81E27]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E3262F]" />
            {translate("saleEnds")} {saleEndDate}
          </span>
        )}

        <div className="card-more">
          <div>
            {saleEndDate && (
              <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#C81E27]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E3262F]" />
                {translate("saleEnds")} {saleEndDate}
              </span>
            )}
            <button
              type="button"
              onClick={quick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#141409] py-2.5 text-[13px] font-bold text-white transition-colors duration-300 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
            >
              <FiShoppingBag size={16} className="text-[#FDC700]" />
              {translate("quickPurchase")}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
