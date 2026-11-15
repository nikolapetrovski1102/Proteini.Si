import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiInfo, FiX } from "react-icons/fi";
import { useLanguage } from "../../translation/LanguageContext";
import { dismissNotify, getFeedback, settleDialog, subscribeFeedback } from "./siteFeedback";

const VISIBLE_MS = 4200;
const FADE_MS = 350; // .cart-toast transition in index.css

const BADGES = {
  success: { className: "bg-[#1f9d55]", icon: <FiCheck size={16} strokeWidth={3} /> },
  error: { className: "bg-[#b3233b]", icon: <FiAlertCircle size={16} strokeWidth={2.5} /> },
  info: { className: "bg-[#141409]", icon: <FiInfo size={16} strokeWidth={2.5} /> },
};

/** Renders notify() toasts and confirmDialog() questions from siteFeedback.js. Mount once near the app root. */
export default function SiteFeedbackHost() {
  const { toast, dialog } = useSyncExternalStore(subscribeFeedback, getFeedback, getFeedback);
  return (
    <>
      <FeedbackToast toast={toast} />
      {dialog && <ConfirmModal key={dialog.id} dialog={dialog} />}
    </>
  );
}

function FeedbackToast({ toast }) {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [shown, setShown] = useState(null);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);
  const hovered = useRef(false);

  // Same enter / hover-to-hold / fade-out rhythm as the cart toast.
  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    clear();
    if (toast) {
      later(() => {
        setShown(toast);
        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      }, 0);
      const autoClose = () => (hovered.current ? later(autoClose, 800) : dismissNotify());
      later(autoClose, toast.duration || (toast.action ? VISIBLE_MS + 1500 : VISIBLE_MS));
    } else {
      later(() => setVisible(false), 0);
      later(() => setShown(null), FADE_MS);
    }
    return clear;
  }, [toast]);

  if (!shown) return null;
  const badge = BADGES[shown.tone] || BADGES.info;
  const runAction = () => {
    dismissNotify();
    if (shown.action?.to) navigate(shown.action.to);
    shown.action?.onClick?.();
  };

  return (
    <div
      role={shown.tone === "error" ? "alert" : "status"}
      aria-live={shown.tone === "error" ? "assertive" : "polite"}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      className={`cart-toast fixed z-[76] max-sm:inset-x-3 max-sm:bottom-3 sm:right-5 sm:top-28 sm:w-[360px] ${
        visible ? "is-visible" : "pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${badge.className}`}>
          {badge.icon}
        </span>
        <div className="min-w-0 flex-1">
          {shown.title && <p className="text-[13px] font-bold text-gray-900">{shown.title}</p>}
          {shown.message && (
            <p className={`text-[13px] leading-snug ${shown.title ? "text-gray-500" : "font-semibold text-gray-900"}`}>
              {shown.message}
            </p>
          )}
        </div>
        {shown.action && (
          <button
            type="button"
            onClick={runAction}
            className="shrink-0 rounded-lg bg-[#141409] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-black"
          >
            {shown.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={dismissNotify}
          aria-label={translate("close")}
          className="shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ dialog }) {
  const { translate } = useLanguage();
  const confirmRef = useRef(null);
  const danger = dialog.tone === "danger";

  useEffect(() => {
    const previous = document.activeElement;
    confirmRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && settleDialog(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="menu-fade-up absolute inset-0 bg-black/40" onClick={() => settleDialog(false)} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={dialog.title ? "site-confirm-title" : undefined}
        aria-describedby={dialog.message ? "site-confirm-message" : undefined}
        className="menu-fade-up relative w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-[0_30px_60px_-20px_rgba(20,20,9,0.45)] ring-1 ring-black/[0.08] sm:p-6"
      >
        {dialog.title && (
          <h2 id="site-confirm-title" className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-gray-900">
            {dialog.title}
          </h2>
        )}
        {dialog.message && (
          <p
            id="site-confirm-message"
            className={`whitespace-pre-line text-sm leading-relaxed ${dialog.title ? "mt-2 text-gray-600" : "font-semibold text-gray-900"}`}
          >
            {dialog.message}
          </p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => settleDialog(false)}
            className="h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-900 transition hover:border-gray-500"
          >
            {dialog.cancelLabel || translate("cancel")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => settleDialog(true)}
            className={`h-11 rounded-lg px-5 text-sm font-bold text-white transition active:scale-[0.98] ${
              danger ? "bg-[#b3233b] hover:bg-[#9a1d31]" : "bg-[#141409] hover:bg-black"
            }`}
          >
            {dialog.confirmLabel || translate("confirmAction")}
          </button>
        </div>
      </div>
    </div>
  );
}
