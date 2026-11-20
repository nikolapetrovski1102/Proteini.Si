import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { Button, Notice, Section } from "./ui";
import { dot } from "./format";

const fmtNumber = (n) => (n == null ? "–" : Number(n).toLocaleString("de-DE"));
const fmtMoney = (n, currency) =>
  n == null ? "–" : `${Number(n).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ""}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

// Status text with a coloured dot in front (plain text, no pill).
const STATUS = {
  ACTIVE: ["Active", "bg-green-500", "text-green-700"],
  PAUSED: ["Paused", "bg-[#9a9a90]", "text-[#6b6b63]"],
  PENDING_REVIEW: ["In review", "bg-[#FDC700]", "text-[#8a6d00]"],
  IN_PROCESS: ["Processing", "bg-[#FDC700]", "text-[#8a6d00]"],
  DISAPPROVED: ["Rejected", "bg-red-500", "text-red-700"],
  WITH_ISSUES: ["Has issues", "bg-red-500", "text-red-700"],
  CAMPAIGN_PAUSED: ["Campaign paused", "bg-[#9a9a90]", "text-[#6b6b63]"],
  ADSET_PAUSED: ["Ad set paused", "bg-[#9a9a90]", "text-[#6b6b63]"],
};

const Status = ({ value }) => {
  const [text, dotClass, textClass] = STATUS[value] || [value?.toLowerCase().replaceAll("_", " ") || "Unknown", "bg-[#9a9a90]", "text-[#6b6b63]"];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${textClass}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      {text}
    </span>
  );
};

const Stat = ({ label, value, strong }) => (
  <div className="min-w-0">
    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b63]">{label}</div>
    <div className={`font-display leading-tight truncate ${strong ? "text-2xl" : "text-xl"}`}>{value}</div>
  </div>
);

export default function AdsList({ currency, refreshKey }) {
  const [ads, setAds] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError("");
    api.ads(30).then(setAds, (e) => {
      setError(e.message);
      setAds([]);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const toggle = async (ad) => {
    const next = ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    if (next === "ACTIVE" && !window.confirm(`Switch on "${ad.name}"? It starts spending once Meta approves it.`)) return;
    setBusyId(ad.id);
    try {
      await api.setAdStatus(ad.id, next);
      setAds((list) => list.map((a) => (a.id === ad.id ? { ...a, status: next, effectiveStatus: next } : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const totals = (ads || []).reduce(
    (t, a) => ({
      spend: t.spend + (Number(a.spend) || 0),
      impressions: t.impressions + (Number(a.impressions) || 0),
      clicks: t.clicks + (Number(a.clicks) || 0),
      active: t.active + (a.effectiveStatus === "ACTIVE" ? 1 : 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, active: 0 },
  );

  return (
    <Section title="Ads history" aside={<Button variant="link" onClick={load}>Refresh</Button>}>
      {error && (
        <div className="mb-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {ads === null && <div className="text-sm text-[#6b6b63]">Loading…</div>}
      {ads?.length === 0 && !error && <div className="text-sm text-[#6b6b63]">No ads yet.</div>}

      {ads?.length > 0 && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-xl border border-[#e7e4da] bg-[#e7e4da]">
          {[
            ["Spent", fmtMoney(totals.spend, currency)],
            ["Views", fmtNumber(totals.impressions)],
            ["Clicks", fmtNumber(totals.clicks)],
            ["Active ads", `${totals.active} of ${ads.length}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#f6f5f1] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b63]">{label}</div>
              <div className="font-display text-3xl leading-tight truncate">{value}</div>
            </div>
          ))}
        </div>
      )}
      {ads?.length > 0 && <div className="-mt-3 mb-5 text-xs text-[#6b6b63]">Totals for the last 30 days, across the ads below</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads?.map((ad) => {
          const cpc = ad.spend != null && ad.clicks ? Number(ad.spend) / Number(ad.clicks) : null;
          const canToggle = ad.status === "ACTIVE" || ad.status === "PAUSED";
          return (
            <article key={ad.id} className="flex flex-col overflow-hidden rounded-xl border border-[#e7e4da] bg-white">
              <div className="relative aspect-square bg-[#f6f5f1]">
                {ad.thumbnailUrl ? (
                  <img src={ad.thumbnailUrl} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#6b6b63]">No preview</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Status value={ad.effectiveStatus || ad.status} />
                  <span className="text-xs text-[#6b6b63] shrink-0">{fmtDate(ad.createdTime)}</span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold leading-snug line-clamp-2 break-words" title={ad.name}>
                    {ad.name}
                  </h3>
                  <div className="mt-0.5 text-sm text-[#6b6b63] truncate" title={dot(ad.campaignName, ad.adSetName)}>
                    {dot(ad.campaignName, ad.adSetName)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#e7e4da] pt-3">
                  <Stat strong label="Spent" value={fmtMoney(ad.spend, currency)} />
                  <Stat strong label="Clicks" value={fmtNumber(ad.clicks)} />
                  <Stat label="Views" value={fmtNumber(ad.impressions)} />
                  <Stat label="CTR" value={ad.ctr != null ? `${Number(ad.ctr).toFixed(2)}%` : "–"} />
                  <Stat label="Cost per click" value={fmtMoney(cpc, currency)} />
                </div>
                <div className="text-xs text-[#6b6b63]">Last 30 days</div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  {canToggle ? (
                    <Button
                      variant={ad.status === "ACTIVE" ? "ghost" : "yellow"}
                      className="!px-4 !py-2"
                      disabled={busyId === ad.id}
                      onClick={() => toggle(ad)}
                    >
                      {busyId === ad.id ? "…" : ad.status === "ACTIVE" ? "Pause" : "Switch on"}
                    </Button>
                  ) : (
                    <span />
                  )}
                  {ad.adsManagerUrl && (
                    <a className="text-sm font-semibold underline underline-offset-2 hover:no-underline" href={ad.adsManagerUrl} target="_blank" rel="noreferrer">
                      Open in Ads Manager
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
