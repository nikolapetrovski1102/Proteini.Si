import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { useQuickPurchase } from "../Hooks/useQuickPurchase";
import HomeProductCard from "../HomePages/HomeProductCard";
import HomeProductRail from "../HomePages/HomeProductRail";
import Scribble from "../Components/Scribble";

const PER_ROW = 8;

// The filter returns one row per packaging; keep the first (default) one per product.
const firstPerProduct = (rows = []) => {
  const byId = new Map();
  rows.forEach((row) => byId.has(row.product_Id) || byId.set(row.product_Id, row));
  return byId;
};

/**
 * Two rows under the product details, both from usp_Product_GetRelated:
 *  - "together": what customers buy with this product (topped up with same-goal products from other categories);
 *  - "similar":  alternatives from the same subcategory.
 * Ids and order come from that endpoint; the cards' data (sale, stock, brand, Albanian name) from the shop filter,
 * so they look and behave exactly like the shop grid. A row with nothing in it isn't shown.
 */
export default function ProductRecommendations({ productId }) {
  const { translate, language } = useLanguage();
  const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
  const [rows, setRows] = useState({ for: null, together: [], similar: [] });
  const [favorites, setFavorites] = useState(() => new Set());
  const isAuthenticated = api.isAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const related = await api.getRelatedProducts(productId, PER_ROW);
        const ids = related.map((item) => item.product_Id);
        if (ids.length === 0) {
          if (!cancelled) setRows({ for: productId, together: [], similar: [] });
          return;
        }
        const data = await api.getFilteredProducts({ productIds: ids, inStock: true, pageSize: 100 });
        const byId = firstPerProduct(data.products);
        const pick = (reason) =>
          related
            .filter((item) => item.reason === reason)
            .map((item) => byId.get(item.product_Id))
            .filter(Boolean);
        if (!cancelled) setRows({ for: productId, together: pick("together"), similar: pick("similar") });
      } catch (err) {
        console.error("Product recommendations:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    api.getFavorites().then((response) => {
      if (cancelled || !response?.success) return;
      setFavorites(new Set((response.data || []).map((fav) => fav.productId)));
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Rows of the previous product stay hidden while the next product's load.
  if (rows.for !== productId || (rows.together.length === 0 && rows.similar.length === 0)) return null;

  const handleToggleFavorite = async (id, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const response = await api.toggleFavorite(id);
      if (!response.success) return;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const renderRow = (key, kicker, title, products) =>
    products.length > 0 && (
      <section key={key} className="mt-12 sm:mt-16" aria-labelledby={`pdp-rec-${key}`}>
        <span className="inline-block font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] sm:text-[15px]">
          <Scribble>{kicker}</Scribble>
        </span>
        <h2
          id={`pdp-rec-${key}`}
          className="mt-2 font-display text-[26px] font-bold uppercase leading-[0.95] tracking-tight text-[var(--ink)] [text-wrap:balance] sm:text-4xl"
        >
          {title}
        </h2>
        <div className="mt-4 sm:mt-6">
          <HomeProductRail label={title} controls="bottom">
            {products.map((product) => (
              <HomeProductCard
                key={product.product_Id}
                product={product}
                showStock
                showSaleEnd
                language={language}
                saleEndLocale={language === "al" ? "sq-AL" : language === "en" ? "en-GB" : "mk-MK"}
                onQuickPurchase={() => quickPurchase(product)}
                onQuickPurchaseIntent={() => prefetchQuickPurchase(product)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(product.product_Id)}
                translate={translate}
              />
            ))}
          </HomeProductRail>
        </div>
      </section>
    );

  return (
    <div>
      {renderRow("together", translate("pdpRecTogetherKicker"), translate("pdpRecTogether"), rows.together)}
      {renderRow("similar", translate("pdpRecSimilarKicker"), translate("pdpRecSimilar"), rows.similar)}
      {quickPurchaseSheet}
    </div>
  );
}
