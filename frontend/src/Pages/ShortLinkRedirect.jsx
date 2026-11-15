import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { PageLoader } from "./Components/Loaders/BrandLoader";
import { isSafeSitePath, saveReferralCode } from "../utils/referral";

/** /r/<slug>: affiliate short link. Remembers the link's code for checkout and opens its page. */
export default function ShortLinkRedirect() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .resolveShortLink(slug)
      .then((target) => {
        if (cancelled) return;
        if (target?.code) saveReferralCode(target.code);
        navigate(isSafeSitePath(target?.targetPath) ? target.targetPath : "/", { replace: true });
      })
      .catch(() => {
        if (!cancelled) navigate("/", { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  return <PageLoader />;
}
