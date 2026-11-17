import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { api } from "./api";
import { TEMPLATES, canvasToBlob, renderCard } from "./cardRender";
import { CTAS, DESCRIPTION_MAX, HEADLINE_MAX, PRIMARY_MAX, PRIMARY_TEXT_PRESETS } from "./copy";
import Delivery from "./Delivery";
import { defaultDelivery, toDeliveryPayload } from "./deliveryOptions";
import ProductPicker from "./ProductPicker";
import { MetaPreview, MockPreview } from "./Previews";
import { Button, Field, Notice, Section } from "./ui";
import { dot, inputClass } from "./format";

const DRAFT_KEY = "pm-meta-ads-draft-v1";
const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const newDraft = () => ({
  format: "carousel",
  template: "price",
  cards: [],
  primaryText: PRIMARY_TEXT_PRESETS[0].text,
  cta: "SHOP_NOW",
  name: "",
  addUtm: true,
  optimizeCardOrder: true,
  status: "PAUSED",
  delivery: defaultDelivery(),
  hashes: {}, // render signature -> Meta image hash, so unchanged cards are not uploaded twice
});

const readDraft = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!saved) return newDraft();
    // Uploaded own images (blob: URLs) do not survive a reload; fall back to the product photo.
    saved.cards = (saved.cards || []).map((c) => (c.customImage ? { ...c, customImage: null } : c));
    return { ...newDraft(), ...saved, delivery: { ...defaultDelivery(), ...saved.delivery } };
  } catch {
    return newDraft();
  }
};

const cardFromProduct = (p) => {
  const onSale = p.salePrice && p.salePrice < p.price;
  return {
    key: `${p.id}-${Date.now().toString(36)}`,
    productId: p.id,
    image: p.image,
    customImage: null,
    title: p.title,
    brand: p.brand,
    price: p.price,
    salePrice: onSale ? p.salePrice : null,
    overlay: onSale ? `-${Math.floor((1 - p.salePrice / p.price) * 100)}% ${p.brand || ""}`.trim() : p.brand || p.title,
    headline: p.title.slice(0, HEADLINE_MAX),
    description: formatMkd(onSale ? p.salePrice : p.price),
    link: p.link,
  };
};

const renderInput = (card) => ({
  image: card.customImage || card.image,
  title: card.title,
  brand: card.brand,
  price: card.price,
  salePrice: card.salePrice,
  overlay: card.overlay,
});
const signature = (card, template) => JSON.stringify([template, renderInput(card)]);

// The token cannot read the @name (no instagram_basic), so the status may carry the numeric ID instead.
const instagramHandle = (status) => {
  const name = status?.instagramUsername;
  return name && !/^\d+$/.test(name) ? name : "proteini.si_makedonija";
};

