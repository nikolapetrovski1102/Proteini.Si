# Proteini.mk Feature Audit

Audit date: 2026-10-14  
Branches: `audit/full-ecommerce-qa-20261014` in backend and frontend  
Deployment status: local only; not pushed and not deployed

## Final status

`COMPLETE` below means the requested behavior is implemented and passed the available local build/unit checks. Production certification still requires the additive migration and staging tests listed in `QA_REPORT.md`.

| # | Feature | Initial | Final | Evidence |
|---|---|---|---|---|
| 01 | Intelligent multilingual search | PARTIAL | COMPLETE | Macedonian Cyrillic/Latin transliteration, Albanian diacritic normalization, English/MK/AL synonyms, typo tolerance, singular/plural stems, exact/prefix ranking, catalogue filters, variants, SKU, counts, sorting and paging. Nine backend search tests pass. |
| 02 | Courier, shipping and COD | PARTIAL | COMPLETE for current approved rule | Backend-authoritative configurable flat delivery, COD surcharge, free-delivery threshold and payment-method switches. Current defaults remain 165/30/3000 MKD. Historical weight brackets are intentionally not reintroduced because later requirements replaced them and VAT/over-30kg rules were never approved. |
| 03 | Flexible-value gift vouchers | PARTIAL | COMPLETE | Flexible product amount limits, paid-only cryptographic issuance, unique codes, balance/partial redemption, row locking, reservation/release, expiry/status controls, order history, admin list and CSV report. |
| 04 | Advanced order administration | PARTIAL | COMPLETE | Search, filters, paging, allowlisted sorting, detail, variants, delivery, controlled transitions, tracking number/URL, voucher/promotion/gift data, safe UTF-8 CSV and operational-document download. |
| 05 | Promotion codes | PARTIAL | COMPLETE | CRUD, active dates, percentage/fixed discounts, min/max, usage limits, per-customer limits, row-locked validation, history/report and safe CSV. Public checkout promo entry remains intentionally hidden per client direction. |
| 06 | Free gifts | PARTIAL | COMPLETE | CRUD, dates, thresholds, product/variant selection, eligibility, customer choice, transactional stock checks, order preservation and safe archival. |
| 07 | Customers and newsletter | PARTIAL | COMPLETE | Separate paginated/searchable lists, customer order count/value/last order, consent source/date, status, unsubscribe, duplicate prevention, protected exports and formula hardening. |
| 08 | Homepage goals/sports | PARTIAL | COMPLETE | CRUD, MK/AL titles, image replacement, order/status, filter mapping, secure internal/Proteini.mk destinations, duplicate slug prevention and image MIME/size/extension validation. |
| 09 | Tips CMS | PARTIAL | COMPLETE | CRUD, stable slug detail pages, MK/AL content, formatted sanitized HTML, images, status/order, SEO title/description and public localized rendering. |
| 10 | Automatic order documents | MISSING | COMPLETE as operational document | Idempotent immutable HTML snapshot generated at order creation, with order/customer/address/items/variants/prices/discounts/delivery/payment/total, admin download and explicit non-fiscal wording. |
| 11 | Categories/subcategories | PARTIAL | COMPLETE | CRUD, parent validation, recursive cycle prevention, duplicate slugs, ordering, deletion guards, assignments/filter integration, slug history and customer redirect to the current slug. |
| 12 | Existing automations | OUT OF SCOPE | OUT OF SCOPE | Client explicitly excluded abandoned-cart, Viber, replenishment, campaign schedulers and retry queues. Existing transactional order and password-reset emails remain. |

## Architecture and security

- Frontend: React 19, React Router 7, Vite 7.
- Backend: ASP.NET Core 8, Dapper, SQL Server, JWT.
- Admin writes are protected by the backend `SuperAdmin` policy; frontend menu visibility is not relied on for security.
- CORS is restricted to configured origins.
- Order prices, delivery, promotions, vouchers, gifts and stock are resolved server-side.
- Stock, promotion usage, voucher balance and payment completion use transactions/row locks where concurrency matters.
- CSV exports neutralize spreadsheet formula-leading characters and use UTF-8-compatible output.
- User-editable article HTML is sanitized server-side.
- Uploaded Tips/homepage-card images enforce size, extension and MIME restrictions.

## Feature implementation detail

### 01 — Search

