using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using System.Globalization;
using System.Text;

namespace ProteiniSi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class HomepageCardsController : ControllerBase
    {
        private static readonly object SchemaLock = new();
        private static bool _schemaReady;
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public HomepageCardsController(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(configuration);
            _environment = environment;
            EnsureTableAndDefaults();
        }

        private bool IsAdmin()
        {
            var claim = User.FindFirst("superAdmin")?.Value;
            return string.Equals(claim, "true", StringComparison.OrdinalIgnoreCase) || claim == "1";
        }

        private void EnsureTableAndDefaults()
        {
            if (_schemaReady) return;
            lock (SchemaLock)
            {
                if (_schemaReady) return;
                _dapper.ExecuteSql(@"
IF OBJECT_ID('dbo.HomepageCards', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HomepageCards (
        Id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Section nvarchar(20) NOT NULL,
        TitleMk nvarchar(200) NOT NULL,
        TitleAl nvarchar(200) NULL,
        Slug nvarchar(160) NOT NULL,
        FilterValue nvarchar(200) NOT NULL,
        ImagePath nvarchar(500) NULL,
        DisplayOrder int NOT NULL CONSTRAINT DF_HomepageCards_DisplayOrder DEFAULT (0),
        IsActive bit NOT NULL CONSTRAINT DF_HomepageCards_IsActive DEFAULT (1),
        CreatedAt datetime2 NOT NULL CONSTRAINT DF_HomepageCards_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt datetime2 NULL
    );
END;

IF COL_LENGTH('dbo.HomepageCards', 'DestinationUrl') IS NULL
    ALTER TABLE dbo.HomepageCards ADD DestinationUrl nvarchar(500) NULL;

IF NOT EXISTS (SELECT 1 FROM dbo.HomepageCards)
BEGIN
    INSERT INTO dbo.HomepageCards
        (Section, TitleMk, TitleAl, Slug, FilterValue, ImagePath, DisplayOrder, IsActive)
    VALUES
        ('goal', N'Слабеење', N'Humbni peshë', 'weight-loss', 'Weight Loss', '/img/homepage-cards/lose-weight.webp', 1, 1),
        ('goal', N'Добивање мускулна маса', N'Fitoni masë muskulore', 'gain-muscle-mass', 'Muscle Mass', '/img/homepage-cards/gain-muscle-mass.webp', 2, 1),
        ('goal', N'Подобрување на формата и издржливоста', N'Përmirësoni formën dhe qëndrueshmërinë', 'improve-your-form-and-endurance', 'Endurance and Recovery', '/img/homepage-cards/improve-form-endurance.webp', 3, 1),
        ('goal', N'Виталност како начин на живот', N'Vitaliteti si mënyrë jetese', 'vitality-as-a-lifestyle', 'Active Lifestyle', '/img/homepage-cards/vitality-lifestyle.webp', 4, 1),
        ('sport', N'Велосипедизам', N'Çiklizëm', 'road-cycling', 'Road Cycling', '/img/gym-5.jpg', 1, 1),
        ('sport', N'Трчање', N'Vrapimi', 'running', 'Running', '/img/homepage-cards/running.webp', 2, 1),
        ('sport', N'Екипни спортови', N'Sportet ekipore', 'swimming', 'Swimming', '/img/homepage-cards/team-sports.webp', 3, 1),
        ('sport', N'Фитнес и бодибилдинг', N'Fitnesi dhe bodybuilding', 'fitness-bodybuilding', 'Fitness and Bodybuilding', '/img/homepage-cards/fitness-bodybuilding.webp', 4, 1);
END;");
                _schemaReady = true;
            }
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetActive([FromQuery] string? section = null)
        {
            var rows = _dapper.LoadData<dynamic>(@"
SELECT Id, Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive
FROM HomepageCards
WHERE IsActive = 1
  AND (@Section IS NULL OR Section = @Section)
ORDER BY CASE WHEN Section = 'goal' THEN 0 ELSE 1 END, DisplayOrder, Id", new
            {
                Section = NormalizeSection(section, allowEmpty: true)
            });
            return Ok(new { status = true, data = rows });
        }

        [Authorize]
        [HttpGet("admin")]
        public IActionResult GetAll()
        {
            if (!IsAdmin()) return Forbid();
            var rows = _dapper.LoadData<dynamic>(@"
SELECT Id, Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive
FROM HomepageCards
ORDER BY CASE WHEN Section = 'goal' THEN 0 ELSE 1 END, DisplayOrder, Id");
            return Ok(new { status = true, data = rows });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] HomepageCardForm form)
        {
            if (!IsAdmin()) return Forbid();
            var validation = Validate(form);
            if (validation != null) return BadRequest(new { message = validation });
            var slug = NormalizeSlug(form.Slug);
            if (SlugExists(slug, null)) return Conflict(new { message = "A homepage card with this URL slug already exists." });

            var imagePath = await SaveImage(form.Image);
            if (string.IsNullOrWhiteSpace(imagePath))
                return BadRequest(new { message = "Choose an image for the homepage card." });

            var id = _dapper.LoadDataSingle<int>(@"
INSERT INTO HomepageCards
    (Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive, CreatedAt)
VALUES
    (@Section, @TitleMk, @TitleAl, @Slug, @FilterValue, @DestinationUrl, @ImagePath, @DisplayOrder, @IsActive, GETDATE());
SELECT CAST(SCOPE_IDENTITY() AS int);", new
            {
                Section = NormalizeSection(form.Section),
                TitleMk = form.TitleMk.Trim(),
                TitleAl = NullIfWhiteSpace(form.TitleAl),
                Slug = slug,
                FilterValue = form.FilterValue.Trim(),
                DestinationUrl = NullIfWhiteSpace(form.DestinationUrl),
                ImagePath = imagePath,
                form.DisplayOrder,
                form.IsActive
            });

            return Ok(new { status = true, id });
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromForm] HomepageCardForm form)
        {
            if (!IsAdmin()) return Forbid();
            var validation = Validate(form);
            if (validation != null) return BadRequest(new { message = validation });
            var slug = NormalizeSlug(form.Slug);
            if (SlugExists(slug, id)) return Conflict(new { message = "A homepage card with this URL slug already exists." });

            var existing = _dapper.LoadDataSingleOrDefault<dynamic>(
                "SELECT ImagePath FROM HomepageCards WHERE Id = @Id", new { Id = id });
            if (existing == null) return NotFound(new { message = "Homepage card not found." });

            var imagePath = await SaveImage(form.Image) ?? Convert.ToString(existing.ImagePath);
            var updated = _dapper.ExecuteSql(@"
UPDATE HomepageCards SET
    Section = @Section, TitleMk = @TitleMk, TitleAl = @TitleAl,
    Slug = @Slug, FilterValue = @FilterValue, DestinationUrl = @DestinationUrl, ImagePath = @ImagePath,
    DisplayOrder = @DisplayOrder, IsActive = @IsActive, UpdatedAt = GETDATE()
WHERE Id = @Id", new
            {
                Id = id,
                Section = NormalizeSection(form.Section),
                TitleMk = form.TitleMk.Trim(),
                TitleAl = NullIfWhiteSpace(form.TitleAl),
                Slug = slug,
                FilterValue = form.FilterValue.Trim(),
                DestinationUrl = NullIfWhiteSpace(form.DestinationUrl),
                ImagePath = imagePath,
                form.DisplayOrder,
                form.IsActive
            });

            return updated ? Ok(new { status = true }) : NotFound(new { message = "Homepage card not found." });
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            if (!IsAdmin()) return Forbid();
            var deleted = _dapper.ExecuteSqlWithRowCount(
                "DELETE FROM HomepageCards WHERE Id = @Id", new { Id = id });
            return deleted > 0 ? Ok(new { status = true }) : NotFound(new { message = "Homepage card not found." });
        }

        private static string? Validate(HomepageCardForm form)
        {
            if (NormalizeSection(form.Section, allowEmpty: true) == null)
                return "Section must be goal or sport.";
            if (string.IsNullOrWhiteSpace(form.TitleMk)) return "Macedonian title is required.";
            if (string.IsNullOrWhiteSpace(form.Slug)) return "URL slug is required.";
            if (string.IsNullOrWhiteSpace(form.FilterValue)) return "Product filter value is required.";
            if (form.TitleMk.Trim().Length > 200 || (form.TitleAl?.Trim().Length ?? 0) > 200)
                return "Card titles must not exceed 200 characters.";
            if (form.FilterValue.Trim().Length > 200) return "Product filter value is too long.";
            if ((form.DestinationUrl?.Trim().Length ?? 0) > 500) return "Destination URL is too long.";
            if (!IsAllowedDestination(form.DestinationUrl)) return "Destination URL must be an internal path or a Proteini.mk HTTPS URL.";
            if (string.IsNullOrWhiteSpace(NormalizeSlug(form.Slug))) return "URL slug is invalid.";
            if (form.Image != null && form.Image.Length > 8 * 1024 * 1024) return "Image must not exceed 8 MB.";
            if (form.Image != null && form.Image.Length > 0)
            {
                var extension = Path.GetExtension(form.Image.FileName).ToLowerInvariant();
                if (!new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }.Contains(extension)) return "Invalid image type.";
                if (!new[] { "image/jpeg", "image/png", "image/gif", "image/webp" }
                    .Contains(form.Image.ContentType, StringComparer.OrdinalIgnoreCase)) return "Invalid image content type.";
            }
            return null;
        }

        private bool SlugExists(string slug, int? excludingId) => _dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM HomepageCards
WHERE Slug = @Slug AND (@ExcludingId IS NULL OR Id <> @ExcludingId)", new { Slug = slug, ExcludingId = excludingId }) > 0;

        private static bool IsAllowedDestination(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return true;
            var destination = value.Trim();
            if (destination.StartsWith('/') && !destination.StartsWith("//", StringComparison.Ordinal)) return true;
            return Uri.TryCreate(destination, UriKind.Absolute, out var uri)
                && uri.Scheme == Uri.UriSchemeHttps
                && (uri.Host.Equals("proteini.mk", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.Equals("www.proteini.mk", StringComparison.OrdinalIgnoreCase));
        }

        private static string? NormalizeSection(string? value, bool allowEmpty = false)
        {
            if (string.IsNullOrWhiteSpace(value)) return allowEmpty ? null : string.Empty;
            var normalized = value.Trim().ToLowerInvariant();
            return normalized is "goal" or "sport" ? normalized : null;
        }

        private static string? NullIfWhiteSpace(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private async Task<string?> SaveImage(IFormFile? image)
        {
            if (image == null || image.Length == 0) return null;
            if (image.Length > 8 * 1024 * 1024)
                throw new InvalidOperationException("Image must not exceed 8 MB.");
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowed.Contains(extension))
                throw new InvalidOperationException("Invalid image type.");
            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
                throw new InvalidOperationException("Invalid image content type.");

            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var folder = Path.Combine(webRoot, "uploads", "homepage-cards");
            Directory.CreateDirectory(folder);
            var fileName = $"homepage_{Guid.NewGuid():N}{extension}";
            await using var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create);
            await image.CopyToAsync(stream);
            return $"/uploads/homepage-cards/{fileName}";
        }

        private static string NormalizeSlug(string value)
        {
            var normalized = (value ?? string.Empty).Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var output = new StringBuilder();
            var dash = false;
            foreach (var character in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark) continue;
                if (char.IsLetterOrDigit(character))
                {
                    output.Append(character);
                    dash = false;
                }
                else if (!dash && output.Length > 0)
                {
                    output.Append('-');
                    dash = true;
                }
            }
            return output.ToString().Trim('-');
        }
    }

    public class HomepageCardForm
    {
        public string Section { get; set; } = "goal";
        public string TitleMk { get; set; } = string.Empty;
        public string? TitleAl { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string FilterValue { get; set; } = string.Empty;
        public string? DestinationUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public IFormFile? Image { get; set; }
    }
}
