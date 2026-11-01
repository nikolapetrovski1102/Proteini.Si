using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models;
using ProteinisiBackend.Models.DTOs;
using ProteinisiBackend.Services;
using System;
using System.Runtime.Intrinsics.X86;

namespace ProteinisiBackend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class ProductsController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        DataContextDapper _dapper;
        IConfiguration _config;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProductsController(IConfiguration config, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment webHostEnvironment)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
            _httpContextAccessor = httpContextAccessor;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpPost("TestAdd")]
        public IActionResult TestAdd([FromBody] ProductCreateDto productDto)
        {
            try
            {
                return Ok(new
                {
                    received = true,
                    name = productDto.Name,
                    price = productDto.Price,
                    ddv = productDto.DDV_Percentage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Helper method to delete old product image
        private void DeleteOldProductImage(string imagePath)
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
                else
                {
                    Console.WriteLine($"Image not found: {fullPath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting image: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpPost("Search")]
        public IActionResult SearchProducts([FromBody] ProductSearchDto searchDto)
        {
            try
            {
                var query = @"
SELECT DISTINCT
    p.Product_Id,
    p.Name,
    CASE 
        WHEN pv.Variant_Id IS NOT NULL THEN COALESCE(pv.Variant_Image_Path, p.Img)
        ELSE p.Img
    END as Img,
    p.Price,
    CASE
        WHEN p.ProductsOnSale = 1
         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
         AND p.SalePrice > 0
         AND p.SalePrice < p.Price
            THEN p.SalePrice
        ELSE NULL
    END as Compare_Price,
    p.DDV_Percentage,
    p.HasVariants,
    CASE WHEN p.HasVariants = 1 THEN COALESCE((
        SELECT SUM(stock.Quantity) FROM ProductVariants stock
        WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
    ), 0) ELSE p.Quantity END AS Quantity,
    p.Servings,
    p.NewInTheShop,
    p.ProductsOnSale,
    p.SaleEndDate,
    p.UpcomingPromotion,
    p.ShortExpiry,
    p.ExpiryDate,
    p.IsGiftVoucher,
    p.VoucherMinAmount,
    p.VoucherMaxAmount,
    p.NameAl,
    p.ProductsInTheOutlet,
    p.CreatedAt,
    b.Brand_Name as BrandName,
    COALESCE(f.Flavor_Name, pv.Flavor_Name) as FlavorName,
    pv.Variant_Id,
    pv.Price as Variant_Price,
    CASE
        WHEN p.ProductsOnSale = 1
         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
            THEN pv.Compare_Price
        ELSE NULL
    END as Variant_Compare_Price,
    pv.Flavor_Name as VariantFlavorName,
    pv.Packaging_Name as VariantPackagingName,
    CASE WHEN pv.Variant_Id IS NOT NULL THEN 1 ELSE 0 END as IsVariant,
    STUFF(
        (SELECT ', ' + c.Category_Name
         FROM ProductCategoryMapping pcm2
         INNER JOIN ProductCategories c ON pcm2.Category_Id = c.Category_Id
         WHERE pcm2.Product_Id = p.Product_Id
         FOR XML PATH('')), 1, 2, ''
    ) as Categories
FROM Products p
LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
LEFT JOIN Flavors f ON p.Flavor_Id = f.Flavor_Id
LEFT JOIN ProductVariants pv ON p.Product_Id = pv.Product_Id AND pv.IsActive = 1
WHERE 1=1
";

                var parameters = new DynamicParameters();

                // Search term - searches name, brand, AND flavor (from BOTH products AND variants)
                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    query += @" AND (
        p.Product_Id = TRY_CONVERT(int, @SearchTermExact)
        OR p.Name LIKE @SearchTerm
        OR p.NameAl LIKE @SearchTerm
        OR b.Brand_Name LIKE @SearchTerm 
        OR COALESCE(f.Flavor_Name, pv.Flavor_Name) LIKE @SearchTerm
        OR EXISTS (SELECT 1 FROM ProductVariants pv2 
                   WHERE pv2.Product_Id = p.Product_Id 
                   AND pv2.IsActive = 1 
                   AND pv2.Flavor_Name LIKE @SearchTerm)
    )";
                    parameters.Add("@SearchTerm", $"%{searchDto.SearchTerm}%");
                    parameters.Add("@SearchTermExact", searchDto.SearchTerm.Trim());
                }

                // Filter by Brand
                if (searchDto.Brand_Id.HasValue && searchDto.Brand_Id.Value > 0)
                {
                    query += " AND p.Brand_Id = @Brand_Id";
                    parameters.Add("@Brand_Id", searchDto.Brand_Id.Value);
                }

                // Filter by Flavor (searches both product-level and variant-level flavors)
                if (searchDto.Flavor_Id.HasValue && searchDto.Flavor_Id.Value > 0)
                {
                    query += @" AND (
        p.Flavor_Id = @Flavor_Id 
        OR EXISTS (SELECT 1 FROM ProductVariants pv2 
                   WHERE pv2.Product_Id = p.Product_Id 
                   AND pv2.IsActive = 1 
                   AND pv2.Flavor_Id = @Flavor_Id)
    )";
                    parameters.Add("@Flavor_Id", searchDto.Flavor_Id.Value);
                }

                // Filter by Category
                if (searchDto.Category_Id.HasValue && searchDto.Category_Id.Value > 0)
                {
                    query += " AND EXISTS (SELECT 1 FROM ProductCategoryMapping pcm2 WHERE pcm2.Product_Id = p.Product_Id AND pcm2.Category_Id = @Category_Id)";
                    parameters.Add("@Category_Id", searchDto.Category_Id.Value);
                }

                // Filter by Price Range
                if (searchDto.MinPrice.HasValue)
                {
                    query += " AND p.Price >= @MinPrice";
                    parameters.Add("@MinPrice", searchDto.MinPrice.Value);
                }

                if (searchDto.MaxPrice.HasValue)
                {
                    query += " AND p.Price <= @MaxPrice";
                    parameters.Add("@MaxPrice", searchDto.MaxPrice.Value);
                }

                // Filter by flags
                if (searchDto.NewInTheShop.HasValue && searchDto.NewInTheShop.Value)
                {
                    query += " AND p.NewInTheShop = 1";
                }

                if (searchDto.ProductsOnSale.HasValue && searchDto.ProductsOnSale.Value)
                {
                    query += " AND p.ProductsOnSale = 1 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))";
                }

                if (searchDto.ProductsInTheOutlet.HasValue && searchDto.ProductsInTheOutlet.Value)
                {
                    query += " AND p.ProductsInTheOutlet = 1";
                }

                // Get total count
                var countQuery = @"
SELECT COUNT(DISTINCT p.Product_Id)
FROM Products p
LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
LEFT JOIN Flavors f ON p.Flavor_Id = f.Flavor_Id
LEFT JOIN ProductVariants pv ON p.Product_Id = pv.Product_Id AND pv.IsActive = 1
WHERE 1=1
";

                // Add same conditions to count query
                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    countQuery += @" AND (
        p.Product_Id = TRY_CONVERT(int, @SearchTermExact)
        OR p.Name LIKE @SearchTerm
        OR p.NameAl LIKE @SearchTerm
        OR b.Brand_Name LIKE @SearchTerm 
        OR COALESCE(f.Flavor_Name, pv.Flavor_Name) LIKE @SearchTerm
        OR EXISTS (SELECT 1 FROM ProductVariants pv2 
                   WHERE pv2.Product_Id = p.Product_Id 
                   AND pv2.IsActive = 1 
                   AND pv2.Flavor_Name LIKE @SearchTerm)
    )";
                }

                if (searchDto.Brand_Id.HasValue && searchDto.Brand_Id.Value > 0)
                {
                    countQuery += " AND p.Brand_Id = @Brand_Id";
                }

                if (searchDto.Flavor_Id.HasValue && searchDto.Flavor_Id.Value > 0)
                {
                    countQuery += @" AND (
        p.Flavor_Id = @Flavor_Id 
        OR EXISTS (SELECT 1 FROM ProductVariants pv2 
                   WHERE pv2.Product_Id = p.Product_Id 
                   AND pv2.IsActive = 1 
                   AND pv2.Flavor_Id = @Flavor_Id)
    )";
                }

                if (searchDto.Category_Id.HasValue && searchDto.Category_Id.Value > 0)
                {
                    countQuery += " AND EXISTS (SELECT 1 FROM ProductCategoryMapping pcm2 WHERE pcm2.Product_Id = p.Product_Id AND pcm2.Category_Id = @Category_Id)";
                }

                if (searchDto.MinPrice.HasValue)
                {
                    countQuery += " AND p.Price >= @MinPrice";
                }

                if (searchDto.MaxPrice.HasValue)
                {
                    countQuery += " AND p.Price <= @MaxPrice";
                }

                if (searchDto.NewInTheShop.HasValue && searchDto.NewInTheShop.Value)
                {
                    countQuery += " AND p.NewInTheShop = 1";
                }

                if (searchDto.ProductsOnSale.HasValue && searchDto.ProductsOnSale.Value)
                {
                    countQuery += " AND p.ProductsOnSale = 1 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))";
                }

                if (searchDto.ProductsInTheOutlet.HasValue && searchDto.ProductsInTheOutlet.Value)
                {
                    countQuery += " AND p.ProductsInTheOutlet = 1";
                }

                var totalCount = _dapper.LoadDataSingle<int>(countQuery, parameters);

                // Map sort field to column name that exists in SELECT
                string orderByColumn;
                switch (searchDto.SortBy?.ToLower())
                {
                    case "price":
                        orderByColumn = "Price";
                        break;
                    case "name":
                        orderByColumn = "Name";
                        break;
                    case "createdat":
                        orderByColumn = "CreatedAt";
                        break;
                    default:
                        orderByColumn = "CreatedAt";
                        break;
                }

                // Add sorting and pagination
                query += $" ORDER BY {orderByColumn} {searchDto.SortOrder}";
                query += " OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

                var offset = (searchDto.Page - 1) * searchDto.PageSize;
                parameters.Add("@Offset", offset);
                parameters.Add("@PageSize", searchDto.PageSize);

                // Execute query
                var products = _dapper.LoadData<ProductSearchResultDto>(query, parameters)?.ToList() ?? new List<ProductSearchResultDto>();
                products = products
                    .GroupBy(product => product.Product_Id)
                    .Select(group => group.First())
                    .ToList();

                // Process categories into list and set correct compare price
                foreach (var product in products)
                {
                    // Set the correct price and compare price for variants
                    if (product.IsVariant)
                    {
                        // Use variant price if available
                        if (product.Variant_Price.HasValue)
                        {
                            product.Price = product.Variant_Price.Value;
                        }
                        // Use variant compare price if available
                        if (product.Variant_Compare_Price.HasValue && product.Variant_Compare_Price.Value > 0)
                        {
                            product.Compare_Price = product.Variant_Compare_Price;
                        }
                    }

                    // Process categories into list
                    if (!string.IsNullOrEmpty(product.Categories))
                    {
                        product.CategoriesList = product.Categories.Split(new[] { ", " }, StringSplitOptions.None).ToList();
                    }
                    else
                    {
                        product.CategoriesList = new List<string>();
                    }
                }

                return Ok(new ProductSearchResponseDto
                {
                    Products = products,
                    TotalCount = totalCount,
                    CurrentPage = searchDto.Page,
                    PageSize = searchDto.PageSize,
                    TotalPages = totalCount > 0 ? (int)Math.Ceiling((double)totalCount / searchDto.PageSize) : 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("GetAllProducts")]
        public IActionResult GetAllProducts()
        {
            string sql = @"SELECT 
        p.Product_Id,
        p.Name,
        p.Img,
        p.Category,
        CASE WHEN p.HasVariants = 1 THEN COALESCE((
            SELECT SUM(stock.Quantity) FROM ProductVariants stock
            WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
        ), 0) ELSE p.Quantity END AS Quantity,
        p.HasVariants,
        Servings, 
        GPerServing, 
        GNutrition, 
        Price,
        DDV_Percentage,
        DDV_Amount,
        Price_Without_DDV,
        Price_With_DDV,
        Brand_Id,
        Flavor_Id,
        MainDescriptions,
        OtherDescriptionTitle,
        OtherDescriptionText,
        NutritionValuesIngredients,
        NutritionValuesIngredientsDescription,
        NutritionInformation,
        InstructionsForUse,
        InstructionsForUseDescription,
        InstructionsOnHowToUseIt,
        CreatedAt,
        UpdatedAt,
        NewInTheShop,
        ProductsOnSale,
        SalePrice,
        SaleEndDate,
        CASE
            WHEN ProductsOnSale = 1
             AND (SaleEndDate IS NULL OR SaleEndDate >= CAST(GETDATE() AS date))
             AND SalePrice > 0
             AND SalePrice < Price
                THEN SalePrice
            ELSE NULL
        END AS Compare_Price,
        UpcomingPromotion,
        ShortExpiry,
        ExpiryDate,
        IsGiftVoucher,
        VoucherMinAmount,
        VoucherMaxAmount,
        NameAl,
        RecommendedForYou,
        ProductsInTheOutlet,
        JustForMe
        FROM Products p";

            var products = _dapper.LoadData<Product>(sql);
            return Ok(products);
        }

        // Helper method to save image file
        private async Task<string> SaveProductImageFile(IFormFile file, int productId)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
                throw new Exception("Invalid file type. Only JPG, PNG, and WEBP are allowed.");

            if (file.Length > 5 * 1024 * 1024)
                throw new Exception("File size must be less than 5MB");

            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "product-images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"product_{productId}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/product-images/{uniqueFileName}";
        }

        [HttpPut("EditProduct/{id}")]
        public async Task<IActionResult> EditProduct(int id, [FromForm] string productData, IFormFile? Image, [FromForm] string? RemoveImage)
        {
            try
            {
                Console.WriteLine($"=== EDIT PRODUCT {id} ===");
                Console.WriteLine($"Raw productData: {productData}");

                var product = JsonConvert.DeserializeObject<ProductEditDto>(productData);

                if (product == null)
                    return BadRequest(new { error = "Invalid product data" });

                // -------------------------
                // ✅ FIXED DDV CALCULATION
                // -------------------------
                decimal priceWithoutDDV;
                decimal ddvAmount;
                decimal priceWithDDV;

                if (product.IsPriceWithDDV) // 👈 ADD THIS FIELD IN DTO
                {
                    priceWithDDV = product.Price;
                    priceWithoutDDV = product.Price / (1 + (product.DDV_Percentage / 100m));
                    ddvAmount = priceWithDDV - priceWithoutDDV;
                }
                else
                {
                    priceWithoutDDV = product.Price;
                    ddvAmount = priceWithoutDDV * product.DDV_Percentage / 100m;
                    priceWithDDV = priceWithoutDDV + ddvAmount;
                }

                Console.WriteLine($"PriceWithoutDDV: {priceWithoutDDV}");
                Console.WriteLine($"DDV Amount: {ddvAmount}");
                Console.WriteLine($"PriceWithDDV: {priceWithDDV}");

                // -------------------------
                // Parse JSON lists
                // -------------------------
                List<int> categoryIds = string.IsNullOrEmpty(product.CategoryIds) || product.CategoryIds == "null"
                    ? new List<int>()
                    : JsonConvert.DeserializeObject<List<int>>(product.CategoryIds) ?? new List<int>();

                List<int> sportIds = string.IsNullOrEmpty(product.SportIds) || product.SportIds == "null"
                    ? new List<int>()
                    : JsonConvert.DeserializeObject<List<int>>(product.SportIds) ?? new List<int>();

                List<int> goalIds = string.IsNullOrEmpty(product.GoalIds) || product.GoalIds == "null"
                    ? new List<int>()
                    : JsonConvert.DeserializeObject<List<int>>(product.GoalIds) ?? new List<int>();

                List<int> useTimingIds = string.IsNullOrEmpty(product.UseTimingIds) || product.UseTimingIds == "null"
                    ? new List<int>()
                    : JsonConvert.DeserializeObject<List<int>>(product.UseTimingIds) ?? new List<int>();

                List<int> tagIds = string.IsNullOrEmpty(product.TagIds) || product.TagIds == "null"
                    ? new List<int>()
                    : JsonConvert.DeserializeObject<List<int>>(product.TagIds) ?? new List<int>();

                // -------------------------
                // Image handling
                // -------------------------
                string getCurrentSql = "SELECT Img FROM Products WHERE Product_Id = @Product_Id";
                var currentImagePath = _dapper.LoadDataSingleOrDefault<string>(getCurrentSql, new { Product_Id = id });

                string finalImagePath = currentImagePath;
                bool shouldRemoveImage = RemoveImage == "true";

                if (shouldRemoveImage)
                {
                    if (!string.IsNullOrEmpty(currentImagePath))
                        DeleteOldProductImage(currentImagePath);

                    finalImagePath = null;
                }
                else if (Image != null && Image.Length > 0)
                {
                    if (!string.IsNullOrEmpty(currentImagePath))
                        DeleteOldProductImage(currentImagePath);

                    finalImagePath = await SaveProductImageFile(Image, id);
                }

                // -------------------------
                // MainDescriptions fix
                // -------------------------
                string mainDescJson = "[]";
                if (!string.IsNullOrEmpty(product.MainDescription))
                {
                    try
                    {
                        if (product.MainDescription.Trim().StartsWith("["))
                        {
                            mainDescJson = product.MainDescription;
                        }
                        else
                        {
                            mainDescJson = JsonConvert.SerializeObject(new List<string> { product.MainDescription });
                        }
                    }
                    catch
                    {
                        mainDescJson = JsonConvert.SerializeObject(new List<string> { product.MainDescription });
                    }
                }

                // -------------------------
                // UPDATE SQL
                // -------------------------
                string sql = @"
UPDATE Products
SET Name = @Name,
    Img = @Img,
    Category = @Category,
    Quantity = @Quantity,
    Servings = @Servings,
    GPerServing = @GPerServing,
    GNutrition = @GNutrition,
    Price = @Price,
    DDV_Percentage = @DDV_Percentage,
    DDV_Amount = @DDV_Amount,
    Price_Without_DDV = @Price_Without_DDV,
    Price_With_DDV = @Price_With_DDV,
    Brand_Id = @Brand_Id,
    Flavor_Id = @Flavor_Id,
    MainDescriptions = @MainDescriptions,
    OtherDescriptionTitle = @OtherDescriptionTitle,
    OtherDescriptionText = @OtherDescriptionText,
    NutritionValuesIngredients = @NutritionValuesIngredients,
    NutritionValuesIngredientsDescription = @NutritionValuesIngredientsDesc,
    NutritionInformation = @NutritionInformation,
    InstructionsForUse = @InstructionsForUse,
    InstructionsForUseDescription = @InstructionsForUseDesc,
    InstructionsOnHowToUseIt = @InstructionsOnHowToUseIt,
    NewInTheShop = @NewInTheShop,
    ProductsOnSale = @ProductsOnSale,
    SalePrice = @SalePrice,
    SaleEndDate = @SaleEndDate,
    UpcomingPromotion = @UpcomingPromotion,
    ShortExpiry = @ShortExpiry,
    ExpiryDate = @ExpiryDate,
    IsGiftVoucher = @IsGiftVoucher,
    VoucherMinAmount = @VoucherMinAmount,
    VoucherMaxAmount = @VoucherMaxAmount,
    NameAl = @NameAl,
    DescriptionAl = @DescriptionAl,
    NutritionValuesIngredientsAl = @NutritionValuesIngredientsAl,
    NutritionValuesIngredientsDescriptionAl = @NutritionValuesIngredientsDescriptionAl,
    NutritionInformationAl = @NutritionInformationAl,
    InstructionsForUseAl = @InstructionsForUseAl,
    InstructionsForUseDescriptionAl = @InstructionsForUseDescriptionAl,
    InstructionsOnHowToUseItAl = @InstructionsOnHowToUseItAl,
    RecommendedForYou = @RecommendedForYou,
    ProductsInTheOutlet = @ProductsInTheOutlet,
    JustForMe = @JustForMe,
    LoyaltyPercentage = @LoyaltyPercentage,
    UpdatedAt = GETDATE()
WHERE Product_Id = @Product_Id";

                var parameters = new
                {
                    Product_Id = id,
                    Name = product.Name ?? string.Empty,
                    Img = finalImagePath ?? (object)DBNull.Value,
                    Category = product.Category,
                    Quantity = product.Quantity,
                    Servings = product.Servings,
                    GPerServing = product.GPerServing,
                    GNutrition = product.GNutrition,
                    Price = priceWithoutDDV, // ✅ ALWAYS STORE BASE PRICE
                    DDV_Percentage = product.DDV_Percentage,
                    DDV_Amount = ddvAmount,
                    Price_Without_DDV = priceWithoutDDV,
                    Price_With_DDV = priceWithDDV,
                    Brand_Id = product.BrandId,
                    Flavor_Id = product.FlavorId,
                    MainDescriptions = mainDescJson,
                    OtherDescriptionTitle = product.OtherDescriptionTitle,
                    OtherDescriptionText = product.OtherDescriptionText,
                    NutritionValuesIngredients = product.NutritionValuesIngredients,
                    NutritionValuesIngredientsDesc = product.NutritionValuesIngredientsDesc,
                    NutritionInformation = product.NutritionInformation,
                    InstructionsForUse = product.InstructionsForUse,
                    InstructionsForUseDesc = product.InstructionsForUseDesc,
                    InstructionsOnHowToUseIt = product.InstructionsOnHowToUseIt,
                    NewInTheShop = product.NewInTheShop,
                    ProductsOnSale = product.ProductsOnSale,
                    SalePrice = product.ProductsOnSale && product.SalePrice.HasValue && product.SalePrice > 0 && product.SalePrice < product.Price
                        ? product.SalePrice
                        : null,
                    SaleEndDate = product.ProductsOnSale ? product.SaleEndDate : null,
                    UpcomingPromotion = product.UpcomingPromotion,
                    ShortExpiry = product.ShortExpiry,
                    ExpiryDate = product.ShortExpiry ? product.ExpiryDate : null,
                    IsGiftVoucher = product.IsGiftVoucher,
                    VoucherMinAmount = product.IsGiftVoucher ? product.VoucherMinAmount : null,
                    VoucherMaxAmount = product.IsGiftVoucher ? product.VoucherMaxAmount : null,
                    product.NameAl,
                    product.DescriptionAl,
                    product.NutritionValuesIngredientsAl,
                    product.NutritionValuesIngredientsDescriptionAl,
                    product.NutritionInformationAl,
                    product.InstructionsForUseAl,
                    product.InstructionsForUseDescriptionAl,
                    product.InstructionsOnHowToUseItAl,
                    RecommendedForYou = product.RecommendedForYou,
                    ProductsInTheOutlet = product.ProductsInTheOutlet,
                    JustForMe = product.JustForMe,
                    LoyaltyPercentage = product.LoyaltyPercentage ?? 2.0m,
                };

                bool updated = _dapper.ExecuteSql(sql, parameters);

                if (!updated)
                    return NotFound("Product not found");

                // -------------------------
                // Refresh mappings
                // -------------------------
                _dapper.ExecuteSql("DELETE FROM ProductCategoryMapping WHERE Product_Id = @Product_Id", new { Product_Id = id });
                _dapper.ExecuteSql("DELETE FROM ProductSportMapping WHERE Product_Id = @Product_Id", new { Product_Id = id });
                _dapper.ExecuteSql("DELETE FROM ProductGoalMapping WHERE Product_Id = @Product_Id", new { Product_Id = id });
                _dapper.ExecuteSql("DELETE FROM ProductUseTimingMapping WHERE Product_Id = @Product_Id", new { Product_Id = id });
                _dapper.ExecuteSql("DELETE FROM ProductTagMapping WHERE Product_Id = @Product_Id", new { Product_Id = id });

                foreach (var categoryId in categoryIds)
                    _dapper.ExecuteSql("INSERT INTO ProductCategoryMapping (Product_Id, Category_Id) VALUES (@Product_Id, @Category_Id)",
                        new { Product_Id = id, Category_Id = categoryId });

                foreach (var sportId in sportIds)
                    _dapper.ExecuteSql("INSERT INTO ProductSportMapping (Product_Id, Sport_Id) VALUES (@Product_Id, @Sport_Id)",
                        new { Product_Id = id, Sport_Id = sportId });

                foreach (var goalId in goalIds)
                    _dapper.ExecuteSql("INSERT INTO ProductGoalMapping (Product_Id, Goal_Id) VALUES (@Product_Id, @Goal_Id)",
                        new { Product_Id = id, Goal_Id = goalId });

                foreach (var timingId in useTimingIds)
                    _dapper.ExecuteSql("INSERT INTO ProductUseTimingMapping (Product_Id, UseTiming_Id) VALUES (@Product_Id, @UseTiming_Id)",
                        new { Product_Id = id, UseTiming_Id = timingId });

                foreach (var tagId in tagIds)
                    _dapper.ExecuteSql("INSERT INTO ProductTagMapping (Product_Id, Tag_Id) VALUES (@Product_Id, @Tag_Id)",
                        new { Product_Id = id, Tag_Id = tagId });

                return Ok(new
                {
                    status = true,
                    message = "Product updated successfully",
                    imagePath = finalImagePath,
                    priceWithoutDDV,
                    priceWithDDV,
                    ddvAmount
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in EditProduct: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/products/{id}
        [HttpDelete("DeleteProduct/{id}")]
        public IActionResult DeleteProduct(int id)
        {
            string getImageSql = "SELECT Img FROM Products WHERE Product_Id = @Product_Id";
            var imagePath = _dapper.LoadDataSingleOrDefault<string>(getImageSql, new { Product_Id = id });

            if (!string.IsNullOrEmpty(imagePath))
                DeleteOldProductImage(imagePath);

            string sql = "DELETE FROM Products WHERE Product_Id = @Product_Id";
            bool deleted = _dapper.ExecuteSql(sql, new { Product_Id = id });

            if (!deleted) return NotFound("Product not found");
            return Ok(new { status = true, message = "Product deleted successfully" });
        }

        // POST: api/admin/products/{id}/upload-image
        [HttpPost("UploadProductImage{id}/upload-image")]
        public async Task<IActionResult> UploadProductImage(int id, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No image file provided" });

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and WEBP are allowed." });

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size must be less than 5MB" });

                string checkProductSql = "SELECT COUNT(1) FROM Products WHERE Product_Id = @Product_Id";
                var productExists = _dapper.LoadDataSingle<int>(checkProductSql, new { Product_Id = id });

                if (productExists == 0)
                    return NotFound(new { error = "Product not found" });

                string getOldImageSql = "SELECT Img FROM Products WHERE Product_Id = @Product_Id";
                var oldImagePath = _dapper.LoadDataSingleOrDefault<string>(getOldImageSql, new { Product_Id = id });

                if (!string.IsNullOrEmpty(oldImagePath))
                    DeleteOldProductImage(oldImagePath);

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "product-images");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"product_{id}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                string dbPath = $"/product-images/{uniqueFileName}";

                string updateSql = "UPDATE Products SET Img = @Img, UpdatedAt = GETDATE() WHERE Product_Id = @Product_Id";
                bool updated = _dapper.ExecuteSql(updateSql, new { Img = dbPath, Product_Id = id });

                if (!updated)
                    return StatusCode(500, new { error = "Failed to update database" });

                return Ok(new { status = true, imagePath = dbPath, message = "Image uploaded successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading image: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/products/filters
        [AllowAnonymous]
        [HttpGet("GetFilterOptions")]
        public IActionResult GetFilterOptions()
        {
            try
            {
                var categories = _dapper.LoadData<ProductCategory>(
                    "SELECT Category_Id, Category_Name, Category_Slug, Parent_Category_Id, Display_Order FROM ProductCategories ORDER BY Display_Order");
                var sports = _dapper.LoadData<Sport>("SELECT * FROM Sports ORDER BY Display_Order");
                var goals = _dapper.LoadData<Goal>("SELECT * FROM Goals ORDER BY Display_Order");
                var useTimings = _dapper.LoadData<UseTiming>("SELECT * FROM UseTimings ORDER BY Display_Order");
                var flavors = _dapper.LoadData<Flavor>("SELECT * FROM Flavors ORDER BY Display_Order");
                var brands = _dapper.LoadData<Brand>("SELECT * FROM Brands ORDER BY Display_Order");
                var tags = _dapper.LoadData<ProductTag>("SELECT * FROM ProductTags ORDER BY Display_Order");
                var maximumPrice = _dapper.LoadDataSingle<decimal>(@"
                    SELECT CEILING(COALESCE(MAX(Price), 10000) / 1000.0) * 1000
                    FROM (
                        SELECT Price FROM Products
                        UNION ALL
                        SELECT Price FROM ProductVariants
                    ) AvailablePrices");

                return Ok(new
                {
                    categories,
                    sports,
                    goals,
                    useTimings,
                    flavors,
                    brands,
                    tags,
                    priceBounds = new
                    {
                        Min = 0m,
                        Max = Math.Max(1000m, maximumPrice)
                    },
                    priceRanges = new[]
                    {
                        new { Min = 0m, Max = 10m, Name = "Up to 10 MKD" },
                        new { Min = 10m, Max = 25m, Name = "10 - 25 MKD" },
                        new { Min = 25m, Max = 50m, Name = "25 - 50 MKD" },
                        new { Min = 50m, Max = 100m, Name = "50 - 100 MKD" }
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/products/filtered
        [AllowAnonymous]
        [HttpPost("GetFilteredProducts")]
        public IActionResult GetFilteredProducts([FromBody] ProductFilterDto filters)
        {
            try
            {
                var filterService = new ProductFilterService(_dapper);
                var result = filterService.GetFilteredProducts(filters);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("AddProduct")]
        public async Task<IActionResult> AddProduct([FromForm] ProductCreateDto productDto)
        {
            try
            {
                if (string.IsNullOrEmpty(productDto.Name))
                    return BadRequest(new { error = "Product name is required" });

                // Parse the JSON strings into Lists
                List<int> categoryIds = new List<int>();
                List<int> sportIds = new List<int>();
                List<int> goalIds = new List<int>();
                List<int> useTimingIds = new List<int>();
                List<int> tagIds = new List<int>();
                List<int> flavorIds = new List<int>();

                if (!string.IsNullOrEmpty(productDto.CategoryIds) && productDto.CategoryIds != "null")
                {
                    try { categoryIds = JsonConvert.DeserializeObject<List<int>>(productDto.CategoryIds); }
                    catch { categoryIds = new List<int>(); }
                }

                if (!string.IsNullOrEmpty(productDto.SportIds) && productDto.SportIds != "null")
                {
                    try { sportIds = JsonConvert.DeserializeObject<List<int>>(productDto.SportIds); }
                    catch { sportIds = new List<int>(); }
                }

                if (!string.IsNullOrEmpty(productDto.GoalIds) && productDto.GoalIds != "null")
                {
                    try { goalIds = JsonConvert.DeserializeObject<List<int>>(productDto.GoalIds); }
                    catch { goalIds = new List<int>(); }
                }

                if (!string.IsNullOrEmpty(productDto.UseTimingIds) && productDto.UseTimingIds != "null")
                {
                    try { useTimingIds = JsonConvert.DeserializeObject<List<int>>(productDto.UseTimingIds); }
                    catch { useTimingIds = new List<int>(); }
                }

                if (!string.IsNullOrEmpty(productDto.TagIds) && productDto.TagIds != "null")
                {
                    try { tagIds = JsonConvert.DeserializeObject<List<int>>(productDto.TagIds); }
                    catch { tagIds = new List<int>(); }
                }

                if (!string.IsNullOrEmpty(productDto.FlavorIds) && productDto.FlavorIds != "null")
                {
                    try { flavorIds = JsonConvert.DeserializeObject<List<int>>(productDto.FlavorIds); }
                    catch { flavorIds = new List<int>(); }
                }

                Console.WriteLine($"CategoryIds parsed: {string.Join(",", categoryIds)}");
                Console.WriteLine($"FlavorIds parsed: {string.Join(",", flavorIds)}");

                // Parse MainDescriptions
                List<string> mainDescriptionsList = new List<string>();
                if (!string.IsNullOrEmpty(productDto.MainDescriptions))
                {
                    try
                    {
                        var deserialized = JsonConvert.DeserializeObject<List<string>>(productDto.MainDescriptions);
                        if (deserialized != null && deserialized.Any())
                        {
                            mainDescriptionsList = deserialized;
                        }
                        else
                        {
                            mainDescriptionsList = new List<string> { productDto.MainDescriptions };
                        }
                    }
                    catch
                    {
                        mainDescriptionsList = new List<string> { productDto.MainDescriptions };
                    }
                }

                string mainDescJson = JsonConvert.SerializeObject(mainDescriptionsList);

                string insertSql = @"
INSERT INTO Products
(Name, Category, Quantity, Servings, GPerServing, GNutrition, Price, DDV_Percentage, 
 DDV_Amount, Price_Without_DDV, Price_With_DDV, Brand_Id, Flavor_Id,
 MainDescriptions, OtherDescriptionTitle, OtherDescriptionText,
 NutritionValuesIngredients, NutritionValuesIngredientsDescription, NutritionInformation,
 InstructionsForUse, InstructionsForUseDescription, InstructionsOnHowToUseIt,
 NewInTheShop, ProductsOnSale, SalePrice, SaleEndDate, UpcomingPromotion, ShortExpiry, ExpiryDate,
 IsGiftVoucher, VoucherMinAmount, VoucherMaxAmount, NameAl, DescriptionAl,
 NutritionValuesIngredientsAl, NutritionValuesIngredientsDescriptionAl, NutritionInformationAl,
 InstructionsForUseAl, InstructionsForUseDescriptionAl, InstructionsOnHowToUseItAl,
 RecommendedForYou, ProductsInTheOutlet, JustForMe,
 HasVariants, Variant_Display_Type, LoyaltyPercentage)
VALUES
(@Name, @Category, @Quantity, @Servings, @GPerServing, @GNutrition, @Price, @DDV_Percentage,
 @DDV_Amount, @Price_Without_DDV, @Price_With_DDV, @Brand_Id, @Flavor_Id,
 @MainDescriptions, @OtherDescriptionTitle, @OtherDescriptionText,
 @NutritionValuesIngredients, @NutritionValuesIngredientsDescription, @NutritionInformation,
 @InstructionsForUse, @InstructionsForUseDescription, @InstructionsOnHowToUseIt,
 @NewInTheShop, @ProductsOnSale, @SalePrice, @SaleEndDate, @UpcomingPromotion, @ShortExpiry, @ExpiryDate,
 @IsGiftVoucher, @VoucherMinAmount, @VoucherMaxAmount, @NameAl, @DescriptionAl,
 @NutritionValuesIngredientsAl, @NutritionValuesIngredientsDescriptionAl, @NutritionInformationAl,
 @InstructionsForUseAl, @InstructionsForUseDescriptionAl, @InstructionsOnHowToUseItAl,
 @RecommendedForYou, @ProductsInTheOutlet, @JustForMe,
 @HasVariants, @Variant_Display_Type, @LoyaltyPercentage);
SELECT CAST(SCOPE_IDENTITY() AS int);";

                // ✅ ✅ FIXED DDV LOGIC (price already includes DDV)
                decimal priceWithDDV = productDto.Price;

                decimal priceWithoutDDV = Math.Round(
                    priceWithDDV / (1 + productDto.DDV_Percentage / 100m), 2);

                decimal ddvAmount = Math.Round(
                    priceWithDDV - priceWithoutDDV, 2);

                var parameters = new
                {
                    productDto.Name,
                    productDto.Category,
                    Quantity = productDto.Quantity,
                    Servings = productDto.Servings,
                    GPerServing = productDto.GPerServing,
                    GNutrition = productDto.GNutrition,
                    LoyaltyPercentage = productDto.LoyaltyPercentage ?? 2.0m,

                    // ✅ IMPORTANT FIX
                    Price = priceWithDDV,
                    DDV_Percentage = productDto.DDV_Percentage,
                    DDV_Amount = ddvAmount,
                    Price_Without_DDV = priceWithoutDDV,
                    Price_With_DDV = priceWithDDV,

                    Brand_Id = productDto.BrandId,
                    Flavor_Id = productDto.FlavorId,
                    MainDescriptions = mainDescJson,
                    productDto.OtherDescriptionTitle,
                    productDto.OtherDescriptionText,
                    productDto.NutritionValuesIngredients,
                    NutritionValuesIngredientsDescription = productDto.NutritionValuesIngredientsDescription,
                    productDto.NutritionInformation,
                    productDto.InstructionsForUse,
                    InstructionsForUseDescription = productDto.InstructionsForUseDescription,
                    productDto.InstructionsOnHowToUseIt,
                    NewInTheShop = productDto.NewInTheShop,
                    ProductsOnSale = productDto.ProductsOnSale,
                    SalePrice = productDto.ProductsOnSale && productDto.SalePrice.HasValue && productDto.SalePrice > 0 && productDto.SalePrice < priceWithDDV
                        ? productDto.SalePrice
                        : null,
                    SaleEndDate = productDto.ProductsOnSale ? productDto.SaleEndDate : null,
                    UpcomingPromotion = productDto.UpcomingPromotion,
                    ShortExpiry = productDto.ShortExpiry,
                    ExpiryDate = productDto.ShortExpiry ? productDto.ExpiryDate : null,
                    IsGiftVoucher = productDto.IsGiftVoucher,
                    VoucherMinAmount = productDto.IsGiftVoucher ? productDto.VoucherMinAmount : null,
                    VoucherMaxAmount = productDto.IsGiftVoucher ? productDto.VoucherMaxAmount : null,
                    productDto.NameAl,
                    productDto.DescriptionAl,
                    productDto.NutritionValuesIngredientsAl,
                    productDto.NutritionValuesIngredientsDescriptionAl,
                    productDto.NutritionInformationAl,
                    productDto.InstructionsForUseAl,
                    productDto.InstructionsForUseDescriptionAl,
                    productDto.InstructionsOnHowToUseItAl,
                    RecommendedForYou = productDto.RecommendedForYou,
                    ProductsInTheOutlet = productDto.ProductsInTheOutlet,
                    JustForMe = productDto.JustForMe,
                    HasVariants = productDto.HasVariants,
                    Variant_Display_Type = productDto.Variant_Display_Type
                };

                int productId = _dapper.LoadDataSingle<int>(insertSql, parameters);

                // Insert mappings (unchanged)
                foreach (var categoryId in categoryIds)
                {
                    _dapper.ExecuteSql("INSERT INTO ProductCategoryMapping (Product_Id, Category_Id) VALUES (@Product_Id, @Category_Id)",
                        new { Product_Id = productId, Category_Id = categoryId });
                }

                foreach (var sportId in sportIds)
                {
                    _dapper.ExecuteSql("INSERT INTO ProductSportMapping (Product_Id, Sport_Id) VALUES (@Product_Id, @Sport_Id)",
                        new { Product_Id = productId, Sport_Id = sportId });
                }

                foreach (var goalId in goalIds)
                {
                    _dapper.ExecuteSql("INSERT INTO ProductGoalMapping (Product_Id, Goal_Id) VALUES (@Product_Id, @Goal_Id)",
                        new { Product_Id = productId, Goal_Id = goalId });
                }

                foreach (var timingId in useTimingIds)
                {
                    _dapper.ExecuteSql("INSERT INTO ProductUseTimingMapping (Product_Id, UseTiming_Id) VALUES (@Product_Id, @UseTiming_Id)",
                        new { Product_Id = productId, UseTiming_Id = timingId });
                }

                foreach (var tagId in tagIds)
                {
                    _dapper.ExecuteSql("INSERT INTO ProductTagMapping (Product_Id, Tag_Id) VALUES (@Product_Id, @Tag_Id)",
                        new { Product_Id = productId, Tag_Id = tagId });
                }

                // Handle image upload (unchanged)
                string savedImagePath = null;
                if (productDto.Image != null && productDto.Image.Length > 0)
                {
                    savedImagePath = await SaveProductImageFile(productDto.Image, productId);
                    _dapper.ExecuteSql("UPDATE Products SET Img = @Img WHERE Product_Id = @Product_Id",
                        new { Img = savedImagePath, Product_Id = productId });
                }

                return Ok(new
                {
                    status = true,
                    productId,
                    imagePath = savedImagePath,
                    price = priceWithDDV,
                    ddvPercentage = productDto.DDV_Percentage,
                    ddvAmount = ddvAmount,
                    basePrice = priceWithoutDDV,
                    message = "Product created successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddProduct: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/Products/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public IActionResult GetProductById(int id)
        {
            try
            {
                Console.WriteLine($"GetProductById called with id: {id}");

                // Use LoadData with FirstOrDefault instead of LoadDataSingleOrDefault
                string productSql = @"
SELECT 
    p.Product_Id, 
    p.Name, 
    p.Img, 
    p.Category, 
    CASE WHEN p.HasVariants = 1 THEN COALESCE((
        SELECT SUM(stock.Quantity) FROM ProductVariants stock
        WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
    ), 0) ELSE p.Quantity END AS Quantity,
    p.HasVariants,
    p.Servings, 
    p.GPerServing, 
    p.GNutrition, 
    p.Price,
    p.DDV_Percentage,
    p.LoyaltyPercentage,
    p.Flavor_Id, 
    p.Brand_Id,
    p.MainDescriptions, 
    p.OtherDescriptionTitle, 
    p.OtherDescriptionText,
    p.NutritionValuesIngredients, 
    p.NutritionValuesIngredientsDescription, 
    p.NutritionInformation,
    p.InstructionsForUse, 
    p.InstructionsForUseDescription, 
    p.InstructionsOnHowToUseIt,
    p.CreatedAt, 
    p.UpdatedAt, 
    p.NewInTheShop, 
    p.ProductsOnSale,
    p.SalePrice,
    p.SaleEndDate,
    CASE
        WHEN p.ProductsOnSale = 1
         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
         AND p.SalePrice > 0
         AND p.SalePrice < p.Price
            THEN p.SalePrice
        ELSE NULL
    END AS Compare_Price,
    p.UpcomingPromotion,
    p.ShortExpiry,
    p.ExpiryDate,
    p.IsGiftVoucher,
    p.VoucherMinAmount,
    p.VoucherMaxAmount,
    p.NameAl,
    p.DescriptionAl,
    p.NutritionValuesIngredientsAl,
    p.NutritionValuesIngredientsDescriptionAl,
    p.NutritionInformationAl,
    p.InstructionsForUseAl,
    p.InstructionsForUseDescriptionAl,
    p.InstructionsOnHowToUseItAl,
    p.RecommendedForYou, 
    p.ProductsInTheOutlet,
    p.JustForMe,
    b.Brand_Name as BrandName,
    f.Flavor_Name as FlavorName
FROM Products p
LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
LEFT JOIN Flavors f ON p.Flavor_Id = f.Flavor_Id
WHERE p.Product_Id = @Product_Id";

                var products = _dapper.LoadData<Product>(productSql, new { Product_Id = id }).ToList();
                var product = products.FirstOrDefault();

                if (product == null)
                {
                    Console.WriteLine($"Product with id {id} not found");
                    return NotFound(new { error = $"Product with id {id} not found" });
                }

                Console.WriteLine($"Product found: {product.Name}");
                Console.WriteLine($"DDV_Percentage: {product.DDV_Percentage}");

                // Get product's categories
                var categories = _dapper.LoadData<ProductCategory>(@"
            SELECT c.* 
            FROM ProductCategoryMapping pcm 
            INNER JOIN ProductCategories c ON pcm.Category_Id = c.Category_Id 
            WHERE pcm.Product_Id = @Product_Id
            ORDER BY c.Display_Order", new { Product_Id = id }).ToList();

                // Get product's sports
                var sports = _dapper.LoadData<Sport>(@"
            SELECT s.* 
            FROM ProductSportMapping psm 
            INNER JOIN Sports s ON psm.Sport_Id = s.Sport_Id 
            WHERE psm.Product_Id = @Product_Id
            ORDER BY s.Display_Order", new { Product_Id = id }).ToList();

                // Get product's goals
                var goals = _dapper.LoadData<Goal>(@"
            SELECT g.* 
            FROM ProductGoalMapping pgm 
            INNER JOIN Goals g ON pgm.Goal_Id = g.Goal_Id 
            WHERE pgm.Product_Id = @Product_Id
            ORDER BY g.Display_Order", new { Product_Id = id }).ToList();

                // Get product's use timings
                var useTimings = _dapper.LoadData<UseTiming>(@"
            SELECT u.* 
            FROM ProductUseTimingMapping putm 
            INNER JOIN UseTimings u ON putm.UseTiming_Id = u.UseTiming_Id 
            WHERE putm.Product_Id = @Product_Id
            ORDER BY u.Display_Order", new { Product_Id = id }).ToList();

                // Get product's tags
                var tags = _dapper.LoadData<ProductTag>(@"
            SELECT t.* 
            FROM ProductTagMapping ptm 
            INNER JOIN ProductTags t ON ptm.Tag_Id = t.Tag_Id 
            WHERE ptm.Product_Id = @Product_Id
            ORDER BY t.Display_Order", new { Product_Id = id }).ToList();

                // Get variants
                var variants = GetProductVariants(id);

                // Return combined response
                return Ok(new
                {
                    product = product,
                    categories = categories,
                    sports = sports,
                    goals = goals,
                    useTimings = useTimings,
                    tags = tags,
                    flavors = new List<Flavor>(), // Empty list for now
                    variants = variants  // Add this line
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetProductById: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace.ToString() });
            }
        }

        [AllowAnonymous]
        [HttpGet("{productId}/gallery")]
        public IActionResult GetProductGallery(int productId)
        {
            try
            {
                string sql = @"
            SELECT Gallery_Id, Product_Id, Image_Path, Display_Order, IsActive, Created_At
            FROM ProductGallery
            WHERE Product_Id = @Product_Id AND IsActive = 1
            ORDER BY Display_Order ASC, Gallery_Id ASC";

                var gallery = _dapper.LoadData<ProductGallery>(sql, new { Product_Id = productId });

                // Return directly without wrapping
                return Ok(gallery);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/Products/gallery/upload
        [HttpPost("gallery/upload")]
        public async Task<IActionResult> UploadGalleryImage([FromForm] UploadGalleryImageDto uploadDto)
        {
            try
            {
                if (uploadDto.Image == null || uploadDto.Image.Length == 0)
                    return BadRequest(new { error = "No image file provided" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var fileExtension = Path.GetExtension(uploadDto.Image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { error = "Invalid file type. Only JPG, PNG, and WEBP are allowed." });

                // Validate file size (max 5MB)
                if (uploadDto.Image.Length > 5 * 1024 * 1024)
                    return BadRequest(new { error = "File size must be less than 5MB" });

                // Check if product exists
                string checkProductSql = "SELECT COUNT(1) FROM Products WHERE Product_Id = @Product_Id";
                var productExists = _dapper.LoadDataSingle<int>(checkProductSql, new { Product_Id = uploadDto.Product_Id });

                if (productExists == 0)
                    return NotFound(new { error = "Product not found" });

                // Get current max display order
                string getMaxOrderSql = "SELECT ISNULL(MAX(Display_Order), -1) FROM ProductGallery WHERE Product_Id = @Product_Id";
                var maxOrder = _dapper.LoadDataSingle<int>(getMaxOrderSql, new { Product_Id = uploadDto.Product_Id });

                // Save image file
                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "product-gallery");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"gallery_{uploadDto.Product_Id}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString().Substring(0, 8)}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await uploadDto.Image.CopyToAsync(stream);
                }

                string dbPath = $"/product-gallery/{uniqueFileName}";
                int newDisplayOrder = uploadDto.Display_Order ?? (maxOrder + 1);

                // Insert into database
                string insertSql = @"
            INSERT INTO ProductGallery (Product_Id, Image_Path, Display_Order, IsActive, Created_At)
            VALUES (@Product_Id, @Image_Path, @Display_Order, 1, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() AS int);";

                var galleryId = _dapper.LoadDataSingle<int>(insertSql, new
                {
                    Product_Id = uploadDto.Product_Id,
                    Image_Path = dbPath,
                    Display_Order = newDisplayOrder
                });

                return Ok(new
                {
                    status = true,
                    message = "Image uploaded successfully",
                    galleryId = galleryId,
                    imagePath = dbPath,
                    displayOrder = newDisplayOrder
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading gallery image: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/Products/gallery/{galleryId}
        [HttpDelete("gallery/{galleryId}")]
        public IActionResult DeleteGalleryImage(int galleryId)
        {
            try
            {
                // Get image path first
                string getImageSql = "SELECT Image_Path FROM ProductGallery WHERE Gallery_Id = @Gallery_Id";
                var imagePath = _dapper.LoadDataSingleOrDefault<string>(getImageSql, new { Gallery_Id = galleryId });

                if (imagePath == null)
                    return NotFound(new { error = "Gallery image not found" });

                // Delete from database
                string deleteSql = "DELETE FROM ProductGallery WHERE Gallery_Id = @Gallery_Id";
                var deleted = _dapper.ExecuteSql(deleteSql, new { Gallery_Id = galleryId });

                if (!deleted)
                    return StatusCode(500, new { error = "Failed to delete gallery image" });

                // Delete physical file
                DeleteOldProductImage(imagePath);

                return Ok(new { status = true, message = "Gallery image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/Products/gallery/reorder
        [HttpPut("gallery/reorder")]
        public IActionResult ReorderGalleryImages([FromBody] List<ReorderGalleryImageDto> reorderList)
        {
            try
            {
                foreach (var item in reorderList)
                {
                    string updateSql = "UPDATE ProductGallery SET Display_Order = @NewDisplayOrder WHERE Gallery_Id = @Gallery_Id";
                    _dapper.ExecuteSql(updateSql, new { Gallery_Id = item.Gallery_Id, NewDisplayOrder = item.NewDisplayOrder });
                }

                return Ok(new { status = true, message = "Gallery reordered successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/Products/gallery/set-main
        [HttpPut("gallery/set-main")]
        public IActionResult SetMainImage([FromBody] SetMainImageDto setMainDto)
        {
            try
            {
                // Get the image path from gallery
                string getImageSql = "SELECT Image_Path FROM ProductGallery WHERE Gallery_Id = @Gallery_Id AND Product_Id = @Product_Id";
                var imagePath = _dapper.LoadDataSingleOrDefault<string>(getImageSql, new
                {
                    Gallery_Id = setMainDto.Gallery_Id,
                    Product_Id = setMainDto.Product_Id
                });

                if (imagePath == null)
                    return NotFound(new { error = "Gallery image not found" });

                // Update the main product image
                string updateProductSql = "UPDATE Products SET Img = @Img WHERE Product_Id = @Product_Id";
                _dapper.ExecuteSql(updateProductSql, new { Img = imagePath, Product_Id = setMainDto.Product_Id });

                return Ok(new { status = true, message = "Main image updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DTO for bulk updates
        public class BulkUpdateDto
        {
            public List<int> ProductIds { get; set; }
            public string Action { get; set; } // "out-of-stock", "discount"
            public decimal? Value { get; set; } // discount percentage (e.g., 10 for 10% off)
        }

        // DTO for bulk stock update
        public class BulkStockUpdateDto
        {
            public List<int> ProductIds { get; set; }
            public int Quantity { get; set; } // New quantity value
        }

        [HttpPost("BulkUpdate")]
        public IActionResult BulkUpdateProducts([FromBody] BulkUpdateDto bulkUpdate)
        {
            if (bulkUpdate.ProductIds == null || bulkUpdate.ProductIds.Count == 0)
            {
                return BadRequest(new { error = "No products selected" });
            }

            try
            {
                int productsAffected = 0;
                int variantsAffected = 0;

                // Create comma-separated list of IDs for SQL IN clause
                string ids = string.Join(",", bulkUpdate.ProductIds);

                switch (bulkUpdate.Action.ToLower())
                {
                    case "out-of-stock":
                        // Update main products - set quantity to 0
                        string sqlProductsOutOfStock = $@"
                    UPDATE Products 
                    SET Quantity = 0, UpdatedAt = GETDATE() 
                    WHERE Product_Id IN ({ids})";
                        productsAffected = _dapper.ExecuteSqlWithRowCount(sqlProductsOutOfStock);

                        // Update variants - set quantity to 0
                        string sqlVariantsOutOfStock = $@"
                    UPDATE ProductVariants 
                    SET Quantity = 0, Updated_At = GETDATE() 
                    WHERE Product_Id IN ({ids}) AND IsActive = 1";
                        variantsAffected = _dapper.ExecuteSqlWithRowCount(sqlVariantsOutOfStock);

                        return Ok(new
                        {
                            status = true,
                            message = $"{productsAffected} product(s) and {variantsAffected} variant(s) set to out of stock",
                            productsAffected = productsAffected,
                            variantsAffected = variantsAffected
                        });

                    case "in-stock":
                        // Update main products - set quantity to 100
                        string sqlProductsInStock = $@"
                    UPDATE Products 
                    SET Quantity = 100, UpdatedAt = GETDATE() 
                    WHERE Product_Id IN ({ids})";
                        productsAffected = _dapper.ExecuteSqlWithRowCount(sqlProductsInStock);

                        // Update variants - set quantity to 100
                        string sqlVariantsInStock = $@"
                    UPDATE ProductVariants 
                    SET Quantity = 100, Updated_At = GETDATE() 
                    WHERE Product_Id IN ({ids}) AND IsActive = 1";
                        variantsAffected = _dapper.ExecuteSqlWithRowCount(sqlVariantsInStock);

                        return Ok(new
                        {
                            status = true,
                            message = $"{productsAffected} product(s) and {variantsAffected} variant(s) set to in stock",
                            productsAffected = productsAffected,
                            variantsAffected = variantsAffected
                        });

                    case "discount":
                        // Apply percentage discount - only to main products
                        if (!bulkUpdate.Value.HasValue || bulkUpdate.Value <= 0)
                        {
                            return BadRequest(new { error = "Discount percentage is required" });
                        }

                        if (bulkUpdate.Value > 100)
                        {
                            return BadRequest(new { error = "Discount percentage cannot exceed 100%" });
                        }

                        decimal discountMultiplier = (100 - bulkUpdate.Value.Value) / 100m;

                        string sqlDiscount = $@"
                    UPDATE Products 
                    SET SalePrice = ROUND(Price * @DiscountMultiplier, 2),
                        ProductsOnSale = 1,
                        UpdatedAt = GETDATE() 
                    WHERE Product_Id IN ({ids})";

                        productsAffected = _dapper.ExecuteSqlWithRowCount(sqlDiscount, new { DiscountMultiplier = discountMultiplier });

                        return Ok(new
                        {
                            status = true,
                            message = $"{productsAffected} product(s) had {bulkUpdate.Value}% discount applied",
                            productsAffected = productsAffected,
                            discountPercentage = bulkUpdate.Value
                        });

                    case "remove-discount":
                        // Remove ProductsOnSale flag - only from main products
                        string sqlRemoveDiscount = $@"
                    UPDATE Products 
                    SET ProductsOnSale = 0,
                        SalePrice = NULL,
                        SaleEndDate = NULL,
                        UpdatedAt = GETDATE()
                    WHERE Product_Id IN ({ids})";
                        productsAffected = _dapper.ExecuteSqlWithRowCount(sqlRemoveDiscount);

                        return Ok(new
                        {
                            status = true,
                            message = $"{productsAffected} product(s) discount removed",
                            productsAffected = productsAffected
                        });

                    default:
                        return BadRequest(new { error = $"Unknown action: {bulkUpdate.Action}. Allowed: 'out-of-stock', 'in-stock', 'discount', 'remove-discount'" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in BulkUpdate: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Also update BulkSetStock to handle variants
        [HttpPost("BulkSetStock")]
        public IActionResult BulkSetStock([FromBody] BulkStockUpdateDto stockUpdate)
        {
            if (stockUpdate.ProductIds == null || stockUpdate.ProductIds.Count == 0)
            {
                return BadRequest(new { error = "No products selected" });
            }

            if (stockUpdate.Quantity < 0)
            {
                return BadRequest(new { error = "Quantity cannot be negative" });
            }

            try
            {
                string ids = string.Join(",", stockUpdate.ProductIds);

                // Update main products
                string sqlProducts = $@"
            UPDATE Products 
            SET Quantity = @Quantity, UpdatedAt = GETDATE() 
            WHERE Product_Id IN ({ids})";
                int productsAffected = _dapper.ExecuteSqlWithRowCount(sqlProducts, new { Quantity = stockUpdate.Quantity });

                // Update variants
                string sqlVariants = $@"
            UPDATE ProductVariants 
            SET Quantity = @Quantity, Updated_At = GETDATE() 
            WHERE Product_Id IN ({ids}) AND IsActive = 1";
                int variantsAffected = _dapper.ExecuteSqlWithRowCount(sqlVariants, new { Quantity = stockUpdate.Quantity });

                return Ok(new
                {
                    status = true,
                    message = $"{productsAffected} product(s) and {variantsAffected} variant(s) updated to quantity: {stockUpdate.Quantity}",
                    productsAffected = productsAffected,
                    variantsAffected = variantsAffected,
                    newQuantity = stockUpdate.Quantity
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in BulkSetStock: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }


        // Add this method to get variants for a product
        private List<ProductVariantDto> GetProductVariants(int productId)
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

            return _dapper.LoadData<ProductVariantDto>(sql, new { Product_Id = productId }).ToList();
        }

        private T DeserializeArrayField<T>(string fieldName)
        {
            var value = Request.Form[fieldName].ToString();
            if (string.IsNullOrEmpty(value) || value == "null" || value == "[]")
                return default(T);

            return JsonConvert.DeserializeObject<T>(value);
        }
    }
}
