# Backend refactor plan — Proteini Si

_Last updated: 2026-11-01 · Owner: Nikola Petrovski_

This is the working plan for the next phase of the backend. It turns the findings from the
backend review and offer (`ponuda/ponuda-backend-proteini-si.html`, П-2026-031) into concrete
engineering steps, in the order they should be done.

| Phase | Goal | Depends on |
|---|---|---|
| 0 | One repository, clear folder names, schema under source control | — |
| 1 | Layered architecture: Controller → Service → Provider → SqlHelper | 0 |
| 2 | Remove SQL injection: every query becomes a stored procedure call | 1 |
| 3 | Structured logging with a log preview | 1 (can run in parallel with 2) |
| 4 | Primary keys, foreign keys, indexes and constraints | 0 (data clean-up before 2 is finished) |

Each phase ships on its own branch, is reviewed, and is tested on staging before it is merged.

---

## Current state (measured on 2026-11-01)

| Area | Finding |
|---|---|
| Size | 13.8k lines in controllers/services. `OrderController.cs` 3,206 lines, `ProductsController.cs` 1,659, `ProductVariantController.cs` 1,074, `UserController.cs` 959. |
| Data access | `Database/DataContextDapper.cs` — synchronous Dapper calls, new `SqlConnection` per call that is **never disposed**, raw SQL strings built in controllers. 0 stored procedure calls. |
| Dynamic SQL | Interpolated (`$"..."`) strings: `OrderController` 102, `ProductsController` 45, `LoyaltyService` 16, `ProductVariantController` 13, `ProductFilterService` 12, plus 9 more files with 5–10 each. Most use parameters for values, but the pattern is unsafe by default. |
| Confirmed injection | `ProductsController.cs:317` — `query += $" ORDER BY {orderByColumn} {searchDto.SortOrder}"`. `SortOrder` comes straight from the anonymous `POST /Products/Search` request body. |
| Dependency injection | Only `CPayService`, `RelatedProductService`, `ILoyaltyService` are registered. Controllers create/own the data context and hold business logic. |
| Logging | `ErrorLogger.ErrorLog` is a **no-op** (body commented out), so DB errors are not recorded anywhere. `Tools.ErrorLog` writes to a hard-coded Windows path `C:/LOG_VALONSIGNAL`. `Console.WriteLine` prints full SQL and email recipients (personal data). 113 local `try/catch` blocks in controllers. |
| Database | No base schema in source control (only incremental scripts in `scripts/`). Missing PK/FK/unique/check rules are reported by `scripts/report-schema-integrity-20261031.sql`. |
| Secrets | Local `appsettings.json` contains a real `TokenKey`. It must not be committed — see Phase 0. |

---

## Phase 0 — Repository and folder names

All work moves to **https://github.com/nikolapetrovski1102/Proteini.Si** as a single repository
(monorepo). The old repos (`alisalihi/proteinimkBackend`, `alisalihi/proteinimkFrontend`) each hold one
snapshot commit, so no meaningful history is lost by starting fresh.

### Target layout

```
Proteini.Si/
├── backend/
│   ├── ProteiniSi.sln
│   ├── src/
│   │   └── ProteiniSi.Api/            (was ProteinisiBackend/)
│   ├── tests/
│   │   └── ProteiniSi.Api.Tests/      (was ProteinisiBackend.Tests/)
│   └── tools/                         (was scripts/*.sh — email/ops helpers)
├── database/
│   ├── schema/                        (generated base schema: tables, types)
│   ├── procedures/                    (one file per stored procedure)
│   ├── migrations/                    (was scripts/*.sql, numbered: 0001_..., 0002_...)
│   └── reports/                       (read-only diagnostics, e.g. schema integrity)
├── frontend/                          (was proteinimkFrontend/)
├── docs/
│   ├── backend/                       (this plan, handover, QA, deployment docs)
│   ├── frontend/
│   └── proposal/                      (was ponuda/)
└── README.md
```

### Steps

1. **Secrets first.** Revert or blank `TokenKey` in `backend/src/ProteiniSi.Api/appsettings.json`
   and move it to the ignored `appsettings.Development.json`. Rotate the key afterwards, as it has been
   stored in plain text. Run a secret scan (e.g. `gitleaks detect --no-git`) before the first push.
2. Remove the nested `.git` folders from `proteinimkBackend/` and `proteinimkFrontend/` (after the
   uncommitted changes listed by `git status` in each are reviewed — they come along as files).
