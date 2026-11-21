import { TEMPLATES, BACKGROUNDS } from "./cardRender";
import { ctaLabel } from "./copy";
import { COUNTRIES, GENDERS, GOALS, PLACEMENTS, runDays } from "./deliveryOptions";
import { META_FORMATS } from "./metaFormats";
import { MetaPreview } from "./Previews";
import { Button, Notice } from "./ui";
import { dot } from "./format";

const Row = ({ label, children, onEdit }) => (
  <div className="grid grid-cols-[110px_1fr_auto] gap-3 py-2.5 text-sm">
    <div className="text-[#6b6b63]">{label}</div>
    <div className="min-w-0">{children}</div>
    {onEdit && (
      <button type="button" className="text-xs underline underline-offset-2 self-start" onClick={onEdit}>
        Edit
      </button>
    )}
  </div>
);

export default function StepReview({
  draft,
  update,
  status,
  problems,
  cardsForAd,
  thumbFor,
  metaPreviews,
  mock,
  loadMetaPreview,
  publish,
  work,
  goTo,
  startOver,
  onShowAds,
}) {
  const d = draft.delivery;
  const currency = status?.currency || "";
  const days = runDays(d);
  const collection = draft.format === "collection";
  const formats = META_FORMATS.filter((f) => !f.instagram || status?.instagramUserId);
  const toggleFormat = (id) =>
    update((x) => {
      const has = x.previewFormats.includes(id);
      const next = has ? x.previewFormats.filter((f) => f !== id) : [...x.previewFormats, id].slice(-4);
      return { previewFormats: next.length ? next : x.previewFormats };
    });
  const live = draft.status === "ACTIVE";

  if (work.result)
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 py-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-green-600 text-white grid place-items-center text-3xl">✓</div>
        <h3 className="font-display text-3xl uppercase tracking-wide">{live ? "Ad published" : "Ad created (paused)"}</h3>
        <p className="text-[#6b6b63]">{work.result.message}</p>
        <div className="text-sm text-[#6b6b63]">{dot(
            work.result.campaignId && `Campaign ${work.result.campaignId}`,
            (work.result.adSetIds?.length || 0) > 1 ? `${work.result.adSetIds.length} ad sets` : `Ad set ${work.result.adSetId}`,
            (work.result.adIds?.length || 0) > 1 ? `${work.result.adIds.length} ads` : work.result.adId && `Ad ${work.result.adId}`,
          )}</div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {work.result.adsManagerUrl && (
            <a className="inline-flex items-center rounded-lg bg-[#141409] px-4 py-2.5 text-sm font-semibold text-white" href={work.result.adsManagerUrl} target="_blank" rel="noreferrer">
              Open in Ads Manager
            </a>
          )}
          <Button variant="ghost" onClick={onShowAds}>
            See it in Ads history
          </Button>
          <Button variant="yellow" onClick={() => startOver(true)}>
            Create another ad
          </Button>
        </div>
      </div>
    );

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
      <div className="space-y-6 min-w-0">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide mb-1">Summary</h3>
          <div className="divide-y divide-[#e7e4da] border-y border-[#e7e4da]">
            <Row label="Format" onEdit={() => goTo(0)}>
              <span className="font-semibold">
                {draft.format === "single" ? "Single image" : collection ? `Collection · ${cardsForAd.length} products` : `Carousel · ${cardsForAd.length} cards`}
              </span>
              <div className="mt-1.5 flex gap-1.5 overflow-x-auto scroll-x">
                {cardsForAd.map((c) => (
                  <div key={c.key} className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-[#f6f5f1]">
                    {thumbFor(c) && <img src={thumbFor(c)} alt="" className="w-full h-full" />}
                  </div>
                ))}
              </div>
            </Row>
            <Row label="Design" onEdit={() => goTo(1)}>
              {collection
                ? dot("Cover banner", draft.cover.big || "suggested text")
                : dot(TEMPLATES.find((t) => t.id === draft.template)?.label, BACKGROUNDS.find((b) => b.id === draft.style.background)?.label)}
            </Row>
            <Row label="Text" onEdit={() => goTo(2)}>
              <p className="line-clamp-3 whitespace-pre-line">{draft.primaryText || <span className="text-red-700">missing</span>}</p>
              <div className="text-[#6b6b63] mt-0.5">
                {dot(collection && `Headline: ${draft.headline}`, `Button: ${ctaLabel(draft.cta)}`, draft.addUtm && "UTM tags on", draft.name.trim() && `Name: ${draft.name.trim()}`)}
              </div>
            </Row>
            <Row label="Delivery" onEdit={() => goTo(3)}>
              {d.mode === "existing" ? (
                <span>Added to an existing ad set</span>
              ) : (
                <>
                  <span className="font-semibold">
                    {d.budgetType === "lifetime" ? `${d.lifetimeBudget} ${currency} total` : `${d.dailyBudget} ${currency} per day`}
                    {days ? ` · ${days} days` : " · no end date"}
                  </span>
                  <div className="text-[#6b6b63]">
                    {dot(
                      GOALS.find((g) => g.value === d.goal)?.label,
                      d.countries.map((c) => COUNTRIES.find((x) => x.code === c)?.label || c).join(", "),
                      `age ${d.ageMin}–${d.ageMax}`,
                      GENDERS.find((g) => g.value === d.gender)?.label,
                      PLACEMENTS.find((p) => p.value === d.placements)?.label,
                    )}
                  </div>
                </>
              )}
            </Row>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
            <h3 className="font-display text-lg uppercase tracking-wide">Exact preview from Meta</h3>
            <span className="text-xs text-[#6b6b63]">Uploads the images, nothing is published</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-sm">
            {formats.map((f) => (
              <label key={f.id} className="flex items-center gap-1.5">
                <input type="checkbox" checked={draft.previewFormats.includes(f.id)} onChange={() => toggleFormat(f.id)} />
                {f.label}
              </label>
            ))}
          </div>
          <Button variant="ghost" disabled={work.busy || problems.length > 0} onClick={loadMetaPreview}>
            {work.busy && work.kind === "preview" ? work.step : metaPreviews ? "Refresh Meta preview" : "Show Meta preview"}
          </Button>
          {metaPreviews?.length > 0 && (
            <div className="mt-4">
              <MetaPreview previews={metaPreviews} />
            </div>
          )}
          {metaPreviews?.length === 0 && <div className="mt-2 text-sm text-[#6b6b63]">Meta returned no preview for these formats.</div>}
        </div>
      </div>

      <div className="space-y-5 lg:sticky lg:top-4 self-start">
        {mock}

        <div className="rounded-xl border border-[#e7e4da] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["PAUSED", "Paused", "Check it in Ads Manager first"],
              ["ACTIVE", "Active", "Starts after Meta's review"],
            ].map(([value, title, hint]) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ status: value })}
                className={`rounded-lg border p-2.5 text-left ${draft.status === value ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"}`}
              >
                <div className="font-semibold">{title}</div>
                <div className="text-xs text-[#6b6b63]">{hint}</div>
              </button>
            ))}
          </div>

          {problems.length > 0 && (
            <div className="rounded-lg bg-[#FDC700]/15 border border-[#FDC700] p-3 text-sm space-y-1.5">
              <div className="font-semibold">Fix before publishing</div>
              {problems.map((p) => (
                <div key={p.text} className="flex justify-between gap-3">
                  <span>{p.text}</span>
                  {p.step != null && (
                    <button type="button" className="underline underline-offset-2 shrink-0" onClick={() => goTo(p.step)}>
                      Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button variant="yellow" className="w-full !py-4 text-base" disabled={work.busy || problems.length > 0} onClick={publish}>
            {work.busy && work.kind === "publish" ? work.step : live ? "Publish ad (active)" : "Publish ad (paused)"}
          </Button>
          {work.error && <Notice tone="error">{work.error}</Notice>}
        </div>
      </div>
    </div>
  );
}
