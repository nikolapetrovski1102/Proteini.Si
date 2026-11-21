import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { discountPercent, formatSaleEndDate, isSaleActive } from "../../utils/salePricing";
import { Starburst } from "./sections/Decor";
import { BoxIcon } from "../Components/ShopIcons";
import { referralPrice, useReferralOffer } from "../../utils/referralOffer";
import Price from "../Components/Price";
import { formatPackagingLabel } from "../../utils/unitCount";


// Clothing is listed once per product (sizes are picked on the product page), so it links to the plain product.
export const productHref = (product) =>
  product.isVariant && product.variant_Id && !product.isApparel
    ? `/product/${product.parent_Product_Id || product.product_Id}?variant=${product.variant_Id}`
    : `/product/${product.product_Id}`;

/**
 * Product card used by the home page rails and the products listing.
 *
 *  tag         – small label shown top-left (e.g. "NEW")
 *  showSaleEnd – show the "sale ends" chip under the price
 *  fluid       – fill the grid cell instead of the fixed rail width
 *  large       – wider rail card with a shorter 5:4 image (for featured rails)
 *  language    – "al" shows the Albanian name when there is one
 *  showStock   – mark sold-out products and drop quick purchase for them
 */

/** True when the listed product (or its shown packaging) has nothing left to sell. */
const isSoldOut = (product) =>
  !product.isGiftVoucher && !(Number(product.quantity) > 0);

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
  large = false,
  showStock = false,
  language,
  saleEndLocale,
}) {
  const saleActive = isSaleActive(product);
  const regularPrice = Number(product.price) || 0;
  const salePrice = saleActive ? Number(product.compare_Price) || 0 : 0;
  const hasSale = salePrice > 0 && salePrice < regularPrice;
  // The visitor's affiliate code, taken off the price they'd pay anyway (sale price included), like checkout.
  const referralOffer = useReferralOffer();
  const codePrice = referralPrice(referralOffer, {
    productId: product.parent_Product_Id || product.product_Id,
    price: hasSale ? salePrice : regularPrice,
    isGiftVoucher: product.isGiftVoucher,
  });
  const finalPrice = codePrice ?? (hasSale ? salePrice : regularPrice);
  const hasDiscount = finalPrice > 0 && finalPrice < regularPrice;
  const discount = hasDiscount ? discountPercent(regularPrice, finalPrice) : 0;
  const saleEndDate = showSaleEnd && hasSale ? formatSaleEndDate(product, saleEndLocale) : null;
  const href = productHref(product);
  const name =
    (language === "al" && product.nameAl) ||
    (language === "en" && product.nameEn) ||
    product.name;
  const soldOut = showStock && isSoldOut(product);

  // Same tub listed once per weight: show the weight under the name so the cards can be told apart.
  // Capsule products show only the pill count ("90 капсули"), not the pack weight.
  const packagingLabel =
    product.isVariant && !product.isApparel && (product.variantPackagingName || product.variantUnitCount)
      ? formatPackagingLabel(product.variantPackagingName, product, translate)
      : "";

  const details = product.isApparel
    ? [
        Number(product.packagingCount) > 1 &&
          `${product.packagingCount} ${translate("cardSizes")}`,
        Number(product.flavorCount) > 1 &&
          `${product.flavorCount} ${translate("cardColors")}`,
      ]
    : product.hasVariants
    ? [
        `${product.packagingCount || 1} ${translate(product.packagingCount === 1 ? "packing" : "packings")}`,
        Number(product.flavorCount) > 0 &&
          `${product.flavorCount} ${translate(product.flavorCount === 1 ? "taste" : "tastes")}`,
      ]
    : [
        Number(product.gPerServing) > 0 && `${product.gPerServing}g ${translate("perServing")}`,
        Number(product.servings) > 0 && `${product.servings} ${translate("servings")}`,
      ];
  // Category is only worth showing when it adds something the name and brand don't already say.
  const category = String(product.category || "").trim();
  const showCategory =
    category &&
    category.toLowerCase() !== String(product.brandName || "").trim().toLowerCase() &&
    !String(name || "").toLowerCase().includes(category.toLowerCase());
  const hoverDetails = [showCategory && category, ...details].filter(Boolean);

  // "Your price · MARKO10" under the price: plain text, so it reads as theirs without another badge.
  const codeLine = codePrice != null && (
    <span className="basis-full truncate text-[11px] font-semibold leading-4 text-[#8a5a00] sm:text-[12px]">
      {translate("referralPriceWithCode")} · {referralOffer.code}
    </span>
  );

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
      data-sold-out={soldOut || undefined}
      className={`home-card group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] ${
        fluid
          ? "w-full min-w-0"
          : large
            ? "w-[80vw] max-w-[340px] flex-shrink-0 snap-start sm:w-[380px] sm:max-w-none"
            : "w-[164px] flex-shrink-0 snap-start sm:w-[268px]"
      }`}
    >
      {/* Image */}
      <Link to={href} className={`relative block overflow-hidden ${large ? "aspect-[5/4]" : "aspect-square"} bg-gradient-to-b from-[#f8f7f4] to-[#efede7]`}>
        {/* soft yellow glow that blooms behind the product on hover */}
        <span aria-hidden="true" className="home-card-glow pointer-events-none absolute inset-0" />
        {product.img ? (
          <img
            src={String(product.img)}
            alt={name}
            loading="lazy"
            decoding="async"
            className={`home-card-img relative h-full w-full object-contain p-4 mix-blend-multiply sm:p-6 ${
              soldOut ? "opacity-45 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            {translate("noImage")}
          </div>
        )}

        {soldOut && (
          <span className="absolute bottom-2.5 left-1/2 flex max-w-[calc(100%-20px)] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#141409] px-3 py-1.5 text-[11px] font-bold leading-none text-white sm:bottom-3 sm:text-[12px]">
            <BoxIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{translate("outOfStock")}</span>
          </span>
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
            <span className="-rotate-3 rounded-md bg-[#141409] px-2 py-1 font-display text-[11px] font-semibold uppercase leading-none tracking-wide text-[#FDC700] sm:text-[13px]">
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
        lifted out of the flow and grows upward over the image on hover, revealing category and
        product details under the title and the sale end + quick purchase by the price. An invisible
        copy of the name/price keeps the card's resting height, so the row never jumps.
      */}
      <div aria-hidden="true" className="card-info-space invisible flex-1 p-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-gray-900 sm:min-h-[42px] sm:text-[15px] sm:leading-[21px]">{name}</h3>
        {packagingLabel && (
          <span className="mt-0.5 block truncate text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px]">
            {packagingLabel}
          </span>
        )}
        <div className="pt-2.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {hasDiscount ? (
              <>
                <span className="whitespace-nowrap text-[17px] font-extrabold leading-tight text-[#E3262F] sm:text-xl"><Price value={finalPrice} /></span>
                <span className="whitespace-nowrap text-xs text-gray-400 line-through sm:text-sm"><Price value={regularPrice} /></span>
              </>
            ) : (
              <span className="whitespace-nowrap text-[17px] font-extrabold leading-tight text-gray-900 sm:text-xl"><Price value={regularPrice} /></span>
            )}
            {codeLine}
          </div>
        </div>
      </div>

      <Link to={href} className="card-info flex flex-1 flex-col bg-white p-3 sm:px-4 sm:pb-4 sm:pt-3.5">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-gray-900 sm:min-h-[42px] sm:text-[15px] sm:leading-[21px]">{name}</h3>
        {packagingLabel && (
          <span className="mt-0.5 block truncate text-[12px] font-medium leading-4 text-gray-500 sm:text-[13px]">
            {packagingLabel}
          </span>
        )}

        <div className="card-more">
          <div>
            {/* The brand is already in the name, so hover reveals what the name doesn't say */}
            {hoverDetails.length > 0 && (
              <span className="mt-1 block truncate text-[12px] text-gray-500">
                {hoverDetails.join(" · ")}
              </span>
            )}
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
                <span className="whitespace-nowrap text-[17px] font-extrabold leading-tight text-[#E3262F] sm:text-xl"><Price value={finalPrice} /></span>
                <span className="whitespace-nowrap text-xs text-gray-400 line-through sm:text-sm"><Price value={regularPrice} /></span>
              </>
            ) : (
              <span className="whitespace-nowrap text-[17px] font-extrabold leading-tight text-gray-900 sm:text-xl"><Price value={regularPrice} /></span>
            )}
            {codeLine}
          </div>

          {/* Touch devices: compact quick purchase next to the price */}
          {!soldOut && (
          <button
            type="button"
            onClick={quick}
            onPointerDown={intent}
            aria-label={translate("quickPurchase")}
            className="card-touch flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FDC700] text-black transition-transform duration-200 active:scale-90"
          >
            <FiShoppingBag size={15} />
          </button>
          )}
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
            {soldOut ? (
              <span className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f4f3ef] py-2.5 text-[13px] font-bold text-gray-500">
                <BoxIcon className="h-4 w-4" />
                {translate("outOfStock")}
              </span>
            ) : (
            <button
              type="button"
              onClick={quick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#141409] py-2.5 text-[13px] font-bold text-white transition-colors duration-300 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700]"
            >
              <FiShoppingBag size={16} className="text-[#FDC700]" />
              {translate("quickPurchase")}
            </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