3. Move folders as in the layout above with `git mv` once the root repo tracks them.
4. Rename the .NET project: `ProteinisiBackend` → `ProteiniSi.Api`
   - rename `.csproj`, `.sln` entries and `RootNamespace`;
   - replace `namespace ProteinisiBackend` / `using ProteinisiBackend` across the code;
   - update the test project reference;
   - `dotnet build` and `dotnet test` must pass (baseline: 13 tests, 0 failures).
5. Merge the two `.gitignore` files into a root one (keep `**/appsettings.*.json` ignored,
   `!**/appsettings.*.example.json` allowed, `.env.*` ignored, `!.env.example` allowed, `.DS_Store`).
6. Export the current production schema (SSMS → Generate Scripts, schema only) into
   `database/schema/`. Without it, nothing in Phase 2/4 can be tested on a clean database.
7. Update deployment paths in `docs/backend/DEPLOYMENT_CHECKLIST.md`.
8. First commit to `main`, then all further work on feature branches (`refactor/architecture`,
   `refactor/products-procs`, ...).

---

## Phase 1 — Layered architecture

### Request flow

```
HTTP ─► Controller ─► IXxxService ─► IXxxProvider ─► ISqlHelper ─► SQL Server (stored procedure)
            │              │
            │              └── static Helpers (pure functions: pricing, formatting, CSV ...)
            └── DTO validation, auth attributes, IActionResult mapping only
```

### Folder structure inside `ProteiniSi.Api`

```
ProteiniSi.Api/
├── Controllers/                  thin, no SQL, no business rules
├── Services/
│   ├── Interfaces/               IProductService, IOrderService, ICartService ...
│   └── Implementation/           ProductService, OrderService, CartService ...
├── Providers/
│   ├── Interfaces/               IProductProvider, IOrderProvider ...
│   └── Implementation/           ProductProvider, OrderProvider ...
├── Data/
│   ├── ISqlHelper.cs
│   ├── SqlHelper.cs              the only class that opens connections
│   └── StoredProcedures.cs       procedure name constants
├── Helpers/                      static, stateless helpers
├── Models/
│   ├── Entities/                 rows returned from procedures
│   └── Dtos/                     request/response contracts
├── Middleware/                   exception handling, request logging, correlation id
└── Program.cs
```

### Responsibilities

| Layer | Does | Never does |
|---|---|---|
| Controller | Bind/validate DTO, `[Authorize]`, call one service method, map result to HTTP status | SQL, loops over business data, `try/catch` (middleware handles it) |
| Service | Business rules: prices, stock, vouchers, promotions, loyalty, emails, orchestration of several providers, transactions | Build SQL, know procedure names |
| Provider | One method per stored procedure; maps parameters → procedure → typed result | Business decisions, calling other providers |
| SqlHelper | Connection, command type, timeouts, transactions, logging of DB calls | Know about entities or rules |
| Helpers | Pure repeated logic (input → output) | Access DB, DI, HTTP, state |

### `ISqlHelper` — centralized execution of procedures

```csharp
public interface ISqlHelper
{
    Task<IReadOnlyList<T>> QueryAsync<T>(string procedure, object? parameters = null, CancellationToken ct = default);
    Task<T?> QuerySingleOrDefaultAsync<T>(string procedure, object? parameters = null, CancellationToken ct = default);
    Task<int> ExecuteAsync(string procedure, object? parameters = null, CancellationToken ct = default);
    Task<T?> ExecuteScalarAsync<T>(string procedure, object? parameters = null, CancellationToken ct = default);
    Task<TResult> QueryMultipleAsync<TResult>(string procedure, object? parameters, Func<SqlMapper.GridReader, Task<TResult>> read, CancellationToken ct = default);
    Task<TResult> InTransactionAsync<TResult>(Func<IDbConnection, IDbTransaction, Task<TResult>> work, CancellationToken ct = default);
}
```

Rules for the implementation:

- Every call uses `commandType: CommandType.StoredProcedure`. There is **no** method that accepts raw SQL.
- Procedure names only come from `StoredProcedures` constants — never from request data.
- `await using var connection = new SqlConnection(...)` on every call (fixes the current connection leak).
- Connection string read once from `IOptions<DatabaseOptions>`; command timeout configurable.
- Each call is logged at `Debug` with procedure name, duration and parameter names
  (values masked for `Password`, `Token`, `Email`, `Phone`, `Address`); slow calls (> 500 ms) at `Warning`;
  failures at `Error` with the procedure name, then re-thrown as `DataAccessException`.
