using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models.DTOs;

namespace ProteinisiBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class PromotionsController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public PromotionsController(IConfiguration configuration)
        {
            _dapper = new DataContextDapper(configuration);
        }

        private bool IsAdmin()
        {
            var claim = User.FindFirst("superAdmin")?.Value;
            return string.Equals(claim, "true", StringComparison.OrdinalIgnoreCase);
        }

        [AllowAnonymous]
        [HttpGet("active")]
        public IActionResult GetActive([FromQuery] decimal subtotal = 0)
        {
            var gifts = _dapper.LoadData<dynamic>(@"
SELECT fg.FreeGiftId, fg.ProductId, fg.VariantId,
       COALESCE(NULLIF(fg.DisplayName, ''),
           CASE WHEN fg.VariantId IS NULL THEN p.Name
                ELSE CONCAT(p.Name, ' - ', COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''), pv.Packaging_Name)) END
       ) AS DisplayName,
       fg.MinimumOrderAmount, COALESCE(pv.Variant_Image_Path, p.Img) AS Image,
       CASE WHEN fg.VariantId IS NULL THEN p.Quantity ELSE pv.Quantity END AS AvailableQuantity
FROM FreeGifts fg
INNER JOIN Products p ON p.Product_Id = fg.ProductId
LEFT JOIN ProductVariants pv ON pv.Variant_Id = fg.VariantId AND pv.Product_Id = fg.ProductId AND pv.IsActive = 1
WHERE fg.IsActive = 1
  AND (fg.ValidFrom IS NULL OR fg.ValidFrom <= GETDATE())
  AND (fg.ValidUntil IS NULL OR fg.ValidUntil >= GETDATE())
  AND fg.MinimumOrderAmount <= @Subtotal
  AND ((fg.VariantId IS NULL AND p.Quantity > 0) OR (fg.VariantId IS NOT NULL AND pv.Quantity > 0))
