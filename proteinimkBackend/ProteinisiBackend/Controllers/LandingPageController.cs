using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models;
using ProteinisiBackend.Models.Dtos;

namespace ProteinisiBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class LandingPageController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public LandingPageController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAllSections()
        {
            string sql = @"
                SELECT Id, SectionType, Title, ImagePath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM LandingPageSections
                WHERE IsActive = 1
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var sections = _dapper.LoadData<LandingPageSectionResponseDto>(sql);
            return Ok(sections);
        }

        [HttpGet("all")]
        public IActionResult GetAllSectionsIncludingInactive()
        {
            string sql = @"
                SELECT Id, SectionType, Title, ImagePath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM LandingPageSections
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var sections = _dapper.LoadData<LandingPageSectionResponseDto>(sql);
            return Ok(sections);
        }

        [HttpGet("{id}")]
        public IActionResult GetSectionById(int id)
        {
            string sql = @"
                SELECT Id, SectionType, Title, ImagePath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM LandingPageSections
                WHERE Id = @Id";

            var section = _dapper.LoadDataSingleOrDefault<LandingPageSectionResponseDto>(sql, new { Id = id });

            if (section == null)
                return NotFound($"Section with ID {id} not found");

            return Ok(section);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSection([FromForm] CreateLandingPageSectionDto newSection)
        {
            if (string.IsNullOrEmpty(newSection.SectionType))
                return BadRequest("SectionType is required");

            // Validate section type
            var validTypes = new[] { "image", "title", "subtitle", "paragraph", "highlight", "italic" };
            if (!validTypes.Contains(newSection.SectionType))
                return BadRequest("Invalid SectionType. Must be: image, title, subtitle, paragraph, highlight, or italic");

            string? imagePath = null;

            // Handle image upload if provided
            if (newSection.SectionType == "image" && newSection.Image != null && newSection.Image.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(newSection.Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

                if (newSection.Image.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                var fileName = $"landing_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "landing");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                imagePath = $"/uploads/landing/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newSection.Image.CopyToAsync(stream);
                }
            }

            // Get the max display order
            string maxOrderSql = "SELECT ISNULL(MAX(DisplayOrder), -1) FROM LandingPageSections";
            int maxOrder = _dapper.LoadDataSingle<int>(maxOrderSql);
            int displayOrder = newSection.DisplayOrder > 0 ? newSection.DisplayOrder : maxOrder + 1;

            // Save to database
            string sql = @"
                INSERT INTO LandingPageSections (SectionType, Title, ImagePath, Content, DisplayOrder, CreatedBy)
                VALUES (@SectionType, @Title, @ImagePath, @Content, @DisplayOrder, @CreatedBy);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var parameters = new
            {
                newSection.SectionType,
                newSection.Title,
                ImagePath = imagePath,
                newSection.Content,
                DisplayOrder = displayOrder,
                newSection.CreatedBy
            };

            int newId = _dapper.LoadDataSingle<int>(sql, parameters);

            return Ok(new { Id = newId, Message = "Section created successfully" });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSection([FromForm] UpdateLandingPageSectionDto updatedSection)
        {
            // Check if section exists
            string checkSql = "SELECT Id, ImagePath FROM LandingPageSections WHERE Id = @Id";
            var existingSection = _dapper.LoadDataSingleOrDefault<LandingPageSection>(checkSql, new { updatedSection.Id });

            if (existingSection == null)
                return NotFound($"Section with ID {updatedSection.Id} not found");

            string? imagePath = existingSection.ImagePath;

            // Handle new image upload if provided
            if (updatedSection.SectionType == "image" && updatedSection.Image != null && updatedSection.Image.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(updatedSection.Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

                if (updatedSection.Image.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                // Delete old image if exists
                if (!string.IsNullOrEmpty(existingSection.ImagePath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, existingSection.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                var fileName = $"landing_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "landing");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                imagePath = $"/uploads/landing/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updatedSection.Image.CopyToAsync(stream);
                }
            }

            // Update database
            string sql = @"
                UPDATE LandingPageSections
                SET SectionType = @SectionType,
                    Title = @Title,
                    ImagePath = @ImagePath,
                    Content = @Content,
                    DisplayOrder = @DisplayOrder,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE(),
                    UpdatedBy = @UpdatedBy
                WHERE Id = @Id";

            var parameters = new
            {
                updatedSection.Id,
                updatedSection.SectionType,
                updatedSection.Title,
                ImagePath = imagePath,
                updatedSection.Content,
                updatedSection.DisplayOrder,
                updatedSection.IsActive,
                updatedSection.UpdatedBy
            };

            bool result = _dapper.ExecuteSql(sql, parameters);

            if (result)
                return Ok(new { Message = "Section updated successfully" });
            else
                return StatusCode(500, "Failed to update section");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteSection(int id)
        {
            // Get image path first
            string getImageSql = "SELECT ImagePath FROM LandingPageSections WHERE Id = @Id";
            var section = _dapper.LoadDataSingleOrDefault<LandingPageSection>(getImageSql, new { Id = id });

            if (section == null)
                return NotFound($"Section with ID {id} not found");

            // Delete from database
            string sql = "DELETE FROM LandingPageSections WHERE Id = @Id";
            bool result = _dapper.ExecuteSql(sql, new { Id = id });

            if (result)
            {
                // Delete image file from disk if exists
                if (!string.IsNullOrEmpty(section.ImagePath))
                {
                    var filePath = Path.Combine(_environment.WebRootPath, section.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                return Ok(new { Message = "Section deleted successfully" });
            }
            else
                return StatusCode(500, "Failed to delete section");
        }

        [HttpPost("reorder")]
        public IActionResult ReorderSections([FromBody] List<ReorderLandingPageSectionDto> reorderList)
        {
            if (reorderList == null || reorderList.Count == 0)
                return BadRequest("Reorder list is required");

            using (var connection = _dapper.GetConnection())
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in reorderList)
                        {
                            string sql = @"
                                UPDATE LandingPageSections
                                SET DisplayOrder = @DisplayOrder,
                                    UpdatedAt = GETDATE()
                                WHERE Id = @Id";

                            var parameters = new { item.Id, item.DisplayOrder };
                            _dapper.ExecuteSql(sql, parameters);
                        }
                        transaction.Commit();
                        return Ok(new { Message = "Sections reordered successfully" });
                    }
                    catch
                    {
                        transaction.Rollback();
                        return StatusCode(500, "Failed to reorder sections");
                    }
                }
            }
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file uploaded" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." });

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size too large. Maximum 5MB allowed." });

                var fileName = $"landing_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "landing");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                var relativePath = $"/uploads/landing/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new { imagePath = relativePath, message = "Image uploaded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Failed to upload image: {ex.Message}" });
            }
        }
    }
}
