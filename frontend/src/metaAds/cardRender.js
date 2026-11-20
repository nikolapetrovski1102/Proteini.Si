// Renders one carousel card as a 1080×1080 JPEG in the browser. Meta accepts JPEG/PNG only, so this also turns the
// shop's webp product photos into something Meta takes. Product photos are loaded from the same origin
// (nginx serves /uploads etc. on meta-ads.proteini.mk), so the canvas is never tainted.
import { formatMkd } from "../utils/formatPrice";

export const SIZE = 1080;
const INK = "#141409";
const YELLOW = "#FDC700";
const RED = "#E1251B";

export const TEMPLATES = [
  { id: "price", label: "Price", hint: "Product, name and price; red badge when on sale" },
  { id: "clean", label: "Clean", hint: "Big product with the logo, no text" },
  { id: "bold", label: "Bold", hint: "Coloured panel with a big headline and the price" },
  { id: "promo", label: "Promo", hint: "Huge headline on top, e.g. -30% or БЕСПЛАТНА ДОСТАВА" },
  { id: "split", label: "Split", hint: "Product on the left, name and price on a coloured side" },
  { id: "photoText", label: "Photo + text", hint: "Image fills the square, headline and price on a dark fade" },
  { id: "photo", label: "Photo", hint: "Image fills the square, no text" },
];

export const BACKGROUNDS = [
  { id: "white", label: "White", color: "#ffffff" },
  { id: "paper", label: "Warm grey", color: "#f6f5f1" },
  { id: "yellow", label: "Yellow", color: YELLOW },
  { id: "ink", label: "Black", color: INK },
];

/** Which style options each template uses (the Cards step only shows those). */
export const TEMPLATE_OPTIONS = {
  price: ["background", "logo", "price", "badge", "brand", "tag"],
  clean: ["background", "logo", "badge", "tag"],
  bold: ["background", "logo", "price", "badge", "overlay", "tag"],
  promo: ["background", "logo", "price", "overlay", "tag"],
  split: ["background", "logo", "price", "badge", "brand", "tag"],
  photoText: ["logo", "price", "overlay", "tag"],
  photo: ["tag"],
};

export const defaultStyle = () => ({ background: "white", showLogo: true, showPrice: true, showBadge: true, showBrand: true });

/** Product photos come as absolute https://proteini.mk/... URLs; load them via this origin instead. */
export const sameOrigin = (url) => {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
};

const imageCache = new Map();
export const loadImage = (src) => {
  if (!src) return Promise.resolve(null);
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => {
          imageCache.delete(src);
          resolve(null);
        };
        img.src = src;
      }),
    );
  }
  return imageCache.get(src);
};

let fontsReady;
const ensureFonts = () => {
  fontsReady ??= Promise.all(
    ["700 80px Oswald", "600 40px Montserrat", "800 40px Montserrat"].map((f) => document.fonts.load(f, "АБВ abc 123")),
  ).catch(() => {});
  return fontsReady;
};