- `InTransactionAsync` is used by services for checkout (order + order items + stock + voucher + loyalty in one transaction).
- Registered as `services.AddScoped<ISqlHelper, SqlHelper>()`.

```csharp
public static class StoredProcedures
{
    public static class Products
    {
        public const string Search   = "dbo.usp_Product_Search";
        public const string GetById  = "dbo.usp_Product_GetById";
    }
    public static class Orders
    {
        public const string Create   = "dbo.usp_Order_Create";
        public const string AddItem  = "dbo.usp_Order_AddItem";
    }
}
```

### Example vertical slice — product search

```csharp
// Controller
[HttpPost("Search")]
public async Task<IActionResult> Search([FromBody] ProductSearchDto dto, CancellationToken ct)
    => Ok(await _productService.SearchAsync(dto, ct));

// Service
public async Task<PagedResult<ProductSearchResultDto>> SearchAsync(ProductSearchDto dto, CancellationToken ct)
{
    var paging = PagingHelper.Normalize(dto.Page, dto.PageSize, maxPageSize: 100);
    var sort   = SortHelper.Parse(dto.SortBy, dto.SortOrder, allowed: ["price", "name", "createdat"], fallback: "createdat");
    return await _productProvider.SearchAsync(dto.SearchTerm, sort, paging, ct);
}

// Provider
public Task<PagedResult<ProductSearchResultDto>> SearchAsync(string? term, SortSpec sort, Paging paging, CancellationToken ct)
    => _sql.QueryMultipleAsync(StoredProcedures.Products.Search,
           new { SearchTerm = term, sort.SortBy, SortDesc = sort.Descending, paging.Offset, paging.PageSize },
           async grid => new PagedResult<ProductSearchResultDto>(
               (await grid.ReadAsync<ProductSearchResultDto>()).ToList(),
               await grid.ReadSingleAsync<int>()), ct);
```

### Static helper classes

Candidates already visible in the code (duplicated or mixed into controllers):

| Helper | Logic it takes over |
|---|---|
| `PricingHelper` | Sale price, promotion and voucher discount maths, rounding to MKD, delivery price |
| `OrderDisplayHelper` | Variant display name — duplicated at `OrderController.cs:1098` and `:1348` |
| `CsvHelper` | CSV export rows/escaping (`OrderController.cs:2528`) |
| `PagingHelper` / `SortHelper` | Page/size bounds, whitelisted sort fields and directions |
| `ValidationHelper` | Email (`Tools.IsValidEmail`), phone, password rules (`PasswordValidator`) |
| `MaskingHelper` | Masking personal data before logging |

Rule: a helper is `public static`, has no fields, no DB/HTTP/DI, and gets unit tests.

### Migration order (one service at a time, behaviour unchanged)

1. Introduce `ISqlHelper`, `StoredProcedures`, middleware, DI registrations. `DataContextDapper` stays until the last caller is gone.
2. Products (search/filter first — contains the injection) → `ProductService` / `ProductProvider`
3. Users (login, register, reset password)
4. Cart, Favorites
5. Orders + CPay (largest; split `OrderController` into `OrderService`, `CheckoutService`, `OrderReportService`)
6. Vouchers, Promotions, Loyalty (existing `LoyaltyService` moves behind a provider)
7. CMS controllers (sliders, landing page, partners, tips, videos, about, branches, packaging)
8. Delete `DataContextDapper`, `Tools.ErrorLog`, `ErrorLogger`.

Done when: no controller references a data class, every service/provider has an interface and is
registered in DI, `dotnet build` has no new warnings, all tests pass.

---

## Phase 2 — SQL injection: plain SQL → stored procedures

### Procedure conventions

- Name: `dbo.usp_<Entity>_<Action>` (e.g. `usp_Order_Create`, `usp_Product_Search`).
- One file per procedure in `database/procedures/`, written as `CREATE OR ALTER PROCEDURE` (re-runnable).
- `SET NOCOUNT ON;` and `SET XACT_ABORT ON;` at the top of every write procedure.
- Typed parameters with explicit lengths (`NVARCHAR(200)`, not `NVARCHAR(MAX)` for search input).
- Lists of ids passed as a table-valued parameter `dbo.IntList (Id INT PRIMARY KEY)` instead of `IN (1,2,3)` strings.
- No dynamic SQL inside procedures. Sorting uses `CASE` expressions; if dynamic SQL is ever unavoidable,
  only `sp_executesql` with parameters and `QUOTENAME` on whitelisted identifiers.
