import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { api } from "../../services/api";
import { Button } from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

/**
 * Clears the API output cache and the Cloudflare edge cache.
 * New uploads get unique file names and show up immediately; use this after
 * replacing content or when visitors still see an old banner, page or image.
 */
export default function ResetCacheButton({ className = "", size = "md", variant = "secondary", block = false }) {
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  const handleClick = async () => {
    if (busy) return;
    const ok = await confirm({
      title: "Refresh the live site?",
      message:
        "Clears the website cache so visitors see your latest changes right away.\n\nOnly needed when an old banner, image or text is still showing after you saved.",
      confirmLabel: "Refresh now",
    });
    if (!ok) return;

    setBusy(true);
    try {
      const data = await api.purgeCache();
      const cleared = data.cdnConfigured ? data.cdnPurged : true;
      if (cleared) toast.success(data.message || "Cache cleared. Changes are live.");
      else toast.error(data.message || "The CDN cache could not be cleared.");
    } catch (error) {
      toast.error(error.message || "Failed to reset cache");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={FiRefreshCw}
      loading={busy}
      onClick={handleClick}
      title="Clear the API and CDN cache so new images and content show immediately"
      className={`${block ? "w-full" : ""} ${className}`}
    >
      {busy ? "Refreshing…" : "Refresh live site"}
    </Button>
  );
}
