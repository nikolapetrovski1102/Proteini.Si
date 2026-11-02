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
    public class YouTubeVideosController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public YouTubeVideosController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAllVideos()
        {
            string sql = @"
                SELECT Id, VideoUrl, ThumbnailPath, Title, Description, 
                       ViewCount, LikeCount, DisplayOrder, IsActive, CreatedAt
                FROM YouTubeVideos
                WHERE IsActive = 1
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var videos = _dapper.LoadData<YouTubeVideoResponseDto>(sql);
            return Ok(videos);
        }

        [HttpGet("all")]
        public IActionResult GetAllVideosIncludingInactive()
        {
            string sql = @"
                SELECT Id, VideoUrl, ThumbnailPath, Title, Description, 
                       ViewCount, LikeCount, DisplayOrder, IsActive, CreatedAt
                FROM YouTubeVideos
                ORDER BY DisplayOrder ASC, CreatedAt DESC";

            var videos = _dapper.LoadData<YouTubeVideoResponseDto>(sql);
            return Ok(videos);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public IActionResult GetVideoById(int id)
        {
            string sql = @"
                SELECT Id, VideoUrl, ThumbnailPath, Title, Description, 
                       ViewCount, LikeCount, DisplayOrder, IsActive, CreatedAt
                FROM YouTubeVideos
                WHERE Id = @Id";

            var video = _dapper.LoadDataSingleOrDefault<YouTubeVideoResponseDto>(sql, new { Id = id });

            if (video == null)
                return NotFound($"Video with ID {id} not found");

            return Ok(video);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVideo([FromForm] CreateYouTubeVideoDto newVideo)
        {
            if (string.IsNullOrEmpty(newVideo.VideoUrl))
                return BadRequest("VideoUrl is required");

            if (string.IsNullOrEmpty(newVideo.Title))
                return BadRequest("Title is required");

            if (newVideo.Thumbnail == null || newVideo.Thumbnail.Length == 0)
                return BadRequest("Thumbnail image is required");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(newVideo.Thumbnail.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

            // Validate file size (max 5MB)
            if (newVideo.Thumbnail.Length > 5 * 1024 * 1024)
                return BadRequest("File size too large. Maximum 5MB allowed.");

            // Generate unique filename
            var fileName = $"youtube_{Guid.NewGuid()}{fileExtension}";
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "youtube");

            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);
            var relativePath = $"/uploads/youtube/{fileName}";

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await newVideo.Thumbnail.CopyToAsync(stream);
            }

            // Get the max display order
            string maxOrderSql = "SELECT ISNULL(MAX(DisplayOrder), -1) FROM YouTubeVideos";
            int maxOrder = _dapper.LoadDataSingle<int>(maxOrderSql);
            int displayOrder = newVideo.DisplayOrder > 0 ? newVideo.DisplayOrder : maxOrder + 1;

            // Save to database
            string sql = @"
                INSERT INTO YouTubeVideos (VideoUrl, ThumbnailPath, Title, Description, ViewCount, LikeCount, DisplayOrder, CreatedBy)
                VALUES (@VideoUrl, @ThumbnailPath, @Title, @Description, @ViewCount, @LikeCount, @DisplayOrder, @CreatedBy);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var parameters = new
            {
                newVideo.VideoUrl,
                ThumbnailPath = relativePath,
                newVideo.Title,
                newVideo.Description,
                newVideo.ViewCount,
                newVideo.LikeCount,
                DisplayOrder = displayOrder,
                newVideo.CreatedBy
            };

            int newId = _dapper.LoadDataSingle<int>(sql, parameters);

            return Ok(new { Id = newId, Message = "Video created successfully", ThumbnailPath = relativePath });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateVideo([FromForm] UpdateYouTubeVideoDto updatedVideo)
        {
            // Check if video exists
            string checkSql = "SELECT Id, ThumbnailPath FROM YouTubeVideos WHERE Id = @Id";
            var existingVideo = _dapper.LoadDataSingleOrDefault<YouTubeVideo>(checkSql, new { updatedVideo.Id });

            if (existingVideo == null)
                return NotFound($"Video with ID {updatedVideo.Id} not found");

            string thumbnailPath = existingVideo.ThumbnailPath;

            // If new thumbnail uploaded, replace old one
            if (updatedVideo.Thumbnail != null && updatedVideo.Thumbnail.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(updatedVideo.Thumbnail.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");

                // Validate file size (max 5MB)
                if (updatedVideo.Thumbnail.Length > 5 * 1024 * 1024)
                    return BadRequest("File size too large. Maximum 5MB allowed.");

                // Delete old thumbnail if exists
                if (!string.IsNullOrEmpty(existingVideo.ThumbnailPath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, existingVideo.ThumbnailPath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                // Generate new filename
                var fileName = $"youtube_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "youtube");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                thumbnailPath = $"/uploads/youtube/{fileName}";

                // Save new file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await updatedVideo.Thumbnail.CopyToAsync(stream);
                }
            }

            // Update database
            string sql = @"
                UPDATE YouTubeVideos
                SET VideoUrl = @VideoUrl,
                    ThumbnailPath = @ThumbnailPath,
                    Title = @Title,
                    Description = @Description,
                    ViewCount = @ViewCount,
                    LikeCount = @LikeCount,
                    DisplayOrder = @DisplayOrder,
                    UpdatedAt = GETDATE(),
                    UpdatedBy = @UpdatedBy
                WHERE Id = @Id";

            var parameters = new
            {
                updatedVideo.Id,
                updatedVideo.VideoUrl,
                ThumbnailPath = thumbnailPath,
                updatedVideo.Title,
                updatedVideo.Description,
                updatedVideo.ViewCount,
                updatedVideo.LikeCount,
                DisplayOrder = updatedVideo.DisplayOrder,
                updatedVideo.UpdatedBy
            };

            bool result = _dapper.ExecuteSql(sql, parameters);

            if (result)
                return Ok(new { Message = "Video updated successfully", ThumbnailPath = thumbnailPath });
            else
                return StatusCode(500, "Failed to update video");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteVideo(int id)
        {
            // Get thumbnail path first
            string getThumbnailSql = "SELECT ThumbnailPath FROM YouTubeVideos WHERE Id = @Id";
            var video = _dapper.LoadDataSingleOrDefault<YouTubeVideo>(getThumbnailSql, new { Id = id });

            if (video == null)
                return NotFound($"Video with ID {id} not found");

            // Soft delete from database
            string sql = @"
                UPDATE YouTubeVideos
                SET IsActive = 0, UpdatedAt = GETDATE()
                WHERE Id = @Id";

            bool result = _dapper.ExecuteSql(sql, new { Id = id });

            if (result)
            {
                // Delete thumbnail file from disk
                if (!string.IsNullOrEmpty(video.ThumbnailPath))
                {
                    var filePath = Path.Combine(_environment.WebRootPath, video.ThumbnailPath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }
                return Ok(new { Message = "Video deleted successfully" });
            }
            else
                return StatusCode(500, "Failed to delete video");
        }

        [HttpPost("reorder")]
        public IActionResult ReorderVideos([FromBody] List<ReorderYouTubeVideoDto> reorderList)
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
                                UPDATE YouTubeVideos
                                SET DisplayOrder = @DisplayOrder,
                                    UpdatedAt = GETDATE()
                                WHERE Id = @Id";

                            var parameters = new { item.Id, item.DisplayOrder };
                            _dapper.ExecuteSql(sql, parameters);
                        }
                        transaction.Commit();
                        return Ok(new { Message = "Videos reordered successfully" });
                    }
                    catch
                    {
                        transaction.Rollback();
                        return StatusCode(500, "Failed to reorder videos");
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

                var fileName = $"youtube_thumb_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "youtube");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                var relativePath = $"/uploads/youtube/{fileName}";

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