- Multi-step writes (checkout, stock, voucher redemption) run inside one procedure transaction or via `InTransactionAsync`.

### Example — the search procedure that removes the injection

```sql
CREATE OR ALTER PROCEDURE dbo.usp_Product_Search
    @SearchTerm NVARCHAR(200) = NULL,
    @SortBy     VARCHAR(20)   = 'createdat',
    @SortDesc   BIT           = 1,
    @Offset     INT           = 0,
    @PageSize   INT           = 24
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Like NVARCHAR(210) = N'%' + @SearchTerm + N'%';

    SELECT p.Product_Id, p.Name, p.Price, p.CreatedAt /* ... */
    FROM dbo.Products p
    WHERE @SearchTerm IS NULL OR p.Name LIKE @Like OR p.NameAl LIKE @Like
    ORDER BY
        CASE WHEN @SortBy = 'price'     AND @SortDesc = 0 THEN p.Price END ASC,
        CASE WHEN @SortBy = 'price'     AND @SortDesc = 1 THEN p.Price END DESC,
        CASE WHEN @SortBy = 'name'      AND @SortDesc = 0 THEN p.Name  END ASC,
        CASE WHEN @SortBy = 'name'      AND @SortDesc = 1 THEN p.Name  END DESC,
        CASE WHEN @SortDesc = 0 THEN p.CreatedAt END ASC,
        p.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) FROM dbo.Products p
    WHERE @SearchTerm IS NULL OR p.Name LIKE @Like OR p.NameAl LIKE @Like;
END
```

### Inventory and order of conversion

Track every SQL string in a checklist (`docs/backend/sql-inventory.md`): file, line, operation, target procedure, status.

| Priority | Area | Files | Why first |
|---|---|---|---|
| **Hotfix now** | Product search sort | `ProductsController.cs:317` | Confirmed injection on an anonymous endpoint. Whitelist `SortOrder` to `ASC`/`DESC` immediately, before the full refactor. |
| 1 | Product search & filter | `ProductsController`, `ProductFilterService`, `SearchTermExpander` | Public, anonymous, dynamic `WHERE` building |
| 2 | Users & auth | `UserController` | Credentials, reset tokens |
| 3 | Checkout & orders | `OrderController`, `CPayService` | Money, stock, 102 interpolated strings |
| 4 | Cart, favorites, vouchers, promotions, loyalty | `CartController`, `FavoriteController`, `GiftVouchersController`, `PromotionsController`, `LoyaltyService` | Commerce logic |
| 5 | CMS & admin | remaining controllers | Admin-only, lower exposure |

### Lock it down at the end

- Create a dedicated DB login for the app: `GRANT EXECUTE ON SCHEMA::dbo` and **no** `SELECT/INSERT/UPDATE/DELETE`
  on tables. From that moment, even a missed raw query fails instead of leaking data.
- Add a test/analyzer check that fails the build if `CommandType.Text` or `ExecuteRawSql` appears in `src/`.

Done when: 0 raw SQL strings in C#, app login has EXECUTE-only permissions, all endpoints pass regression on staging.

---

## Phase 3 — Logging and log preview

### Setup

- **Serilog** (`Serilog.AspNetCore`) with `ILogger<T>` injected everywhere; replace all `Console.WriteLine`,
  `Tools.ErrorLog` and `ErrorLogger` calls.
- Sinks:
  - Console (development);
  - rolling file `logs/proteinisi-.log`, daily, 14 days retention, path from configuration (no hard-coded `C:/...`);
  - SQL table `dbo.AppLog` (`Serilog.Sinks.MSSqlServer`) for `Information` and above — feeds the preview page.
- Enrichers: `RequestId`/correlation id (also returned as `X-Correlation-Id` header), `UserId` when authenticated,
  environment, machine name.
- `UseSerilogRequestLogging()` — one line per request: method, path, status code, duration.
- Global exception middleware: logs the exception once with the correlation id and returns `ProblemDetails`
  (`500` without stack traces in production). Removes the need for the 113 local `try/catch` blocks.
- Never log: passwords, tokens, full card/payment payloads, full SQL text, email bodies. Mask email/phone/address.

### Log levels

