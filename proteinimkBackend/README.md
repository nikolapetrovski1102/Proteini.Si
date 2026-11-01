# Proteini.mk backend

ASP.NET Core 8 API for the Proteini.mk storefront and administration interface, using SQL Server and Dapper. This handover contains the current local backend source, including changes made after the original repository's last commit, tests, SQL scripts, documentation and locally available static assets.

## Repository contents

- `ProteinisiBackend/`: controllers, models, services, Razor views and `wwwroot` assets.
- `ProteinisiBackend.Tests/`: automated search normalization, synonym and password-hash configuration tests.
- `scripts/`: incremental SQL changes, data inspection/correction scripts and email diagnostic helpers.
- [HANDOVER.md](HANDOVER.md): transfer scope, configuration requirements and outstanding items.
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md): deployment, backup, verification and rollback procedure.
- [ADMIN_FEATURE_GUIDE.md](ADMIN_FEATURE_GUIDE.md), [FEATURE_AUDIT.md](FEATURE_AUDIT.md), [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md), [QA_REPORT.md](QA_REPORT.md): feature documentation and historical QA evidence dated 2026-10-14.

## Local setup

Install the .NET 8 SDK and provide access to a SQL Server database restored from the existing installation. The SQL files are incremental changes, **not a complete initial database schema**; see [scripts/README.md](scripts/README.md).

```bash
git clone https://github.com/alisalihi/proteinimkBackend.git
cd proteinimkBackend
cp ProteinisiBackend/appsettings.Development.example.json ProteinisiBackend/appsettings.Development.json
```

Edit `ProteinisiBackend/appsettings.Development.json` with your local database connection, password key and a randomly generated JWT signing key of at least 32 bytes. Use isolated development credentials. Existing user password hashes require the **existing** `AppSettings:PasswordKey`; obtain it securely from the current operator when working with a restored database. A different key prevents existing passwords from validating.

```bash
dotnet restore ProteinisiBackend.sln
dotnet build ProteinisiBackend.sln -c Release --no-restore
dotnet test ProteinisiBackend.Tests/ProteinisiBackend.Tests.csproj -c Release --no-restore
dotnet run --project ProteinisiBackend/ProteinisiBackend.csproj --launch-profile http
```

The API listens on `http://localhost:6800` because `Program.cs` explicitly configures Kestrel on that port. `/` is a basic process check; it does not verify database connectivity. Swagger is available at `http://localhost:6800/swagger` in Development. The launch profile's `applicationUrl` does not override the explicit Kestrel listener.

Development permits localhost and 127.0.0.1 frontend origins. Configure `Cors:AllowedOrigins` for deployed frontend origins. Configure `AppSettings:FrontendUrl` and `AppSettings:BackendUrl` for redirects and CPay return URLs.

## Configuration

The committed `appsettings.json` contains empty credentials and non-secret defaults. Supply private settings through the ignored environment-specific JSON files or environment variables. ASP.NET Core environment variables use double underscores, for example `ConnectionStrings__DefaultConnection`, `AppSettings__PasswordKey`, `AppSettings__TokenKey`, `CPayConfiguration__SecretKey` and `MailSettings__sender_password`. The application does not load `.env` files automatically.

Configure SMTP and merchant settings before testing email or payment flows. `CPayConfiguration:TestMode` defaults to `true` in this handover. Confirm provider sandbox behavior and return URLs before any payment testing; the application's test flag is not proof of an isolated provider environment. Diagnostic helper scripts can send email or trigger order confirmations and must be used deliberately against synthetic staging data.

For production, set the environment to Production and provide protected configuration, including production frontend/backend URLs and the intended payment mode. `PasswordKey` and `TokenKey` must be set before use. Preserve the existing password key for existing accounts; coordinate JWT key changes because they invalidate sessions.

## Publish

```bash
dotnet publish ProteinisiBackend/ProteinisiBackend.csproj -c Release -o ./release/backend
```

Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for backup, migration, reverse proxy, service and rollback steps. Build output, production configuration, database backups, and credentials are excluded from Git. The database and current production media must be transferred separately by the current operator.
