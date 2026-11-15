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

  const styles = (
    <style>{`
      .cc { --cc-bg: #ffffff; --cc-ink: #141409; --cc-muted: #5b5b52; --cc-line: rgba(20, 20, 9, 0.14); --cc-soft: #f6f5f1; --cc-cta-bg: #141409; --cc-cta-fg: #ffffff; --cc-cta-hover: #2c2c22; --cc-ghost-hover: rgba(20, 20, 9, 0.05); --cc-link: #141409; --cc-shadow: 0 -12px 32px -16px rgba(20, 20, 9, 0.3); }
      html[data-theme="dark"] .cc { --cc-bg: var(--d-surface); --cc-ink: var(--d-text); --cc-muted: var(--d-muted); --cc-line: var(--d-border); --cc-soft: var(--d-raised); --cc-cta-bg: #fdc700; --cc-cta-fg: #141409; --cc-cta-hover: #ffe066; --cc-ghost-hover: var(--d-hover); --cc-link: #fdc700; --cc-shadow: 0 -12px 32px -16px rgba(0, 0, 0, 0.7); }
      .cc-panel { background: var(--cc-bg); color: var(--cc-ink); border-top: 1px solid var(--cc-line); box-shadow: var(--cc-shadow); }
      .cc-muted { color: var(--cc-muted); }
      .cc-link { color: var(--cc-link); }
      .cc-row { border: 1px solid var(--cc-line); background: var(--cc-soft); }
      .cc-check { accent-color: var(--cc-cta-bg); }
      .cc-btn { border-radius: 8px; transition: background-color 0.15s, border-color 0.15s, transform 0.1s; }
      .cc-btn:active { transform: scale(0.98); }
      .cc-btn:focus-visible { outline: 2px solid var(--cc-ink); outline-offset: 2px; }
      .cc-ghost { border: 1px solid var(--cc-line); color: var(--cc-ink); background: transparent; }
      .cc-ghost:hover { background: var(--cc-ghost-hover); border-color: var(--cc-ink); }
      .cc-cta { background: var(--cc-cta-bg); color: var(--cc-cta-fg); border: 1px solid var(--cc-cta-bg); }
      .cc-cta:hover { background: var(--cc-cta-hover); border-color: var(--cc-cta-hover); }
    `}</style>
  );

  if (!visible) return null;

  return (
    <div className="cc">
      {styles}
      <div
        role="dialog"
        aria-labelledby="cookie-consent-title"
        className="cc-panel fixed inset-x-0 bottom-0 z-[100] p-4"
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="cookie-consent-title" className="text-lg font-bold">
              {text.title}
            </h2>
            <p className="cc-muted mt-1 text-sm leading-5">{text.description}</p>
            <Link
              to="/privacy-policy"
              className="cc-link mt-2 inline-block text-xs font-semibold underline underline-offset-2"
            >
              {text.policy}
            </Link>
          </div>

          {customizing && (
            <div className="grid min-w-[280px] gap-2 text-sm">
              <div className="cc-row flex items-center justify-between gap-5 rounded-lg px-3 py-2">
                <span>{text.necessary}</span>
                <span className="cc-muted text-xs">{text.necessaryHint}</span>
              </div>
              <label className="cc-row flex cursor-pointer items-center justify-between gap-5 rounded-lg px-3 py-2">
                <span>{text.analytics}</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="cc-check h-4 w-4"
                />
              </label>
              <label className="cc-row flex cursor-pointer items-center justify-between gap-5 rounded-lg px-3 py-2">
                <span>{text.marketing}</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  className="cc-check h-4 w-4"
                />
              </label>
            </div>
          )}

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {!customizing && (
              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="cc-btn cc-ghost px-4 py-2 text-sm font-semibold"
              >
                {text.customize}
              </button>
            )}
            <button
              type="button"
              onClick={() => save({ analytics: false, marketing: false })}
              className="cc-btn cc-ghost px-4 py-2 text-sm font-semibold"
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
              className="cc-btn cc-cta px-4 py-2 text-sm font-bold"
            >
              {customizing ? text.save : text.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
