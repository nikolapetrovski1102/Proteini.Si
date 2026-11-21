import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatMkd } from "../utils/formatPrice";
import { api } from "./api";
import { canvasToBlob, defaultStyle, renderCard, renderVerticalCard, sameOrigin } from "./cardRender";
import { CollectionMock, CoverEditor } from "./Collection";
import { COLLECTION_MAX, COLLECTION_MIN, collectionDefaults, coverSuggestions, defaultCover, renderCollectionImage } from "./coverRender";
import { HEADLINE_MAX, PRIMARY_TEXT_PRESETS } from "./copy";
import Delivery from "./Delivery";
import { defaultDelivery, toDeliveryPayload } from "./deliveryOptions";
import ProductPicker, { MAX_CARDS } from "./ProductPicker";
import { MockPreview } from "./Previews";
import StepCards from "./StepCards";
import useCardDrag from "./useCardDrag";
import StepReview from "./StepReview";
import StepText from "./StepText";
import { Button } from "./ui";
import { dot } from "./format";

const DRAFT_KEY = "pm-meta-ads-draft-v2";
const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STEPS = [
  ["Products", "Pick what to advertise"],
  ["Design", "Design the images"],
  ["Text", "Words and button"],
  ["Delivery", "Budget and audience"],
  ["Review", "Preview and publish"],
];

const newDraft = () => ({
  step: 0,
  format: "carousel",
  template: "price",
  style: defaultStyle(),
  cards: [],
  primaryText: PRIMARY_TEXT_PRESETS[0].text,
  cta: "SHOP_NOW",
  name: "",
  mainLink: "first",
  customLink: "",
  addUtm: true,
  optimizeCardOrder: true,
  status: "PAUSED",
  previewFormats: ["MOBILE_FEED_STANDARD", "INSTAGRAM_STANDARD"],
  delivery: defaultDelivery(),
  hashes: {}, // render signature -> Meta image hash, so unchanged cards are not uploaded twice
  cover: defaultCover(),
  ...collectionDefaults(),
});

const FORMATS = [
  ["carousel", "Carousel", "2–10 products people swipe through"],
  ["single", "Single image", "One product, one big image"],
  ["collection", "Collection", `Cover + four products, opens a proteini.mk page with all of them · ${COLLECTION_MIN}–${COLLECTION_MAX} products`],
];
const formatLabel = (format) => FORMATS.find(([id]) => id === format)?.[1] || "Carousel";

const readDraft = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!saved) return newDraft();
    // Uploaded own images (blob: URLs) do not survive a reload; fall back to the product photo.
    saved.cards = (saved.cards || []).map((c) => (c.customImage ? { ...c, customImage: null } : c));
    return {
      ...newDraft(),
      ...saved,
      style: { ...defaultStyle(), ...saved.style },
      cover: { ...defaultCover(), ...saved.cover },
      delivery: { ...defaultDelivery(), ...saved.delivery },
    };
  } catch {
    return newDraft();
  }
};

