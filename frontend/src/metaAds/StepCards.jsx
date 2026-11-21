import { useEffect, useState } from "react";
import { BACKGROUNDS, TEMPLATE_OPTIONS, TEMPLATES, renderCard } from "./cardRender";
import { Button } from "./ui";
import useCardDrag from "./useCardDrag";
import { inputClass } from "./format";

const Label = ({ children }) => <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">{children}</span>;

const TAG_PRESETS = ["НОВО", "BESTSELLER", "ТОП ЦЕНА", "АКЦИЈА", "ПОСЛЕДНИ ПАРЧИЊА", "E RE"];

const discount = (c) => (c.salePrice && c.price > c.salePrice ? Math.floor((1 - c.salePrice / c.price) * 100) : 0);

/** Overlay text presets applied to every card at once. */
const OVERLAY_FILLS = [
  ["Discount", (c) => (discount(c) ? `-${discount(c)}% ${c.brand || ""}`.trim() : c.brand || c.title)],
  ["Brand", (c) => c.brand || c.title],
  ["Product name", (c) => c.title],
  ["Price", (c) => `${Math.ceil(c.salePrice || c.price).toLocaleString("de-DE")} MKD`],
];

/** Small live thumbnails of every template, drawn from the first card. */
function useTemplateThumbs(card, style) {
  const [thumbs, setThumbs] = useState({});
  const key = card ? JSON.stringify([card.image, card.customImage, card.title, card.price, card.salePrice, card.overlay, card.tag, style]) : "";
  useEffect(() => {
    if (!card) return undefined;
    let cancelled = false;
    (async () => {
      for (const t of TEMPLATES) {
        const canvas = await renderCard({ ...card, image: card.customImage || card.image }, t.id, style);
        if (cancelled) return;
        setThumbs((old) => ({ ...old, [`${key}|${t.id}`]: canvas.toDataURL("image/jpeg", 0.6) }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (id) => thumbs[`${key}|${id}`];
}

const Toggle = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {children}
  </label>
);

export default function StepCards({ draft, update, updateCard, move, reorder, removeCard, setOwnImage, thumbFor, vthumbFor, active, setActive }) {
  const [shape, setShape] = useState("square");
  const { cards, template, style } = draft;
  const options = TEMPLATE_OPTIONS[template] || [];
  const templateThumb = useTemplateThumbs(cards[0], style);
  const index = Math.min(active, Math.max(0, cards.length - 1));
  const card = cards[index];
  const [drag, dragProps] = useCardDrag((from, to) => {
    reorder(from, to);
    // Keep the card being edited selected wherever it moved.
    setActive((cur) => (cur === from ? to : from < cur && to >= cur ? cur - 1 : from > cur && to <= cur ? cur + 1 : cur));
  });
  const setStyle = (patch) => update((d) => ({ style: { ...d.style, ...patch } }));

  if (!cards.length) return <p className="text-[#6b6b63]">Pick products in step 1 first; each product becomes a card.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Label>Design</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update({ template: t.id })}
              title={t.hint}
              className={`rounded-xl border bg-white p-1.5 text-left transition ${template === t.id ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"}`}
            >
              <div className="aspect-square rounded-lg bg-[#f6f5f1] overflow-hidden">
                {templateThumb(t.id) && <img src={templateThumb(t.id)} alt="" className="w-full h-full" />}
              </div>
              <div className="px-1 pt-1.5 text-sm font-semibold">{t.label}</div>
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-[#6b6b63]">{TEMPLATES.find((t) => t.id === template)?.hint}</div>
      </div>

      {options.some((o) => ["background", "logo", "price", "badge", "brand"].includes(o)) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-[#f6f5f1] px-4 py-3">
          {options.includes("background") && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Background</span>
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.label}
                  aria-label={b.label}
                  onClick={() => setStyle({ background: b.id })}
                  className={`h-8 w-8 rounded-full border ${style.background === b.id ? "ring-2 ring-offset-2 ring-[#141409]" : "border-[#d8d4c7]"}`}
                  style={{ background: b.color }}
                />
              ))}
            </div>
          )}
          {options.includes("logo") && (
            <Toggle checked={style.showLogo} onChange={(v) => setStyle({ showLogo: v })}>
              Logo
            </Toggle>
          )}
          {options.includes("price") && (
            <Toggle checked={style.showPrice} onChange={(v) => setStyle({ showPrice: v })}>
              Price
            </Toggle>
          )}
          {options.includes("badge") && (
            <Toggle checked={style.showBadge} onChange={(v) => setStyle({ showBadge: v })}>
              Red -% badge on sale items
            </Toggle>
          )}
          {options.includes("brand") && (
            <Toggle checked={style.showBrand} onChange={(v) => setStyle({ showBrand: v })}>
              Brand name
            </Toggle>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-[minmax(0,420px)_1fr] gap-6">
        <div>
          <div className="flex gap-4 mb-2 text-sm border-b border-[#e7e4da]">
            {[
              ["square", "Feeds 1:1"],
              ["vertical", "Stories & Reels 9:16"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setShape(id)}
                className={`-mb-px border-b-2 pb-1.5 font-semibold ${shape === id ? "border-[#141409] text-[#141409]" : "border-transparent text-[#6b6b63] hover:text-[#141409]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {shape === "square" ? (
            <div className="relative aspect-square rounded-xl overflow-hidden border border-[#e7e4da] bg-[#f6f5f1]">
              {thumbFor(card) ? <img src={thumbFor(card)} alt="" className="w-full h-full" /> : <div className="w-full h-full grid place-items-center text-sm text-[#6b6b63]">Rendering…</div>}
            </div>
          ) : (
            <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden border border-[#e7e4da] bg-[#f6f5f1]">
              {vthumbFor(card) ? <img src={vthumbFor(card)} alt="" className="w-full h-full" /> : <div className="w-full h-full grid place-items-center text-sm text-[#6b6b63]">Rendering…</div>}
              {/* Meta's own name bar and button cover these bands, so nothing important is drawn there. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[14%] border-b border-dashed border-white/70 bg-black/10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] border-t border-dashed border-white/70 bg-black/10" />
            </div>
          )}
          {shape === "vertical" && <p className="mt-2 text-xs text-[#6b6b63]">Dashed bands: where Meta puts the page name, caption and button.</p>}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scroll-x">
            {cards.map((c, i) => (
              <button
                key={c.key}
                type="button"
                {...dragProps(i)}
                onClick={() => setActive(i)}
                title="Click to edit, drag to reorder"
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing ${
                  drag.over === i && drag.from !== i ? "border-[#FDC700] scale-105" : i === index ? "border-[#141409]" : "border-transparent opacity-70 hover:opacity-100"
                } ${drag.from === i ? "!opacity-30" : ""} ${draft.format === "single" && i > 0 ? "grayscale" : ""} transition`}
                aria-label={`Card ${i + 1}`}
              >
                {thumbFor(c) && <img src={thumbFor(c)} alt="" className="w-full h-full" />}
                <span className="absolute bottom-0 left-0 bg-[#141409] text-white text-[10px] font-bold px-1">{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-1 text-xs text-[#6b6b63]">
            {cards.length > 1 && "Drag the small cards to change the order."}
            {draft.format === "single" && cards.length > 1 && " Single image uses card 1 only; grey cards are not used."}
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl uppercase tracking-wide mr-auto">Card {index + 1} of {cards.length}</h3>
            <Button variant="ghost" className="!px-3 !py-1.5" disabled={index === 0} onClick={() => { move(index, -1); setActive(index - 1); }}>
              ← Move left
            </Button>
            <Button variant="ghost" className="!px-3 !py-1.5" disabled={index === cards.length - 1} onClick={() => { move(index, 1); setActive(index + 1); }}>
              Move right →
            </Button>
          </div>
          <div>
            <div className="font-semibold">{card.title}</div>
            <div className="text-sm text-[#6b6b63]">{[card.brand, discount(card) ? `-${discount(card)}%` : null].filter(Boolean).join(" · ")}</div>
          </div>

          {options.includes("overlay") && (
            <div>
              <Label>Big text on the image</Label>
              <input className={`${inputClass} !text-base`} value={card.overlay} maxLength={40} onChange={(e) => updateCard(card.key, { overlay: e.target.value })} placeholder="e.g. -30% ON or БЕСПЛАТНА ДОСТАВА" />
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                <span className="text-[#6b6b63]">Fill every card with:</span>
                {OVERLAY_FILLS.map(([label, fn]) => (
                  <button key={label} type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => update((d) => ({ cards: d.cards.map((c) => ({ ...c, overlay: fn(c).slice(0, 40) })) }))}>
                    {label}
                  </button>
                ))}
                <button type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => update((d) => ({ cards: d.cards.map((c) => ({ ...c, overlay: card.overlay })) }))}>
                  This text
                </button>
              </div>
            </div>
          )}

          <div>
            <Label>Sticker (optional)</Label>
            <input className={inputClass} value={card.tag || ""} maxLength={24} onChange={(e) => updateCard(card.key, { tag: e.target.value })} placeholder="e.g. НОВО" />
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
              {TAG_PRESETS.map((t) => (
                <button key={t} type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => updateCard(card.key, { tag: t })}>
                  {t}
                </button>
              ))}
              {card.tag && (
                <>
                  <button type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => update((d) => ({ cards: d.cards.map((c) => ({ ...c, tag: card.tag })) }))}>
                    Use on every card
                  </button>
                  <button type="button" className="text-red-700 underline underline-offset-2" onClick={() => updateCard(card.key, { tag: "" })}>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {template !== "photo" && template !== "photoText" && (
            <div>
              <Label>Product size · {Math.round((card.zoom || 1) * 100)}%</Label>
              <input type="range" min="0.6" max="1.4" step="0.05" value={card.zoom || 1} onChange={(e) => updateCard(card.key, { zoom: Number(e.target.value) })} className="w-full max-w-sm accent-[#141409]" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#e7e4da] pt-4 text-sm">
            <label className="cursor-pointer font-semibold underline underline-offset-2">
              {card.customImage ? "Change own image" : "Upload own image"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setOwnImage(card.key, e.target.files?.[0])} />
            </label>
            {card.customImage && (
              <button type="button" className="underline underline-offset-2" onClick={() => updateCard(card.key, { customImage: null })}>
                Back to product photo
              </button>
            )}
            <button
              type="button"
              className="text-red-700 underline underline-offset-2 ml-auto"
              onClick={() => {
                removeCard(card.key);
                setActive(Math.max(0, index - 1));
              }}
            >
              Remove this card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
