import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { api } from "../src/services/api";
import { LanguageProvider } from "../src/Pages/translation/LanguageContext";
import { AuthProvider } from "../src/contexts/AuthContext";
import AdminPanel from "../src/Pages/Admin/AdminPanel";
import ProductDetail from "../src/Pages/Products/ProductDetail";
import "../src/index.css";

// Development-only fixture. Every API method is replaced; saves stay in memory.
for (const key of Object.keys(api)) {
  if (typeof api[key] === "function") {
    api[key] = () => { throw new Error("Unexpected fixture API call: " + key); };
  }
}
window.fetch = () => Promise.reject(new Error("Network disabled in regression fixture"));
window.alert = (message) => {
  document.getElementById("fixture-status").textContent = message;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const products = [
  { product_Id: 1, name: "Alpha Whey", brand: "Alpha", price: 100, quantity: 10, mainDescriptions: "[]", img: "/logos/proteini-invoice-logo.png" },
  { product_Id: 2, name: "Beta Creatine", brand: "Beta", price: 200, quantity: 10, mainDescriptions: "[]", img: "/logos/proteini-invoice-logo.png" },
];
const variants = [
  { variant_Id: 11, flavor_Name: "Chocolate", packaging_Name: "908g", isDefault: true },
  { variant_Id: 12, flavor_Name: "Vanilla", packaging_Name: "908g" },
  { variant_Id: 13, flavor_Name: "Wheytella", packaging_Name: "908g" },
  { variant_Id: 14, flavor_Name: "Chocolate", packaging_Name: "2000g" },
  { variant_Id: 15, flavor_Name: "Vanilla", packaging_Name: "2000g" },
  { variant_Id: 16, flavor_Name: "Strawberry", packaging_Name: "908g", quantity: 0 },
].map((variant) => ({ price: 100, quantity: 10, isActive: true, ingredients: variant.flavor_Name + " " + variant.packaging_Name + " ingredients", ...variant }));
const isAdmin = new URLSearchParams(window.location.search).get("view") === "admin";
const isStockCase = new URLSearchParams(window.location.search).get("view") === "stock";
if (isStockCase) {
  products[0].quantity = 0;
  products[0].mainDescriptions = JSON.stringify([
    "<h3>ПРИДОБИВКИ</h3><p><strong>Протеин</strong> за секој ден.</p><ul><li>Чоколадо</li><li>Ванила</li></ul>",
  ]);
  variants[0].quantity = 0;
  variants[1].quantity = 10;
}
api.isAuthenticated = () => false;
api.getToken = () => null;
api.getUser = () => null;
api.getProducts = async () => {
  const snapshot = structuredClone(products);
  await delay(150);
  return snapshot;
};
api.searchProducts = async ({ searchTerm }) => {
  const snapshot = structuredClone(products.filter(
    (p) => (p.name + " " + p.brand).toLowerCase().includes(searchTerm.toLowerCase()),
  ));
  // Alpha intentionally completes late to expose stale-response races.
  await delay(searchTerm === "Alpha" ? 2000 : 50);
  return { products: snapshot, totalCount: snapshot.length, totalPages: 1 };
};
api.getFilterOptions = async () => ({
  categories: [], sports: [], goals: [], useTimings: [], tags: [], flavors: [], brands: [],
});
api.getProductById = async (id) => ({
  product: structuredClone(products.find((p) => p.product_Id === Number(id))),
  variants: isAdmin ? [] : variants,
});
api.getProductGallery = async () => [];
api.getProductVariants = async () => ({ data: [] });
api.getPackaging = async () => ({ data: [] });
api.getVariantGallery = async () => [];
api.getVariantNutritionTable = async (id) => {
  await delay(id === 13 ? 2000 : 50);
  const variant = variants.find((item) => item.variant_Id === id);
  if (id === 15) return { status: true, data: { columns: [], rows: [] } };
  return { status: true, data: {
    columns: [variant.packaging_Name],
    rows: [{ rowLabel: variant.flavor_Name + " " + variant.packaging_Name + " protein", cells: ["70g"] }],
  } };
};
api.updateProduct = async (id, data) => {
  Object.assign(products.find((p) => p.product_Id === id), data, {
    mainDescriptions: data.mainDescription,
  });
  return { status: true };
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div id="fixture-status" role="status">In-memory product regression fixture</div>
    <MemoryRouter initialEntries={[isAdmin ? "/admin" : "/product/1"]}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  </StrictMode>,
);
