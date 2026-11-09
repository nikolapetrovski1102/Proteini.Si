// Quick purchase from a product card, without leaving the page.
//
//  - simple product        → added to the cart straight away (one tap)
//  - product with variants → a light sheet opens to pick packaging/flavour + quantity
//  - gift voucher          → product page (the amount has to be entered there)
//
// Usage:
//   const { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet } = useQuickPurchase();
//   <Card onQuickPurchase={() => quickPurchase(product)} onQuickPurchaseIntent={() => prefetchQuickPurchase(product)} />
//   {quickPurchaseSheet}
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./useCart";
import QuickPurchaseSheet from "../Components/Cart/QuickPurchaseSheet";
import {
  effectivePrice,
  loadDetails,
  needsVariantChoice,
  parentIdOf,
} from "../Components/Cart/quickPurchaseData";
import { isSaleActive } from "../../utils/salePricing";

export function useQuickPurchase() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [sheetProduct, setSheetProduct] = useState(null);

  const prefetchQuickPurchase = useCallback((product) => {
    if (needsVariantChoice(product) && !product.isGiftVoucher) {
      loadDetails(parentIdOf(product)).catch(() => {});
    }
  }, []);

  const quickPurchase = useCallback(
    (product) => {
      if (!product) return;
      if (product.isGiftVoucher) {
        window.scrollTo(0, 0);
        navigate(`/product/${parentIdOf(product)}`);
        return;
      }
      if (needsVariantChoice(product)) {
        loadDetails(parentIdOf(product)).catch(() => {});
        setSheetProduct(product);
        return;
      }
      addToCart(product.product_Id, 1, {
        ...product,
        price: effectivePrice(product, isSaleActive(product)),
      });
    },
    [addToCart, navigate],
  );

  const closeSheet = useCallback(() => setSheetProduct(null), []);
  const quickPurchaseSheet = (
    <QuickPurchaseSheet product={sheetProduct} onClose={closeSheet} addToCart={addToCart} />
  );

  return { quickPurchase, prefetchQuickPurchase, quickPurchaseSheet };
}
