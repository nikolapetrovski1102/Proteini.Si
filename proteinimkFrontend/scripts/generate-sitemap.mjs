import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || "https://proteini.mk").replace(/\/$/, "");
const apiUrl = (process.env.SITEMAP_API_BASE_URL || `${siteUrl}/api`).replace(/\/$/, "");

const staticPaths = [
  "/",
  "/all-products",
  "/all-products/gift-voucher",
  "/goals",
  "/sports",
  "/tips",
  "/sales-points",
  "/about-us",
  "/help/shipping",
  "/help/payment-methods",
  "/privacy-policy",
  "/terms-of-services",
  "/general-provisions",
];

const xmlEscape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const toArray = (value) => (Array.isArray(value) ? value : []);

async function fetchJson(path) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

function buildCategoryPath(category, categoriesById) {
  const slugs = [];
  const visited = new Set();
  let current = category;

  while (current && !visited.has(current.category_Id)) {
    visited.add(current.category_Id);
    if (current.category_Slug) slugs.unshift(current.category_Slug);
    current = current.parent_Category_Id
      ? categoriesById.get(current.parent_Category_Id)
      : null;
  }

  return slugs.length ? `/${slugs.join("/")}` : null;
}

const paths = new Set(staticPaths);

try {
  const [productsResponse, filtersResponse] = await Promise.all([
    fetchJson("/admin/Products/GetAllProducts"),
    fetchJson("/admin/Products/GetFilterOptions"),
  ]);

  for (const product of toArray(productsResponse)) {
    const id = product.product_Id ?? product.Product_Id;
    if (id) paths.add(`/product/${id}`);
  }

  const categories = toArray(filtersResponse?.categories);
  const categoriesById = new Map(
    categories.map((category) => [category.category_Id, category]),
  );
  for (const category of categories) {
    const path = buildCategoryPath(category, categoriesById);
    if (path) paths.add(path);
  }

  for (const brand of toArray(filtersResponse?.brands)) {
    if (brand.brand_Slug) paths.add(`/all-products?brand=${brand.brand_Slug}`);
  }
} catch (error) {
  const existingPath = resolve("public", "sitemap.xml");
  try {
    const existingSitemap = await readFile(existingPath, "utf8");
    const existingUrlCount = (existingSitemap.match(/<url>/g) || []).length;
    if (existingUrlCount > staticPaths.length) {
      console.warn(
        `Sitemap API data was unavailable; preserving the existing ${existingUrlCount}-URL sitemap: ${error.message}`,
      );
      process.exit(0);
    }
  } catch {
    // There is no catalogue sitemap to preserve; the static fallback below is safe.
  }

  console.warn(
    `Sitemap API data was unavailable; writing public routes only: ${error.message}`,
  );
}

const today = new Date().toISOString().slice(0, 10);
const urls = [...paths]
  .sort()
  .map((path) => {
    const priority = path === "/" ? "1.0" : path.startsWith("/product/") ? "0.8" : "0.7";
    return `  <url>\n    <loc>${xmlEscape(`${siteUrl}${path}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const outputDirectory = resolve("public");
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${paths.size} URLs.`);
