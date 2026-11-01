// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// Dapper's dynamic rows keep SQL column names (for example `FreeGiftId`),
// while the React application consistently uses camelCase (`freeGiftId`).
// Normalize those records at the API boundary so existing promotions and gifts
// can be selected, edited, and deleted reliably.
const normalizeDynamicRecord = (record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return record;
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key ? `${key.charAt(0).toLowerCase()}${key.slice(1)}` : key,
      value,
    ]),
  );
};

const normalizeDynamicRows = (rows) =>
  Array.isArray(rows) ? rows.map(normalizeDynamicRecord) : rows;

export const api = {
  // src/services/api.js
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/User/Register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.title || "Registration failed");
      }

      // Store token if returned
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Store user data if returned from registration
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else if (data.token) {
        try {
          await this.fetchCurrentUser();
        } catch (err) {
          console.warn("Could not fetch user after registration:", err);
        }
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/User/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.title || "Login failed");
      }

      // Store token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Store user data if returned
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else if (data.status && data.token) {
        // If user data not returned in login response, fetch it
        await api.fetchCurrentUser();
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Add this new method to fetch current user
  async fetchCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/User/Current`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();

        // Store the COMPLETE user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        return userData;
      } else {
        console.error("Failed to fetch user, status:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken() {
    const token = localStorage.getItem("token");
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  },

  async post(endpoint, data) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if response is HTML (cPay form)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      return html; // Return HTML string directly for cPay
    }

    // Otherwise parse as JSON
    const result = await response.json();
    return result;
  },

  async get(endpoint) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  getUser() {
    const user = localStorage.getItem("user");
    if (user && user !== "undefined" && user !== "null") {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser;
      } catch (e) {
        console.error("Error parsing user:", e);
        return null;
      }
    }
    return null;
  },

  // Products endpoints
  async getProducts() {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/Products/GetAllProducts`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return await response.json();
  },

  // Add this to your api.js

  async uploadProductImage(productId, imageFile) {
    const token = this.getToken();
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(
      `${API_BASE_URL}/admin/Products/UploadProductImage/${productId}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    // Return the image path from response
    return data.imagePath;
  },
  // api.js - Update addProduct and updateProduct methods
  async addProduct(productData, imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();

      // Append each field individually to FormData
      Object.keys(productData).forEach((key) => {
        if (productData[key] === null || productData[key] === undefined) {
          return;
        }
        if (key === "mainDescriptions") {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          // Handle arrays (categoryIds, sportIds, etc.)
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      // Ensure ddvPercentage is sent as a number
      if (productData.ddvPercentage !== undefined) {
        formData.set("ddvPercentage", productData.ddvPercentage.toString());
      }

      if (imageFile) {
        formData.append("Image", imageFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/Products/AddProduct`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Server response:", data);
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
            .join("; ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(data.error || data.title || "Failed to add product");
      }

      return data;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  async updateProduct(id, productData, imageFile, removeImage = false) {
    try {
      const token = this.getToken();
      const formData = new FormData();

      // Send productData as JSON string
      formData.append("productData", JSON.stringify(productData));

      // Append image if exists
      if (imageFile) {
        formData.append("Image", imageFile);
      }

      // Append flag if image should be removed
      if (removeImage) {
        formData.append("RemoveImage", "true");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/Products/EditProduct/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Server response:", data);
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
            .join("; ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(
          data.error || data.message || "Failed to update product",
        );
      }

      return data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },
  async deleteProduct(id) {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/admin/Products/DeleteProduct/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete product");
    }

    return data;
  },

  async getFilterOptions() {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/Products/GetFilterOptions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filter options");
      }

      return await response.json();
    } catch (error) {
      console.error("Get filter options error:", error);
      throw error;
    }
  },
  async getProductById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Products/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product");
      }

      return await response.json();
    } catch (error) {
      console.error("Get product by id error:", error);
      throw error;
    }
  },

  // Get filtered products based on selected filters (POST request)
  async getFilteredProducts(filters) {
    try {
      const token = this.getToken();

      // Clean the filters here
      const cleanedFilters = {
        categoryIds: filters.categoryIds?.filter((id) => id > 0) || [],
        sportIds: filters.sportIds?.filter((id) => id > 0) || [],
        goalIds: filters.goalIds?.filter((id) => id > 0) || [],
        useTimingIds: filters.useTimingIds?.filter((id) => id > 0) || [],
        flavorIds: filters.flavorIds?.filter((id) => id > 0) || [],
        brandIds: filters.brandIds?.filter((id) => id > 0) || [],
        tagIds: filters.tagIds?.filter((id) => id > 0) || [],
        minPrice: filters.minPrice > 0 ? filters.minPrice : null,
        maxPrice: filters.maxPrice > 0 ? filters.maxPrice : null,
        inStock: filters.inStock || false,
        onSale: filters.onSale || false,
        newProducts: filters.newProducts || false,
        outlet: filters.outlet || false,
        upcomingPromotions: filters.upcomingPromotions || false,
        giftVouchers: filters.giftVouchers || false,
        searchTerm:
          filters.searchTerm && filters.searchTerm !== "string"
            ? filters.searchTerm
            : "",
        page: filters.page > 0 ? filters.page : 1,
        pageSize: filters.pageSize > 0 ? filters.pageSize : 20,
        sortBy:
          filters.sortBy && filters.sortBy !== "string"
            ? filters.sortBy
            : "createdAt",
        sortOrder:
          filters.sortOrder && filters.sortOrder !== "string"
            ? filters.sortOrder
            : "DESC",
      };

      const response = await fetch(
        `${API_BASE_URL}/admin/Products/GetFilteredProducts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedFilters),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.title ||
            "Failed to fetch filtered products",
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Get filtered products error:", error);
      throw error;
    }
  },

  async getCart() {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/Cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    return await response.json();
  },

  async getActivePromotions(subtotal = 0) {
    const response = await fetch(
      `${API_BASE_URL}/Promotions/active?subtotal=${encodeURIComponent(subtotal)}`,
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load promotions");
    }
    return {
      ...data,
      promoCodes: normalizeDynamicRows(data.promoCodes),
      freeGifts: normalizeDynamicRows(data.freeGifts),
    };
  },

  async validatePromotionCode(code, subtotal, customerEmail = null) {
    const response = await fetch(`${API_BASE_URL}/Promotions/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal, customerEmail }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid promotion code");
    }
    return data;
  },

  async getShippingSettings() {
    const response = await fetch(`${API_BASE_URL}/CommerceSettings/shipping`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load shipping settings");
    return normalizeDynamicRecord(data.data || data);
  },

  async resolveCategorySlug(slug) {
    const response = await fetch(
      `${API_BASE_URL}/admin/taxonomy/category-slug/${encodeURIComponent(slug)}`,
    );
    if (response.status === 404) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to resolve category URL");
    return normalizeDynamicRecord(data);
  },

  async updateShippingSettings(settings) {
    return this.requestPromotionAdmin(
      "/CommerceSettings/shipping",
      "PUT",
      settings,
    );
  },

  async validateGiftVoucher(code, orderAmount) {
    const response = await fetch(`${API_BASE_URL}/GiftVouchers/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, orderAmount }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Invalid gift voucher");
    return normalizeDynamicRecord(data);
  },

  async getAdminGiftVouchers(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") query.set(key, value);
    });
    const response = await fetch(`${API_BASE_URL}/GiftVouchers/admin?${query}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load gift vouchers");
    return { ...data, data: normalizeDynamicRows(data.data) };
  },

  async updateAdminGiftVoucher(id, update) {
    return this.requestPromotionAdmin(
      `/GiftVouchers/admin/${id}/status`,
      "PUT",
      update,
    );
  },

  async downloadGiftVoucherReport() {
    const response = await fetch(`${API_BASE_URL}/GiftVouchers/admin/report.csv`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    if (!response.ok) throw new Error("Failed to export gift voucher report");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gift-vouchers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async getAdminPromotionCodes() {
    return this.requestPromotionAdmin("/Promotions/admin/codes");
  },

  async saveAdminPromotionCode(code, id = null) {
    return this.requestPromotionAdmin(
      id ? `/Promotions/admin/codes/${id}` : "/Promotions/admin/codes",
      id ? "PUT" : "POST",
      code,
    );
  },

  async disableAdminPromotionCode(id) {
    return this.requestPromotionAdmin(
      `/Promotions/admin/codes/${id}`,
      "DELETE",
    );
  },

  async getAdminFreeGifts() {
    return this.requestPromotionAdmin("/Promotions/admin/free-gifts");
  },

  async saveAdminFreeGift(gift, id = null) {
    return this.requestPromotionAdmin(
      id ? `/Promotions/admin/free-gifts/${id}` : "/Promotions/admin/free-gifts",
      id ? "PUT" : "POST",
      gift,
    );
  },

  async disableAdminFreeGift(id) {
    return this.requestPromotionAdmin(
      `/Promotions/admin/free-gifts/${id}`,
      "DELETE",
    );
  },

  async getPromotionUsageReport(from = "", to = "") {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    return this.requestPromotionAdmin(
      `/Promotions/admin/report?${query.toString()}`,
    );
  },

  async downloadPromotionUsageReport(from = "", to = "") {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const response = await fetch(
      `${API_BASE_URL}/Promotions/admin/report.csv?${query.toString()}`,
      { headers: { Authorization: `Bearer ${this.getToken()}` } },
    );
    if (!response.ok) throw new Error("Failed to export promotion report");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promo-code-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async requestPromotionAdmin(endpoint, method = "GET", body = null) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Promotion administration request failed");
    }
    return normalizeDynamicRows(data);
  },

  async addToCart(productId, quantity, variantData = null) {
    const token = this.getToken();

    const requestBody = {
      product_Id: productId,
      quantity: quantity,
    };

    if (variantData) {
      requestBody.variant_Id = variantData.variant_Id;
      requestBody.variant_Name = variantData.variant_Name;
      requestBody.variant_Packaging = variantData.variant_Packaging;
      requestBody.price = variantData.price;
      requestBody.loyaltyPercentage = variantData.loyaltyPercentage ?? 2.0; // ✅ ADD THIS
    }

    const response = await fetch(`${API_BASE_URL}/Cart/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to add to cart");
    }

    return data;
  },

  async updateCartItem(cartItemId, quantity) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/Cart/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItem_Id: cartItemId, quantity: quantity }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to update cart");
    }

    return data;
  },

  async removeFromCart(cartItemId) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/Cart/remove/${cartItemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to remove from cart");
    }

    return data;
  },

  async clearCart() {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/Cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to clear cart");
    }

    return data;
  },
  // In api.js
  // Add this to your api.js
  async updateBillingInfo(billingData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/User/UpdateBillingInfo`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update billing information");
      }

      // Update stored user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Update billing info error:", error);
      throw error;
    }
  },
  // Add to api.js

  // Order endpoints
  async createOrder(orderData) {
    try {
      const response = await this.post("/order/create", orderData);

      // Check if response is HTML (cPay form)
      if (
        typeof response === "string" &&
        response.trim().startsWith("<!DOCTYPE")
      ) {
        return response; // Return the HTML string directly
      }

      // If response has a data property, return it, otherwise return the response itself
      // This handles both { status: true, data: {...} } and direct responses
      if (response && response.data) {
        return response.data;
      }

      // If response has status property directly (like for home_delivery)
      if (response && response.status !== undefined) {
        return response;
      }

      // Fallback: return the response as-is
      return response;
    } catch (error) {
      // Check if error response contains HTML (cPay form)
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data === "string" &&
        error.response.data.trim().startsWith("<!DOCTYPE")
      ) {
        return error.response.data;
      }
      console.error("Create order error:", error);
      throw error;
    }
  },

  async getOrderConfirmation(orderId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/Order/Confirmation/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get order confirmation");
      }

      return data;
    } catch (error) {
      console.error("Get order confirmation error:", error);
      throw error;
    }
  },

  async getOrderHistory() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Order/History`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get order history");
      }

      return data;
    } catch (error) {
      console.error("Get order history error:", error);
      throw error;
    }
  },

  // Delivery address endpoints
  async getDeliveryAddress() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/User/DeliveryAddress`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get delivery address");
      }

      return data;
    } catch (error) {
      console.error("Get delivery address error:", error);
      throw error;
    }
  },

  async saveDeliveryAddress(addressData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/User/DeliveryAddress`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save delivery address");
      }

      return data;
    } catch (error) {
      console.error("Save delivery address error:", error);
      throw error;
    }
  },

  async deleteDeliveryAddress() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/User/DeliveryAddress`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete delivery address");
      }

      return data;
    } catch (error) {
      console.error("Delete delivery address error:", error);
      throw error;
    }
  },
  async cancelOrder(orderId) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Order/Cancel/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      return data;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  },

  // Check if order can be cancelled
  async canCancelOrder(orderId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/Order/CanCancel/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check cancellation status");
      }

      return data;
    } catch (error) {
      console.error("Check cancellation error:", error);
      throw error;
    }
  },
  // Add to api.js
  async forgotPassword(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/User/ForgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      // The backend returns the object directly, not wrapped in a data property
      return responseData;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  async resetPassword(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/User/ResetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to reset password");
      }

      return responseData;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },
  // Search products with filters
  async searchProducts(searchParams) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Products/Search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search products");
      }

      return await response.json();
    } catch (error) {
      console.error("Search products error:", error);
      throw error;
    }
  },

  // Quick search (simple search term)
  async quickSearch(searchTerm) {
    return this.searchProducts({
      searchTerm: searchTerm,
      page: 1,
      pageSize: 20,
      sortBy: "Name",
      sortOrder: "ASC",
    });
  },

  // Get product gallery
  async getProductGallery(productId) {
    try {
      const token = this.getToken();

      if (!token) {
        console.error("No token found");
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/Products/${productId}/gallery`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch gallery");
      }

      // The API returns the array directly, not wrapped in a data property
      // So return data directly (it's already an array)
      return data;
    } catch (error) {
      console.error("Get gallery error:", error);
      return [];
    }
  },

  // Upload gallery image
  async uploadGalleryImage(productId, imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Product_Id", productId);
      formData.append("Image", imageFile);

      const response = await fetch(
        `${API_BASE_URL}/admin/Products/gallery/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload gallery image");
      }
      return data;
    } catch (error) {
      console.error("Upload gallery error:", error);
      throw error;
    }
  },

  // Delete gallery image
  async deleteGalleryImage(galleryId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/Products/gallery/${galleryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete gallery image");
      }
      return data;
    } catch (error) {
      console.error("Delete gallery error:", error);
      throw error;
    }
  },

  // Set image as main product image
  async setMainGalleryImage(productId, galleryId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/Products/gallery/set-main`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_Id: productId,
            gallery_Id: galleryId,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to set main image");
      }
      return data;
    } catch (error) {
      console.error("Set main image error:", error);
      throw error;
    }
  },
  // ============= PACKAGING ENDPOINTS =============
  async getPackaging() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Packaging`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch packaging");
      }
      return data;
    } catch (error) {
      console.error("Get packaging error:", error);
      throw error;
    }
  },

  async createPackaging(packagingData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Packaging`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packagingData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create packaging");
      }
      return data;
    } catch (error) {
      console.error("Create packaging error:", error);
      throw error;
    }
  },

  async updatePackaging(packagingData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Packaging`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packagingData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update packaging");
      }
      return data;
    } catch (error) {
      console.error("Update packaging error:", error);
      throw error;
    }
  },

  async deletePackaging(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/Packaging/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete packaging");
      }
      return data;
    } catch (error) {
      console.error("Delete packaging error:", error);
      throw error;
    }
  },

  // ============= PRODUCT VARIANT ENDPOINTS =============
  async getProductVariants(productId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/product/${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch variants");
      }
      return data;
    } catch (error) {
      console.error("Get variants error:", error);
      return { data: [] };
    }
  },

  async createVariant(variantData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/ProductVariant`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variantData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create variant");
      }
      return data;
    } catch (error) {
      console.error("Create variant error:", error);
      throw error;
    }
  },

  async updateVariant(variantData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/ProductVariant`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variantData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update variant");
      }
      return data;
    } catch (error) {
      console.error("Update variant error:", error);
      throw error;
    }
  },

  async deleteVariant(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete variant");
      }
      return data;
    } catch (error) {
      console.error("Delete variant error:", error);
      throw error;
    }
  },

  async bulkCreateVariants(bulkData) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/bulk-create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bulkData),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to bulk create variants");
      }
      return data;
    } catch (error) {
      console.error("Bulk create variants error:", error);
      throw error;
    }
  },
  // Upload variant image
  async uploadVariantImage(formData) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload variant image");
      }
      return data;
    } catch (error) {
      console.error("Upload variant image error:", error);
      throw error;
    }
  },

  // ============= VARIANT GALLERY ENDPOINTS =============
  async getVariantGallery(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/gallery`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variant gallery");
      }

      return await response.json();
    } catch (error) {
      console.error("Get variant gallery error:", error);
      return [];
    }
  },

  async uploadVariantGalleryImage(formData) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/gallery/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload gallery image");
      }
      return data;
    } catch (error) {
      console.error("Upload variant gallery error:", error);
      throw error;
    }
  },

  async deleteVariantGalleryImage(galleryId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/gallery/${galleryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete gallery image");
      }
      return data;
    } catch (error) {
      console.error("Delete variant gallery error:", error);
      throw error;
    }
  },

  async setMainVariantGalleryImage(variantId, galleryId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/gallery/set-main`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variant_Id: variantId,
            gallery_Id: galleryId,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to set main image");
      }
      return data;
    } catch (error) {
      console.error("Set main variant gallery error:", error);
      throw error;
    }
  },
  // ============= VARIANT GALLERY ENDPOINTS =============
  async getVariantGallery(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/gallery`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variant gallery");
      }

      return await response.json();
    } catch (error) {
      console.error("Get variant gallery error:", error);
      return [];
    }
  },
  // ============= FAVORITE PRODUCTS ENDPOINTS =============

  // Add product to favorites
  async addToFavorites(productId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("You must be logged in to add favorites");
      }

      const response = await fetch(
        `${API_BASE_URL}/Favorite/add/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to favorites");
      }

      return data;
    } catch (error) {
      console.error("Add to favorites error:", error);
      throw error;
    }
  },

  // Remove product from favorites
  async removeFromFavorites(productId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("You must be logged in to remove favorites");
      }

      const response = await fetch(
        `${API_BASE_URL}/Favorite/remove/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from favorites");
      }

      return data;
    } catch (error) {
      console.error("Remove from favorites error:", error);
      throw error;
    }
  },

  // Get user's favorite products
  async getFavorites() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, data: [], totalCount: 0 };
      }

      const response = await fetch(`${API_BASE_URL}/Favorite/my-favorites`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get favorites");
      }

      return data;
    } catch (error) {
      console.error("Get favorites error:", error);
      return { success: false, data: [], totalCount: 0 };
    }
  },

  // Check if product is favorited
  async isFavorite(productId) {
    try {
      const token = this.getToken();
      if (!token) {
        return { isFavorite: false };
      }

      const response = await fetch(
        `${API_BASE_URL}/Favorite/check/${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check favorite status");
      }

      return data;
    } catch (error) {
      console.error("Check favorite error:", error);
      return { isFavorite: false };
    }
  },

  // Get favorite count for a product (public - no auth needed)
  async getFavoriteCount(productId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Favorite/count/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get favorite count");
      }

      return data;
    } catch (error) {
      console.error("Get favorite count error:", error);
      return { favoriteCount: 0 };
    }
  },

  // Toggle favorite (add if not favorited, remove if favorited)
  async toggleFavorite(productId) {
    try {
      const isFav = await this.isFavorite(productId);

      if (isFav.isFavorite) {
        return await this.removeFromFavorites(productId);
      } else {
        return await this.addToFavorites(productId);
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      throw error;
    }
  },
  // Add this to your api.js file (around line 500-600, with other methods)

  // Update payment status (for manual confirmation)
  async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/Order/UpdatePaymentStatus`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Order_Id: orderId,
            Payment_Status: paymentStatus,
            Transaction_Id: transactionId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment status");
      }

      return data;
    } catch (error) {
      console.error("Update payment status error:", error);
      throw error;
    }
  },

  async getAdminOrders(params = {}) {
    try {
      const token = this.getToken();
      const query = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/Order/Admin?${query.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin orders");
      }

      return data;
    } catch (error) {
      console.error("Get admin orders error:", error);
      throw error;
    }
  },

  async downloadAdminOrders(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (
        !["page", "pageSize"].includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, value);
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/Order/Admin/Export.csv?${query.toString()}`,
      { headers: { Authorization: `Bearer ${this.getToken()}` } },
    );
    if (!response.ok) {
      let message = "Failed to export orders";
      try {
        const data = await response.json();
        message = data.message || message;
      } catch {
        // The server can return a plain-text proxy error.
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proteini-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async updateAdminOrderStatus(orderData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Order/Admin/Status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      return data;
    } catch (error) {
      console.error("Update admin order status error:", error);
      throw error;
    }
  },

  async downloadAdminOrderDocument(orderId, orderNumber = orderId) {
    const response = await fetch(`${API_BASE_URL}/Order/Admin/${orderId}/document`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    if (!response.ok) throw new Error("Order document is not available");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-${orderNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async getAdminOrderDetails(orderId) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Order/Admin/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin order details");
      }

      return data;
    } catch (error) {
      console.error("Get admin order details error:", error);
      throw error;
    }
  },

  // ============= LOYALTY POINTS ENDPOINTS =============

  // Get user's loyalty points summary
  async getLoyaltySummary() {
    try {
      const token = this.getToken();
      if (!token) {
        return { status: false, data: { totalPoints: 0, availablePoints: 0 } };
      }

      const response = await fetch(`${API_BASE_URL}/Loyalty/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get loyalty summary");
      }

      return data;
    } catch (error) {
      console.error("Get loyalty summary error:", error);
      return { status: false, data: { totalPoints: 0, availablePoints: 0 } };
    }
  },

  // Get user's loyalty points history
  async getLoyaltyHistory(page = 1, pageSize = 20) {
    try {
      const token = this.getToken();
      if (!token) {
        return { status: false, data: [] };
      }

      const response = await fetch(
        `${API_BASE_URL}/Loyalty/history?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get loyalty history");
      }

      return data;
    } catch (error) {
      console.error("Get loyalty history error:", error);
      return { status: false, data: [] };
    }
  },

  // Get available loyalty points
  async getAvailableLoyaltyPoints() {
    try {
      const token = this.getToken();
      if (!token) {
        return { status: false, availablePoints: 0 };
      }

      const response = await fetch(`${API_BASE_URL}/Loyalty/available`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get available points");
      }

      return data;
    } catch (error) {
      console.error("Get available points error:", error);
      return { status: false, availablePoints: 0 };
    }
  },

  // ============= VARIANT NUTRITION TABLE ENDPOINTS (SIMPLIFIED JSON VERSION) =============
  // This replaces the old complex row/column/value system with simple JSON storage

  // Paste and save nutrition table directly as JSON
  async pasteVariantNutritionTable(variantId, rawText) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/nutrition-table/paste`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rawText: rawText }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to parse and save nutrition table",
        );
      }

      return data;
    } catch (error) {
      console.error("Paste nutrition table error:", error);
      throw error;
    }
  },

  // Get nutrition table as JSON
  async getVariantNutritionTable(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/nutrition-table`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch nutrition table");
      }

      return data;
    } catch (error) {
      console.error("Get nutrition table error:", error);
      return { status: true, data: null };
    }
  },

  // Update nutrition table (full replace)
  async updateVariantNutritionTable(variantId, tableData) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/nutrition-table`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tableData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update nutrition table");
      }

      return data;
    } catch (error) {
      console.error("Update nutrition table error:", error);
      throw error;
    }
  },

  // Delete nutrition table
  async deleteVariantNutritionTable(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/nutrition-table`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete nutrition table");
      }

      return data;
    } catch (error) {
      console.error("Delete nutrition table error:", error);
      throw error;
    }
  },

  // Optional: Convert old nutrition data to new JSON format (migration helper)
  async migrateOldNutritionToJson(variantId) {
    try {
      // First get the old format data
      const oldData = await this.getVariantNutrition(variantId);

      if (!oldData.columns || !oldData.rows || oldData.columns.length === 0) {
        return { status: true, message: "No old data to migrate" };
      }

      // Convert to new format
      const newTableData = {
        columns: oldData.columns.map((c) => c.column_Name || c),
        rows: oldData.rows.map((row) => ({
          rowLabel: row.row_Name,
          cells: Object.values(row.values || {}),
          indentLevel: 0,
        })),
      };

      // Save in new format
      const result = await this.updateVariantNutritionTable(
        variantId,
        newTableData,
      );

      // Optionally delete old data
      await this.deleteVariantNutrition(variantId);

      return result;
    } catch (error) {
      console.error("Migration error:", error);
      throw error;
    }
  },
  // ============= HOME SLIDER ENDPOINTS =============

  // Get all active sliders (for public homepage)
  // In api.js, find this method:
  async getHomeSliders() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/homeslider`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch home sliders`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API: Get home sliders error:", error);
      return []; // Return empty array on error
    }
  },

  // Get all sliders including inactive (for admin panel)
  async getAllHomeSliders() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/homeslider/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all home sliders");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all home sliders error:", error);
      return [];
    }
  },

  // Upload a new home slider image
  async uploadHomeSlider(
    imageFile,
    mobileImageFile = null,
    clickUrl = null,
    title = null,
  ) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Image", imageFile);
      if (mobileImageFile) formData.append("MobileImage", mobileImageFile);
      if (clickUrl) formData.append("ClickUrl", clickUrl);
      if (title) formData.append("Title", title);

      const response = await fetch(`${API_BASE_URL}/admin/homeslider/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload home slider");
      }
      return data;
    } catch (error) {
      console.error("Upload home slider error:", error);
      throw error;
    }
  },

  // Update a home slider (ClickUrl, Title, IsActive)
  async updateHomeSlider(id, updateData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/homeslider/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update home slider");
      }
      return data;
    } catch (error) {
      console.error("Update home slider error:", error);
      throw error;
    }
  },

  // Delete a home slider
  async deleteHomeSlider(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/homeslider/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete home slider");
      }
      return data;
    } catch (error) {
      console.error("Delete home slider error:", error);
      throw error;
    }
  },

  // Reorder sliders (drag and drop)
  async reorderHomeSliders(reorderList) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/homeslider/reorder`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reorderList),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reorder sliders");
      }
      return data;
    } catch (error) {
      console.error("Reorder home sliders error:", error);
      throw error;
    }
  },

  async initiateCPayPayment(paymentData) {
    try {
      const response = await this.post("/payment/initiate", paymentData);
      return response.data;
    } catch (error) {
      console.error("Error initiating payment:", error);
      throw error;
    }
  },

  async verifyPayment(orderId) {
    try {
      const response = await this.get(`/payment/verify/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },
  // Bulk update products (out of stock, discount, etc.)
  async bulkUpdateProducts(productIds, action, value = null) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/Products/BulkUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productIds: productIds,
            action: action,
            value: value,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to bulk update products");
      }

      return data;
    } catch (error) {
      console.error("Bulk update error:", error);
      throw error;
    }
  },

  // Bulk set stock quantity for multiple products
  async bulkSetStock(productIds, quantity) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/Products/BulkSetStock`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productIds: productIds,
            quantity: quantity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to bulk set stock");
      }

      return data;
    } catch (error) {
      console.error("Bulk set stock error:", error);
      throw error;
    }
  },
  // ============= INSTAGRAM POSTS ENDPOINTS =============

  // Get all active Instagram posts
  async getInstagramPosts() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/InstagramPosts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Instagram posts");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Instagram posts error:", error);
      return [];
    }
  },

  // Get single Instagram post by ID
  async getInstagramPostById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/InstagramPosts/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Instagram post");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Instagram post by id error:", error);
      throw error;
    }
  },

  // Create new Instagram post
  async createInstagramPost(postData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/InstagramPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create Instagram post");
      }

      return data;
    } catch (error) {
      console.error("Create Instagram post error:", error);
      throw error;
    }
  },

  // Update Instagram post
  async updateInstagramPost(postData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/InstagramPosts`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update Instagram post");
      }

      return data;
    } catch (error) {
      console.error("Update Instagram post error:", error);
      throw error;
    }
  },

  // Delete Instagram post
  async deleteInstagramPost(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/InstagramPosts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete Instagram post");
      }

      return data;
    } catch (error) {
      console.error("Delete Instagram post error:", error);
      throw error;
    }
  },
  // Add this method to api.js inside the api object
  async uploadInstagramImage(imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(
        `${API_BASE_URL}/InstagramPosts/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data;
    } catch (error) {
      console.error("Upload Instagram image error:", error);
      throw error;
    }
  },
  // ============= YOUTUBE VIDEOS ENDPOINTS =============

  // Get all active YouTube videos (for public display)
  async getYouTubeVideos() {
    try {
      const response = await fetch(`${API_BASE_URL}/YouTubeVideos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch YouTube videos");
      }

      return await response.json();
    } catch (error) {
      console.error("Get YouTube videos error:", error);
      return [];
    }
  },

  // Get all YouTube videos including inactive (for admin panel)
  async getAllYouTubeVideos() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/YouTubeVideos/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all YouTube videos");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all YouTube videos error:", error);
      return [];
    }
  },

  // Get single YouTube video by ID
  async getYouTubeVideoById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/YouTubeVideos/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch YouTube video");
      }

      return await response.json();
    } catch (error) {
      console.error("Get YouTube video by id error:", error);
      throw error;
    }
  },

  // Create new YouTube video
  async createYouTubeVideo(videoData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("VideoUrl", videoData.videoUrl);
      formData.append("Title", videoData.title);
      if (videoData.description)
        formData.append("Description", videoData.description);
      if (videoData.viewCount)
        formData.append("ViewCount", videoData.viewCount);
      if (videoData.likeCount)
        formData.append("LikeCount", videoData.likeCount);
      if (videoData.displayOrder)
        formData.append("DisplayOrder", videoData.displayOrder);
      if (videoData.thumbnail)
        formData.append("Thumbnail", videoData.thumbnail);
      if (videoData.createdBy)
        formData.append("CreatedBy", videoData.createdBy);

      const response = await fetch(`${API_BASE_URL}/YouTubeVideos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create YouTube video",
        );
      }

      return data;
    } catch (error) {
      console.error("Create YouTube video error:", error);
      throw error;
    }
  },

  // Update YouTube video
  async updateYouTubeVideo(videoData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Id", videoData.id);
      formData.append("VideoUrl", videoData.videoUrl);
      formData.append("Title", videoData.title);
      if (videoData.description)
        formData.append("Description", videoData.description);
      if (videoData.viewCount)
        formData.append("ViewCount", videoData.viewCount);
      if (videoData.likeCount)
        formData.append("LikeCount", videoData.likeCount);
      if (videoData.displayOrder)
        formData.append("DisplayOrder", videoData.displayOrder);
      if (videoData.thumbnail)
        formData.append("Thumbnail", videoData.thumbnail);
      if (videoData.updatedBy)
        formData.append("UpdatedBy", videoData.updatedBy);

      const response = await fetch(`${API_BASE_URL}/YouTubeVideos`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update YouTube video",
        );
      }

      return data;
    } catch (error) {
      console.error("Update YouTube video error:", error);
      throw error;
    }
  },

  // Delete YouTube video
  async deleteYouTubeVideo(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/YouTubeVideos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete YouTube video");
      }

      return data;
    } catch (error) {
      console.error("Delete YouTube video error:", error);
      throw error;
    }
  },

  // Reorder YouTube videos
  async reorderYouTubeVideos(reorderList) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/YouTubeVideos/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reorderList),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reorder videos");
      }

      return data;
    } catch (error) {
      console.error("Reorder YouTube videos error:", error);
      throw error;
    }
  },

  // Upload YouTube thumbnail
  async uploadYouTubeThumbnail(imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(
        `${API_BASE_URL}/YouTubeVideos/upload-thumbnail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload thumbnail");
      }

      return data;
    } catch (error) {
      console.error("Upload YouTube thumbnail error:", error);
      throw error;
    }
  },
  // ============= PARTNERS ENDPOINTS =============

  // Get all active partners (both types)
  async getPartners() {
    try {
      const response = await fetch(`${API_BASE_URL}/Partners`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch partners");
      }

      return await response.json();
    } catch (error) {
      console.error("Get partners error:", error);
      return [];
    }
  },

  // Get all partners including inactive (for admin panel)
  async getAllPartners() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Partners/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all partners");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all partners error:", error);
      return [];
    }
  },

  // Get partners by type (partner or award)
  async getPartnersByType(type) {
    try {
      const response = await fetch(`${API_BASE_URL}/Partners/type/${type}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}s`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Get ${type}s error:`, error);
      return [];
    }
  },

  // Get single partner by ID
  async getPartnerById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Partners/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch partner");
      }

      return await response.json();
    } catch (error) {
      console.error("Get partner by id error:", error);
      throw error;
    }
  },

  // Create new partner
  async createPartner(partnerData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Type", partnerData.type);
      formData.append("Name", partnerData.name);
      if (partnerData.url) formData.append("Url", partnerData.url);
      if (partnerData.displayOrder)
        formData.append("DisplayOrder", partnerData.displayOrder);
      if (partnerData.image) formData.append("Image", partnerData.image);
      if (partnerData.createdBy)
        formData.append("CreatedBy", partnerData.createdBy);

      const response = await fetch(`${API_BASE_URL}/Partners`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create partner",
        );
      }

      return data;
    } catch (error) {
      console.error("Create partner error:", error);
      throw error;
    }
  },

  // Update partner
  async updatePartner(partnerData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Id", partnerData.id);
      formData.append("Type", partnerData.type);
      formData.append("Name", partnerData.name);
      if (partnerData.url) formData.append("Url", partnerData.url);
      if (partnerData.displayOrder)
        formData.append("DisplayOrder", partnerData.displayOrder);
      if (partnerData.isActive !== undefined)
        formData.append("IsActive", partnerData.isActive);
      if (partnerData.image) formData.append("Image", partnerData.image);
      if (partnerData.updatedBy)
        formData.append("UpdatedBy", partnerData.updatedBy);

      const response = await fetch(`${API_BASE_URL}/Partners`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update partner",
        );
      }

      return data;
    } catch (error) {
      console.error("Update partner error:", error);
      throw error;
    }
  },

  // Delete partner
  async deletePartner(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Partners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete partner");
      }

      return data;
    } catch (error) {
      console.error("Delete partner error:", error);
      throw error;
    }
  },

  // Reorder partners
  async reorderPartners(reorderList) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/Partners/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reorderList),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reorder partners");
      }

      return data;
    } catch (error) {
      console.error("Reorder partners error:", error);
      throw error;
    }
  },

  // Upload partner image
  async uploadPartnerImage(imageFile, type) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("type", type);

      const response = await fetch(`${API_BASE_URL}/Partners/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data;
    } catch (error) {
      console.error("Upload partner image error:", error);
      throw error;
    }
  },
  // ============= ABOUT COMPANY ENDPOINTS =============

  // Get all active sections (for public page)
  async getAboutCompanySections() {
    try {
      const response = await fetch(`${API_BASE_URL}/AboutCompany`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch about company sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get about company sections error:", error);
      return [];
    }
  },

  // Get all sections including inactive (for admin panel)
  async getAllAboutCompanySections() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/AboutCompany/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all about company sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all about company sections error:", error);
      return [];
    }
  },

  // Get single section by ID
  async getAboutCompanySectionById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/AboutCompany/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch about company section");
      }

      return await response.json();
    } catch (error) {
      console.error("Get about company section by id error:", error);
      throw error;
    }
  },

  // Create new about company section
  async createAboutCompanySection(sectionData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("SectionType", sectionData.sectionType);
      if (sectionData.title) formData.append("Title", sectionData.title);
      if (sectionData.videoUrl)
        formData.append("VideoUrl", sectionData.videoUrl);
      if (sectionData.videoThumbnail)
        formData.append("VideoThumbnail", sectionData.videoThumbnail);
      if (sectionData.content) formData.append("Content", sectionData.content);
      if (sectionData.displayOrder)
        formData.append("DisplayOrder", sectionData.displayOrder);
      if (sectionData.createdBy)
        formData.append("CreatedBy", sectionData.createdBy);

      const response = await fetch(`${API_BASE_URL}/AboutCompany`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create about company section",
        );
      }

      return data;
    } catch (error) {
      console.error("Create about company section error:", error);
      throw error;
    }
  },

  // Update about company section
  async updateAboutCompanySection(sectionData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Id", sectionData.id);
      formData.append("SectionType", sectionData.sectionType);
      if (sectionData.title) formData.append("Title", sectionData.title);
      if (sectionData.videoUrl)
        formData.append("VideoUrl", sectionData.videoUrl);
      if (sectionData.videoThumbnail)
        formData.append("VideoThumbnail", sectionData.videoThumbnail);
      if (sectionData.content) formData.append("Content", sectionData.content);
      if (sectionData.displayOrder !== undefined)
        formData.append("DisplayOrder", sectionData.displayOrder);
      if (sectionData.isActive !== undefined)
        formData.append("IsActive", sectionData.isActive);
      if (sectionData.updatedBy)
        formData.append("UpdatedBy", sectionData.updatedBy);

      const response = await fetch(`${API_BASE_URL}/AboutCompany`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update about company section",
        );
      }

      return data;
    } catch (error) {
      console.error("Update about company section error:", error);
      throw error;
    }
  },

  // Delete about company section
  async deleteAboutCompanySection(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/AboutCompany/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete about company section",
        );
      }

      return data;
    } catch (error) {
      console.error("Delete about company section error:", error);
      throw error;
    }
  },

  // Reorder about company sections
  async reorderAboutCompanySections(reorderList) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/AboutCompany/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reorderList),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reorder sections");
      }

      return data;
    } catch (error) {
      console.error("Reorder about company sections error:", error);
      throw error;
    }
  },

  async getBranchLocations(type = "") {
    try {
      const query = type ? `?type=${encodeURIComponent(type)}` : "";
      const response = await fetch(`${API_BASE_URL}/BranchLocations${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch locations");
      }

      return data;
    } catch (error) {
      console.error("Get branch locations error:", error);
      return { status: false, data: [] };
    }
  },

  async getAllBranchLocations() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/BranchLocations/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin locations");
      }

      return data;
    } catch (error) {
      console.error("Get all branch locations error:", error);
      throw error;
    }
  },

  async createBranchLocation(locationData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/BranchLocations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create location");
      }

      return data;
    } catch (error) {
      console.error("Create branch location error:", error);
      throw error;
    }
  },

  async updateBranchLocation(locationData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/BranchLocations`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update location");
      }

      return data;
    } catch (error) {
      console.error("Update branch location error:", error);
      throw error;
    }
  },

  async deleteBranchLocation(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/BranchLocations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete location");
      }

      return data;
    } catch (error) {
      console.error("Delete branch location error:", error);
      throw error;
    }
  },

  async getTipArticles() {
    try {
      const response = await fetch(`${API_BASE_URL}/TipArticles`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tips");
      }

      return data;
    } catch (error) {
      console.error("Get tip articles error:", error);
      return { status: false, data: [] };
    }
  },

  async getTipArticleBySlug(slug) {
    const response = await fetch(
      `${API_BASE_URL}/TipArticles/by-slug/${encodeURIComponent(slug)}`,
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch tip");
    }
    return data;
  },

  async getAllTipArticles() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/TipArticles/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin tips");
      }

      return data;
    } catch (error) {
      console.error("Get all tip articles error:", error);
      throw error;
    }
  },

  async createTipArticle(articleData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Category", articleData.category || "news");
      formData.append("Title", articleData.title || "");
      formData.append("TitleAl", articleData.titleAl || "");
      formData.append("Subtitle", articleData.subtitle || "");
      formData.append("SubtitleAl", articleData.subtitleAl || "");
      formData.append("Content", articleData.content || "");
      formData.append("ContentAl", articleData.contentAl || "");
      formData.append("Slug", articleData.slug || "");
      formData.append("SeoTitle", articleData.seoTitle || "");
      formData.append("SeoDescription", articleData.seoDescription || "");
      formData.append("DisplayOrder", articleData.displayOrder || 0);
      formData.append("IsActive", articleData.isActive !== false);
      if (articleData.image) formData.append("Image", articleData.image);

      const response = await fetch(`${API_BASE_URL}/TipArticles`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create tip");
      }

      return data;
    } catch (error) {
      console.error("Create tip article error:", error);
      throw error;
    }
  },

  async updateTipArticle(articleData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Id", articleData.id);
      formData.append("Category", articleData.category || "news");
      formData.append("Title", articleData.title || "");
      formData.append("TitleAl", articleData.titleAl || "");
      formData.append("Subtitle", articleData.subtitle || "");
      formData.append("SubtitleAl", articleData.subtitleAl || "");
      formData.append("Content", articleData.content || "");
      formData.append("ContentAl", articleData.contentAl || "");
      formData.append("Slug", articleData.slug || "");
      formData.append("SeoTitle", articleData.seoTitle || "");
      formData.append("SeoDescription", articleData.seoDescription || "");
      formData.append("DisplayOrder", articleData.displayOrder || 0);
      formData.append("IsActive", articleData.isActive !== false);
      if (articleData.image) formData.append("Image", articleData.image);

      const response = await fetch(`${API_BASE_URL}/TipArticles`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tip");
      }

      return data;
    } catch (error) {
      console.error("Update tip article error:", error);
      throw error;
    }
  },

  async deleteTipArticle(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/TipArticles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tip");
      }

      return data;
    } catch (error) {
      console.error("Delete tip article error:", error);
      throw error;
    }
  },

  // Upload about company thumbnail
  async uploadAboutCompanyThumbnail(imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(
        `${API_BASE_URL}/AboutCompany/upload-thumbnail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload thumbnail");
      }

      return data;
    } catch (error) {
      console.error("Upload about company thumbnail error:", error);
      throw error;
    }
  },
  // ============= LANDING PAGE ENDPOINTS =============

  // Get all active sections (for public landing page)
  async getLandingPageSections() {
    try {
      const response = await fetch(`${API_BASE_URL}/LandingPage`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch landing page sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get landing page sections error:", error);
      return [];
    }
  },

  // Get all sections including inactive (for admin panel)
  async getAllLandingPageSections() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/LandingPage/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all landing page sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get all landing page sections error:", error);
      return [];
    }
  },

  // Get single section by ID
  async getLandingPageSectionById(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/LandingPage/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch landing page section");
      }

      return await response.json();
    } catch (error) {
      console.error("Get landing page section by id error:", error);
      throw error;
    }
  },

  // Create new landing page section
  async createLandingPageSection(sectionData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("SectionType", sectionData.sectionType);
      if (sectionData.title) formData.append("Title", sectionData.title);
      if (sectionData.image) formData.append("Image", sectionData.image);
      if (sectionData.content) formData.append("Content", sectionData.content);
      if (sectionData.displayOrder)
        formData.append("DisplayOrder", sectionData.displayOrder);
      if (sectionData.createdBy)
        formData.append("CreatedBy", sectionData.createdBy);

      const response = await fetch(`${API_BASE_URL}/LandingPage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create landing page section",
        );
      }

      return data;
    } catch (error) {
      console.error("Create landing page section error:", error);
      throw error;
    }
  },

  // Update landing page section
  async updateLandingPageSection(sectionData) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("Id", sectionData.id);
      formData.append("SectionType", sectionData.sectionType);
      if (sectionData.title) formData.append("Title", sectionData.title);
      if (sectionData.image) formData.append("Image", sectionData.image);
      if (sectionData.content) formData.append("Content", sectionData.content);
      if (sectionData.displayOrder !== undefined)
        formData.append("DisplayOrder", sectionData.displayOrder);
      if (sectionData.isActive !== undefined)
        formData.append("IsActive", sectionData.isActive);
      if (sectionData.updatedBy)
        formData.append("UpdatedBy", sectionData.updatedBy);

      const response = await fetch(`${API_BASE_URL}/LandingPage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update landing page section",
        );
      }

      return data;
    } catch (error) {
      console.error("Update landing page section error:", error);
      throw error;
    }
  },

  // Delete landing page section
  async deleteLandingPageSection(id) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/LandingPage/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete landing page section",
        );
      }

      return data;
    } catch (error) {
      console.error("Delete landing page section error:", error);
      throw error;
    }
  },

  // Reorder landing page sections
  async reorderLandingPageSections(reorderList) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/LandingPage/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reorderList),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reorder sections");
      }

      return data;
    } catch (error) {
      console.error("Reorder landing page sections error:", error);
      throw error;
    }
  },

  // Upload landing page image
  async uploadLandingPageImage(imageFile) {
    try {
      const token = this.getToken();
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(`${API_BASE_URL}/LandingPage/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data;
    } catch (error) {
      console.error("Upload landing page image error:", error);
      throw error;
    }
  },
  // Add this helper function at the beginning of the api object
  isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      if (!exp) return true;
      // exp is in seconds, Date.now() is in milliseconds
      return Date.now() >= exp * 1000;
    } catch (error) {
      return true;
    }
  },

  // Add this method to check and handle token expiration
  checkAndHandleTokenExpiration() {
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return true;
    }
    return false;
  },

  // Add to your api.js file (after your other methods)

  // ============= DYNAMIC CONTENT ENDPOINTS =============

  // Get active sections for a public page (no auth required)
  async getDynamicSections(pageType) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/DynamicContent/${pageType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dynamic sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get dynamic sections error:", error);
      return [];
    }
  },

  // Get all sections for admin (including inactive) - requires auth
  async getAllDynamicSectionsForAdmin(pageType) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/DynamicContent/admin/${pageType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin dynamic sections");
      }

      return await response.json();
    } catch (error) {
      console.error("Get admin dynamic sections error:", error);
      return [];
    }
  },

  // Get single section by ID (admin)
  async getDynamicSectionById(sectionId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/DynamicContent/section/${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dynamic section");
      }

      return await response.json();
    } catch (error) {
      console.error("Get dynamic section by id error:", error);
      throw error;
    }
  },

  // Create new section (admin)
  async createDynamicSection(sectionData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/DynamicContent/section`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create section");
      }

      return data;
    } catch (error) {
      console.error("Create dynamic section error:", error);
      throw error;
    }
  },

  // Update section (admin)
  async updateDynamicSection(sectionData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/DynamicContent/section`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update section");
      }

      return data;
    } catch (error) {
      console.error("Update dynamic section error:", error);
      throw error;
    }
  },

  // Delete section (admin)
  async deleteDynamicSection(sectionId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/DynamicContent/section/${sectionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete section");
      }

      return data;
    } catch (error) {
      console.error("Delete dynamic section error:", error);
      throw error;
    }
  },

  // Reorder sections (admin)
  async reorderDynamicSections(sections) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/DynamicContent/reorder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections: sections }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reorder sections");
      }

      return data;
    } catch (error) {
      console.error("Reorder dynamic sections error:", error);
      throw error;
    }
  },
  // Add to api.js - Get variant with parent product info
  async getVariantWithParent(variantId) {
    try {
      const token = this.getToken();
      const response = await fetch(
        `${API_BASE_URL}/admin/ProductVariant/${variantId}/with-parent`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variant with parent");
      }

      return await response.json();
    } catch (error) {
      console.error("Get variant with parent error:", error);
      throw error;
    }
  },

  async getAdminCategories() {
    const response = await fetch(`${API_BASE_URL}/admin/taxonomy/categories`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to load categories");
    return data;
  },

  async createAdminCategory(category) {
    const response = await fetch(`${API_BASE_URL}/admin/taxonomy/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create category");
    return data;
  },

  async updateAdminCategory(categoryId, category) {
    const response = await fetch(
      `${API_BASE_URL}/admin/taxonomy/categories/${categoryId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update category");
    return data;
  },

  async deleteAdminCategory(categoryId) {
    const response = await fetch(
      `${API_BASE_URL}/admin/taxonomy/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete category");
    return data;
  },

  async getHomepageCards(section = "") {
    const query = section ? `?section=${encodeURIComponent(section)}` : "";
    const response = await fetch(`${API_BASE_URL}/HomepageCards${query}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load homepage cards");
    return normalizeDynamicRows(data.data || []);
  },

  async getAdminHomepageCards() {
    const response = await fetch(`${API_BASE_URL}/HomepageCards/admin`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load homepage cards");
    return normalizeDynamicRows(data.data || []);
  },

  async saveAdminHomepageCard(card, id = null) {
    const formData = new FormData();
    formData.append("section", card.section);
    formData.append("titleMk", card.titleMk);
    formData.append("titleAl", card.titleAl || "");
    formData.append("slug", card.slug);
    formData.append("filterValue", card.filterValue);
    formData.append("destinationUrl", card.destinationUrl || "");
    formData.append("displayOrder", String(card.displayOrder || 0));
    formData.append("isActive", String(Boolean(card.isActive)));
    if (card.image) formData.append("image", card.image);

    const response = await fetch(
      `${API_BASE_URL}/HomepageCards${id ? `/${id}` : ""}`,
      {
        method: id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${this.getToken()}` },
        body: formData,
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to save homepage card");
    return data;
  },

  async deleteAdminHomepageCard(id) {
    const response = await fetch(`${API_BASE_URL}/HomepageCards/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete homepage card");
    return data;
  },

  async subscribeNewsletter(email, source = "website") {
    const response = await fetch(`${API_BASE_URL}/Marketing/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to save subscription");
    return data;
  },

  async getNewsletterSubscribers({ search = "", page = 1, pageSize = 50 } = {}) {
    const query = new URLSearchParams({ search, page, pageSize });
    const response = await fetch(`${API_BASE_URL}/Marketing/admin/subscribers?${query}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load subscribers");
    return data;
  },

  async updateNewsletterSubscriberStatus(id, isActive) {
    const response = await fetch(
      `${API_BASE_URL}/Marketing/admin/subscribers/${id}/status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update subscriber status");
    }
    return data;
  },

  async getRegisteredUsers({ search = "", page = 1, pageSize = 50 } = {}) {
    const query = new URLSearchParams({ search, page, pageSize });
    const response = await fetch(`${API_BASE_URL}/Marketing/admin/users?${query}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load registered users");
    return data;
  },

  async downloadAdminAudience(type) {
    const endpoint = type === "users" ? "users.csv" : "subscribers.csv";
    const response = await fetch(`${API_BASE_URL}/Marketing/admin/${endpoint}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    if (!response.ok) throw new Error("Failed to export the list");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = type === "users" ? "registered-users.csv" : "newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  },
};
