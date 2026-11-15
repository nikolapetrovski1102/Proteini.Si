import { useEffect, useRef, useState } from "react";
import { FiMail } from "react-icons/fi";
import { Alert } from "./AuthKit";
import { GOOGLE_CLIENT_ID, loadScript, socialErrorKey } from "./socialAuth";

const buttonBase =
  "relative inline-flex min-h-[48px] w-full items-center justify-center rounded-lg px-12 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDC700] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const iconSlot = "absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center";

/** Google "G" in its brand colours, as the branding guidelines require. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

/**
 * Prepares a Google Identity Services popup code client. requestCode() must run directly in
 * the click handler (popup blockers), so the script loads and the client initialises up front.
 */
function useGoogleCodeClient(onCode, onError) {
  const clientRef = useRef(null);
  const handlers = useRef({ onCode, onError });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    handlers.current = { onCode, onError };
  }, [onCode, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;
    loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        const oauth2 = window.google?.accounts?.oauth2;
        if (cancelled || !oauth2) return;
        clientRef.current = oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          ux_mode: "popup",
          select_account: true,
          callback: (response) =>
            response?.code
              ? handlers.current.onCode(response.code)
              : handlers.current.onError(response?.error),
          error_callback: (err) => handlers.current.onError(err?.type),
        });
        setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, request: () => clientRef.current?.requestCode() };
}

/**
 * "Continue with Google / email code" block shown above the password forms.
 * Google opens a popup and stays on the page.
 */
export default function SocialSignIn({
  translate,
  externalSignIn,
  onSignedIn,
  onEmailCode,
  dividerKey,
  initialError = "",
}) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(null); // "google" | null

  const google = useGoogleCodeClient(
    async (code) => {
      setBusy("google");
      try {
        const response = await externalSignIn({ provider: "google", token: code });
        if (response.status) onSignedIn(response);
        else setError(translate("socialFailed"));
      } catch (err) {
        setError(translate(socialErrorKey(err)));
      } finally {
        setBusy(null);
      }
    },
    (reason) => {
      setBusy(null);
      // Closing the popup is a choice, not an error.
      if (reason !== "popup_closed" && reason !== "access_denied") setError(translate("socialFailed"));
    },
  );

  const handleGoogle = () => {
    setError("");
    if (!google.ready) {
      setError(translate("socialFailed"));
      return;
    }
    google.request();
  };


  return (
    <div className="mt-7">
      <div className="space-y-3">
        <Alert>{error}</Alert>

        {GOOGLE_CLIENT_ID && (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={Boolean(busy)}
            aria-busy={busy === "google"}
            className={`${buttonBase} bg-white text-[#1f1f1f] ring-1 ring-black/[0.14] hover:bg-[#f8f8f6] hover:ring-black/30`}
          >
            <span className={iconSlot}>{busy === "google" ? <Spinner /> : <GoogleIcon />}</span>
            {translate("socialContinueGoogle")}
          </button>
        )}


        <button
          type="button"
          onClick={onEmailCode}
          disabled={Boolean(busy)}
          className={`${buttonBase} bg-[#f6f5f1] text-gray-900 ring-1 ring-black/[0.06] hover:bg-[#efeee8]`}
        >
          <span className={iconSlot}>
            <FiMail size={19} />
          </span>
          {translate("socialContinueEmailCode")}
        </button>
      </div>

      <div className="mt-7 flex items-center gap-4" role="separator">
        <span className="h-px flex-1 bg-black/[0.08]" />
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
          {translate(dividerKey)}
        </span>
        <span className="h-px flex-1 bg-black/[0.08]" />
      </div>
    </div>
  );
}
