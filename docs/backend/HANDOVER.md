# Backend handover — 2026-10-29

## Source and scope

Prepared from the local `proteinisi_backend` working directory, including its current tracked edits and untracked application features. The original source repository is `Argent0812/proteinisi_backend`; its last local commit was `2285665` (2026-08-24). The handover is a new source snapshot, so the original Git history and its historical credentials are not imported.

Included: the .NET solution, application source, test project, all nine available SQL scripts, all seven shell helpers, the five existing feature/deployment/QA documents, bundled third-party web assets and licenses, and locally available catalogue/CMS images and invoice logo. The React frontend and the separate legacy Laravel directory are outside this backend repository.

Excluded: original Git metadata, IDE files, generated `bin`/`obj`/`publish` folders, logs, private environment configuration and unrelated workspace documents. The original working directory is preserved.

## Configuration changes made for handover

- Replaced the credential-bearing `appsettings.json` with empty secret values and documented defaults, and added an ignored local-development configuration workflow.
- Replaced the hard-coded password hashing key in `UserController.GetPasswordHash` with `AppSettings:PasswordKey`. The hashing algorithm is unchanged. **Supply the exact existing password key to retain login compatibility with existing user records.**
- Defaulted CPay test mode to true and documented the need to verify provider sandbox configuration.
- Added ignore rules for generated files, environment-specific settings, logs, certificates and database backups.

Credentials are not part of this repository. Share database, SMTP, merchant, JWT, password-hashing and diagnostic settings through an approved private channel. Rotate credentials exposed in older source history with the operator; password-hashing key changes require an account/password migration plan.

## Separate operational transfer still required

1. A verified SQL Server backup or approved full schema/data export. No complete base schema or database backup was present in the supplied backend. The application uses existing `dbo` tables and incremental scripts; running the scripts against an empty database is insufficient.
2. Current production `wwwroot` media, reconciled with the database. Included images represent this local source snapshot and are not certified as a complete production upload backup.
3. Protected production configuration and service/reverse-proxy configuration. The deployment checklist records a historical layout; confirm it with the current operator.
4. Hosting, DNS, payment provider, SMTP and database access/ownership transfer as applicable.
5. A staging rehearsal of the migrations, authentication, checkout, payment callbacks and email delivery. The historical QA report does not certify these external integrations.

See [scripts/README.md](scripts/README.md) for incremental migration ordering and scripts that must not be run as routine schema setup. No production server, database, payment or email operation is performed by preparing this repository.

## Handover validation — 2026-10-29

- Restored the solution dependencies using .NET SDK 8.0.413.
- Release solution build passed with 0 errors and 252 existing compiler/analyzer warnings.
- Release tests passed: 13 total, 0 failed, 0 skipped. These include the nine existing search cases and four new password-key cases verifying legacy hash compatibility with a synthetic key and rejection of missing/blank configuration.
- All selected source, script and asset files were accounted for against the original working directory. Existing application files differ only in the sanitized configuration and the password-key configuration change described above.
- Checked the handover files for the original configured secrets and common token/private-key patterns; no matches remained. The only credential-shaped values in the example file are explicit replacement placeholders.
- Validated configuration JSON, all seven shell helpers' syntax, documentation links and Git ignore rules for private configuration/build output.
- Database, provider callbacks, SMTP and production-media completeness remain subject to the separate operational transfer and staging checks above.
