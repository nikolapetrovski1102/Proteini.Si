using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Authorize(Policy = "SuperAdmin")]
[Route("api/admin/[controller]")]
[ApiController]
public class ProductVariantController(IProductVariantService service) : ControllerBase
{
    private bool IsAdmin()
    {
        var isAdminClaim = User.FindFirst("superAdmin")?.Value;
        return isAdminClaim == "True" || isAdminClaim == "true";
    }

    private IActionResult AdminRequired() => Unauthorized(new { message = "Admin access required" });

    [AllowAnonymous]
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetVariantsByProduct(int productId) =>
        Ok(new { status = true, data = await service.GetByProductAsync(productId) });

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVariantById(int id)
    {
        var variant = await service.GetByIdAsync(id);
        if (variant == null)
            return NotFound(new { message = "Variant not found" });

        return Ok(new { status = true, data = variant });
    }

    [HttpPost]
    public async Task<IActionResult> CreateVariant([FromBody] CreateProductVariantDto createDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        var variantId = await service.CreateAsync(createDto);
        return Ok(new { status = true, message = "Variant created successfully", variantId });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateVariant([FromBody] UpdateProductVariantDto updateDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        if (!await service.UpdateAsync(updateDto))
            return NotFound(new { message = "Variant not found" });

        return Ok(new { status = true, message = "Variant updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVariant(int id)
    {
        if (!IsAdmin())
            return AdminRequired();

        if (!await service.DeleteAsync(id))
            return NotFound(new { message = "Variant not found" });

        return Ok(new { status = true, message = "Variant deleted successfully" });
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadVariantImage([FromForm] IFormFile Image, [FromForm] int? Variant_Id)
    {
        var imagePath = await service.UploadImageAsync(Image, Variant_Id);
        return Ok(new { status = true, imagePath, message = "Image uploaded successfully" });
    }

    [AllowAnonymous]
    [HttpGet("{variantId}/gallery")]
    public async Task<IActionResult> GetVariantGallery(int variantId) =>
        Ok(await service.GetGalleryAsync(variantId));

    [HttpPost("gallery/upload")]
    public async Task<IActionResult> UploadVariantGalleryImage([FromForm] IFormFile Image, [FromForm] int Variant_Id)
    {
        var (gallery, imagePath) = await service.UploadGalleryImageAsync(Image, Variant_Id);
        return Ok(new { status = true, galleryId = gallery.GalleryId, imagePath, isMain = gallery.IsMain });
    }

    [HttpDelete("gallery/{galleryId}")]
    public async Task<IActionResult> DeleteVariantGalleryImage(int galleryId)
    {
        if (!await service.DeleteGalleryImageAsync(galleryId))
            return NotFound(new { error = "Gallery image not found" });

        return Ok(new { status = true, message = "Gallery image deleted successfully" });
    }

    [HttpPut("gallery/set-main")]
    public async Task<IActionResult> SetMainVariantGalleryImage([FromBody] SetMainVariantGalleryImageDto dto)
    {
        await service.SetMainGalleryImageAsync(dto);
        return Ok(new { status = true, message = "Main image updated successfully" });
    }

    [HttpGet("{variantId}/nutrition")]
    public async Task<IActionResult> GetVariantNutrition(int variantId)
    {
        var nutrition = await service.GetNutritionAsync(variantId);
        if (nutrition == null)
            return NotFound(new { error = "Variant not found" });

        return Ok(nutrition);
    }

    [HttpPost("{variantId}/nutrition")]
    public async Task<IActionResult> SaveVariantNutrition(int variantId, [FromBody] VariantNutritionDto nutritionData)
    {
        if (!IsAdmin())
            return AdminRequired();

        if (!await service.SaveNutritionAsync(variantId, nutritionData))
            return NotFound(new { error = "Variant not found" });

        return Ok(new { status = true, message = "Nutrition data saved successfully" });
    }

    [HttpDelete("{variantId}/nutrition")]
    public async Task<IActionResult> DeleteVariantNutrition(int variantId)
    {
        if (!IsAdmin())
            return AdminRequired();

        await service.DeleteNutritionAsync(variantId);
        return Ok(new { status = true, message = "Nutrition data deleted successfully" });
    }

    [HttpPost("{variantId}/nutrition-table/paste")]
    public async Task<IActionResult> PasteNutritionTable(int variantId, [FromBody] PasteNutritionTableDto pasteDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        var tableData = await service.PasteNutritionTableAsync(variantId, pasteDto.RawText);
        if (tableData == null)
            return NotFound(new { error = "Variant not found" });

        return Ok(new { status = true, message = "Nutrition table saved successfully", data = tableData });
    }

    [AllowAnonymous]
    [HttpGet("{variantId}/nutrition-table")]
    public async Task<IActionResult> GetNutritionTable(int variantId) =>
        Ok(new { status = true, data = await service.GetNutritionTableAsync(variantId) });

    [HttpPut("{variantId}/nutrition-table")]
    public async Task<IActionResult> UpdateNutritionTable(int variantId, [FromBody] UpdateNutritionTableDto updateDto)
    {
        if (!IsAdmin())
            return AdminRequired();

        if (!await service.UpdateNutritionTableAsync(variantId, updateDto))
            return NotFound(new { error = "Variant not found" });

        return Ok(new { status = true, message = "Nutrition table updated successfully" });
    }

    [AllowAnonymous]
    [HttpGet("parent/{variantId}")]
    public async Task<IActionResult> GetParentProductByVariantId(int variantId)
    {
        var parentProduct = await service.GetParentProductAsync(variantId);
        if (parentProduct == null)
            return NotFound(new { error = "Parent product not found for this variant" });

        return Ok(new { status = true, parentProductId = parentProduct.Product_Id, product = parentProduct });
    }

    [AllowAnonymous]
    [HttpGet("{id}/with-parent")]
    public async Task<IActionResult> GetVariantWithParent(int id)
    {
        var variant = await service.GetWithParentAsync(id);
        if (variant == null)
            return NotFound(new { error = "Variant not found" });

        return Ok(new { status = true, data = variant });
    }

    [HttpDelete("{variantId}/nutrition-table")]
    public async Task<IActionResult> DeleteNutritionTable(int variantId)
    {
        if (!IsAdmin())
            return AdminRequired();

        if (!await service.DeleteNutritionTableAsync(variantId))
            return NotFound(new { error = "Variant not found" });

        return Ok(new { status = true, message = "Nutrition table deleted successfully" });
    }
}
