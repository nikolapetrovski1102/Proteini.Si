import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { BUILT_IN_TIPS, localizeTip } from "./tipsData";

let cachedRows = null;

/** Published tips from the API (or the built-in set when none exist), localized. */
export function useTips() {
  const { language } = useLanguage();
  const [rows, setRows] = useState(cachedRows);

  useEffect(() => {
    if (cachedRows) return;
    let active = true;
    api.getTipArticles().then((response) => {
      const published = (response?.data || []).filter((tip) => tip.slug && tip.isActive !== false);
      cachedRows = published.length > 0 ? published : BUILT_IN_TIPS;
      if (active) setRows(cachedRows);
    });
    return () => {
      active = false;
    };
  }, []);

  const tips = useMemo(() => (rows || []).map((tip) => localizeTip(tip, language)), [rows, language]);
  return { tips, loading: rows === null };
}
