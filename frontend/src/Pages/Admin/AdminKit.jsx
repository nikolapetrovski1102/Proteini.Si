/* Shared building blocks for every admin screen.
 *
 * Same visual language as the storefront redesign: ink (#141409) for primary
 * actions, brand yellow (#FDC700) as the accent, warm cream (#f6f5f1) surfaces,
 * Oswald display headings and soft-ring cards. Keep admin pages on these so the
 * whole back office reads as one tool.
 */
import {
  createElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiExternalLink,
  FiInfo,
  FiSearch,
  FiUploadCloud,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { InlineLoader } from "../Components/Loaders/BrandLoader";
import { FeedbackContext } from "./adminFeedback";
import { ORDER_STATUS, PAYMENT_STATUS, buttonClass } from "./adminUtils";
import { GEMINI_PROMPTS, GEMINI_TIPS } from "./geminiPrompts";

/* ------------------------------------------------------------------ classes */

export const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";

export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500";

export const cardClass = "rounded-2xl bg-white ring-1 ring-black/[0.06]";

export const inputClass =
  "block w-full min-h-[44px] rounded-xl bg-[#f6f5f1] px-3.5 text-sm text-gray-900 ring-1 ring-black/[0.08] placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#141409] disabled:cursor-not-allowed disabled:opacity-60";

export const selectClass = `${inputClass} cursor-pointer pr-9`;

export const textareaClass =
  "block w-full min-h-[96px] rounded-xl bg-[#f6f5f1] px-3.5 py-3 text-sm leading-relaxed text-gray-900 ring-1 ring-black/[0.08] placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#141409] disabled:opacity-60";

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

/** Square icon-only button. `label` is required for screen readers and the tooltip. */
export function IconButton({ icon, label, tone = "default", className = "", ...props }) {
  const tones = {
    default: "text-gray-600 hover:bg-black/[0.06] hover:text-gray-900",
    danger: "text-gray-500 hover:bg-[#E3262F]/10 hover:text-[#b3191f]",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    >
      {createElement(icon, { size: 16, "aria-hidden": true })}
    </button>
  );
}

/* ------------------------------------------------------------------- layout */

/**
 * Title row + body for one admin screen.
 *  description – one or two plain sentences: what this page controls on the site.
 *  actions     – primary buttons, right-aligned on desktop.
 */
export function AdminPage({ eyebrow, title, description, actions, children, count }) {
  return (
    <div className="min-w-0">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div className="min-w-0 max-w-2xl">
          {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
          <h1 className={`${headingClass} mt-1.5 text-[30px] sm:text-[40px]`}>
            {title}
            {typeof count === "number" && (
              <span className="ml-3 align-middle font-sans text-base font-bold tracking-normal text-gray-400">
                {count}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

/** White panel with an optional title row. */
export function Card({ title, description, actions, children, className = "", bodyClassName = "p-5 sm:p-6" }) {
  return (
    <section className={`${cardClass} ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Labelled form row. Pass `hint` for a short "what is this for" line. */
export function Field({ label, hint, htmlFor, required, children, className = "", error }) {
  const autoId = useId();
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor || autoId} className="mb-1.5 block text-[13px] font-semibold text-gray-800">
          {label}
          {required && <span className="ml-0.5 text-[#E3262F]" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#b3191f]">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-snug text-gray-500">{hint}</p>
      )}
    </div>
  );
}

/** Small uppercase divider used inside long forms. */
export function FormSection({ title, description, children, className = "" }) {
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className="mb-1 text-sm font-bold text-gray-900">{title}</legend>
      {description && <p className="mb-4 text-xs leading-snug text-gray-500">{description}</p>}
      {!description && <div className="mb-3" />}
      {children}
    </fieldset>
  );
}

/** On/off switch with a label and optional explanation. Replaces bare checkboxes. */
export function Toggle({ checked, onChange, label, description, disabled, className = "" }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03] ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="h-6 w-10 rounded-full bg-black/[0.15] transition peer-checked:bg-[#141409] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FDC700] peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-4 peer-checked:bg-[#FDC700]" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-snug text-gray-500">{description}</span>}
      </span>
    </label>
  );
}

/** Two-to-four option segmented control. options: [{ value, label }] */
export function Segmented({ value, onChange, options, className = "" }) {
  return (
    <div className={`inline-flex rounded-xl bg-[#f6f5f1] p-1 ring-1 ring-black/[0.06] ${className}`} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`min-h-[36px] rounded-lg px-3.5 text-[13px] font-bold transition ${
              active ? "bg-[#141409] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span className={`ml-1.5 tabular-nums ${active ? "text-[#FDC700]" : "text-gray-400"}`}>{opt.count}</span>
            )}
            {opt.alert && (
              <>
                <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-[#E3262F] align-middle" aria-hidden="true" />
                <span className="sr-only"> (needs attention)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className = "", label = "Search" }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-black/[0.06] hover:text-gray-700"
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ status/badges */

const badgeTones = {
  neutral: "bg-black/[0.06] text-gray-700",
  ink: "bg-[#141409] text-white",
  yellow: "bg-[#FDC700]/25 text-[#5c4800]",
  green: "bg-[#8DC658]/20 text-[#2f5e14]",
  red: "bg-[#E3262F]/10 text-[#a3161d]",
  blue: "bg-sky-100 text-sky-800",
  orange: "bg-orange-100 text-orange-800",
  pink: "bg-pink-100 text-pink-800",
};

export function Badge({ tone = "neutral", children, className = "", dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeTones[tone] || badgeTones.neutral} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Green "Visible" / grey "Hidden" pill for active flags. */
export function VisibilityBadge({ active, on = "Visible", off = "Hidden" }) {
  return (
    <Badge tone={active ? "green" : "neutral"} dot>
      {active ? on : off}
    </Badge>
  );
}

/* -------------------------------------------------------------- feedback UI */

export function Notice({ tone = "info", title, children, onDismiss, className = "" }) {
  if (!children && !title) return null;
  const tones = {
    error: ["bg-[#E3262F]/[0.07] text-[#a3161d] ring-[#E3262F]/20", FiXCircle],
    success: ["bg-[#8DC658]/[0.12] text-[#2f5e14] ring-[#8DC658]/30", FiCheckCircle],
    info: ["bg-[#FDC700]/[0.16] text-[#5c4800] ring-[#FDC700]/40", FiInfo],
    warning: ["bg-orange-50 text-orange-900 ring-orange-200", FiAlertTriangle],
  };
  const [cls, Icon] = tones[tone] || tones.info;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-snug ring-1 ${cls} ${className}`}>
      <Icon className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="-mr-1 rounded-md p-1 opacity-70 hover:opacity-100">
          <FiX size={15} />
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-14 ${className}`}>
      <InlineLoader size={32} />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDC700] text-[#141409]">
          <Icon size={24} aria-hidden="true" />
        </span>
      )}
      <p className="text-base font-bold text-gray-900">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------- table */

export const tableWrapClass = "overflow-x-auto";
export const tableClass = "w-full text-left text-sm";
export const thClass =
  "whitespace-nowrap border-b border-black/[0.06] bg-[#faf9f6] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500";
export const tdClass = "px-4 py-3 align-middle text-gray-800";
export const trClass = "border-b border-black/[0.05] last:border-0 transition hover:bg-black/[0.02]";

/* -------------------------------------------------------------------- modal */

/**
 * Accessible dialog. Closes on Escape and backdrop click, locks page scroll.
 *  size: sm | md | lg | xl
 *  footer: action buttons, rendered in a sticky bar.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md", dismissable = true }) {
  const panelRef = useRef(null);
  // Callers usually pass an inline onClose; keep it in a ref so the effect below
  // only runs when the modal opens — otherwise every keystroke re-ran it and
  // stole focus back to the first input.
  const onCloseRef = useRef(onClose);
  const dismissableRef = useRef(dismissable);
  useEffect(() => {
    onCloseRef.current = onClose;
    dismissableRef.current = dismissable;
  });

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && dismissableRef.current) onCloseRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector("[data-autofocus], input:not([type=hidden]), textarea, select");
      (el || panelRef.current)?.focus?.();
    }, 30);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };

  return createPortal(
    <div className="admin-shell fixed inset-0 z-[70] flex items-end justify-center sm:items-start sm:overflow-y-auto sm:p-6 sm:pt-[6vh]">
      <div className="fixed inset-0 bg-[#141409]/50 backdrop-blur-[2px]" onClick={dismissable ? onClose : undefined} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-[0_32px_64px_-24px_rgba(20,20,9,0.5)] outline-none sm:max-h-none sm:rounded-3xl ${widths[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-gray-900">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
          </div>
          {dismissable && <IconButton icon={FiX} label="Close" onClick={onClose} className="-mr-2 -mt-1" />}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:overflow-visible sm:px-7 sm:py-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 rounded-b-3xl border-t border-black/[0.06] bg-white px-5 py-4 sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------- image picker */

/**
 * Click-or-drop image picker with preview.
 *  preview  – current image URL (existing or object URL)
 *  onFile   – receives the chosen File
 *  aspect   – tailwind aspect class for the preview box
 */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure pages: fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/**
 * "Copy Gemini prompt" for an image slot: a ready prompt that turns an image the admin already has
 * into a sharp version in the size this slot needs, without redesigning it. See geminiPrompts.js.
 */
export function GeminiPromptButton({ promptKey, className = "" }) {
  const entry = GEMINI_PROMPTS[promptKey];
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!entry) return null;

  const copy = async (e) => {
    e.stopPropagation();
    if (await copyText(entry.prompt)) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 6000);
    }
  };

  return (
    <div className={`rounded-lg bg-[#f6f5f1] px-3 py-2 text-xs leading-snug text-gray-600 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          Најдобра големина: <span className="font-semibold text-gray-800">{entry.size}</span>
        </span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 font-semibold text-[#141409] hover:underline">
          {copied ? <FiCheck size={13} aria-hidden="true" /> : <FiCopy size={13} aria-hidden="true" />}
          {copied ? "Промптот е копиран" : "Копирај Gemini промпт"}
        </button>
        <a
          href="https://gemini.google.com/app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-[#141409] hover:underline"
        >
          Отвори Gemini <FiExternalLink size={12} aria-hidden="true" />
        </a>
      </div>
      {copied && (
        <p className="mt-1.5 text-gray-500" role="status">
          Во Gemini: прикачете ја сегашната слика, залепете го промптот и испратете. Текстот на сликата ќе биде на македонски. {GEMINI_TIPS}
        </p>
      )}
    </div>
  );
}

export function ImagePicker({ preview, onFile, onClear, label = "Choose image", hint, aspect = "aspect-video", accept = "image/*", fit = "object-cover", className = "", promptKey }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (file && onFile) onFile(file);
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), inputRef.current?.click())}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-[#f6f5f1] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141409] ${aspect} ${
          dragging ? "border-[#FDC700]" : "border-black/[0.12] hover:border-black/30"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className={`h-full w-full ${fit}`} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-left text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              Click or drop to replace
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <FiUploadCloud size={24} className="text-gray-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <span className="text-xs text-gray-500">Click or drag a file here</span>
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {(hint || (preview && onClear)) && (
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {hint ? <p className="text-xs leading-snug text-gray-500">{hint}</p> : <span />}
          {preview && onClear && (
            <button type="button" onClick={onClear} className="shrink-0 text-xs font-semibold text-[#b3191f] hover:underline">
              Remove
            </button>
          )}
        </div>
      )}
      {promptKey && <GeminiPromptButton promptKey={promptKey} className="mt-2" />}
    </div>
  );
}

/* ------------------------------------------------- toasts, confirm & prompt */


/**
 * Mount once (AdminLayout does). Provides:
 *   const toast = useToast();      toast.success("Saved") / toast.error(msg)
 *   const confirm = useConfirm();  if (await confirm({ title, message, confirmLabel, tone: "danger" })) …
 *   const prompt = usePrompt();    const value = await prompt({ title, label, defaultValue }) // null on cancel
 */
export function AdminFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone, message, opts = {}) => {
      if (!message) return;
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, tone, message: String(message) }]);
      setTimeout(() => dismiss(id), opts.duration ?? (tone === "error" ? 7000 : 3500));
    },
    [dismiss],
  );

  const toastApi = useMemo(
    () => ({
      success: (m, o) => push("success", m, o),
      error: (m, o) => push("error", m, o),
      info: (m, o) => push("info", m, o),
    }),
    [push],
  );

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setDialog({ kind: "confirm", ...(typeof opts === "string" ? { message: opts } : opts), resolve });
      }),
    [],
  );

  const prompt = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setDialog({ kind: "prompt", ...opts, resolve });
      }),
    [],
  );

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast: toastApi, confirm, prompt }}>
      {children}
      <div className="pointer-events-none fixed bottom-[calc(var(--bottom-nav-h,0px)+16px)] right-4 z-[80] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto admin-toast-in">
            <Toast tone={t.tone} onDismiss={() => dismiss(t.id)}>
              {t.message}
            </Toast>
          </div>
        ))}
      </div>
      {dialog && <FeedbackDialog dialog={dialog} onClose={close} />}
    </FeedbackContext.Provider>
  );
}

function Toast({ tone, children, onDismiss }) {
  const icons = { success: FiCheckCircle, error: FiXCircle, info: FiInfo };
  const iconColor = { success: "text-[#8DC658]", error: "text-[#ff6b72]", info: "text-[#FDC700]" };
  const Icon = icons[tone] || FiInfo;
  return (
    <div className="admin-ink-panel flex items-start gap-3 rounded-2xl bg-[#141409] px-4 py-3 text-sm text-white shadow-[0_16px_32px_-12px_rgba(20,20,9,0.55)]">
      <Icon className={`mt-0.5 shrink-0 ${iconColor[tone]}`} size={17} aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-snug">{children}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="-mr-1 rounded-md p-0.5 text-white/50 hover:text-white">
        <FiX size={15} />
      </button>
    </div>
  );
}

function FeedbackDialog({ dialog, onClose }) {
  const [value, setValue] = useState(dialog.defaultValue ?? "");
  const isPrompt = dialog.kind === "prompt";
  const danger = dialog.tone === "danger";

  const submit = (e) => {
    e?.preventDefault();
    onClose(isPrompt ? value : true);
  };

  return (
    <Modal
      open
      size="sm"
      onClose={() => onClose(isPrompt ? null : false)}
      title={dialog.title || (isPrompt ? "Enter a value" : "Are you sure?")}
      footer={
        <>
          <Button variant="secondary" onClick={() => onClose(isPrompt ? null : false)}>
            {dialog.cancelLabel || "Cancel"}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={submit} data-autofocus={!isPrompt || undefined}>
            {dialog.confirmLabel || (isPrompt ? "Save" : "Confirm")}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {dialog.message && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{dialog.message}</p>}
        {isPrompt && (
          <Field label={dialog.label} hint={dialog.hint}>
            <input className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} placeholder={dialog.placeholder} />
          </Field>
        )}
      </form>
    </Modal>
  );
}

export function OrderStatusBadge({ status }) {
  const [label, tone] = ORDER_STATUS[String(status || "").toLowerCase()] || [status || "—", "neutral"];
  return <Badge tone={tone} dot>{label}</Badge>;
}

export function PaymentStatusBadge({ status }) {
  const [label, tone] = PAYMENT_STATUS[String(status || "").toLowerCase()] || [status || "—", "neutral"];
  return <Badge tone={tone}>{label}</Badge>;
}
