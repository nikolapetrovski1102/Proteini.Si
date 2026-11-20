import { useRef, useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { CTAS, DESCRIPTION_MAX, EMOJIS, HEADLINE_MAX, PRIMARY_MAX, PRIMARY_TEXT_PRESETS, PRIMARY_VISIBLE, textInserts } from "./copy";
import { Field } from "./ui";
import { dot, inputClass } from "./format";

const Label = ({ children }) => <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">{children}</span>;
const LinkButton = ({ children, ...props }) => (
  <button type="button" className="underline underline-offset-2 hover:no-underline" {...props}>
    {children}
  </button>
);

const discount = (c) => (c.salePrice && c.price > c.salePrice ? Math.floor((1 - c.salePrice / c.price) * 100) : 0);

const HEADLINE_FILLS = [
  ["Product name", (c) => c.title],
  ["Brand + name", (c) => dot(c.brand, c.title.replace(new RegExp(`^${(c.brand || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), ""))],
  ["Discount + brand", (c) => (discount(c) ? `-${discount(c)}% ${c.brand || c.title}` : c.brand || c.title)],
];

const DESCRIPTION_FILLS = [
  ["Price", (c) => formatMkd(c.salePrice || c.price)],
  ["Old → new price", (c) => (c.salePrice ? `${formatMkd(c.price).replace(" MKD", "")} → ${formatMkd(c.salePrice)}` : formatMkd(c.price))],
  ["Cash on delivery", () => "Плати при достава"],
  ["Empty", () => ""],
];

const MAIN_LINKS = [
  ["first", "First card's product"],
  ["shop", "Shop home page"],
  ["custom", "Custom link"],
];

export default function StepText({ draft, update, updateCard, thumbFor, cardsForAd }) {
  const textRef = useRef(null);
  const [showLinks, setShowLinks] = useState(false);
  const [presetGroup, setPresetGroup] = useState("MK");
  const text = draft.primaryText;

  const insert = (value) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const before = text.slice(0, start);
    const pad = before && !/\s$/.test(before) && !/^\p{Extended_Pictographic}/u.test(value) ? " " : "";
    const next = `${before}${pad}${value}${text.slice(end)}`.slice(0, PRIMARY_MAX);
    update({ primaryText: next });
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + pad.length + value.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const fillAll = (field, fn, max) => update((d) => ({ cards: d.cards.map((c) => ({ ...c, [field]: fn(c).slice(0, max) })) }));
  const groups = [...new Set(PRIMARY_TEXT_PRESETS.map((p) => p.group))];

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <Label>Primary text · shown above the image</Label>
          <textarea
            ref={textRef}
            className={`${inputClass} min-h-[150px] !text-base leading-relaxed`}
            maxLength={PRIMARY_MAX}
            value={text}
            onChange={(e) => update({ primaryText: e.target.value })}
          />
          <div className="flex justify-between gap-3 text-xs mt-1">
            <span className={text.length > PRIMARY_VISIBLE ? "text-[#8a6d00]" : "text-[#6b6b63]"}>
              {text.length > PRIMARY_VISIBLE ? `People see the first ${PRIMARY_VISIBLE} characters, the rest is behind "See more".` : "All of it is visible without \"See more\"."}
            </span>
            <span className="text-[#6b6b63] shrink-0">
              {text.length}/{PRIMARY_MAX}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1">
            {EMOJIS.map((e) => (
              <button key={e} type="button" className="h-9 w-9 rounded-lg text-lg hover:bg-[#f6f5f1]" onClick={() => insert(e)} aria-label={`Insert ${e}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-[#6b6b63]">Insert:</span>
            {textInserts(cardsForAd).map((i) => (
              <LinkButton key={i.label} onClick={() => insert(i.text)} title={i.text}>
                {i.label}
              </LinkButton>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-4 border-b border-[#e7e4da] text-sm">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setPresetGroup(g)}
                className={`-mb-px border-b-2 pb-1.5 font-semibold ${presetGroup === g ? "border-[#141409]" : "border-transparent text-[#6b6b63] hover:text-[#141409]"}`}
              >
                {g === "MK" ? "Macedonian" : g === "AL" ? "Albanian" : "English"}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {PRIMARY_TEXT_PRESETS.filter((p) => p.group === presetGroup).map((p) => (
              <button
                key={p.label + p.group}
                type="button"
                onClick={() => update({ primaryText: p.text })}
                className={`block w-full rounded-lg border p-2.5 text-left text-sm ${text === p.text ? "border-[#141409] bg-[#f6f5f1]" : "border-[#e7e4da] hover:border-[#141409]"}`}
              >
                <span className="font-semibold">{p.label}</span>
                <span className="block text-xs text-[#6b6b63] line-clamp-2">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Button</Label>
        <div className="flex flex-wrap gap-2">
          {CTAS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => update({ cta: c.value })}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${draft.cta === c.value ? "border-[#141409] bg-[#141409] text-white" : "border-[#e7e4da] bg-white hover:border-[#141409]"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
          <h3 className="font-display text-lg uppercase tracking-wide">{draft.format === "single" ? "Headline & description" : "Text under each card"}</h3>
          <button type="button" className="text-sm underline underline-offset-2" onClick={() => setShowLinks((v) => !v)}>
            {showLinks ? "Hide links" : "Edit card links"}
          </button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-3">
          <span>
            <span className="text-[#6b6b63]">Headlines: </span>
            {HEADLINE_FILLS.map(([label, fn], i) => (
              <span key={label}>
                {i > 0 && " · "}
                <LinkButton onClick={() => fillAll("headline", fn, HEADLINE_MAX)}>{label}</LinkButton>
              </span>
            ))}
          </span>
          <span>
            <span className="text-[#6b6b63]">Descriptions: </span>
            {DESCRIPTION_FILLS.map(([label, fn], i) => (
              <span key={label}>
                {i > 0 && " · "}
                <LinkButton onClick={() => fillAll("description", fn, DESCRIPTION_MAX)}>{label}</LinkButton>
              </span>
            ))}
          </span>
        </div>

        <div className="divide-y divide-[#e7e4da] rounded-xl border border-[#e7e4da]">
          {cardsForAd.map((card, i) => (
            <div key={card.key} className="flex gap-3 p-3">
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#f6f5f1]">
                {thumbFor(card) && <img src={thumbFor(card)} alt="" className="w-full h-full" />}
                <span className="absolute bottom-0 left-0 bg-[#141409] text-white text-[10px] font-bold px-1">{i + 1}</span>
              </div>
              <div className="grid flex-1 min-w-0 gap-2 sm:grid-cols-2">
                <div>
                  <input
                    className={`${inputClass} !py-2 font-semibold`}
                    value={card.headline}
                    maxLength={HEADLINE_MAX}
                    onChange={(e) => updateCard(card.key, { headline: e.target.value })}
                    placeholder="Headline"
                    aria-label={`Card ${i + 1} headline`}
                  />
                  <div className="text-[11px] text-[#6b6b63] text-right">{card.headline.length}/{HEADLINE_MAX}</div>
                </div>
                <div>
                  <input
                    className={`${inputClass} !py-2`}
                    value={card.description}
                    maxLength={DESCRIPTION_MAX}
                    onChange={(e) => updateCard(card.key, { description: e.target.value })}
                    placeholder="Description (optional)"
                    aria-label={`Card ${i + 1} description`}
                  />
                  <div className="text-[11px] text-[#6b6b63] text-right">{card.description.length}/{DESCRIPTION_MAX}</div>
                </div>
                {showLinks && (
                  <input
                    className={`${inputClass} !py-2 sm:col-span-2 text-xs`}
                    value={card.link}
                    onChange={(e) => updateCard(card.key, { link: e.target.value })}
                    placeholder="https://proteini.mk/…"
                    aria-label={`Card ${i + 1} link`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Ad name" hint="Only you see this in Ads Manager and in Ads history">
            <input className={inputClass} value={draft.name} placeholder={`${draft.format === "single" ? "Single" : "Carousel"} · today`} onChange={(e) => update({ name: e.target.value })} />
          </Field>
          {draft.format === "carousel" && (
            <div>
              <Label>"See more" link (end of the carousel)</Label>
              <div className="space-y-1.5 text-sm">
                {MAIN_LINKS.map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2">
                    <input type="radio" checked={draft.mainLink === id} onChange={() => update({ mainLink: id })} />
                    {label}
                  </label>
                ))}
              </div>
              {draft.mainLink === "custom" && (
                <input className={`${inputClass} mt-2`} value={draft.customLink} onChange={(e) => update({ customLink: e.target.value })} placeholder="https://proteini.mk/category/…" />
              )}
            </div>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <Label>Options</Label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" checked={draft.addUtm} onChange={(e) => update({ addUtm: e.target.checked })} />
            <span>
              Tag links for Google Analytics (UTM)
              <span className="block text-xs text-[#6b6b63]">Lets you see sales from this ad in Analytics.</span>
            </span>
          </label>
          {draft.format === "carousel" && (
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5" checked={draft.optimizeCardOrder} onChange={(e) => update({ optimizeCardOrder: e.target.checked })} />
              <span>
                Let Meta show the best cards first
                <span className="block text-xs text-[#6b6b63]">Turn off to keep your exact card order.</span>
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