const cardFromProduct = (p) => {
  const onSale = p.salePrice && p.salePrice < p.price;
  return {
    key: `${p.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    productId: p.id,
    image: p.image,
    customImage: null,
    title: p.title,
    brand: p.brand,
    price: p.price,
    salePrice: onSale ? p.salePrice : null,
    overlay: onSale ? `-${Math.floor((1 - p.salePrice / p.price) * 100)}% ${p.brand || ""}`.trim() : p.brand || p.title,
    tag: "",
    zoom: 1,
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
  tag: card.tag,
  zoom: card.zoom,
});
const signature = (card, template, style) => JSON.stringify([template, style, renderInput(card)]);
/** The 9:16 Stories/Reels version of a card has its own signature (and its own Meta hash). */
const vsignature = (card, draft) => `v:${signature(card, draft.template, draft.style)}`;

/** What the collection image depends on: the cover texts, the suggestions and the products (photos, prices, count). */
const coverInput = (draft) => {
  const suggestion = coverSuggestions(draft.cards);
  return {
    cover: { ...draft.cover, big: draft.cover.big || suggestion.big, small: draft.cover.small || suggestion.small },
    products: draft.cards.map((c) => ({ image: c.image, customImage: c.customImage, price: c.price, salePrice: c.salePrice })),
  };
};
const coverSignature = (draft, vertical = false) => `${vertical ? "cover-v" : "cover"}:${JSON.stringify(coverInput(draft))}`;

// The token cannot read the @name (no instagram_basic), so the status may carry the numeric ID instead.
const instagramHandle = (status) => {
  const name = status?.instagramUsername;
  return name && !/^\d+$/.test(name) ? name : "proteini.si_makedonija";
};

const shopHome = (link) => {
  try {
    return `${new URL(link).origin}/`;
  } catch {
    return "https://proteini.mk/";
  }
};

function Stepper({ step, done, goTo }) {
  return (
    <ol className="grid grid-cols-5 gap-1.5 md:gap-3">
      {STEPS.map(([title, hint], i) => {
        const current = i === step;
        return (
          <li key={title}>
            <button type="button" onClick={() => goTo(i)} className="w-full text-left group">
              <div className={`h-1.5 rounded-full ${current ? "bg-[#141409]" : i < step || done[i] ? "bg-[#FDC700]" : "bg-[#e7e4da]"}`} />
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`font-display text-lg leading-none ${current ? "" : "text-[#6b6b63]"}`}>{i + 1}</span>
                <span className={`text-sm font-semibold truncate ${current ? "" : "text-[#6b6b63] group-hover:text-[#141409]"}`}>{title}</span>
              </div>
              <div className="hidden md:block text-xs text-[#6b6b63] truncate">{hint}</div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Composer({ status, onPublished, onShowAds }) {
  const [draft, setDraft] = useState(readDraft);
  const [products, setProducts] = useState([]);
  const [productsState, setProductsState] = useState({ loading: true, error: "" });
  const [thumbs, setThumbs] = useState({}); // signature (square or v:) -> data URL
  const [adSets, setAdSets] = useState([]);
  const [work, setWork] = useState({ busy: false, kind: "", step: "", error: "", result: null });
  const [metaPreviews, setMetaPreviews] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [coverThumbs, setCoverThumbs] = useState({ feed: null, vertical: null });
  const canvases = useRef(new Map()); // signature -> canvas
  const top = useRef(null);

  const update = useCallback((patch) => setDraft((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) })), []);
  const updateCard = (key, patch) => update((d) => ({ cards: d.cards.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));
  const step = draft.step;
  const collection = draft.format === "collection";
  const maxCards = collection ? COLLECTION_MAX : MAX_CARDS;

  // Save the draft on every change.
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

  // Render card images whenever a card, the template or the style changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // A collection draws one image from the product photos, not designed cards.
      if (draft.format === "collection") return;
      // Square first for every card (what most steps show), then the 9:16 versions.
      for (const vertical of [false, true]) {
        for (const card of draft.cards) {
          const sig = vertical ? vsignature(card, { template: draft.template, style: draft.style }) : signature(card, draft.template, draft.style);
          if (canvases.current.has(sig)) continue;
          const canvas = vertical
            ? await renderVerticalCard(renderInput(card), draft.template, draft.style)
            : await renderCard(renderInput(card), draft.template, draft.style);
          if (cancelled) return;
          canvases.current.set(sig, canvas);
          setThumbs((t) => ({ ...t, [sig]: canvas.toDataURL("image/jpeg", 0.8) }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draft.cards, draft.template, draft.style, draft.format]);

  /** The collection image (feed or 9:16), drawn once per look and kept. */
  const collectionCanvas = async (vertical) => {
    const sig = coverSignature(draft, vertical);
    let canvas = canvases.current.get(sig);
    if (!canvas) {
      const { cover, products: shown } = coverInput(draft);
      canvas = await renderCollectionImage(cover, shown, { vertical });
      canvases.current.set(sig, canvas);
    }
    return canvas;
  };

  // Draw both collection images.
  const coverSig = collection ? coverSignature(draft) : "";
  useEffect(() => {
    if (!coverSig) return undefined;
    let cancelled = false;
    (async () => {
      const feed = await collectionCanvas(false);
      if (cancelled) return;
      setCoverThumbs({ feed: feed.toDataURL("image/jpeg", 0.85), vertical: null });
      const vertical = await collectionCanvas(true);
      if (cancelled) return;
      setCoverThumbs({ feed: feed.toDataURL("image/jpeg", 0.85), vertical: vertical.toDataURL("image/jpeg", 0.85) });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverSig]);

  // Anything that changes the ad makes an old Meta preview stale.
  useEffect(() => {
    setMetaPreviews(null);
  }, [draft.cards, draft.template, draft.style, draft.primaryText, draft.cta, draft.format, draft.cover, draft.headline, draft.storeTitle, draft.storeSubtitle]);

  const selectedIds = draft.cards.map((c) => c.productId);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const toggleProduct = (id) =>
    update((d) => {
      if (d.cards.some((c) => c.productId === id)) return { cards: d.cards.filter((c) => c.productId !== id) };
      const p = byId.get(id);
      return p && d.cards.length < maxCards ? { cards: [...d.cards, cardFromProduct(p)] } : {};
    });

  const addMany = (ids) =>
    update((d) => {
      const have = new Set(d.cards.map((c) => c.productId));
      const extra = ids.filter((id) => !have.has(id) && byId.has(id)).slice(0, maxCards - d.cards.length);
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

  /** Drag and drop: take the card at `from` and put it at `to`. */
  const reorder = (from, to) =>
    update((d) => {
      if (from === to || from < 0 || to < 0 || from >= d.cards.length || to >= d.cards.length) return {};
      const cards = [...d.cards];
      const [card] = cards.splice(from, 1);
      cards.splice(to, 0, card);
      return { cards };
    });

  const removeCard = (key) => update((d) => ({ cards: d.cards.filter((c) => c.key !== key) }));

  const setOwnImage = (key, file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      window.alert("Use a JPG, PNG or WebP image.");
      return;
    }
    updateCard(key, { customImage: URL.createObjectURL(file) });
  };

  const [drag, dragProps] = useCardDrag(reorder);
  const cardsForAd = draft.format === "single" ? draft.cards.slice(0, 1) : collection ? draft.cards : draft.cards.slice(0, MAX_CARDS);
  const thumbFor = (card) => (card ? (collection ? sameOrigin(card.customImage || card.image) : thumbs[signature(card, draft.template, draft.style)]) : undefined);
  const vthumbFor = (card) => (card && !collection ? thumbs[vsignature(card, draft)] : undefined);

  // Every problem points at the step that fixes it.
  const d = draft.delivery;
  const problems = [];
  if (!status?.configured) problems.push({ step: null, text: "Meta API is not connected yet (see the note at the top)." });
  if (draft.format === "carousel" && cardsForAd.length < 2) problems.push({ step: 0, text: "Pick at least 2 products for a carousel." });
  if (draft.format === "single" && cardsForAd.length < 1) problems.push({ step: 0, text: "Pick a product." });
  if (collection) {
    if (cardsForAd.length < COLLECTION_MIN) problems.push({ step: 0, text: `Pick at least ${COLLECTION_MIN} products for a collection.` });
    if (!draft.headline.trim()) problems.push({ step: 2, text: "Write the headline under the image." });
  } else if (cardsForAd.some((c) => !c.headline.trim())) problems.push({ step: 2, text: "Every card needs a headline." });
  if (!draft.primaryText.trim()) problems.push({ step: 2, text: "Write the primary text." });
  if (draft.format === "carousel" && draft.mainLink === "custom" && !/^https:\/\/\S+$/.test(draft.customLink.trim()))
    problems.push({ step: 2, text: "The custom \"See more\" link must start with https://." });
  if (d.mode === "new") {
    if (!d.countries.length) problems.push({ step: 3, text: "Pick at least one country." });
    if (d.budgetType === "daily" && !(Number(d.dailyBudget) > 0)) problems.push({ step: 3, text: "Set a daily budget." });
    if (d.budgetType === "lifetime" && !(Number(d.lifetimeBudget) > 0)) problems.push({ step: 3, text: "Set the total budget." });
    if (d.budgetType === "lifetime" && !d.endTime) problems.push({ step: 3, text: "A total budget needs an end date." });
    if (d.endTime && new Date(d.endTime) <= (d.startTime ? new Date(d.startTime) : new Date())) problems.push({ step: 3, text: "The end date must be after the start." });
    if (d.goal === "SALES" && !status?.pixelConfigured) problems.push({ step: 3, text: "The Sales goal needs the Meta Pixel; use Traffic." });
  }
  if (d.mode === "existing" && !d.adSetId) problems.push({ step: 3, text: "Choose the ad set to add the ad to." });

  // The 9:16 image is only uploaded where it can run: a carousel splits into full-screen ads only in a new ad set; single
  // and collection ads carry it for Stories/Reels unless the ad is limited to feeds.
  const verticalNeeded = draft.format === "carousel" ? d.mode === "new" && d.placements !== "feeds" : d.mode === "existing" || d.placements !== "feeds";

  const stepProblems = (i) => problems.filter((p) => p.step === i);
  const done = STEPS.map((_, i) => i < 4 && stepProblems(i).length === 0 && (i !== 0 || draft.cards.length > 0));

  const goTo = (i) => {
    update({ step: Math.max(0, Math.min(STEPS.length - 1, i)) });
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  /** Renders (if needed) and uploads every image, reusing hashes of images Meta already has. */
  const uploadImages = async () => {
    const hashes = { ...draft.hashes };
    const upload = async (sig, label, file, draw) => {
      if (hashes[sig]) return;
      setWork((w) => ({ ...w, step: `Uploading ${label}…` }));
      const { hash } = await api.uploadImage(await canvasToBlob(await draw()), file);
      hashes[sig] = hash;
    };

    if (collection) {
      await upload(coverSignature(draft), "the collection image", "collection.jpg", () => collectionCanvas(false));
      if (verticalNeeded) await upload(coverSignature(draft, true), "the Stories image", "collection-story.jpg", () => collectionCanvas(true));
      const keep = [coverSignature(draft), coverSignature(draft, true)].filter((sig) => hashes[sig]);
      update({ hashes: Object.fromEntries(keep.map((sig) => [sig, hashes[sig]])) });
      return hashes;
    }

    const cached = async (sig, render, card) => {
      let canvas = canvases.current.get(sig);
      if (!canvas) {
        canvas = await render(renderInput(card), draft.template, draft.style);
        canvases.current.set(sig, canvas);
      }
      return canvas;
    };
    const total = cardsForAd.length;
    for (const [i, card] of cardsForAd.entries()) {
      const sig = signature(card, draft.template, draft.style);
      await upload(sig, `image ${i + 1} of ${total}`, `card-${i + 1}.jpg`, () => cached(sig, renderCard, card));
      if (verticalNeeded) {
        const vsig = vsignature(card, draft);
        await upload(vsig, `Stories image ${i + 1} of ${total}`, `card-${i + 1}-story.jpg`, () => cached(vsig, renderVerticalCard, card));
      }
    }
    // Keep the hash map small: only what the current cards use.
    const used = Object.fromEntries(
      draft.cards
        .flatMap((c) => [signature(c, draft.template, draft.style), vsignature(c, draft)])
        .filter((sig) => hashes[sig])
        .map((sig) => [sig, hashes[sig]]),
    );
    update({ hashes: used });
    return hashes;
  };

  const mainLink = () => {
    if (draft.format === "single" || draft.mainLink === "first") return cardsForAd[0]?.link;
    if (draft.mainLink === "shop") return shopHome(cardsForAd[0]?.link);
    return draft.customLink.trim();
  };

  const buildPayload = (hashes, adStatus, previewFormats) => {
    const base = {
      format: draft.format,
      primaryText: draft.primaryText.trim(),
      callToAction: draft.cta,
      addUtm: draft.addUtm,
      status: adStatus,
      previewFormats,
      delivery: toDeliveryPayload(draft.delivery, draft.name),
    };
    if (collection) {
      // One image ad (feed + 9:16) that opens proteini.mk/collection with every picked product.
      const shop = shopHome(cardsForAd[0]?.link);
      return {
        ...base,
        name: draft.name.trim() || `Collection · ${today()}`,
        link: shop,
        productIds: cardsForAd.map((c) => c.productId),
        storeTitle: draft.storeTitle.trim(),
        storeSubtitle: draft.storeSubtitle.trim(),
        cards: [
          {
            imageHash: hashes[coverSignature(draft)],
            verticalImageHash: verticalNeeded ? hashes[coverSignature(draft, true)] : undefined,
            headline: draft.headline.trim(),
            description: "",
            link: shop,
          },
        ],
      };
    }
    return {
      ...base,
      name: draft.name.trim() || `${formatLabel(draft.format)} · ${today()}`,
      link: mainLink(),
      optimizeCardOrder: draft.optimizeCardOrder,
      cards: cardsForAd.map((c) => ({
        imageHash: hashes[signature(c, draft.template, draft.style)],
        verticalImageHash: verticalNeeded ? hashes[vsignature(c, draft)] : undefined,
        headline: c.headline.trim(),
        description: c.description.trim(),
        link: c.link,
      })),
    };
  };

  const runWork = async (kind, fn) => {
    setWork({ busy: true, kind, step: "Preparing images…", error: "", result: null });
    try {
      await fn();
    } catch (e) {
      const data = e.data || {};
      const made = dot(data.campaignId && `campaign ${data.campaignId}`, data.adSetId && `ad set ${data.adSetId}`);
      const extra = made ? ` Already created: ${made}. ${data.note || ""}` : "";
      setWork({ busy: false, kind: "", step: "", error: `${e.message}${extra}`, result: null });
    }
  };

  const loadMetaPreview = () =>
    runWork("preview", async () => {
      const hashes = await uploadImages();
      setWork((w) => ({ ...w, step: "Asking Meta for a preview…" }));
      setMetaPreviews(await api.preview(buildPayload(hashes, "PAUSED", draft.previewFormats)));
      setWork({ busy: false, kind: "", step: "", error: "", result: null });
    });

  const publish = () => {
    if (draft.status === "ACTIVE" && !window.confirm("Publish as ACTIVE? The ad starts spending as soon as Meta approves it.")) return;
    runWork("publish", async () => {
      const hashes = await uploadImages();
      setWork((w) => ({ ...w, step: "Creating the ad on Meta…" }));
      const result = await api.publish(buildPayload(hashes, draft.status));
      setWork({ busy: false, kind: "", step: "", error: "", result });
      onPublished?.();
      api.adSets().then(setAdSets, () => {});
    });
  };

  const startOver = (force = false) => {
    if (!force && draft.cards.length && !window.confirm("Clear this draft and start a new ad?")) return;
    setDraft(newDraft());
    setMetaPreviews(null);
    setActiveCard(0);
    setWork({ busy: false, kind: "", step: "", error: "", result: null });
  };

  const next = () => {
    if (step === 0 && !draft.cards.length) return;
    goTo(step + 1);
  };

  const mock = collection ? (
    <CollectionMock
      pageName={status?.pageName || "Proteini.mk"}
      instagramHandle={instagramHandle(status)}
      placements={d.mode === "existing" ? "auto" : d.placements}
      draft={draft}
      cards={cardsForAd}
      images={coverThumbs}
    />
  ) : (
    <MockPreview
      pageName={status?.pageName || "Proteini.mk"}
      instagramHandle={instagramHandle(status)}
      placements={d.mode === "existing" ? "auto" : d.placements}
      primaryText={draft.primaryText}
      cta={draft.cta}
      cards={cardsForAd.map((c) => ({ ...c, thumb: thumbFor(c), vthumb: verticalNeeded ? vthumbFor(c) : undefined }))}
    />
  );

  const current = stepProblems(step);
  const finished = Boolean(work.result);

  return (
    <div ref={top} className="bg-white border border-[#e7e4da] rounded-2xl scroll-mt-4">
      <div className="p-5 md:p-6 border-b border-[#e7e4da] space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl uppercase tracking-wide">New ad</h2>
          <div className="text-sm text-[#6b6b63] flex items-center gap-4">
            <span>
              {dot(
                formatLabel(draft.format),
                draft.cards.length ? `${cardsForAd.length} ${collection ? "product" : "card"}${cardsForAd.length === 1 ? "" : "s"}` : null,
                "draft saved",
              )}
            </span>
            {!finished && (
              <Button variant="link" onClick={() => startOver()}>
                Start over
              </Button>
            )}
          </div>
        </div>
        {!finished && <Stepper step={step} done={done} goTo={goTo} />}
      </div>

      <div className="p-5 md:p-6 min-h-[50vh]">
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3 max-w-4xl">
              {FORMATS.map(([value, title, hint]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ format: value })}
                  className={`rounded-xl border p-3 text-left ${draft.format === value ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da] hover:border-[#141409]"}`}
                >
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-[#6b6b63]">{hint}</div>
                </button>
              ))}
            </div>
            {draft.cards.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scroll-x pb-1">
                <span className="text-sm text-[#6b6b63] shrink-0 mr-1">Picked (drag to reorder):</span>
                {draft.cards.map((c, i) => (
                  <button
                    key={c.key}
                    type="button"
                    {...dragProps(i)}
                    onClick={() => removeCard(c.key)}
                    title={`${c.title} · drag to reorder, click to remove`}
                    className={`relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border bg-[#f6f5f1] hover:border-red-600 cursor-grab active:cursor-grabbing ${
                      drag.over === i && drag.from !== i ? "border-[#141409] ring-2 ring-[#FDC700]" : "border-[#e7e4da]"
                    } ${drag.from === i ? "opacity-30" : (draft.format === "single" && i > 0) || (draft.format === "carousel" && i >= MAX_CARDS) ? "opacity-40" : ""}`}
                  >
                    {thumbFor(c) && <img src={thumbFor(c)} alt="" className="w-full h-full" />}
                    <span className="absolute bottom-0 left-0 bg-[#141409] text-white text-[10px] font-bold px-1">{i + 1}</span>
                  </button>
                ))}
              </div>
            )}
            <ProductPicker
              products={products}
              loading={productsState.loading}
              error={productsState.error}
              selectedIds={selectedIds}
              onToggle={toggleProduct}
              onAddMany={addMany}
              onClear={() => update({ cards: [] })}
              maxPicked={maxCards}
            />
          </div>
        )}

        {step === 1 && collection && <CoverEditor draft={draft} update={update} images={coverThumbs} />}

        {step === 1 && !collection && (
          <StepCards
            draft={draft}
            update={update}
            updateCard={updateCard}
            move={move}
            reorder={reorder}
            removeCard={removeCard}
            setOwnImage={setOwnImage}
            thumbFor={thumbFor}
            vthumbFor={vthumbFor}
            active={activeCard}
            setActive={setActiveCard}
          />
        )}

        {step === 2 && (
          <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-8">
            <StepText draft={draft} update={update} updateCard={updateCard} thumbFor={thumbFor} cardsForAd={cardsForAd} />
            <div className="hidden xl:block">
              <div className="sticky top-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6b63] mb-2">Live preview</div>
                {mock}
              </div>
            </div>
          </div>
        )}

        {step === 3 && <Delivery value={d} onChange={(delivery) => update({ delivery })} adSets={adSets} status={status} />}

        {step === 4 && (
          <StepReview
            draft={draft}
            update={update}
            status={status}
            problems={problems}
            cardsForAd={cardsForAd}
            thumbFor={thumbFor}
            metaPreviews={metaPreviews}
            mock={mock}
            loadMetaPreview={loadMetaPreview}
            publish={publish}
            work={work}
            goTo={goTo}
            startOver={startOver}
            onShowAds={onShowAds}
          />
        )}
      </div>

      {!finished && step < 4 && (
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-b-2xl border-t border-[#e7e4da] bg-white/95 backdrop-blur px-5 md:px-6 py-3">
          <Button variant="ghost" disabled={step === 0} onClick={() => goTo(step - 1)}>
            ← Back
          </Button>
          <span className="flex-1 min-w-0 text-sm text-[#6b6b63] truncate">
            {current.length ? <span className="text-[#8a6d00]">{current[0].text}</span> : step === 0 ? dot(`${draft.cards.length} of ${maxCards} picked`) : null}
          </span>
          <Button variant="yellow" disabled={step === 0 && !draft.cards.length} onClick={next}>
            Next: {STEPS[step + 1][0]} →
          </Button>
        </div>
      )}
      {!finished && step === 4 && (
        <div className="flex border-t border-[#e7e4da] px-5 md:px-6 py-3">
          <Button variant="ghost" onClick={() => goTo(3)}>
            ← Back
          </Button>
        </div>
      )}
    </div>
  );
}
