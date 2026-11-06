import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoCheckmarkSharp } from "react-icons/io5";
import { api } from "../../services/api";
import { useCart } from "../Hooks/useCart";
import ProductActionModal from "../Components/ProductActionModal";
import { useLanguage } from "../translation/LanguageContext";

const formatPrice = (value) => `MKD ${Number(value || 0).toFixed(2)}`;

const ADVANTAGES = [
  ["giftWithEveryPurchase", "weAddGiftToEveryPurchase"],
  ["loyaltyPoints", "collectLPAndBuyCheaper"],
  ["secureCardPayments", "mastercardVisa"],
  ["fastDelivery", "ordersPlacedBy2PMWillBeShippedTheSameDay"],
  ["freeShipping2", "forPurchasesOver3000MKD"],
];

const pick = (product, ...keys) => {
  for (const key of keys) {
    if (product?.[key] !== undefined && product?.[key] !== null) {
      return product[key];
    }
  }
  return undefined;
};

/** Normalizes a product from the filter endpoint (either field casing). */
const normalizeProduct = (product) => {
  const productId = pick(product, "product_Id", "Product_Id");
  const parentId = pick(product, "parent_Product_Id", "Parent_Product_Id");
  const variantId = pick(product, "variant_Id", "Variant_Id");
  return {
    key: `${productId}-${variantId || "base"}`,
    link: variantId
      ? `/product/${parentId || productId}?variant=${variantId}`
      : `/product/${productId}`,
    name: pick(product, "name", "Name") || "",
    nameAl: pick(product, "nameAl", "NameAl"),
    img: pick(product, "img", "Img"),
    price: pick(product, "price", "Price") || 0,
    servings: pick(product, "servings", "Servings") || 0,
  };
};

function CartSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pt-[70px] pb-16 sm:px-6">
      <div className="mb-8 h-7 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 border-b border-gray-100 pb-4">
              <div className="h-24 w-24 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

