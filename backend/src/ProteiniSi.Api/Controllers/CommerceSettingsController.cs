using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class CommerceSettingsController : ControllerBase
{
    private readonly DataContextDapper _dapper;

    public CommerceSettingsController(IConfiguration configuration)
    {
        _dapper = new DataContextDapper(configuration);
    }

    [AllowAnonymous]
    [HttpGet("shipping")]
    public IActionResult GetShipping()
    {
        try
        {
            var settings = _dapper.LoadDataSingleOrDefault<ShippingSettingsDto>(@"
SELECT FlatDeliveryFee, CashOnDeliveryFee, FreeDeliveryThreshold,
       HomeDeliveryEnabled, CardPaymentEnabled
FROM ShippingSettings WHERE ShippingSettingsId = 1");
            return Ok(new { status = true, data = settings ?? new ShippingSettingsDto() });
        }
        catch
        {
            // Keeps checkout available during a rolling deployment before the additive migration runs.
            return Ok(new { status = true, data = new ShippingSettingsDto() });
        }
    }

    [HttpPut("shipping")]
    public IActionResult UpdateShipping([FromBody] ShippingSettingsDto dto)
    {
        if (dto.FlatDeliveryFee < 0 || dto.CashOnDeliveryFee < 0 || dto.FreeDeliveryThreshold < 0)
            return BadRequest(new { status = false, message = "Shipping fees and threshold cannot be negative." });
        if (!dto.HomeDeliveryEnabled && !dto.CardPaymentEnabled)
            return BadRequest(new { status = false, message = "At least one payment method must remain enabled." });

        _dapper.ExecuteSql(@"
UPDATE ShippingSettings
SET FlatDeliveryFee = @FlatDeliveryFee,
    CashOnDeliveryFee = @CashOnDeliveryFee,
    FreeDeliveryThreshold = @FreeDeliveryThreshold,
    HomeDeliveryEnabled = @HomeDeliveryEnabled,
    CardPaymentEnabled = @CardPaymentEnabled,
    UpdatedAt = SYSUTCDATETIME(),
    UpdatedBy = @UpdatedBy
WHERE ShippingSettingsId = 1", new
        {
            dto.FlatDeliveryFee,
            dto.CashOnDeliveryFee,
            dto.FreeDeliveryThreshold,
            dto.HomeDeliveryEnabled,
            dto.CardPaymentEnabled,
            UpdatedBy = User.FindFirst("email")?.Value
        });
        return Ok(new { status = true });
    }
}

public class ShippingSettingsDto
{
    public decimal FlatDeliveryFee { get; set; } = 165m;
    public decimal CashOnDeliveryFee { get; set; } = 30m;
    public decimal FreeDeliveryThreshold { get; set; } = 3000m;
    public bool HomeDeliveryEnabled { get; set; } = true;
    public bool CardPaymentEnabled { get; set; } = true;
}
