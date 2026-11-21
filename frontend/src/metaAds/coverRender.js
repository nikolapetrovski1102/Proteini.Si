// Collection ads: a 1200×628 cover banner (big promo line on the left, up to three products on the right) put together
// with a row of four product tiles into one ad image — 1080×1090 for feeds and 1080×1920 for Stories/Reels. Tapping the
// ad opens proteini.mk/collection with every picked product. Same canvas helpers as the carousel cards.
import { formatMkd } from "../utils/formatPrice";
import { SAFE_BOTTOM, SAFE_TOP, VERTICAL_H, VERTICAL_W, contain, drawFloor, drawLogo, ensureFonts, fit, loadImage, roundRect, sameOrigin } from "./cardRender";

export const COLLECTION_MIN = 4;
export const COLLECTION_MAX = 50;

export const collectionDefaults = () => ({
  headline: "Најнови промоции",
  storeTitle: "НАЈНОВИ ПРОМОЦИИ",
  storeSubtitle: "Нарачај сега и заштеди!",
});

export const COVER_W = 1200;
export const COVER_H = 628;
const INK = "#141409";
const YELLOW = "#FDC700";

export const COVER_BACKGROUNDS = [
  { id: "ink", label: "Black + light window", color: INK },
  { id: "yellow", label: "Yellow", color: YELLOW },
  { id: "white", label: "White", color: "#ffffff" },
];

export const defaultCover = () => ({ big: "", small: "", footer: "proteini.mk", background: "ink" });

const discount = (c) => (c.salePrice && c.price > c.salePrice ? Math.floor((1 - c.salePrice / c.price) * 100) : 0);

/** Suggested big line ("до -40%") and small line (brands) from the picked products. */
export const coverSuggestions = (cards) => {
  const max = Math.max(0, ...cards.map(discount));
  const brands = [...new Set(cards.map((c) => c.brand).filter(Boolean))].slice(0, 4);
  return {
    big: max > 0 ? `до -${max}%` : "НОВИ ПРОМОЦИИ",
    small: brands.join(" · ") || "Оригинални суплементи",
  };
};

/** Draws 1–3 products in the box: the first one big in front, the next two smaller behind it. */
const drawProducts = (ctx, images, x, y, w, h) => {
  const list = images.filter(Boolean).slice(0, 3);
  if (list.length === 1) return contain(ctx, list[0], x + w * 0.1, y + h * 0.06, w * 0.8, h * 0.88);
  if (list.length === 2) {
    contain(ctx, list[1], x + w * 0.5, y + h * 0.16, w * 0.46, h * 0.76);
    return contain(ctx, list[0], x + w * 0.06, y + h * 0.06, w * 0.5, h * 0.88);
  }
  contain(ctx, list[1], x + w * 0.02, y + h * 0.2, w * 0.36, h * 0.66);
  contain(ctx, list[2], x + w * 0.62, y + h * 0.2, w * 0.36, h * 0.66);
  contain(ctx, list[0], x + w * 0.24, y + h * 0.04, w * 0.52, h * 0.92);
};

/**
 * cover: { big, small, footer, background } (see defaultCover); products: cards (first three are drawn).
 * Returns a canvas.
 */
export async function renderCover(cover, products) {
  await ensureFonts();
  const c = { ...defaultCover(), ...cover };
  const canvas = document.createElement("canvas");
  canvas.width = COVER_W;
  canvas.height = COVER_H;
  const ctx = canvas.getContext("2d");
  const images = await Promise.all(products.slice(0, 3).map((p) => loadImage(sameOrigin(p.customImage || p.image))));

  const dark = c.background === "ink";
  const yellow = c.background === "yellow";
  const text = dark ? "#ffffff" : INK;
  const accent = dark ? YELLOW : INK;
  const muted = dark ? "rgba(255,255,255,0.72)" : "rgba(20,20,9,0.7)";
  ctx.fillStyle = dark ? INK : yellow ? YELLOW : "#ffffff";
  ctx.fillRect(0, 0, COVER_W, COVER_H);

  // Product window on the right: a light panel, so the white backgrounds of the shop photos blend in (multiply).
  const win = { x: 610, y: 36, w: 554, h: COVER_H - 72 };
  ctx.save();
  roundRect(ctx, win.x, win.y, win.w, win.h, 36);
  ctx.fillStyle = yellow ? "#ffffff" : "#f6f5f1";
  ctx.fill();
  ctx.clip();
  ctx.globalCompositeOperation = "multiply";
  drawProducts(ctx, images, win.x + 12, win.y + 16, win.w - 24, win.h - 32);
  ctx.restore();

  const left = 64;
  const width = 500;
  // The yellow "SI" of the logo vanishes on yellow, so there it sits on a black badge.
  if (yellow) {
    roundRect(ctx, left - 18, 40, 256, 76, 16);
    ctx.fillStyle = INK;
    ctx.fill();
  }
  await drawLogo(ctx, dark || yellow ? "dark" : "light", left, 52, 220);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Stack from the bottom up: footer, small line, then the big line centred in the space that is left.
  let bottom = COVER_H - 52;
  if (c.footer) {
    ctx.font = "600 24px Montserrat";
    ctx.fillStyle = muted;
    ctx.fillText(c.footer, left, bottom);
    bottom -= 56;
  }
  if (c.small) {
    const small = fit(ctx, c.small, { family: "Montserrat", weight: 600, max: 34, min: 24, width, maxLines: 2 });
    const lineH = small.size * 1.25;
    ctx.fillStyle = text;
    small.lines.forEach((line, i) => ctx.fillText(line, left, bottom - lineH * (small.lines.length - 1 - i)));
    bottom -= lineH * small.lines.length + 16;
  }

  const bigText = (c.big || "").toUpperCase();
  const top = 150;
  let big = fit(ctx, bigText, { family: "Oswald", weight: 700, max: 170, min: 104, width, maxLines: 1 });
  if (ctx.measureText(big.lines[0] || "").width > width) big = fit(ctx, bigText, { family: "Oswald", weight: 700, max: 130, min: 64, width, maxLines: 2 });
  const lineH = big.size * 0.95;
  const room = bottom - top;
  if (lineH * big.lines.length > room) big = fit(ctx, bigText, { family: "Oswald", weight: 700, max: Math.floor(room / big.lines.length / 0.95), min: 48, width, maxLines: 2 });
  const blockH = big.size * 0.95 * big.lines.length;
  const firstBaseline = top + (room - blockH) / 2 + big.size * 0.8;
  ctx.font = `700 ${big.size}px Oswald`;
  ctx.fillStyle = accent;
  big.lines.forEach((line, i) => ctx.fillText(line, left - 4, firstBaseline + big.size * 0.95 * i));
  return canvas;
}

