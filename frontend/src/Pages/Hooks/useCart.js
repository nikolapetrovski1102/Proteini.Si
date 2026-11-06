// src/Pages/Hooks/useCart.js
//
// One shared cart store for the whole app. Every component that calls useCart()
// reads the same state, so the cart is fetched once (not once per component),
// in-flight requests are shared, and the header badge updates instantly after
// any add/update/remove without polling.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const GUEST_CART_KEY = "guestCart";
const DEFAULT_LOYALTY_PERCENTAGE = 2.0;
const EMPTY_CART = Object.freeze({ items: [], total: 0, totalItems: 0 });

let state = { cart: null, loading: false, mode: null };
let inflight = null; // { mode, promise }
const listeners = new Set();

const emit = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

const withLoyalty = (cart) => {
  if (!cart || !Array.isArray(cart.items)) return cart;
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      loyaltyPercentage: item.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE,
    })),
  };
};

const readGuestCart = () => {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch (error) {
    console.error("Error reading guest cart:", error);
  }
  return { items: [], total: 0, totalItems: 0 };
};

const recalculate = (cart) => {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  return cart;
};

const writeGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  emit({ cart: withLoyalty(cart), mode: "guest", loading: false });
};

/** Loads the cart for the given mode. Concurrent callers share one request. */
const loadCart = (isAuthenticated, { force = false } = {}) => {
  const mode = isAuthenticated ? "user" : "guest";

  if (!force && state.mode === mode && state.cart) {
    return Promise.resolve(state.cart);
  }
  if (inflight && inflight.mode === mode) {
    return inflight.promise;
  }

  if (mode === "guest") {
    const cart = withLoyalty(readGuestCart());
    emit({ cart, mode, loading: false });
    return Promise.resolve(cart);
  }

  // Only show a loading state when there is nothing to show yet; refetches after
  // a change keep the current cart on screen instead of flashing a spinner.
  const hasCartForMode = state.mode === mode && state.cart;
  emit({ loading: !hasCartForMode, mode, cart: hasCartForMode ? state.cart : null });

  const promise = api
    .getCart()
    .then((data) => {
      const cart = withLoyalty(data) ?? { ...EMPTY_CART };
      if (state.mode === mode) emit({ cart, loading: false });
      return cart;
    })
    .catch((error) => {
      console.error("Error fetching cart:", error);
      if (state.mode === mode) {
        emit({ loading: false, cart: state.cart ?? { ...EMPTY_CART } });
      }
      return state.cart;
    })
    .finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });

  inflight = { mode, promise };
  return promise;
};

/** Clears the locally stored guest cart and updates every subscriber. */
export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  if (state.mode === "guest") emit({ cart: { ...EMPTY_CART } });
};

// Keep tabs in sync for guest carts and allow other code to request a refresh.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === GUEST_CART_KEY && state.mode === "guest") {
      emit({ cart: withLoyalty(readGuestCart()) });
    }
  });
  window.addEventListener("cartUpdated", () => {
    if (state.mode) loadCart(state.mode === "user", { force: true });
  });
}

