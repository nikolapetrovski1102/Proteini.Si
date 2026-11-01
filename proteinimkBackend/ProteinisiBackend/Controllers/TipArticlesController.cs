using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models;
using System.Globalization;
using System.Text;
using Ganss.Xss;

namespace ProteinisiBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class TipArticlesController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;
        private static readonly HtmlSanitizer ContentSanitizer = new();
        private const long MaximumImageBytes = 8 * 1024 * 1024;

        public TipArticlesController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
            EnsureTable();
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            return isAdminClaim == "True" || isAdminClaim == "true";
        }

        private void EnsureTable()
        {
            string sql = @"
IF OBJECT_ID('dbo.TipArticles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TipArticles (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Category NVARCHAR(100) NOT NULL DEFAULT 'news',
        Title NVARCHAR(300) NOT NULL,
        Subtitle NVARCHAR(500) NULL,
        Content NVARCHAR(MAX) NULL,
        ImagePath NVARCHAR(500) NULL,
        DisplayOrder INT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
    );
END";

            _dapper.ExecuteSql(sql);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetActiveArticles()
        {
            string sql = @"
SELECT *
FROM TipArticles
WHERE IsActive = 1
ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var articles = _dapper.LoadData<TipArticle>(sql);
            return Ok(new { status = true, data = articles });
        }

        [AllowAnonymous]
        [HttpGet("by-slug/{slug}")]
        public IActionResult GetArticleBySlug(string slug)
        {
            var normalizedSlug = NormalizeSlug(slug);
            var article = _dapper.LoadDataSingleOrDefault<TipArticle>(@"
SELECT * FROM TipArticles
WHERE Slug = @Slug AND IsActive = 1", new { Slug = normalizedSlug });

            return article == null
                ? NotFound(new { status = false, message = "Article not found." })
                : Ok(new { status = true, data = article });
        }

        [Authorize]
        [HttpGet("all")]
        public IActionResult GetAllArticles()
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            string sql = "SELECT * FROM TipArticles ORDER BY DisplayOrder ASC, CreatedAt DESC";
            var articles = _dapper.LoadData<TipArticle>(sql);
            return Ok(new { status = true, data = articles });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateArticle([FromForm] TipArticleForm form)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            var validation = Validate(form);
            if (validation != null) return BadRequest(new { message = validation });

            var slug = NormalizeSlug(string.IsNullOrWhiteSpace(form.Slug) ? form.Title : form.Slug);
            if (SlugExists(slug, null)) return Conflict(new { message = "An article with this URL slug already exists." });
            var imagePath = await SaveImage(form.Image);
            string sql = @"
INSERT INTO TipArticles
    (Category, Title, TitleAl, Subtitle, SubtitleAl, Content, ContentAl, Slug,
     SeoTitle, SeoDescription, ImagePath, DisplayOrder, IsActive, CreatedAt)
VALUES
    (@Category, @Title, @TitleAl, @Subtitle, @SubtitleAl, @Content, @ContentAl, @Slug,
     @SeoTitle, @SeoDescription, @ImagePath, @DisplayOrder, @IsActive, GETDATE());
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            var id = _dapper.LoadDataSingle<int>(sql, new
            {
                Category = form.Category ?? "news",
                Title = form.Title.Trim(),
                TitleAl = CleanOptional(form.TitleAl),
                form.Subtitle,
                SubtitleAl = CleanOptional(form.SubtitleAl),
                Content = ContentSanitizer.Sanitize(form.Content ?? string.Empty),
                ContentAl = ContentSanitizer.Sanitize(form.ContentAl ?? string.Empty),
                Slug = slug,
                SeoTitle = CleanOptional(form.SeoTitle),
                SeoDescription = CleanOptional(form.SeoDescription),
                ImagePath = imagePath,
                form.DisplayOrder,
                form.IsActive
            });

            return Ok(new { status = true, id, message = "Article created successfully" });
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateArticle([FromForm] TipArticleForm form)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            string existingSql = "SELECT * FROM TipArticles WHERE Id = @Id";
            var existing = _dapper.LoadDataSingleOrDefault<TipArticle>(existingSql, new { form.Id });
            if (existing == null)
                return NotFound(new { message = "Article not found" });

            var validation = Validate(form);
            if (validation != null) return BadRequest(new { message = validation });
            var slug = NormalizeSlug(string.IsNullOrWhiteSpace(form.Slug) ? form.Title : form.Slug);
            if (SlugExists(slug, form.Id)) return Conflict(new { message = "An article with this URL slug already exists." });

            var imagePath = existing.ImagePath;
            var newImagePath = await SaveImage(form.Image);
            if (!string.IsNullOrWhiteSpace(newImagePath))
                imagePath = newImagePath;

            string sql = @"
UPDATE TipArticles
SET Category = @Category,
    Title = @Title,
    TitleAl = @TitleAl,
    Subtitle = @Subtitle,
    SubtitleAl = @SubtitleAl,
    Content = @Content,
    ContentAl = @ContentAl,
    Slug = @Slug,
    SeoTitle = @SeoTitle,
    SeoDescription = @SeoDescription,
    ImagePath = @ImagePath,
    DisplayOrder = @DisplayOrder,
    IsActive = @IsActive,
    UpdatedAt = GETDATE()
WHERE Id = @Id";

            _dapper.ExecuteSql(sql, new
            {
                form.Id,
                Category = form.Category ?? "news",
                Title = form.Title.Trim(),
                TitleAl = CleanOptional(form.TitleAl),
                form.Subtitle,
                SubtitleAl = CleanOptional(form.SubtitleAl),
                Content = ContentSanitizer.Sanitize(form.Content ?? string.Empty),
                ContentAl = ContentSanitizer.Sanitize(form.ContentAl ?? string.Empty),
                Slug = slug,
                SeoTitle = CleanOptional(form.SeoTitle),
                SeoDescription = CleanOptional(form.SeoDescription),
                ImagePath = imagePath,
                form.DisplayOrder,
                form.IsActive
            });

            return Ok(new { status = true, message = "Article updated successfully" });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult DeleteArticle(int id)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            var rows = _dapper.ExecuteSqlWithRowCount("DELETE FROM TipArticles WHERE Id = @Id", new { Id = id });
            if (rows == 0)
                return NotFound(new { message = "Article not found" });

            return Ok(new { status = true, message = "Article deleted successfully" });
        }

        private async Task<string?> SaveImage(IFormFile? image)
        {
            if (image == null || image.Length == 0)
                return null;

            if (image.Length > MaximumImageBytes)
                throw new InvalidOperationException("Image must not exceed 8 MB.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("Invalid image type");

            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
                throw new InvalidOperationException("Invalid image content type.");

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "tips");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"tip_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/tips/{fileName}";
        }

        private bool SlugExists(string slug, int? excludingId) => _dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM TipArticles
WHERE Slug = @Slug AND (@ExcludingId IS NULL OR Id <> @ExcludingId)", new { Slug = slug, ExcludingId = excludingId }) > 0;

        private static string? Validate(TipArticleForm form)
        {
            if (string.IsNullOrWhiteSpace(form.Title)) return "Title is required.";
            if (form.Title.Trim().Length > 300) return "Title must not exceed 300 characters.";
            if ((form.TitleAl?.Trim().Length ?? 0) > 300) return "Albanian title must not exceed 300 characters.";
            if ((form.Subtitle?.Trim().Length ?? 0) > 500) return "Subtitle must not exceed 500 characters.";
            if ((form.SubtitleAl?.Trim().Length ?? 0) > 1000) return "Albanian subtitle must not exceed 1000 characters.";
            if ((form.SeoTitle?.Trim().Length ?? 0) > 300) return "SEO title must not exceed 300 characters.";
            if ((form.SeoDescription?.Length ?? 0) > 500) return "SEO description must not exceed 500 characters.";
            if (form.Image != null && form.Image.Length > MaximumImageBytes) return "Image must not exceed 8 MB.";
            if (form.Image != null && form.Image.Length > 0)
            {
                var extension = Path.GetExtension(form.Image.FileName).ToLowerInvariant();
                if (!new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }.Contains(extension))
                    return "Invalid image type.";
                if (!new[] { "image/jpeg", "image/png", "image/gif", "image/webp" }
                    .Contains(form.Image.ContentType, StringComparer.OrdinalIgnoreCase))
                    return "Invalid image content type.";
            }
            return null;
        }

        private static string? CleanOptional(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static string NormalizeSlug(string value)
        {
            var normalized = (value ?? string.Empty).Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var result = new StringBuilder();
            var dash = false;
            foreach (var character in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark) continue;
                if (char.IsLetterOrDigit(character))
                {
                    result.Append(character);
                    dash = false;
                }
                else if (!dash && result.Length > 0)
                {
                    result.Append('-');
                    dash = true;
                }
            }
            return result.ToString().Trim('-');
        }
    }

    public class TipArticleForm
    {
        public int Id { get; set; }
        public string? Category { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? TitleAl { get; set; }
        public string? Subtitle { get; set; }
        public string? SubtitleAl { get; set; }
        public string? Content { get; set; }
        public string? ContentAl { get; set; }
        public string? Slug { get; set; }
        public string? SeoTitle { get; set; }
        public string? SeoDescription { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public IFormFile? Image { get; set; }
    }
}
