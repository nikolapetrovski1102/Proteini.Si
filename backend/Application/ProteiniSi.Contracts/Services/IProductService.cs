using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IProductService
{
    Task<ProductSearchResponseDto> SearchAsync(ProductSearchDto search);

    Task<List<Product>> GetAllAsync();

    Task<ProductFilterOptionsDto> GetFilterOptionsAsync();

    Task<ProductFilterResponseDto> GetFilteredAsync(ProductFilterDto filters);

    Task<ProductDetailsDto?> GetByIdAsync(int productId);

    Task<ProductSaveResultDto> CreateAsync(ProductCreateDto product);

    Task<ProductSaveResultDto?> UpdateAsync(int productId, string productData, IFormFile? image, string? removeImage);

    Task<bool> DeleteAsync(int productId);

    Task<string> UploadImageAsync(int productId, IFormFile file);

    Task<List<ProductGallery>> GetGalleryAsync(int productId);

    Task<(ProductGalleryCreated Gallery, string ImagePath)> UploadGalleryImageAsync(UploadGalleryImageDto upload);

    Task<bool> DeleteGalleryImageAsync(int galleryId);

    Task ReorderGalleryAsync(List<ReorderGalleryImageDto> reorderList);

    Task<bool> SetMainImageAsync(SetMainImageDto setMain);

    Task<object> BulkUpdateAsync(BulkUpdateDto bulkUpdate);

    Task<ProductBulkResult> BulkSetStockAsync(BulkStockUpdateDto stockUpdate);
}
