import { useState } from "react";
import { ctaLabel } from "./copy";
import { META_FORMATS } from "./metaFormats";

const Avatar = ({ size = 36, ring = false }) => (
  <div
    className={`shrink-0 rounded-full grid place-items-center bg-white ${ring ? "p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" : "border border-[#e4e6eb]"}`}
    style={{ width: size, height: size }}
  >
    <div className="w-full h-full rounded-full bg-white grid place-items-center overflow-hidden">
      <img src="/logos/runner.svg" alt="" className="w-[62%] h-auto" />
    </div>
  </div>
);

/** Instant, approximate Facebook feed look, drawn from the rendered cards. */
function FacebookMock({ pageName, primaryText, cta, cards }) {
  return (
    <div className="w-full max-w-[380px] rounded-xl border border-[#e7e4da] bg-white shadow-sm overflow-hidden text-[13px] text-[#050505]">
      <div className="flex items-center gap-2 p-3">
        <Avatar />
        <div>
          <div className="font-semibold leading-tight">{pageName}</div>
          <div className="text-[11px] text-[#65676b]">Sponsored</div>
        </div>
      </div>
      <p className="px-3 pb-2 whitespace-pre-line">{primaryText || " "}</p>
      {cards.length === 0 ? (
        <div className="aspect-square bg-[#f0f2f5] grid place-items-center text-[#65676b]">No cards yet</div>
      ) : cards.length === 1 ? (
        <div>
          {cards[0].thumb && <img src={cards[0].thumb} alt="" className="w-full aspect-square" />}
          <div className="flex items-center justify-between gap-2 bg-[#f0f2f5] px-3 py-2">
            <div className="min-w-0">
              <div className="text-[11px] uppercase text-[#65676b]">proteini.mk</div>
              <div className="font-semibold truncate">{cards[0].headline}</div>
              <div className="text-[#65676b] truncate">{cards[0].description}</div>
            </div>
            <span className="shrink-0 rounded-md bg-[#e4e6eb] px-3 py-1.5 font-semibold">{ctaLabel(cta)}</span>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto px-3 pb-3 scroll-x">
          {cards.map((c) => (
            <div key={c.key} className="w-[250px] shrink-0 rounded-lg border border-[#e4e6eb] overflow-hidden">
              {c.thumb ? <img src={c.thumb} alt="" className="w-full aspect-square" /> : <div className="aspect-square bg-[#f0f2f5]" />}
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.headline}</div>
                  <div className="text-[#65676b] truncate">{c.description}</div>
                </div>
                <span className="shrink-0 rounded-md bg-[#e4e6eb] px-2.5 py-1.5 font-semibold text-xs">{ctaLabel(cta)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d={d} />
  </svg>
);
const HEART = "M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z";
const COMMENT = "M20.5 11.6a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4.4A8.5 8.5 0 1 1 20.5 11.6Z";
const SHARE = "M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z";
const SAVE = "M19 21l-7-5-7 5V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17Z";

/** Instant, approximate Instagram feed look: square media, swipeable carousel, CTA bar, caption. */
function InstagramMock({ handle, primaryText, cta, cards }) {
  const [index, setIndex] = useState(0);
  const count = cards.length;
  const current = Math.min(index, Math.max(0, count - 1));

  return (
    <div className="w-full max-w-[380px] rounded-xl border border-[#e7e4da] bg-white shadow-sm overflow-hidden text-[13px] text-[#000]">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Avatar size={34} ring />
        <div className="min-w-0 leading-tight">
          <div className="font-semibold truncate">{handle}</div>
          <div className="text-[11px]">Sponsored</div>
        </div>
        <span className="ml-auto text-lg leading-none tracking-widest">···</span>
      </div>

      {count === 0 ? (
        <div className="aspect-square bg-[#efefef] grid place-items-center text-[#737373]">No cards yet</div>
      ) : (
        <div className="relative">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory scroll-x"
            onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {cards.map((c) => (
              <div key={c.key} className="w-full shrink-0 snap-start">
                {c.thumb ? <img src={c.thumb} alt="" className="w-full aspect-square" /> : <div className="aspect-square bg-[#efefef]" />}
              </div>
            ))}
          </div>
          {count > 1 && (
            <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
              {current + 1}/{count}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#efefef] px-3 py-2.5 font-semibold">
        <span>{ctaLabel(cta)}</span>
        <span aria-hidden="true">›</span>
      </div>

      <div className="flex items-center gap-4 px-3 pt-2.5">
        <Icon d={HEART} />
        <Icon d={COMMENT} />
        <Icon d={SHARE} />
        {count > 1 && (
          <div className="flex-1 flex justify-center gap-1">
            {cards.map((c, i) => (
              <span key={c.key} className={`h-1.5 w-1.5 rounded-full ${i === current ? "bg-[#0095f6]" : "bg-[#c7c7c7]"}`} />
            ))}
          </div>
        )}
        <span className={count > 1 ? "" : "ml-auto"}>
          <Icon d={SAVE} />
        </span>
      </div>

      <p className="px-3 pt-2 pb-3 line-clamp-2 whitespace-pre-line">
        <span className="font-semibold mr-1">{handle}</span>
        {primaryText || " "}
      </p>
    </div>
  );
}

/** Instant, approximate Stories / Reels look: 9:16, the square card in the middle, CTA at the bottom. */
function StoryMock({ handle, primaryText, cta, cards }) {
  const [index, setIndex] = useState(0);
  const count = cards.length;
  const current = Math.min(index, Math.max(0, count - 1));
  const card = cards[current];

  return (
    <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-2xl overflow-hidden bg-[#141409] text-white shadow-sm select-none">
      {card?.thumb && <img src={card.thumb} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110" />}
      <div className="absolute top-2 inset-x-2 flex gap-1">
        {(count ? cards : [null]).map((c, i) => (
          <span key={c?.key || i} className={`h-0.5 flex-1 rounded-full ${i <= current ? "bg-white" : "bg-white/35"}`} />
        ))}
      </div>
      <div className="absolute top-5 inset-x-3 flex items-center gap-2 text-[12px]">
        <Avatar size={28} />
        <span className="font-semibold truncate">{handle}</span>
        <span className="text-white/70">Sponsored</span>
      </div>
      <div className="absolute inset-x-0 top-[18%] px-3">
        {card?.thumb ? <img src={card.thumb} alt="" className="w-full aspect-square rounded-lg" /> : <div className="aspect-square rounded-lg bg-white/10 grid place-items-center text-white/60 text-sm">No cards yet</div>}
        <p className="mt-3 text-[12px] leading-snug line-clamp-3 drop-shadow">{primaryText}</p>
      </div>
      <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-1">
        <span className="text-lg leading-none">⌃</span>
        <span className="rounded-full bg-white text-[#141409] px-4 py-1.5 text-[13px] font-semibold">{ctaLabel(cta)}</span>
      </div>
      {count > 1 && (
        <>
          <button type="button" aria-label="Previous card" className="absolute left-0 top-0 h-full w-1/3" onClick={() => setIndex(Math.max(0, current - 1))} />
          <button type="button" aria-label="Next card" className="absolute right-0 top-0 h-full w-1/3" onClick={() => setIndex(Math.min(count - 1, current + 1))} />
        </>
      )}
    </div>
  );
}

const MOCKS = [
  ["facebook", "Facebook feed"],
  ["instagram", "Instagram feed"],
  ["story", "Stories & Reels"],
];

const mocksFor = (placements) =>
  placements === "facebook" ? ["facebook", "story"] : placements === "instagram" ? ["instagram", "story"] : placements === "feeds" ? ["facebook", "instagram"] : placements === "stories" ? ["story"] : ["facebook", "instagram", "story"];

/** Quick preview with a Facebook / Instagram / Stories switch. Pure front-end, so it is instant and always works. */
export function MockPreview({ pageName, instagramHandle, placements, ...ad }) {
  const allowed = mocksFor(placements);
  const [choice, setChoice] = useState(allowed[0]);
  const which = allowed.includes(choice) ? choice : allowed[0];

  return (
    <div>
      {allowed.length > 1 && (
        <div className="flex gap-4 mb-3 text-sm border-b border-[#e7e4da]">
          {MOCKS.filter(([id]) => allowed.includes(id)).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChoice(id)}
              className={`-mb-px border-b-2 pb-1.5 font-semibold ${which === id ? "border-[#141409] text-[#141409]" : "border-transparent text-[#6b6b63] hover:text-[#141409]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {which === "instagram" ? (
        <InstagramMock handle={instagramHandle} {...ad} />
      ) : which === "story" ? (
        <StoryMock handle={instagramHandle} {...ad} />
      ) : (
        <FacebookMock pageName={pageName} {...ad} />
      )}
    </div>
  );
}


/** Meta's own rendering (generatepreviews). The iframe src is checked server-side to be https://*.facebook.com. */
export function MetaPreview({ previews }) {
  return (
    <div className="flex flex-wrap gap-4">
      {previews.map((p) => {
        const format = META_FORMATS.find((f) => f.id === p.format) || { label: p.format, height: 600, width: 340 };
        return (
          <div key={p.format}>
            <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
              <span className="font-semibold">{format.label}</span>
              <a href={p.src} target="_blank" rel="noreferrer" className="text-xs text-[#6b6b63] underline hover:text-[#141409]">
                Open in a new tab
              </a>
            </div>
            <iframe
              title={format.label}
              src={p.src}
              className="rounded-xl border border-[#e7e4da] bg-white max-w-full"
              style={{ height: format.height, width: format.width }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              allow="autoplay"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        );
      })}
    </div>
  );
}
