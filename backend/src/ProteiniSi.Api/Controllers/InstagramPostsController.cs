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
    public class InstagramPostsController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _environment;

        public InstagramPostsController(IConfiguration config, IWebHostEnvironment environment)
        {
            _dapper = new DataContextDapper(config);
            _environment = environment;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetAllPosts()
        {
            string sql = @"
                SELECT Id, PostUrl, ImagePath, Description, LikeCount, 
                       PostedBy, PostedDate, CreatedAt
                FROM InstagramPosts
                WHERE IsActive = 1
                ORDER BY CreatedAt DESC";

            var posts = _dapper.LoadData<InstagramPostResponseDto>(sql);
            return Ok(posts);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public IActionResult GetPostById(int id)
        {
            string sql = @"
                SELECT Id, PostUrl, ImagePath, Description, LikeCount, 
                       PostedBy, PostedDate, CreatedAt
                FROM InstagramPosts
                WHERE Id = @Id AND IsActive = 1";

            var post = _dapper.LoadDataSingleOrDefault<InstagramPostResponseDto>(sql, new { Id = id });

            if (post == null)
                return NotFound($"Post with ID {id} not found");

            return Ok(post);
        }

        [HttpPost]
        public IActionResult CreatePost([FromBody] CreateInstagramPostDto newPost)
        {
            if (string.IsNullOrEmpty(newPost.PostUrl))
                return BadRequest("PostUrl is required");

            if (string.IsNullOrEmpty(newPost.ImagePath))
                return BadRequest("ImagePath is required");

            string sql = @"
                INSERT INTO InstagramPosts (PostUrl, ImagePath, Description, LikeCount, PostedBy, PostedDate, CreatedBy)
                VALUES (@PostUrl, @ImagePath, @Description, @LikeCount, @PostedBy, @PostedDate, @CreatedBy);
                SELECT CAST(SCOPE_IDENTITY() as int)";

            var parameters = new
            {
                newPost.PostUrl,
                newPost.ImagePath,
                newPost.Description,
                newPost.LikeCount,
                newPost.PostedBy,
                newPost.PostedDate,
                newPost.CreatedBy
            };

            int newId = _dapper.LoadDataSingle<int>(sql, parameters);

            return Ok(new { Id = newId, Message = "Post created successfully" });
        }

        [HttpPut]
        public IActionResult UpdatePost([FromBody] UpdateInstagramPostDto updatedPost)
        {
            // Check if post exists
            string checkSql = "SELECT Id FROM InstagramPosts WHERE Id = @Id AND IsActive = 1";
            var exists = _dapper.LoadDataSingleOrDefault<int?>(checkSql, new { updatedPost.Id });

            if (exists == null)
                return NotFound($"Post with ID {updatedPost.Id} not found");

            string sql = @"
                UPDATE InstagramPosts
                SET PostUrl = @PostUrl,
                    ImagePath = @ImagePath,
                    Description = @Description,
                    LikeCount = @LikeCount,
                    PostedBy = @PostedBy,
                    PostedDate = @PostedDate,
                    UpdatedAt = GETDATE(),
                    UpdatedBy = @UpdatedBy
                WHERE Id = @Id";

            var parameters = new
            {
                updatedPost.Id,
                updatedPost.PostUrl,
                updatedPost.ImagePath,
                updatedPost.Description,
                updatedPost.LikeCount,
                updatedPost.PostedBy,
                updatedPost.PostedDate,
                updatedPost.UpdatedBy
            };

            bool result = _dapper.ExecuteSql(sql, parameters);

            if (result)
                return Ok(new { Message = "Post updated successfully" });
            else
                return StatusCode(500, "Failed to update post");
        }

        [HttpDelete("{id}")]
        public IActionResult DeletePost(int id)
        {
            // Check if post exists and get image path to delete file
            string getImageSql = "SELECT ImagePath FROM InstagramPosts WHERE Id = @Id AND IsActive = 1";
            var post = _dapper.LoadDataSingleOrDefault<InstagramPostResponseDto>(getImageSql, new { Id = id });

            if (post == null)
                return NotFound($"Post with ID {id} not found");

            // Delete the image file from disk if it's a local file (not external URL)
            if (!string.IsNullOrEmpty(post.ImagePath) &&
                !post.ImagePath.StartsWith("http") &&
                post.ImagePath.StartsWith("/"))
            {
                var filePath = Path.Combine(_environment.WebRootPath, post.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            string sql = @"
                UPDATE InstagramPosts
                SET IsActive = 0, UpdatedAt = GETDATE()
                WHERE Id = @Id";

            bool result = _dapper.ExecuteSql(sql, new { Id = id });

            if (result)
                return Ok(new { Message = "Post deleted successfully" });
            else
                return StatusCode(500, "Failed to delete post");
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadInstagramImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed." });

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size too large. Maximum 5MB allowed." });

                // Generate unique filename
                var fileName = $"instagram_{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "instagram");

                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);
                var relativePath = $"/uploads/instagram/{fileName}";

                // Save file
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
