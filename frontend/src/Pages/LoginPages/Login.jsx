import { createElement, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiHeart,
  FiMail,
  FiPackage,
  FiStar,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../translation/LanguageContext";
import { COUNTRIES } from "../Components/countries";
import {
  Alert,
  AuthShell,
  Field,
  OtpInput,
  PasswordInput,
  PasswordStrength,
  eyebrowClass,
  headingClass,
  inputClass,
  linkButtonClass,
  primaryButtonClass,
} from "./AuthKit";
import { checkPasswordStrength, useCountdown } from "./authUtils";

// Survives a refresh while the user goes to their inbox for the code.
const PENDING_KEY = "pendingEmailVerification";

const readPending = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    const pending = raw ? JSON.parse(raw) : null;
    return pending?.email ? pending : null;
  } catch {
    return null;
  }
};

const writePending = (pending) => {
  try {
    if (pending) sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable: the flow still works for this page view */
  }
};

const EMPTY_REGISTER = {
  User_FullName: "",
  User_Email: "",
  Password: "",
  PasswordConfirm: "",
  Company_Name: "",
  Company_Address: "",
  Company_TaxNumber: "",
  Company_PostCode: "",
  Company_City: "",
  Company_Country: "",
  Company_Phone: "",
};

const BENEFITS = [
  [FiZap, "fasterPurchase"],
  [FiPackage, "trackOrderStatus"],
  [FiStar, "collectAndUseLoyalty"],
  [FiHeart, "favoriteProductList"],
];

const errorText = (err, fallback) =>
  err?.data?.errors?.[0] || err?.message || fallback;