function QuantityStepper({ quantity, onChange }) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center text-lg text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="inline-flex items-center rounded-md border border-gray-300">
      <button
        type="button"
        aria-label="-"
        className={buttonClass}
        disabled={quantity <= 1}
        onClick={() => quantity > 1 && onChange(quantity - 1)}
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="+"
        className={buttonClass}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ item, onQuantityChange, onRemove, translate }) {
  const productLink = item.variant_Id
    ? `/product/${item.product_Id}?variant=${item.variant_Id}`
    : `/product/${item.product_Id}`;
  const variantLabel = [item.variant_Name, item.variant_Packaging]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex gap-4 py-5">
      <Link
        to={productLink}
        className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white sm:h-28 sm:w-28"
      >
        <img
          src={item.product_Img}
          alt={item.product_Name}
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={productLink}
              className="line-clamp-2 text-[15px] font-semibold text-gray-900 hover:text-[#2096D8]"
            >
              {item.product_Name}
            </Link>
            {variantLabel && (
              <p className="mt-0.5 text-xs text-gray-500">{variantLabel}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              {formatPrice(item.price)}
            </p>
          </div>
          <p className="whitespace-nowrap text-[15px] font-bold text-gray-900">
            {formatPrice(item.subtotal)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            quantity={item.quantity}
            onChange={(quantity) => onQuantityChange(item.cartItem_Id, quantity)}
          />
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="text-sm font-medium text-gray-500 underline-offset-2 transition-colors hover:text-[#b3233b] hover:underline"
          >
            {translate("remove")}
          </button>
        </div>
      </div>
    </li>
  );
}

function JustForMe({ translate, language }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getFilteredProducts({
        justForMe: true,
        page: 1,
        pageSize: 4,
        sortBy: "priority",
        sortOrder: "ASC",
      })
      .then((data) => {
        if (cancelled) return;
        const list = data?.products || data?.Products || [];
        setProducts(list.map(normalizeProduct));
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
  }, []);

  if (!loading && products.length === 0) return null;

  const showAll = () => {
    window.scrollTo(0, 0);
    navigate("/all-products", {
      state: { preSelectedFilter: "justForMe", filterValue: true },
    });
  };

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">{translate("justForMe")}</h2>
        {products.length > 0 && (
          <button
            type="button"
            onClick={showAll}
            className="text-sm font-semibold text-[#2096D8] hover:underline"
          >
            {translate("viewAll")} →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100"
              />
            ))
          : products.map((product) => (
              <Link
                key={product.key}
                to={product.link}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-white">
                  <img
                    src={product.img}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800">
                    {language === "al" && product.nameAl
                      ? product.nameAl
                      : product.name}
                  </h3>
                  <p className="mt-auto text-[15px] font-bold text-[#2096D8]">
                    {formatPrice(product.price)}
                  </p>
                  {product.servings > 0 && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.servings} {translate("servings")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { translate, language } = useLanguage();
  const [itemToRemove, setItemToRemove] = useState(null);

  const goTo = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const closeModal = () => setItemToRemove(null);

  const confirmRemove = () => {
    if (itemToRemove) removeFromCart(itemToRemove.cartItem_Id);
    closeModal();
  };

  if (loading && !cart) return <CartSkeleton />;

  const items = cart?.items || [];
  const isCartEmpty = items.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pt-[70px] pb-16 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">
        {translate("shoppingCart")}{" "}
        <span className="font-normal text-gray-500">
          ({cart?.totalItems || 0})
        </span>
      </h1>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0">
          {isCartEmpty ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center">
              <p className="mb-3 text-lg font-extrabold">
                {translate("emptyCart")}
              </p>
              <p className="mb-8 max-w-[320px] text-sm leading-relaxed text-gray-600">
                {translate("emptyCartDesc")}
              </p>
              <button
                type="button"
                className="w-full max-w-[280px] rounded-md border border-black px-6 py-3 text-sm font-bold transition-colors hover:bg-black hover:text-white"
                onClick={() => goTo("/all-products")}
              >
                {translate("keepShopping")}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 border-y border-gray-100">
              {items.map((item) => (
                <CartItemRow
                  key={item.cartItem_Id}
                  item={item}
                  translate={translate}
                  onQuantityChange={updateQuantity}
                  onRemove={setItemToRemove}
                />
              ))}
            </ul>
          )}

          <JustForMe translate={translate} language={language} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32">
          {!isCartEmpty && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">{translate("subtotal")}</dt>
                  <dd className="font-semibold">{formatPrice(cart.total)}</dd>
                </div>
                <div className="flex justify-between text-gray-500">
                  <dt>{translate("shipping")}</dt>
                  <dd>{translate("calculatedAtCheckout")}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                  <dt className="font-bold">{translate("total")}</dt>
                  <dd className="font-bold text-[#2096D8]">
                    {formatPrice(cart.total)}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                className="mt-5 w-full rounded-md bg-[#8DC658] py-3 font-semibold text-white transition-colors hover:bg-[#7fb64c]"
                onClick={() => goTo("/checkout")}
              >
                {translate("proceedTocheckout")}
              </button>
              <button
                type="button"
                onClick={() => goTo("/all-products")}
                className="mt-3 w-full text-sm text-gray-500 transition-colors hover:text-black"
              >
                {translate("keepShopping")}
              </button>
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-5">
            <p className="mb-4 text-base font-bold">
              {translate("advOfShoppingOnPS")}
            </p>
            <ul className="space-y-4">
              {ADVANTAGES.map(([titleKey, descKey]) => (
                <li key={titleKey} className="flex gap-3">
                  <IoCheckmarkSharp
                    size={20}
                    className="mt-0.5 flex-shrink-0 text-[#8DC658]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {translate(titleKey)}
                    </p>
                    <p className="text-xs text-gray-600">{translate(descKey)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <ProductActionModal
        isOpen={Boolean(itemToRemove)}
        onClose={closeModal}
        product={
          itemToRemove && {
            product_Id: itemToRemove.product_Id,
            name: itemToRemove.product_Name,
            price: itemToRemove.price,
            img: itemToRemove.product_Img,
            category: itemToRemove.product_Category,
            quantity: itemToRemove.quantity,
          }
        }
        onAddToCart={closeModal}
        onRemoveFromCart={confirmRemove}
        title={translate("removeProduct")}
        addButtonText={translate("keepShopping")}
        addButtonColor="bg-[#dadada]"
        addButtonHoverColor="hover:bg-[#c0c0c0]"
        addButtonTextColor="text-black"
        removeButtonText={translate("delete")}
        removeButtonColor="bg-[#b3233b]"
        removeButtonHoverColor="hover:bg-[#8a1a2c]"
        removeButtonTextColor="text-white"
        showAddButton
        showRemoveButton
        buttonOrder="removeThenAdd"
        showQuantitySelector={false}
      />
    </div>
  );
}
