using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Dtos.HomeSlider;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Classes;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Authorization;

namespace ProteiniSi.Api.Controllers
{
    [Route("api/admin/homeslider")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class AdminHomeSliderController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AdminHomeSliderController(IConfiguration config, IWebHostEnvironment webHostEnvironment)
        {
            _dapper = new DataContextDapper(config);
            _webHostEnvironment = webHostEnvironment;
        }

        // GET: api/admin/homeslider
        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetHomeSliders()
        {
            try
            {
                string sql = @"
                    SELECT Id, ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt, UpdatedAt
                    FROM HomeSliders
                    WHERE IsActive = 1
                    ORDER BY DisplayOrder ASC, Id ASC";

                var sliders = _dapper.LoadData<HomeSliderDto>(sql);
                return Ok(sliders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/homeslider/all (for admin panel - includes inactive)
        [HttpGet("all")]
        public IActionResult GetAllHomeSliders()
        {
            try
            {
                string sql = @"
                    SELECT Id, ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt, UpdatedAt
                    FROM HomeSliders
                    ORDER BY DisplayOrder ASC, Id ASC";

                var sliders = _dapper.LoadData<HomeSliderDto>(sql);
                return Ok(sliders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/homeslider/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadHomeSlider([FromForm] CreateHomeSliderDto model)
        {
            try
            {
                if (model.Image == null || model.Image.Length == 0)
                    return BadRequest(new { error = "Desktop image is required" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

                // Upload desktop image
                string desktopImagePath = await SaveImage(model.Image, "home-slider", "desktop");

                // Upload mobile image (optional)
                string mobileImagePath = null;
                if (model.MobileImage != null && model.MobileImage.Length > 0)
                {
                    mobileImagePath = await SaveImage(model.MobileImage, "home-slider", "mobile");
                }

                // Get current max display order
                string getMaxOrderSql = "SELECT ISNULL(MAX(DisplayOrder), -1) FROM HomeSliders";
                int maxOrder = _dapper.LoadDataSingle<int>(getMaxOrderSql);
                int newDisplayOrder = maxOrder + 1;

                string insertSql = @"
                    INSERT INTO HomeSliders (ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
                    VALUES (@ImageUrl, @MobileImageUrl, @ClickUrl, @Title, @DisplayOrder, 1, GETDATE(), GETDATE());
                    SELECT CAST(SCOPE_IDENTITY() AS int);";

                var sliderId = _dapper.LoadDataSingle<int>(insertSql, new
                {
                    ImageUrl = desktopImagePath,
                    MobileImageUrl = mobileImagePath,
                    ClickUrl = model.ClickUrl,
                    Title = model.Title,
                    DisplayOrder = newDisplayOrder
                });

                return Ok(new
                {
                    status = true,
                    sliderId = sliderId,
                    imagePath = desktopImagePath,
                    mobileImagePath = mobileImagePath,
                    displayOrder = newDisplayOrder
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private async Task<string> SaveImage(IFormFile image, string folder, string prefix)
        {
            var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, folder);
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{prefix}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/{folder}/{uniqueFileName}";
        }

        // PUT: api/admin/homeslider/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateHomeSlider(int id, [FromBody] UpdateHomeSliderDto model)
        {
            try
            {
                string checkSql = "SELECT COUNT(1) FROM HomeSliders WHERE Id = @Id";
                var exists = _dapper.LoadDataSingle<int>(checkSql, new { Id = id });

                if (exists == 0)
                    return NotFound(new { error = "Home slider not found" });

                string updateSql = @"
                    UPDATE HomeSliders 
                    SET ClickUrl = @ClickUrl, 
                        Title = @Title, 
                        IsActive = @IsActive,
                        UpdatedAt = GETDATE()
                    WHERE Id = @Id";

                var result = _dapper.ExecuteSql(updateSql, new
                {
                    Id = id,
                    ClickUrl = model.ClickUrl,
                    Title = model.Title,
                    IsActive = model.IsActive
                });

                if (result)
                    return Ok(new { status = true, message = "Home slider updated successfully" });
                else
                    return BadRequest(new { error = "Failed to update home slider" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/homeslider/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteHomeSlider(int id)
        {
            try
            {
                string getImageSql = "SELECT ImageUrl, MobileImageUrl FROM HomeSliders WHERE Id = @Id";
                var images = _dapper.LoadDataSingleOrDefault<dynamic>(getImageSql, new { Id = id });

                if (images == null)
                    return NotFound(new { error = "Home slider not found" });

                string deleteSql = "DELETE FROM HomeSliders WHERE Id = @Id";
                var result = _dapper.ExecuteSql(deleteSql, new { Id = id });

                if (result)
                {
                    // Delete the physical image files
                    DeleteOldImage(images.ImageUrl);
                    if (!string.IsNullOrEmpty(images.MobileImageUrl))
                        DeleteOldImage(images.MobileImageUrl);

                    // Reorder remaining items
                    ReorderDisplayOrders();

                    return Ok(new { status = true, message = "Home slider deleted successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to delete home slider" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PATCH: api/admin/homeslider/reorder
        [HttpPatch("reorder")]
        public IActionResult ReorderSliders([FromBody] List<ReorderHomeSliderDto> reorderList)
        {
            try
            {
                if (reorderList == null || reorderList.Count == 0)
                    return BadRequest(new { error = "Invalid reorder data" });

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
                                    UPDATE HomeSliders 
                                    SET DisplayOrder = @DisplayOrder,
                                        UpdatedAt = GETDATE()
                                    WHERE Id = @Id";

                                var rowsAffected = connection.Execute(sql, new { item.Id, item.DisplayOrder }, transaction);

                                if (rowsAffected == 0)
                                    throw new Exception($"Slider with Id {item.Id} not found");
                            }

                            transaction.Commit();
                            return Ok(new { status = true, message = "Sliders reordered successfully" });
                        }
                        catch (Exception ex)
                        {
                            transaction.Rollback();
                            return StatusCode(500, new { error = ex.Message });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        private void DeleteOldImage(string imagePath)
        {
            try
            {
                if (string.IsNullOrEmpty(imagePath))
                    return;

                var relativePath = imagePath.TrimStart('/');
                var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, relativePath);

                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }
            catch (Exception ex)
            {
                ErrorLogger.ErrorLog($"Error deleting image: {ex.Message}");
            }
        }

        private void ReorderDisplayOrders()
        {
            try
            {
                string sql = @"
                    WITH Ordered AS (
                        SELECT Id, ROW_NUMBER() OVER (ORDER BY DisplayOrder ASC, Id ASC) - 1 AS NewOrder
                        FROM HomeSliders
                    )
                    UPDATE hs
                    SET DisplayOrder = Ordered.NewOrder
                    FROM HomeSliders hs
                    INNER JOIN Ordered ON hs.Id = Ordered.Id";

                _dapper.ExecuteSql(sql);
            }
            catch (Exception ex)
            {
                ErrorLogger.ErrorLog($"Error reordering display orders: {ex.Message}");
            }
        }
    }
}