- Backend: `Services/SearchTermExpander.cs`, `Services/ProductFilterService.cs`.
- Tests: `ProteinisiBackend.Tests/SearchTermExpanderTests.cs`.
- Search includes names, translated names, brand, categories, flavour, packaging, variant name and SKU. Existing exact/prefix/contains ranking and catalogue filters are preserved.
- Remaining production verification: relevance and query-plan timing with the full production-size catalogue.

### 02 — Shipping and COD

- Backend: `Controllers/CommerceSettingsController.cs` and trusted order calculation in `OrderController.cs`.
- Frontend: `src/utils/deliveryPricing.js`, checkout, and the Delivery settings tab in `/admin-promotions`.
- Database: `ShippingSettings` in `scripts/complete-ecommerce-features-20261014.sql`.
- Checkout and server use the same configurable defaults. At least one payment method must remain enabled.
- Historical weight/courier/VAT rules are not silently applied; they require new approved commercial values before use.

### 03 — Gift vouchers

- Backend: `GiftVouchersController.cs`; issuance/redemption in `OrderController.cs`.
- Frontend: voucher-only checkout entry and Gift vouchers admin tab.
- Database: `GiftVouchers`, `GiftVoucherRedemptions`, `Orders.Gift_Voucher_Amount`.
- Codes issue only after confirmed payment. COD voucher purchases issue when marked paid; card purchases issue on verified payment. A voucher cannot buy a voucher. Reservations are released on failure/rejection/cancellation.
- Admin can search, enable/disable, edit expiry and export history. Double-spend is prevented by transactional balance locking.

### 04 — Orders

- Backend: `OrderController` admin list/detail/status/export/document endpoints.
- Frontend: `AdminOrders.jsx`.
- Controlled state transitions prevent arbitrary backwards changes. Tracking is collected when marking shipped. “Refunded” is still an operational state; it does not itself call a payment-provider refund API.
- Confirmation email policy: COD at successful order creation; card after verified successful payment; admin status transitions do not resend confirmation email.

### 05/06 — Promotions and free gifts

- Backend: `PromotionsController.cs`, transactional integration in `OrderController.cs`.
- Frontend: `AdminPromotions.jsx` and free-gift checkout selector.
- Previously used campaigns are archived/deactivated instead of destroying history. Eligibility and value are never trusted from the client.
- Promotion stacking follows the existing calculation order; no unapproved exclusivity rule was invented.

### 07 — Customers/newsletter

- Backend: `MarketingController.cs`.
- Frontend: `AdminAudience.jsx`.
- Server pagination/search avoids downloading all customer data. Subscriber consent source/date and unsubscribe state are retained. Customers are not automatically subscribed.

### 08 — Homepage cards

- Backend: `HomepageCardsController.cs`.
- Frontend: `AdminHomepageSections.jsx`, `ChooseYourGoal.jsx`, `WhatSportsAreYouInterestedIn.jsx`.
- Destination URLs accept internal paths or HTTPS URLs on `proteini.mk` only.

### 09 — Tips

- Backend: `TipArticlesController.cs` with `HtmlSanitizer`.
- Frontend: `AdminTips.jsx`, `Tips.jsx`, `TipArticle.jsx`, `/tips/:slug`.
- Slugs and SEO metadata are persisted; formatted HTML is sanitized before storage.

### 10 — Operational documents

- Database: immutable/versioned `OrderDocuments` records with a SHA-256 content hash.
- Backend: idempotent generation and `GET /api/Order/Admin/{id}/document`.
- Output is downloadable HTML and explicitly says it is not a fiscal or tax invoice. Fiscal invoicing remains excluded without accounting requirements/integration.

### 11 — Taxonomy

- Backend: `AdminTaxonomyController.cs`, `CategorySlugHistory`.
- Frontend: existing admin/category flows plus historical-slug resolution in `ProductsPage.jsx`.
- Existing product assignments and filters are preserved; unsafe deletes and hierarchy cycles are rejected.

### 12 — Automations

No abandoned-cart scheduler, Viber integration, replenishment worker, campaign scheduler or retry queue will be added. Transactional order confirmation and password-reset emails remain part of normal application behavior.

## Verification status

- Backend main project: builds successfully.
- Backend search tests: 9/9 pass.
- Frontend production build: passes and preserves 375 sitemap URLs.
- Frontend calculation tests: see `QA_REPORT.md`.
- No production database, payment, email, order status, deployment or Git push was performed.
- Required before release: apply/rehearse the additive migration on staging and execute synthetic DB/payment/browser/concurrency tests.
