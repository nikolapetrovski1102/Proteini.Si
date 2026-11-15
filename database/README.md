# Database scripts

These scripts target Microsoft SQL Server and assume the existing Proteini.mk base schema and data. Obtain and restore a verified database backup before using them. There is no complete fresh-database bootstrap script in this source snapshot.

## Incremental schema changes

Inspect the restored database and each script before applying changes; some or all changes may already be present. Rehearse against staging first and keep a verified backup.

For an existing base schema missing these features, the documented order is:

1. `migrations/0001_add-promotions-free-gifts-short-expiry.sql`
2. `migrations/0002_add-upcoming-promotion-flag.sql`
3. `migrations/0003_add-gift-vouchers-product-translations.sql`
4. `migrations/0004_add-product-sale-pricing.sql`
5. `migrations/0005_complete-ecommerce-features.sql`
6. `migrations/0006_add-variant-option-type.sql`
7. `migrations/0007_create-branch-locations.sql`
8. `migrations/0008_create-homepage-cards.sql`
9. `migrations/0009_create-procedure-table-types.sql` (table types used by the stored procedures; run before deploying `procedures/`)
10. `migrations/0010_create-newsletter-subscribers.sql`
11. `migrations/0011_add-user-email-verification.sql` (email confirmation code columns; marks existing accounts as confirmed)
12. `migrations/0012_create-user-logins.sql` (`UserLogin` table: Google/Facebook identities linked to accounts, used by `usp_User_SignInExternal`)
13. `migrations/0013_create-site-events-daily-report.sql` (`User.User_CreatedAt`, `SiteEvents` for storefront visits/cart/checkout events, `DailyReportRuns` so the daily report is sent once per day; used by `procedures/Reports/`)
14. `migrations/0014_create-marketing-automation.sql` (`MarketingContacts` consent per email, `MarketingEmailTemplates` with the three Macedonian automatic emails (all switched off), `MarketingEmailLog`, `MarketingRuns`; used by `procedures/Marketing/`)
15. `migrations/0015_create-countries-cities-postcodes.sql` (countries with phone dial codes and shipping, Macedonian delivery cities and post codes)
16. `migrations/0016_create-affiliates-short-links.sql` (`Affiliates`, `PromoCodes.AffiliateId`, `ShortLinks` for `/r/<slug>` links, `ShortLinkClicksDaily`, view `vw_AffiliateSales` for commission; used by `procedures/Affiliates/` and `procedures/ShortLinks/`)
17. `migrations/0017_add-courier-cod-commission.sql` (`ShippingSettings` courier cash-on-delivery commission: threshold, fixed fee, percentage; shown as a note on cash-on-delivery orders)
18. `migrations/0018_add-email-languages.sql` (`Orders.Language`, `User.User_Language` and Albanian `*_Al` copy on `MarketingEmailTemplates`, so customer emails go out in Macedonian or Albanian)
(0019 is unused: the custom marketing emails it added were withdrawn before release.)
20. `migrations/0020_add-promo-code-scope.sql` (`PromoCodes.AppliesTo` and `PromoCodeTargets`: promo and affiliate codes limited to specific products or categories, subcategories included; deploy `Promotions/usp_PromoCode_SetTargets.sql` before the procedures that call it)
25. `migrations/0025_add-category-pairings.sql` (`CategoryPairings`: categories that go together, seeded with Creatine <-> Pre-Workout; used by `Products/usp_Product_GetRelated.sql` and `Products/usp_Product_GetForCustomer.sql`)
26. `migrations/0026_create-discounts.sql` (`Discounts`, `DiscountTargets` and the `DiscountApplied*` bookkeeping for automatic discounts with no code on products, brands or categories; deploy `Discounts/fn_Discount_Products.sql` before the `usp_Discount_*` procedures. `usp_Discount_Sync` writes running discounts into the existing sale fields and puts the previous values back; the API runs it after every admin change and every 10 minutes)
29. `migrations/0029_pair-proteins-creatine-pre-workout.sql` (adds Proteins <-> Creatine and Proteins <-> Pre-Workout to `CategoryPairings`, so a protein page recommends creatine and pre-workouts)

Script 0006 adds `ProductVariants.Option_Type`, marks existing shaker variants as colors and adds the allowed-value constraint. It is required for the current variant code and is newer than the existing 2026-10-14 deployment checklist.

## Stored procedures

The API runs no inline SQL. Every query goes through a stored procedure in `procedures/<area>/`, one `CREATE OR ALTER PROCEDURE` per file. After migrations 0009 to 0020 have run, deploy every file in `procedures/` before starting a new API build, for example:

```sh
for f in database/procedures/*/*.sql; do sqlcmd -S <server> -d proteinimkdb -b -I -i "$f" || break; done
```

The scripts are idempotent and safe to re-run. Deploy them again whenever a procedure file changes.

## Other SQL scripts

| Script | Purpose |
| --- | --- |
| `reports/report-missing-product-grams-20261013.sql` | Read-only catalogue inspection. |
| `one-off/correct-historical-variant-order-prices-20260915.sql` | One-off historical order correction; changes order values and creates backup tables. Review separately; do not run as a routine migration. |
| `one-off/backfill-loyalty-points-20261111.sql` | One-off: gives loyalty points to accepted orders that never earned them (cash on delivery and admin-confirmed orders before `usp_LoyaltyPoints_SyncOrder`). Dry run by default; logs changes to `dbo.LoyaltyBackfill_20261111` with an undo block. Deploy the procedures first. |
| `one-off/create-test-coupon-20260924.sql` | Creates or updates an active `TEST20` coupon. Use only for deliberate staging tests; not routine production setup. |

## Email helpers

The seven `.sh` helpers in `backend/tools` call administrator diagnostic endpoints for email configuration, order inspection, SMTP samples and order confirmations. They accept a base URL and admin JWT; some endpoints also require the configured diagnostic key. Review the controller's current authorization requirements and each helper's usage before running. Sending helpers send actual email and should target synthetic staging orders and test inboxes. No helper is run automatically during setup.
