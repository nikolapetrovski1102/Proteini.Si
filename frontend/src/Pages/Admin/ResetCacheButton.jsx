import { useState } from "react";
import { api } from "../../services/api";

/**
 * Clears the API output cache and the Cloudflare edge cache.
 * New uploads get unique file names and show up immediately; use this after
 * replacing content or when visitors still see an old banner, page or image.
 */
export default function ResetCacheButton({ className = "" }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    if (busy) return;
    if (!window.confirm("Clear the website cache (API + CDN) now?")) return;

    setBusy(true);
    setResult(null);
    try {
      const data = await api.purgeCache();
      const ok = data.cdnConfigured ? data.cdnPurged : true;
      setResult({ ok, message: data.message || "Cache cleared." });
    } catch (error) {
      setResult({ ok: false, message: error.message || "Failed to reset cache" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        title="Clear the API and CDN cache so new images and content show immediately"
        className={`inline-flex items-center gap-2 border border-gray-300 bg-white px-6 py-2 font-bold text-gray-800 transition-colors hover:border-[#BF243E] hover:text-[#BF243E] disabled:cursor-wait disabled:opacity-60 max-md:px-4 max-md:py-1.5 max-md:text-sm ${className}`}
      >
        {busy && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        )}
        {busy ? "Clearing cache..." : "Reset cache"}
      </button>
      {result && (
        <p className={`text-xs ${result.ok ? "text-green-700" : "text-red-600"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
