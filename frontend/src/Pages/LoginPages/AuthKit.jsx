import { useEffect, useRef, useState } from "react";
import { checkPasswordStrength } from "./authUtils";
import { FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { Sparkle } from "../HomePages/sections/Decor";

export const headingClass =
  "font-display font-bold uppercase tracking-tight leading-[0.95] text-gray-900 [text-wrap:balance]";

export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500";

export const inputClass =
  "auth-input block w-full min-h-[48px] rounded-xl bg-[#f6f5f1] px-4 text-[15px] text-gray-900 ring-1 ring-black/[0.08] placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#141409]";

export const primaryButtonClass =
  "group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#141409] px-7 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const linkButtonClass =
  "font-semibold text-gray-900 underline decoration-[#FDC700] decoration-2 underline-offset-4 transition hover:decoration-[#141409] disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline";

/* ---------------------------------------------------------------- password */

const STRENGTH_LEVELS = [
  { key: "pwNotStarted", color: "#e5e5e0" },
  { key: "pwVeryWeak", color: "#E3262F" },
  { key: "pwWeak", color: "#F08A24" },
  { key: "pwFair", color: "#FDC700" },
  { key: "pwStrong", color: "#8DC658" },
  { key: "pwVeryStrong", color: "#4E9A2A" },
];

const REQUIREMENT_KEYS = [
  ["minLength", "pwReqLength"],
  ["uppercase", "pwReqUpper"],
  ["lowercase", "pwReqLower"],
  ["digit", "pwReqDigit"],
  ["specialChar", "pwReqSpecial"],
];

/** Segmented strength meter plus a checklist of the five password rules. */
export function PasswordStrength({ password, translate }) {
  const { requirements, metCount } = checkPasswordStrength(password);
  const level = STRENGTH_LEVELS[metCount];

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{ background: i <= metCount ? level.color : "#e5e5e0" }}
            />
          ))}
        </div>
        <span className="min-w-[72px] text-right text-xs font-semibold text-gray-600">
          {translate(level.key)}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {REQUIREMENT_KEYS.map(([req, key]) => {
          const met = requirements[req];
          return (
            <li
              key={req}
              className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-gray-900" : "text-gray-500"}`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${met ? "bg-[#8DC658] text-white" : "bg-black/[0.06]"}`}
              >
                {met && <FiCheck size={10} strokeWidth={3.5} />}
              </span>
              {translate(key)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ fields */

export function Field({ label, htmlFor, hint, children, className = "" }) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-gray-800"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function PasswordInput({ id, translate, className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-12 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-black/[0.05] hover:text-gray-900"
        aria-label={translate(visible ? "hidePassword" : "showPassword")}
        aria-pressed={visible}
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  if (!children) return null;
  const tones = {
    error: "bg-[#E3262F]/[0.07] text-[#a3161d] ring-[#E3262F]/20",
    success: "bg-[#8DC658]/[0.12] text-[#2f5e14] ring-[#8DC658]/30",
    info: "bg-[#FDC700]/[0.16] text-[#5c4800] ring-[#FDC700]/40",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm leading-snug ring-1 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- shell */

/**
 * Two-column auth layout: an ink brand panel (desktop) beside the form card.
 *  aside – content for the dark panel; hidden below lg, where `mobileAside`
 *          (if any) is rendered under the card instead.
 */
export function AuthShell({ children, aside, mobileAside }) {
  return (
    <div className="home-tint bg-[#f6f5f1]">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-stretch lg:gap-8 lg:py-16">
        <aside className="relative hidden overflow-hidden rounded-3xl bg-[#141409] p-10 text-white lg:flex lg:flex-col xl:p-12">
          <Sparkle color="#FDC700" className="absolute right-[12%] top-[10%] h-9 w-9" />
          <Sparkle color="#ffffff" className="absolute right-[24%] top-[22%] h-4 w-4 opacity-70" />
          <Sparkle color="#E3262F" className="absolute bottom-[14%] right-[10%] h-6 w-6" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#FDC700]/[0.12] blur-2xl"
          />
          <div className="relative flex flex-1 flex-col">{aside}</div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-32px_rgba(20,20,9,0.4)] sm:p-9">
            {children}
          </div>
          {mobileAside && <div className="mt-6 lg:hidden">{mobileAside}</div>}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- OTP */

/**
 * Six single-digit boxes that behave like one field: typing advances, Backspace
 * steps back, arrows move, and pasting (or SMS/email autofill) fills them all.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  autoFocus = true,
  labelledBy,
}) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // Re-enabled after a failed attempt with the boxes cleared: start over.
  useEffect(() => {
    if (!disabled && !value) refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const focusAt = (i) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const commit = (next) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const handleInput = (i, raw) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Autofill or fast typing can deliver several digits into one box.
    const before = value.slice(0, i);
    const next = (before + typed).slice(0, length);
    commit(next + value.slice(next.length));
    focusAt(next.length);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        commit(value.slice(0, i) + value.slice(i + 1));
        focusAt(i);
      } else if (i > 0) {
        commit(value.slice(0, i - 1) + value.slice(i));
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    commit(pasted);
    focusAt(pasted.length);
  };

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="flex justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? length : 1}
          aria-label={`${i + 1} / ${length}`}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`auth-otp h-14 w-full min-w-0 max-w-[60px] rounded-xl bg-[#f6f5f1] text-center font-display text-[26px] font-bold tabular-nums text-gray-900 ring-1 transition focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 sm:h-16 sm:text-3xl ${
            invalid
              ? "ring-[#E3262F]/60 focus:ring-[#E3262F]"
              : digit
                ? "bg-white ring-[#141409]/70 focus:ring-[#141409]"
                : "ring-black/[0.08] focus:ring-[#141409]"
          }`}
        />
      ))}
    </div>
  );
}
