import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiGift,
  FiLock,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiStar,
  FiTrash2,
  FiTruck,
  FiZap,
} from "react-icons/fi";
import { api } from "../../services/api";
import { FREE_DELIVERY_THRESHOLD } from "../../utils/deliveryPricing";
import { isPendingCartItem, useCart } from "../Hooks/useCart";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import { useLanguage } from "../translation/LanguageContext";
import HomeProductCard from "../HomePages/HomeProductCard";
import HomeProductRail from "../HomePages/HomeProductRail";
import { Sparkle, Starburst } from "../HomePages/sections/Decor";

const formatPrice = (value) => `MKD ${Number(value || 0).toFixed(2)}`;
const REMOVE_ANIMATION_MS = 200; // keep in sync with .cart-row in index.css

const ADVANTAGES = [
  [FiGift, "giftWithEveryPurchase", "weAddGiftToEveryPurchase"],
  [FiStar, "loyaltyPoints", "collectLPAndBuyCheaper"],
  [FiLock, "secureCardPayments", "mastercardVisa"],
  [FiZap, "fastDelivery", "ordersPlacedBy2PMWillBeShippedTheSameDay"],
  [FiTruck, "freeShipping2", "forPurchasesOver3000MKD"],
];

const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";

/** Free-delivery threshold from the shop settings (falls back to the default). */
function useFreeDeliveryThreshold() {
  const [threshold, setThreshold] = useState(FREE_DELIVERY_THRESHOLD);
  useEffect(() => {
    let cancelled = false;
    api
      .getShippingSettings()
      .then((settings) => {
        const value = Number(
          settings?.freeDeliveryThreshold ?? settings?.FreeDeliveryThreshold,
        );
        if (!cancelled && Number.isFinite(value) && value >= 0)
          setThreshold(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return threshold;
}

function CartSkeleton() {
  return (
    <div className="home-tint min-h-screen bg-[#f6f5f1]">
      <div className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-8 h-12 w-64 animate-pulse rounded-lg bg-black/[0.06]" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-white" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4 rounded-2xl bg-white p-4">
                <div className="h-24 w-24 animate-pulse rounded-xl bg-gray-100 sm:h-28 sm:w-28" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-100" />
                  <div className="h-10 w-32 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function FreeDeliveryProgress({ total, threshold, translate }) {
  const remaining = Math.max(0, threshold - total);
  const unlocked = remaining === 0;
  const progress =
    threshold > 0 ? Math.min(100, (total / threshold) * 100) : 100;
  const [before, after] = translate("freeDeliveryRemaining").split("{amount}");

  return (
    <div className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06] sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
            unlocked ? "bg-[#8DC658] text-white" : "bg-[#FDC700] text-[#141409]"
          }`}
        >
          {unlocked ? (
            <FiCheck size={20} strokeWidth={3} />
          ) : (
            <FiTruck size={19} />
          )}
        </span>
        <p className="text-sm font-semibold text-gray-900 sm:text-[15px]">
          {unlocked ? (
            translate("freeDeliveryUnlocked")
          ) : (
            <>
              {before}
              <span className="whitespace-nowrap font-extrabold">
                {formatPrice(remaining)}
              </span>
              {after}
            </>
          )}
        </p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-black/[0.06]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
            unlocked ? "bg-[#8DC658]" : "bg-[#FDC700]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {!unlocked && (
        <p className="mt-2 text-[11px] text-gray-500">
          {translate("freeShipping")}
        </p>
      )}
    </div>
  );
}

function QuantityStepper({ quantity, onChange, disabled = false }) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-full text-gray-800 transition duration-200 hover:bg-[#FDC700] hover:text-black active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 p-0.5">
      <button
        type="button"
        aria-label="-"
        className={buttonClass}
        disabled={disabled || quantity <= 1}
        onClick={() => quantity > 1 && onChange(quantity - 1)}
      >
        <FiMinus size={15} strokeWidth={2.5} />
      </button>
      <span className="w-8 text-center text-sm font-bold tabular-nums text-gray-900">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="+"
        className={buttonClass}
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
      >
        <FiPlus size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function CartItemRow({
  item,
  removing,
  onQuantityChange,
  onRemove,
  translate,
}) {
  const pending = isPendingCartItem(item);
  const productLink = item.variant_Id
    ? `/product/${item.product_Id}?variant=${item.variant_Id}`
    : `/product/${item.product_Id}`;
  const variantLabel = [item.variant_Name, item.variant_Packaging]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={`cart-row ${removing ? "is-removing" : ""}`}>
      <div className="pb-3">
        <div
          className={`flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.06] transition-[opacity,box-shadow] duration-300 hover:shadow-[0_18px_36px_-24px_rgba(20,20,9,0.35)] sm:gap-5 sm:p-4 ${
            pending ? "opacity-70" : ""
          }`}
        >
          <Link
            to={productLink}
            className="group relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f8f7f4] to-[#efede7] sm:h-32 sm:w-32"
          >
            <img
              src={item.product_Img}
              alt={item.product_Name}
              loading="lazy"
              className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 sm:p-3"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {item.product_Category && (
                  <p className="mb-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {item.product_Category}
                  </p>
                )}
                <Link
                  to={productLink}
                  className="line-clamp-2 text-[14px] font-semibold leading-snug text-gray-900 transition-colors hover:text-[#b08a00] sm:text-[16px]"
                >
                  {item.product_Name}
                </Link>
                {variantLabel && (
                  <span className="mt-1.5 inline-block max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                    {variantLabel}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => onRemove(item)}
                aria-label={translate("remove")}
                title={translate("remove")}
                className="-mr-1 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition duration-200 hover:bg-red-50 hover:text-[#E3262F] active:scale-90 disabled:opacity-40"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
              <QuantityStepper
                quantity={item.quantity}
                disabled={pending}
                onChange={(quantity) =>
                  onQuantityChange(item.cartItem_Id, quantity)
                }
              />
              <div className="text-right">
                {item.quantity > 1 && (
                  <p className="text-[11px] text-gray-500 tabular-nums">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                )}
                <p className="whitespace-nowrap text-[15px] font-extrabold tabular-nums text-gray-900 sm:text-lg">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyCart({ translate, onShop }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#FDC700] px-6 py-14 text-center sm:py-20">
      <Sparkle
        color="#141409"
        className="absolute left-[8%] top-[14%] h-7 w-7 rotate-12"
      />
      <Sparkle
        color="#ffffff"
        className="absolute bottom-[16%] left-[14%] h-5 w-5"
      />
      <Sparkle
        color="#E3262F"
        className="absolute right-[10%] top-[20%] h-9 w-9"
      />
      <Sparkle
        color="#141409"
        className="absolute bottom-[12%] right-[16%] h-4 w-4"
      />

      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#141409] text-[#FDC700] shadow-[4px_4px_0_rgba(20,20,9,0.18)]">
        <FiShoppingBag size={34} />
      </div>
      <p className="relative mb-3 font-display text-3xl font-bold uppercase leading-[0.95] tracking-tight text-[#141409] sm:text-4xl">
        {translate("emptyCart")}
      </p>
      <p className="relative mx-auto mb-8 max-w-[360px] text-sm leading-relaxed text-[#141409]/75">
        {translate("emptyCartDesc")}
      </p>
      <button
        type="button"
        onClick={onShop}
        className="group relative inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#141409] px-7 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {translate("keepShopping")}
        <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function OrderSummary({ cart, deliveryFree, translate, onCheckout, onShop }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-32px_rgba(20,20,9,0.4)] sm:p-6">
      <h2 className={`${headingClass} mb-5 text-2xl`}>
        {translate("orderSummary")}
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">
            {translate("subtotal")}{" "}
            <span className="text-gray-500">
              ({cart.totalItems} {translate("cartItemsCount")})
            </span>
          </dt>
          <dd className="font-semibold tabular-nums text-gray-900">
            {formatPrice(cart.total)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">{translate("shipping")}</dt>
          <dd
            className={
              deliveryFree
                ? "font-bold text-[#5f9a2c]"
                : "text-right text-gray-500"
            }
          >
            {deliveryFree
              ? translate("freeLabel")
              : translate("calculatedAtCheckout")}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-gray-300 pt-4">
          <dt className="font-display text-lg font-bold uppercase tracking-tight text-gray-900">
            {translate("total")}
          </dt>
          <dd className="text-2xl font-extrabold tabular-nums text-gray-900">
            {formatPrice(cart.total)}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onCheckout}
        className="group mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#141409] text-[15px] font-bold text-white transition duration-300 hover:bg-black hover:shadow-[0_12px_24px_-12px_rgba(20,20,9,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] active:scale-[0.98]"
      >
        {translate("proceedTocheckout")}
        <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-1" />
      </button>
      <button
        type="button"
        onClick={onShop}
        className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-full text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {translate("keepShopping")}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <FiLock size={12} />
        {translate("securePaymentNote")}
      </p>
    </div>
  );
}

function Advantages({ translate }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#141409] p-5 text-white sm:p-6">
      <Sparkle
        color="#FDC700"
        className="absolute right-5 top-5 h-6 w-6 opacity-90"
      />
      <p className="mb-5 max-w-[85%] font-display text-xl font-bold uppercase leading-[1] tracking-tight">
        {translate("advOfShoppingOnPS")}
      </p>
      <ul className="space-y-4">
        {ADVANTAGES.map((advantage) => {
          const [Icon, titleKey, descKey] = advantage;
          return (
            <li key={titleKey} className="flex gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
                <Icon size={16} />
              </span>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-white">
                  {translate(titleKey)}
                </p>
                <p className="text-xs leading-relaxed text-white/60">
                  {translate(descKey)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function JustForMe({ translate, language }) {
  const navigate = useNavigate();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } =
    useQuickPurchase();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const isAuthenticated = api.isAuthenticated();

  useEffect(() => {
    let cancelled = false;
    api
      .getFilteredProducts({
        justForMe: true,
        page: 1,
        pageSize: 10,
        sortBy: "priority",
        sortOrder: "ASC",
      })
      .then(async (data) => {
        if (cancelled) return;
        const list = data?.products || data?.Products || [];
        setProducts(list);
        if (!isAuthenticated || list.length === 0) return;
        const ids = [...new Set(list.map((product) => product.product_Id))];
        const results = await Promise.all(
          ids.map((id) =>
            api
              .isFavorite(id)
              .then((response) => [id, Boolean(response?.isFavorite)])
              .catch(() => [id, false]),
          ),
        );
        if (!cancelled) setFavorites(Object.fromEntries(results));
      })
      .catch((error) => {
        console.error("Error fetching Just for Me products:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const toggleFavorite = async (productId, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const response = await api.toggleFavorite(productId);
      if (response.success) {
        setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (!loading && products.length === 0) return null;

  const showAll = () => {
    window.scrollTo(0, 0);
    navigate("/all-products", {
      state: { preSelectedFilter: "justForMe", filterValue: true },
    });
  };

  return (
    <section className="mt-12 sm:mt-16">
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
        <h2 className={`${headingClass} text-[30px] sm:text-5xl`}>
          {translate("justForMe")}
        </h2>
        {products.length > 0 && (
          <button
            type="button"
            onClick={showAll}
            className="group flex min-h-[40px] flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white/70 px-4 text-[12px] font-bold text-gray-800 transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] sm:text-[13px]"
          >
            {translate("showAll")}
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 pb-8 pt-2 sm:-mx-2 sm:gap-5 sm:px-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] w-[164px] flex-shrink-0 animate-pulse rounded-2xl bg-white sm:w-[268px]"
            />
          ))}
        </div>
      ) : (
        <HomeProductRail label="just for me">
          {products.map((product) => (
            <HomeProductCard
              key={`${product.product_Id}-${product.variant_Id || "base"}`}
              product={product}
              onQuickPurchase={() => quickPurchase(product)}
              onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites[product.product_Id] || false}
              translate={translate}
              language={language}
            />
          ))}
        </HomeProductRail>
      )}

      {quickPurchaseSheet}
    </section>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { translate, language } = useLanguage();
  const threshold = useFreeDeliveryThreshold();
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const removeTimers = useRef([]);

  useEffect(() => () => removeTimers.current.forEach(clearTimeout), []);

  // Collapse the row first, then drop it from the cart (an Undo toast follows).
  const handleRemove = useCallback(
    (item) => {
      const id = item.cartItem_Id;
      setRemovingIds((current) => new Set(current).add(id));
      const timer = setTimeout(() => {
        removeFromCart(id);
        setRemovingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }, REMOVE_ANIMATION_MS);
      removeTimers.current.push(timer);
    },
    [removeFromCart],
  );

  const goTo = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  if (loading && !cart) return <CartSkeleton />;

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;
  const total = Number(cart?.total) || 0;
  const deliveryFree = total >= threshold;

  return (
    <div
      className={`home-tint relative min-h-screen bg-[#f6f5f1] ${isCartEmpty ? "" : "max-lg:pb-24"}`}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-6 flex items-center gap-4 sm:mb-10">
          <h1 className={`${headingClass} text-[40px] sm:text-6xl`}>
            {translate("shoppingCart")}
          </h1>
          {!isCartEmpty && (
            <Starburst
              color="#FDC700"
              textColor="#141409"
              rotate={-10}
              className="h-12 w-12 flex-shrink-0 text-lg sm:h-16 sm:w-16 sm:text-2xl"
              aria-label={`${cart.totalItems} ${translate("cartItemsCount")}`}
            >
              {cart.totalItems}
            </Starburst>
          )}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <div className="min-w-0">
            {isCartEmpty ? (
              <EmptyCart
                translate={translate}
                onShop={() => goTo("/all-products")}
              />
            ) : (
              <>
                <FreeDeliveryProgress
                  total={total}
                  threshold={threshold}
                  translate={translate}
                />
                <ul>
                  {items.map((item) => (
                    <CartItemRow
                      key={item.cartItem_Id}
                      item={item}
                      translate={translate}
                      removing={removingIds.has(item.cartItem_Id)}
                      onQuantityChange={updateQuantity}
                      onRemove={handleRemove}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            {!isCartEmpty && (
              <OrderSummary
                cart={cart}
                deliveryFree={deliveryFree}
                translate={translate}
                onCheckout={() => goTo("/checkout")}
                onShop={() => goTo("/all-products")}
              />
            )}
            <Advantages translate={translate} />
          </aside>
        </div>

        <JustForMe translate={translate} language={language} />
      </div>

      {/* Phones/tablets: total + checkout always within thumb reach, above the tab bar */}
      {!isCartEmpty && (
        <div className="fixed inset-x-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-12px_24px_-18px_rgba(20,20,9,0.35)] backdrop-blur lg:hidden bottom-[var(--bottom-nav-h,0px)]">
          <div className="mx-auto flex max-w-[640px] items-center gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                {translate("total")}
              </p>
              <p className="whitespace-nowrap text-lg font-extrabold tabular-nums text-gray-900">
                {formatPrice(total)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo("/checkout")}
              className="group ml-auto flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#141409] px-5 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <span className="truncate">{translate("proceedTocheckout")}</span>
              <FiArrowRight className="flex-shrink-0 text-[#FDC700]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
