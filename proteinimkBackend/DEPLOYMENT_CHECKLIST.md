# Proteini.mk Deployment Checklist

This is a staged deployment runbook, not authorization to deploy. The 2026-10-14 audit did **not** deploy or alter production.

Known current production layout from prior operator evidence:

- Frontend root: `/var/www/proteini-frontend`
- Backend root: `/var/www/app`
- Backend service: `webapp.service`
- Backend listener: port 6800 behind Nginx
- Database: local Microsoft SQL Server, database `proteinimkdb`

Verify these values on the server before using them; do not rely on this document if infrastructure has changed.

## 1. Release approval gate

- [ ] Product owner confirms the current configurable flat-fee shipping rule; historical weight/VAT rules remain inactive.
- [ ] Feature 12 campaign/background automations are recorded as out of scope.
- [ ] QA owner reviews the 168 frontend lint failures and records an explicit waiver or fixes them.
- [ ] Staging API/DB/browser tests pass.
- [ ] CPay sandbox repeated-callback test passes.
- [ ] No real customer messages or live transactions are used during QA.
- [ ] Exact frontend/backend commit or archive hashes are recorded.
- [ ] Deployment and rollback owners are identified.

## 2. Configuration and secrets

Store production values in a protected server-side configuration source or environment variables, not Git. Verify presence without printing values:

- `ConnectionStrings:DefaultConnection`
- `AppSettings:PasswordKey`
- `AppSettings:TokenKey`
- `CPayConfiguration:PayToMerchant`
- `CPayConfiguration:MerchantName`
- `CPayConfiguration:SecretKey`
- `CPayConfiguration:Currency`
- `CPayConfiguration:Language`
- `CPayConfiguration:SuccessUrl`
- `CPayConfiguration:FailureUrl`
- `MailSettings:sender_email`
- `MailSettings:sender_username`
- `MailSettings:sender_password`
- `MailSettings:host`
- `MailSettings:SMTPPort`
- `MailSettings:EnableSsl`
- `MailSettings:sender_name`
- `MailSettings:OrderNotificationEmail`
- intended seller/copy recipients
- `Cors:AllowedOrigins` containing `https://proteini.mk` and `https://www.proteini.mk`

Security checks:

- [ ] No secret appears in the frontend bundle.
- [ ] Production appsettings is owned/readable only by the service account as required.
- [ ] Any credential ever committed to Git is rotated.
- [ ] JWT key rotation/logout impact is planned.
- [ ] Mail diagnostic key/endpoint access is reviewed.

## 3. Build locally or in CI

Frontend:

```bash
cd /path/to/proteinisi_frontend
npm ci
node --test tests/*.test.js
npm audit --omit=dev
npm run lint -- --quiet
npm run build
```

Do not proceed silently if lint fails. If an approved temporary waiver exists, attach the lint output to the release record.

Backend:

```bash
cd /path/to/proteinisi_backend
dotnet restore ProteinisiBackend.sln
dotnet build ProteinisiBackend.sln -c Release --no-restore
dotnet test ProteinisiBackend.Tests/ProteinisiBackend.Tests.csproj -c Release --no-restore
dotnet list ProteinisiBackend.sln package --vulnerable --include-transitive
dotnet publish ProteinisiBackend/ProteinisiBackend.csproj -c Release -o ./release/backend
```

Record checksums of the frontend archive and backend release directory/archive.

## 4. Database backup and migration rehearsal

Before production, restore a recent backup into staging and run scripts there first. Validate row counts, foreign keys, expected columns and application behavior.

Existing migration order for an installation that does not yet contain these features:

1. `scripts/add-promotions-free-gifts-short-expiry-20260924.sql`
2. `scripts/add-upcoming-promotion-flag-20260924.sql`
3. `scripts/add-gift-vouchers-product-translations-20260926.sql`
4. `scripts/add-product-sale-pricing-20261002.sql`
5. `scripts/complete-ecommerce-features-20261014.sql`

The final script is additive/idempotent and must be applied before activating the new backend. Rehearse it twice on staging and verify existing rows. Earlier scripts may already be applied in production; inspect their schema first.

Production backup requirements:

- [ ] Create a timestamped SQL Server `COPY_ONLY` backup with checksum.
- [ ] Run `RESTORE VERIFYONLY ... WITH CHECKSUM`.
- [ ] Record backup path, size, UTC time and operator.
- [ ] Ensure the backup is not overwritten by the deployment.
- [ ] Export/record current app configuration without exposing it in tickets or logs.

## 5. Server-side file backups

Use explicit paths and timestamped backup directories. Verify available disk space first.

