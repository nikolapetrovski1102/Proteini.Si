import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { Button, Notice, Section } from "./ui";
import { dot } from "./format";

const fmtNumber = (n) => (n == null ? "–" : Number(n).toLocaleString("de-DE"));
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");

const STATUS_TEXT = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  PENDING_REVIEW: "In review",
  DISAPPROVED: "Rejected",
  WITH_ISSUES: "Has issues",
  CAMPAIGN_PAUSED: "Campaign paused",
  ADSET_PAUSED: "Ad set paused",
  IN_PROCESS: "Processing",
};

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

  return (
    <Section title="Recent ads" aside={<Button variant="link" onClick={load}>Refresh</Button>}>
      {error && (
        <div className="mb-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {ads === null && <div className="text-sm text-[#6b6b63]">Loading…</div>}
      {ads?.length === 0 && !error && <div className="text-sm text-[#6b6b63]">No ads yet.</div>}
      <div className="divide-y divide-[#e7e4da]">
        {ads?.map((ad) => (
          <div key={ad.id} className="flex items-center gap-3 py-3">
            <div className="w-14 h-14 shrink-0 rounded-lg bg-[#f6f5f1] overflow-hidden">
              {ad.thumbnailUrl && <img src={ad.thumbnailUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{ad.name}</div>
              <div className="text-xs text-[#6b6b63] truncate">
                {dot(STATUS_TEXT[ad.effectiveStatus] || ad.effectiveStatus?.toLowerCase(), ad.campaignName, fmtDate(ad.createdTime))}
              </div>
              <div className="text-xs text-[#6b6b63] truncate">
                {dot(
                  `${fmtNumber(ad.impressions)} views`,
                  `${fmtNumber(ad.clicks)} clicks`,
                  ad.ctr != null && `${Number(ad.ctr).toFixed(2)}% CTR`,
                  ad.spend != null && `${Number(ad.spend).toFixed(2)} ${currency || ""} spent`,
                  "last 30 days",
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {(ad.status === "ACTIVE" || ad.status === "PAUSED") && (
                <Button variant="ghost" className="!px-3 !py-1.5 text-xs" disabled={busyId === ad.id} onClick={() => toggle(ad)}>
                  {busyId === ad.id ? "…" : ad.status === "ACTIVE" ? "Pause" : "Switch on"}
                </Button>
              )}
              {ad.adsManagerUrl && (
                <a className="text-xs underline underline-offset-2" href={ad.adsManagerUrl} target="_blank" rel="noreferrer">
                  Ads Manager
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
