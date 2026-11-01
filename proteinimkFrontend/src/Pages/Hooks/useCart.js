// src/hooks/useCart.js
import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Safely get auth context - handle case when called outside AuthProvider
  let authContext;
  let isAuthenticated = false;
  try {
    authContext = useAuth();
    isAuthenticated = authContext ? authContext.isAuthenticated() : false;
  } catch (error) {
    // If useAuth fails, we're in guest mode
    console.debug("AuthProvider not available, using guest mode for cart");
    isAuthenticated = false;
  }

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const data = await api.getCart();
        // Ensure loyaltyPercentage is included in cart items
        if (data && data.items) {
          data.items = data.items.map((item) => ({
            ...item,
            loyaltyPercentage: item.loyaltyPercentage ?? 2.0,
          }));
        }
        setCart(data);
      } else {
        const savedCart = localStorage.getItem("guestCart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Ensure loyaltyPercentage is included in guest cart items
          if (parsedCart && parsedCart.items) {
            parsedCart.items = parsedCart.items.map((item) => ({
              ...item,
              loyaltyPercentage: item.loyaltyPercentage ?? 2.0,
            }));
          }
          setCart(parsedCart);
        } else {
          setCart({ items: [], total: 0, totalItems: 0 });
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity, product = null) => {
    try {
      if (isAuthenticated) {
        // Prepare variant data if product has variant info
        const variantData = product
          ? {
              variant_Id: product.variant_Id,
              variant_Name: product.variant_Name,
              variant_Packaging: product.variant_Packaging,
              variant_Weight_Grams: product.variant_Weight_Grams,
              price: product.price,
              loyaltyPercentage: product.loyaltyPercentage ?? 2.0, // ✅ ADD THIS
            }
          : null;

        await api.addToCart(productId, quantity, variantData);
        await fetchCart();
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("guestCart") ||
            '{"items":[], "total":0, "totalItems":0}',
        );

        const variantIdToAdd = product?.variant_Id || null;
        const existingItem = guestCart.items.find(
          (item) =>
            item.product_Id === productId &&
            (item.variant_Id || null) === variantIdToAdd,
        );

        // Get loyalty percentage from product or default to 2%
        const loyaltyPercentage = product?.loyaltyPercentage ?? 2.0;

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.subtotal = existingItem.price * existingItem.quantity;
          existingItem.loyaltyPercentage = loyaltyPercentage; // ✅ UPDATE loyalty
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
            quantity: quantity,
            subtotal: (product.price || 0) * quantity,
            variant_Id: product.variant_Id || null,
            variant_Name: product.variant_Name || null,
            variant_Packaging: product.variant_Packaging || null,
            variant_Weight_Grams: product.variant_Weight_Grams || null,
            weight_Grams: product.weight_Grams || null,
            loyaltyPercentage: loyaltyPercentage, // ✅ ADD THIS
            // For variant products, store the compare price info
            variant_Compare_Price: product.variant_Compare_Price || null,
            variant_Original_Price: product.variant_Original_Price || null,
          });
        } else {
          try {
            const productData = await api.getProductById(productId);
            const productInfo = productData.product;
            const productLoyalty = productInfo?.loyaltyPercentage ?? 2.0;

            guestCart.items.push({
              cartItem_Id: Date.now(),
              product_Id: productId,
              product_Name: productInfo?.name || "Product",
              product_Img: productInfo?.img || "/placeholder-image.jpg",
              price: productInfo?.price || 0,
              quantity: quantity,
              subtotal: (productInfo?.price || 0) * quantity,
              loyaltyPercentage: productLoyalty, // ✅ ADD THIS
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
              quantity: quantity,
              subtotal: 0,
              loyaltyPercentage: 2.0, // ✅ ADD THIS
            });
          }
        }

        guestCart.totalItems = guestCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        guestCart.total = guestCart.items.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setCart(guestCart);
      }
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (isAuthenticated) {
        await api.updateCartItem(cartItemId, quantity);
        await fetchCart();
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("guestCart") ||
            '{"items":[], "total":0, "totalItems":0}',
        );
        const item = guestCart.items.find(
          (item) => item.cartItem_Id === cartItemId,
        );
        if (item) {
          item.quantity = quantity;
          item.subtotal = item.price * quantity;
          guestCart.totalItems = guestCart.items.reduce(
            (sum, i) => sum + i.quantity,
            0,
          );
          guestCart.total = guestCart.items.reduce(
            (sum, i) => sum + i.subtotal,
            0,
          );
          localStorage.setItem("guestCart", JSON.stringify(guestCart));
          setCart(guestCart);
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (isAuthenticated) {
        await api.removeFromCart(cartItemId);
        await fetchCart();
      } else {
        const guestCart = JSON.parse(
          localStorage.getItem("guestCart") ||
            '{"items":[], "total":0, "totalItems":0}',
        );
        guestCart.items = guestCart.items.filter(
          (item) => item.cartItem_Id !== cartItemId,
        );
        guestCart.totalItems = guestCart.items.reduce(
          (sum, i) => sum + i.quantity,
          0,
        );
        guestCart.total = guestCart.items.reduce(
          (sum, i) => sum + i.subtotal,
          0,
        );
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setCart(guestCart);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.clearCart();
        await fetchCart();
      } else {
        const emptyCart = { items: [], total: 0, totalItems: 0 };
        localStorage.setItem("guestCart", JSON.stringify(emptyCart));
        setCart(emptyCart);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
};
