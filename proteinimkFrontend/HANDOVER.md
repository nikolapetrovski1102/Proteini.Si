# Frontend handover — 2026-10-29

## Source and scope

Prepared from the local `proteinisi_frontend` working directory, including all current tracked edits and untracked source, assets, scripts and tests. The original repository is `Argent0812/proteinisi_frontend`; its last local commit was `6950efc` (2026-08-11). This repository contains a fresh source snapshot rather than the original Git history.

Included: all 110 existing source files, all 166 public assets, the HTML entry point, package manifest and lockfile, Vite/Tailwind/PostCSS/ESLint configuration, sitemap generator, eight automated test cases and manual product regression fixtures. Public assets include homepage cards, icons, manifest, robots file, sitemap and invoice logo. These represent the local snapshot; backend-hosted uploads remain part of the separate backend/media transfer.

Excluded: original Git metadata, `node_modules`, `dist`, editor files, logs and private environment configuration. The original working directory is preserved. Backend source is available in [proteinimkBackend](https://github.com/alisalihi/proteinimkBackend).

## Handover changes

- Replaced the template README with project-specific setup, API/media configuration, build and hosting instructions.
- Replaced the hard-coded Google Maps browser key with `VITE_GOOGLE_MAPS_EMBED_API_KEY`, added `.env.example`, and excluded private environment files from Git. Configure a valid restricted key to display embedded branch maps.
- Added ignore rules for keys/certificates and verification output.
- Application behavior and production API/media URLs otherwise remain as supplied. All existing files except the README, ignore rules and branch-map key line are preserved byte for byte.

## Operational transfer and staging checks

1. Transfer Google Maps account/key administration securely and confirm its website/API restrictions. A frontend environment variable does not make a browser key secret.
2. Confirm the intended frontend/API/media domain, backend CORS origins, payment redirects, canonical URLs and sitemap source. Development currently calls production until its source URLs are changed; see the README.
3. Obtain the database backup, current backend media and protected backend configuration through the backend handover. These are not frontend files.
4. Browser-test login, admin permissions, product variants, cart, checkout, payment return/callback flows and email behavior on isolated staging data. The included unit tests do not certify external services or production behavior.
5. Confirm the hosting SPA fallback, API/media reverse proxy, domain ownership and deployment access with the current operator.

No production deployment, database mutation, payment or customer email is performed as part of preparing this repository.

## Handover validation — 2026-10-29

- Installed the locked dependencies with `npm ci` using Node.js 25.5.0 and npm 11.8.0.
- All eight automated tests passed: `node --test tests/*.test.js`.
- Production build passed with Vite 7.3.7. The existing large-bundle warning remains (approximately 1.34 MB of JavaScript before gzip).
- Build verification used `SITEMAP_API_BASE_URL=http://127.0.0.1:1 npm run build` to exercise the offline fallback without querying production. The supplied 380-URL sitemap was preserved byte for byte.
- Lint reports 166 errors and 30 warnings, with findings matching the original source exactly. Existing issues include duplicate translation keys, unused variables, React hook rules and component export rules; lint is not a clean release gate.
- Accounted for all 291 supplied project files; only the README, ignore rules and Maps key line differ. Added this handover and `.env.example`.
- Checked credential-like assignments and common token/private-key patterns. The original Maps key is absent from both the handover source and generated build; translation password labels are UI text.
- Verified internal documentation links. The generated build and dependency directory are excluded from the repository.
- Live API flows, payment, email, browser fixture scenarios and production deployment were not certified by these checks; complete the staging checks above before release.
