import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../translation/LanguageContext";

const STORAGE_KEY = "proteini-cookie-consent-v1";

const copy = {
  mk: {
    title: "Поставки за колачиња",
    description:
      "Користиме неопходни колачиња за кошничката, најавата и нарачките. Аналитичките и маркетинг колачиња ќе се вклучат само со Ваша согласност.",
    necessary: "Неопходни",
    necessaryHint: "Секогаш активни",
    analytics: "Аналитика",
    marketing: "Маркетинг",
    customize: "Прилагоди",
    reject: "Одбиј дополнителни",
    accept: "Прифати ги сите",
    save: "Зачувај избор",
    policy: "Политика за приватност",
    reopen: "Колачиња",
  },
  al: {
    title: "Cilësimet e cookies",
    description:
      "Përdorim cookies të domosdoshme për shportën, hyrjen dhe porositë. Cookies analitike dhe marketing aktivizohen vetëm me pëlqimin tuaj.",
    necessary: "Të domosdoshme",
    necessaryHint: "Gjithmonë aktive",
    analytics: "Analitikë",
    marketing: "Marketing",
    customize: "Përshtat",
    reject: "Refuzo shtesat",
    accept: "Prano të gjitha",
    save: "Ruaj zgjedhjen",
    policy: "Politika e privatësisë",
    reopen: "Cookies",
  },
};

function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const { language } = useLanguage();
  const text = copy[language] || copy.mk;
  const [initialConsent] = useState(() => readConsent());
  const [visible, setVisible] = useState(() => !initialConsent);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(() =>
    Boolean(initialConsent?.analytics),
  );
  const [marketing, setMarketing] = useState(() =>
    Boolean(initialConsent?.marketing),
  );

  const save = (preferences) => {
    const consent = {
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(
      new CustomEvent("proteini:cookie-consent", { detail: consent }),
    );
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
    setVisible(false);
    setCustomizing(false);
  };

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-3 left-3 z-40 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-semibold shadow-md hover:border-[#2096D8]"
      >
        {text.reopen}
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.16)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold">{text.title}</h2>
          <p className="mt-1 text-sm leading-5 text-gray-600">{text.description}</p>
          <Link
            to="/privacy-policy"
            className="mt-2 inline-block text-xs font-semibold text-[#1b88c5] underline"
          >
            {text.policy}
          </Link>
        </div>

        {customizing && (
          <div className="grid min-w-[280px] gap-2 text-sm">
            <label className="flex items-center justify-between gap-5 rounded border border-gray-200 px-3 py-2">
              <span>{text.necessary}</span>
              <span className="text-xs text-gray-500">{text.necessaryHint}</span>
            </label>
            <label className="flex items-center justify-between gap-5 rounded border border-gray-200 px-3 py-2">
              <span>{text.analytics}</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="accent-[#2096D8]"
              />
            </label>
            <label className="flex items-center justify-between gap-5 rounded border border-gray-200 px-3 py-2">
              <span>{text.marketing}</span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
                className="accent-[#2096D8]"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {!customizing && (
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="border border-gray-400 px-4 py-2 text-sm font-semibold"
            >
              {text.customize}
            </button>
          )}
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="border border-gray-400 px-4 py-2 text-sm font-semibold"
          >
            {text.reject}
          </button>
          <button
            type="button"
            onClick={() =>
              customizing
                ? save({ analytics, marketing })
                : save({ analytics: true, marketing: true })
            }
            className="bg-[#F7C201] px-4 py-2 text-sm font-bold text-black"
          >
            {customizing ? text.save : text.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