export const useCart = () => {
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth ? auth.isAuthenticated() : false;
  } catch {
    // Outside AuthProvider: treat as guest.
    isAuthenticated = false;
  }

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const mode = isAuthenticated ? "user" : "guest";

  useEffect(() => {
    loadCart(isAuthenticated);
  }, [isAuthenticated]);

  const refreshCart = useCallback(
    () => loadCart(isAuthenticated, { force: true }),
    [isAuthenticated],
  );

  const addToCart = useCallback(
    async (productId, quantity, product = null) => {
      try {
        if (isAuthenticated) {
          const variantData = product
            ? {
                variant_Id: product.variant_Id,
                variant_Name: product.variant_Name,
                variant_Packaging: product.variant_Packaging,
                variant_Weight_Grams: product.variant_Weight_Grams,
                price: product.price,
                loyaltyPercentage:
                  product.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE,
              }
            : null;

          await api.addToCart(productId, quantity, variantData);
          await loadCart(true, { force: true });
          return true;
        }

        const guestCart = readGuestCart();
        const variantIdToAdd = product?.variant_Id || null;
        const existingItem = guestCart.items.find(
          (item) =>
            item.product_Id === productId &&
            (item.variant_Id || null) === variantIdToAdd,
        );
        const loyaltyPercentage =
          product?.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE;

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.subtotal = existingItem.price * existingItem.quantity;
          existingItem.loyaltyPercentage = loyaltyPercentage;
          existingItem.variant_Weight_Grams =
            product?.variant_Weight_Grams ?? existingItem.variant_Weight_Grams;
          existingItem.weight_Grams =
            product?.weight_Grams ?? existingItem.weight_Grams;
        } else if (product) {
          guestCart.items.push({
            cartItem_Id: Date.now(),
            product_Id: productId,
            product_Name: product.name || product.product_Name || "Product",
            product_Img:
              product.img || product.product_Img || "/placeholder-image.jpg",
            price: product.price || 0,
            quantity,
            subtotal: (product.price || 0) * quantity,
            variant_Id: product.variant_Id || null,
            variant_Name: product.variant_Name || null,
            variant_Packaging: product.variant_Packaging || null,
            variant_Weight_Grams: product.variant_Weight_Grams || null,
            weight_Grams: product.weight_Grams || null,
            loyaltyPercentage,
            variant_Compare_Price: product.variant_Compare_Price || null,
            variant_Original_Price: product.variant_Original_Price || null,
          });
        } else {
          try {
            const productData = await api.getProductById(productId);
            const productInfo = productData.product;
            guestCart.items.push({
              cartItem_Id: Date.now(),
              product_Id: productId,
              product_Name: productInfo?.name || "Product",
              product_Img: productInfo?.img || "/placeholder-image.jpg",
              price: productInfo?.price || 0,
              quantity,
              subtotal: (productInfo?.price || 0) * quantity,
              loyaltyPercentage:
                productInfo?.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE,
              variant_Compare_Price: null,
              variant_Original_Price: null,
            });
          } catch (error) {
            console.error("Failed to fetch product details:", error);
            guestCart.items.push({
              cartItem_Id: Date.now(),
              product_Id: productId,
              product_Name: "Product",
              product_Img: "/placeholder-image.jpg",
              price: 0,
              quantity,
              subtotal: 0,
              loyaltyPercentage: DEFAULT_LOYALTY_PERCENTAGE,
            });
          }
        }

        writeGuestCart(recalculate(guestCart));
        return true;
      } catch (error) {
        console.error("Error adding to cart:", error);
        return false;
      }
    },
    [isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        if (isAuthenticated) {
          await api.updateCartItem(cartItemId, quantity);
          await loadCart(true, { force: true });
          return;
        }

        const guestCart = readGuestCart();
        const item = guestCart.items.find((i) => i.cartItem_Id === cartItemId);
        if (item) {
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
          writeGuestCart(recalculate(guestCart));
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        if (isAuthenticated) {
          await api.removeFromCart(cartItemId);
          await loadCart(true, { force: true });
          return;
        }

        const guestCart = readGuestCart();
        guestCart.items = guestCart.items.filter(
          (item) => item.cartItem_Id !== cartItemId,
        );
        writeGuestCart(recalculate(guestCart));
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await api.clearCart();
        await loadCart(true, { force: true });
      } else {
        writeGuestCart({ items: [], total: 0, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [isAuthenticated]);

  // While the store still holds the other mode's cart (e.g. right after login),
  // report nothing rather than the stale cart.
  const isCurrentMode = snapshot.mode === mode;

  return {
    cart: isCurrentMode ? snapshot.cart : null,
    loading: isCurrentMode ? snapshot.loading : true,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };
};
