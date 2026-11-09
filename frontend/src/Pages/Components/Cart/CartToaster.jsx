import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheck, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";
import { useLanguage } from "../../translation/LanguageContext";
import { dismissToast, getToast, subscribeToast } from "./cartFeedback";

const VISIBLE_MS = 3600;
const UNDO_VISIBLE_MS = 5000; // a bit longer so there is time to undo
const FADE_MS = 350; // keep in sync with .cart-toast transition in index.css

/** Cart toast (added / removed with undo / failed). Mount once near the app root. */
export default function CartToaster() {
  const toast = useSyncExternalStore(subscribeToast, getToast, getToast);
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [shown, setShown] = useState(null); // toast currently rendered (kept during fade-out)
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);
  const hovered = useRef(false);

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
      const autoClose = () => (hovered.current ? later(autoClose, 800) : dismissToast());
      later(autoClose, toast.kind === "removed" ? UNDO_VISIBLE_MS : VISIBLE_MS);
    } else {
      later(() => setVisible(false), 0);
      later(() => setShown(null), FADE_MS);
    }
    return clear;
  }, [toast]);

  if (!shown) return null;

  const kind = shown.kind || "added";
  const titleKey = { added: "addedToCart", removed: "removedFromCart", error: "addToCartFailed" }[kind];
  const badge = {
    added: { className: "bg-[#1f9d55]", icon: <FiCheck size={14} strokeWidth={3} /> },
    removed: { className: "bg-gray-700", icon: <FiTrash2 size={12} strokeWidth={2.5} /> },
    error: { className: "bg-[#b3233b]", icon: <FiX size={14} strokeWidth={3} /> },
  }[kind];

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      className={`cart-toast fixed z-[75] max-sm:inset-x-3 max-sm:bottom-3 sm:right-5 sm:top-28 sm:w-[360px] ${
        visible ? "is-visible" : "pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
        <div className="relative h-14 w-14 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f8f7f4] to-[#efede7]">
            {shown.image ? (
              <img
                src={shown.image}
                alt=""
                className={`h-full w-full object-contain p-1.5 mix-blend-multiply ${kind === "removed" ? "opacity-50 grayscale" : ""}`}
              />
            ) : (
              kind === "error" && <FiAlertCircle size={22} className="text-[#b3233b]" />
            )}
          </div>
          <span
            className={`cart-toast-check absolute -bottom-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white ${badge.className}`}
          >
            {badge.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-gray-900">{translate(titleKey)}</p>
          {shown.name && (
            <p className="truncate text-[12px] text-gray-500">
              {shown.quantity > 1 ? `${shown.quantity} × ` : ""}
              {shown.name}
            </p>
          )}
        </div>
        {kind === "added" && (
          <button
            type="button"
            onClick={() => {
              dismissToast();
              navigate("/cart");
            }}
            className="flex-shrink-0 rounded-full bg-[#141409] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-black"
          >
            {translate("viewCart")}
          </button>
        )}
        {kind === "removed" && shown.onUndo && (
          <button
            type="button"
            onClick={() => {
              dismissToast();
              shown.onUndo();
            }}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#141409] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-black"
          >
            <FiRotateCcw size={13} />
            {translate("undo")}
          </button>
        )}
        <button
          type="button"
          onClick={dismissToast}
          aria-label={translate("close")}
          className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}
