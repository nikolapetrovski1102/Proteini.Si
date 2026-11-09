import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../Pages/translation/LanguageContext";
import {
  Alert,
  AuthShell,
  Field,
  PasswordInput,
  PasswordStrength,
  headingClass,
  linkButtonClass,
  primaryButtonClass,
} from "./AuthKit";
import { checkPasswordStrength } from "./authUtils";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const { translate } = useLanguage();

  useEffect(() => {
    const tokenParam = new URLSearchParams(location.search).get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setError("");
    } else {
      setError(translate("resetMissingToken"));
    }
  }, [location.search, translate]);

  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkPasswordStrength(password).isValid) {
      setError(translate("passwordTooWeak"));
      return;
    }
    if (password !== confirmPassword) {
      setError(translate("passwordsDontMatch"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await resetPassword({
        token,
        newPassword: password,
        confirmPassword,
      });
      if (response.status) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(response.message || translate("authGenericError"));
      }
    } catch (err) {
      setError(err.message || translate("authGenericError"));
    } finally {
      setLoading(false);
    }
  };

  const aside = (
    <>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDC700] text-[#141409]">
        <FiLock size={24} />
      </span>
      <h2 className="mt-8 max-w-[420px] font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight [text-wrap:balance]">
        {translate("resetAsideTitle")}
      </h2>
      <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-white/70">
        {translate("resetAsideText")}
      </p>
    </>
  );

  return (
    <AuthShell aside={aside}>
      {success ? (
        <div className="py-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#8DC658] text-white">
            <FiCheck size={30} strokeWidth={3} />
          </span>
          <h1 className={`${headingClass} mt-6 text-4xl sm:text-5xl`}>
            {translate("resetSuccessTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-[360px] text-[15px] leading-relaxed text-gray-600">
            {translate("resetSuccessText")}
          </p>
          <button type="button" onClick={() => navigate("/login")} className={`${primaryButtonClass} mt-8`}>
            {translate("login")}
            <FiArrowRight className="text-[#FDC700]" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h1 className={`${headingClass} text-[40px] sm:text-5xl`}>
            {translate("resetTitle")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            {translate("resetSubtitle")}
          </p>

          <div className="mt-7 space-y-4">
            <Alert>{error}</Alert>

            <Field label={translate("resetNewPassword")} htmlFor="reset-password">
              <PasswordInput
                id="reset-password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error && token) setError("");
                }}
                disabled={!token}
                translate={translate}
              />
              {password && <PasswordStrength password={password} translate={translate} />}
            </Field>

            <Field label={translate("confirmYour")} htmlFor="reset-confirm">
              <PasswordInput
                id="reset-confirm"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token}
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

          <button type="submit" disabled={loading || !token} className={`${primaryButtonClass} mt-7`}>
            {loading ? translate("resetSaving") : translate("resetSubmit")}
            {!loading && <FiArrowRight className="text-[#FDC700] transition-transform group-hover:translate-x-0.5" />}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            <button type="button" onClick={() => navigate("/login")} className={linkButtonClass}>
              {translate("authBackToSignIn")}
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
