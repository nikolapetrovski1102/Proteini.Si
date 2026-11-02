using System.Globalization;
using System.Text;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;

namespace ProteiniSi.Api.Controllers
{
    [ApiController]
    [Route("api/admin/taxonomy")]
    [Authorize(Policy = "SuperAdmin")]
    public class AdminTaxonomyController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public AdminTaxonomyController(IConfiguration configuration)
        {
            _dapper = new DataContextDapper(configuration);
        }

        private bool IsAdmin()
        {
            var claim = User.FindFirst("superAdmin")?.Value;
            return string.Equals(claim, "true", StringComparison.OrdinalIgnoreCase) || claim == "1";
        }

        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            return Ok(_dapper.LoadData<ProductCategory>(@"
SELECT Category_Id, Category_Name, Category_Slug, Parent_Category_Id, Display_Order
FROM ProductCategories
ORDER BY CASE WHEN Parent_Category_Id IS NULL THEN Category_Id ELSE Parent_Category_Id END,
         Parent_Category_Id, Display_Order, Category_Name"));
        }

        [HttpPost("categories")]
        public IActionResult CreateCategory([FromBody] CategoryWriteDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var validation = Validate(dto);
            if (validation != null) return BadRequest(new { error = validation });
            if (dto.ParentId.HasValue && !CategoryExists(dto.ParentId.Value))
                return BadRequest(new { error = "The selected parent category does not exist." });

            var slug = NormalizeSlug(dto.Slug);
            if (string.IsNullOrWhiteSpace(slug))
                return BadRequest(new { error = "Category URL slug must contain at least one letter or number." });
            if (_dapper.LoadDataSingle<int>(
                    "SELECT COUNT(1) FROM ProductCategories WHERE Category_Slug = @Slug",
                    new { Slug = slug }) > 0)
                return Conflict(new { error = "A category with this slug already exists." });

            var id = _dapper.LoadDataSingle<int>(@"
INSERT INTO ProductCategories (Category_Name, Category_Slug, Parent_Category_Id, Display_Order)
VALUES (@Name, @Slug, @ParentId, @DisplayOrder);
SELECT CAST(SCOPE_IDENTITY() AS int);", new
            {
                Name = dto.Name.Trim(),
                Slug = slug,
                ParentId = dto.ParentId,
                DisplayOrder = dto.DisplayOrder
            });

            return Ok(new { status = true, categoryId = id });
        }

        [HttpPut("categories/{id:int}")]
        public IActionResult UpdateCategory(int id, [FromBody] CategoryWriteDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var validation = Validate(dto);
            if (validation != null) return BadRequest(new { error = validation });
            if (dto.ParentId == id) return BadRequest(new { error = "A category cannot be its own parent." });
            if (dto.ParentId.HasValue && !CategoryExists(dto.ParentId.Value))
                return BadRequest(new { error = "The selected parent category does not exist." });
            if (dto.ParentId.HasValue && WouldCreateCycle(id, dto.ParentId.Value))
                return BadRequest(new { error = "That parent selection would create a category cycle." });

            var slug = NormalizeSlug(dto.Slug);
            if (string.IsNullOrWhiteSpace(slug))
                return BadRequest(new { error = "Category URL slug must contain at least one letter or number." });
            if (_dapper.LoadDataSingle<int>(@"
SELECT COUNT(1) FROM ProductCategories
WHERE Category_Slug = @Slug AND Category_Id <> @Id", new { Slug = slug, Id = id }) > 0)
                return Conflict(new { error = "A category with this slug already exists." });

            var existing = _dapper.LoadDataSingleOrDefault<ProductCategory>(@"
SELECT Category_Id, Category_Name, Category_Slug, Parent_Category_Id, Display_Order
FROM ProductCategories WHERE Category_Id = @Id", new { Id = id });
            if (existing == null) return NotFound(new { error = "Category not found." });

            var updated = _dapper.ExecuteInTransaction((connection, transaction) =>
            {
                if (!string.Equals(existing.Category_Slug, slug, StringComparison.OrdinalIgnoreCase))
                {
                    connection.Execute(@"
IF NOT EXISTS (SELECT 1 FROM CategorySlugHistory WHERE OldSlug = @OldSlug)
    INSERT INTO CategorySlugHistory (CategoryId, OldSlug, CreatedAt)
    VALUES (@CategoryId, @OldSlug, SYSUTCDATETIME());", new
                    {
                        CategoryId = id,
                        OldSlug = existing.Category_Slug
                    }, transaction);
                }

                return connection.Execute(@"
UPDATE ProductCategories
SET Category_Name = @Name,
    Category_Slug = @Slug,
    Parent_Category_Id = @ParentId,
    Display_Order = @DisplayOrder
WHERE Category_Id = @Id", new
                {
                    Id = id,
                    Name = dto.Name.Trim(),
                    Slug = slug,
                    ParentId = dto.ParentId,
                    DisplayOrder = dto.DisplayOrder
                }, transaction) == 1;
            });

            return updated ? Ok(new { status = true }) : NotFound(new { error = "Category not found." });
        }

        [AllowAnonymous]
        [HttpGet("category-slug/{slug}")]
        public IActionResult ResolveCategorySlug(string slug)
        {
            var normalized = NormalizeSlug(slug);
            var current = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT TOP 1 c.Category_Id, c.Category_Slug
FROM CategorySlugHistory h
INNER JOIN ProductCategories c ON c.Category_Id = h.CategoryId
WHERE h.OldSlug = @Slug", new { Slug = normalized });

            return current == null
                ? NotFound(new { status = false })
                : Ok(new { status = true, categoryId = current.Category_Id, slug = current.Category_Slug });
        }

        [HttpDelete("categories/{id:int}")]
        public IActionResult DeleteCategory(int id)
        {
            if (!IsAdmin()) return Forbid();
            var childCount = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM ProductCategories WHERE Parent_Category_Id = @Id", new { Id = id });
            var productCount = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM ProductCategoryMapping WHERE Category_Id = @Id", new { Id = id });

            if (childCount > 0 || productCount > 0)
                return Conflict(new
                {
                    error = "This category is still used by products or subcategories. Move those records before deleting it."
                });

            var deleted = _dapper.ExecuteSql(
                "DELETE FROM ProductCategories WHERE Category_Id = @Id", new { Id = id });
            return deleted ? Ok(new { status = true }) : NotFound(new { error = "Category not found." });
        }

        private static string? Validate(CategoryWriteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return "Category name is required.";
            if (string.IsNullOrWhiteSpace(dto.Slug)) return "Category URL slug is required.";
            return null;
        }

        private bool CategoryExists(int id) => _dapper.LoadDataSingle<int>(
            "SELECT COUNT(1) FROM ProductCategories WHERE Category_Id = @Id",
            new { Id = id }) == 1;

        private bool WouldCreateCycle(int categoryId, int proposedParentId)
        {
            return _dapper.LoadDataSingle<int>(@"
WITH Descendants AS (
    SELECT Category_Id
    FROM ProductCategories
    WHERE Parent_Category_Id = @CategoryId
    UNION ALL
    SELECT child.Category_Id
    FROM ProductCategories child
    INNER JOIN Descendants parent ON child.Parent_Category_Id = parent.Category_Id
)
SELECT COUNT(1)
FROM Descendants
WHERE Category_Id = @ProposedParentId
OPTION (MAXRECURSION 100);", new
            {
                CategoryId = categoryId,
                ProposedParentId = proposedParentId
            }) > 0;
        }

        private static string NormalizeSlug(string value)
        {
            var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var output = new StringBuilder();
            var previousDash = false;
            foreach (var character in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                    continue;
                if (char.IsLetterOrDigit(character))
                {
                    output.Append(character);
                    previousDash = false;
                }
                else if (!previousDash && output.Length > 0)
                {
                    output.Append('-');
                    previousDash = true;
                }
            }
            return output.ToString().Trim('-');
        }
    }

    public class CategoryWriteDto
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public int DisplayOrder { get; set; }
    }
}
