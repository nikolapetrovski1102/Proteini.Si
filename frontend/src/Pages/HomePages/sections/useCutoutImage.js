import { useEffect, useState } from "react";

const MAX_SIDE = 900;
const cache = new Map(); // src -> Promise<string | null> (cutout URL, or null when it can't be made)

// Max per-channel distance from the background colour that still counts as background. Studio
// shots sit on flat 255 white, so this is tight: white packaging is shaded a little darker.
const TOLERANCE = 8;
// Background must reach the product through a channel at least 2*GAP+1 px wide, so it can't
// leak through a 1–4 px break in a white product's faint outline.
const GAP = 2;

/** Square min-filter (erosion) or max-filter (dilation) of a 0/1 mask, radius r; outside = `edge`. */
function morph(mask, w, h, r, erode, edge) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const pick = erode ? (a, b) => a & b : (a, b) => a | b;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = erode ? 1 : 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        v = pick(v, xx < 0 || xx >= w ? edge : mask[y * w + xx]);
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = erode ? 1 : 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        v = pick(v, yy < 0 || yy >= h ? edge : tmp[yy * w + x]);
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/** 4-connected flood fill from `seeds` over pixels where `allowed` is 1. Returns visited mask + count. */
function flood(allowed, w, h, seeds, stack, visited) {
  let top = 0;
  let count = 0;
  const push = (i) => {
    if (visited[i] || !allowed[i]) return;
    visited[i] = 1;
    stack[top++] = i;
    count++;
  };
  seeds.forEach(push);
  while (top > 0) {
    const i = stack[--top];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  return count;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
};

/*
 * Removes the flat light background a product photo sits on, keeping white packaging intact:
 *  1. background colour = median of the border pixels (bail out if the border isn't flat and light);
 *  2. candidates = pixels within TOLERANCE of that colour;
 *  3. background = candidates reachable from the border through channels wider than 2*GAP px;
 *  4. per column, nothing between the product's top and bottom edge is background: that's a
 *     pure-white label or highlight running into the edge (a white pill bottle), not backdrop;
 *  5. the one-pixel edge fades with its distance from the background colour.
 * Returns an object URL of a transparent PNG, the original src if the photo is already
 * transparent, or null if it isn't a flat-background photo or its pixels can't be read.
 */
function makeCutout(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const n = w * h;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        const px = data.data;

        // Already a cut-out: transparent corners.
        const corners = [0, w - 1, (h - 1) * w, n - 1];
        if (corners.filter((i) => px[i * 4 + 3] < 16).length >= 3) {
          resolve(src);
          return;
        }

        const border = [];
        for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
        for (let y = 1; y < h - 1; y++) border.push(y * w, y * w + w - 1);
        const bgR = median(border.map((i) => px[i * 4]));
        const bgG = median(border.map((i) => px[i * 4 + 1]));
        const bgB = median(border.map((i) => px[i * 4 + 2]));
        const dist = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          const o = i * 4;
          dist[i] = Math.max(Math.abs(px[o] - bgR), Math.abs(px[o + 1] - bgG), Math.abs(px[o + 2] - bgB));
        }
        const flatBorder = border.filter((i) => dist[i] <= TOLERANCE).length / border.length;
        if (Math.min(bgR, bgG, bgB) < 215 || flatBorder < 0.6) {
          resolve(null);
          return;
        }

        const cand = new Uint8Array(n);
        for (let i = 0; i < n; i++) cand[i] = dist[i] <= TOLERANCE ? 1 : 0;

        // Background core: eroded candidates connected to the border, grown back within candidates.
        const stack = new Int32Array(n);
        const core = new Uint8Array(n);
        flood(morph(cand, w, h, GAP, true, 1), w, h, border, stack, core);
        const bg = morph(core, w, h, GAP, false, 0);
        for (let i = 0; i < n; i++) bg[i] &= cand[i];

        // Product = foreground blobs of at least 0.2% of the image (drops specks and noise).
        const product = new Uint8Array(n);
        const seen = new Uint8Array(n);
        const minBlob = n * 0.002;
        for (let start = 0; start < n; start++) {
          if (seen[start] || bg[start]) continue;
          // Flood one blob; its pixels end up in stack[0..size).
          let size = 0;
          let read = 0;
          seen[start] = 1;
          stack[size++] = start;
          while (read < size) {
            const i = stack[read++];
            const x = i % w;
            const visit = (j) => {
              if (!seen[j] && !bg[j]) {
                seen[j] = 1;
                stack[size++] = j;
              }
            };
            if (x > 0) visit(i - 1);
            if (x < w - 1) visit(i + 1);
            if (i >= w) visit(i - w);
            if (i < n - w) visit(i + w);
          }
          if (size >= minBlob) for (let k = 0; k < size; k++) product[stack[k]] = 1;
        }

        // Column fill: background can't sit between the product's top and bottom in a column.
        for (let x = 0; x < w; x++) {
          let top = -1;
          let bottom = -1;
          for (let y = 0; y < h; y++) {
            if (product[y * w + x]) {
              if (top < 0) top = y;
              bottom = y;
            }
          }
          for (let y = top; top >= 0 && y <= bottom; y++) bg[y * w + x] = 0;
        }

        let cleared = 0;
        for (let i = 0; i < n; i++) cleared += bg[i];
        // Nothing (or almost nothing) to remove: not a white-background photo.
        if (cleared < n * 0.05) {
          resolve(null);
          return;
        }

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const o = i * 4 + 3;
            if (bg[i]) {
              px[o] = 0;
              continue;
            }
            const touches =
              (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
            if (touches) px[o] = Math.round(px[o] * Math.min(1, Math.max(0, (dist[i] - TOLERANCE) / 24 + 0.35)));
          }
        }

        ctx.putImageData(data, 0, 0);
        canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), "image/png");
      } catch {
        resolve(null); // tainted canvas
      }
    };
    img.src = src;
  });
}

/**
 * Transparent version of a product photo, for placing it over decoration (DrawnWave).
 * Returns { src, cutout }: while working or on failure, the original src with cutout=false.
 */
export function useCutoutImage(src) {
  const [result, setResult] = useState({ for: null, url: null });

  useEffect(() => {
    if (!src || typeof document === "undefined") return;
    let cancelled = false;
    if (!cache.has(src)) cache.set(src, makeCutout(src));
    cache.get(src).then((url) => {
      if (!cancelled) setResult({ for: src, url });
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const url = result.for === src ? result.url : null;
  return url ? { src: url, cutout: true } : { src, cutout: false };
}
