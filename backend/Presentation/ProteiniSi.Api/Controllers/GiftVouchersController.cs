using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class GiftVouchersController : ControllerBase
{
    private readonly DataContextDapper _dapper;

    public GiftVouchersController(IConfiguration configuration)
    {
        _dapper = new DataContextDapper(configuration);
    }

    [AllowAnonymous]
    [HttpPost("validate")]
    public IActionResult Validate([FromBody] GiftVoucherValidationDto dto)
    {
        var code = NormalizeCode(dto.Code);
        if (code.Length < 8 || dto.OrderAmount <= 0)
            return BadRequest(new { status = false, message = "Enter a valid gift voucher code." });

        var voucher = _dapper.LoadDataSingleOrDefault<dynamic>(@"
SELECT GiftVoucherId, Code, RemainingValue, Status, ValidFrom, ExpiresAt
FROM GiftVouchers
WHERE Code = @Code", new { Code = code });

        if (voucher == null
            || !string.Equals(Convert.ToString(voucher.Status), "active", StringComparison.OrdinalIgnoreCase)
            || Convert.ToDateTime(voucher.ValidFrom) > DateTime.UtcNow
            || (voucher.ExpiresAt != null && Convert.ToDateTime(voucher.ExpiresAt) < DateTime.UtcNow)
            || Convert.ToDecimal(voucher.RemainingValue) <= 0)
        {
            return BadRequest(new { status = false, message = "This gift voucher is invalid, expired, disabled or has no remaining balance." });
        }

        var remaining = Convert.ToDecimal(voucher.RemainingValue);
        return Ok(new
        {
            status = true,
            code,
            remainingValue = remaining,
            applicableAmount = Math.Min(remaining, dto.OrderAmount),
            currency = "MKD"
        });
    }

    [HttpGet("admin")]
    public IActionResult GetAdminVouchers(
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);
        var searchValue = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
        var statusValue = string.IsNullOrWhiteSpace(status) ? null : status.Trim().ToLowerInvariant();
        const string where = @"
WHERE (@Search IS NULL OR v.Code LIKE @Search OR v.PurchaserEmail LIKE @Search OR v.RecipientEmail LIKE @Search)
  AND (@Status IS NULL OR v.Status = @Status)";

        var parameters = new
        {
            Search = searchValue,
            Status = statusValue,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        };
        var totalCount = _dapper.LoadDataSingle<int>($"SELECT COUNT(1) FROM GiftVouchers v {where}", parameters);
        var rows = _dapper.LoadData<dynamic>($@"
SELECT v.GiftVoucherId, v.Code, v.InitialValue, v.RemainingValue, v.Currency,
       CASE WHEN v.Status = 'active' AND v.ExpiresAt < SYSUTCDATETIME() THEN 'expired' ELSE v.Status END AS Status,
       v.PurchasedOrderId, v.PurchaserEmail, v.RecipientEmail, v.ValidFrom, v.ExpiresAt,
       v.CreatedAt, v.UpdatedAt,
       (SELECT COUNT(1) FROM GiftVoucherRedemptions r WHERE r.GiftVoucherId = v.GiftVoucherId AND r.Status = 'redeemed') AS RedemptionCount,
       (SELECT COALESCE(SUM(r.Amount), 0) FROM GiftVoucherRedemptions r WHERE r.GiftVoucherId = v.GiftVoucherId AND r.Status = 'redeemed') AS RedeemedValue
FROM GiftVouchers v
{where}
ORDER BY v.CreatedAt DESC, v.GiftVoucherId DESC
OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY", parameters);

        return Ok(new
        {
            status = true,
            data = rows,
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpPut("admin/{id:int}/status")]
    public IActionResult UpdateStatus(int id, [FromBody] GiftVoucherStatusDto dto)
    {
        var status = (dto.Status ?? string.Empty).Trim().ToLowerInvariant();
        if (status is not ("active" or "disabled"))
            return BadRequest(new { status = false, message = "Status must be active or disabled." });

        var updated = _dapper.ExecuteSqlWithRowCount(@"
UPDATE GiftVouchers
SET Status = CASE
        WHEN RemainingValue <= 0 THEN 'depleted'
        WHEN @Status = 'disabled' THEN 'disabled'
        WHEN @ExpiresAt IS NOT NULL AND @ExpiresAt < SYSUTCDATETIME() THEN 'expired'
        ELSE 'active'
    END,
    ExpiresAt = @ExpiresAt,
    UpdatedAt = SYSUTCDATETIME()
WHERE GiftVoucherId = @Id", new { Id = id, Status = status, dto.ExpiresAt });

        return updated == 1
            ? Ok(new { status = true })
            : NotFound(new { status = false, message = "Gift voucher not found." });
    }

    [HttpGet("admin/report.csv")]
    public IActionResult ExportReport()
    {
        var rows = _dapper.LoadData<dynamic>(@"
SELECT v.Code, v.InitialValue, v.RemainingValue,
       CASE WHEN v.Status = 'active' AND v.ExpiresAt < SYSUTCDATETIME() THEN 'expired' ELSE v.Status END AS Status,
       v.PurchasedOrderId,
       v.PurchaserEmail, v.RecipientEmail, v.ValidFrom, v.ExpiresAt, v.CreatedAt,
       r.OrderId AS RedemptionOrderId, r.Amount AS RedemptionAmount,
       r.Status AS RedemptionStatus, r.CreatedAt AS RedemptionCreatedAt
FROM GiftVouchers v
LEFT JOIN GiftVoucherRedemptions r ON r.GiftVoucherId = v.GiftVoucherId
ORDER BY v.CreatedAt DESC, r.CreatedAt DESC");

        var csv = new StringBuilder("Code,Initial value,Remaining value,Status,Purchase order,Purchaser,Recipient,Valid from,Expires,Redemption order,Redemption amount,Redemption status,Redemption date\r\n");
        foreach (var row in rows)
        {
            csv.Append(Csv(row.Code)).Append(',').Append(Csv(row.InitialValue)).Append(',')
                .Append(Csv(row.RemainingValue)).Append(',').Append(Csv(row.Status)).Append(',')
                .Append(Csv(row.PurchasedOrderId)).Append(',').Append(Csv(row.PurchaserEmail)).Append(',')
                .Append(Csv(row.RecipientEmail)).Append(',').Append(Csv(FormatDate(row.ValidFrom))).Append(',')
                .Append(Csv(FormatDate(row.ExpiresAt))).Append(',').Append(Csv(row.RedemptionOrderId)).Append(',')
                .Append(Csv(row.RedemptionAmount)).Append(',').Append(Csv(row.RedemptionStatus)).Append(',')
                .Append(Csv(FormatDate(row.RedemptionCreatedAt))).Append("\r\n");
        }
        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
        return File(bytes, "text/csv; charset=utf-8", $"gift-vouchers-{DateTime.UtcNow:yyyyMMdd-HHmm}.csv");
    }

    private static string NormalizeCode(string? value) => (value ?? string.Empty).Trim().ToUpperInvariant();
    private static string FormatDate(object? value) => value == null
        ? string.Empty
        : Convert.ToDateTime(value).ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
    private static string Csv(object? value)
    {
        var text = Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0])) text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}

public class GiftVoucherValidationDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}

public class GiftVoucherStatusDto
{
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
}
