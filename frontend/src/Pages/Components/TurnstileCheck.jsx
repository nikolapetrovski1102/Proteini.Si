import { useEffect, useImperativeHandle, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../../utils/turnstile";

// Cloudflare Turnstile ("I'm not a robot") shown only on checkout. Empty site key = check off.

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_WAIT_MS = 15000;

let scriptPromise = null;
const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

/**
 * Exposes through `ref`:
 *  - takeToken(): resolves to a fresh token (waits for the check to finish) or null, then
 *    resets the widget, because each token works only once on the server.
 */
export default function TurnstileCheck({ ref, language }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const tokenRef = useRef(null);
  const waitersRef = useRef([]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let cancelled = false;

    const settle = (token) => {
      tokenRef.current = token;
      if (!token) return;
      waitersRef.current.forEach((resolve) => resolve(token));
      waitersRef.current = [];
    };

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "checkout",
          language: language === "al" ? "sq" : "auto",
          theme: "light",
          size: "flexible",
          callback: settle,
          "expired-callback": () => settle(null),
          "error-callback": () => settle(null),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [language]);

  useImperativeHandle(ref, () => ({
    async takeToken() {
      if (!TURNSTILE_SITE_KEY) return null;
      const token =
        tokenRef.current ||
        (await new Promise((resolve) => {
          const done = (value) => {
            clearTimeout(timer);
            resolve(value);
          };
          const timer = setTimeout(() => {
            waitersRef.current = waitersRef.current.filter((waiter) => waiter !== done);
            resolve(null);
          }, TOKEN_WAIT_MS);
          waitersRef.current.push(done);
        }));
      tokenRef.current = null;
      if (widgetIdRef.current != null) window.turnstile?.reset(widgetIdRef.current);
      return token;
    },
  }));

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-[65px] w-full" />;
}
