using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using ProteiniSi.Api.Extensions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/// <summary>Affiliate codes and short links. The storefront's /r/&lt;slug&gt; page calls the public resolve endpoint.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class AffiliatesController(IAffiliateService service) : ControllerBase
{
    /// <summary>Counts the visit and returns the page to open plus the promo code to remember for checkout.</summary>
    [AllowAnonymous]
    [HttpGet("r/{slug}")]
    [EnableRateLimiting(CheckoutAbuseExtensions.AnalyticsPolicy)]
    [OutputCache(NoStore = true)] // every visit must reach the database: it counts the click
    public async Task<IActionResult> Resolve(string slug)
    {
        Response.Headers.CacheControl = "no-store";
        var target = await service.ResolveLinkAsync(slug, countClick: true);
        return target == null
            ? NotFound(new { message = "Link not found." })
            : Ok(new { targetPath = target.TargetPath, code = target.Code });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null) =>
        Ok(await service.GetAllAsync(from, to));

    [HttpGet("admin/report.csv")]
    public async Task<IActionResult> Export([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        var export = await service.ExportAsync(from, to);
        return File(export.Content, "text/csv; charset=utf-8", export.FileName);
    }

    [HttpGet("admin/{id:int}")]
    public async Task<IActionResult> GetDetails(int id, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null) =>
        Ok(await service.GetDetailsAsync(id, from, to));

    [HttpPost("admin")]
    public async Task<IActionResult> Create([FromBody] AffiliateUpsertDto dto) =>
        Ok(new { status = true, affiliateId = await service.CreateAsync(dto) });

    [HttpPost("admin/quick")]
    public async Task<IActionResult> QuickCreate([FromBody] AffiliateQuickCreateDto dto)
    {
        var created = await service.QuickCreateAsync(dto);
        return Ok(new { status = true, created.AffiliateId, created.PromoCodeId, created.ShortLinkId });
    }

    [HttpPut("admin/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AffiliateUpsertDto dto)
    {
        await service.UpdateAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpDelete("admin/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var archived = await service.DeleteAsync(id);
        return Ok(new
        {
            status = true,
            archived,
            message = archived
                ? "This affiliate has orders, so it was archived (codes and links switched off) to keep the sales history."
                : "Affiliate deleted."
        });
    }

    [HttpPost("admin/{id:int}/codes")]
    public async Task<IActionResult> AddCode(int id, [FromBody] PromotionCodeUpsertDto dto) =>
        Ok(new { status = true, promoCodeId = await service.AddCodeAsync(id, dto) });

    /// <summary>Assigns an existing promo code to an affiliate, or unassigns it (affiliateId null).</summary>
    [HttpPut("admin/codes/{promoCodeId:int}/owner")]
    public async Task<IActionResult> SetCodeOwner(int promoCodeId, [FromBody] AffiliateCodeOwnerDto dto)
    {
        await service.SetCodeOwnerAsync(promoCodeId, dto.AffiliateId);
        return Ok(new { status = true });
    }

    [HttpGet("admin/links")]
    public async Task<IActionResult> GetLinks([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null) =>
        Ok(await service.GetLinksAsync(from, to));

    [HttpPost("admin/links")]
    public async Task<IActionResult> CreateLink([FromBody] ShortLinkUpsertDto dto) =>
        Ok(new { status = true, shortLinkId = await service.CreateLinkAsync(dto) });

    [HttpPut("admin/links/{id:int}")]
    public async Task<IActionResult> UpdateLink(int id, [FromBody] ShortLinkUpsertDto dto)
    {
        await service.UpdateLinkAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpDelete("admin/links/{id:int}")]
    public async Task<IActionResult> DeleteLink(int id)
    {
        await service.DeleteLinkAsync(id);
        return Ok(new { status = true, message = "Short link deleted." });
    }
}
