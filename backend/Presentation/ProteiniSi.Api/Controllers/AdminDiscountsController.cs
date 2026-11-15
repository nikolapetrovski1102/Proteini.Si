using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

/** Automatic discounts (no code) on chosen products, brands or categories. */
[ApiController]
[Route("api/admin/discounts")]
[Authorize(Policy = "SuperAdmin")]
public class AdminDiscountsController(IDiscountService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    /** Every variant (flavor + weight) and product without variants a product discount can pick. */
    [HttpGet("items")]
    public async Task<IActionResult> GetItemOptions() => Ok(await service.GetItemOptionsAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DiscountWriteDto dto)
    {
        var id = await service.CreateAsync(dto);
        return Ok(new { status = true, discountId = id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DiscountWriteDto dto)
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
