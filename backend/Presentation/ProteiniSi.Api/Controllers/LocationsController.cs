using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Caching;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/locations")]
[Authorize(Policy = "SuperAdmin")]
public class LocationsController(IAddressLookupService service, IOutputCacheStore outputCache) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("checkout-options")]
    [OutputCache(Tags = [CacheTags.AddressLookup])]
    public async Task<IActionResult> GetCheckoutOptions()
    {
        var options = await service.GetCheckoutOptionsAsync();
        return Ok(new { status = true, data = options });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminOptions()
    {
        var data = await service.GetAdminOptionsAsync();
        return Ok(new { status = true, data });
    }

    [HttpPut("admin/cities/{cityId:int}/deliver")]
    public async Task<IActionResult> UpdateCityDeliver(int cityId, [FromBody] UpdateCityDeliverDto dto)
    {
        await service.UpdateCityDeliverAsync(cityId, dto.Deliver);
        await outputCache.EvictByTagAsync(CacheTags.AddressLookup, default);
        return Ok(new { status = true, message = "City delivery setting updated" });
    }

    [HttpPut("admin/cities/bulk-deliver")]
    public async Task<IActionResult> BulkUpdateCityDeliver([FromBody] BulkUpdateCityDeliverDto dto)
    {
        var rowsAffected = await service.BulkUpdateCityDeliverByTypeAsync(dto.IsTown, dto.Deliver);
        await outputCache.EvictByTagAsync(CacheTags.AddressLookup, default);
        return Ok(new { status = true, rowsAffected, message = "Cities delivery setting updated" });
    }

    [HttpPut("admin/countries/{countryId:int}/allow-phone")]
    public async Task<IActionResult> UpdateCountryAllowPhone(int countryId, [FromBody] UpdateCountryAllowPhoneDto dto)
    {
        await service.UpdateCountryAllowPhoneAsync(countryId, dto.AllowPhone);
        await outputCache.EvictByTagAsync(CacheTags.AddressLookup, default);
        return Ok(new { status = true, message = "Country phone setting updated" });
    }
}
