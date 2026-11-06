using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Caching;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Api.Controllers;

[Route("api/admin/cache")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class AdminCacheController(IOutputCacheStore outputCache, ICdnCacheService cdnCache) : ControllerBase
{
    /// <summary>
    /// Clears the API output cache and the CDN (Cloudflare) edge cache, so newly uploaded
    /// images and content are served immediately.
    /// </summary>
    [HttpPost("purge")]
    public async Task<IActionResult> Purge(CancellationToken cancellationToken)
    {
        foreach (var tag in CacheTags.All)
            await outputCache.EvictByTagAsync(tag, cancellationToken);

        var cdnConfigured = cdnCache.IsConfigured;
        var cdnPurged = cdnConfigured && await cdnCache.PurgeEverythingAsync(cancellationToken);

        return Ok(new
        {
            status = true,
            outputCacheCleared = true,
            cdnConfigured,
            cdnPurged,
            message = !cdnConfigured
                ? "API cache cleared. CDN purge is not configured."
                : cdnPurged
                    ? "API and CDN cache cleared."
                    : "API cache cleared, but the CDN purge failed."
        });
    }
}
