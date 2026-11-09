// src/Pages/Hooks/useCart.js
//
// One shared cart store for the whole app. Every component that calls useCart()
// reads the same state, so the cart is fetched once (not once per component),
// in-flight requests are shared, and the header badge updates instantly after
// any add/update/remove without polling.
//
// Logged-in mutations are optimistic: the cart on screen changes immediately, the
// request runs in the background, and once every pending mutation has settled the
// cart is refetched once so it matches the server (which also undoes a failed change).
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  celebrateAddToCart,
  showCartError,
  showRemovedToast,
} from "../Components/Cart/cartFeedback";

const GUEST_CART_KEY = "guestCart";
const DEFAULT_LOYALTY_PERCENTAGE = 2.0;
const EMPTY_CART = Object.freeze({ items: [], total: 0, totalItems: 0 });

let state = { cart: null, loading: false, mode: null };
let inflight = null; // { mode, gen, promise }
let pendingMutations = 0;
let mutationGen = 0; // bumped on every optimistic change; older fetches are discarded
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
  if (inflight && inflight.mode === mode && inflight.gen === mutationGen) {
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

  const gen = mutationGen;
  const isFresh = () =>
    state.mode === mode && gen === mutationGen && pendingMutations === 0;

  const promise = api
    .getCart()
    .then((data) => {
      const cart = withLoyalty(data) ?? { ...EMPTY_CART };
      // A newer optimistic change happened meanwhile; its own refetch will land later.
      if (isFresh()) emit({ cart, loading: false });
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

  inflight = { mode, gen, promise };
  return promise;
};

const cloneCart = (cart) => ({
  ...(cart || EMPTY_CART),
  items: (cart?.items || []).map((item) => ({ ...item })),
});

let tempIdSeq = 0;
const tempCartItemId = () => `tmp-${Date.now()}-${++tempIdSeq}`;

/** True for a row that exists only on screen until the server confirms it. */
export const isPendingCartItem = (item) =>
  typeof item?.cartItem_Id === "string" && item.cartItem_Id.startsWith("tmp-");

/**
 * Shows `nextCart` right away (logged-in cart), runs `request` in the background and
 * resyncs with the server once nothing else is pending. Resolves to true/false.
 */
const runUserMutation = (nextCart, request) => {
  mutationGen += 1;
  pendingMutations += 1;
  emit({ cart: withLoyalty(recalculate(nextCart)), loading: false });

  return Promise.resolve()
    .then(request)
    .then(
      () => true,
      (error) => {
        console.error("Cart request failed:", error);
        return false;
      },
    )
    .finally(() => {
      pendingMutations -= 1;
      if (pendingMutations === 0 && state.mode === "user") {
        loadCart(true, { force: true });
      }
    });
};

const variantPayload = (source) => ({
  variant_Id: source.variant_Id,
  variant_Name: source.variant_Name,
  variant_Packaging: source.variant_Packaging,
  variant_Weight_Grams: source.variant_Weight_Grams,
  price: source.price,
  loyaltyPercentage: source.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE,
});

/** Adds an item to a cart copy, merging with an existing line of the same product/variant. */
const addLine = (cart, productId, quantity, product) => {
  const variantId = product?.variant_Id || null;
  const existing = cart.items.find(
    (item) =>
      item.product_Id === productId && (item.variant_Id || null) === variantId,
  );
  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = existing.price * existing.quantity;
    return cart;
  }
  const price = Number(product?.price) || 0;
  cart.items.push({
    cartItem_Id: tempCartItemId(),
    product_Id: productId,
    product_Name: product?.name || product?.product_Name || "Product",
    product_Img: product?.img || product?.product_Img || "/placeholder-image.jpg",
    price,
    quantity,
    subtotal: price * quantity,
    variant_Id: variantId,
    variant_Name: product?.variant_Name || null,
    variant_Packaging: product?.variant_Packaging || null,
    variant_Weight_Grams: product?.variant_Weight_Grams || null,
    weight_Grams: product?.weight_Grams || null,
    loyaltyPercentage: product?.loyaltyPercentage ?? DEFAULT_LOYALTY_PERCENTAGE,
  });
  return cart;
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
          const variantData = product ? variantPayload(product) : null;

          const outcome = runUserMutation(
            addLine(cloneCart(state.cart), productId, quantity, product),
            () => api.addToCart(productId, quantity, variantData),
          );
          celebrateAddToCart({ product, quantity, outcome });
          return outcome;
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
        celebrateAddToCart({ product, quantity });
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
          const next = cloneCart(state.cart);
          const item = next.items.find((i) => i.cartItem_Id === cartItemId);
          if (!item || isPendingCartItem(item)) return;
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
          const ok = await runUserMutation(next, () =>
            api.updateCartItem(cartItemId, quantity),
          );
          if (!ok) showCartError();
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

  /** Puts a removed line back where it was (Undo). */
  const restoreItem = useCallback(
    (item, index) => {
      if (isAuthenticated) {
        const next = cloneCart(state.cart);
        const alreadyBack = next.items.some(
          (i) =>
            i.product_Id === item.product_Id &&
            (i.variant_Id || null) === (item.variant_Id || null),
        );
        if (alreadyBack) return;
        next.items.splice(Math.min(index, next.items.length), 0, {
          ...item,
          cartItem_Id: tempCartItemId(),
        });
        runUserMutation(next, () =>
          api.addToCart(item.product_Id, item.quantity, variantPayload(item)),
        ).then((ok) => !ok && showCartError());
        return;
      }

      const guestCart = readGuestCart();
      if (guestCart.items.some((i) => i.cartItem_Id === item.cartItem_Id)) return;
      guestCart.items.splice(Math.min(index, guestCart.items.length), 0, item);
      writeGuestCart(recalculate(guestCart));
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (cartItemId, { undoable = true } = {}) => {
      try {
        if (isAuthenticated) {
          const next = cloneCart(state.cart);
          const index = next.items.findIndex((i) => i.cartItem_Id === cartItemId);
          // A row still waiting for the server has no real id to delete yet.
          if (index === -1 || isPendingCartItem(next.items[index])) return;
          const [removed] = next.items.splice(index, 1);
          if (undoable) {
            showRemovedToast({ item: removed, onUndo: () => restoreItem(removed, index) });
          }
          const ok = await runUserMutation(next, () => api.removeFromCart(cartItemId));
          if (!ok) showCartError();
          return;
        }

        const guestCart = readGuestCart();
        const index = guestCart.items.findIndex((item) => item.cartItem_Id === cartItemId);
        if (index === -1) return;
        const [removed] = guestCart.items.splice(index, 1);
        writeGuestCart(recalculate(guestCart));
        if (undoable) {
          showRemovedToast({ item: removed, onUndo: () => restoreItem(removed, index) });
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    [isAuthenticated, restoreItem],
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
    restoreItem,
    clearCart,
    refreshCart,
  };
};
