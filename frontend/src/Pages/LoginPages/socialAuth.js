// Google sign-in configuration and helpers.
// A provider is hidden when its public id is not configured in the build env.

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const scriptPromises = {};

export function loadScript(src) {
  if (!scriptPromises[src]) {
    scriptPromises[src] = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        delete scriptPromises[src];
        script.remove();
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromises[src];
}

/** Maps an API error from ExternalSignIn to a translation key. */
export const socialErrorKey = (err) => {
  if (err?.status === 409 || err?.data?.accountExists) return "socialAccountExists";
  if (err?.data?.emailRequired) return "socialNoEmail";
  return "socialFailed";
};
