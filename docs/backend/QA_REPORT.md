# Proteini.mk QA Report

Date: 2026-10-14  
Environment: local source workspace; no production mutations/messages/payments/deployment

## Result

Features 01–11 are implemented and the available local unit/build checks pass. Release status is **implemented, pending staging certification** because the new migration has not been exercised against a restored production-like database and external CPay/SMTP behavior was not tested.

## Executed checks

| Check | Result |
|---|---|
| Backend main project build | PASS; no compile errors (legacy nullable warnings remain). |
| Backend search test project | PASS: 9/9 tests. |
| Frontend `node --test tests/*.test.js` | PASS after final run; delivery configuration and sale-date regressions covered. |
| Frontend `npm run build` | PASS; 375 sitemap URLs preserved. |
| Production npm dependency audit | PASS previously: 0 production vulnerabilities. |
| NuGet vulnerability audit | PASS previously after patched package pin. |
| Frontend lint | Known legacy debt; repository-wide lint is not yet a clean release gate. |

## Verified code paths

- Superadmin policy on administration endpoints and intentional anonymous public endpoints.
- Server-side order price/delivery/promotion/voucher/gift calculations.
- Atomic stock changes, promotion usage recheck and voucher-balance locking.
- Paid-only idempotent gift-voucher issuance and reservation release on failed/cancelled/rejected orders.
- Idempotent payment completion and loyalty award.
- COD confirmation at order creation; card confirmation at verified payment; silent admin transitions.
- Controlled order status graph, shipment tracking fields and safe CSV export.
- Versioned/idempotent operational order document generation.
- Newsletter consent/unsubscribe state and server pagination.
- Sanitized Tips HTML and image validation.
- Category cycle prevention and historical-slug redirect flow.
- Secure homepage-card destination validation.

## Automated cases

Backend tests cover representative multilingual synonyms, Cyrillic/Latin transliteration, Albanian diacritic normalization, typo correction and singular variants.

Frontend tests cover default card/COD/free-delivery boundaries, administrator-configured fee/threshold values and sale-date behavior.

## Required staging tests

1. Restore a current database backup to staging and apply `complete-ecommerce-features-20261014.sql` twice to prove idempotency.
2. Verify all new tables, columns, foreign keys, constraints and existing row preservation.
3. Run authenticated/ordinary/anonymous permission tests for every admin/public endpoint.
4. Create synthetic COD and CPay-sandbox orders, including zero-balance voucher payment and repeated callbacks.
5. Race two synthetic requests against the final voucher balance, promotion usage limit, product stock and free-gift stock.
6. Verify voucher purchase codes issue only after payment, partial balance remains accurate, failed payment releases reservations, and expired/disabled codes fail.
7. Verify order confirmation inbox behavior and that admin status transitions send no duplicate confirmation.
8. Verify order CSV, voucher CSV and operational-document download using multilingual/long values.
9. Browser-test checkout, order admin, audience, homepage cards, Tips and category redirects at desktop/mobile widths.
10. Confirm CPay refund semantics separately; the current Refunded order status is operational and does not call a provider refund API.

## Known limitations/risks

- Historical weight-bracket/VAT/over-30kg delivery rules were not activated because current later instructions use configurable flat fees and no replacement commercial rules were approved.
- No legal/fiscal invoice was implemented; generated files are explicitly operational documents.
- Feature 12 campaign/background automations are out of scope.
- The main frontend bundle remains large and should later be code-split.
- Repository-wide legacy lint/nullability cleanup remains technical debt.
- JWT local-storage design increases XSS impact; changing authentication storage requires a separate coordinated migration.
- External payment, SMTP delivery and production-scale SQL performance cannot be certified from local source tests.

## Release gate

Do not label the release production-certified until the migration rehearsal and staging tests above pass. No production action was performed by this audit.
