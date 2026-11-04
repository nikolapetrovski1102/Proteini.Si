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

Script 0006 adds `ProductVariants.Option_Type`, marks existing shaker variants as colors and adds the allowed-value constraint. It is required for the current variant code and is newer than the existing 2026-10-14 deployment checklist.

## Stored procedures

The API runs no inline SQL. Every query goes through a stored procedure in `procedures/<area>/`, one `CREATE OR ALTER PROCEDURE` per file. After migrations 0009 and 0010 have run, deploy every file in `procedures/` before starting a new API build, for example:

```sh
for f in database/procedures/*/*.sql; do sqlcmd -S <server> -d proteinimkdb -b -I -i "$f" || break; done
```

The scripts are idempotent and safe to re-run. Deploy them again whenever a procedure file changes.

## Other SQL scripts

| Script | Purpose |
| --- | --- |
| `reports/report-missing-product-grams-20261013.sql` | Read-only catalogue inspection. |
| `one-off/correct-historical-variant-order-prices-20260915.sql` | One-off historical order correction; changes order values and creates backup tables. Review separately; do not run as a routine migration. |
| `one-off/create-test-coupon-20260924.sql` | Creates or updates an active `TEST20` coupon. Use only for deliberate staging tests; not routine production setup. |

## Email helpers

The seven `.sh` helpers in `backend/tools` call administrator diagnostic endpoints for email configuration, order inspection, SMTP samples and order confirmations. They accept a base URL and admin JWT; some endpoints also require the configured diagnostic key. Review the controller's current authorization requirements and each helper's usage before running. Sending helpers send actual email and should target synthetic staging orders and test inboxes. No helper is run automatically during setup.