// Shop photos carry wide white/transparent margins; find the product itself so it can fill the space.
const boundsCache = new WeakMap();
const productBounds = (img) => {
  if (boundsCache.has(img)) return boundsCache.get(img);
  const full = { sx: 0, sy: 0, sw: img.width, sh: img.height };
  let result = full;
  try {
    const scale = Math.min(1, 320 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const probe = document.createElement("canvas");
    probe.width = w;
    probe.height = h;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    pctx.drawImage(img, 0, 0, w, h);
    const { data } = pctx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const blank = data[i + 3] < 16 || (data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244);
        if (blank) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    if (maxX > minX && maxY > minY) {
      const pad = 2;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(w - 1, maxX + pad);
      maxY = Math.min(h - 1, maxY + pad);
      result = { sx: minX / scale, sy: minY / scale, sw: (maxX - minX + 1) / scale, sh: (maxY - minY + 1) / scale };
    }
  } catch {
    result = full;
  }
  boundsCache.set(img, result);
  return result;
};

const contain = (ctx, img, x, y, w, h) => {
  const { sx, sy, sw, sh } = productBounds(img);
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, sx, sy, sw, sh, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
};

const cover = (ctx, img, x, y, w, h) => {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
};

/** Splits text into at most `maxLines` lines that fit `width`; the last line gets an ellipsis when cut. */
const wrap = (ctx, text, width, maxLines) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(next).width <= width || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) {
      line = "";
      let last = lines[maxLines - 1];
      while (last.length > 1 && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
      lines[maxLines - 1] = `${last.trimEnd()}…`;
      break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
};

/** Shrinks the font until the text fits in `maxLines`; returns the lines and the size used. */
const fit = (ctx, text, { family, weight, max, min, width, maxLines }) => {
  for (let size = max; size >= min; size -= 4) {
    ctx.font = `${weight} ${size}px ${family}`;
    const lines = wrap(ctx, text, width, Infinity);
    if (lines.length <= maxLines) return { lines, size };
  }
  ctx.font = `${weight} ${min}px ${family}`;
  return { lines: wrap(ctx, text, width, maxLines), size: min };
};

const starburst = (ctx, cx, cy, outer, inner, points, color) => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

const discountPercent = (price, sale) => (sale && price > sale ? Math.floor((1 - sale / price) * 100) : 0);

const drawSaleBadge = (ctx, price, sale, cx, cy, r) => {
  const pct = discountPercent(price, sale);
  if (pct <= 0) return;
  starburst(ctx, cx, cy, r, r * 0.84, 18, RED);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(r * 0.62)}px Oswald`;
  ctx.fillText(`-${pct}%`, cx, cy + 2);
};

const drawPrice = (ctx, price, sale, x, y, { size, color, oldColor, saleColor = RED, align = "left" }) => {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const onSale = sale && sale < price;
  const now = formatMkd(onSale ? sale : price);
  ctx.font = `700 ${size}px Oswald`;
  const nowWidth = ctx.measureText(now).width;
  let oldWidth = 0;
  let old = "";
  if (onSale) {
    old = formatMkd(price);
    ctx.font = `600 ${Math.round(size * 0.5)}px Montserrat`;
    oldWidth = ctx.measureText(old).width + 24;
  }
  let start = align === "center" ? x - (nowWidth + oldWidth) / 2 : x;
  ctx.font = `700 ${size}px Oswald`;
  ctx.fillStyle = onSale ? saleColor : color;
  ctx.fillText(now, start, y);
  if (onSale) {
    start += nowWidth + 24;
    ctx.font = `600 ${Math.round(size * 0.5)}px Montserrat`;
    ctx.fillStyle = oldColor;
    ctx.fillText(old, start, y);
    const w = oldWidth - 24;
    ctx.fillRect(start, y - size * 0.18, w, 4);
  }
};

// The real shop logo (frontend/meta-ads/public/logos). "light" = dark text for white/yellow backgrounds.
const LOGO_RATIO = 172.72 / 45.87;
const LOGOS = { light: "/logos/proteini.svg", dark: "/logos/proteini-dark.svg" };

const drawLogo = async (ctx, variant, x, y, width, align = "left") => {
  const logo = await loadImage(LOGOS[variant]);
  if (!logo) return;
  const height = width / LOGO_RATIO;
  const left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  ctx.drawImage(logo, left, y, width, height);
};

const M = 72; // outer margin used by every template

const text = (ctx, value, x, y, { font, color, align = "left", spacing = "0px" }) => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = spacing;
  ctx.fillText(value, x, y);
  ctx.letterSpacing = "0px";
};

const PALETTE = {
  white: { bg: "#ffffff", text: INK, muted: "rgba(20,20,9,0.5)", line: "rgba(20,20,9,0.12)", price: INK, sale: RED, old: "rgba(20,20,9,0.45)", logo: "light", panel: YELLOW, panelText: INK, tag: INK, tagText: YELLOW, multiply: false },
  paper: { bg: "#f6f5f1", text: INK, muted: "rgba(20,20,9,0.5)", line: "rgba(20,20,9,0.12)", price: INK, sale: RED, old: "rgba(20,20,9,0.45)", logo: "light", panel: YELLOW, panelText: INK, tag: INK, tagText: YELLOW, multiply: true },
  yellow: { bg: YELLOW, text: INK, muted: "rgba(20,20,9,0.6)", line: "rgba(20,20,9,0.2)", price: INK, sale: INK, old: "rgba(20,20,9,0.55)", logo: "light", panel: INK, panelText: "#ffffff", tag: INK, tagText: YELLOW, multiply: true },
  ink: { bg: INK, text: "#ffffff", muted: "rgba(255,255,255,0.6)", line: "rgba(255,255,255,0.18)", price: YELLOW, sale: YELLOW, old: "rgba(255,255,255,0.55)", logo: "dark", panel: YELLOW, panelText: INK, tag: YELLOW, tagText: INK, multiply: false, stage: true },
};

/** Draws the product photo in a box, zoomed around its centre. Coloured backgrounds hide the photo's white. */
const drawProduct = (ctx, img, x, y, w, h, zoom, pal) => {
  if (!img) return;
  const z = Math.min(1.4, Math.max(0.6, Number(zoom) || 1));
  const zw = w * z;
  const zh = h * z;
  const zx = x - (zw - w) / 2;
  const zy = y - (zh - h) / 2;
  if (pal.stage) {
    // Dark background: put the product on a white rounded stage so its white photo background does not show as a box.
    const pad = 36;
    roundRect(ctx, x - pad, y - pad, w + 2 * pad, h + 2 * pad, 40);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  ctx.save();
  if (pal.stage) {
    ctx.beginPath();
    roundRect(ctx, x - 36, y - 36, w + 72, h + 72, 40);
    ctx.clip();
  }
  if (pal.multiply) ctx.globalCompositeOperation = "multiply";
  contain(ctx, img, zx, zy, zw, zh);
  ctx.restore();
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** A small tilted sticker, e.g. "НОВО" or "BESTSELLER"; right edge at x. */
const drawTag = (ctx, value, x, y, pal) => {
  const label = String(value || "").trim().toUpperCase();
  if (!label) return;
  ctx.save();
  ctx.font = "700 44px Oswald";
  ctx.letterSpacing = "2px";
  const w = Math.min(560, ctx.measureText(label).width + 48);
  ctx.translate(x - w / 2, y + 36);
  ctx.rotate(-0.05);
  roundRect(ctx, -w / 2, -36, w, 72, 12);
  ctx.fillStyle = pal.tag;
  ctx.fill();
  ctx.fillStyle = pal.tagText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 3, w - 32);
  ctx.restore();
};

const hasDiscount = (price, sale) => discountPercent(price, sale) > 0;

/** Badge top-right (when on sale and enabled) and the tag under it, or in its place. */
const drawCorner = (ctx, card, style, pal, price, sale) => {
  const badge = style.showBadge && hasDiscount(price, sale);
  if (badge) drawSaleBadge(ctx, price, sale, SIZE - M - 78, M + 70, 92);
  if (card.tag) drawTag(ctx, card.tag, SIZE - M, badge ? M + 196 : M - 6, pal);
};

/**
 * card: { image (url), title, brand, price, salePrice, overlay (headline text), tag (sticker text), zoom (0.6–1.4) }
 * style: { background, showLogo, showPrice, showBadge, showBrand } (see defaultStyle)
 * Returns a canvas.
 */
export async function renderCard(card, template, style = defaultStyle()) {
  await ensureFonts();
  style = { ...defaultStyle(), ...style };
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  const img = await loadImage(sameOrigin(card.image));
  const price = Number(card.price) || 0;
  const sale = Number(card.salePrice) || 0;
  const pal = PALETTE[style.background] || PALETTE.white;
  const headlineText = (card.overlay || card.title || "").toUpperCase();

  if (template === "photo" || template === "photoText") {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, SIZE, SIZE);
    if (img) cover(ctx, img, 0, 0, SIZE, SIZE);
    if (template === "photoText") {
      const fade = ctx.createLinearGradient(0, SIZE * 0.45, 0, SIZE);
      fade.addColorStop(0, "rgba(20,20,9,0)");
      fade.addColorStop(1, "rgba(20,20,9,0.88)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, SIZE * 0.45, SIZE, SIZE * 0.55);
      if (style.showLogo) await drawLogo(ctx, "dark", M, M - 10, 228);
      const bottom = style.showPrice ? SIZE - M - 96 : SIZE - M;
      const head = fit(ctx, headlineText, { family: "Oswald", weight: 700, max: 88, min: 56, width: SIZE - 2 * M, maxLines: 2 });
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      head.lines.forEach((line, i) => ctx.fillText(line, M, bottom - head.size * 0.98 * (head.lines.length - 1 - i)));
      if (style.showPrice) drawPrice(ctx, price, sale, M, SIZE - M + 4, { size: 70, color: YELLOW, saleColor: YELLOW, oldColor: "rgba(255,255,255,0.6)" });
    }
    if (card.tag) drawTag(ctx, card.tag, SIZE - M, M - 6, PALETTE.ink);
    return canvas;
  }

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (template === "clean") {
    drawProduct(ctx, img, 150, style.showLogo ? 120 : 150, SIZE - 300, style.showLogo ? 700 : 780, card.zoom, pal);
    if (style.showLogo) await drawLogo(ctx, pal.logo, SIZE / 2, SIZE - M - 52, 196, "center");
    drawCorner(ctx, card, style, pal, price, sale);
    return canvas;
  }

  if (template === "price") {
    if (style.showLogo) await drawLogo(ctx, pal.logo, M, M - 10, 228);
    const textTop = style.showPrice ? 762 : 830;
    drawProduct(ctx, img, 130, 150, SIZE - 260, textTop - 190, card.zoom, pal);

    ctx.fillStyle = pal.line;
    ctx.fillRect(M, textTop, SIZE - 2 * M, 2);

    let y = textTop + 60;
    const brand = style.showBrand ? (card.brand || "").toUpperCase() : "";
    if (brand) {
      text(ctx, brand, M, y, { font: "700 24px Montserrat", color: pal.muted, spacing: "3px" });
      y += 8;
    } else y -= 30;
    const title = fit(ctx, card.title, { family: "Montserrat", weight: 700, max: 44, min: 32, width: SIZE - 2 * M, maxLines: 2 });
    ctx.fillStyle = pal.text;
    ctx.textAlign = "left";
    title.lines.forEach((line, i) => ctx.fillText(line, M, y + title.size * 1.12 * (i + 1)));
    if (style.showPrice) drawPrice(ctx, price, sale, M, SIZE - M + 4, { size: 66, color: pal.price, saleColor: pal.sale, oldColor: pal.old });
    drawCorner(ctx, card, style, pal, price, sale);
    return canvas;
  }

  if (template === "promo") {
    const head = fit(ctx, headlineText, { family: "Oswald", weight: 700, max: 150, min: 72, width: SIZE - 2 * M, maxLines: 2 });
    ctx.fillStyle = pal.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    head.lines.forEach((line, i) => ctx.fillText(line, SIZE / 2, M + head.size * 0.9 * (i + 1)));
    const headBottom = M + head.size * 0.9 * head.lines.length + 40;
    const footer = style.showPrice || style.showLogo ? 150 : 40;
    drawProduct(ctx, img, 170, headBottom, SIZE - 340, SIZE - headBottom - footer - M, card.zoom, pal);
    if (style.showPrice) drawPrice(ctx, price, sale, style.showLogo ? M : SIZE / 2, SIZE - M + 4, { size: 70, color: pal.price, saleColor: pal.sale, oldColor: pal.old, align: style.showLogo ? "left" : "center" });
    if (style.showLogo) await drawLogo(ctx, pal.logo, style.showPrice ? SIZE - M : SIZE / 2, SIZE - M - 52, 196, style.showPrice ? "right" : "center");
    if (card.tag) drawTag(ctx, card.tag, SIZE - M, headBottom - 20, pal);
    return canvas;
  }

  if (template === "split") {
    // Left: product on white. Right: coloured side (black unless a colour is chosen) with brand, name and price.
    const side = style.background === "white" ? PALETTE.ink : pal;
    const half = SIZE / 2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, half, SIZE);
    drawProduct(ctx, img, 48, 140, half - 96, SIZE - 280, card.zoom, PALETTE.white);
    ctx.fillStyle = side.bg;
    ctx.fillRect(half, 0, half, SIZE);
    const x = half + 56;
    const width = half - 112;
    if (style.showLogo) await drawLogo(ctx, side.logo, x, M - 10, 228);
    let y = 420;
    const brand = style.showBrand ? (card.brand || "").toUpperCase() : "";
    if (brand) text(ctx, brand, x, y, { font: "700 26px Montserrat", color: side.muted, spacing: "3px" });
    y += 10;
    const title = fit(ctx, card.overlay || card.title, { family: "Oswald", weight: 700, max: 76, min: 44, width, maxLines: 4 });
    ctx.fillStyle = side.text;
    ctx.textAlign = "left";
    title.lines.forEach((line, i) => ctx.fillText(line.toUpperCase(), x, y + title.size * 1.02 * (i + 1)));
    if (style.showPrice) {
      const onSale = sale && sale < price;
      if (onSale) {
        text(ctx, formatMkd(price), x, SIZE - M - 86, { font: "600 34px Montserrat", color: side.old });
        ctx.font = "600 34px Montserrat";
        ctx.fillStyle = side.old;
        ctx.fillRect(x, SIZE - M - 98, ctx.measureText(formatMkd(price)).width, 4);
      }
      text(ctx, formatMkd(onSale ? sale : price), x, SIZE - M + 4, { font: "700 76px Oswald", color: onSale ? side.sale : side.price });
    }
    if (style.showBadge && hasDiscount(price, sale)) drawSaleBadge(ctx, price, sale, half - 40, M + 70, 92);
    if (card.tag) drawTag(ctx, card.tag, half - 20, style.showBadge && hasDiscount(price, sale) ? M + 196 : M - 6, PALETTE.white);
    return canvas;
  }

  // bold: product above, a coloured panel with the headline and price below.
  const panelTop = 640;
  const panelBg = style.background === "white" || style.background === "paper" ? YELLOW : pal.panel;
  const panelText = panelBg === YELLOW ? INK : pal.panelText;
  if (style.showLogo) await drawLogo(ctx, pal.logo, M, M - 10, 228);
  drawProduct(ctx, img, 150, 130, SIZE - 300, panelTop - 170, card.zoom, pal);
  drawCorner(ctx, card, style, pal, price, sale);

  ctx.fillStyle = panelBg;
  ctx.fillRect(0, panelTop, SIZE, SIZE - panelTop);

  const head = fit(ctx, headlineText, { family: "Oswald", weight: 700, max: 84, min: 56, width: SIZE - 2 * M, maxLines: style.showPrice ? 2 : 3 });
  ctx.fillStyle = panelText;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  head.lines.forEach((line, i) => ctx.fillText(line, M, panelTop + 34 + head.size * 0.98 * (i + 1)));
  if (style.showPrice)
    drawPrice(ctx, price, sale, M, SIZE - M + 4, {
      size: 70,
      color: panelText,
      saleColor: panelText,
      oldColor: panelText === INK ? "rgba(20,20,9,0.55)" : "rgba(255,255,255,0.6)",
    });
  return canvas;
}

export const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))), "image/jpeg", 0.9),
  );