export default function Login() {
  const { login, register, forgotPassword, verifyEmail, resendVerificationCode } =
    useAuth();
  const navigate = useNavigate();
  const { translate, language } = useLanguage();

  const [pending, setPending] = useState(readPending);
  const [view, setView] = useState(() => (readPending() ? "verify" : "login"));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const goTo = (next) => {
    setNotice("");
    setView(next);
  };

  const startVerification = (email, retryAfterSeconds, message = "") => {
    const next = {
      email,
      resendAt: Date.now() + (retryAfterSeconds ?? 60) * 1000,
    };
    writePending(next);
    setPending(next);
    setNotice(message);
    setView("verify");
  };

  const finishSignIn = (response) => {
    writePending(null);
    const isMaintenanceMode = localStorage.getItem("maintenance_mode") === "true";
    const isSuperAdmin =
      response.user?.superAdmin === true || response.user?.SuperAdmin === true;
    navigate(isMaintenanceMode && !isSuperAdmin ? "/maintenance" : "/profile");
  };

  const leaveVerification = (target) => {
    writePending(null);
    setPending(null);
    goTo(target);
  };

  const aside = (
    <>
      <p className={`${eyebrowClass} !text-[#FDC700]`}>Proteini.si</p>
      <h2 className="mt-4 max-w-[440px] font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight [text-wrap:balance] xl:text-6xl">
        {translate("authAsideTitle")}
      </h2>
      <p className="mt-5 max-w-[400px] text-[15px] leading-relaxed text-white/70">
        {translate("proteiniSiAllows")}
      </p>
      <ul className="mt-8 space-y-3">
        {BENEFITS.map(([icon, key]) => (
          <li key={key} className="flex items-center gap-3 text-[15px] font-medium">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[#FDC700]">
              {createElement(icon, { size: 17 })}
            </span>
            {translate(key)}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FDC700] px-4 py-2 text-sm font-bold text-[#141409]">
          <FiStar size={15} />
          {translate("exclusiveBenefits1")}
        </div>
      </div>
    </>
  );

  const mobileAside = (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06]">
      <p className={eyebrowClass}>{translate("proteiniSiAllows")}</p>
      <ul className="mt-3 grid grid-cols-2 gap-3">
        {BENEFITS.map(([icon, key]) => (
          <li key={key} className="flex items-start gap-2 text-[13px] font-medium leading-snug text-gray-800">
            {createElement(icon, { size: 15, className: "mt-0.5 shrink-0 text-[#141409]" })}
            {translate(key)}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <AuthShell aside={aside} mobileAside={view === "verify" ? null : mobileAside}>
      {(view === "login" || view === "register") && (
        <div
          role="tablist"
          aria-label={translate("authTabsLabel")}
          className="mb-8 grid grid-cols-2 rounded-full bg-[#f6f5f1] p-1 ring-1 ring-black/[0.05]"
        >
          {[
            ["login", "login"],
            ["register", "createAnAcc"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => goTo(key)}
              className={`min-h-[44px] rounded-full px-4 text-sm font-bold transition ${
                view === key
                  ? "bg-[#141409] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {translate(label)}
            </button>
          ))}
        </div>
      )}

      {view === "login" && (
        <LoginForm
          translate={translate}
          language={language}
          login={login}
          notice={notice}
          onForgot={() => goTo("forgot")}
          onSignedIn={finishSignIn}
          onNeedsVerification={(email, retry) =>
            startVerification(email, retry, translate("verifyLoginNeeded"))
          }
        />
      )}

      {view === "register" && (
        <RegisterForm
          translate={translate}
          language={language}
          register={register}
          onRegistered={(email, retry) => startVerification(email, retry)}
          onPrivacy={() => window.scrollTo(0, 0)}
        />
      )}

      {view === "forgot" && (
        <ForgotForm
          translate={translate}
          forgotPassword={forgotPassword}
          onBack={() => goTo("login")}
        />
      )}

      {view === "verify" && pending && (
        <VerifyEmailStep
          key={pending.email}
          translate={translate}
          language={language}
          pending={pending}
          notice={notice}
          verifyEmail={verifyEmail}
          resendVerificationCode={resendVerificationCode}
          onPendingChange={(next) => {
            writePending(next);
            setPending(next);
          }}
          onVerified={finishSignIn}
          onChangeEmail={() => leaveVerification("register")}
          onBackToLogin={() => leaveVerification("login")}
        />
      )}
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ login */

function LoginForm({
  translate,
  language,
  login,
  notice,
  onForgot,
  onSignedIn,
  onNeedsVerification,
}) {
  const [form, setForm] = useState({ User_Email: "", Password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login({ ...form, Language: language });
      if (response.status) onSignedIn(response);
    } catch (err) {
      if (err.data?.requiresVerification) {
        onNeedsVerification(err.data.email || form.User_Email, err.data.retryAfterSeconds);
        return;
      }
      setError(
        err.status === 401
          ? translate("authInvalidCredentials")
          : errorText(err, translate("authGenericError")),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className={`${headingClass} text-[40px] sm:text-5xl`}>
        {translate("authWelcomeBack")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
        {translate("authSignInSubtitle")}
      </p>

      <div className="mt-7 space-y-4">
        <Alert tone="info">{notice}</Alert>
        <Alert>{error}</Alert>

        <Field label={translate("eMail")} htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            name="User_Email"
            autoComplete="email"
            required
            value={form.User_Email}
            onChange={(e) => setForm({ ...form, User_Email: e.target.value })}
            className={inputClass}
            placeholder="name@email.com"
          />
        </Field>

        <Field label={translate("password")} htmlFor="login-password">
          <PasswordInput
            id="login-password"
            name="Password"
            autoComplete="current-password"
            required
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            translate={translate}
          />
        </Field>

        <div className="flex justify-end">
          <button type="button" onClick={onForgot} className={`${linkButtonClass} text-sm`}>
            {translate("forgotPassword")}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-6`}>
        {loading ? translate("loggingIn") : translate("login")}
        {!loading && (
          <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />
        )}
      </button>
    </form>
  );
}

/* --------------------------------------------------------------- register */

function RegisterForm({ translate, language, register, onRegistered, onPrivacy }) {
  const [accountType, setAccountType] = useState("natural");
  const [form, setForm] = useState(EMPTY_REGISTER);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCompany = accountType === "company";
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const confirmMismatch =
    form.PasswordConfirm.length > 0 && form.PasswordConfirm !== form.Password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!checkPasswordStrength(form.Password).isValid) {
      setError(translate("passwordTooWeak"));
      return;
    }
    if (form.Password !== form.PasswordConfirm) {
      setError(translate("passwordsDontMatch"));
      return;
    }

    const base = {
      user_Email: form.User_Email.trim(),
      password: form.Password,
      passwordConfirm: form.PasswordConfirm,
      language,
    };
    const payload = isCompany
      ? {
          ...base,
          user_IsCompany: true,
          user_Phone: form.Company_Phone || "",
          company_Name: form.Company_Name,
          company_Address: form.Company_Address,
          company_TaxNumber: form.Company_TaxNumber,
          company_PostCode: form.Company_PostCode,
          company_City: form.Company_City,
          company_Country: form.Company_Country,
          company_Phone: form.Company_Phone,
        }
      : {
          ...base,
          user_FullName: form.User_FullName.trim(),
          user_IsCompany: false,
          user_Phone: "",
        };

    setLoading(true);
    try {
      const response = await register(payload);
      if (response.status) {
        onRegistered(response.email || base.user_Email, response.retryAfterSeconds);
      }
    } catch (err) {
      setError(
        err.status === 409
          ? translate("authEmailTaken")
          : errorText(err, translate("authGenericError")),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className={`${headingClass} text-[40px] sm:text-5xl`}>
        {translate("createYourAccount")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
        {translate("authCreateSubtitle")}
      </p>

      <fieldset className="mt-7">
        <legend className="mb-2 text-[13px] font-semibold text-gray-800">
          {translate("accountType")}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["natural", FiUser, "neutralPerson"],
            ["company", FiBriefcase, "company"],
          ].map(([key, icon, label]) => {
            const Icon = icon;
            const active = accountType === key;
            return (
              <label
                key={key}
                className={`relative flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl px-4 ring-1 transition ${
                  active
                    ? "bg-[#FDC700]/[0.14] ring-2 ring-[#141409]"
                    : "bg-white ring-black/[0.1] hover:ring-black/30"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={key}
                  checked={active}
                  onChange={() => setAccountType(key)}
                  className="sr-only"
                />
                <Icon size={18} className={active ? "text-[#141409]" : "text-gray-500"} />
                <span className="text-sm font-bold text-gray-900">{translate(label)}</span>
                {active && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#141409] text-[#FDC700]">
                    <FiCheck size={12} strokeWidth={3} />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 space-y-4">
        <Alert>{error}</Alert>

        {isCompany ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={translate("companyName")} htmlFor="reg-company" className="sm:col-span-2">
              <input id="reg-company" required autoComplete="organization" value={form.Company_Name} onChange={set("Company_Name")} className={inputClass} />
            </Field>
            <Field label={translate("taxNumber")} htmlFor="reg-tax">
              <input id="reg-tax" required value={form.Company_TaxNumber} onChange={set("Company_TaxNumber")} className={inputClass} />
            </Field>
            <Field label={translate("phone")} htmlFor="reg-phone">
              <input id="reg-phone" type="tel" required autoComplete="tel" value={form.Company_Phone} onChange={set("Company_Phone")} className={inputClass} />
            </Field>
            <Field label={translate("companyAddress")} htmlFor="reg-address" className="sm:col-span-2">
              <input id="reg-address" required autoComplete="street-address" value={form.Company_Address} onChange={set("Company_Address")} className={inputClass} />
            </Field>
            <Field label={translate("city")} htmlFor="reg-city">
              <input id="reg-city" required autoComplete="address-level2" value={form.Company_City} onChange={set("Company_City")} className={inputClass} />
            </Field>
            <Field label={translate("postCode")} htmlFor="reg-post">
              <input id="reg-post" required autoComplete="postal-code" value={form.Company_PostCode} onChange={set("Company_PostCode")} className={inputClass} />
            </Field>
            <Field label={translate("country")} htmlFor="reg-country" className="sm:col-span-2">
              <select id="reg-country" required value={form.Company_Country} onChange={set("Company_Country")} className={`${inputClass} appearance-none`}>
                <option value="">{translate("selectACountry")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        ) : (
          <Field label={translate("nameAndSurname")} htmlFor="reg-name">
            <input id="reg-name" required autoComplete="name" value={form.User_FullName} onChange={set("User_FullName")} className={inputClass} />
          </Field>
        )}

        <Field label={translate("eMail")} htmlFor="reg-email" hint={translate("authEmailCodeHint")}>
          <input id="reg-email" type="email" required autoComplete="email" value={form.User_Email} onChange={set("User_Email")} className={inputClass} placeholder="name@email.com" />
        </Field>

        <Field label={translate("password")} htmlFor="reg-password">
          <PasswordInput
            id="reg-password"
            required
            autoComplete="new-password"
            value={form.Password}
            onChange={set("Password")}
            translate={translate}
          />
          {form.Password && <PasswordStrength password={form.Password} translate={translate} />}
        </Field>

        <Field label={translate("confirmYour")} htmlFor="reg-confirm">
          <PasswordInput
            id="reg-confirm"
            required
            autoComplete="new-password"
            value={form.PasswordConfirm}
            onChange={set("PasswordConfirm")}
            translate={translate}
            aria-invalid={confirmMismatch}
            className={confirmMismatch ? "!ring-[#E3262F]/60" : ""}
          />
          {confirmMismatch && (
            <p className="mt-1.5 text-xs font-medium text-[#a3161d]">
              {translate("passwordsDontMatch")}
            </p>
          )}
        </Field>
      </div>

      <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-7`}>
        {loading ? translate("creating") : translate("createAnAcc")}
        {!loading && (
          <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">
        {translate("weCareAndProcess")}{" "}
        <Link to="/privacy-policy" onClick={onPrivacy} className={linkButtonClass}>
          {translate("privacyPolicy")}
        </Link>
      </p>
    </form>
  );
}

/* ---------------------------------------------------------------- forgot */

function ForgotForm({ translate, forgotPassword, onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await forgotPassword({ User_Email: email.trim() });
      if (response.status) setSent(true);
      else setError(response.message || translate("authGenericError"));
    } catch (err) {
      setError(errorText(err, translate("authGenericError")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900">
        <FiArrowLeft /> {translate("authBackToSignIn")}
      </button>

      <h1 className={`${headingClass} text-[40px] sm:text-5xl`}>
        {translate("forgotPassword")}
      </h1>

      {sent ? (
        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl bg-[#f6f5f1] p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#141409] text-[#FDC700]">
              <FiMail size={20} />
            </span>
            <div>
              <p className="font-bold text-gray-900">{translate("authResetSentTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {translate("authResetSent")} <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onBack} className={primaryButtonClass}>
            {translate("authBackToSignIn")}
            <FiArrowRight className="text-[#FDC700]" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            {translate("authForgotSubtitle")}
          </p>
          <div className="mt-7 space-y-4">
            <Alert>{error}</Alert>
            <Field label={translate("eMail")} htmlFor="forgot-email">
              <input id="forgot-email" type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@email.com" />
            </Field>
          </div>
          <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-6`}>
            {loading ? translate("authSending") : translate("authSendResetLink")}
            {!loading && <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- verify */

function VerifyEmailStep({
  translate,
  language,
  pending,
  notice,
  verifyEmail,
  resendVerificationCode,
  onPendingChange,
  onVerified,
  onChangeEmail,
  onBackToLogin,
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice);
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);
  const secondsLeft = useCountdown(pending.resendAt);

  const submit = async (value = code) => {
    if (verifying || done) return;
    if (value.length !== 6) {
      setError(translate("verifyEnterAll"));
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const response = await verifyEmail({ email: pending.email, code: value });
      if (response.status) {
        setDone(true);
        setTimeout(() => onVerified(response), 700);
      }
    } catch (err) {
      setCode("");
      if (err.data?.codeExpired) {
        setExpired(true);
        setError(translate("verifyCodeExpired"));
      } else if (typeof err.data?.attemptsLeft === "number") {
        setError(`${translate("verifyCodeIncorrect")} ${translate("verifyAttemptsLeft")} ${err.data.attemptsLeft}.`);
      } else {
        setError(errorText(err, translate("authGenericError")));
      }
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const response = await resendVerificationCode({ email: pending.email, language });
      onPendingChange({
        ...pending,
        resendAt: Date.now() + (response.retryAfterSeconds ?? 60) * 1000,
      });
      setExpired(false);
      setCode("");
      setInfo(translate("verifyResent"));
    } catch (err) {
      setError(errorText(err, translate("authGenericError")));
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#141409] text-[#FDC700] shadow-[4px_4px_0_rgba(253,199,0,0.9)]">
        {done ? <FiCheck size={28} strokeWidth={3} /> : <FiMail size={28} />}
      </div>

      <h1 id="verify-title" className={`${headingClass} text-[40px] sm:text-5xl`}>
        {translate(done ? "verifyDone" : "verifyTitle")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
        {translate("verifySubtitle")}{" "}
        <span className="break-all font-semibold text-gray-900">{pending.email}</span>
      </p>

      <form
        className="mt-7 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Alert tone="info">{!error && info}</Alert>
        <Alert>{error}</Alert>

        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error && !expired) setError("");
          }}
          onComplete={submit}
          disabled={verifying || done || expired}
          invalid={Boolean(error) && !expired}
          labelledBy="verify-title"
        />

        <p className="text-xs leading-relaxed text-gray-500">{translate("verifyCheckSpam")}</p>

        {expired ? (
          <button
            type="button"
            onClick={resend}
            disabled={secondsLeft > 0 || resending}
            className={primaryButtonClass}
          >
            {resending
              ? translate("authSending")
              : secondsLeft > 0
                ? `${translate("verifyResendIn")} ${secondsLeft}s`
                : translate("verifyResend")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={verifying || done || code.length !== 6}
            className={primaryButtonClass}
          >
            {verifying ? translate("verifyConfirming") : translate("verifyConfirm")}
            {!verifying && <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />}
          </button>
        )}
      </form>

      {!expired && (
        <p className="mt-6 text-center text-sm text-gray-600">
          {translate("verifyNoCode")}{" "}
          {secondsLeft > 0 ? (
            <span className="font-semibold tabular-nums text-gray-500">
              {translate("verifyResendIn")} {secondsLeft}s
            </span>
          ) : (
            <button type="button" onClick={resend} disabled={resending} className={linkButtonClass}>
              {resending ? translate("authSending") : translate("verifyResend")}
            </button>
          )}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-black/[0.06] pt-5 text-sm">
        <button type="button" onClick={onChangeEmail} className="font-semibold text-gray-600 transition hover:text-gray-900">
          {translate("verifyChangeEmail")}
        </button>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gray-300" />
        <button type="button" onClick={onBackToLogin} className="font-semibold text-gray-600 transition hover:text-gray-900">
          {translate("authBackToSignIn")}
        </button>
      </div>
    </div>
  );
}
