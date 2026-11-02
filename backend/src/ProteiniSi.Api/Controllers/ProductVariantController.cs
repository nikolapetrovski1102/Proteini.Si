using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.DTOs;
using ProteiniSi.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProteiniSi.Api.Controllers
{
    [Authorize(Policy = "SuperAdmin")]
    [Route("api/admin/[controller]")]
    [ApiController]
    public class ProductVariantController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProductVariantController(IConfiguration config, IWebHostEnvironment webHostEnvironment)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
            _webHostEnvironment = webHostEnvironment;
        }

        private void DeleteOldImage(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return;

            try
            {
                var relativePath = imagePath.TrimStart('/');
                var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, relativePath);

                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                    Console.WriteLine($"Deleted image: {fullPath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting image: {ex.Message}");
            }
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            return isAdminClaim == "True" || isAdminClaim == "true";
        }

        private static string NormalizeOptionType(string? optionType)
        {
            return string.Equals(optionType?.Trim(), "color", StringComparison.OrdinalIgnoreCase)
                ? "color"
                : "flavor";
        }

        private void UpdatePackagingWeight(int packagingId, decimal? weightGrams)
        {
            if (!weightGrams.HasValue)
                return;

            decimal? normalizedWeight = weightGrams.Value > 0 ? weightGrams.Value : null;
            string updateSql = @"
                UPDATE Packaging
                SET Weight_Grams = @Weight_Grams
                WHERE Packaging_Id = @Packaging_Id";

            _dapper.ExecuteSql(updateSql, new
            {
                Packaging_Id = packagingId,
                Weight_Grams = normalizedWeight
            });
        }

        private int? ResolvePackagingId(int? packagingId, string? packagingName, decimal? weightGrams)
        {
            if (packagingId.HasValue && packagingId.Value > 0)
            {
                UpdatePackagingWeight(packagingId.Value, weightGrams);
                return packagingId.Value;
            }

            if (string.IsNullOrWhiteSpace(packagingName))
                return null;

            var trimmedName = packagingName.Trim();
            string findSql = @"
                SELECT TOP 1 Packaging_Id
                FROM Packaging
                WHERE LOWER(Packaging_Name) = LOWER(@Packaging_Name)
                  AND IsActive = 1";

            var existingPackagingId = _dapper.LoadDataSingleOrDefault<int?>(findSql, new { Packaging_Name = trimmedName });
            if (existingPackagingId.HasValue)
            {
                UpdatePackagingWeight(existingPackagingId.Value, weightGrams);
                return existingPackagingId.Value;
            }

            string displayOrderSql = "SELECT ISNULL(MAX(Display_Order), -1) + 1 FROM Packaging";
            var displayOrder = _dapper.LoadDataSingle<int>(displayOrderSql);

            string insertSql = @"
                INSERT INTO Packaging (Packaging_Name, Weight_Grams, Display_Order, IsActive, Created_At)
                VALUES (@Packaging_Name, @Weight_Grams, @Display_Order, 1, GETDATE());
                SELECT CAST(SCOPE_IDENTITY() AS int);";

            return _dapper.LoadDataSingle<int>(insertSql, new
            {
                Packaging_Name = trimmedName,
                Weight_Grams = weightGrams.HasValue && weightGrams.Value > 0 ? weightGrams : null,
                Display_Order = displayOrder
            });
        }

        // GET: api/admin/ProductVariant/product/{productId}
        [AllowAnonymous]
        [HttpGet("product/{productId}")]
        public IActionResult GetVariantsByProduct(int productId)
        {
            try
            {
                string sql = @"
                    SELECT 
                        pv.*,
                        f.Flavor_Name as Flavor_Name,
                        pkg.Packaging_Name as Packaging_Name,
                        pkg.Packaging_Type as Packaging_Type,
                        pkg.Weight_Grams as Weight_Grams
                    FROM ProductVariants pv
                    LEFT JOIN Flavors f ON pv.Flavor_Id = f.Flavor_Id
                    LEFT JOIN Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
                    WHERE pv.Product_Id = @Product_Id AND pv.IsActive = 1
                    ORDER BY
                        CASE WHEN pkg.Weight_Grams IS NULL THEN 1 ELSE 0 END,
                        pkg.Weight_Grams ASC,
                        pv.Display_Order ASC,
                        pv.Variant_Id ASC";

                var variants = _dapper.LoadData<ProductVariantDto>(sql, new { Product_Id = productId });
                return Ok(new { status = true, data = variants });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/ProductVariant/{id}
        [HttpGet("{id}")]
        public IActionResult GetVariantById(int id)
        {
            try
            {
                string sql = @"
                    SELECT 
                        pv.*,
                        f.Flavor_Name as Flavor_Name,
                        pkg.Packaging_Name as Packaging_Name,
                        pkg.Packaging_Type as Packaging_Type,
                        pkg.Weight_Grams as Weight_Grams
                    FROM ProductVariants pv
                    LEFT JOIN Flavors f ON pv.Flavor_Id = f.Flavor_Id
                    LEFT JOIN Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
                    WHERE pv.Variant_Id = @Id AND pv.IsActive = 1";

                var variant = _dapper.LoadDataSingleOrDefault<ProductVariantDto>(sql, new { Id = id });

                if (variant == null)
                    return NotFound(new { message = "Variant not found" });

                return Ok(new { status = true, data = variant });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/ProductVariant
        [HttpPost]
        public IActionResult CreateVariant([FromBody] CreateProductVariantDto createDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string checkProductSql = "SELECT COUNT(1) FROM Products WHERE Product_Id = @Product_Id";
                var productExists = _dapper.LoadDataSingle<int>(checkProductSql, new { Product_Id = createDto.Product_Id });

                if (productExists == 0)
                    return BadRequest(new { message = "Product not found" });

                string sku = createDto.SKU;
                if (string.IsNullOrEmpty(sku))
                {
                    sku = $"VAR-{createDto.Product_Id}-{DateTime.Now.Ticks}";
                }

                var packagingId = ResolvePackagingId(createDto.Packaging_Id, createDto.Packaging_Name, createDto.Weight_Grams);

                string sql = @"
                INSERT INTO ProductVariants (
                    Product_Id, SKU, Flavor_Id, Flavor_Name, Packaging_Id, Packaging_Name, 
                    Price, DDV_Percentage, Compare_Price,
                    Quantity, Low_Stock_Threshold, Variant_Name, Option_Type, Variant_Image_Path, Ingredients,
                    Nutrition_Info, Description, Display_Order, IsActive, IsDefault,
                    LoyaltyPercentage, Created_At, Updated_At
                ) VALUES (
                    @Product_Id, @SKU, @Flavor_Id, @Flavor_Name, @Packaging_Id, @Packaging_Name,
                    @Price, @DDV_Percentage, @Compare_Price,
                    @Quantity, @Low_Stock_Threshold, @Variant_Name, @Option_Type, @Variant_Image_Path, @Ingredients,
                    @Nutrition_Info, @Description, @Display_Order, 1, @IsDefault,
                    @LoyaltyPercentage, GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() AS int);";

                var variantId = _dapper.LoadDataSingle<int>(sql, new
                {
                    Product_Id = createDto.Product_Id,
                    SKU = sku,
                    Flavor_Id = createDto.Flavor_Id,
                    Flavor_Name = createDto.Flavor_Name,
                    Packaging_Id = packagingId,
                    Packaging_Name = createDto.Packaging_Name,
                    Price = createDto.Price,
                    DDV_Percentage = createDto.DDV_Percentage,
                    Compare_Price = createDto.Compare_Price,
                    Quantity = createDto.Quantity,
                    Low_Stock_Threshold = createDto.Low_Stock_Threshold,
                    Variant_Name = createDto.Variant_Name,
                    Option_Type = NormalizeOptionType(createDto.Option_Type),
                    Variant_Image_Path = createDto.Variant_Image_Path,
                    Ingredients = createDto.Ingredients,
                    Nutrition_Info = createDto.Nutrition_Info,
                    Description = createDto.Description,
                    Display_Order = createDto.Display_Order,
                    IsDefault = createDto.IsDefault,
                    LoyaltyPercentage = createDto.LoyaltyPercentage ?? 2.0m
                });

                if (createDto.IsDefault)
                {
                    string updateProductSql = "UPDATE Products SET Default_Variant_Id = @VariantId WHERE Product_Id = @Product_Id";
                    _dapper.ExecuteSql(updateProductSql, new { VariantId = variantId, Product_Id = createDto.Product_Id });
                }

                string updateHasVariantsSql = "UPDATE Products SET HasVariants = 1 WHERE Product_Id = @Product_Id";
                _dapper.ExecuteSql(updateHasVariantsSql, new { Product_Id = createDto.Product_Id });

                return Ok(new { status = true, message = "Variant created successfully", variantId = variantId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/ProductVariant
        [HttpPut]
        public IActionResult UpdateVariant([FromBody] UpdateProductVariantDto updateDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                var packagingId = ResolvePackagingId(updateDto.Packaging_Id, updateDto.Packaging_Name, updateDto.Weight_Grams);

                string sql = @"
                UPDATE ProductVariants 
                SET SKU = @SKU,
                    Flavor_Id = @Flavor_Id,
                    Flavor_Name = @Flavor_Name,
                    Packaging_Id = @Packaging_Id,
                    Packaging_Name = @Packaging_Name,
                    Price = @Price,
                    DDV_Percentage = @DDV_Percentage,
                    Compare_Price = @Compare_Price,
                    Quantity = @Quantity,
                    Low_Stock_Threshold = @Low_Stock_Threshold,
                    Variant_Name = @Variant_Name,
                    Option_Type = @Option_Type,
                    Variant_Image_Path = @Variant_Image_Path,
                    Ingredients = @Ingredients,
                    Nutrition_Info = @Nutrition_Info,
                    Description = @Description,
                    Display_Order = @Display_Order,
                    IsActive = @IsActive,
                    IsDefault = @IsDefault,
                    LoyaltyPercentage = @LoyaltyPercentage,
                    Updated_At = GETDATE()
                WHERE Variant_Id = @Variant_Id";

                var rowsAffected = _dapper.ExecuteSqlWithRowCount(sql, new
                {
                    Variant_Id = updateDto.Variant_Id,
                    SKU = updateDto.SKU,
                    Flavor_Id = updateDto.Flavor_Id,
                    Flavor_Name = updateDto.Flavor_Name,
                    Packaging_Id = packagingId,
                    Packaging_Name = updateDto.Packaging_Name,
                    Price = updateDto.Price,
                    DDV_Percentage = updateDto.DDV_Percentage,
                    Compare_Price = updateDto.Compare_Price,
                    Quantity = updateDto.Quantity,
                    Low_Stock_Threshold = updateDto.Low_Stock_Threshold,
                    Variant_Name = updateDto.Variant_Name,
                    Option_Type = NormalizeOptionType(updateDto.Option_Type),
                    Variant_Image_Path = updateDto.Variant_Image_Path,
                    Ingredients = updateDto.Ingredients,
                    Nutrition_Info = updateDto.Nutrition_Info,
                    Description = updateDto.Description,
                    Display_Order = updateDto.Display_Order,
                    IsActive = updateDto.IsActive,
                    IsDefault = updateDto.IsDefault,
                    LoyaltyPercentage = updateDto.LoyaltyPercentage ?? 2.0m
                });

                if (rowsAffected == 0)
                    return NotFound(new { message = "Variant not found" });

                string getProductSql = "SELECT Product_Id FROM ProductVariants WHERE Variant_Id = @Variant_Id";
                var productId = _dapper.LoadDataSingle<int>(getProductSql, new { Variant_Id = updateDto.Variant_Id });

                if (updateDto.IsDefault)
                {
                    string resetDefaultSql = "UPDATE ProductVariants SET IsDefault = 0 WHERE Product_Id = @Product_Id AND Variant_Id != @VariantId";
                    _dapper.ExecuteSql(resetDefaultSql, new { Product_Id = productId, VariantId = updateDto.Variant_Id });

                    string updateProductSql = "UPDATE Products SET Default_Variant_Id = @VariantId WHERE Product_Id = @Product_Id";
                    _dapper.ExecuteSql(updateProductSql, new { VariantId = updateDto.Variant_Id, Product_Id = productId });
                }

                return Ok(new { status = true, message = "Variant updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateVariant: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/ProductVariant/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteVariant(int id)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string getInfoSql = "SELECT Product_Id, IsDefault, Variant_Image_Path FROM ProductVariants WHERE Variant_Id = @Id";
                var variant = _dapper.LoadDataSingleOrDefault<dynamic>(getInfoSql, new { Id = id });

                if (variant == null)
                    return NotFound(new { message = "Variant not found" });

                if (!string.IsNullOrEmpty(variant.Variant_Image_Path))
                {
                    DeleteOldImage(variant.Variant_Image_Path);
                }

                string sql = "UPDATE ProductVariants SET IsActive = 0 WHERE Variant_Id = @Id";
                _dapper.ExecuteSql(sql, new { Id = id });

                string checkOtherVariantsSql = "SELECT COUNT(1) FROM ProductVariants WHERE Product_Id = @Product_Id AND IsActive = 1";
                var otherVariantsCount = _dapper.LoadDataSingle<int>(checkOtherVariantsSql, new { Product_Id = variant.Product_Id });

                if (otherVariantsCount == 0)
                {
                    string updateProductSql = "UPDATE Products SET HasVariants = 0, Default_Variant_Id = NULL WHERE Product_Id = @Product_Id";
                    _dapper.ExecuteSql(updateProductSql, new { Product_Id = variant.Product_Id });
                }
                else if (variant.IsDefault == true)
                {
                    string setNewDefaultSql = @"
                        UPDATE TOP (1) ProductVariants 
                        SET IsDefault = 1 
                        WHERE Product_Id = @Product_Id AND IsActive = 1 AND Variant_Id != @VariantId";
                    _dapper.ExecuteSql(setNewDefaultSql, new { Product_Id = variant.Product_Id, VariantId = id });
                }

                return Ok(new { status = true, message = "Variant deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/ProductVariant/upload-image
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadVariantImage([FromForm] IFormFile Image, [FromForm] int? Variant_Id)
        {
            try
            {
                if (Image == null || Image.Length == 0)
                    return BadRequest(new { error = "No image file provided" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var fileExtension = Path.GetExtension(Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and WEBP are allowed." });

                if (Image.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size must be less than 5MB" });

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "variant-images");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"variant_{Variant_Id ?? 0}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await Image.CopyToAsync(stream);
                }

                string dbPath = $"/variant-images/{uniqueFileName}";

                return Ok(new { status = true, imagePath = dbPath, message = "Image uploaded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/ProductVariant/{variantId}/gallery
        [AllowAnonymous]
        [HttpGet("{variantId}/gallery")]
        public IActionResult GetVariantGallery(int variantId)
        {
            try
            {
                string sql = @"
                    SELECT Gallery_Id, Variant_Id, Image_Path, Display_Order, IsMain, Created_At
                    FROM VariantGallery
                    WHERE Variant_Id = @Variant_Id
                    ORDER BY IsMain DESC, Display_Order ASC, Gallery_Id ASC";

                var gallery = _dapper.LoadData<VariantGalleryDto>(sql, new { Variant_Id = variantId });
                return Ok(gallery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/ProductVariant/gallery/upload
        [HttpPost("gallery/upload")]
        public async Task<IActionResult> UploadVariantGalleryImage([FromForm] IFormFile Image, [FromForm] int Variant_Id)
        {
            try
            {
                if (Image == null || Image.Length == 0)
                    return BadRequest(new { error = "No image file provided" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var fileExtension = Path.GetExtension(Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and WEBP are allowed." });

                if (Image.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size must be less than 5MB" });

                string checkVariantSql = "SELECT COUNT(1) FROM ProductVariants WHERE Variant_Id = @Variant_Id AND IsActive = 1";
                var variantExists = _dapper.LoadDataSingle<int>(checkVariantSql, new { Variant_Id = Variant_Id });

                if (variantExists == 0)
                    return NotFound(new { error = "Variant not found" });

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "variant-gallery");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"variant_{Variant_Id}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await Image.CopyToAsync(stream);
                }

                string dbPath = $"/variant-gallery/{uniqueFileName}";

                string checkFirstSql = "SELECT COUNT(1) FROM VariantGallery WHERE Variant_Id = @Variant_Id";
                var imageCount = _dapper.LoadDataSingle<int>(checkFirstSql, new { Variant_Id = Variant_Id });
                bool isMain = imageCount == 0;

                string insertSql = @"
                    INSERT INTO VariantGallery (Variant_Id, Image_Path, Display_Order, IsMain, Created_At)
                    VALUES (@Variant_Id, @Image_Path, @Display_Order, @IsMain, GETDATE());
                    SELECT CAST(SCOPE_IDENTITY() AS int);";

                var galleryId = _dapper.LoadDataSingle<int>(insertSql, new
                {
                    Variant_Id = Variant_Id,
                    Image_Path = dbPath,
                    Display_Order = imageCount,
                    IsMain = isMain
                });

                return Ok(new { status = true, galleryId = galleryId, imagePath = dbPath, isMain = isMain });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/ProductVariant/gallery/{galleryId}
        [HttpDelete("gallery/{galleryId}")]
        public IActionResult DeleteVariantGalleryImage(int galleryId)
        {
            try
            {
                string getImageSql = "SELECT Image_Path, Variant_Id, IsMain FROM VariantGallery WHERE Gallery_Id = @Gallery_Id";
                var image = _dapper.LoadDataSingleOrDefault<dynamic>(getImageSql, new { Gallery_Id = galleryId });

                if (image == null)
                    return NotFound(new { error = "Gallery image not found" });

                bool wasMain = image.IsMain;
                int variantId = image.Variant_Id;

                string deleteSql = "DELETE FROM VariantGallery WHERE Gallery_Id = @Gallery_Id";
                _dapper.ExecuteSql(deleteSql, new { Gallery_Id = galleryId });

                DeleteOldImage(image.Image_Path);

                if (wasMain)
                {
                    string setNewMainSql = @"
                        UPDATE TOP (1) VariantGallery 
                        SET IsMain = 1 
                        WHERE Variant_Id = @Variant_Id";
                    _dapper.ExecuteSql(setNewMainSql, new { Variant_Id = variantId });
                }

                return Ok(new { status = true, message = "Gallery image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/ProductVariant/gallery/set-main
        [HttpPut("gallery/set-main")]
        public IActionResult SetMainVariantGalleryImage([FromBody] SetMainVariantGalleryImageDto dto)
        {
            try
            {
                string resetMainSql = "UPDATE VariantGallery SET IsMain = 0 WHERE Variant_Id = @Variant_Id";
                _dapper.ExecuteSql(resetMainSql, new { Variant_Id = dto.Variant_Id });

                string setMainSql = "UPDATE VariantGallery SET IsMain = 1 WHERE Gallery_Id = @Gallery_Id";
                _dapper.ExecuteSql(setMainSql, new { Gallery_Id = dto.Gallery_Id });

                return Ok(new { status = true, message = "Main image updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/ProductVariant/{variantId}/nutrition
        [HttpGet("{variantId}/nutrition")]
        public IActionResult GetVariantNutrition(int variantId)
        {
            try
            {
                string checkVariantSql = "SELECT COUNT(1) FROM ProductVariants WHERE Variant_Id = @Variant_Id AND IsActive = 1";
                var variantExists = _dapper.LoadDataSingle<int>(checkVariantSql, new { Variant_Id = variantId });

                if (variantExists == 0)
                    return NotFound(new { error = "Variant not found" });

                string columnsSql = @"
                    SELECT Column_Id, Variant_Id, Column_Name, Display_Order, Is_First_Column, Created_At, Updated_At
                    FROM VariantNutritionColumns 
                    WHERE Variant_Id = @Variant_Id 
                    ORDER BY Display_Order";

                var columns = _dapper.LoadData<VariantNutritionColumn>(columnsSql, new { Variant_Id = variantId }).ToList();

                string rowsSql = @"
                    SELECT Row_Id, Variant_Id, Row_Name, Display_Order, Created_At, Updated_At
                    FROM VariantNutritionRows 
                    WHERE Variant_Id = @Variant_Id 
                    ORDER BY Display_Order";

                var rows = _dapper.LoadData<VariantNutritionRow>(rowsSql, new { Variant_Id = variantId }).ToList();

                if (!columns.Any() || !rows.Any())
                {
                    return Ok(new { columns = new List<object>(), rows = new List<object>() });
                }

                string valuesSql = @"
                    SELECT vnv.Value_Id, vnv.Row_Id, vnv.Column_Id, vnv.Cell_Value, vnv.Created_At, vnv.Updated_At
                    FROM VariantNutritionValues vnv
                    WHERE EXISTS (SELECT 1 FROM VariantNutritionRows vnr WHERE vnr.Row_Id = vnv.Row_Id AND vnr.Variant_Id = @Variant_Id)
                    AND EXISTS (SELECT 1 FROM VariantNutritionColumns vnc WHERE vnc.Column_Id = vnv.Column_Id AND vnc.Variant_Id = @Variant_Id)";

                var values = _dapper.LoadData<VariantNutritionValue>(valuesSql, new { Variant_Id = variantId }).ToList();

                var result = new
                {
                    columns = columns.Select(c => new
                    {
                        c.Column_Id,
                        c.Column_Name,
                        c.Display_Order,
                        c.Is_First_Column
                    }),
                    rows = rows.Select(r => new
                    {
                        r.Row_Id,
                        r.Row_Name,
                        r.Display_Order,
                        values = values.Where(v => v.Row_Id == r.Row_Id).ToDictionary(
                            v => columns.FirstOrDefault(c => c.Column_Id == v.Column_Id)?.Column_Name ?? "unknown",
                            v => v.Cell_Value
                        )
                    })
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetVariantNutrition: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/ProductVariant/{variantId}/nutrition
        [HttpPost("{variantId}/nutrition")]
        public IActionResult SaveVariantNutrition(int variantId, [FromBody] VariantNutritionDto nutritionData)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string checkVariantSql = "SELECT COUNT(1) FROM ProductVariants WHERE Variant_Id = @Variant_Id";
                var variantExists = _dapper.LoadDataSingle<int>(checkVariantSql, new { Variant_Id = variantId });

                if (variantExists == 0)
                    return NotFound(new { error = "Variant not found" });

                _dapper.ExecuteSql("DELETE FROM VariantNutritionValues WHERE Row_Id IN (SELECT Row_Id FROM VariantNutritionRows WHERE Variant_Id = @Variant_Id)", new { Variant_Id = variantId });
                _dapper.ExecuteSql("DELETE FROM VariantNutritionRows WHERE Variant_Id = @Variant_Id", new { Variant_Id = variantId });
                _dapper.ExecuteSql("DELETE FROM VariantNutritionColumns WHERE Variant_Id = @Variant_Id", new { Variant_Id = variantId });

                foreach (var column in nutritionData.Columns)
                {
                    string insertColumnSql = @"
                        INSERT INTO VariantNutritionColumns (Variant_Id, Column_Name, Display_Order, Is_First_Column, Created_At, Updated_At)
                        VALUES (@Variant_Id, @Column_Name, @Display_Order, @Is_First_Column, GETDATE(), GETDATE());
                        SELECT CAST(SCOPE_IDENTITY() AS int);";

                    var columnId = _dapper.LoadDataSingle<int>(insertColumnSql, new
                    {
                        Variant_Id = variantId,
                        Column_Name = column.Column_Name ?? "Unknown",
                        Display_Order = column.Display_Order,
                        Is_First_Column = column.Is_First_Column
                    });

                    column.Column_Id = columnId;
                }

                foreach (var row in nutritionData.Rows)
                {
                    string insertRowSql = @"
                        INSERT INTO VariantNutritionRows (Variant_Id, Row_Name, Display_Order, Created_At, Updated_At)
                        VALUES (@Variant_Id, @Row_Name, @Display_Order, GETDATE(), GETDATE());
                        SELECT CAST(SCOPE_IDENTITY() AS int);";

                    var rowId = _dapper.LoadDataSingle<int>(insertRowSql, new
                    {
                        Variant_Id = variantId,
                        Row_Name = row.Row_Name ?? "Unknown",
                        Display_Order = row.Display_Order
                    });

                    foreach (var column in nutritionData.Columns)
                    {
                        var cellValue = row.Values != null && row.Values.ContainsKey(column.Column_Name)
                            ? row.Values[column.Column_Name]
                            : "";

                        string insertValueSql = @"
                            INSERT INTO VariantNutritionValues (Row_Id, Column_Id, Cell_Value, Created_At, Updated_At)
                            VALUES (@Row_Id, @Column_Id, @Cell_Value, GETDATE(), GETDATE())";

                        _dapper.ExecuteSql(insertValueSql, new
                        {
                            Row_Id = rowId,
                            Column_Id = column.Column_Id,
                            Cell_Value = cellValue ?? ""
                        });
                    }
                }

                return Ok(new { status = true, message = "Nutrition data saved successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveVariantNutrition: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/ProductVariant/{variantId}/nutrition
        [HttpDelete("{variantId}/nutrition")]
        public IActionResult DeleteVariantNutrition(int variantId)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                _dapper.ExecuteSql("DELETE FROM VariantNutritionValues WHERE Row_Id IN (SELECT Row_Id FROM VariantNutritionRows WHERE Variant_Id = @Variant_Id)", new { Variant_Id = variantId });
                _dapper.ExecuteSql("DELETE FROM VariantNutritionRows WHERE Variant_Id = @Variant_Id", new { Variant_Id = variantId });
                _dapper.ExecuteSql("DELETE FROM VariantNutritionColumns WHERE Variant_Id = @Variant_Id", new { Variant_Id = variantId });

                return Ok(new { status = true, message = "Nutrition data deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("{variantId}/nutrition-table/paste")]
        public IActionResult PasteNutritionTable(int variantId, [FromBody] PasteNutritionTableDto pasteDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Check if variant exists
                string checkSql = "SELECT COUNT(1) FROM ProductVariants WHERE Variant_Id = @Variant_Id AND IsActive = 1";
                var exists = _dapper.LoadDataSingle<int>(checkSql, new { Variant_Id = variantId });

                if (exists == 0)
                    return NotFound(new { error = "Variant not found" });

                // Parse the pasted text
                var parser = new TableParserService();
                var (columns, rows) = parser.ParsePastedText(pasteDto.RawText);

                if (columns == null || columns.Count == 0)
                    return BadRequest(new { error = "Could not detect table structure" });

                // Create clean JSON
                var tableData = new
                {
                    columns = columns,
                    rows = rows.Select(r => new
                    {
                        r.RowLabel,
                        r.Cells,
                        r.IndentLevel
                    })
                };

                var fullTableJson = Newtonsoft.Json.JsonConvert.SerializeObject(tableData);
                var columnsJson = Newtonsoft.Json.JsonConvert.SerializeObject(columns);
                var rowsJson = Newtonsoft.Json.JsonConvert.SerializeObject(rows.Select(r => new
                {
                    r.RowLabel,
                    r.Cells,
                    r.IndentLevel
                }));

                // METHOD 1: Direct SQL (most reliable)
                var safeFullJson = fullTableJson.Replace("'", "''");
                var safeColumnsJson = columnsJson.Replace("'", "''");
                var safeRowsJson = rowsJson.Replace("'", "''");

                string updateSql = $@"
            UPDATE ProductVariants 
            SET Nutrition_Table_Json = N'{safeFullJson}',
                Nutrition_Table_Columns = N'{safeColumnsJson}',
                Nutrition_Table_Rows = N'{safeRowsJson}',
                Updated_At = GETDATE()
            WHERE Variant_Id = {variantId}";

                // Use raw connection
                using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                {
                    connection.Open();
                    using (var command = new SqlCommand(updateSql, connection))
                    {
                        var result = command.ExecuteNonQuery();

                        if (result > 0)
                        {
                            return Ok(new
                            {
                                status = true,
                                message = "Nutrition table saved successfully",
                                data = tableData
                            });
                        }
                    }
                }

                return StatusCode(500, new { error = "Failed to save nutrition table" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("{variantId}/nutrition-table")]
        public IActionResult GetNutritionTable(int variantId)
        {
            try
            {
                using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                {
                    connection.Open();
                    string sql = @"
                SELECT Nutrition_Table_Json
                FROM ProductVariants 
                WHERE Variant_Id = @Variant_Id AND IsActive = 1";

                    using (var command = new SqlCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@Variant_Id", variantId);
                        object result = command.ExecuteScalar();

                        if (result != null && result != DBNull.Value)
                        {
                            string jsonString = result.ToString();
                            if (!string.IsNullOrEmpty(jsonString))
                            {
                                // Deserialize to a proper JObject
                                var jsonObject = Newtonsoft.Json.Linq.JObject.Parse(jsonString);

                                // Extract columns - JArray to List<string>
                                var columns = jsonObject["columns"]?.ToObject<List<string>>() ?? new List<string>();

                                // Extract rows
                                var rowsArray = jsonObject["rows"] as Newtonsoft.Json.Linq.JArray;
                                var rows = new List<object>();

                                if (rowsArray != null)
                                {
                                    foreach (var row in rowsArray)
                                    {
                                        rows.Add(new
                                        {
                                            rowLabel = row["RowLabel"]?.ToString() ?? "",
                                            cells = row["Cells"]?.ToObject<List<string>>() ?? new List<string>(),
                                            indentLevel = row["IndentLevel"]?.ToObject<int>() ?? 0
                                        });
                                    }
                                }

                                var transformedData = new
                                {
                                    columns = columns,
                                    rows = rows
                                };

                                return Ok(new { status = true, data = transformedData });
                            }
                        }
                    }
                }

                return Ok(new { status = true, data = (object)null });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/ProductVariant/{variantId}/nutrition-table
        [HttpPut("{variantId}/nutrition-table")]
        public IActionResult UpdateNutritionTable(int variantId, [FromBody] UpdateNutritionTableDto updateDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Serialize to JSON
                var columnsJson = JsonConvert.SerializeObject(updateDto.Columns);
                var rowsJson = JsonConvert.SerializeObject(updateDto.Rows);
                var fullTableJson = JsonConvert.SerializeObject(new
                {
                    columns = updateDto.Columns,
                    rows = updateDto.Rows
                });

                string updateSql = @"
            UPDATE ProductVariants 
            SET Nutrition_Table_Json = @Nutrition_Table_Json,
                Nutrition_Table_Columns = @Nutrition_Table_Columns,
                Nutrition_Table_Rows = @Nutrition_Table_Rows,
                Updated_At = GETDATE()
            WHERE Variant_Id = @Variant_Id";

                var result = _dapper.ExecuteSql(updateSql, new
                {
                    Variant_Id = variantId,
                    Nutrition_Table_Json = fullTableJson,
                    Nutrition_Table_Columns = columnsJson,
                    Nutrition_Table_Rows = rowsJson
                });

                if (result)
                {
                    return Ok(new { status = true, message = "Nutrition table updated successfully" });
                }

                return NotFound(new { error = "Variant not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/ProductVariant/parent/{variantId}
        [AllowAnonymous]
        [HttpGet("parent/{variantId}")]
        public IActionResult GetParentProductByVariantId(int variantId)
        {
            try
            {
                string sql = @"
            SELECT 
                p.Product_Id,
                p.Name,
                p.Img,
                p.Price,
                p.Compare_Price,
                p.DDV_Percentage,
                p.Quantity,
                p.Servings,
                p.GPerServing,
                p.NewInTheShop,
                p.ProductsOnSale,
                p.ProductsInTheOutlet,
                b.Brand_Name as BrandName
            FROM ProductVariants pv
            INNER JOIN Products p ON pv.Product_Id = p.Product_Id
            LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
            WHERE pv.Variant_Id = @Variant_Id AND pv.IsActive = 1";

                var parentProduct = _dapper.LoadDataSingleOrDefault<dynamic>(sql, new { Variant_Id = variantId });

                if (parentProduct == null)
                    return NotFound(new { error = "Parent product not found for this variant" });

                return Ok(new
                {
                    status = true,
                    parentProductId = parentProduct.Product_Id,
                    product = parentProduct
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/ProductVariant/{id}/with-parent
        [AllowAnonymous]
        [HttpGet("{id}/with-parent")]
        public IActionResult GetVariantWithParent(int id)
        {
            try
            {
                string sql = @"
            SELECT 
                pv.*,
                f.Flavor_Name as Flavor_Name,
                pkg.Packaging_Name as Packaging_Name,
                pkg.Packaging_Type as Packaging_Type,
                p.Product_Id as Parent_Product_Id,
                p.Name as Parent_Product_Name,
                p.Img as Parent_Product_Img
            FROM ProductVariants pv
            LEFT JOIN Flavors f ON pv.Flavor_Id = f.Flavor_Id
            LEFT JOIN Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
            INNER JOIN Products p ON pv.Product_Id = p.Product_Id
            WHERE pv.Variant_Id = @Id AND pv.IsActive = 1";

                var variant = _dapper.LoadDataSingleOrDefault<dynamic>(sql, new { Id = id });

                if (variant == null)
                    return NotFound(new { error = "Variant not found" });

                return Ok(new { status = true, data = variant });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/ProductVariant/{variantId}/nutrition-table
        [HttpDelete("{variantId}/nutrition-table")]
        public IActionResult DeleteNutritionTable(int variantId)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string updateSql = @"
            UPDATE ProductVariants 
            SET Nutrition_Table_Json = NULL,
                Nutrition_Table_Columns = NULL,
                Nutrition_Table_Rows = NULL,
                Updated_At = GETDATE()
            WHERE Variant_Id = @Variant_Id";

                var result = _dapper.ExecuteSql(updateSql, new { Variant_Id = variantId });

                if (result)
                {
                    return Ok(new { status = true, message = "Nutrition table deleted successfully" });
                }

                return NotFound(new { error = "Variant not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class SetMainVariantGalleryImageDto
    {
        public int Variant_Id { get; set; }
        public int Gallery_Id { get; set; }
    }
}
