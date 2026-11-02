using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using ProteiniSi.Api.Caching;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class TipArticlesController(ITipArticleService service, IOutputCacheStore cache) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    [OutputCache(Tags = [CacheTags.TipArticles])]
    public async Task<IActionResult> GetActiveArticles()
    {
        var articles = await service.GetActiveAsync();
        return Ok(new { status = true, data = articles });
    }

    [AllowAnonymous]
    [HttpGet("by-slug/{slug}")]
    [OutputCache(Tags = [CacheTags.TipArticles])]
    public async Task<IActionResult> GetArticleBySlug(string slug)
    {
        var article = await service.GetActiveBySlugAsync(slug);
        return Ok(new { status = true, data = article });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllArticles()
    {
        var articles = await service.GetAllAsync();
        return Ok(new { status = true, data = articles });
    }

    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromForm] TipArticleForm form)
    {
        var id = await service.CreateAsync(form);
        await cache.EvictByTagAsync(CacheTags.TipArticles, default);
        return Ok(new { status = true, id, message = "Article created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateArticle([FromForm] TipArticleForm form)
    {
        await service.UpdateAsync(form);
        await cache.EvictByTagAsync(CacheTags.TipArticles, default);
        return Ok(new { status = true, message = "Article updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        await service.DeleteAsync(id);
        await cache.EvictByTagAsync(CacheTags.TipArticles, default);
        return Ok(new { status = true, message = "Article deleted successfully" });
    }
}
