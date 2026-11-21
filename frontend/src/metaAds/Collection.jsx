// Collection ads: one image ad (cover + four products) with Meta's button. Tapping it opens proteini.mk/collection,
// a shop page with the title, subtitle and a 2-column grid of every picked product. Nothing to set up in Meta.
import { useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { sameOrigin } from "./cardRender";
import { ctaLabel } from "./copy";
import { COVER_BACKGROUNDS, coverSuggestions } from "./coverRender";
import { MockPreview } from "./Previews";
import { Field } from "./ui";
import { dot, inputClass } from "./format";

const Label = ({ children }) => <span className="block text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-1.5">{children}</span>;
const onSale = (c) => c.salePrice && c.salePrice < c.price;

/** Step 2 for a collection: the cover texts and colours; the ad image is drawn from them and the picked products. */
export function CoverEditor({ draft, update, images }) {
  const cover = draft.cover;
  const set = (patch) => update((d) => ({ cover: { ...d.cover, ...patch } }));
  const suggestion = coverSuggestions(draft.cards);
  const drawing = <div className="w-full h-full grid place-items-center text-sm text-[#6b6b63]">Drawing…</div>;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
      <div className="space-y-4 min-w-0">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)] gap-4 items-start">
          <div>
            <Label>Feeds</Label>
            <div className="rounded-xl overflow-hidden border border-[#e7e4da] bg-[#f6f5f1] aspect-[1080/1090]">
              {images.feed ? <img src={images.feed} alt="Feed image" className="w-full h-full" /> : drawing}
            </div>
          </div>
          <div>
            <Label>Stories & Reels</Label>
            <div className="relative rounded-xl overflow-hidden border border-[#e7e4da] bg-[#f6f5f1] aspect-[9/16]">
              {images.vertical ? <img src={images.vertical} alt="Stories image" className="w-full h-full" /> : drawing}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[14%] border-b border-dashed border-white/70" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] border-t border-dashed border-white/70" />
            </div>
          </div>
        </div>
        <p className="text-sm text-[#6b6b63]">
          The first three picked products are drawn on the cover and the first four in the row under it; drag them in the Products
          step to change which. Tapping the ad opens a proteini.mk page with all {draft.cards.length} products.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Big text" hint={`Suggested: ${suggestion.big}`}>
          <input className={inputClass} value={cover.big} placeholder={suggestion.big} maxLength={24} onChange={(e) => set({ big: e.target.value })} />
        </Field>
        <Field label="Small text" hint="Brands, a deadline or free delivery">
          <input className={inputClass} value={cover.small} placeholder={suggestion.small} maxLength={60} onChange={(e) => set({ small: e.target.value })} />
        </Field>
        <Field label="Bottom line">
          <input className={inputClass} value={cover.footer} maxLength={40} onChange={(e) => set({ footer: e.target.value })} />
        </Field>
        <div>
          <Label>Background</Label>
          <div className="space-y-1.5 text-sm">
            {COVER_BACKGROUNDS.map((b) => (
              <label key={b.id} className="flex items-center gap-2">
                <input type="radio" checked={cover.background === b.id} onChange={() => set({ background: b.id })} />
                <span className="inline-block w-4 h-4 rounded border border-[#e7e4da]" style={{ background: b.color }} />
                {b.label}
              </label>
            ))}
          </div>
        </div>
        {(!cover.big || !cover.small) && (
          <button type="button" className="text-sm underline underline-offset-2" onClick={() => set({ big: cover.big || suggestion.big, small: cover.small || suggestion.small })}>
            Use the suggested text
          </button>
        )}
      </div>
    </div>
  );
}

/** Step 3 fields that replace the per-card texts for a collection. */
export function CollectionFields({ draft, update }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg uppercase tracking-wide">Headline and shop page</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Headline" hint="Under the image in the feed">
          <input className={inputClass} value={draft.headline} maxLength={40} onChange={(e) => update({ headline: e.target.value })} />
        </Field>
        <div className="hidden md:block" />
        <Field label="Shop page title">
          <input className={inputClass} value={draft.storeTitle} maxLength={80} onChange={(e) => update({ storeTitle: e.target.value })} />
        </Field>
        <Field label="Shop page subtitle">
          <input className={inputClass} value={draft.storeSubtitle} maxLength={160} onChange={(e) => update({ storeSubtitle: e.target.value })} />
        </Field>
      </div>
      <p className="text-sm text-[#6b6b63]">
        The shop page is proteini.mk/collection. Names, photos and prices come from the shop, so they are always current, and
        tapping a product opens it on proteini.mk.
      </p>
    </div>
  );
}

/** Approximate proteini.mk/collection page: title, subtitle and a 2-column grid. */
function ShopPageMock({ cards, storeTitle, storeSubtitle, onClose }) {
  return (
    <div className="w-full max-w-[380px] rounded-xl border border-[#e7e4da] bg-white shadow-sm overflow-hidden text-[13px] text-[#141409]">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#141409] text-white">
        <img src="/logos/runner.svg" alt="" className="w-5 h-5 invert" />
        <span className="font-semibold flex-1 truncate">proteini.mk</span>
        <button type="button" onClick={onClose} className="text-lg leading-none px-1" aria-label="Back to the ad">
          ×
        </button>
      </div>
      <div className="max-h-[560px] overflow-y-auto bg-[#f6f5f1]">
        {storeTitle && <div className="pt-5 px-3 text-center font-display uppercase text-2xl leading-tight">{storeTitle}</div>}
        {storeSubtitle && <div className="pt-1 px-3 text-center text-[#6b6b63]">{storeSubtitle}</div>}
        <div className="grid grid-cols-2 gap-2.5 p-3">
          {cards.map((c) => (
            <div key={c.key} className="min-w-0 rounded-lg bg-white p-2">
              <div className="aspect-square">
                <img src={sameOrigin(c.image)} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="mt-1 line-clamp-2 leading-snug">{c.title}</div>
              <div className="mt-0.5">
                <span className={`font-bold ${onSale(c) ? "text-[#E1251B]" : ""}`}>{formatMkd(onSale(c) ? c.salePrice : c.price)}</span>
                {onSale(c) && <span className="ml-1.5 text-[11px] text-[#6b6b63] line-through">{formatMkd(c.price)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Instant preview of the collection: the ad in feeds / Stories (same mocks as other ads) and the page behind the tap. */
export function CollectionMock({ pageName, instagramHandle, placements, draft, cards, images }) {
  const [shop, setShop] = useState(false);
  const ad = { key: "collection", thumb: images.feed, vthumb: images.vertical, headline: draft.headline, description: "proteini.mk" };
  return (
    <div>
      <div className="flex gap-4 mb-3 text-sm border-b border-[#e7e4da]">
        {[
          [false, "The ad"],
          [true, "Shop page"],
        ].map(([id, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setShop(id)}
            className={`-mb-px border-b-2 pb-1.5 font-semibold ${shop === id ? "border-[#141409] text-[#141409]" : "border-transparent text-[#6b6b63] hover:text-[#141409]"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {shop ? (
        <ShopPageMock cards={cards} storeTitle={draft.storeTitle} storeSubtitle={draft.storeSubtitle} onClose={() => setShop(false)} />
      ) : (
        <MockPreview pageName={pageName} instagramHandle={instagramHandle} placements={placements} primaryText={draft.primaryText} cta={draft.cta} cards={[ad]} />
      )}
      <div className="mt-2 text-xs text-[#6b6b63]">{dot("Approximate look", `${cards.length} products on the shop page`, `button: ${ctaLabel(draft.cta)}`)}</div>
    </div>
  );
}
