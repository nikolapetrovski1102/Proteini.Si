using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Models.Dtos;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class TipArticlesController(ITipArticleService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetActiveArticles()
    {
        var articles = await service.GetActiveAsync();
        return Ok(new { status = true, data = articles });
    }

    [AllowAnonymous]
    [HttpGet("by-slug/{slug}")]
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
        return Ok(new { status = true, id, message = "Article created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateArticle([FromForm] TipArticleForm form)
    {
        await service.UpdateAsync(form);
        return Ok(new { status = true, message = "Article updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { status = true, message = "Article deleted successfully" });
    }
}
