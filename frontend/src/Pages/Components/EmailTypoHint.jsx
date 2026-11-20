import { t } from "../translation/translation";
import { getEmailTypoSuggestion } from "../../utils/emailSuggestions";
import Scribble from "./Scribble";

/**
 * "Did you mean name@hotmail.com?" under an email field. Tapping the address fixes it.
 * tone="dark" for fields on a dark background (footer).
 */
export default function EmailTypoHint({ email, onAcceptSuggestion, tone = "light", className = "mt-2" }) {
  const suggestion = getEmailTypoSuggestion(email);
  if (!suggestion) return null;

  const dark = tone === "dark";
  return (
    <p className={`${className} text-xs ${dark ? "text-white/75" : "text-gray-600"}`} role="status">
      {t("emailDidYouMean") || "Дали мислевте на"}{" "}
      <button
        type="button"
        onClick={() => onAcceptSuggestion(suggestion)}
        className={`cursor-pointer font-bold ${dark ? "text-white" : "text-gray-900"}`}
      >
        <Scribble active>{suggestion}</Scribble>
      </button>
      ?
    </p>
  );
}