| Level | Use for |
|---|---|
| `Debug` | SqlHelper call details (dev/staging only) |
| `Information` | Order created, payment callback received, voucher redeemed, admin content changed |
| `Warning` | Validation rejections, slow queries, CPay signature mismatch, rate limit hits |
| `Error` | Unhandled exceptions, failed DB calls, failed emails |

### Log preview (admin)

- `GET /api/admin/logs?level=&from=&to=&search=&correlationId=&page=` — `[Authorize(Roles = "Admin")]`,
  reads `dbo.AppLog` through `usp_AppLog_Search`.
- Admin page in the frontend: table with level filter, date range, text search, and a detail drawer
  (message, exception, properties). Clicking a correlation id shows the whole request.
- Retention job: `usp_AppLog_Purge @OlderThanDays = 30` (SQL Agent job or a hosted `BackgroundService`).

Done when: no `Console.WriteLine` in `src/`, every error on staging appears in the preview with its correlation id.

---

## Phase 4 — Primary keys, foreign keys, indexes and constraints

Always on a **restored backup on staging first**, never directly on production.

### Steps

1. Run `database/reports/report-schema-integrity-20261031.sql` and save the output to
   `docs/backend/schema-review.md`. It lists: tables without PK, existing FKs (and untrusted ones),
   `…Id` columns without FK, FK columns without index, unique and check constraints, and duplicate/negative data.
2. **Clean data** (one script per issue, each first `SELECT`s what it will change):
   duplicate users by `User_Email`, duplicate `FavoriteProducts (UserId, ProductId)`,
   duplicate `ShoppingCart` per `User_Id`, negative `Quantity` in `Products` / `ProductVariants`,
   orphan rows whose parent no longer exists.
3. **Primary keys** on every table that lacks one (identity `INT` clustered unless a natural key is better).
4. **Foreign keys**, created `WITH CHECK` so SQL Server trusts them. Delete rule per relationship:

   | Relationship | ON DELETE |
   |---|---|
   | Order → OrderItems, Cart → CartItems, Product → Gallery/Variants/Nutrition | `CASCADE` |
   | OrderItem → Product/Variant, Order → User | `NO ACTION` (keep order history; products get soft-deleted) |
   | Product → Brand / Category / Flavor | `NO ACTION` |

5. **Indexes**: one non-clustered index on every FK column, plus indexes for the real query patterns
   (to confirm with Query Store / missing-index DMVs on production):
   `Products (IsActive, CreatedAt)`, `Products (Brand_Id)`, `ProductVariants (Product_Id)`,
   `Orders (User_Id, CreatedAt)`, `Orders (Status)`, `OrderItems (Order_Id)`, `CartItems (Cart_Id)`,
   `Vouchers (Code)` unique, `Promotions (Code)` unique.
6. **Constraints**:
   - `UNIQUE`: `User (User_Email)`, `FavoriteProducts (UserId, ProductId)`, `ShoppingCart (User_Id)`, voucher and promo codes;
   - `CHECK`: `Quantity >= 0`, `Price >= 0`, `SalePrice IS NULL OR SalePrice <= Price`, `DiscountPercent BETWEEN 0 AND 100`, valid date ranges (`StartDate <= EndDate`);
   - `DEFAULT`: `CreatedAt = SYSUTCDATETIME()`, `IsActive = 1`;
   - `NOT NULL` on columns the code already assumes are always filled.
7. Each change is an idempotent migration in `database/migrations/` (`IF NOT EXISTS (...)` guards), with a rollback script.
8. Re-run the integrity report: sections 1, 3, 4 and 6 must return no rows.

Exact table and column names are taken from the step 1 report; the lists above are the expected
result and are adjusted to the real schema.

---

## Testing and release for every phase

- Unit tests: helpers and services (providers mocked through their interfaces).
- Integration tests: providers against a test database created from `database/schema` + `procedures` + `migrations`.
- Regression on staging with the existing frontend: search/filter, product page, register/login/reset,
  cart, checkout with CPay test mode, voucher, promo code, loyalty points, admin CMS, CSV export, emails.
- Release: backup → run migrations → deploy API → smoke test → monitor the log preview for 24h.

## Open questions

- Who provides the production schema/backup export and staging database? (Required for Phase 0 step 6.)
- Rename the API project to `ProteiniSi.Api` — confirm the name before the namespace change.
- Log storage: is the `dbo.AppLog` table in the same database acceptable, or should logs go to a separate database?