ORDER BY fg.MinimumOrderAmount, DisplayName", new { Subtotal = subtotal });

            // Promotion and voucher codes are intentionally never advertised to
            // anonymous checkout visitors. Customers must receive a code and
            // enter it explicitly; only eligible free gifts are listed here.
            return Ok(new { promoCodes = Array.Empty<object>(), freeGifts = gifts });
        }

        [AllowAnonymous]
        [HttpPost("validate")]
        public IActionResult Validate([FromBody] PromotionValidationDto dto)
        {
            var code = (dto.Code ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Enter a promotion code." });

            var promo = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT pc.*,
       (SELECT COUNT(*) FROM PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
       (SELECT COUNT(*) FROM PromoCodeUsages u
        WHERE u.PromoCodeId = pc.PromoCodeId
          AND @CustomerEmail IS NOT NULL
          AND LOWER(u.CustomerEmail) = LOWER(@CustomerEmail)) AS CustomerTimesUsed
FROM PromoCodes pc
WHERE UPPER(pc.Code) = @Code", new { Code = code, CustomerEmail = dto.CustomerEmail });

            var error = ValidatePromotion(promo, dto.Subtotal);
            if (error != null)
                return BadRequest(new { message = error });

            var discount = CalculateDiscount(promo, dto.Subtotal);
            return Ok(new
            {
                status = true,
                promoCodeId = (int)promo.PromoCodeId,
                code = (string)promo.Code,
                description = (string?)promo.Description,
                discountAmount = discount
            });
        }

        [Authorize]
        [HttpGet("admin/codes")]
        public IActionResult GetCodes()
        {
            if (!IsAdmin()) return Forbid();
            return Ok(_dapper.LoadData<dynamic>(@"
SELECT pc.*,
       (SELECT COUNT(*) FROM PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TimesUsed,
       (SELECT COALESCE(SUM(u.DiscountAmount), 0) FROM PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) AS TotalDiscount
FROM PromoCodes pc
ORDER BY pc.CreatedAt DESC"));
        }

        [Authorize]
        [HttpPost("admin/codes")]
        public IActionResult CreateCode([FromBody] PromotionCodeUpsertDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var validation = ValidateCodeDto(dto);
            if (validation != null) return BadRequest(new { message = validation });

            try
            {
                var id = _dapper.LoadDataSingle<int>(@"
INSERT INTO PromoCodes
    (Code, Description, DiscountType, DiscountValue, MinimumOrderAmount,
     MaximumDiscountAmount, UsageLimit, PerCustomerLimit, ValidFrom, ValidUntil,
     IsActive, CreatedAt, UpdatedAt)
VALUES
    (@Code, @Description, @DiscountType, @DiscountValue, @MinimumOrderAmount,
     @MaximumDiscountAmount, @UsageLimit, @PerCustomerLimit, @ValidFrom, @ValidUntil,
     @IsActive, GETDATE(), GETDATE());
SELECT CAST(SCOPE_IDENTITY() AS int);", CodeParameters(dto));
                return Ok(new { status = true, promoCodeId = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) ? "That promotion code already exists." : ex.Message });
            }
        }

        [Authorize]
        [HttpPut("admin/codes/{id:int}")]
        public IActionResult UpdateCode(int id, [FromBody] PromotionCodeUpsertDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var validation = ValidateCodeDto(dto);
            if (validation != null) return BadRequest(new { message = validation });

            var parameters = new Dictionary<string, object?>(CodeParameters(dto)) { ["PromoCodeId"] = id };
            var updated = _dapper.ExecuteSql(@"
UPDATE PromoCodes SET
    Code = @Code, Description = @Description, DiscountType = @DiscountType,
    DiscountValue = @DiscountValue, MinimumOrderAmount = @MinimumOrderAmount,
    MaximumDiscountAmount = @MaximumDiscountAmount, UsageLimit = @UsageLimit,
    PerCustomerLimit = @PerCustomerLimit, ValidFrom = @ValidFrom, ValidUntil = @ValidUntil,
    IsActive = @IsActive, UpdatedAt = GETDATE()
WHERE PromoCodeId = @PromoCodeId", parameters);
            return updated ? Ok(new { status = true }) : NotFound(new { message = "Promotion code not found." });
        }

        [Authorize]
        [HttpDelete("admin/codes/{id:int}")]
        public IActionResult DeleteCode(int id)
        {
            if (!IsAdmin()) return Forbid();
            var exists = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM PromoCodes WHERE PromoCodeId = @Id", new { Id = id });
            if (exists == 0) return NotFound(new { message = "Promotion code not found." });

            var used = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM PromoCodeUsages WHERE PromoCodeId = @Id", new { Id = id });
            if (used > 0)
            {
                _dapper.ExecuteSql(
                    "UPDATE PromoCodes SET IsActive = 0, UpdatedAt = GETDATE() WHERE PromoCodeId = @Id",
                    new { Id = id });
                return Ok(new
                {
                    status = true,
                    archived = true,
                    message = "This promotion was used by an order, so it was archived to preserve the sales report."
                });
            }

            _dapper.ExecuteSql("DELETE FROM PromoCodes WHERE PromoCodeId = @Id", new { Id = id });
            return Ok(new { status = true, archived = false, message = "Promotion code deleted." });
        }

        [Authorize]
        [HttpGet("admin/free-gifts")]
        public IActionResult GetFreeGifts()
        {
            if (!IsAdmin()) return Forbid();
            return Ok(_dapper.LoadData<dynamic>(@"
SELECT fg.*, p.Name AS ProductName,
       COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''), pv.Packaging_Name) AS VariantName,
       COALESCE(pv.Variant_Image_Path, p.Img) AS Image
FROM FreeGifts fg
INNER JOIN Products p ON p.Product_Id = fg.ProductId
LEFT JOIN ProductVariants pv ON pv.Variant_Id = fg.VariantId
ORDER BY fg.CreatedAt DESC"));
        }

        [Authorize]
        [HttpPost("admin/free-gifts")]
        public IActionResult CreateFreeGift([FromBody] FreeGiftUpsertDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var error = ValidateGiftDto(dto);
            if (error != null) return BadRequest(new { message = error });
            if (!GiftSelectionExists(dto)) return BadRequest(new { message = "The selected product or variant is invalid." });
            var id = _dapper.LoadDataSingle<int>(@"
INSERT INTO FreeGifts
    (ProductId, VariantId, DisplayName, MinimumOrderAmount, ValidFrom, ValidUntil, IsActive, CreatedAt, UpdatedAt)
VALUES
    (@ProductId, @VariantId, @DisplayName, @MinimumOrderAmount, @ValidFrom, @ValidUntil, @IsActive, GETDATE(), GETDATE());
SELECT CAST(SCOPE_IDENTITY() AS int);", dto);
            return Ok(new { status = true, freeGiftId = id });
        }

        [Authorize]
        [HttpPut("admin/free-gifts/{id:int}")]
        public IActionResult UpdateFreeGift(int id, [FromBody] FreeGiftUpsertDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var error = ValidateGiftDto(dto);
            if (error != null) return BadRequest(new { message = error });
            if (!GiftSelectionExists(dto)) return BadRequest(new { message = "The selected product or variant is invalid." });
            var updated = _dapper.ExecuteSql(@"
UPDATE FreeGifts SET ProductId = @ProductId, VariantId = @VariantId,
    DisplayName = @DisplayName, MinimumOrderAmount = @MinimumOrderAmount,
    ValidFrom = @ValidFrom, ValidUntil = @ValidUntil, IsActive = @IsActive,
    UpdatedAt = GETDATE()
WHERE FreeGiftId = @FreeGiftId", new
            {
                FreeGiftId = id,
                dto.ProductId,
                dto.VariantId,
                dto.DisplayName,
                dto.MinimumOrderAmount,
                dto.ValidFrom,
                dto.ValidUntil,
                dto.IsActive
            });
            return updated ? Ok(new { status = true }) : NotFound(new { message = "Free gift not found." });
        }

        [Authorize]
        [HttpDelete("admin/free-gifts/{id:int}")]
        public IActionResult DeleteFreeGift(int id)
        {
            if (!IsAdmin()) return Forbid();
            var exists = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM FreeGifts WHERE FreeGiftId = @Id", new { Id = id });
            if (exists == 0) return NotFound(new { message = "Free gift not found." });

            var used = _dapper.LoadDataSingle<int>(
                "SELECT COUNT(1) FROM OrderFreeGifts WHERE FreeGiftId = @Id", new { Id = id });
            if (used > 0)
            {
                _dapper.ExecuteSql(
                    "UPDATE FreeGifts SET IsActive = 0, UpdatedAt = GETDATE() WHERE FreeGiftId = @Id",
                    new { Id = id });
                return Ok(new
                {
                    status = true,
                    archived = true,
                    message = "This gift was used by an order, so it was archived to preserve order history."
                });
            }

            _dapper.ExecuteSql("DELETE FROM FreeGifts WHERE FreeGiftId = @Id", new { Id = id });
            return Ok(new { status = true, archived = false, message = "Free gift deleted." });
        }

        [Authorize]
        [HttpGet("admin/report")]
        public IActionResult GetUsageReport([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            if (!IsAdmin()) return Forbid();
            return Ok(LoadUsageReport(from, to));
        }

        [Authorize]
        [HttpGet("admin/report.csv")]
        public IActionResult ExportUsageReport([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            if (!IsAdmin()) return Forbid();
            var rows = LoadUsageReport(from, to);
            var csv = new StringBuilder("Code,Order Number,Customer Email,Discount Amount,Used At\r\n");
            foreach (var row in rows)
            {
                csv.Append(Csv(row.Code)).Append(',')
                   .Append(Csv(row.OrderNumber)).Append(',')
                   .Append(Csv(row.CustomerEmail)).Append(',')
                   .Append(Convert.ToDecimal(row.DiscountAmount).ToString("0.00", CultureInfo.InvariantCulture)).Append(',')
                   .Append(Csv(Convert.ToDateTime(row.UsedAt).ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture))).Append("\r\n");
            }
            var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
            return File(bytes, "text/csv; charset=utf-8", $"promo-code-usage-{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        private List<dynamic> LoadUsageReport(DateTime? from, DateTime? to) => _dapper.LoadData<dynamic>(@"
SELECT pc.Code, o.Order_Number AS OrderNumber, u.CustomerEmail, u.DiscountAmount, u.UsedAt
FROM PromoCodeUsages u
INNER JOIN PromoCodes pc ON pc.PromoCodeId = u.PromoCodeId
INNER JOIN Orders o ON o.Order_Id = u.OrderId
WHERE (@From IS NULL OR u.UsedAt >= @From)
  AND (@To IS NULL OR u.UsedAt < DATEADD(day, 1, @To))
ORDER BY u.UsedAt DESC", new { From = from, To = to }).ToList();

        private static string? ValidateCodeDto(PromotionCodeUpsertDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) return "Code is required.";
            var type = dto.DiscountType.Trim().ToLowerInvariant();
            if (type is not ("percentage" or "fixed")) return "Discount type must be percentage or fixed.";
            if (dto.DiscountValue <= 0) return "Discount value must be greater than zero.";
            if (type == "percentage" && dto.DiscountValue > 100) return "Percentage cannot exceed 100%.";
            if (dto.ValidFrom.HasValue && dto.ValidUntil.HasValue && dto.ValidUntil < dto.ValidFrom) return "End date must be after start date.";
            return null;
        }

        private static IDictionary<string, object?> CodeParameters(PromotionCodeUpsertDto dto) => new Dictionary<string, object?>
        {
            ["Code"] = dto.Code.Trim().ToUpperInvariant(),
            ["Description"] = dto.Description,
            ["DiscountType"] = dto.DiscountType.Trim().ToLowerInvariant(),
            ["DiscountValue"] = dto.DiscountValue,
            ["MinimumOrderAmount"] = Math.Max(0, dto.MinimumOrderAmount),
            ["MaximumDiscountAmount"] = dto.MaximumDiscountAmount,
            ["UsageLimit"] = dto.UsageLimit,
            ["PerCustomerLimit"] = dto.PerCustomerLimit,
            ["ValidFrom"] = dto.ValidFrom,
            ["ValidUntil"] = dto.ValidUntil,
            ["IsActive"] = dto.IsActive
        };

        private static string? ValidateGiftDto(FreeGiftUpsertDto dto)
        {
            if (dto.ProductId <= 0) return "Select a product for the free gift.";
            if (dto.ValidFrom.HasValue && dto.ValidUntil.HasValue && dto.ValidUntil < dto.ValidFrom) return "End date must be after start date.";
            return null;
        }

        private bool GiftSelectionExists(FreeGiftUpsertDto dto)
        {
            var count = _dapper.LoadDataSingle<int>(@"
SELECT COUNT(*)
FROM Products p
LEFT JOIN ProductVariants pv
  ON pv.Variant_Id = @VariantId
 AND pv.Product_Id = p.Product_Id
 AND pv.IsActive = 1
WHERE p.Product_Id = @ProductId
  AND ((@VariantId IS NULL AND p.HasVariants = 0)
       OR (@VariantId IS NOT NULL AND pv.Variant_Id IS NOT NULL))", new
            {
                dto.ProductId,
                dto.VariantId
            });
            return count == 1;
        }

        private static string? ValidatePromotion(dynamic? promo, decimal subtotal)
        {
            if (promo == null || !Convert.ToBoolean(promo.IsActive)) return "This promotion code is invalid or inactive.";
            var now = DateTime.Now;
            if (promo.ValidFrom != null && now < (DateTime)promo.ValidFrom) return "This promotion has not started yet.";
            if (promo.ValidUntil != null && now > (DateTime)promo.ValidUntil) return "This promotion has expired.";
            if (subtotal < Convert.ToDecimal(promo.MinimumOrderAmount)) return $"Minimum order amount is MKD {Convert.ToDecimal(promo.MinimumOrderAmount):0.00}.";
            if (promo.UsageLimit != null && Convert.ToInt32(promo.TimesUsed) >= Convert.ToInt32(promo.UsageLimit)) return "This promotion has reached its usage limit.";
            if (promo.PerCustomerLimit != null && Convert.ToInt32(promo.CustomerTimesUsed) >= Convert.ToInt32(promo.PerCustomerLimit)) return "You have already used this promotion the maximum number of times.";
            return null;
        }

        private static decimal CalculateDiscount(dynamic promo, decimal subtotal)
        {
            var value = Convert.ToDecimal(promo.DiscountValue);
            var discount = string.Equals((string)promo.DiscountType, "percentage", StringComparison.OrdinalIgnoreCase)
                ? subtotal * value / 100m
                : value;
            if (promo.MaximumDiscountAmount != null)
                discount = Math.Min(discount, Convert.ToDecimal(promo.MaximumDiscountAmount));
            return Math.Round(Math.Min(Math.Max(discount, 0m), subtotal), 2, MidpointRounding.AwayFromZero);
        }

        private static string Csv(object? value)
        {
            var text = Convert.ToString(value) ?? string.Empty;
            if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
                text = "'" + text;
            return $"\"{text.Replace("\"", "\"\"")}\"";
        }
    }
}
