import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import TurnstileCheck from "../Pages/Components/TurnstileCheck";
import { TURNSTILE_SITE_KEY } from "../utils/turnstile";
import { Button, Field, Notice } from "./ui";
import { inputClass } from "./format";

const EMAIL_KEY = "pm-meta-ads-email";
const readEmail = () => {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

export default function Login({ initialError, onSignedIn }) {
  const [options, setOptions] = useState(null);
  const [email, setEmail] = useState(readEmail);
  const [step, setStep] = useState("email"); // email | code
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const turnstileRef = useRef(null);

  // A fresh "not a robot" token for one request; each token works only once.
  const robotToken = async () => {
    if (!TURNSTILE_SITE_KEY) return null;
    const token = await turnstileRef.current?.takeToken();
    if (!token) throw new Error("Please confirm you are not a robot (the box above the button) and try again.");
    return token;
  };

  useEffect(() => {
    api.authOptions().then(setOptions, () => setOptions({ duoEnabled: false, emailCodeEnabled: true }));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const remember = () => {
    try {
      localStorage.setItem(EMAIL_KEY, email.trim());
    } catch {
      /* private mode */
    }
  };

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startDuo = () =>
    run(async () => {
      remember();
      const { redirectUrl } = await api.startDuo(email.trim(), await robotToken());
      window.location.assign(redirectUrl);
    });

  const sendCode = () =>
    run(async () => {
      remember();
      const result = await api.sendCode(email.trim(), await robotToken());
      setInfo(result.message);
      setCooldown(result.retryAfterSeconds || 60);
      setStep("code");
    });

  const verify = (value = code) =>
    run(async () => {
      const result = await api.verifyCode(email.trim(), value);
      onSignedIn(result.user);
    });

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logos/proteini.svg" alt="Proteini.si" className="mx-auto h-11 w-auto" />
          <div className="text-sm text-[#6b6b63] mt-1">Meta ads dashboard · staff only</div>
        </div>

        <div className="bg-white border border-[#e7e4da] rounded-2xl p-6 space-y-4">
          {error && <Notice tone="error">{error}</Notice>}

          <TurnstileCheck ref={turnstileRef} language="en" />

          {step === "email" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!validEmail || busy) return;
                if (options?.duoEnabled) startDuo();
                else sendCode();
              }}
            >
              <Field label="Work email">
                <input
                  className={inputClass}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@proteini.mk"
                />
              </Field>

              {options?.duoEnabled && (
                <Button type="submit" className="w-full" disabled={!validEmail || busy}>
                  {busy ? "Opening Duo…" : "Sign in with Duo"}
                </Button>
              )}

              {options?.emailCodeEnabled && (
                <Button
                  type={options?.duoEnabled ? "button" : "submit"}
                  variant={options?.duoEnabled ? "ghost" : "primary"}
                  className="w-full"
                  disabled={!validEmail || busy}
                  onClick={options?.duoEnabled ? sendCode : undefined}
                >
                  {options?.duoEnabled ? "No phone? Email me a code" : busy ? "Sending…" : "Email me a sign-in code"}
                </Button>
              )}

              {options && !options.duoEnabled && !options.emailCodeEnabled && (
                <Notice tone="warn">Sign-in is not set up on the server yet.</Notice>
              )}
            </form>
          )}

          {step === "code" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.length === 6 && !busy) verify();
              }}
            >
              {info && <p className="text-sm text-[#6b6b63]">{info}</p>}
              <Field label={`Code sent to ${email.trim()}`}>
                <input
                  className={`${inputClass} text-center font-display text-3xl tracking-[0.5em]`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(digits);
                    if (digits.length === 6) verify(digits);
                  }}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={code.length !== 6 || busy}>
                {busy ? "Checking…" : "Sign in"}
              </Button>
              <div className="flex justify-between text-sm">
                <Button variant="link" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
                  Change email
                </Button>
                <Button variant="link" disabled={cooldown > 0 || busy} onClick={sendCode}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
