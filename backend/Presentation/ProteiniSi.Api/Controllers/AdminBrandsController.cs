using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/** Brands admin. The shop reads brands (incl. the four featured ones) from the product filter options. */
[ApiController]
[Route("api/admin/brands")]
[Authorize(Policy = "SuperAdmin")]
public class AdminBrandsController(IBrandService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpPost]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Create([FromForm] BrandWriteDto dto)
    {
        var id = await service.CreateAsync(dto);
        return Ok(new { status = true, brandId = id });
    }

    [HttpPut("{id:int}")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Update(int id, [FromForm] BrandWriteDto dto)
    {
        await service.UpdateAsync(id, dto);
        return Ok(new { status = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { status = true });
    }
}
