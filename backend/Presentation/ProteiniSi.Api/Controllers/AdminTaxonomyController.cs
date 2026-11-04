using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/admin/taxonomy")]
[Authorize(Policy = "SuperAdmin")]
public class AdminTaxonomyController(ITaxonomyService service) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories() => Ok(await service.GetCategoriesAsync());

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryWriteDto dto)
    {
        var id = await service.CreateCategoryAsync(dto);
        return Ok(new { status = true, categoryId = id });
    }

    [HttpPut("categories/{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryWriteDto dto)
    {
        await service.UpdateCategoryAsync(id, dto);
        return Ok(new { status = true });
    }

    [AllowAnonymous]
    [HttpGet("category-slug/{slug}")]
    public async Task<IActionResult> ResolveCategorySlug(string slug)
    {
        var current = await service.ResolveCategorySlugAsync(slug);
        return current == null
            ? NotFound(new { status = false })
            : Ok(new { status = true, categoryId = current.Category_Id, slug = current.Category_Slug });
    }

    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await service.DeleteCategoryAsync(id);
        return Ok(new { status = true });
    }
}