export default function Composer({ status, onPublished }) {
  const [draft, setDraft] = useState(readDraft);
  const [products, setProducts] = useState([]);
  const [productsState, setProductsState] = useState({ loading: true, error: "" });
  const [thumbs, setThumbs] = useState({}); // signature -> data URL
  const [adSets, setAdSets] = useState([]);
  const [work, setWork] = useState({ busy: false, step: "", error: "", result: null });
  const [metaPreviews, setMetaPreviews] = useState(null);
  const canvases = useRef(new Map()); // signature -> canvas

  const update = useCallback((patch) => setDraft((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) })), []);
  const updateCard = (key, patch) =>
    update((d) => ({ cards: d.cards.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));

  // Save the draft (minus thumbnails) on every change.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* private mode or full storage: drafts just are not kept */
    }
  }, [draft]);

  useEffect(() => {
    api.products().then(
      (list) => {
        setProducts(list);
        setProductsState({ loading: false, error: "" });
      },
      (e) => setProductsState({ loading: false, error: e.message }),
    );
    api.adSets().then(setAdSets, () => setAdSets([]));
  }, []);

  // Render card images whenever a card or the template changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const card of draft.cards) {
        const sig = signature(card, draft.template);
        if (canvases.current.has(sig)) continue;
        const canvas = await renderCard(renderInput(card), draft.template);
        if (cancelled) return;
        canvases.current.set(sig, canvas);
        setThumbs((t) => ({ ...t, [sig]: canvas.toDataURL("image/jpeg", 0.8) }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draft.cards, draft.template]);

  const selectedIds = draft.cards.map((c) => c.productId);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const toggleProduct = (id) =>
    update((d) => {
      if (d.cards.some((c) => c.productId === id)) return { cards: d.cards.filter((c) => c.productId !== id) };
      const p = byId.get(id);
      return p && d.cards.length < 10 ? { cards: [...d.cards, cardFromProduct(p)] } : {};
    });

  const addMany = (ids) =>
    update((d) => {
      const have = new Set(d.cards.map((c) => c.productId));
      const extra = ids.filter((id) => !have.has(id) && byId.has(id)).slice(0, 10 - d.cards.length);
      return { cards: [...d.cards, ...extra.map((id) => cardFromProduct(byId.get(id)))] };
    });

  const move = (index, delta) =>
    update((d) => {
      const cards = [...d.cards];
      const target = index + delta;
      if (target < 0 || target >= cards.length) return {};
      [cards[index], cards[target]] = [cards[target], cards[index]];
      return { cards };
    });

  const setOwnImage = (key, file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setWork((w) => ({ ...w, error: "Use a JPG, PNG or WebP image." }));
      return;
    }
    updateCard(key, { customImage: URL.createObjectURL(file) });
  };

  const cardsForAd = draft.format === "single" ? draft.cards.slice(0, 1) : draft.cards;
  const problems = [];
  if (!status?.configured) problems.push("Meta API is not connected yet (see the note at the top).");
  if (draft.format === "carousel" && cardsForAd.length < 2) problems.push("Pick at least 2 products for a carousel.");
  if (draft.format === "single" && cardsForAd.length < 1) problems.push("Pick a product.");
  if (!draft.primaryText.trim()) problems.push("Write the primary text.");
  if (draft.delivery.mode === "new" && !draft.delivery.countries.length) problems.push("Pick at least one country.");
  if (draft.delivery.mode === "new" && !(Number(draft.delivery.dailyBudget) > 0)) problems.push("Set a daily budget.");
  if (draft.delivery.mode === "existing" && !draft.delivery.adSetId) problems.push("Choose the ad set to add the ad to.");
  if (draft.delivery.mode === "new" && draft.delivery.goal === "SALES" && !status?.pixelConfigured)
    problems.push("The Sales goal needs the Meta Pixel ID on the server; use Traffic for now.");

  /** Renders (if needed) and uploads every card image, reusing hashes of images Meta already has. */
  const uploadImages = async () => {
    const hashes = { ...draft.hashes };
    let i = 0;
    for (const card of cardsForAd) {
      i++;
      const sig = signature(card, draft.template);
      if (hashes[sig]) continue;
      setWork((w) => ({ ...w, step: `Uploading image ${i} of ${cardsForAd.length}…` }));
      let canvas = canvases.current.get(sig);
      if (!canvas) {
        canvas = await renderCard(renderInput(card), draft.template);
        canvases.current.set(sig, canvas);
      }
      const blob = await canvasToBlob(canvas);
      const { hash } = await api.uploadImage(blob, `card-${i}.jpg`);
      hashes[sig] = hash;
    }
    // Keep the hash map small: only what the current cards use.
    const used = Object.fromEntries(draft.cards.map((c) => signature(c, draft.template)).filter((s) => hashes[s]).map((s) => [s, hashes[s]]));
    update({ hashes: used });
    return hashes;
  };

  const buildPayload = (hashes, status) => ({
    format: draft.format,
    name: draft.name.trim() || `${draft.format === "single" ? "Single" : "Carousel"} · ${today()}`,
    primaryText: draft.primaryText.trim(),
    callToAction: draft.cta,
    link: cardsForAd[0]?.link,
    optimizeCardOrder: draft.optimizeCardOrder,
    addUtm: draft.addUtm,
    status,
    cards: cardsForAd.map((c) => ({
      imageHash: hashes[signature(c, draft.template)],
      headline: c.headline.trim(),
      description: c.description.trim(),
      link: c.link,
    })),
    delivery: toDeliveryPayload(draft.delivery, draft.name),
  });

  const runWork = async (fn) => {
    setWork({ busy: true, step: "Preparing images…", error: "", result: null });
    try {
      await fn();
    } catch (e) {
      const d = e.data || {};
      const made = dot(d.campaignId && `campaign ${d.campaignId}`, d.adSetId && `ad set ${d.adSetId}`);
      const extra = made ? ` Already created: ${made}. ${d.note || ""}` : "";
      setWork({ busy: false, step: "", error: `${e.message}${extra}`, result: null });
    }
  };

  const loadMetaPreview = () =>
    runWork(async () => {
      const hashes = await uploadImages();
      setWork((w) => ({ ...w, step: "Asking Meta for a preview…" }));
      setMetaPreviews(await api.preview(buildPayload(hashes, "PAUSED")));
      setWork({ busy: false, step: "", error: "", result: null });
    });

  const publish = () => {
    const live = draft.status === "ACTIVE";
    if (live && !window.confirm("Publish as ACTIVE? The ad starts spending as soon as Meta approves it.")) return;
    runWork(async () => {
      const hashes = await uploadImages();
      setWork((w) => ({ ...w, step: "Creating the ad on Meta…" }));
      const result = await api.publish(buildPayload(hashes, draft.status));
      setWork({ busy: false, step: "", error: "", result });
      onPublished?.();
      api.adSets().then(setAdSets, () => {});
    });
  };

  const startOver = () => {
    if (draft.cards.length && !window.confirm("Clear this draft and start a new ad?")) return;
    setDraft(newDraft());
    setMetaPreviews(null);
    setWork({ busy: false, step: "", error: "", result: null });
  };

  const thumbFor = (card) => thumbs[signature(card, draft.template)];

  return (
    <div className="space-y-5">
      <Section
        step="1"
        title="Products"
        aside={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={draft.format === "carousel"} onChange={() => update({ format: "carousel" })} />
              Carousel
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={draft.format === "single"} onChange={() => update({ format: "single" })} />
              Single image
            </label>
          </div>
        }
      >
        <ProductPicker
          products={products}
          loading={productsState.loading}
          error={productsState.error}
          selectedIds={selectedIds}
          onToggle={toggleProduct}
          onAddMany={addMany}
          onClear={() => update({ cards: [] })}
        />
      </Section>

      <Section step="2" title="Cards" aside={draft.cards.length ? "Edit text right on the card" : null}>
        <div className="flex flex-wrap gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update({ template: t.id })}
              title={t.hint}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${
                draft.template === t.id ? "border-[#141409] bg-[#141409] text-white" : "border-[#e7e4da] bg-white hover:border-[#141409]"
              }`}
            >
              <span className="font-semibold">{t.label}</span>
              <span className={`block text-xs ${draft.template === t.id ? "text-white/70" : "text-[#6b6b63]"}`}>{t.hint}</span>
            </button>
          ))}
        </div>

        {!draft.cards.length && <p className="text-sm text-[#6b6b63]">Pick products above; each one becomes a card.</p>}

        <div className="flex gap-4 overflow-x-auto pb-2 scroll-x">
          {draft.cards.map((card, index) => {
            const unused = draft.format === "single" && index > 0;
            return (
              <div key={card.key} className={`w-[250px] shrink-0 space-y-2 ${unused ? "opacity-40" : ""}`}>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-[#e7e4da] bg-[#f6f5f1]">
                  {thumbFor(card) ? (
                    <img src={thumbFor(card)} alt="" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-[#6b6b63]">Rendering…</div>
                  )}
                  <span className="absolute top-2 left-2 rounded-md bg-[#141409] text-white text-xs font-bold px-2 py-0.5">{index + 1}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    <Button variant="ghost" className="!px-2 !py-1" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move left">
                      ←
                    </Button>
                    <Button variant="ghost" className="!px-2 !py-1" disabled={index === draft.cards.length - 1} onClick={() => move(index, 1)} aria-label="Move right">
                      →
                    </Button>
                  </div>
                  <label className="cursor-pointer underline underline-offset-2">
                    {card.customImage ? "Change image" : "Own image"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setOwnImage(card.key, e.target.files?.[0])} />
                  </label>
                  {card.customImage && (
                    <button type="button" className="underline underline-offset-2" onClick={() => updateCard(card.key, { customImage: null })}>
                      Product photo
                    </button>
                  )}
                  <button type="button" className="text-red-700 underline underline-offset-2" onClick={() => update((d) => ({ cards: d.cards.filter((c) => c.key !== card.key) }))}>
                    Remove
                  </button>
                </div>
                {draft.template === "bold" && (
                  <input
                    className={`${inputClass} !py-1.5`}
                    value={card.overlay}
                    maxLength={40}
                    onChange={(e) => updateCard(card.key, { overlay: e.target.value })}
                    placeholder="Big text on the image"
                    aria-label="Text on the image"
                  />
                )}
                <input
                  className={`${inputClass} !py-1.5 font-semibold`}
                  value={card.headline}
                  maxLength={HEADLINE_MAX}
                  onChange={(e) => updateCard(card.key, { headline: e.target.value })}
                  placeholder="Headline"
                  aria-label="Headline"
                />
                <input
                  className={`${inputClass} !py-1.5`}
                  value={card.description}
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => updateCard(card.key, { description: e.target.value })}
                  placeholder="Description (optional)"
                  aria-label="Description"
                />
              </div>
            );
          })}
        </div>
      </Section>

      <Section step="3" title="Text">
        <div className="grid md:grid-cols-[1fr_260px] gap-4">
          <div>
            <Field label="Primary text" hint={`${draft.primaryText.length}/${PRIMARY_MAX} · shown above the cards`}>
              <textarea
                className={`${inputClass} min-h-[110px]`}
                maxLength={PRIMARY_MAX}
                value={draft.primaryText}
                onChange={(e) => update({ primaryText: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
              <span className="text-[#6b6b63]">Use:</span>
              {PRIMARY_TEXT_PRESETS.map((p) => (
                <button key={p.label} type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => update({ primaryText: p.text })}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Button">
              <select className={inputClass} value={draft.cta} onChange={(e) => update({ cta: e.target.value })}>
                {CTAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ad name" hint="Only you see this in Ads Manager">
              <input className={inputClass} value={draft.name} placeholder={`Carousel · ${today()}`} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5" checked={draft.addUtm} onChange={(e) => update({ addUtm: e.target.checked })} />
              <span>Tag links for Google Analytics (UTM)</span>
            </label>
            {draft.format === "carousel" && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5" checked={draft.optimizeCardOrder} onChange={(e) => update({ optimizeCardOrder: e.target.checked })} />
                <span>Let Meta show the best cards first</span>
              </label>
            )}
          </div>
        </div>
      </Section>

      <Section step="4" title="Delivery">
        <Delivery value={draft.delivery} onChange={(delivery) => update({ delivery })} adSets={adSets} status={status} />
      </Section>

      <Section step="5" title="Preview & publish" aside={<Button variant="link" onClick={startOver}>Start a new ad</Button>}>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-2">Quick preview</div>
            <MockPreview
              pageName={status?.pageName || "Proteini.mk"}
              instagramHandle={instagramHandle(status)}
              placements={draft.delivery?.mode === "existing" ? "auto" : draft.delivery?.placements}
              primaryText={draft.primaryText}
              cta={draft.cta}
              cards={cardsForAd.map((c) => ({ ...c, thumb: thumbFor(c) }))}
            />
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-2">Exact preview from Meta</div>
              {metaPreviews?.length ? (
                <MetaPreview previews={metaPreviews} />
              ) : (
                <p className="text-sm text-[#6b6b63] mb-2">Uploads the images and shows how Facebook and Instagram will display the ad. Nothing is published.</p>
              )}
              <Button variant="ghost" disabled={work.busy || problems.length > 0} onClick={loadMetaPreview}>
                {metaPreviews ? "Refresh Meta preview" : "Show Meta preview"}
              </Button>
            </div>

            <div className="border-t border-[#e7e4da] pt-4 space-y-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={draft.status === "PAUSED"} onChange={() => update({ status: "PAUSED" })} />
                  Publish paused (check it in Ads Manager first)
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={draft.status === "ACTIVE"} onChange={() => update({ status: "ACTIVE" })} />
                  Publish active
                </label>
              </div>
              {problems.length > 0 && (
                <ul className="text-sm text-[#6b6b63] list-disc pl-5">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <Button variant="yellow" className="w-full !py-3.5 text-base" disabled={work.busy || problems.length > 0} onClick={publish}>
                {work.busy ? work.step : draft.status === "ACTIVE" ? "Publish ad (active)" : "Publish ad (paused)"}
              </Button>
              {work.error && <Notice tone="error">{work.error}</Notice>}
              {work.result && (
                <Notice tone="success">
                  <div className="font-semibold">{work.result.message || "The ad is on Meta."}</div>
                  <div className="mt-1">{dot(work.result.campaignId && `Campaign ${work.result.campaignId}`, `Ad set ${work.result.adSetId}`, `Ad ${work.result.adId}`)}</div>
                  {work.result.adsManagerUrl && (
                    <a className="inline-block mt-2 underline font-semibold" href={work.result.adsManagerUrl} target="_blank" rel="noreferrer">
                      Open in Ads Manager
                    </a>
                  )}
                </Notice>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
