using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IProductProvider
{
    Task<(int TotalCount, List<ProductSearchResultDto> Products)> SearchAsync(ProductSearchQuery query);

    Task<List<Product>> GetAllAsync();

    Task<(ProductFilterOptionsDto Options, decimal MaximumPrice)> GetFilterOptionsAsync();

    Task<List<ProductCategory>> GetCategoryTreeAsync();

    Task<(int TotalCount, List<Product> Products)> FilterAsync(ProductFilterQuery query);

    Task<ProductDetailsDto?> GetByIdAsync(int productId);

    Task<bool> ExistsAsync(int productId);

    Task<int> CreateAsync(ProductWrite product);

    Task<ProductImageChange?> UpdateAsync(int productId, ProductWrite product, bool replaceImage, string? image);

    Task<ProductImageChange?> DeleteAsync(int productId);

    Task<ProductImageChange?> SetImageAsync(int productId, string? image, bool touchUpdatedAt);

    Task<ProductBulkResult> BulkSetQuantityAsync(IEnumerable<int> productIds, int quantity);

    Task<int> BulkApplyDiscountAsync(IEnumerable<int> productIds, decimal discountMultiplier);

    Task<int> BulkRemoveDiscountAsync(IEnumerable<int> productIds);

    Task<List<ProductGallery>> GetGalleryAsync(int productId);

    Task<ProductGalleryCreated> CreateGalleryImageAsync(int productId, string imagePath, int? displayOrder);

    Task<string?> DeleteGalleryImageAsync(int galleryId);

    Task ReorderGalleryAsync(IEnumerable<(int Id, int DisplayOrder)> items);

    Task<bool> SetMainGalleryImageAsync(int galleryId, int productId);
}
