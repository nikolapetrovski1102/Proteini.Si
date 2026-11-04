using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[Route("api/admin/[controller]")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpPost("TestAdd")]
    public IActionResult TestAdd([FromBody] ProductCreateDto productDto) =>
        Ok(new
        {
            received = true,
            name = productDto.Name,
            price = productDto.Price,
            ddv = productDto.DDV_Percentage
        });

    [AllowAnonymous]
    [HttpPost("Search")]
    public async Task<IActionResult> SearchProducts([FromBody] ProductSearchDto searchDto) =>
        Ok(await service.SearchAsync(searchDto));

    [AllowAnonymous]
    [HttpGet("GetAllProducts")]
    public async Task<IActionResult> GetAllProducts() =>
        Ok(await service.GetAllAsync());

    [HttpPut("EditProduct/{id}")]
    public async Task<IActionResult> EditProduct(int id, [FromForm] string productData, IFormFile? Image, [FromForm] string? RemoveImage)
    {
        var result = await service.UpdateAsync(id, productData, Image, RemoveImage);
        if (result == null)
            return NotFound("Product not found");

        return Ok(new
        {
            status = true,
            message = "Product updated successfully",
            imagePath = result.ImagePath,
            priceWithoutDDV = result.PriceWithoutDDV,
            priceWithDDV = result.PriceWithDDV,
            ddvAmount = result.DDVAmount
        });
    }

    [HttpDelete("DeleteProduct/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        if (!await service.DeleteAsync(id))
            return NotFound("Product not found");

        return Ok(new { status = true, message = "Product deleted successfully" });
    }

    [HttpPost("UploadProductImage{id}/upload-image")]
    public async Task<IActionResult> UploadProductImage(int id, IFormFile file)
    {
        var imagePath = await service.UploadImageAsync(id, file);
        return Ok(new { status = true, imagePath, message = "Image uploaded successfully" });
    }

    [AllowAnonymous]
    [HttpGet("GetFilterOptions")]
    public async Task<IActionResult> GetFilterOptions() =>
        Ok(await service.GetFilterOptionsAsync());

    [AllowAnonymous]
    [HttpPost("GetFilteredProducts")]
    public async Task<IActionResult> GetFilteredProducts([FromBody] ProductFilterDto filters) =>
        Ok(await service.GetFilteredAsync(filters));

    [HttpPost("AddProduct")]
    public async Task<IActionResult> AddProduct([FromForm] ProductCreateDto productDto)
    {
        var result = await service.CreateAsync(productDto);
        return Ok(new
        {
            status = true,
            productId = result.ProductId,
            imagePath = result.ImagePath,
            price = result.PriceWithDDV,
            ddvPercentage = productDto.DDV_Percentage,
            ddvAmount = result.DDVAmount,
            basePrice = result.PriceWithoutDDV,
            message = "Product created successfully"
        });
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(int id)
    {
        var product = await service.GetByIdAsync(id);
        if (product == null)
            return NotFound(new { error = $"Product with id {id} not found" });

        return Ok(product);
    }

    [AllowAnonymous]
    [HttpGet("{productId}/gallery")]
    public async Task<IActionResult> GetProductGallery(int productId) =>
        Ok(await service.GetGalleryAsync(productId));

    [HttpPost("gallery/upload")]
    public async Task<IActionResult> UploadGalleryImage([FromForm] UploadGalleryImageDto uploadDto)
    {
        var (gallery, imagePath) = await service.UploadGalleryImageAsync(uploadDto);
        return Ok(new
        {
            status = true,
            message = "Image uploaded successfully",
            galleryId = gallery.GalleryId,
            imagePath,
            displayOrder = gallery.DisplayOrder
        });
    }

    [HttpDelete("gallery/{galleryId}")]
    public async Task<IActionResult> DeleteGalleryImage(int galleryId)
    {
        if (!await service.DeleteGalleryImageAsync(galleryId))
            return NotFound(new { error = "Gallery image not found" });

        return Ok(new { status = true, message = "Gallery image deleted successfully" });
    }

    [HttpPut("gallery/reorder")]
    public async Task<IActionResult> ReorderGalleryImages([FromBody] List<ReorderGalleryImageDto> reorderList)
    {
        await service.ReorderGalleryAsync(reorderList);
        return Ok(new { status = true, message = "Gallery reordered successfully" });
    }

    [HttpPut("gallery/set-main")]
    public async Task<IActionResult> SetMainImage([FromBody] SetMainImageDto setMainDto)
    {
        if (!await service.SetMainImageAsync(setMainDto))
            return NotFound(new { error = "Gallery image not found" });

        return Ok(new { status = true, message = "Main image updated successfully" });
    }

    [HttpPost("BulkUpdate")]
    public async Task<IActionResult> BulkUpdateProducts([FromBody] BulkUpdateDto bulkUpdate) =>
        Ok(await service.BulkUpdateAsync(bulkUpdate));

    [HttpPost("BulkSetStock")]
    public async Task<IActionResult> BulkSetStock([FromBody] BulkStockUpdateDto stockUpdate)
    {
        var result = await service.BulkSetStockAsync(stockUpdate);
        return Ok(new
        {
            status = true,
            message = $"{result.ProductsAffected} product(s) and {result.VariantsAffected} variant(s) updated to quantity: {stockUpdate.Quantity}",
            productsAffected = result.ProductsAffected,
            variantsAffected = result.VariantsAffected,
            newQuantity = stockUpdate.Quantity
        });
    }
}
