# Database and diagnostic scripts

These scripts target Microsoft SQL Server and assume the existing Proteini.mk base schema and data. Obtain and restore a verified database backup before using them. There is no complete fresh-database bootstrap script in this source snapshot.

## Incremental schema changes

Inspect the restored database and each script before applying changes; some or all changes may already be present. Rehearse against staging first and keep a verified backup.

For an existing base schema missing these features, the documented order is:

1. `add-promotions-free-gifts-short-expiry-20260924.sql`
2. `add-upcoming-promotion-flag-20260924.sql`
3. `add-gift-vouchers-product-translations-20260926.sql`
4. `add-product-sale-pricing-20261002.sql`
5. `complete-ecommerce-features-20261014.sql`
6. `add-variant-option-type-20261016.sql`

The last script adds `ProductVariants.Option_Type`, marks existing shaker variants as colors and adds the allowed-value constraint. It is required for the current variant code and is newer than the existing 2026-10-14 deployment checklist.

## Other SQL scripts

| Script | Purpose |
| --- | --- |
| `report-missing-product-grams-20261013.sql` | Read-only catalogue inspection. |
| `correct-historical-variant-order-prices-20260915.sql` | One-off historical order correction; changes order values and creates backup tables. Review separately; do not run as a routine migration. |
| `create-test-coupon-20260924.sql` | Creates or updates an active `TEST20` coupon. Use only for deliberate staging tests; not routine production setup. |

## Email helpers

The seven `.sh` helpers call administrator diagnostic endpoints for email configuration, order inspection, SMTP samples and order confirmations. They accept a base URL and admin JWT; some endpoints also require the configured diagnostic key. Review the controller's current authorization requirements and each helper's usage before running. Sending helpers send actual email and should target synthetic staging orders and test inboxes. No helper is run automatically during setup.