export const COLLECTION_FEED_W = 1080;
export const COLLECTION_FEED_H = 1090;

const BG = { ink: INK, yellow: YELLOW, white: "#ffffff" };

/** White product tiles (`cols` per row, as many rows as needed) with the price under each, like Meta's collection format. */
const drawTiles = async (ctx, products, x, y, w, { gap, dark, cols = 4, count = 4, priceSize = 34 }) => {
  const size = (w - gap * (cols - 1)) / cols;
  const priceH = priceSize + 14;
  const images = await Promise.all(products.slice(0, count).map((p) => loadImage(sameOrigin(p.customImage || p.image))));
  for (let i = 0; i < count; i++) {
    const tx = x + (i % cols) * (size + gap);
    const ty = y + Math.floor(i / cols) * (size + priceH + gap);
    ctx.save();
    roundRect(ctx, tx, ty, size, size, 22);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.clip();
    if (images[i]) contain(ctx, images[i], tx + size * 0.08, ty + size * 0.08, size * 0.84, size * 0.84);
    ctx.restore();
    const p = products[i];
    if (!p) continue;
    const onSale = p.salePrice && p.salePrice < p.price;
    ctx.font = `700 ${priceSize}px Oswald`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = onSale ? (dark ? YELLOW : "#E1251B") : dark ? "#ffffff" : INK;
    ctx.fillText(formatMkd(onSale ? p.salePrice : p.price), tx + size / 2, ty + size + priceH - 4, size);
  }
  const rows = Math.ceil(count / cols);
  return rows * (size + priceH) + (rows - 1) * gap;
};

/**
 * The collection ad image: the cover on top and products under it. vertical = 1080×1920 for Stories/Reels: cover, a
 * 2×2 grid of big tiles inside the safe area and a coloured floor behind Meta's caption and button. Returns a canvas.
 */
export async function renderCollectionImage(cover, products, { vertical = false } = {}) {
  const c = { ...defaultCover(), ...cover };
  const coverCanvas = await renderCover(c, products);
  const W = vertical ? VERTICAL_W : COLLECTION_FEED_W;
  const H = vertical ? VERTICAL_H : COLLECTION_FEED_H;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const dark = c.background === "ink";
  ctx.fillStyle = BG[c.background] || INK;
  ctx.fillRect(0, 0, W, H);
  const more = products.length - 4;
  const moreText = more > 0 ? `+${more} ${more === 1 ? "производ" : "производи"} на proteini.mk` : "";

  if (vertical) {
    // Cover just under Meta's profile row, a row of four big tiles, then a coloured floor behind the caption and button.
    const coverH = Math.round((W * COVER_H) / COVER_W);
    const top = SAFE_TOP - 30;
    ctx.drawImage(coverCanvas, 0, top, W, coverH);
    const floorTop = SAFE_BOTTOM + 50;
    drawFloor(ctx, floorTop, c.background === "yellow" ? INK : YELLOW, W, H);
    const gridTop = top + coverH + 44;
    const used = await drawTiles(ctx, products, 36, gridTop, W - 72, { gap: 16, dark, priceSize: 42 });
    if (moreText) {
      ctx.font = "600 36px Montserrat";
      ctx.textAlign = "center";
      ctx.fillStyle = dark ? "rgba(255,255,255,0.8)" : "rgba(20,20,9,0.75)";
      ctx.fillText(moreText, W / 2, Math.min(floorTop - 70, gridTop + used + 70), W - 160);
    }
    return canvas;
  }

  const coverH = Math.round((W * COVER_H) / COVER_W);
  ctx.drawImage(coverCanvas, 0, 0, W, coverH);
  const pad = 28;
  const tilesTop = coverH + 24;
  const used = await drawTiles(ctx, products, pad, tilesTop, W - 2 * pad, { gap: 16, dark });
  if (moreText) {
    ctx.font = "600 30px Montserrat";
    ctx.textAlign = "center";
    ctx.fillStyle = dark ? "rgba(255,255,255,0.75)" : "rgba(20,20,9,0.7)";
    ctx.fillText(moreText, W / 2, Math.min(H - 24, tilesTop + used + 50));
  }
  return canvas;
}
