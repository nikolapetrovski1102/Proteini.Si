using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.Dtos;

namespace ProteiniSi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class AboutCompanyController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public AboutCompanyController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAllSections()
        {
            string sql = @"
                SELECT Id, SectionType, Title, VideoUrl, VideoThumbnailPath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM AboutCompanySections
                WHERE IsActive = 1
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var sections = _dapper.LoadData<AboutCompanySectionResponseDto>(sql);
            return Ok(sections);
        }

        [HttpGet("all")]
        public IActionResult GetAllSectionsIncludingInactive()
        {
            string sql = @"
                SELECT Id, SectionType, Title, VideoUrl, VideoThumbnailPath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM AboutCompanySections
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var sections = _dapper.LoadData<AboutCompanySectionResponseDto>(sql);
            return Ok(sections);
        }

        [HttpGet("{id}")]
        public IActionResult GetSectionById(int id)
        {
            string sql = @"
                SELECT Id, SectionType, Title, VideoUrl, VideoThumbnailPath, Content, 
                       DisplayOrder, IsActive, CreatedAt
                FROM AboutCompanySections
                WHERE Id = @Id";

            var section = _dapper.LoadDataSingleOrDefault<AboutCompanySectionResponseDto>(sql, new { Id = id });

            if (section == null)
                return NotFound($"Section with ID {id} not found");

            return Ok(section);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSection([FromForm] CreateAboutCompanySectionDto newSection)
        {
            if (string.IsNullOrEmpty(newSection.SectionType))
                return BadRequest("SectionType is required");

            // Validate section type
            var validTypes = new[] { "video", "title", "paragraph", "subtitle", "award", "business-cooperation" };
            if (!validTypes.Contains(newSection.SectionType))
                return BadRequest("Invalid SectionType. Must be: video, title, paragraph, subtitle, award, or business-cooperation");

            string? videoThumbnailPath = null;

            // Handle video thumbnail upload if provided
            if ((newSection.SectionType == "video" || newSection.SectionType == "business-cooperation") &&
                newSection.VideoThumbnail != null &&
                newSection.VideoThumbnail.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(newSection.VideoThumbnail.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

                if (newSection.VideoThumbnail.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                var fileName = $"about_video_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "about-company");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                videoThumbnailPath = $"/uploads/about-company/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newSection.VideoThumbnail.CopyToAsync(stream);
                }
            }

            // Get the max display order
            string maxOrderSql = "SELECT ISNULL(MAX(DisplayOrder), -1) FROM AboutCompanySections";
            int maxOrder = _dapper.LoadDataSingle<int>(maxOrderSql);
            int displayOrder = newSection.DisplayOrder > 0 ? newSection.DisplayOrder : maxOrder + 1;

            // Save to database
            string sql = @"
                INSERT INTO AboutCompanySections (SectionType, Title, VideoUrl, VideoThumbnailPath, Content, DisplayOrder, CreatedBy)
                VALUES (@SectionType, @Title, @VideoUrl, @VideoThumbnailPath, @Content, @DisplayOrder, @CreatedBy);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var parameters = new
            {
                newSection.SectionType,
                newSection.Title,
                newSection.VideoUrl,
                VideoThumbnailPath = videoThumbnailPath,
                newSection.Content,
                DisplayOrder = displayOrder,
                newSection.CreatedBy
            };

            int newId = _dapper.LoadDataSingle<int>(sql, parameters);

            return Ok(new { Id = newId, Message = "Section created successfully" });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSection([FromForm] UpdateAboutCompanySectionDto updatedSection)
        {
            // Check if section exists
            string checkSql = "SELECT Id, VideoThumbnailPath FROM AboutCompanySections WHERE Id = @Id";
            var existingSection = _dapper.LoadDataSingleOrDefault<AboutCompanySection>(checkSql, new { updatedSection.Id });

            if (existingSection == null)
                return NotFound($"Section with ID {updatedSection.Id} not found");

            string? videoThumbnailPath = existingSection.VideoThumbnailPath;

            // Handle new video thumbnail upload if provided
            if ((updatedSection.SectionType == "video" || updatedSection.SectionType == "business-cooperation") &&
                updatedSection.VideoThumbnail != null &&
                updatedSection.VideoThumbnail.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(updatedSection.VideoThumbnail.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

                if (updatedSection.VideoThumbnail.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                // Delete old thumbnail if exists
                if (!string.IsNullOrEmpty(existingSection.VideoThumbnailPath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, existingSection.VideoThumbnailPath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                var fileName = $"about_video_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "about-company");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                videoThumbnailPath = $"/uploads/about-company/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updatedSection.VideoThumbnail.CopyToAsync(stream);
                }
            }

            // Update database
            string sql = @"
                UPDATE AboutCompanySections
                SET SectionType = @SectionType,
                    Title = @Title,
                    VideoUrl = @VideoUrl,
                    VideoThumbnailPath = @VideoThumbnailPath,
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
                updatedSection.VideoUrl,
                VideoThumbnailPath = videoThumbnailPath,
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
            // Get thumbnail path first
            string getImageSql = "SELECT VideoThumbnailPath FROM AboutCompanySections WHERE Id = @Id";
            var section = _dapper.LoadDataSingleOrDefault<AboutCompanySection>(getImageSql, new { Id = id });

            if (section == null)
                return NotFound($"Section with ID {id} not found");

            // Delete from database
            string sql = "DELETE FROM AboutCompanySections WHERE Id = @Id";
            bool result = _dapper.ExecuteSql(sql, new { Id = id });

            if (result)
            {
                // Delete thumbnail file from disk if exists
                if (!string.IsNullOrEmpty(section.VideoThumbnailPath))
                {
                    var filePath = Path.Combine(_environment.WebRootPath, section.VideoThumbnailPath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                return Ok(new { Message = "Section deleted successfully" });
            }
            else
                return StatusCode(500, "Failed to delete section");
        }

        [HttpPost("reorder")]
        public IActionResult ReorderSections([FromBody] List<ReorderAboutCompanySectionDto> reorderList)
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
                                UPDATE AboutCompanySections
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

        [HttpPost("upload-thumbnail")]
        public async Task<IActionResult> UploadThumbnail(IFormFile file)
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

                var fileName = $"about_thumb_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "about-company");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                var relativePath = $"/uploads/about-company/{fileName}";

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new { thumbnailPath = relativePath, message = "Thumbnail uploaded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Failed to upload thumbnail: {ex.Message}" });
            }
        }
    }
}
