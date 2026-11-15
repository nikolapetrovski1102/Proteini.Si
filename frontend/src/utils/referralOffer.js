import { useEffect, useState } from "react";
import { api } from "../services/api";
import { REFERRAL_EVENT, clearReferralCode, getReferralCode } from "./referral";

/*
 * The discount a visitor's affiliate code gives, shown in the shop before checkout:
 * the code's price on product cards and the product page, plus a personal offer card.
 * Checkout still validates the code against the real cart; this only previews it.
 */

const previews = new Map(); // code -> Promise<offer | null>, one request per code per page load

function loadOffer(code) {
  if (!previews.has(code)) {
    previews.set(
      code,
      api.getPromotionPreview(code).then(
        (offer) => offer,
        (error) => {
          // A code that no longer works shouldn't follow the visitor to checkout either.
          if (error?.status === 404) clearReferralCode();
          else previews.delete(code); // network trouble: try again on the next page
          return null;
        },
      ),
    );
  }
  return previews.get(code);
}

/** The visitor's referral offer, or null. Updates when a new link is opened or the code is used. */
export function useReferralOffer() {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    let current = 0;
    const refresh = () => {
      const request = ++current;
      const code = getReferralCode();
      if (!code) {
        setOffer(null);
        return;
      }
      loadOffer(code).then((result) => {
        if (request === current) setOffer(result?.code ? result : null);
      });
    };
    refresh();
    window.addEventListener(REFERRAL_EVENT, refresh);
    window.addEventListener("storage", refresh); // another tab opened a link
    return () => {
      current += 1;
      window.removeEventListener(REFERRAL_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return offer;
}

export { offerAppliesTo, referralPrice, showsPerProductPrice } from "./referralPricing.js";
