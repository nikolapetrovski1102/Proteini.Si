import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/** Scrolls to the top when moving to a new page (not on back/forward, not on hash links). */
export default function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}
