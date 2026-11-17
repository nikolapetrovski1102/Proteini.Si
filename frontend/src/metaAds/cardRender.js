// Renders one carousel card as a 1080×1080 JPEG in the browser. Meta accepts JPEG/PNG only, so this also turns the
// shop's webp product photos into something Meta takes. Product photos are loaded from the same origin
// (nginx serves /uploads etc. on meta-ads.proteini.mk), so the canvas is never tainted.
import { formatMkd } from "../utils/formatPrice";

export const SIZE = 1080;
const INK = "#141409";
const YELLOW = "#FDC700";
const RED = "#E1251B";

export const TEMPLATES = [
  { id: "clean", label: "Clean", hint: "Product on white with the logo" },
  { id: "price", label: "Price", hint: "Product, name and price; red badge when on sale" },
  { id: "bold", label: "Bold", hint: "Yellow panel with a big headline and the price" },
  { id: "photo", label: "Photo", hint: "Image fills the square, no text" },
];

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

/**
 * card: { image (url), title, brand, price, salePrice, overlay (headline text, bold template) }
 * Returns a canvas.
 */
export async function renderCard(card, template) {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  const img = await loadImage(sameOrigin(card.image));
  const price = Number(card.price) || 0;
  const sale = Number(card.salePrice) || 0;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (template === "photo") {
    if (img) cover(ctx, img, 0, 0, SIZE, SIZE);
    return canvas;
  }

  if (template === "clean") {
    if (img) contain(ctx, img, 150, 120, SIZE - 300, 700);
    await drawLogo(ctx, "light", SIZE / 2, SIZE - M - 52, 196, "center");
    return canvas;
  }

  if (template === "price") {
    await drawLogo(ctx, "light", M, M - 10, 228);
    if (img) contain(ctx, img, 130, 140, SIZE - 260, 590);

    ctx.fillStyle = "rgba(20,20,9,0.12)";
    ctx.fillRect(M, 762, SIZE - 2 * M, 2);

    let y = 822;
    const brand = (card.brand || "").toUpperCase();
    if (brand) {
      text(ctx, brand, M, y, { font: "700 24px Montserrat", color: "rgba(20,20,9,0.5)", spacing: "3px" });
      y += 8;
    }
    const title = fit(ctx, card.title, { family: "Montserrat", weight: 700, max: 44, min: 32, width: SIZE - 2 * M, maxLines: 2 });
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    title.lines.forEach((line, i) => ctx.fillText(line, M, y + title.size * 1.12 * (i + 1)));
    drawPrice(ctx, price, sale, M, SIZE - M + 4, { size: 66, color: INK, oldColor: "rgba(20,20,9,0.45)" });
    drawSaleBadge(ctx, price, sale, SIZE - M - 78, M + 70, 92);
    return canvas;
  }

  // bold: product on white above, a yellow panel with the headline and price below.
  const panelTop = 640;
  await drawLogo(ctx, "light", M, M - 10, 228);
  if (img) contain(ctx, img, 150, 130, SIZE - 300, panelTop - 160);
  drawSaleBadge(ctx, price, sale, SIZE - M - 78, M + 70, 92);

  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, panelTop, SIZE, SIZE - panelTop);

  const headline = (card.overlay || card.title || "").toUpperCase();
  const head = fit(ctx, headline, { family: "Oswald", weight: 700, max: 84, min: 56, width: SIZE - 2 * M, maxLines: 2 });
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  head.lines.forEach((line, i) => ctx.fillText(line, M, panelTop + 34 + head.size * 0.98 * (i + 1)));
  drawPrice(ctx, price, sale, M, SIZE - M + 4, { size: 70, color: INK, saleColor: INK, oldColor: "rgba(20,20,9,0.55)" });
  return canvas;
}

export const canvasToBlob = (canvas) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))), "image/jpeg", 0.9),
  );
