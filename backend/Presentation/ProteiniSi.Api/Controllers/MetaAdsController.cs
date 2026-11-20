using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Services.MetaAds;

namespace ProteiniSi.Api.Controllers;

/// <summary>Meta ads dashboard API (meta-ads.proteini.mk). Every call needs the dashboard session cookie.</summary>
[ApiController]
[Route("api/meta-ads")]
[SkipClientKey]
[OutputCache(NoStore = true)]
[Authorize(Policy = MetaAdsSession.Policy)]
public class MetaAdsController(IMetaAdsService service) : ControllerBase
{
    private string CurrentUser => User.FindFirst(MetaAdsSession.EmailClaim)?.Value ?? "unknown";

    [HttpGet("status")]
    public async Task<IActionResult> Status() => Ok(await service.GetStatusAsync());

    [HttpGet("products")]
    public async Task<IActionResult> Products() => Ok(await service.GetProductsAsync());

    [HttpPost("images")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            throw new BadRequestException("Choose an image.");
        await using var stream = file.OpenReadStream();
        return Ok(await service.UploadImageAsync(stream, file.FileName, file.ContentType));
    }

    [HttpPost("preview")]
    public async Task<IActionResult> Preview([FromBody] MetaAdPublishDto request) => Ok(await service.PreviewAsync(request));

    [HttpPost("publish")]
    public async Task<IActionResult> Publish([FromBody] MetaAdPublishDto request) => Ok(await service.PublishAsync(request, CurrentUser));

    [HttpPost("estimate")]
    public async Task<IActionResult> Estimate([FromBody] MetaAdDeliveryDto delivery) => Ok(await service.EstimateAsync(delivery));

    [HttpGet("adsets")]
    public async Task<IActionResult> AdSets() => Ok(await service.GetAdSetsAsync());

    [HttpGet("ads")]
    public async Task<IActionResult> Ads([FromQuery] int limit = 25) => Ok(await service.GetAdsAsync(limit));

    [HttpPost("ads/{adId}/status")]
    public async Task<IActionResult> SetAdStatus(string adId, [FromBody] MetaAdStatusChangeDto request)
    {
        await service.SetAdStatusAsync(adId, request.Status ?? "", CurrentUser);
        return Ok(new { status = true });
    }
}
