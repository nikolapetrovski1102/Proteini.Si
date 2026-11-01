using System.Globalization;
using System.Net.Mail;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;

namespace ProteinisiBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class MarketingController : ControllerBase
    {
        private static readonly object SchemaLock = new();
        private static bool _schemaReady;
        private readonly DataContextDapper _dapper;

        public MarketingController(IConfiguration configuration)
        {
            _dapper = new DataContextDapper(configuration);
            EnsureNewsletterTable();
        }

        private bool IsAdmin()
        {
            var claim = User.FindFirst("superAdmin")?.Value;
            return string.Equals(claim, "true", StringComparison.OrdinalIgnoreCase) || claim == "1";
        }

        private void EnsureNewsletterTable()
        {
            if (_schemaReady) return;
            lock (SchemaLock)
            {
                if (_schemaReady) return;
                _dapper.ExecuteSql(@"
IF OBJECT_ID('dbo.NewsletterSubscribers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.NewsletterSubscribers (
        Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Email nvarchar(320) NOT NULL,
        Source nvarchar(50) NULL,
        IsActive bit NOT NULL CONSTRAINT DF_NewsletterSubscribers_IsActive DEFAULT (1),
        SubscribedAt datetime2 NOT NULL CONSTRAINT DF_NewsletterSubscribers_SubscribedAt DEFAULT (GETDATE()),
        ConsentCapturedAt datetime2 NULL,
        ConsentSource nvarchar(100) NULL,
        UnsubscribedAt datetime2 NULL,
        UpdatedAt datetime2 NULL
    );
    CREATE UNIQUE INDEX UX_NewsletterSubscribers_Email ON dbo.NewsletterSubscribers(Email);
END;");
                _schemaReady = true;
            }
        }

        [AllowAnonymous]
        [HttpPost("newsletter/subscribe")]
        public IActionResult Subscribe([FromBody] NewsletterSubscriptionDto dto)
        {
            var email = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (!IsValidEmail(email))
                return BadRequest(new { status = false, message = "Enter a valid email address." });

            _dapper.ExecuteSql(@"
IF EXISTS (SELECT 1 FROM NewsletterSubscribers WHERE Email = @Email)
    UPDATE NewsletterSubscribers
    SET IsActive = 1, Source = @Source, ConsentCapturedAt = SYSUTCDATETIME(),
        ConsentSource = @Source, UnsubscribedAt = NULL, UpdatedAt = GETDATE()
    WHERE Email = @Email;
ELSE
    INSERT INTO NewsletterSubscribers
        (Email, Source, IsActive, SubscribedAt, ConsentCapturedAt, ConsentSource)
    VALUES (@Email, @Source, 1, GETDATE(), SYSUTCDATETIME(), @Source);", new
            {
                Email = email,
                Source = string.IsNullOrWhiteSpace(dto.Source) ? "website" : dto.Source.Trim()
            });

            return Ok(new { status = true, message = "Subscription saved." });
        }

        [AllowAnonymous]
        [HttpPost("newsletter/unsubscribe")]
        public IActionResult Unsubscribe([FromBody] NewsletterSubscriptionDto dto)
        {
            var email = (dto.Email ?? string.Empty).Trim().ToLowerInvariant();
            if (!IsValidEmail(email))
                return BadRequest(new { status = false, message = "Enter a valid email address." });

            _dapper.ExecuteSql(@"
UPDATE NewsletterSubscribers
SET IsActive = 0, UnsubscribedAt = SYSUTCDATETIME(), UpdatedAt = GETDATE()
WHERE Email = @Email;", new { Email = email });

            // Return the same response whether the address existed or not so the
            // endpoint cannot be used to enumerate subscriber email addresses.
            return Ok(new { status = true, message = "The subscription preference was updated." });
        }

        [Authorize]
        [HttpGet("admin/subscribers")]
        public IActionResult GetSubscribers(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (!IsAdmin()) return Forbid();
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);
            var query = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
            var totalCount = _dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM NewsletterSubscribers
WHERE @Search IS NULL OR Email LIKE @Search OR Source LIKE @Search", new { Search = query });
            var rows = _dapper.LoadData<dynamic>(@"
SELECT Id, Email, Source, IsActive, SubscribedAt, UpdatedAt,
       ConsentCapturedAt, ConsentSource, UnsubscribedAt
FROM NewsletterSubscribers
WHERE @Search IS NULL OR Email LIKE @Search OR Source LIKE @Search
ORDER BY SubscribedAt DESC, Id DESC
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", new
            {
                Search = query,
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            });
            return Ok(new
            {
                status = true,
                data = rows,
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpPut("admin/subscribers/{id:int}/status")]
        public IActionResult UpdateSubscriberStatus(int id, [FromBody] NewsletterStatusDto dto)
        {
            var updated = _dapper.ExecuteSql(@"
UPDATE NewsletterSubscribers
SET IsActive = @IsActive,
    UnsubscribedAt = CASE WHEN @IsActive = 0 THEN SYSUTCDATETIME() ELSE NULL END,
    UpdatedAt = GETDATE()
WHERE Id = @Id;", new { Id = id, dto.IsActive });

            return updated
                ? Ok(new { status = true })
                : NotFound(new { status = false, message = "Subscriber not found." });
        }

        [Authorize]
        [HttpGet("admin/users")]
        public IActionResult GetUsers(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (!IsAdmin()) return Forbid();
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);
            var query = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
            var totalCount = _dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM [User] u
WHERE @Search IS NULL OR u.User_FullName LIKE @Search OR u.User_Email LIKE @Search OR u.User_Phone LIKE @Search",
                new { Search = query });
            var rows = _dapper.LoadData<dynamic>(@"
SELECT User_Id, User_FullName, User_Email, User_Phone, User_IsCompany,
       Company_Name, Company_City, Company_Country, SuperAdmin,
       (SELECT COUNT(1) FROM Orders o WHERE o.User_Id = u.User_Id) AS OrderCount,
       (SELECT COALESCE(SUM(o.Total_Amount), 0) FROM Orders o WHERE o.User_Id = u.User_Id) AS LifetimeOrderValue,
       (SELECT MAX(o.Order_Date) FROM Orders o WHERE o.User_Id = u.User_Id) AS LastOrderAt
FROM [User] u
WHERE @Search IS NULL OR u.User_FullName LIKE @Search OR u.User_Email LIKE @Search OR u.User_Phone LIKE @Search
ORDER BY User_Id DESC
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", new
            {
                Search = query,
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            });
            return Ok(new
            {
                status = true,
                data = rows,
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [Authorize]
        [HttpGet("admin/subscribers.csv")]
        public IActionResult ExportSubscribers()
        {
            if (!IsAdmin()) return Forbid();
            var rows = _dapper.LoadData<dynamic>(@"
SELECT Email, Source, IsActive, SubscribedAt
FROM NewsletterSubscribers
ORDER BY SubscribedAt DESC");
            var csv = new StringBuilder("Email,Source,Active,Subscribed at\r\n");
            foreach (var row in rows)
            {
                csv.Append(Csv(row.Email)).Append(',')
                   .Append(Csv(row.Source)).Append(',')
                   .Append(Convert.ToBoolean(row.IsActive) ? "Yes" : "No").Append(',')
                   .Append(Csv(Convert.ToDateTime(row.SubscribedAt).ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)))
                   .Append("\r\n");
            }
            return CsvFile(csv, $"newsletter-subscribers-{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        [Authorize]
        [HttpGet("admin/users.csv")]
        public IActionResult ExportUsers()
        {
            if (!IsAdmin()) return Forbid();
            var rows = _dapper.LoadData<dynamic>(@"
SELECT User_Id, User_FullName, User_Email, User_Phone, User_IsCompany,
       Company_Name, Company_City, Company_Country, SuperAdmin
FROM [User]
ORDER BY User_Id DESC");
            var csv = new StringBuilder("ID,Full name,Email,Phone,Account type,Company,City,Country,Administrator\r\n");
            foreach (var row in rows)
            {
                csv.Append(row.User_Id).Append(',')
                   .Append(Csv(row.User_FullName)).Append(',')
                   .Append(Csv(row.User_Email)).Append(',')
                   .Append(Csv(row.User_Phone)).Append(',')
                   .Append(Convert.ToBoolean(row.User_IsCompany) ? "Company" : "Individual").Append(',')
                   .Append(Csv(row.Company_Name)).Append(',')
                   .Append(Csv(row.Company_City)).Append(',')
                   .Append(Csv(row.Company_Country)).Append(',')
                   .Append(Convert.ToBoolean(row.SuperAdmin) ? "Yes" : "No")
                   .Append("\r\n");
            }
            return CsvFile(csv, $"registered-users-{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        private FileContentResult CsvFile(StringBuilder csv, string fileName)
        {
            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
            return File(bytes, "text/csv; charset=utf-8", fileName);
        }

        private static bool IsValidEmail(string email)
        {
            try { return new MailAddress(email).Address == email; }
            catch { return false; }
        }

        private static string Csv(object? value)
        {
            var text = Convert.ToString(value) ?? string.Empty;
            if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
                text = "'" + text;
            return $"\"{text.Replace("\"", "\"\"")}\"";
        }
    }

    public class NewsletterSubscriptionDto
    {
        public string Email { get; set; } = string.Empty;
        public string? Source { get; set; }
    }

    public class NewsletterStatusDto
    {
        public bool IsActive { get; set; }
    }
}
