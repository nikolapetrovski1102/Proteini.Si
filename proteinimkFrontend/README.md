# Proteini.mk frontend

React 19 storefront and administration interface built with Vite, React Router and Tailwind CSS. This handover includes the current working source, public assets, tests, sitemap generator and npm lockfile.

Backend repository: [alisalihi/proteinimkBackend](https://github.com/alisalihi/proteinimkBackend).

## Setup

Use Node.js 22.12 or newer with npm. The locked Vite version also supports Node.js 20.19+, but Node.js 22+ is recommended for this handover.

```bash
git clone https://github.com/alisalihi/proteinimkFrontend.git
cd proteinimkFrontend
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_GOOGLE_MAPS_EMBED_API_KEY` in `.env.local` to a Google Maps Embed API browser key before using embedded branch maps. Obtain the existing key securely or configure a replacement, restrict it to the intended website origins and Maps Embed API, and confirm billing/API access with the account owner. The browser key is visible in the generated client bundle. Without a valid key, embedded maps do not load; the branch directions links remain available.

Vite normally serves development at `http://localhost:5173`; use the URL printed by the command if that port is occupied. Restart the dev server after changing environment values.

## API and media configuration

The application currently targets `https://proteini.mk/api`, with media at `https://proteini.mk`. These production addresses are part of the source snapshot. **The development server also uses these addresses until you change them.** Use an isolated backend and database before testing registrations, admin edits, orders, payments or subscriptions.

For a local backend, change `API_BASE_URL` in `src/services/api.js` to `http://localhost:6800/api` and `IMAGE_BASE_URL` to `http://localhost:6800`. The backend handover listens on port 6800 and allows localhost frontend origins in Development. For staging, configure the backend's `Cors:AllowedOrigins`, frontend URL and backend URL settings for the staging origins.

Additional media helpers and the mock-payment page contain literal production addresses. Locate them before adapting the app to another environment:

```bash
rg -n 'https://proteini\.mk' src
```

Review each match: API/media origins, SEO canonical URLs and public website links have different purposes. There is currently no global `VITE_API_BASE_URL` setting. The sitemap environment variables below configure the build script only.

## Verification

```bash
node --test tests/*.test.js
npm run lint
npm run build
npm run preview
```

The eight automated cases cover delivery charges and sale-date behavior. [tests/README.md](tests/README.md) documents manual product/admin browser fixtures served by the dev server. Those fixtures mock API methods and are excluded from the standard production build. Existing lint failures are recorded in [HANDOVER.md](HANDOVER.md).

## Sitemap and production build

`npm run build` first runs `scripts/generate-sitemap.mjs`, then builds the application into `dist/`. The generator reads the public product/filter endpoints to include catalogue URLs. If the API is unavailable and the existing sitemap has catalogue URLs, it preserves that sitemap. The included sitemap is a local snapshot, so regenerate against the intended catalogue before a production release.

Optional build-script overrides are shell environment variables:

```bash
SITE_URL=https://proteini.mk SITEMAP_API_BASE_URL=https://proteini.mk/api npm run build
```

These are not `VITE_` settings, and the standalone Node sitemap script does not load `.env` files automatically. If changing domains, also review `public/robots.txt`, SEO defaults, canonical links and other literal website URLs.

Deploy the contents of `dist/` to a static web server with SPA fallback to `index.html`, so direct navigation to product, admin and account routes works. Keep `/api/` and backend upload/media routes routed to ASP.NET Core when hosting everything on one domain. Use [the backend deployment checklist](https://github.com/alisalihi/proteinimkBackend/blob/main/DEPLOYMENT_CHECKLIST.md) for the historical hosting layout, backups, release checks and rollback process.

`.env.local`, dependencies and generated builds are excluded from Git. Rebuild after changing `VITE_` variables because they are substituted at build time. Never put database passwords, payment secrets, SMTP passwords or JWT signing keys in frontend configuration.
