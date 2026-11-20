import { useEffect, useState } from "react";
import { api } from "./api";
import AdsList from "./AdsList";
import Composer from "./Composer";
import { Button, Notice } from "./ui";
import { dot } from "./format";

export default function Dashboard({ user, onLogout }) {
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState("create");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.status().then(setStatus, (e) => setStatus({ configured: false, missing: [], error: e.message }));
  }, []);

  const accountLine = status?.configured
    ? dot(
        status.adAccountName || status.adAccountId,
        status.currency,
        status.pageName && `Page ${status.pageName}`,
        status.instagramUsername ? `Instagram @${status.instagramUsername}` : "no Instagram",
        status.pixelConfigured ? "Pixel on" : "no Pixel",
      )
    : null;

  return (
    <div className="min-h-screen">
      <header className="bg-[#141409] text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-3">
            <img src="/logos/proteini-dark.svg" alt="Proteini.si" className="h-7 w-auto" />
            <span className="border-l border-white/20 pl-3 text-sm font-semibold text-white/70">Meta ads</span>
          </div>
          <nav className="flex gap-1 text-sm">
            {[
              ["create", "Create ad"],
              ["ads", "Ads"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-md px-3 py-1.5 font-semibold ${tab === id ? "bg-[#FDC700] text-[#141409]" : "text-white/80 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-white/70 hidden sm:inline">{dot(user.email, user.method === "duo" ? "Duo" : "email code")}</span>
            <Button variant="link" className="!text-white" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>
        {accountLine && (
          <div className="border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-1.5 text-xs text-white/60 truncate">{accountLine}</div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {status && !status.configured && (
          <Notice tone="warn">
            <div className="font-semibold">Meta is not connected yet.</div>
            {status.missing?.length > 0 && <div>Missing on the server: {status.missing.join(" · ")}</div>}
            {status.error && <div>{status.error}</div>}
            <div className="mt-1 text-[#6b6b63]">You can still prepare cards; publishing works once the settings are in place.</div>
          </Notice>
        )}
        {status?.configured && status.error && <Notice tone="error">{status.error}</Notice>}

        <div className={tab === "create" ? "" : "hidden"}>
          <Composer status={status} onPublished={() => setRefreshKey((k) => k + 1)} onShowAds={() => setTab("ads")} />
        </div>
        {tab === "ads" && <AdsList currency={status?.currency} refreshKey={refreshKey} />}
      </main>
    </div>
  );
}
