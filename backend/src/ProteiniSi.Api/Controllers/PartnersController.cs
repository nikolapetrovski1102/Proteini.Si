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
    public class PartnersController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public PartnersController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAllPartners()
        {
            string sql = @"
                SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
                FROM Partners
                WHERE IsActive = 1
                ORDER BY Type, DisplayOrder ASC, CreatedAt DESC";

            var partners = _dapper.LoadData<PartnerResponseDto>(sql);
            return Ok(partners);
        }

        [HttpGet("all")]
        public IActionResult GetAllPartnersIncludingInactive()
        {
            string sql = @"
                SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
                FROM Partners
                ORDER BY Type, DisplayOrder ASC, CreatedAt DESC";

            var partners = _dapper.LoadData<PartnerResponseDto>(sql);
            return Ok(partners);
        }

        [AllowAnonymous]
        [HttpGet("type/{type}")]
        public IActionResult GetPartnersByType(string type)
        {
            if (type != "partner" && type != "award")
                return BadRequest("Type must be 'partner' or 'award'");

            string sql = @"
                SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
                FROM Partners
                WHERE Type = @Type AND IsActive = 1
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var partners = _dapper.LoadData<PartnerResponseDto>(sql, new { Type = type });
            return Ok(partners);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public IActionResult GetPartnerById(int id)
        {
            string sql = @"
                SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
                FROM Partners
                WHERE Id = @Id";

            var partner = _dapper.LoadDataSingleOrDefault<PartnerResponseDto>(sql, new { Id = id });

            if (partner == null)
                return NotFound($"Partner with ID {id} not found");

            return Ok(partner);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePartner([FromForm] CreatePartnerDto newPartner)
        {
            if (string.IsNullOrEmpty(newPartner.Type))
                return BadRequest("Type is required (partner or award)");

            if (string.IsNullOrEmpty(newPartner.Name))
                return BadRequest("Name is required");

            if (newPartner.Image == null || newPartner.Image.Length == 0)
                return BadRequest("Image file is required");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            var fileExtension = Path.GetExtension(newPartner.Image.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed.");

            // Validate file size (max 5MB)
            if (newPartner.Image.Length > 5 * 1024 * 1024)
                return BadRequest("File size too large. Maximum 5MB allowed.");

            // Generate unique filename
            var fileName = $"{newPartner.Type}_{Guid.NewGuid()}{fileExtension}";
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "partners");

            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);
            var relativePath = $"/uploads/partners/{fileName}";

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await newPartner.Image.CopyToAsync(stream);
            }

            // Get the max display order for this type
            string maxOrderSql = "SELECT ISNULL(MAX(DisplayOrder), -1) FROM Partners WHERE Type = @Type";
            int maxOrder = _dapper.LoadDataSingle<int>(maxOrderSql, new { newPartner.Type });
            int displayOrder = newPartner.DisplayOrder > 0 ? newPartner.DisplayOrder : maxOrder + 1;

            // Save to database
            string sql = @"
                INSERT INTO Partners (Type, Name, ImagePath, Url, DisplayOrder, CreatedBy)
                VALUES (@Type, @Name, @ImagePath, @Url, @DisplayOrder, @CreatedBy);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var parameters = new
            {
                newPartner.Type,
                newPartner.Name,
                ImagePath = relativePath,
                newPartner.Url,
                DisplayOrder = displayOrder,
                newPartner.CreatedBy
            };

            int newId = _dapper.LoadDataSingle<int>(sql, parameters);

            return Ok(new { Id = newId, Message = "Partner created successfully", ImagePath = relativePath });
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePartner([FromForm] UpdatePartnerDto updatedPartner)
        {
            // Check if partner exists
            string checkSql = "SELECT Id, ImagePath FROM Partners WHERE Id = @Id";
            var existingPartner = _dapper.LoadDataSingleOrDefault<Partner>(checkSql, new { updatedPartner.Id });

            if (existingPartner == null)
                return NotFound($"Partner with ID {updatedPartner.Id} not found");

            string imagePath = existingPartner.ImagePath;

            // If new image uploaded, replace old one
            if (updatedPartner.Image != null && updatedPartner.Image.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
                var fileExtension = Path.GetExtension(updatedPartner.Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed.");

                // Validate file size (max 5MB)
                if (updatedPartner.Image.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                // Delete old image if exists
                if (!string.IsNullOrEmpty(existingPartner.ImagePath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, existingPartner.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                // Generate new filename
                var fileName = $"{updatedPartner.Type}_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "partners");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                imagePath = $"/uploads/partners/{fileName}";

                // Save new file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updatedPartner.Image.CopyToAsync(stream);
                }
            }

            // Update database
            string sql = @"
                UPDATE Partners
                SET Type = @Type,
                    Name = @Name,
                    ImagePath = @ImagePath,
                    Url = @Url,
                    DisplayOrder = @DisplayOrder,
                    IsActive = @IsActive,
                    UpdatedAt = GETDATE(),
                    UpdatedBy = @UpdatedBy
                WHERE Id = @Id";

            var parameters = new
            {
                updatedPartner.Id,
                updatedPartner.Type,
                updatedPartner.Name,
                ImagePath = imagePath,
                updatedPartner.Url,
                updatedPartner.DisplayOrder,
                updatedPartner.IsActive,
                updatedPartner.UpdatedBy
            };

            bool result = _dapper.ExecuteSql(sql, parameters);

            if (result)
                return Ok(new { Message = "Partner updated successfully", ImagePath = imagePath });
            else
                return StatusCode(500, "Failed to update partner");
        }

        [HttpDelete("{id}")]
        public IActionResult DeletePartner(int id)
        {
            // Get image path first
            string getImageSql = "SELECT ImagePath FROM Partners WHERE Id = @Id";
            var partner = _dapper.LoadDataSingleOrDefault<Partner>(getImageSql, new { Id = id });

            if (partner == null)
                return NotFound($"Partner with ID {id} not found");

            // Delete from database
            string sql = "DELETE FROM Partners WHERE Id = @Id";
            bool result = _dapper.ExecuteSql(sql, new { Id = id });

            if (result)
            {
                // Delete image file from disk
                if (!string.IsNullOrEmpty(partner.ImagePath))
                {
                    var filePath = Path.Combine(_environment.WebRootPath, partner.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                return Ok(new { Message = "Partner deleted successfully" });
            }
            else
                return StatusCode(500, "Failed to delete partner");
        }

        [HttpPost("reorder")]
        public IActionResult ReorderPartners([FromBody] List<ReorderPartnerDto> reorderList)
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
                                UPDATE Partners
                                SET DisplayOrder = @DisplayOrder,
                                    UpdatedAt = GETDATE()
                                WHERE Id = @Id";

                            var parameters = new { item.Id, item.DisplayOrder };
                            _dapper.ExecuteSql(sql, parameters);
                        }
                        transaction.Commit();
                        return Ok(new { Message = "Partners reordered successfully" });
                    }
                    catch
                    {
                        transaction.Rollback();
                        return StatusCode(500, "Failed to reorder partners");
                    }
                }
            }
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadPartnerImage(IFormFile file, string type)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file uploaded" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed." });

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size too large. Maximum 5MB allowed." });

                var fileName = $"{type}_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "partners");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                var relativePath = $"/uploads/partners/{fileName}";

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