- [ ] Copy `/var/www/app` to a timestamped backend backup.
- [ ] Copy `/var/www/proteini-frontend` to a timestamped frontend backup.
- [ ] Confirm each backup contains its expected entry file (`ProteinisiBackend.dll` / `index.html`).
- [ ] Never back up `/home/deploy` into itself and never use an unverified recursive target.

## 6. Deploy backend

Preferred sequence:

1. Upload to a new staging directory under `/home/deploy`.
2. Verify archive checksum and inspect contents.
3. Preserve the production-only appsettings/secrets source.
4. Stop `webapp.service` for the shortest possible maintenance window.
5. Replace application binaries atomically or copy from a verified clean release directory.
6. Restore correct ownership/permissions.
7. Start `webapp.service`.
8. Check `systemctl status webapp.service` and recent journal entries.
9. Verify port 6800 is listening and local health/public API returns expected status.

Do not copy development appsettings over production secrets. Do not deploy old nested `publish/publish` artifacts.

## 7. Deploy frontend

1. Upload the archive built from `dist`, not the source tree.
2. Extract to a new staging directory.
3. Confirm `index.html`, hashed JS/CSS assets, icons, `robots.txt` and the full sitemap are present.
4. Compare staged and intended asset names.
5. Replace/copy into `/var/www/proteini-frontend` only after backup verification.
6. Set ownership appropriate for Nginx (`www-data` in the known layout).
7. Run `sudo nginx -t`; reload only after success.

## 8. Post-deployment smoke tests

Public/read-only:

- [ ] `/` returns 200 and loads correct hashed assets.
- [ ] `/api/admin/Products/GetAllProducts` returns 200 as an intentionally public catalogue read.
- [ ] Product list/detail, category navigation, multilingual search and filters work.
- [ ] `robots.txt`, favicon, manifest and sitemap load; sitemap contains catalogue URLs.
- [ ] Browser console has no new fatal errors.

Authorization:

- [ ] Anonymous writes to products, taxonomy, promotions, orders admin, marketing and CMS return 401/403.
- [ ] Ordinary customer JWT cannot access those endpoints.
- [ ] Superadmin can load every admin module and perform a reversible synthetic edit on staging.

Commerce on staging/sandbox:

- [ ] Card order below 3,000 uses 165 MKD delivery.
- [ ] COD order below 3,000 adds 30 MKD.
- [ ] Order at 3,000 has free delivery/COD.
- [ ] Product/variant stock, promo usage and free gift are recorded once.
- [ ] Repeated payment callback does not duplicate points or email.
- [ ] Invalid/expired/exhausted promotion is rejected.
- [ ] Out-of-stock variant/gift is rejected.
- [ ] Admin order detail/export contains correct variant, fees, promo and gift.
- [ ] Customer and intended internal recipients receive only the expected confirmation messages.
- [ ] Admin status changes do not resend order confirmation.
- [ ] Shipping settings update changes both checkout display and backend total consistently.
- [ ] Paid voucher-product order issues unique code(s); unpaid order does not.
- [ ] Voucher partial redemption, remaining balance, expiry/disable, failed-payment release and two-request race are correct.
- [ ] Operational order document downloads once without duplicate records and clearly says it is non-fiscal.
- [ ] Tips detail/localization/SEO/sanitized formatting and historical category redirects work.

## 9. Monitoring immediately after release

- [ ] Watch service journal and Nginx error log for 5xx/auth/CORS errors.
- [ ] Monitor order creation/payment completion counts without logging personal data.
- [ ] Check SMTP failures and duplicated confirmation reports.
- [ ] Confirm stock and promotion usage on synthetic orders.
- [ ] Retain backups until the agreed observation period ends.

## 10. Rollback

Application rollback:

1. Stop `webapp.service` if the backend is faulty.
2. Restore the exact previous `/var/www/app` backup and production configuration.
3. Restore the previous frontend directory.
4. Restore ownership/permissions.
5. Start the service, run `nginx -t`, reload Nginx and repeat smoke tests.

Database rollback:

- Prefer forward repair for additive migrations.
- Restore the verified SQL backup only when data-impact analysis and explicit approval confirm it is necessary; restoring rewinds all orders/customers created after the backup.
- Never drop new columns/tables blindly when they may contain live data.

## 11. Release record

Record:

- Frontend/backend commit IDs and archive checksums.
- Database backup path and verification result.
- Applied migration names/results.
- Deployment start/end UTC time and operator.
- Service/Nginx validation output.
- Smoke-test evidence.
- Any waiver, incident or rollback decision.
